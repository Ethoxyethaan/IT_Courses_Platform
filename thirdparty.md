# Third-Party Libraries and Assets (JavaScript modules & LLM models)

This file documents third-party JavaScript/WASM modules included in the project and the LLM model families supported or used with in-browser runtimes.  
For each entry we record: **source, repository/URL, local file paths, license, purpose, and usage notes** (WASM / Worker / ESM).

---

## How this file is organized
- **JS Modules** — Registry of all third-party JS/WASM modules used by the UI/runtime.
- **LLM Models** — Model families used with Web-LLM / MLC, including formats, runtime constraints, and licensing.

---

## JS Modules

### Ace Editor (modes & themes)
- **Source:** https://github.com/ajaxorg/ace
- **Local files:**  
  `ui/js/ace/ace.js`  
  `ui/js/ace/mode-python.min.js`  
  `ui/js/ace/mode-sql.min.js`  
  `ui/js/ace/theme-monokai.min.js`  
  `ui/js/ace/theme-discord-dark.js`
- **License:** BSD-3-Clause
- **Purpose:** In-browser code editor with syntax highlighting and theming.
- **Notes:**
    - Ace supports AMD/UMD and ESM-style bundling depending on build.
    - Files here are shipped as prebuilt/minified assets.

---

### Pyodide
- **Source:** https://pyodide.org/  
  GitHub: https://github.com/pyodide/pyodide
- **Local files:**  
  `ui/js/pyodide/` (e.g. `pyodide.js`, `pyodide.mjs`, `pyodide.asm.js`,  
  `pyodide.asm.wasm`, `pyodide-lock.json`, `python_stdlib.zip`)
- **License:** MIT
- **Purpose:** Run CPython in the browser via WebAssembly for scripting and data processing.
- **Notes:**
    - Can run on main thread or in a Web Worker (recommended).
    - Large download size (~10s of MB including stdlib).
    - Package versions should be pinned via `pyodide-lock.json` for reproducibility.

---

### Web-LLM (runtime)
- **Source:** https://webllm.mlc.ai/  
  GitHub: https://github.com/mlc-ai/web-llm
- **Local files:**  
  `ui/js/web-llm/`  
  (This repository currently contains only `models/`. Runtime JS/WASM bundles are **not vendored** here.)
- **License:** Apache-2.0
- **Purpose:** Browser-native LLM runtime supporting model loading and inference.
- **Notes:**
    - Supports WASM (with SIMD / threads) and WebGPU backends.
    - Runtime bundles are typically loaded from CDN or built separately.
    - If vendoring the runtime, place compiled JS/WASM artifacts under this directory and include NOTICE files.

---

### Web-LLM-Lib (MLC helper library)
- **Source:** https://github.com/mlc-ai/web-llm
- **Local files:**  
  `ui/js/web-llm-lib/web-llm.esm.js`
- **License:** Apache-2.0
- **Purpose:** Model loaders, tokenizer helpers, and inference utilities used by Web-LLM.
- **Notes:**
    - Must remain version-compatible with the Web-LLM runtime.
    - API compatibility is not guaranteed across major versions.

---

### sql.js (SQLite compiled to WASM)
- **Source:** https://github.com/sql-js/sql.js
- **Local files:**  
  `ui/js/sqlite/sql-wasm.js`  
  `ui/js/sqlite/sql-wasm.wasm`
- **License:** MIT
- **Purpose:** In-browser SQLite engine for client-side database operations.
- **Notes:**
    - Databases are stored in memory by default.
    - Persistence requires explicit export/import of the database file (e.g., IndexedDB or file download).

---

## LLM Models (supported / in use)

This project currently references a **single in-browser model**.  
If additional models are added later, append them as separate entries using the same format.

---

### Current model in use

- **Model name:** Qwen2.5-Coder-0F.5B-Instruct-q4f16_1-MLC
- **Upstream model family:** Qwen2.5 Coder
- **Source (original weights):**  
  https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- **Converted / runtime format:**  
  MLC-compatible format produced by `mlc_llm` tooling
- **Local path (recommended):**  
  `ui/js/web-llm/models/Qwen2.5-Coder-0.5B-Instruct-q4f16_1-MLC/`
- **Format / quantization:**  
  MLC format, `q4f16_1` quantization (4-bit weights with FP16 scales)
- **Runtime:**  
  Web-LLM / Web-LLM-Lib (WASM and WebGPU where available)
- **Tokenizer & config:**  
  `tokenizer.json`, `tokenizer.model`, `config.json` (stored alongside weights)
- **License:** Apache-2.0
- **Notes:**
    - Qwen2.5 models are released by Alibaba under the Apache-2.0 license, permitting commercial use and redistribution.
    - This is currently the **only** model referenced by the project.
    - Runtime, converter, and model versions must be pinned together to ensure compatibility.
    - Store conversion metadata (MLC version, conversion command, quantization parameters) alongside the model for reproducibility.

---
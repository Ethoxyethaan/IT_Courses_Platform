# IT_Courses_Platform: Interactive Coding Courses Platform

A self-hosted platform for interactive programming courses (Python, SQL, etc.) with a static web UI, local LLM (Web-LLM/TeacherBot), and editable course content. Designed for easy local use and extension.

## Demo

[Python Demo](https://itcoursesplatform.tldr.me/#/courses/python-programming-for-young-advanced-hackers/chapters/chapter_1?tab=practice) 
[SQL Demo](https://itcoursesplatform.tldr.me/#/courses/sql-data-hacking-for-young-pros/chapters/chapter_1?tab=practice)

[demo homepage ](https://itcoursesplatform.tldr.me/)

---

## Architecture & Design
IT_Courses_Platform is a 100% static, browser-based learning platform. All interactive features—including Python code execution, SQL database manipulation, and AI chatbot—run entirely in the browser, with no backend or server-side code required.

### Key Technologies
- **Pyodide**: Runs a full Python interpreter (CPython compiled to WebAssembly) in the browser. Users can execute Python code, and course practice tasks are evaluated client-side.
- **SQLite.js**: Provides a full SQLite database engine compiled to WebAssembly. SQL practice and exercises are run in-browser, with no server or external database needed.
- **Web-LLM (TeacherBot)**: An open-source large language model (LLM) runs locally in the browser using WebGPU. The chatbot can answer questions, explain code, and provide hints, all without sending data to any server.
- **Single Page Application (SPA)**: The UI is a static HTML/JS/CSS app, with all routing, state, and rendering handled client-side.
- **Course Content as Files**: All course data (theory, quizzes, practice, attachments) is stored as static files in the repo, making it easy to edit, version, and extend.

### How It Works
- **No Backend Required**: All logic, data, and computation happen in the browser. The only requirement is to serve the static files (see Quick Start).
- **Python Execution**: When a user runs Python code, it is executed by Pyodide in a sandboxed WebAssembly environment. No code leaves the browser.
- **SQL Execution**: SQL queries are run against an in-memory SQLite database using SQLite.js, with results shown instantly.
- **Chatbot/LLM**: The TeacherBot uses Web-LLM to load a quantized LLM model (already present in the repo) and runs all inference locally using the user's GPU (WebGPU). No API keys or cloud calls are needed.
- **Course Navigation**: The SPA loads course metadata and content from static JSON/Markdown files, rendering chapters, quizzes, and practice tasks dynamically.

---

## Project Structure & Key Files
- **package.json** — Project metadata, dependencies, and scripts
- **index.html** — SPA entry point (open in browser)
- **ui/js/main.js** — Main JS bootstrapper
- **api/courses.json** — Course index/metadata (controls visible courses)
- **api/course/** — Per-course content folders (see below)
- **scripts/** — Node.js scripts for utility tasks
- **ui/js/web-llm/** — Web-LLM model files (already present)

---

## Quick Start: Static File Serving
This project is 100% static files. No backend or server-side code is required. Serve the repo root as static files.

### Windows & Linux (npm http-server)
1. **Open a terminal/cmd.exe at the repo root**
2. **Start a static server:**
   ```sh
   npx http-server . -p 8080
   ```
3. **Open in browser:**
   [http://localhost:8080/](http://localhost:8080/)

### Linux (nginx)
1. **Symlink or copy the repo to your nginx web root (e.g., /var/www/html/IT_Courses_Platform)**
2. **Add to nginx config:**
   ```nginx
   server {
       listen 8080;
       server_name localhost;
       root /var/www/html/IT_Courses_Platform;
       location / {
           try_files $uri $uri/ =404;
       }
   }
   ```
3. **Reload nginx and open:**
   [http://localhost:8080/](http://localhost:8080/)

---

## Editing Courses & Content
- **Course index:** `api/courses.json` — Controls course list, metadata, and chapter IDs. Ensure `id` matches folder name in `api/course/`.
- **Per-course content:** `api/course/{course-id}/{chapter}/`
  - `theory.md` — Main lesson text
  - `practice.json` — Coding tasks
  - `quiz.json` — Quiz questions
  - `assignments/`, `attachments/` — Extra files/resources

---

## Web UI & Dev Entry Points
- **SPA entry:** `index.html`, `ui/js/main.js`
- **API client:** `ui/js/services/apiClient.js` (fetches `api/courses.json`)
- **Router/state:** `ui/js/state/router.js`, `ui/js/state/appState.js`
- **TeacherBot/Web‑LLM config:** `ui/js/services/teacherBotService.js`, `ui/js/services/teacherBot/`
- **Pyodide/SQLite:** `ui/js/pyodide/*`, `ui/js/sqlite/*` (local WASM/binaries)

---

## Model & Bundle Locations
- **Web‑LLM ESM bundle:** `ui/js/web-llm-lib/web-llm.esm.js` (already present)
- **Model files:** `ui/js/web-llm/models/{MODEL_ID}/` (already present)
- **To use a different model:** Update `ui/js/services/teacherBotService.js`:
  - Change the `localModelPath` (or similar) to point to your desired model, e.g.:
    ```js
    // ...existing code...
    const localModelPath = 'js/web-llm/models/llama-2-7b-chat-hf-q4f16_1/';
    // ...existing code...
    ```
  - See also: `window.debugWebLLMConfig` in browser console for runtime config.

---

## Smoke Tests / Sanity Checks
- Start server, open [http://localhost:8080/](http://localhost:8080/)
- Browser console: should show "Loading courses..." and no fetch error for `api/courses.json`
- Course list loads; navigating to a chapter shows content from `api/course/.../theory.md`
- If using TeacherBot/Web‑LLM: `window.debugWebLLMConfig` is present; no network errors in console
- If using SQLite/Pyodide: WASM files load (see network tab for `pyodide.*`, `sql-wasm.wasm`)

---

## Dev Notes & Dependencies
- **package.json**: lists `@mlc-ai/web-llm` (^0.2.80)
- Large binaries: `ui/js/pyodide/`, `ui/js/sqlite/` — must be served via local server (not `file://`)
- Keep `ui/js/web-llm-lib/web-llm.esm.js` local to avoid CDN/CORS issues
- When editing JSON, validate syntax (e.g., with `jq` or editor linting)
- **Recommended:** Add to `package.json` for easier dev:
  ```json
  "scripts": {
    "start": "npx http-server . -p 8080"
  }
  ```

---

## Troubleshooting
- If `api/courses.json` fetch fails: ensure server is started at repo root (so `/api/` is reachable)
- If WASM fails to load: check network tab for 404s; ensure `pyodide.asm.wasm` and `sql-wasm.wasm` are present and served

---

## Typical Workflows
- **Run static server (Windows/Linux):**
  ```sh
  npx http-server . -p 8080
  ```
- **Open UI:**
  [http://localhost:8080/](http://localhost:8080/)

---

## Further Notes
- For TeacherBot/Web‑LLM, update the `localModelPath` (or similar) in `ui/js/services/teacherBotService.js` to match your desired model folder.
- For advanced config, see comments in `teacherBotService.js` and use `window.debugWebLLMConfig` in browser console.

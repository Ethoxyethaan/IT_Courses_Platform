//author: https://github.com/nhermab
//licence: MIT
import { getAceModeForLanguage, getTabSizeForLanguage } from '../../runners/index.js';

/**
 * Create the editor panel DOM structure.
 *
 * @param {Object} params
 * @param {Array} params.activeTemplates - List of template files
 * @param {Object} params.activeTemplate - Currently selected template
 * @param {Function} params.onTemplateChange - Callback when template selection changes
 * @param {Function} params.onRun - Callback when run button is clicked
 * @param {Function} params.onValidate - Callback when validate button is clicked
 * @returns {{ panel: HTMLElement, editorHost: HTMLElement, runButton: HTMLElement, validateButton: HTMLElement, runStatus: HTMLElement }}
 */
export function createEditorPanel({
  activeTemplates,
  activeTemplate,
  onTemplateChange,
  onRun,
  onValidate
}) {
  const editorPanel = document.createElement('div');
  editorPanel.className = 'practice-panel practice-editor-panel';

  const attachmentsRow = document.createElement('div');
  attachmentsRow.className = 'practice-editor-row';

  const attachmentsCol = document.createElement('div');
  attachmentsCol.className = 'practice-attachments';

  const attachmentsTitle = document.createElement('h4');
  attachmentsTitle.textContent = 'Files';
  attachmentsCol.appendChild(attachmentsTitle);

  const attachmentsList = document.createElement('ul');
  attachmentsList.className = 'practice-attachments-list';

  activeTemplates.forEach((t) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'practice-attachment-button';
    if (activeTemplate && t.path === activeTemplate.path) {
      btn.classList.add('is-active');
    }
    btn.textContent = t.path.split('/').slice(-1)[0];
    btn.addEventListener('click', () => {
      onTemplateChange(t.path);
    });
    li.appendChild(btn);
    attachmentsList.appendChild(li);
  });

  attachmentsCol.appendChild(attachmentsList);

  const editorCol = document.createElement('div');
  editorCol.className = 'practice-editor-col';

  const editorToolbar = document.createElement('div');
  editorToolbar.className = 'practice-editor-toolbar';

  const runButton = document.createElement('button');
  runButton.type = 'button';
  runButton.className = 'practice-run-button';
  runButton.textContent = 'Run code & Check output';

  const validateButton = document.createElement('button');
  validateButton.type = 'button';
  validateButton.className = 'practice-run-button practice-validate-button';
  validateButton.textContent = 'Let a teacher validate my assignment';

  const runStatus = document.createElement('span');
  runStatus.className = 'practice-run-status muted';

  editorToolbar.appendChild(runButton);
  editorToolbar.appendChild(validateButton);
  editorToolbar.appendChild(runStatus);

  const editorHost = document.createElement('div');
  editorHost.id = 'practice-editor';
  editorHost.className = 'practice-editor';

  editorCol.appendChild(editorToolbar);
  editorCol.appendChild(editorHost);

  attachmentsRow.appendChild(attachmentsCol);
  attachmentsRow.appendChild(editorCol);

  editorPanel.appendChild(attachmentsRow);

  // Attach event listeners
  runButton.addEventListener('click', onRun);
  validateButton.addEventListener('click', onValidate);

  return {
    panel: editorPanel,
    editorHost,
    runButton,
    validateButton,
    runStatus
  };
}

/**
 * Initialize an Ace editor instance.
 *
 * @param {HTMLElement} editorHost - The DOM element to host the editor
 * @param {string} language - The programming language for syntax highlighting
 * @returns {Object|null} The Ace editor instance or null if unavailable
 */
export function initializeAceEditor(editorHost, language = 'python') {
  if (!window.ace || !editorHost) {
    return null;
  }

  const editor = window.ace.edit(editorHost);
  editor.setTheme('ace/theme/ide-dark');
  editor.session.setMode(getAceModeForLanguage(language));
  editor.session.setUseSoftTabs(true);
  editor.session.setTabSize(getTabSizeForLanguage(language));

  return editor;
}

/**
 * Create the console panel DOM structure.
 *
 * @returns {{ panel: HTMLElement, consoleEl: HTMLElement }}
 */
export function createConsolePanel() {
  const consolePanel = document.createElement('div');
  consolePanel.className = 'practice-panel practice-console-panel';

  const consoleEl = document.createElement('pre');
  consoleEl.className = 'practice-console';
  consoleEl.textContent = 'Console output will appear here after you run the code.';

  consolePanel.appendChild(consoleEl);

  return { panel: consolePanel, consoleEl };
}

/**
 * Create the chat panel DOM structure.
 *
 * @returns {{ panel: HTMLElement, chatBody: HTMLElement }}
 */
export function createChatPanel() {
  const chatPanel = document.createElement('div');
  chatPanel.className = 'practice-panel practice-chat-panel';

  const chatBody = document.createElement('div');
  chatBody.className = 'practice-chat-body';
  chatBody.innerHTML = '<p class="muted">Here you will be able to ask questions and get help from your teacher while you code.</p>';

  chatPanel.appendChild(chatBody);

  return { panel: chatPanel, chatBody };
}


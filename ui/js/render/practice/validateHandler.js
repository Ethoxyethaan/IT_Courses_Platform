//author: https://github.com/nhermab
//licence: MIT
import { getRunnerForLanguage } from '../../runners/index.js';
import { validateAssignmentWithTeacher, initTeacherBot, getTeacherBotStatus } from '../../services/teacherBotService.js';
import { initTeacherBotPanel } from '../teacherBotPanel.js';
import { formatSqlOutput, formatPythonOutput, getSqlStatusMessage } from './outputFormatter.js';

/**
 * Create and attach validate button event handler.
 *
 * @param {Object} params
 * @param {Object} params.practiceEditor - The Ace editor instance
 * @param {Object} params.activeTemplate - Current template with language info
 * @param {Object} params.activeAssignment - Current assignment with expected output
 * @param {Object} params.course - Course object
 * @param {Object} params.chapter - Chapter object
 * @param {Object} params.practice - Practice data with assignment markdown
 * @param {HTMLElement} params.consoleEl - Console output element
 * @param {HTMLElement} params.runStatus - Status text element
 * @param {HTMLElement} params.runButton - Run button element
 * @param {HTMLElement} params.validateButton - Validate button element
 * @param {HTMLElement} params.chatBody - Chat panel body element
 * @param {Function} params.getLastRunResult - Function to get last run result
 * @returns {{ handler: Function, teacherPanelApi: Object }}
 */
export function createValidateHandler({
  practiceEditor,
  activeTemplate,
  activeAssignment,
  course,
  chapter,
  practice,
  consoleEl,
  runStatus,
  runButton,
  validateButton,
  chatBody,
  getLastRunResult,
}) {
  let teacherPanelApi = null;
  let lastRunResult = null;

  const handler = async () => {
    if (!practiceEditor) return;

    const code = practiceEditor.getValue();
    const editorLanguage = activeTemplate?.language || 'python';

    console.log('[Validation] Starting teacher validation click handler', {
      editorLanguage,
      codeSnippetPreview: code.slice(0, 400),
    });

    validateButton.disabled = true;
    runButton.disabled = true;
    consoleEl.textContent = 'Running code before teacher validation...';
    runStatus.textContent = `Running ${editorLanguage}...`;

    try {
      const runner = getRunnerForLanguage(editorLanguage);
      const result = await runner.run(code);
      lastRunResult = result;

      // Update console output (same logic as run button)
      updateConsoleOutput({
        result,
        editorLanguage,
        consoleEl,
        runStatus,
      });

      // Prepare context for teacher validation
      const languageId = activeTemplate?.language || 'python';
      const codeFiles = [];
      if (activeTemplate) {
        codeFiles.push({
          path: activeTemplate.path,
          languageId,
          source: code,
        });
      }

      const lastRunFromHandler = getLastRunResult ? getLastRunResult() : lastRunResult;
      const lastRun = {
        status: lastRunFromHandler ? 'completed' : 'not_run',
        stdout: lastRunFromHandler?.stdout || '',
        stderr: lastRunFromHandler?.stderr || '',
        error: lastRunFromHandler?.error || '',
        summary: runStatus.textContent || '',
        consoleDisplay: consoleEl.textContent || '',
      };

      const markdownKey = activeAssignment.id;

      // Initialize teacher panel if needed
      teacherPanelApi = await ensureTeacherPanel({
        teacherPanelApi,
        chatBody,
        course,
        chapter,
        activeAssignment,
        activeTemplate,
        languageId,
        codeFiles,
        practice,
        markdownKey,
        lastRun,
        runStatus,
        consoleEl,
      });

      // Request teacher validation
      const validation = await validateAssignmentWithTeacher({
        assignment: {
          title: activeAssignment.title || '',
          descriptionMarkdown: practice.assignmentMarkdown[markdownKey] || '',
        },
        codeFiles,
        environment: { lastRun },
      });

      // Hide typing indicator
      if (teacherPanelApi && teacherPanelApi.hideTyping) {
        teacherPanelApi.hideTyping();
      }
      // Clear any status message after validation is complete
      if (runStatus) runStatus.textContent = '';

      // Re-initialize fresh teacher panel and show validation result
      chatBody.innerHTML = '';
      teacherPanelApi = initTeacherBotPanel({
        container: chatBody,
        getContext: () => createTeacherContext({
          course,
          chapter,
          activeAssignment,
          activeTemplate,
          languageId,
          codeFiles,
          practice,
          markdownKey,
          lastRun,
        }),
      });

      // Insert fake user message before validation result
      if (teacherPanelApi && typeof teacherPanelApi.appendUserMessage === 'function') {
        teacherPanelApi.appendUserMessage('can you validate my assignment?');
      }

      // Add positive or negative message based on validation result
      let verdictMessage = '';
      if (validation && typeof validation.feedbackText === 'string') {
        const passed = /pass(ed)?|success|congrat/i.test(validation.feedbackText);
        if (passed) {
          verdictMessage = '✅ Congratulations! Your assignment passed all checks.';
        } else {
          verdictMessage = '❌ Your assignment did not pass all checks. Please review the feedback below.';
        }
      }
      if (verdictMessage && teacherPanelApi && typeof teacherPanelApi.appendAssistantMessage === 'function') {
        teacherPanelApi.appendAssistantMessage(verdictMessage);
      }

      const finalMessage = validation.feedbackText || 'No feedback provided.';
      if (teacherPanelApi && typeof teacherPanelApi.appendAssistantMessage === 'function') {
        teacherPanelApi.appendAssistantMessage(finalMessage);
      }
    } catch (err) {
      console.error('Teacher validation run failed:', err);
      consoleEl.textContent = `Failed to run code for teacher validation. ${err.message || err}`;
      runStatus.textContent = 'Validation run failed';
    }

    validateButton.disabled = false;
    runButton.disabled = false;
  };

  return {
    handler,
    getTeacherPanelApi: () => teacherPanelApi,
  };
}

/**
 * Update console output based on run result.
 */
function updateConsoleOutput({ result, editorLanguage, consoleEl, runStatus }) {
  if (editorLanguage === 'sql') {
    consoleEl.textContent = formatSqlOutput(result);
    runStatus.textContent = getSqlStatusMessage(result);
  } else {
    const { text, verdict } = formatPythonOutput(result);
    consoleEl.textContent = text;
    runStatus.textContent = verdict;
  }
}

/**
 * Ensure teacher panel is initialized and ready.
 */
async function ensureTeacherPanel({
  teacherPanelApi,
  chatBody,
  course,
  chapter,
  activeAssignment,
  activeTemplate,
  languageId,
  codeFiles,
  practice,
  markdownKey,
  lastRun,
  runStatus,
  consoleEl
}) {
  let api = teacherPanelApi;

  if (!api) {
    api = initTeacherBotPanel({
      container: chatBody,
      getContext: () => createTeacherContext({
        course,
        chapter,
        activeAssignment,
        activeTemplate,
        languageId,
        codeFiles,
        practice,
        markdownKey,
        lastRun,
      }),
    });
  }

  const status = getTeacherBotStatus();
  if (status.status !== 'ready') {
    if (api && api.showConnectingStatus) {
      api.showConnectingStatus();
    }
    runStatus.textContent = 'Preparing your teacher for validation...';
    await initTeacherBot();

    const after = getTeacherBotStatus();
    if (after.status !== 'ready') {
      consoleEl.textContent += '\n\nYour teacher could not connect on this device right now for validation.';
      runStatus.textContent = 'Teacher not available for validation';
      throw new Error('Teacher not available');
    }
  }

  // Show typing indicator
  if (api && api.showTyping) {
    api.showTyping();
  }

  return api;
}

/**
 * Create teacher context object.
 */
function createTeacherContext({
  course,
  chapter,
  activeAssignment,
  activeTemplate,
  languageId,
  codeFiles,
  practice,
  markdownKey,
  lastRun
}) {
  return {
    courseId: String(course.id),
    chapterId: String(chapter.id || chapter.chapterId || 'chapter_1'),
    assignmentId: String(activeAssignment.id),
    templatePath: activeTemplate ? activeTemplate.path : '',
    languageId,
    codeFiles,
    assignment: {
      title: activeAssignment.title || '',
      descriptionMarkdown: practice.assignmentMarkdown[markdownKey] || '',
    },
    environment: { lastRun },
  };
}

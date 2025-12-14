//author: https://github.com/nhermab
//licence: MIT
// Context building utilities for TeacherBot

// Token limits
const MAX_CONTEXT_TOKENS = 6000;

/**
 * Truncate text to approximate token limit.
 *
 * @param {string} text - Text to truncate
 * @param {number} maxTokens - Maximum tokens
 * @returns {string} Truncated text
 */
export function truncateToTokens(text, maxTokens) {
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars) + '\n... (truncated)';
}

/**
 * Detect if the question is about errors/debugging.
 *
 * @param {string} question - User's question
 * @param {Object} lastRun - Last run results
 * @returns {boolean} True if error-focused
 */
export function isErrorFocusedQuestion(question, lastRun) {
  const errorKeywords = ['error', 'bug', 'wrong', 'fail', 'issue', 'problem', 'fix', 'debug', 'crash', 'exception'];
  const questionLower = question.toLowerCase();
  const hasErrorKeyword = errorKeywords.some(kw => questionLower.includes(kw));
  const hasError = lastRun && (lastRun.error || lastRun.stderr);
  return hasErrorKeyword || hasError;
}

/**
 * Build context for asking a question.
 *
 * @param {Object} request - Question request object
 * @returns {{ contextText: string, hasError: boolean }}
 */
export function buildQuestionContext(request) {
  const lastRun = request.environment?.lastRun;
  const hasError = lastRun && (lastRun.error || lastRun.stderr);
  const isErrorQuestion = isErrorFocusedQuestion(request.userQuestion, lastRun);

  const contextParts = [];

  // PRIORITY 1: Errors (always include if present)
  if (hasError && lastRun.status !== 'not_run') {
    contextParts.push('=== CONSOLE ERROR ===');
    if (lastRun.error) {
      const errorText = truncateToTokens(lastRun.error, 800);
      contextParts.push('Error Message:');
      contextParts.push(errorText);
    }
    if (lastRun.stderr) {
      const stderrText = truncateToTokens(lastRun.stderr, 600);
      contextParts.push('');
      contextParts.push('Standard Error (stderr):');
      contextParts.push(stderrText);
    }
    contextParts.push('');
    contextParts.push('[Instruction: Carefully analyze the error above and the code below to identify the exact problem]');
    contextParts.push('');
  }

  // PRIORITY 2: Student code
  if (request.codeFiles && request.codeFiles.length > 0) {
    contextParts.push('=== STUDENT CODE ===');
    request.codeFiles.forEach(file => {
      const codeText = truncateToTokens(file.source || '', 1500);
      contextParts.push(`File: ${file.path}`);
      contextParts.push('```' + (file.languageId || ''));
      contextParts.push(codeText);
      contextParts.push('```');
    });
    contextParts.push('');
  } else if (request.userCode) {
    const codeText = truncateToTokens(request.userCode, 1500);
    contextParts.push('=== STUDENT CODE ===');
    contextParts.push('```');
    contextParts.push(codeText);
    contextParts.push('```');
    contextParts.push('');
  }

  // PRIORITY 3: Success output
  if (!hasError && lastRun && lastRun.stdout && lastRun.status !== 'not_run') {
    const outputText = truncateToTokens(lastRun.stdout, 600);
    contextParts.push('=== OUTPUT ===');
    contextParts.push(outputText);
    contextParts.push('');
  }

  // PRIORITY 4: Assignment
  const assignmentText = request.assignment?.descriptionMarkdown || request.assignmentText;
  const shouldIncludeAssignment = assignmentText && !isErrorQuestion;

  if (shouldIncludeAssignment) {
    const truncatedAssignment = truncateToTokens(assignmentText, 1200);
    contextParts.push('=== ASSIGNMENT ===');
    contextParts.push(truncatedAssignment);
    contextParts.push('');
  }

  return {
    contextText: contextParts.length > 0 ? contextParts.join('\n') : '',
    hasError
  };
}

/**
 * Build context for grading code.
 *
 * @param {Object} request - Grade request object
 * @returns {{ assignmentText: string, userCode: string }}
 */
export function buildGradeContext(request) {
  const assignmentText = truncateToTokens(request.assignmentText || 'No assignment provided', 1000);
  const userCode = truncateToTokens(request.userCode || 'No code provided', 2000);

  return { assignmentText, userCode };
}

/**
 * Build context for validating an assignment.
 *
 * @param {Object} request - Validation request object
 * @returns {string} Assembled context text
 */
export function buildValidationContext(request) {
  const { assignment, codeFiles = [], environment } = request;
  const lastRun = environment?.lastRun || {};

  const contextParts = [];

  // Add Assignment
  if (assignment?.descriptionMarkdown) {
    contextParts.push('=== ASSIGNMENT ===');
    contextParts.push(truncateToTokens(assignment.descriptionMarkdown, 1500));
    contextParts.push('');
  }

  // Add Output (Prioritized - put before code so the model sees it first/clearly)
  const stdout = lastRun.stdout || lastRun.consoleDisplay || '';
  const stderr = lastRun.stderr || '';
  const error = lastRun.error || '';

  contextParts.push('=== RUN OUTPUT (Most Important) ===');
  if (stdout) {
    contextParts.push('Standard Output:');
    contextParts.push(truncateToTokens(stdout, 900));
  } else if (error) {
    contextParts.push('Error: ' + truncateToTokens(error, 500));
  } else {
    contextParts.push('(No output generated)');
  }
  contextParts.push('');

  // Add Code
  if (codeFiles.length > 0) {
    contextParts.push('=== STUDENT CODE ===');
    codeFiles.forEach((file) => {
      const codeText = truncateToTokens(file.source || '', 2000);
      contextParts.push(`File: ${file.path}`);
      contextParts.push('```' + (file.languageId || ''));
      contextParts.push(codeText);
      contextParts.push('```');
      contextParts.push('');
    });
  }

  return contextParts.join('\n');
}


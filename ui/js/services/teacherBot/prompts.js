//author: https://github.com/nhermab
//licence: MIT
// Prompt templates and builders for TeacherBot features

/**
 * System prompt for asking questions.
 */
export const ASK_SYSTEM_PROMPT = [
  "You are a smart, concise coding teacher. Keep responses under 250 words.",
  "CAREFULLY read the error message and code before responding.",
  "If there's an error, identify the EXACT line and explain what's wrong.",
  "Look for common mistakes: typos, undefined variables, syntax errors, logic errors.",
  "When showing code fixes, use markdown fenced blocks with language tags (e.g., ```python).",
  "Be direct and focused. Answer exactly what the student asked.",
  "Guide students to understand the problem, don't just give solutions.",
  "If you're not sure, ask the student to clarify or run the code to see the error."
].join(' ');

/**
 * System prompt for grading code.
 */
export const GRADE_SYSTEM_PROMPT = [
  "You are a lenient, friendly coding teacher.",
  "If the code looks like a valid attempt, give a high score (80-100).",
  "If the code runs but is imperfect, give a passing score (60+).",
  "Only FAIL (score < 50) if the code is empty, completely unrelated, or has broken syntax.",
  "Start response with: PASS/FAIL and Score: X/100."
].join(' ');

/**
 * System prompt for validating assignments.
 */
export const VALIDATE_SYSTEM_PROMPT = [
  'You are a very lenient and forgiving coding teacher grading a beginner.',
  'Your goal is to PASS the student whenever possible.',
  '',
  'PASSING RULES (Prioritize these):',
  '1. TRUST THE OUTPUT: If the "Standard Output" shows the correct result (e.g., correct printed text), PASS THE STUDENT, even if the code looks messy.',
  '2. IGNORE COMMENTS: Do not fail the student because of "TODO" comments or commented-out code. Only look at active code.',
  '3. IGNORE TYPOS: If the variable names are slightly different but the logic works, PASS.',
  '4. IGNORE WARNINGS: If there is output, ignore "Standard Error" warnings.',
  '',
  'ONLY FAIL IF:',
  '- The code is completely empty.',
  '- There is a syntax error preventing ANY output.',
  '- The output is completely wrong (e.g., asked for "Hello", got "Goodbye").',
  '',
  'RESPONSE FORMAT:',
  '- Start with: "Overall result: PASSED" or "Overall result: NOT PASSED"',
  '- If PASSED: Say "Good job!" and mentioning one thing they did right.',
  '- If NOT PASSED: Give 1 very specific hint.',
  '- Keep response under 100 words.'
].join('\n');

/**
 * Build prompt for asking a question.
 *
 * @param {string} contextText - Assembled context text
 * @param {string} question - User's question
 * @param {boolean} hasError - Whether there's an error in the context
 * @returns {{ systemPrompt: string, userPrompt: string }}
 */
export function buildAskPrompt(contextText, question, hasError) {
  let instructions = '';
  if (hasError) {
    instructions = '\n[Your task: Read the error message, examine the code, find the exact mistake, and explain how to fix it briefly.]\n';
  }

  const userPrompt = contextText
    ? contextText + instructions + '\n=== QUESTION ===\n' + question
    : question;

  return {
    systemPrompt: ASK_SYSTEM_PROMPT,
    userPrompt
  };
}

/**
 * Build prompt for grading code.
 *
 * @param {string} assignmentText - Assignment description
 * @param {string} userCode - Student's code
 * @returns {{ systemPrompt: string, userPrompt: string }}
 */
export function buildGradePrompt(assignmentText, userCode) {
  const userPrompt = `Assignment:
${assignmentText}

Student's code:
\`\`\`
${userCode}
\`\`\`

Grade this code leniently. Provide: Pass/Fail, Score (0-100), and concise feedback.`;

  return {
    systemPrompt: GRADE_SYSTEM_PROMPT,
    userPrompt
  };
}

/**
 * Build prompt for validating an assignment.
 *
 * @param {string} contextText - Assembled context text
 * @returns {{ systemPrompt: string, userPrompt: string }}
 */
export function buildValidatePrompt(contextText) {
  const userPrompt = [
    contextText,
    '',
    '=== YOUR JUDGMENT ===',
    'Based on the OUTPUT above: Did the code basically do what was asked?',
    'Remember: Be forgiving. If the output looks roughly correct, say PASSED.',
    'Ignore "TODO" comments.',
    'Reply starting with "Overall result: PASSED" or "Overall result: NOT PASSED".',
  ].join('\n');

  return {
    systemPrompt: VALIDATE_SYSTEM_PROMPT,
    userPrompt
  };
}


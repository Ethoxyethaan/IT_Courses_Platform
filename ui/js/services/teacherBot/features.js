//author: https://github.com/nhermab
//licence: MIT
// TeacherBot feature implementations (ask, grade, validate)

import { getEngine, isEngineReady } from './engine.js';
import { buildAskPrompt, buildGradePrompt, buildValidatePrompt } from './prompts.js';
import { buildQuestionContext, buildGradeContext, buildValidationContext } from './contextBuilder.js';
import { parseAskResponse, parseGradeResponse, parseValidationResponse } from './responseParser.js';

/**
 * Ask TeacherBot a question about the current assignment/code.
 *
 * @param {Object} request - Request object with userQuestion, codeFiles, assignment, environment
 * @returns {Promise<{feedbackText: string}>}
 */
export async function askQuestion(request) {
  if (!isEngineReady()) {
    throw new Error('TeacherBot is not ready. Please initialize it first.');
  }

  const engine = getEngine();
  const { contextText, hasError } = buildQuestionContext(request);
  const { systemPrompt, userPrompt } = buildAskPrompt(contextText, request.userQuestion, hasError);

  try {
    const reply = await engine.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: hasError ? 0.1 : 0.1,
      max_tokens: 330,
    });

    return parseAskResponse(reply);
  } catch (err) {
    console.error('Error asking Teacher:', err);
    throw err;
  }
}

/**
 * Ask TeacherBot to grade the user's code.
 *
 * @param {Object} request - Request object with assignmentText, userCode
 * @returns {Promise<{passed: boolean|null, score: number|null, feedbackText: string, suggestions?: string[]}>}
 */
export async function gradeCode(request) {
  if (!isEngineReady()) {
    throw new Error('TeacherBot is not ready. Please initialize it first.');
  }

  const engine = getEngine();
  const { assignmentText, userCode } = buildGradeContext(request);
  const { systemPrompt, userPrompt } = buildGradePrompt(assignmentText, userCode);

  try {
    const reply = await engine.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 280,
    });

    return parseGradeResponse(reply);
  } catch (err) {
    console.error('Error grading with Teacher:', err);
    throw err;
  }
}

/**
 * Ask the teacher to validate whether the assignment is passed.
 *
 * @param {Object} request - Request object with assignment, codeFiles, environment
 * @returns {Promise<{passed: boolean|null, feedbackText: string}>}
 */
export async function validateAssignment(request) {
  if (!isEngineReady()) {
    throw new Error('TeacherBot is not ready. Please initialize it first.');
  }

  const engine = getEngine();
  const contextText = buildValidationContext(request);
  const { systemPrompt, userPrompt } = buildValidatePrompt(contextText);

  try {
    const reply = await engine.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1, // Keep temp low to force it to follow the "PASS" format
      max_tokens: 150,
    });

    return parseValidationResponse(reply);
  } catch (err) {
    console.error('Error validating assignment with Teacher:', err);
    throw err;
  }
}


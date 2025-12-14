//author: https://github.com/nhermab
//licence: MIT
// Response parsing utilities for TeacherBot

/**
 * Parse a simple ask question response.
 *
 * @param {Object} reply - LLM reply object
 * @returns {{ feedbackText: string }}
 */
export function parseAskResponse(reply) {
  return {
    feedbackText: reply.choices[0].message.content
  };
}

/**
 * Parse grade response.
 *
 * @param {Object} reply - LLM reply object
 * @returns {{ passed: boolean|null, score: number|null, feedbackText: string, suggestions: string[]|undefined }}
 */
export function parseGradeResponse(reply) {
  const feedbackText = reply.choices[0].message.content;

  // Parse pass/fail
  const passMatch = feedbackText.match(/pass(?:ed)?[:.]?\s*(yes|no)/i) ||
      feedbackText.match(/\b(pass|fail)\b/i);

  let passed = null;
  if (passMatch) {
    const matchText = passMatch[1].toLowerCase();
    passed = matchText === 'yes' || matchText === 'pass';
  }

  // Parse score
  let score = null;
  const scoreMatch = feedbackText.match(/score[:.]?\s*(\d+)/i);
  if (scoreMatch) {
    score = parseInt(scoreMatch[1], 10);
  }

  // Parse suggestions
  const suggestions = [];
  const lines = feedbackText.split('\n');
  for (const line of lines) {
    if (/^\d+\.\s+/.test(line.trim())) {
      suggestions.push(line.trim().replace(/^\d+\.\s+/, ''));
    }
  }

  return {
    passed,
    score,
    feedbackText,
    suggestions: suggestions.length > 0 ? suggestions : undefined
  };
}

/**
 * Parse validation response with fallback forgiveness.
 *
 * @param {Object} reply - LLM reply object
 * @returns {{ passed: boolean|null, feedbackText: string }}
 */
export function parseValidationResponse(reply) {
  let feedbackText = reply.choices[0].message.content.trim();

  // Clean up duplicates
  const lines = feedbackText.split('\n');
  const seen = new Set();
  const cleanedFeedback = lines.filter(line => {
    const trimmed = line.trim();
    if (!trimmed || seen.has(trimmed)) return false;
    seen.add(trimmed);
    return true;
  }).join('\n');

  feedbackText = cleanedFeedback;

  // Parsing logic
  let passed = null;
  const match = feedbackText.match(/overall result\s*[:\-]?\s*(passed|not passed)/i);

  if (match) {
    passed = match[1].toLowerCase() === 'passed';
  } else {
    // FALLBACK FORGIVENESS:
    // If the model messed up the format but said "Good job" or "Passed" somewhere, assume pass.
    if (feedbackText.toLowerCase().includes('passed') ||
        feedbackText.toLowerCase().includes('good job') ||
        feedbackText.toLowerCase().includes('great work')) {
      passed = true;
      // Prepend the required string so the UI handles it correctly
      feedbackText = "Overall result: PASSED\n" + feedbackText;
    }
  }

  return { passed, feedbackText };
}


//author: https://github.com/nhermab
//licence: MIT

/**
 * Ensure quiz data is loaded, using provided cache helpers.
 *
 * @param {Object} params
 * @param {Object} params.course - Course object
 * @param {Object} params.chapter - Chapter object
 * @param {string|number} params.courseId - Selected course id
 * @param {string|number} params.chapterId - Selected chapter id
 * @param {Function} params.getChapterContent - (courseId, chapterId) => { quiz? }
 * @param {Function} params.setChapterContent - (courseId, chapterId, { quiz }) => void
 * @param {Function} params.fetchChapterQuiz - (courseId, chapter) => Promise<quiz>
 * @returns {Promise<{ quiz: any }>}
 */
export async function ensureQuizLoaded({
  course,
  chapter,
  courseId,
  chapterId,
  getChapterContent,
  setChapterContent,
  fetchChapterQuiz,
}) {
  const cached = getChapterContent(courseId, chapterId);
  let quiz = cached.quiz;

  if (!quiz) {
    quiz = await fetchChapterQuiz(course.id, chapter);
    setChapterContent(courseId, chapterId, { quiz });
  }

  return { quiz };
}

/**
 * Render quiz questions into the provided container.
 * Keeps DOM structure and behavior identical to the original implementation.
 *
 * @param {Object} params
 * @param {HTMLElement} params.container - Element to render into
 * @param {Object} params.quiz - Quiz JSON with `questions` array
 */
export function renderQuiz({ container, quiz }) {
  if (!container) return;

  // Expecting quiz JSON similar to chapter_1/quiz.json where `questions` is an array.
  if (!quiz || !Array.isArray(quiz.questions)) {
    container.innerHTML = '<p class="muted">No quiz available for this chapter.</p>';
    return;
  }

  const root = document.createElement('div');

  quiz.questions.forEach((question) => {
    if (question.type !== 'single-choice') return; // For now, support only single-choice

    const questionEl = document.createElement('div');
    questionEl.className = 'quiz-question';

    const promptEl = document.createElement('div');
    promptEl.textContent = question.prompt;
    questionEl.appendChild(promptEl);

    const optionsList = document.createElement('ul');
    optionsList.className = 'quiz-options';

    (question.options || []).forEach((option, index) => {
      const li = document.createElement('li');
      const label = document.createElement('label');
      label.className = 'quiz-option';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = question.id;
      input.value = option.id;

      const letter = document.createElement('span');
      letter.className = 'quiz-option-letter';
      letter.textContent = String.fromCharCode(65 + index); // A, B, C, ...

      const textSpan = document.createElement('span');
      textSpan.className = 'quiz-option-text';
      textSpan.textContent = option.label;

      label.appendChild(input);
      label.appendChild(letter);
      label.appendChild(textSpan);

      li.appendChild(label);
      optionsList.appendChild(li);
    });

    const feedbackEl = document.createElement('div');
    feedbackEl.className = 'quiz-feedback';

    const checkButton = document.createElement('button');
    checkButton.type = 'button';
    checkButton.textContent = 'Check answer';
    checkButton.className = 'quiz-button';
    checkButton.addEventListener('click', () => {
      const selected = optionsList.querySelector('input:checked');
      if (!selected) {
        feedbackEl.textContent = 'Please choose an answer first.';
        feedbackEl.className = 'quiz-feedback is-incorrect';
        return;
      }
      const selectedId = selected.value;
      const chosenOption = (question.options || []).find((opt) => opt.id === selectedId);
      const correctOption = (question.options || []).find((opt) => opt.isCorrect);

      const explanations = question.explanations || {};
      const byOptionId = explanations.byOptionId || {};
      const overview = explanations.overview;

      if (chosenOption && chosenOption.isCorrect) {
        // For correct answers, prefer the overview explanation, since it best describes why it's correct.
        const detail = overview || byOptionId[selectedId] || '';
        const prefix = 'Correct!';
        feedbackEl.textContent = detail ? `${prefix} ${detail}` : prefix;
        feedbackEl.className = 'quiz-feedback is-correct';
      } else {
        const explanation = byOptionId[selectedId] || overview || 'Not quite. Try again!';
        feedbackEl.textContent = explanation;
        feedbackEl.className = 'quiz-feedback is-incorrect';
      }
    });

    questionEl.appendChild(optionsList);
    questionEl.appendChild(checkButton);
    questionEl.appendChild(feedbackEl);

    root.appendChild(questionEl);
  });

  if (!root.children.length) {
    root.innerHTML = '<p class="muted">No supported quiz questions defined.</p>';
  }

  container.innerHTML = '';
  container.appendChild(root);
}


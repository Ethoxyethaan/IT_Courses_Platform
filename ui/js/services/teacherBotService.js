//author: https://github.com/nhermab
//licence: MIT
// TeacherBot service - Public API facade for Web-LLM teacher functionality

export {
  initTeacherBot,
  getTeacherBotStatus,
  debugTeacherBotEnv,
  debugWebLLMConfig
} from './teacherBot/engine.js';

// Re-export features with original names for backward compatibility
export { askQuestion as askTeacherBotQuestion } from './teacherBot/features.js';
export { gradeCode as gradeWithTeacherBot } from './teacherBot/features.js';
export { validateAssignment as validateAssignmentWithTeacher } from './teacherBot/features.js';


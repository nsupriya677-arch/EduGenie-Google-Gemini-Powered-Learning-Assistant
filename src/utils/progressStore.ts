import { StudentProgress, QuizAttemptRecord } from '../types';

const STORAGE_KEY = 'edugenie_student_progress_v1';

const DEFAULT_PROGRESS: StudentProgress = {
  totalQuizzesTaken: 1,
  totalQuestionsAnswered: 3,
  totalCorrect: 2,
  overallAccuracy: 67,
  streakDays: 3,
  lastActiveDate: new Date().toISOString().slice(0, 10),
  subjectStats: {
    'Mathematics': { attempts: 1, correct: 2, total: 3 },
    'Computer Science': { attempts: 0, correct: 0, total: 0 },
    'Science': { attempts: 0, correct: 0, total: 0 },
    'Commerce': { attempts: 0, correct: 0, total: 0 },
  },
  history: [
    {
      id: 'init-1',
      topic: 'Pythagoras theorem',
      subject: 'Mathematics',
      date: new Date().toLocaleDateString(),
      totalQuestions: 3,
      correctAnswers: 2,
      percentage: 67,
      weakTopics: ['Hypotenuse equation powers (a² + b² = c²)'],
    },
  ],
  weakAreas: ['Hypotenuse equation powers (a² + b² = c²)'],
};

export function getStudentProgress(): StudentProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROGRESS));
      return DEFAULT_PROGRESS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveQuizResult(
  topic: string,
  subject: string,
  totalQuestions: number,
  correctAnswers: number,
  wrongQuestions: string[] = []
): StudentProgress {
  const current = getStudentProgress();
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  const newRecord: QuizAttemptRecord = {
    id: `quiz-${Date.now()}`,
    topic,
    subject,
    date: new Date().toLocaleDateString(),
    totalQuestions,
    correctAnswers,
    percentage,
    weakTopics: wrongQuestions,
  };

  const today = new Date().toISOString().slice(0, 10);
  let streakDays = current.streakDays || 1;
  if (current.lastActiveDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (current.lastActiveDate === yesterday) {
      streakDays += 1;
    } else {
      streakDays = 1;
    }
  }

  const subjectStats = { ...current.subjectStats };
  const prevSub = subjectStats[subject] || { attempts: 0, correct: 0, total: 0 };
  subjectStats[subject] = {
    attempts: prevSub.attempts + 1,
    correct: prevSub.correct + correctAnswers,
    total: prevSub.total + totalQuestions,
  };

  const totalQuizzes = current.totalQuizzesTaken + 1;
  const totalAnswered = current.totalQuestionsAnswered + totalQuestions;
  const totalCorrect = current.totalCorrect + correctAnswers;
  const overallAccuracy = Math.round((totalCorrect / Math.max(1, totalAnswered)) * 100);

  // Update weak areas (deduplicated)
  const weakSet = new Set([...current.weakAreas, ...wrongQuestions]);

  const updated: StudentProgress = {
    totalQuizzesTaken: totalQuizzes,
    totalQuestionsAnswered: totalAnswered,
    totalCorrect,
    overallAccuracy,
    streakDays,
    lastActiveDate: today,
    subjectStats,
    history: [newRecord, ...current.history].slice(0, 30),
    weakAreas: Array.from(weakSet).slice(0, 15),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save to localStorage', e);
  }

  return updated;
}

export function resetProgress(): StudentProgress {
  const blank: StudentProgress = {
    totalQuizzesTaken: 0,
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
    overallAccuracy: 0,
    streakDays: 1,
    lastActiveDate: new Date().toISOString().slice(0, 10),
    subjectStats: {},
    history: [],
    weakAreas: [],
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blank));
  } catch (e) {
    console.warn(e);
  }
  return blank;
}

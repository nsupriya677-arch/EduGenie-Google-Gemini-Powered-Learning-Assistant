export type SubjectCategory =
  | 'Computer Science'
  | 'Mathematics'
  | 'Science'
  | 'Commerce'
  | 'Humanities'
  | 'General';

export type FeatureTabId =
  | 'assistant'
  | 'notes'
  | 'summarizer'
  | 'quiz'
  | 'exam'
  | 'planner'
  | 'coding'
  | 'material'
  | 'personalized'
  | 'progress'
  | 'subjects'
  | 'all';

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  error?: string;
}

export interface QuizAttemptRecord {
  id: string;
  topic: string;
  subject: string;
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  weakTopics?: string[];
}

export interface StudentProgress {
  totalQuizzesTaken: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  overallAccuracy: number;
  streakDays: number;
  lastActiveDate: string;
  subjectStats: Record<string, { attempts: number; correct: number; total: number }>;
  history: QuizAttemptRecord[];
  weakAreas: string[];
}

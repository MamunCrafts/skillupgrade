export type QuestionType = 'single' | 'multiple';

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: Option[];
  correctOptionIds: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  questions: Question[];
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  createdAt: number;
}

export interface ExamResult {
  id: string;
  courseId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  date: number;
  answers: { questionId: string; selectedOptionIds: string[] }[];
}

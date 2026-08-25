import { User } from './auth';

export interface Lesson {
  id: number;
  documentId: string;
  title: string;
  content: string;
  video_url?: string;
  order: number;
  course?: Course | { id: number; documentId: string; title: string; category?: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation?: string;
}

export interface Quiz {
  id: number;
  documentId: string;
  title: string;
  description: string;
  passing_score: number;
  questions: QuizQuestion[];
  course?: Course;
  submissions?: QuizSubmission[];
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizSubmission {
  id: number;
  documentId: string;
  score: number;
  passed: boolean;
  answers: Record<string, number>;
  submitted_at: string;
  quiz?: Quiz;
  student?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizEvaluationResult {
  submissionId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  passingScore: number;
  passed: boolean;
  totalQuestions: number;
  correctCount: number;
  breakdown: Array<{
    questionIndex: number;
    question: string;
    options: string[];
    submittedAnswer: number | null;
    correctAnswer: number;
    isCorrect: boolean;
    explanation?: string;
  }>;
  submittedAt: string;
}

export interface Course {
  id: number;
  documentId: string;
  title: string;
  description: string;
  category: string;
  cover_color: string;
  instructor?: User;
  lessons?: Lesson[];
  enrollments?: Enrollment[];
  quizzes?: Quiz[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Enrollment {
  id: number;
  documentId: string;
  enrolled_at?: string;
  course?: Course;
  student?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseProgress {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  percentage: number;
  completedLessonIds: string[];
}

export interface CourseFormData {
  title: string;
  description: string;
  category: string;
  cover_color: string;
  instructor?: string | number;
}

export interface LessonFormData {
  title: string;
  content: string;
  video_url?: string;
  order: number;
  course: string;
}

export interface QuizFormData {
  title: string;
  description: string;
  passing_score: number;
  course: string;
  questions: QuizQuestion[];
}

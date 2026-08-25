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

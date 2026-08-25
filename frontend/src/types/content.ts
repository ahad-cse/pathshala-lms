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
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseFormData {
  title: string;
  description: string;
  category: string;
  cover_color: string;
  instructor?: string | number; // user documentId or id
}

export interface LessonFormData {
  title: string;
  content: string;
  video_url?: string;
  order: number;
  course: string; // course documentId
}

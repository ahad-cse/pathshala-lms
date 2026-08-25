import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types/auth';
import {
  AdminStats,
  AdminUser,
  BlogPost,
  BlogPostFormData,
  Course,
  CourseFormData,
  CourseProgress,
  Enrollment,
  Lesson,
  LessonFormData,
  Quiz,
  QuizEvaluationResult,
  QuizFormData,
  QuizSubmission,
} from '@/types/content';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

interface FetchOptions extends RequestInit {
  token?: string;
  params?: Record<string, string | number | boolean>;
}

export class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Centralized API Fetcher
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, params, headers, ...restOptions } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Attach token from options or localStorage if in browser (skip for public auth endpoints)
  const isPublicAuthEndpoint = endpoint.startsWith('/api/auth/local');
  const authToken = !isPublicAuthEndpoint && (token || (typeof window !== 'undefined' ? localStorage.getItem('pathshala_token') : null));
  if (authToken) {
    defaultHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(url, {
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...restOptions,
  });

  let responseData: any;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    responseData = await res.json();
  } else {
    responseData = await res.text();
  }

  if (!res.ok) {
    const errorMessage =
      responseData?.error?.message ||
      responseData?.message ||
      (typeof responseData === 'string' ? responseData : 'An unexpected error occurred');
    
    throw new ApiError(errorMessage, res.status, responseData?.error?.details);
  }

  return responseData;
}

/**
 * Authentication API Service
 */
export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/api/auth/local', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/api/auth/local/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async me(token?: string): Promise<User> {
    return apiFetch<User>('/api/users/me', {
      method: 'GET',
      token,
    });
  },
};

/**
 * User Management API Service
 */
export const userApi = {
  async getAll(): Promise<User[]> {
    return apiFetch<User[]>('/api/users', {
      method: 'GET',
    });
  },
};

/**
 * Course Management API Service
 */
export const courseApi = {
  async getAll(params?: Record<string, any>): Promise<{ data: Course[]; meta?: any }> {
    return apiFetch<{ data: Course[]; meta?: any }>('/api/courses', {
      method: 'GET',
      params,
    });
  },

  async getOne(documentId: string): Promise<{ data: Course }> {
    return apiFetch<{ data: Course }>(`/api/courses/${documentId}`, {
      method: 'GET',
    });
  },

  async create(data: CourseFormData): Promise<{ data: Course }> {
    return apiFetch<{ data: Course }>('/api/courses', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  },

  async update(documentId: string, data: Partial<CourseFormData>): Promise<{ data: Course }> {
    return apiFetch<{ data: Course }>(`/api/courses/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  },

  async delete(documentId: string): Promise<void> {
    return apiFetch<void>(`/api/courses/${documentId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Lesson Management API Service
 */
export const lessonApi = {
  async getOne(documentId: string): Promise<{ data: Lesson }> {
    return apiFetch<{ data: Lesson }>(`/api/lessons/${documentId}`, {
      method: 'GET',
    });
  },

  async create(data: LessonFormData): Promise<{ data: Lesson }> {
    return apiFetch<{ data: Lesson }>('/api/lessons', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  },

  async update(documentId: string, data: Partial<LessonFormData>): Promise<{ data: Lesson }> {
    return apiFetch<{ data: Lesson }>(`/api/lessons/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  },

  async delete(documentId: string): Promise<void> {
    return apiFetch<void>(`/api/lessons/${documentId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Enrollment API Service
 */
export const enrollmentApi = {
  async getMyEnrollments(): Promise<{ data: Enrollment[] }> {
    return apiFetch<{ data: Enrollment[] }>('/api/enrollments', {
      method: 'GET',
    });
  },

  async enroll(courseDocumentId: string): Promise<{ data: Enrollment }> {
    return apiFetch<{ data: Enrollment }>('/api/enrollments', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          course: courseDocumentId,
        },
      }),
    });
  },
};

/**
 * Progress Tracking API Service
 */
export const progressApi = {
  async toggleLesson(lessonId: string, courseId: string): Promise<{
    data: {
      lessonId: string;
      isCompleted: boolean;
      courseId: string;
      totalLessons: number;
      completedLessons: number;
      percentage: number;
      completedLessonIds: string[];
    };
  }> {
    return apiFetch('/api/progress/toggle', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          lessonId,
          courseId,
        },
      }),
    });
  },

  async getCourseProgress(courseId: string): Promise<{ data: CourseProgress }> {
    return apiFetch<{ data: CourseProgress }>(`/api/progress/course/${courseId}`, {
      method: 'GET',
    });
  },
};

/**
 * Quiz & Auto-Grading API Service
 */
export const quizApi = {
  async getAll(): Promise<{ data: Quiz[] }> {
    return apiFetch<{ data: Quiz[] }>('/api/quizzes', {
      method: 'GET',
    });
  },

  async getOne(documentId: string): Promise<{ data: Quiz }> {
    return apiFetch<{ data: Quiz }>(`/api/quizzes/${documentId}`, {
      method: 'GET',
    });
  },

  async getByCourse(courseDocumentId: string): Promise<{ data: Quiz[] }> {
    return apiFetch<{ data: Quiz[] }>(`/api/quizzes/course/${courseDocumentId}`, {
      method: 'GET',
    });
  },

  async create(data: QuizFormData): Promise<{ data: Quiz }> {
    return apiFetch<{ data: Quiz }>('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  },

  async update(documentId: string, data: Partial<QuizFormData>): Promise<{ data: Quiz }> {
    return apiFetch<{ data: Quiz }>(`/api/quizzes/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  },

  async delete(documentId: string): Promise<void> {
    return apiFetch<void>(`/api/quizzes/${documentId}`, {
      method: 'DELETE',
    });
  },

  async submit(quizDocumentId: string, answers: Record<string | number, number>): Promise<{ data: QuizEvaluationResult }> {
    return apiFetch<{ data: QuizEvaluationResult }>(`/api/quizzes/${quizDocumentId}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        data: {
          answers,
        },
      }),
    });
  },
};

/**
 * Quiz Submission Historic Results API Service
 */
export const quizSubmissionApi = {
  async getMySubmissions(): Promise<{ data: QuizSubmission[] }> {
    return apiFetch<{ data: QuizSubmission[] }>('/api/quiz-submissions', {
      method: 'GET',
    });
  },
};

/**
 * Admin Panel & User Role Management API Service
 */
export const adminApi = {
  async getStats(): Promise<{ data: AdminStats }> {
    return apiFetch<{ data: AdminStats }>('/api/admin-dashboard/stats', {
      method: 'GET',
    });
  },

  async getUsers(): Promise<{ data: AdminUser[] }> {
    return apiFetch<{ data: AdminUser[] }>('/api/admin-dashboard/users', {
      method: 'GET',
    });
  },

  async updateUserRole(userId: number | string, role_type: string): Promise<{ data: AdminUser }> {
    return apiFetch<{ data: AdminUser }>(`/api/admin-dashboard/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role_type }),
    });
  },

  async deleteUser(userId: number | string): Promise<{ data: { message: string } }> {
    return apiFetch<{ data: { message: string } }>(`/api/admin-dashboard/users/${userId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Blog & Publication API Service
 */
export const blogApi = {
  async getAll(params?: Record<string, any>): Promise<{ data: BlogPost[]; meta?: any }> {
    return apiFetch<{ data: BlogPost[]; meta?: any }>('/api/blog-posts', {
      method: 'GET',
      params,
    });
  },

  async getOne(idOrSlug: string): Promise<{ data: BlogPost }> {
    return apiFetch<{ data: BlogPost }>(`/api/blog-posts/${idOrSlug}`, {
      method: 'GET',
    });
  },

  async create(data: BlogPostFormData): Promise<{ data: BlogPost }> {
    return apiFetch<{ data: BlogPost }>('/api/blog-posts', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  },

  async update(documentId: string, data: Partial<BlogPostFormData>): Promise<{ data: BlogPost }> {
    return apiFetch<{ data: BlogPost }>(`/api/blog-posts/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  },

  async delete(documentId: string): Promise<void> {
    return apiFetch<void>(`/api/blog-posts/${documentId}`, {
      method: 'DELETE',
    });
  },
};

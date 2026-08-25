import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types/auth';
import { Course, CourseFormData, CourseProgress, Enrollment, Lesson, LessonFormData } from '@/types/content';

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

  // Attach token from options or localStorage if in browser
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('pathshala_token') : null);
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

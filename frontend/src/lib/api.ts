import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types/auth';

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

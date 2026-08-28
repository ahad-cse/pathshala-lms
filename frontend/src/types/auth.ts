export type RoleType = 'admin' | 'content_manager' | 'instructor' | 'student';

export interface User {
  id: number;
  documentId?: string;
  username: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  role_type: RoleType;
  confirmed?: boolean;
  blocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  jwt: string;
  user: User;
}

export interface LoginCredentials {
  identifier: string; // Email or username
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
}

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthResponse, LoginCredentials, RegisterCredentials, RoleType, User } from '@/types/auth';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: RoleType | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: RoleType) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_CREDENTIALS: Record<RoleType, LoginCredentials> = {
  admin: { identifier: 'admin@demo.com', password: 'Password123!' },
  content_manager: { identifier: 'content@demo.com', password: 'Password123!' },
  instructor: { identifier: 'instructor@demo.com', password: 'Password123!' },
  student: { identifier: 'student@demo.com', password: 'Password123!' },
};

export const ROLE_DETAILS: Record<
  RoleType,
  { label: string; color: string; softColor: string; description: string }
> = {
  admin: {
    label: 'Admin',
    color: 'var(--role-admin)',
    softColor: 'var(--role-admin-soft)',
    description: 'Platform Administrator & Role Controller',
  },
  content_manager: {
    label: 'Content Manager',
    color: 'var(--role-content)',
    softColor: 'var(--role-content-soft)',
    description: 'Course & Curriculum Manager',
  },
  instructor: {
    label: 'Instructor',
    color: 'var(--role-instructor)',
    softColor: 'var(--role-instructor-soft)',
    description: 'Course Creator & Evaluator',
  },
  student: {
    label: 'Student',
    color: 'var(--role-student)',
    softColor: 'var(--role-student-soft)',
    description: 'Active Learner',
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const handleAuthSuccess = (data: AuthResponse) => {
    setToken(data.jwt);
    setUser(data.user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pathshala_token', data.jwt);
      localStorage.setItem('pathshala_user', JSON.stringify(data.user));
      document.cookie = `pathshala_token=${data.jwt}; path=/; max-age=604800; SameSite=Lax`;
    }
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pathshala_token');
      localStorage.removeItem('pathshala_user');
      document.cookie = 'pathshala_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    router.replace('/login');
  }, [router]);

  // Restore session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('pathshala_token');
        const savedUserStr = localStorage.getItem('pathshala_user');

        if (savedToken && savedUserStr) {
          setToken(savedToken);
          setUser(JSON.parse(savedUserStr));

          // Re-verify token against backend in background
          try {
            const freshUser = await authApi.me(savedToken);
            setUser(freshUser);
            localStorage.setItem('pathshala_user', JSON.stringify(freshUser));
          } catch (verifyErr) {
            console.warn('[AUTH] Token expired or invalid, logging out', verifyErr);
            logout();
          }
        }
      } catch (err) {
        console.error('[AUTH] Failed to restore session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [logout]);

  const getRoleLandingRoute = (roleType?: string) => {
    if (roleType === 'admin') return '/dashboard';
    if (roleType === 'instructor') return '/instructor/courses';
    if (roleType === 'content_manager') return '/courses';
    return '/my-courses';
  };

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const data = await authApi.login(credentials);
      handleAuthSuccess(data);
      const targetRoute = getRoleLandingRoute(data.user.role_type);
      router.push(targetRoute);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      const data = await authApi.register(credentials);
      handleAuthSuccess(data);
      const targetRoute = getRoleLandingRoute(data.user.role_type);
      router.push(targetRoute);
    } finally {
      setIsLoading(false);
    }
  };

  const switchDemoRole = async (targetRole: RoleType) => {
    const creds = DEMO_CREDENTIALS[targetRole];
    if (creds) {
      await login(creds);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role_type || null,
        isLoading,
        login,
        register,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

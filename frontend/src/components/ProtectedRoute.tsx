'use client';

import React, { useEffect } from 'react';
import { useAuth, ROLE_DETAILS } from '@/context/AuthContext';
import { RoleType } from '@/types/auth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: RoleType[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--canvas)',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ fontSize: '13px', color: 'var(--ink-faint)', fontWeight: 500 }}>
          Authenticating PathShala Session...
        </p>
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  // Check role authorization if allowedRoles is specified
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    const currentRoleConf = ROLE_DETAILS[role] || ROLE_DETAILS.student;
    
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: 'var(--danger-soft)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
          Access Restricted (403 Forbidden)
        </h2>

        <p style={{ maxWidth: '440px', fontSize: '13.5px', color: 'var(--ink-soft)', marginBottom: '20px', lineHeight: 1.5 }}>
          Your current account role is <strong style={{ color: currentRoleConf.color }}>{currentRoleConf.label}</strong>.
          This page requires one of the following permissions:{' '}
          <strong>{allowedRoles.map((r) => ROLE_DETAILS[r]?.label).join(', ')}</strong>.
        </p>

        <Link
          href="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '13px',
            textDecoration: 'none',
            boxShadow: '0 2px 6px rgba(242, 102, 42, 0.25)',
          }}
        >
          Return to Your Dashboard
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, ROLE_DETAILS } from '@/context/AuthContext';
import { RoleType } from '@/types/auth';

interface NavItemConfig {
  label: string;
  href: string;
  roles: RoleType[];
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItemConfig[] = [
  // Common across all authenticated roles
  {
    label: 'Dashboard',
    href: '/dashboard',
    roles: ['admin', 'content_manager', 'instructor', 'student'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  // Student Specific
  {
    label: 'Courses',
    href: '/courses',
    roles: ['student'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
        <path d="M6 6h10" />
        <path d="M6 10h10" />
      </svg>
    ),
  },
  {
    label: 'My Enrolled Courses',
    href: '/my-courses',
    roles: ['student'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  // Instructor Specific
  {
    label: 'Course Studio',
    href: '/instructor/courses',
    roles: ['instructor'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    ),
  },
  {
    label: 'MCQ Quiz Studio',
    href: '/instructor/quizzes',
    roles: ['instructor'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  // Content Manager & Admin
  {
    label: 'Courses',
    href: '/courses',
    roles: ['admin', 'content_manager'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </svg>
    ),
  },
  {
    label: 'Blog',
    href: '/blog',
    roles: ['admin', 'content_manager'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M18 14h-8" />
        <path d="M15 18h-5" />
        <path d="M10 6h8v4h-8V6Z" />
      </svg>
    ),
  },
  // Admin Only
  {
    label: 'Admin Control Center',
    href: '/admin',
    roles: ['admin'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { user, role, logout } = useAuth();
  const pathname = usePathname();

  const currentRole: RoleType = role || 'student';
  const roleConfig = ROLE_DETAILS[currentRole] || ROLE_DETAILS.student;

  // STRICT RULE: Compute navigation items purely based on authenticated role
  const allowedNavItems = NAV_ITEMS.filter((item) => item.roles.includes(currentRole));

  return (
    <aside
      className={`app-sidebar ${isOpen ? 'sidebar-open' : ''}`}
      style={{
        width: '248px',
        flexShrink: 0,
        backgroundColor: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 14px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxSizing: 'border-box',
        zIndex: 20,
      }}
    >
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px 20px' }}>
        <Link
          href="/"
          title="Go to Home"
          onClick={(e) => {
            if (typeof window !== 'undefined' && window.location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            if (onClose) onClose();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '17px',
              fontFamily: 'var(--font-display)',
              boxShadow: '0 2px 8px rgba(242, 102, 42, 0.3)',
            }}
          >
            P
          </div>
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: '16.5px',
                letterSpacing: '-0.02em',
                color: 'var(--ink)',
                fontFamily: 'var(--font-display)',
              }}
            >
              PathShala
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--ink-faint)',
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              LMS Platform
            </div>
          </div>
        </Link>

        {/* Mobile Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close Sidebar"
            style={{
              padding: '6px',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              color: 'var(--ink-soft)',
              border: 'none',
              cursor: 'pointer',
            }}
            className="mobile-menu-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dynamic Nav Group */}
      <div
        style={{
          fontSize: '10.5px',
          fontWeight: 700,
          color: 'var(--ink-faint)',
          textTransform: 'none',
          letterSpacing: '0.06em',
          padding: '6px 10px 6px',
        }}
      >
        Navigation
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, overflowY: 'auto' }}>
        {allowedNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (onClose) onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                textDecoration: 'none',
                color: isActive ? '#FFFFFF' : 'var(--ink-soft)',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                transition: 'all 0.12s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--canvas)';
                  e.currentTarget.style.color = 'var(--ink)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--ink-soft)';
                }
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', opacity: isActive ? 1 : 0.8 }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Role Info Footer */}
      <div
        style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '14px',
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* User Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            backgroundColor: 'var(--canvas)',
            borderRadius: '10px',
            border: '1px solid var(--border-soft)',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', minWidth: 0 }}>
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user?.username || 'User'}
                style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: roleConfig.color,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {(user?.full_name || user?.username || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {user?.full_name || user?.username || 'Authenticated User'}
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '99px',
                  backgroundColor: roleConfig.softColor,
                  color: roleConfig.color,
                  marginTop: '1px',
                  textTransform: 'none',
                  letterSpacing: '0.03em',
                }}
              >
                <span
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: roleConfig.color,
                  }}
                />
                {roleConfig.label}
              </div>
            </div>
          </div>

          {/* Logout Action Button */}
          <button
            onClick={logout}
            style={{
              padding: '6px',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              color: 'var(--ink-faint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease',
            }}
            title="Sign Out"
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-faint)')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

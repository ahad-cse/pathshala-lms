'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, ROLE_DETAILS } from '@/context/AuthContext';
import { RoleType } from '@/types/auth';

interface NavItemConfig {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: RoleType[];
}

const NAV_ITEMS: NavItemConfig[] = [
  // Shared / Role Overview
  {
    label: 'Overview',
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
    label: 'Browse Courses',
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
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  // Instructor Specific
  {
    label: 'My Author Courses',
    href: '/instructor/courses',
    roles: ['instructor'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
        <path d="M10 2v20" />
      </svg>
    ),
  },
  {
    label: 'Quizzes & Scoring',
    href: '/instructor/quizzes',
    roles: ['instructor', 'content_manager', 'admin'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  // Content Manager & Admin
  {
    label: 'Course Catalog & CMS',
    href: '/courses',
    roles: ['admin', 'content_manager'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.29 7 12 12 20.71 7" />
        <line x1="12" x2="12" y1="22" y2="12" />
      </svg>
    ),
  },
  {
    label: 'Articles & Knowledge Hub',
    href: '/blog',
    roles: ['admin', 'content_manager', 'instructor', 'student'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" x2="8" y1="13" y2="13" />
        <line x1="16" x2="8" y1="17" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  // Admin Only
  {
    label: 'Admin Control Panel',
    href: '/admin',
    roles: ['admin'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const { user, role, logout } = useAuth();
  const pathname = usePathname();

  const currentRole: RoleType = role || 'student';
  const roleConfig = ROLE_DETAILS[currentRole] || ROLE_DETAILS.student;

  // STRICT RULE: Compute navigation items purely based on authenticated role
  const allowedNavItems = NAV_ITEMS.filter((item) => item.roles.includes(currentRole));

  return (
    <aside
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
      <Link
        href="/"
        title="Go to Home"
        onClick={(e) => {
          if (typeof window !== 'undefined' && window.location.pathname === '/') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 8px 20px',
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
              marginTop: '-2px',
              fontWeight: 500,
            }}
          >
            LMS Platform
          </div>
        </div>
      </Link>

      {/* Role Indicator Banner in Sidebar */}
      <div
        style={{
          margin: '0 8px 16px',
          padding: '8px 10px',
          borderRadius: '8px',
          backgroundColor: roleConfig.softColor,
          border: `1px solid ${roleConfig.color}22`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: roleConfig.color,
          }}
        />
        <div style={{ fontSize: '11.5px', fontWeight: 600, color: roleConfig.color }}>
          {roleConfig.label} Mode
        </div>
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
              key={item.href + item.label}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '8px',
                color: isActive ? roleConfig.color : 'var(--ink-soft)',
                backgroundColor: isActive ? roleConfig.softColor : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '13.5px',
                position: 'relative',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {/* Active Left Pill Indicator */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    left: '-14px',
                    top: '6px',
                    bottom: '6px',
                    width: '3.5px',
                    borderRadius: '0 4px 4px 0',
                    backgroundColor: roleConfig.color,
                  }}
                />
              )}
              <span style={{ display: 'flex', alignItems: 'center', opacity: isActive ? 1 : 0.75 }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer — User Card & Role Badge */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '14px',
          borderTop: '1px solid var(--border-soft)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px',
            borderRadius: '10px',
            backgroundColor: 'var(--canvas)',
          }}
        >
          {/* Avatar Ring with Role Color */}
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: roleConfig.softColor,
              color: roleConfig.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '13px',
              border: `2px solid ${roleConfig.color}`,
              flexShrink: 0,
            }}
          >
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--ink)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.username || 'Guest'}
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

          {/* Logout Action Button */}
          <button
            onClick={logout}
            title="Sign Out"
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              borderRadius: '6px',
              color: 'var(--ink-faint)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-faint)')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

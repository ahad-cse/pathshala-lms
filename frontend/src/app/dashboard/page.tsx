'use client';

import React from 'react';
import { useAuth, ROLE_DETAILS } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, role } = useAuth();
  const currentRole = role || 'student';
  const roleConfig = ROLE_DETAILS[currentRole] || ROLE_DETAILS.student;

  return (
    <ProtectedRoute>
      <AppShell
        title={`${roleConfig.label} Dashboard`}
        subtitle={`Signed in as ${user?.email} (${roleConfig.label})`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Hero Role Banner */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              padding: '28px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top decorative role accent bar */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                backgroundColor: roleConfig.color,
              }}
            />

            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '2px 8px',
                  borderRadius: '99px',
                  backgroundColor: roleConfig.softColor,
                  color: roleConfig.color,
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'none',
                  letterSpacing: '0.04em',
                  marginBottom: '10px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: roleConfig.color,
                  }}
                />
                {roleConfig.label} Workspace
              </div>

              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: 'var(--ink)',
                  margin: '0 0 6px',
                  fontFamily: 'var(--font-display)',
                }}
              >
                Welcome back, {user?.username}!
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: 0, maxWidth: '600px' }}>
                {roleConfig.description}. Manage your learning, authoring, and platform resources from this unified portal.
              </p>
            </div>

            {/* Quick Action Button per Role */}
            <div>
              {currentRole === 'student' && (
                <Link
                  href="/courses"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '11px 20px',
                    borderRadius: '9px',
                    backgroundColor: 'var(--primary)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(242, 102, 42, 0.3)',
                  }}
                >
                  Courses →
                </Link>
              )}

              {currentRole === 'instructor' && (
                <Link
                  href="/instructor/courses"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '11px 20px',
                    borderRadius: '9px',
                    backgroundColor: roleConfig.color,
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    textDecoration: 'none',
                  }}
                >
                  Manage My Courses →
                </Link>
              )}

              {(currentRole === 'admin' || currentRole === 'content_manager') && (
                <Link
                  href={currentRole === 'admin' ? '/admin' : '/courses'}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '11px 20px',
                    borderRadius: '9px',
                    backgroundColor: roleConfig.color,
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    textDecoration: 'none',
                  }}
                >
                  {currentRole === 'admin' ? 'Open Admin Panel →' : 'Manage Course Catalog →'}
                </Link>
              )}
            </div>
          </div>

          {/* Role-Specific Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '16px' }}>
            {currentRole === 'student' && (
              <>
                <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-faint)', textTransform: 'none', marginBottom: '8px' }}>
                    Enrolled Courses
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
                    2
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--success)', marginTop: '4px', fontWeight: 600 }}>
                    ● 1 In Progress
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-faint)', textTransform: 'none', marginBottom: '8px' }}>
                    Completed Lessons
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
                    3
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                    Average quiz score: 85%
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-faint)', textTransform: 'none', marginBottom: '8px' }}>
                    Learning Streak
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
                    4 Days 🔥
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                    Keep going to earn badges
                  </div>
                </div>
              </>
            )}

            {currentRole === 'instructor' && (
              <>
                <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-faint)', textTransform: 'none', marginBottom: '8px' }}>
                    My Created Courses
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--role-instructor)', fontFamily: 'var(--font-display)' }}>
                    1
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                    Fullstack Next.js & TS Masterclass
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-faint)', textTransform: 'none', marginBottom: '8px' }}>
                    Total Lessons Authored
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
                    3
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--success)', marginTop: '4px', fontWeight: 600 }}>
                    All published & active
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-faint)', textTransform: 'none', marginBottom: '8px' }}>
                    Active Students
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
                    12
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                    Across all owned courses
                  </div>
                </div>
              </>
            )}

            {currentRole === 'content_manager' && (
              <>
                <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-faint)', textTransform: 'none', marginBottom: '8px' }}>
                    Platform Courses
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--role-content)', fontFamily: 'var(--font-display)' }}>
                    2
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                    Global catalog editing enabled
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-faint)', textTransform: 'none', marginBottom: '8px' }}>
                    Blog Articles
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
                    4
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--success)', marginTop: '4px', fontWeight: 600 }}>
                    Draft & publish workflow active
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-faint)', textTransform: 'none', marginBottom: '8px' }}>
                    Pending Reviews
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
                    0
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                    All curriculum up to date
                  </div>
                </div>
              </>
            )}

            {currentRole === 'admin' && (
              <>
                <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-faint)', textTransform: 'none', marginBottom: '8px' }}>
                    Total Registered Users
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--role-admin)', fontFamily: 'var(--font-display)' }}>
                    5
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                    Across 4 distinct role tiers
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-faint)', textTransform: 'none', marginBottom: '8px' }}>
                    Backend Security
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-display)' }}>
                    100%
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--success)', marginTop: '4px', fontWeight: 600 }}>
                    Policies strictly enforced
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-faint)', textTransform: 'none', marginBottom: '8px' }}>
                    Role Management
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
                    Admin Mode
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                    Full platform CRUD control
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Access Portal Grid */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              padding: '24px',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '16px' }}>
              Quick Navigation Portal
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <Link
                href="/courses"
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--canvas)',
                  border: '1px solid var(--border-soft)',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'border-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-soft)')}
              >
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
                  📚 Courses
                </div>
                <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                  Explore web development & computer science courses
                </div>
              </Link>

              {currentRole === 'student' && (
                <Link
                  href="/my-courses"
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--canvas)',
                    border: '1px solid var(--border-soft)',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    transition: 'border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--role-student)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-soft)')}
                >
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
                    🎓 My Enrolled Courses
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                    Resume lessons & view tracking percentages
                  </div>
                </Link>
              )}

              {currentRole === 'instructor' && (
                <Link
                  href="/instructor/courses"
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--canvas)',
                    border: '1px solid var(--border-soft)',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    transition: 'border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--role-instructor)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-soft)')}
                >
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
                    ✍️ Instructor Studio
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                    Author new lessons & manage your courses
                  </div>
                </Link>
              )}

              {(currentRole === 'admin' || currentRole === 'content_manager') && (
                <Link
                  href="/blog"
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--canvas)',
                    border: '1px solid var(--border-soft)',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    transition: 'border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--role-content)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-soft)')}
                >
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
                    📰 Blog
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                    Publish educational articles & updates
                  </div>
                </Link>
              )}

              {currentRole === 'admin' && (
                <Link
                  href="/admin"
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--canvas)',
                    border: '1px solid var(--border-soft)',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    transition: 'border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--role-admin)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-soft)')}
                >
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
                    🛡️ Admin Panel
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                    Manage user roles & inspect platform metrics
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

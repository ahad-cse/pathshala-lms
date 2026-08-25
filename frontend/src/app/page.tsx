'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth, ROLE_DETAILS } from '@/context/AuthContext';
import { RoleType } from '@/types/auth';
import { blogApi, courseApi } from '@/lib/api';
import { BlogPost, Course } from '@/types/content';

export default function HomePage() {
  const { user, role } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roleDashboardLabel = role === 'admin'
    ? 'Admin Dashboard'
    : role === 'content_manager'
    ? 'Content Dashboard'
    : role === 'instructor'
    ? 'Instructor Studio'
    : 'Student Dashboard';

  const courseAction = !user || role === 'student'
    ? { label: 'Enroll Now →', href: '/courses' }
    : role === 'instructor'
    ? { label: 'Instructor Studio →', href: '/instructor/courses' }
    : role === 'admin'
    ? { label: 'Manage Courses →', href: '/courses' }
    : { label: 'View Curriculum →', href: '/courses' };

  useEffect(() => {
    async function loadData() {
      try {
        const [postsRes, coursesRes] = await Promise.allSettled([
          blogApi.getAll(),
          courseApi.getAll(),
        ]);
        if (postsRes.status === 'fulfilled') {
          setLatestPosts(postsRes.value.data?.slice(0, 3) || []);
        }
        if (coursesRes.status === 'fulfilled') {
          setCourses(coursesRes.value.data || []);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      }
    }
    loadData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--canvas)', display: 'flex', flexDirection: 'column', paddingTop: '70px' }}>
      {/* Header / Navbar (Fixed Pinned Glassmorphic) */}
      <header
        className="landing-nav"
        style={{
          height: '70px',
          backgroundColor: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 36px',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          boxSizing: 'border-box',
          zIndex: 999,
          boxShadow: '0 1px 6px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Left Side: Brand Logo */}
        <Link
          href="/"
          title="PathShala Home"
          onClick={(e) => {
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', cursor: 'pointer' }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              boxShadow: '0 2px 8px rgba(242, 102, 42, 0.3)',
            }}
          >
            P
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
              PathShala
            </span>
            <span style={{ fontSize: '11px', color: 'var(--ink-faint)', marginLeft: '6px', fontWeight: 600 }}>
              LMS
            </span>
          </div>
        </Link>

        {/* Right Side: Blog Link + Auth Actions (with generous subtle gap) */}
        <div className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          {/* Sleek Bordered Blog Button with Icon */}
          <Link
            href="/blog"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--ink)',
              backgroundColor: 'var(--canvas)',
              border: '1px solid var(--border)',
              padding: '7px 14px',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.color = 'var(--primary)';
              e.currentTarget.style.backgroundColor = 'var(--surface)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--ink)';
              e.currentTarget.style.backgroundColor = 'var(--canvas)';
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10" />
              <path d="M6 10h10" />
            </svg>
            <span>Blog</span>
          </Link>

          {user ? (
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '4px 14px 4px 6px',
                borderRadius: '99px',
                backgroundColor: 'var(--canvas)',
                border: '1px solid var(--border)',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              title={`Go to ${roleDashboardLabel}`}
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {(user.full_name || user.username).charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2 }}>
                  {user.full_name || user.username}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--ink-faint)', fontWeight: 600 }}>
                  {role === 'admin' ? 'Admin' : role === 'instructor' ? 'Instructor' : role === 'content_manager' ? 'Content' : 'Student'} • Dashboard →
                </span>
              </div>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: 'var(--ink)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s ease',
                }}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                style={{
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--primary)',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(242, 102, 42, 0.25)',
                }}
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="mobile-nav-toggle" style={{ display: 'none', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <Link
              href="/dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px 4px 4px',
                borderRadius: '99px',
                backgroundColor: 'var(--canvas)',
                border: '1px solid var(--border)',
                textDecoration: 'none',
              }}
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {(user.full_name || user.username).charAt(0).toUpperCase()}
                </div>
              )}
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
                {user.username}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                color: 'var(--ink)',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Sign In
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
            style={{
              padding: '7px 8px',
              borderRadius: '8px',
              backgroundColor: 'var(--canvas)',
              border: '1px solid var(--border)',
              color: 'var(--ink)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {mobileMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Nav Dropdown Drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-nav-dropdown"
          style={{
            position: 'fixed',
            top: '70px',
            left: 0,
            right: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border)',
            boxShadow: '0 12px 24px -6px rgba(0, 0, 0, 0.1)',
            padding: '16px 20px',
            zIndex: 998,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <Link
            href="/blog"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              padding: '11px 14px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--ink)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--canvas)',
            }}
          >
            <span>📰</span>
            <span>Blog & Publications</span>
          </Link>

          <div style={{ height: '1px', backgroundColor: 'var(--border-soft)', margin: '4px 0' }} />

          {user ? (
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '14px',
                textAlign: 'center',
                textDecoration: 'none',
              }}
            >
              {roleDashboardLabel} ({user.username}) →
            </Link>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '11px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--ink)',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '11px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Hero Section */}
      <section
        style={{
          padding: '80px 24px 60px',
          textAlign: 'center',
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <h1
          className="hero-heading"
          style={{
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 800,
            lineHeight: 1.15,
            color: 'var(--ink)',
            letterSpacing: '-0.03em',
            marginBottom: '16px',
            fontFamily: 'var(--font-display)',
          }}
        >
          Mastery through Structured Learning & Real-time Progress
        </h1>

        <p
          style={{
            fontSize: '16px',
            lineHeight: 1.6,
            color: 'var(--ink-soft)',
            maxWidth: '640px',
            margin: '0 auto 32px',
          }}
        >
          PathShala provides sequential lessons, server-side auto-graded quizzes, and role-based
          access controls for students, instructors, content managers, and administrators.
        </p>

        <div className="hero-cta-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <Link
            href="/courses"
            style={{
              padding: '13px 26px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(242, 102, 42, 0.35)',
            }}
          >
            Explore Courses
          </Link>
          <Link
            href={user ? '/dashboard' : '/signup'}
            style={{
              padding: '13px 24px',
              borderRadius: '10px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--ink)',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            {user ? 'Go to Dashboard →' : 'Get Started Now →'}
          </Link>
        </div>
      </section>

      {/* 4-Role Architecture Feature Matrix */}
      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto 70px',
          width: '100%',
          padding: '0 24px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px' }}>
            Built with 4-Tier Role Security
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--ink-soft)', margin: 0 }}>
            Every API endpoint and interface is strictly protected by backend role policies.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          {([
            {
              role: 'student',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                  <polyline points="10 2 10 10 13 7 16 10 16 2" />
                </svg>
              ),
              tagline: 'Student Learning',
            },
            {
              role: 'instructor',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              ),
              tagline: 'Course Studio',
            },
            {
              role: 'content_manager',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              ),
              tagline: 'Article Publications',
            },
            {
              role: 'admin',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              ),
              tagline: 'Full System & RBAC',
            },
          ] as Array<{ role: RoleType; icon: React.ReactNode; tagline: string }>).map(({ role: r, icon, tagline }) => {
            const conf = ROLE_DETAILS[r];
            return (
              <div
                key={r}
                style={{
                  backgroundColor: 'var(--surface)',
                  borderRadius: '14px',
                  border: '1px solid var(--border)',
                  padding: '22px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
                  transition: 'border-color 0.15s ease, transform 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = conf.color;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Role Icon & Tag */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: conf.softColor,
                      color: conf.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {icon}
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: conf.color,
                      backgroundColor: conf.softColor,
                      padding: '3px 8px',
                      borderRadius: '99px',
                    }}
                  >
                    {conf.label}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px' }}>
                    {tagline}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.45 }}>
                    {conf.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Courses Section on Homepage */}
      {courses.length > 0 && (
        <section
          style={{
            maxWidth: '1100px',
            margin: '0 auto 60px',
            width: '100%',
            padding: '0 24px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 6px' }}>
                Explore Courses
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: 0 }}>
                High-impact structured learning tracks with sequential lessons and interactive assessments
              </p>
            </div>

            <Link
              href="/courses"
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--primary)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              View All Courses ({courses.length}) →
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
              gap: '20px',
            }}
          >
            {courses.map((course) => {
              const lessonCount = course.lessons?.length || 0;
              return (
                <div
                  key={course.id || course.documentId}
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.04)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  {/* Rich Educational Course Banner with Gradient & Badges */}
                  <div
                    style={{
                      height: '96px',
                      background: `linear-gradient(135deg, ${course.cover_color || 'var(--primary)'} 0%, #0F172A 100%)`,
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '99px',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        color: 'var(--ink)',
                        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {course.category || 'Course'}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '99px',
                        backgroundColor: 'rgba(0, 0, 0, 0.45)',
                        color: '#FFFFFF',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {lessonCount} {lessonCount === 1 ? 'Lesson' : 'Lessons'}
                    </span>
                  </div>

                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>

                    {/* Title */}
                    <h3
                      style={{
                        fontSize: '17px',
                        fontWeight: 700,
                        color: 'var(--ink)',
                        margin: '0 0 8px',
                        lineHeight: 1.35,
                      }}
                    >
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p
                      style={{
                        fontSize: '13px',
                        color: 'var(--ink-soft)',
                        lineHeight: 1.55,
                        margin: '0 0 20px',
                        flex: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {course.description || 'Master key concepts with structured hands-on lessons.'}
                    </p>

                    {/* Footer Action */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid var(--border-soft)',
                        paddingTop: '14px',
                        marginTop: 'auto',
                      }}
                    >
                      <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                        Instructor: <strong>{course.instructor?.username || 'PathShala Faculty'}</strong>
                      </div>
                      <Link
                        href={courseAction.href}
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 700,
                          color: 'var(--primary)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {courseAction.label}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

{/* Latest Published Articles Section on Homepage */}
      {latestPosts.length > 0 && (
        <section
          style={{
            maxWidth: '1100px',
            margin: '0 auto 80px',
            width: '100%',
            padding: '0 24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 6px' }}>
                Latest Publications & Engineering Guides
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: 0 }}>
                Articles, architectural patterns, and tutorials authored by our content team
              </p>
            </div>

            <Link
              href="/blog"
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--primary)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              View All Articles →
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))',
              gap: '20px',
            }}
          >
            {latestPosts.map((post) => (
              <div
                key={post.id}
                style={{
                  backgroundColor: 'var(--surface)',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                {post.cover_image_url && (
                  <div
                    style={{
                      height: '180px',
                      backgroundImage: `url(${post.cover_image_url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                )}

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11.5px', color: 'var(--ink-faint)', marginBottom: '8px' }}>
                      {post.published_date ? new Date(post.published_date).toLocaleDateString() : 'Published'} • By {post.author?.username || 'Editorial Team'}
                    </div>

                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 10px', lineHeight: 1.35 }}>
                      <Link href={`/blog/${post.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {post.title}
                      </Link>
                    </h3>

                    <p style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0 }}>
                      {post.excerpt || post.content.replace(/<[^>]*>?/gm, '').slice(0, 120) + '...'}
                    </p>
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    Read Full Story →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          backgroundColor: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          padding: '24px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '13px',
          color: 'var(--ink-faint)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>© 2026 PathShala LMS. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link href="/blog" style={{ color: 'var(--ink-soft)', textDecoration: 'none', fontWeight: 600 }}>
            Blog
          </Link>
          <Link href="/courses" style={{ color: 'var(--ink-soft)', textDecoration: 'none', fontWeight: 600 }}>
            Courses
          </Link>
        </div>
      </footer>
    </div>
  );
}

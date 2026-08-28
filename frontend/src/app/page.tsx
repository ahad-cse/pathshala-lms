'use client';


import Logo from '@/components/Logo';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth, ROLE_DETAILS } from '@/context/AuthContext';
import { RoleType } from '@/types/auth';
import { blogApi, courseApi, enrollmentApi, progressApi } from '@/lib/api';
import { BlogPost, Course } from '@/types/content';

export default function HomePage() {
  const { user, role } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [visibleCourseCount, setVisibleCourseCount] = useState(6);
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);
  const [visiblePostCount, setVisiblePostCount] = useState(6);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});


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
        const [postsRes, coursesRes, enrollRes, progRes] = await Promise.allSettled([
          blogApi.getAll(),
          courseApi.getAll(),
          user && role === 'student' ? enrollmentApi.getMyEnrollments() : Promise.resolve({ data: [] }),
          user && role === 'student' ? progressApi.getAll() : Promise.resolve({ data: [] }),
        ]);
        if (postsRes.status === 'fulfilled') {
          setLatestPosts(postsRes.value.data || []);
        }
        if (coursesRes.status === 'fulfilled') {
          setCourses(coursesRes.value.data || []);
        }
        if (enrollRes.status === 'fulfilled') {
          const enrollments = enrollRes.value.data || [];
          const ids = enrollments.map((e: any) => e.course?.documentId || String(e.course?.id)).filter(Boolean);
          setEnrolledCourseIds(ids);

          const progDict: Record<string, number> = {};
          enrollments.forEach((e: any) => {
            if (e.progress_percent !== undefined) {
              if (e.course?.documentId) progDict[e.course.documentId] = e.progress_percent;
              if (e.course?.id) progDict[String(e.course.id)] = e.progress_percent;
            }
          });

          if (progRes.status === 'fulfilled') {
            (progRes.value.data || []).forEach((p: any) => {
              const k = p.course?.documentId || String(p.course?.id);
              if (k && p.percentage !== undefined) progDict[k] = p.percentage;
            });
          }

          setProgressMap(progDict);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      }
    }
    loadData();
  }, [user, role]);


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
        {/* Left Side: Brand Logo with Vector Icon */}
        <Logo
          size="md"
          href="/"
          onClick={() => {
            if (typeof window !== 'undefined' && window.location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        />

        {/* Right Side: Blog Capsule + User Avatar / Auth Buttons (Clean Mobile & Desktop Layout) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* High-End Blog Navigation Capsule (Visible on Desktop; Hidden on Mobile when Unauthenticated) */}
          <Link
            href="/blog"
            className={!user ? 'hide-guest-blog-mobile' : ''}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px 5px 6px',
              borderRadius: '99px',
              backgroundColor: 'var(--canvas)',
              border: '1px solid var(--border)',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.backgroundColor = 'var(--surface)';
              e.currentTarget.style.boxShadow = '0 3px 10px rgba(242, 102, 42, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.backgroundColor = 'var(--canvas)';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)';
            }}
            title="Explore Blog & Technical Guides"
          >
            {/* Micro Icon Badge */}
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-soft)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                <path d="M6 6h10" />
                <path d="M6 10h10" />
              </svg>
            </div>

            {/* Label */}
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
              Blog
            </span>
          </Link>

          {user ? (
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px 4px 5px',
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
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '12px',
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
                  {user.full_name?.split(' ')[0] || user.username}
                </span>
                <span style={{ fontSize: '9.5px', color: 'var(--ink-faint)', fontWeight: 600 }}>
                  {role === 'admin' ? 'Admin' : role === 'instructor' ? 'Instructor' : role === 'content_manager' ? 'Content' : 'Student'}
                </span>
              </div>
            </Link>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                href="/login"
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--ink)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)',
                  textDecoration: 'none',
                }}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--primary)',
                  textDecoration: 'none',
                  boxShadow: '0 2px 6px rgba(242, 102, 42, 0.25)',
                }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Ambient Glowing Orbs */}
      <div className="ambient-glow-orb" style={{ top: '60px', left: '8%', width: '380px', height: '380px', background: 'radial-gradient(circle, rgba(242,102,42,0.15) 0%, transparent 70%)' }} />
      <div className="ambient-glow-orb" style={{ top: '120px', right: '8%', width: '340px', height: '340px', background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)', animationDelay: '-4s' }} />

      {/* Floating Interactive Glass Cards around Hero (Desktop / Tablet) */}
      <div className="float-card-1 desktop-floating-badge" style={{ position: 'absolute', left: '3%', top: '220px', padding: '10px 16px', borderRadius: '14px', backgroundColor: 'rgba(255, 255, 255, 0.94)', backdropFilter: 'blur(16px)', boxShadow: '0 16px 35px rgba(242, 102, 42, 0.12)', border: '1px solid rgba(242, 102, 42, 0.25)', zIndex: 2, pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}></span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--ink)' }}>Auto-Graded Quizzes</div>
            <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="live-radar-dot" style={{ width: '6px', height: '6px' }} /> Instant Grading
            </div>
          </div>
        </div>
      </div>

      <div className="float-card-2 desktop-floating-badge" style={{ position: 'absolute', right: '3%', top: '200px', padding: '10px 16px', borderRadius: '14px', backgroundColor: 'rgba(255, 255, 255, 0.94)', backdropFilter: 'blur(16px)', boxShadow: '0 16px 35px rgba(79, 70, 229, 0.12)', border: '1px solid rgba(79, 70, 229, 0.25)', zIndex: 2, pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}></span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--ink)' }}>Real-Time Tracking</div>
            <div style={{ fontSize: '11px', color: 'var(--role-admin)', fontWeight: 700 }}>100% Persisted</div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section
        style={{
          padding: '110px 24px 90px',
          textAlign: 'center',
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <h1
          className="hero-heading"
          style={{
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 800,
            lineHeight: 1.18,
            color: 'var(--ink)',
            letterSpacing: '-0.03em',
            marginBottom: '18px',
            fontFamily: 'var(--font-display)',
          }}
        >
          Mastery through <span className="gradient-text-animated">Structured Learning</span> & <span className="gradient-text-animated">Real-time Progress</span>
        </h1>

        <p
          style={{
            fontSize: '16.5px',
            lineHeight: 1.65,
            color: 'var(--ink-soft)',
            maxWidth: '680px',
            margin: '0 auto 32px',
          }}
        >
          Empower your journey from curious learner to skilled builder. Master in-demand skills step-by-step, track your real-time growth, and turn your potential into tangible achievements.
        </p>

        <div className="hero-cta-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <Link
            href="/courses"
            className="btn-interactive"
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
            className="btn-interactive"
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
          maxWidth: '1180px',
          margin: '40px auto 90px',
          width: '100%',
          padding: '0 24px',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 10px', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Built with 4-Tier Role Security
          </h2>
          <p style={{ fontSize: '14.5px', color: 'var(--ink-soft)', margin: 0, maxWidth: '600px', marginInline: 'auto', lineHeight: 1.6 }}>
            Every API endpoint and interface is strictly protected by backend role policies.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
          }}
        >
          {([
            {
              role: 'student',
              tier: 'Tier 1',
              title: 'Student Learner',
              tagline: 'Personalized Tracks & Live Quizzes',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                  <polyline points="10 2 10 10 13 7 16 10 16 2" />
                </svg>
              ),
              features: [
                'Interactive Video & Text Lessons',
                'Server Auto-Graded Assessments',
                'Real-Time Live Progress Tracking',
              ],
              actionUrl: '/courses',
              actionLabel: 'Browse Courses',
            },
            {
              role: 'instructor',
              tier: 'Tier 2',
              title: 'Course Instructor',
              tagline: 'Curriculum Studio & Evaluations',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              ),
              features: [
                'Multi-Chapter Course Structuring',
                'MCQ Quiz Pool & Answer Keys',
                'Student Performance Analytics',
              ],
              actionUrl: '/instructor/courses',
              actionLabel: 'Open Studio',
            },
            {
              role: 'content_manager',
              tier: 'Tier 3',
              title: 'Content Manager',
              tagline: 'Curriculum & Blog Publications',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              ),
              features: [
                'Platform Article & Guide Authoring',
                'Draft vs Live Mode State Control',
                'Global Curriculum Categorization',
              ],
              actionUrl: '/blog',
              actionLabel: 'Manage Articles',
            },
            {
              role: 'admin',
              tier: 'Tier 4',
              title: 'Administrator',
              tagline: 'Full Governance & Role Controller',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              ),
              features: [
                'Global User Directory & Search',
                'Real-Time Role Demotion/Promotion',
                'Complete RBAC Permission Matrix',
              ],
              actionUrl: '/admin',
              actionLabel: 'Admin Center',
            },
          ] as Array<{
            role: RoleType;
            tier: string;
            title: string;
            tagline: string;
            icon: React.ReactNode;
            features: string[];
            actionUrl: string;
            actionLabel: string;
          }>).map(({ role: r, tier, title, tagline, icon, features, actionUrl, actionLabel }) => {
            const conf = ROLE_DETAILS[r];
            return (
              <div
                key={r}
                className="interactive-card"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderRadius: '20px',
                  border: '1px solid var(--border)',
                  padding: '26px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '20px',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
                  position: 'relative',
                  overflow: 'hidden',
                  background: `radial-gradient(circle at top right, ${conf.softColor} 0%, var(--surface) 65%)`,
                  transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = conf.color;
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = `0 20px 40px -10px ${conf.color}25, 0 1px 3px rgba(0,0,0,0.05)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.03)';
                }}
              >
                {/* Top Decorative Role Accent Stripe */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    backgroundColor: conf.color,
                  }}
                />

                {/* Header: Icon + Tier Badge */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '14px',
                        backgroundColor: conf.softColor,
                        color: conf.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 14px ${conf.color}20`,
                        border: `1px solid ${conf.color}30`,
                      }}
                    >
                      {icon}
                    </div>

                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 800,
                        color: conf.color,
                        backgroundColor: conf.softColor,
                        padding: '4px 10px',
                        borderRadius: '99px',
                        letterSpacing: '0.05em',
                        border: `1px solid ${conf.color}25`,
                      }}
                    >
                      {tier}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 4px', fontFamily: 'var(--font-display)' }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)', margin: '0 0 18px', fontWeight: 500, lineHeight: 1.4 }}>
                    {tagline}
                  </p>

                  {/* Key Capabilities Pills List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {features.map((feat, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '12px',
                          color: 'var(--ink)',
                          fontWeight: 600,
                          lineHeight: 1.3,
                        }}
                      >
                        <span
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            backgroundColor: conf.softColor,
                            color: conf.color,
                            fontSize: '10px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          ✓
                        </span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Footer CTA Link */}
                <div
                  style={{
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(229, 231, 235, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Link
                    href={actionUrl}
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: conf.color,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'gap 0.15s ease',
                    }}
                  >
                    <span>{actionLabel}</span>
                    <span className="action-arrow">→</span>
                  </Link>
                  <span style={{ fontSize: '11px', color: 'var(--ink-faint)', fontWeight: 600 }}>
                    {conf.label}
                  </span>
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
            {courses.slice(0, visibleCourseCount).map((course) => {
              const lessonCount = course.lessons?.length || 0;
              const isEnrolled = enrolledCourseIds.includes(course.documentId) || enrolledCourseIds.includes(String(course.id));
              return (
                <div
                  key={course.id || course.documentId}
                  className="interactive-card"
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
                  {/* Rich Educational Course Banner with Cover Image / Gradient */}
                  <div
                    style={{
                      height: '110px',
                      background: `linear-gradient(135deg, ${course.cover_color || 'var(--primary)'} 0%, #0F172A 100%)`,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {course.cover_image_url && (
                      <img
                        src={course.cover_image_url}
                        alt={course.title}
                        className="card-media"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    )}
                    {/* Overlay badge container */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: course.cover_image_url
                          ? 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.65) 100%)'
                          : 'transparent',
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
                          backgroundColor: 'rgba(0, 0, 0, 0.55)',
                          color: '#FFFFFF',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        {lessonCount} {lessonCount === 1 ? 'Lesson' : 'Lessons'}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>

                    {/* Title linked to Course Slug */}
                    <Link
                      href={`/courses/${course.documentId}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <h3
                        style={{
                          fontSize: '17px',
                          fontWeight: 700,
                          color: 'var(--ink)',
                          margin: '0 0 4px',
                          lineHeight: 1.35,
                          transition: 'color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink)')}
                      >
                        {course.title}
                      </h3>
                    </Link>

                    {/* Description */}
                    <p
                      style={{
                        fontSize: '13px',
                        color: 'var(--ink-soft)',
                        lineHeight: 1.55,
                        margin: '0 0 10px',
                        flex: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {course.description || 'Master key concepts with structured hands-on lessons.'}
                    </p>

                    {/* Progress indicator for enrolled student */}
                    {isEnrolled && (() => {
                      const pct = progressMap[course.documentId] ?? progressMap[String(course.id)] ?? 0;
                      return (
                        <div style={{ backgroundColor: 'var(--canvas)', borderRadius: '8px', padding: '6px 10px', border: '1px solid var(--border-soft)', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                            <span style={{ color: 'var(--ink-soft)' }}>Progress</span>
                            <span style={{ color: pct === 100 ? '#16A34A' : 'var(--primary)' }}>{pct}%</span>
                          </div>
                          <div style={{ height: '4px', backgroundColor: 'var(--border-soft)', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, backgroundColor: pct === 100 ? '#16A34A' : 'var(--primary)', borderRadius: '99px' }} />
                          </div>
                        </div>
                      );
                    })()}

                    {/* Footer Action: Role-Tailored CTA Button */}
                    {(() => {
                      const isManager = role === 'admin' || role === 'content_manager';
                      const isAuthor =
                        role === 'instructor' &&
                        ((course.instructor?.id && course.instructor.id === user?.id) ||
                          (course.instructor?.documentId && course.instructor.documentId === user?.documentId) ||
                          course.co_instructors?.some((ci) => ci.id === user?.id || ci.documentId === user?.documentId));

                      let ctaLabel = 'Enroll Now';
                      let ctaColor = 'var(--primary)';

                      if (isManager) {
                        ctaLabel = 'Manage Course';
                      } else if (role === 'instructor') {
                        ctaLabel = isAuthor ? 'Manage Course' : 'View Course';
                      } else if (isEnrolled) {
                        ctaLabel = 'Continue Learning';
                        ctaColor = '#16A34A';
                      }

                      return (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderTop: '1px solid var(--border-soft)',
                            paddingTop: '12px',
                            marginTop: 'auto',
                          }}
                        >
                          {isEnrolled ? (
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '99px',
                                backgroundColor: 'rgba(22, 163, 74, 0.1)',
                                color: '#16A34A',
                              }}
                            >
                              Enrolled
                            </span>
                          ) : (
                            <div />
                          )}

                          <Link
                            href={`/courses/${course.documentId}`}
                            style={{
                              fontSize: '13px',
                              fontWeight: 700,
                              color: ctaColor,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>{ctaLabel}</span>
                            <span className="action-arrow">→</span>
                          </Link>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>

          {courses.length > visibleCourseCount && (
            <div style={{ textAlign: 'center', marginTop: '36px' }}>
              <button
                onClick={() => setVisibleCourseCount((prev) => prev + 6)}
                className="btn-interactive"
                style={{
                  padding: '12px 28px',
                  borderRadius: '99px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink)',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.color = 'var(--primary)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(242, 102, 42, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--ink)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                }}
              >
                <span>Load More Courses</span>
                <span>↓</span>
              </button>
            </div>
          )}
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
            {latestPosts.slice(0, visiblePostCount).map((post) => (
              <div
                key={post.id}
                className="interactive-card"
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

          {latestPosts.length > visiblePostCount && (
            <div style={{ textAlign: 'center', marginTop: '36px' }}>
              <button
                onClick={() => setVisiblePostCount((prev) => prev + 6)}
                className="btn-interactive"
                style={{
                  padding: '12px 28px',
                  borderRadius: '99px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink)',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.color = 'var(--primary)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(242, 102, 42, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--ink)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                }}
              >
                <span>Load More Articles</span>
                <span>↓</span>
              </button>
            </div>
          )}
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
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Logo size="sm" showBadge={false} href="/" />
          <span style={{ color: 'var(--ink-faint)', fontSize: '12.5px' }}>
            © 2026 PathShala LMS. All rights reserved.
          </span>
        </div>
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

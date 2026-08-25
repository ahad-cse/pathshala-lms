'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth, ROLE_DETAILS } from '@/context/AuthContext';
import { RoleType } from '@/types/auth';

export default function HomePage() {
  const { user, role } = useAuth();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--canvas)', display: 'flex', flexDirection: 'column' }}>
      {/* Header / Navbar */}
      <header
        style={{
          height: '70px',
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 36px',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        {/* Brand */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
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

        {/* Navigation Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link
            href="/courses"
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--ink-soft)',
              padding: '8px 14px',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--canvas)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Explore Courses
          </Link>

          {user ? (
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '13.5px',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(242, 102, 42, 0.3)',
              }}
            >
              Go to Dashboard ({user.username}) →
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
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(242, 102, 42, 0.3)',
                }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '80px 24px 60px',
          textAlign: 'center',
          maxWidth: '860px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 14px',
            borderRadius: '99px',
            backgroundColor: 'var(--primary-soft)',
            color: 'var(--primary)',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '20px',
          }}
        >
          <span>🚀 Modern Full-Stack LMS</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span>Next.js 15 & Strapi v5</span>
        </div>

        <h1
          style={{
            fontSize: '44px',
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

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
          <Link
            href={user ? '/dashboard' : '/login'}
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
            {user ? 'Enter Your Portal →' : 'Get Started Now →'}
          </Link>
          <Link
            href="/courses"
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
            Browse Courses
          </Link>
        </div>
      </section>

      {/* 4-Role Architecture Feature Matrix */}
      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto 60px',
          width: '100%',
          padding: '0 24px',
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
            gap: '18px',
          }}
        >
          {(['student', 'instructor', 'content_manager', 'admin'] as RoleType[]).map((r) => {
            const conf = ROLE_DETAILS[r];
            return (
              <div
                key={r}
                style={{
                  backgroundColor: 'var(--surface)',
                  borderRadius: '14px',
                  border: '1px solid var(--border)',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
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
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '2px 8px',
                    borderRadius: '99px',
                    backgroundColor: conf.softColor,
                    color: conf.color,
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    marginBottom: '12px',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: conf.color,
                    }}
                  />
                  {conf.label}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                  {conf.label} Portal
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.5 }}>
                  {conf.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

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
        }}
      >
        <div>© 2026 PathShala LMS. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Next.js 15 App Router</span>
          <span>•</span>
          <span>Strapi v5 Headless CMS</span>
        </div>
      </footer>
    </div>
  );
}

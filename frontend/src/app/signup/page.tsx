'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const { register, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);
    try {
      await register({ username, email, password });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed. Username or email may already be taken.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--canvas)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--surface)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
          padding: '36px 32px',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '22px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              marginBottom: '12px',
              boxShadow: '0 4px 12px rgba(242, 102, 42, 0.35)',
            }}
          >
            P
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 6px' }}>
            Create Student Account
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: 0 }}>
            Join PathShala to enroll in interactive courses and track your progress
          </p>
        </div>

        {/* Security Rule Notice Banner */}
        <div
          style={{
            backgroundColor: 'var(--role-student-soft)',
            border: '1px solid rgba(225, 29, 72, 0.2)',
            borderRadius: '10px',
            padding: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <span
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: 'var(--role-student)',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px',
            }}
          >
            i
          </span>
          <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)', lineHeight: 1.4 }}>
            <strong style={{ color: 'var(--role-student)' }}>Role Security Policy:</strong> New accounts
            default to <strong>Student</strong> role. Higher roles (Instructor, Content Manager, Admin) are
            granted by Administrators.
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--danger-soft)',
              color: 'var(--danger)',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '12.5px',
              fontWeight: 500,
              marginBottom: '20px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label
              htmlFor="username"
              style={{
                display: 'block',
                fontSize: '12.5px',
                fontWeight: 600,
                color: 'var(--ink)',
                marginBottom: '5px',
              }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. jannat_akter"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                fontSize: '13.5px',
                color: 'var(--ink)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '12.5px',
                fontWeight: 600,
                color: 'var(--ink)',
                marginBottom: '5px',
              }}
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. jannat@example.com"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                fontSize: '13.5px',
                color: 'var(--ink)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '12.5px',
                fontWeight: 600,
                color: 'var(--ink)',
                marginBottom: '5px',
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                fontSize: '13.5px',
                color: 'var(--ink)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              style={{
                display: 'block',
                fontSize: '12.5px',
                fontWeight: 600,
                color: 'var(--ink)',
                marginBottom: '5px',
              }}
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                fontSize: '13.5px',
                color: 'var(--ink)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || isLoading}
            style={{
              marginTop: '8px',
              padding: '11px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              transition: 'background-color 0.15s ease',
              boxShadow: '0 2px 8px rgba(242, 102, 42, 0.3)',
            }}
          >
            {submitting ? 'Creating Account...' : 'Sign Up as Student'}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '13px', color: 'var(--ink-soft)' }}>
          Already have an account?{' '}
          <Link
            href="/login"
            style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

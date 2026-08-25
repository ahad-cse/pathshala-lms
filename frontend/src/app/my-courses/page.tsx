'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppShell from '@/components/AppShell';

export default function MyCoursesPage() {
  return (
    <ProtectedRoute allowedRoles={['student', 'admin']}>
      <AppShell title="My Enrolled Courses" subtitle="Track your active courses, lesson progress, and certificates">
        <div
          style={{
            backgroundColor: 'var(--surface)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎓</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
            My Courses & Progress Tracking
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', maxWidth: '500px', margin: '0 auto 20px' }}>
            Full course enrollment, sequential lesson tracking, and completion percentage will be active in Phase 4 & Phase 6.
          </p>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

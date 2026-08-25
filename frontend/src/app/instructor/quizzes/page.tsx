'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppShell from '@/components/AppShell';

export default function InstructorQuizzesPage() {
  return (
    <ProtectedRoute allowedRoles={['instructor', 'admin']}>
      <AppShell title="Quizzes & Auto-Grading" subtitle="Configure lesson quizzes, passing scores, and evaluation keys">
        <div
          style={{
            backgroundColor: 'var(--surface)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📝</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
            Quiz Management
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', maxWidth: '500px', margin: '0 auto 20px' }}>
            Quiz creation with automated server-side grading will be fully integrated in Phase 7.
          </p>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

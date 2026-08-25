'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppShell from '@/components/AppShell';

export default function InstructorCoursesPage() {
  return (
    <ProtectedRoute allowedRoles={['instructor', 'admin']}>
      <AppShell title="Instructor Course Studio" subtitle="Create and manage your authored courses and lessons">
        <div
          style={{
            backgroundColor: 'var(--surface)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>✍️</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
            Authoring Workspace (Instructor Only)
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', maxWidth: '500px', margin: '0 auto 20px' }}>
            Instructors can only view and edit their own courses per Strapi backend row-level security policies.
          </p>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

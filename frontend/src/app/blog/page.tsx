'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppShell from '@/components/AppShell';

export default function BlogPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'content_manager']}>
      <AppShell title="Blog & Editorial Management" subtitle="Draft, edit, and publish articles with Strapi CMS">
        <div
          style={{
            backgroundColor: 'var(--surface)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📰</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
            Blog Articles & Editorial Desk
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', maxWidth: '500px', margin: '0 auto 20px' }}>
            Draft and publish workflow managed by Content Managers and Admins will be implemented in Phase 9.
          </p>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

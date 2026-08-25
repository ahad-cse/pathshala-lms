'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppShell from '@/components/AppShell';

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AppShell title="Platform Administration" subtitle="Manage users, assign roles, and inspect platform analytics">
        <div
          style={{
            backgroundColor: 'var(--surface)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🛡️</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
            Administrator Control Center
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', maxWidth: '500px', margin: '0 auto 20px' }}>
            Only users with the Admin role can access this portal. User management and platform metrics will be built in Phase 8.
          </p>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

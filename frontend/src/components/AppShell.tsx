'use client';

import React from 'react';
import Topbar from '@/components/Topbar';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--canvas)' }}>
      {/* Top Navbar */}
      <Topbar />

      {/* Main Content Container */}
      <main
        className="app-main"
        style={{
          flex: 1,
          padding: '28px 32px',
          maxWidth: '1240px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </main>
    </div>
  );
}

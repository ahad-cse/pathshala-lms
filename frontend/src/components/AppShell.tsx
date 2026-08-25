'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AppShell({ children, title, subtitle }: AppShellProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--canvas)' }}>
      {/* Role-Driven Sidebar */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar title={title} subtitle={subtitle} />
        
        <main
          style={{
            flex: 1,
            padding: '28px 32px',
            maxWidth: '1200px',
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

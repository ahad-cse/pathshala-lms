'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AppShell({ children, title, subtitle }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--canvas)', position: 'relative' }}>
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 999,
          }}
        />
      )}

      {/* Role-Driven Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Viewport */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar
          title={title}
          subtitle={subtitle}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main
          className="app-main"
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

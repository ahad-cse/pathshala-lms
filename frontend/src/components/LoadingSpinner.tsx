'use client';

import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  minHeight?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  message = 'Loading...',
  size = 36,
  minHeight = '240px',
  fullScreen = false,
}: LoadingSpinnerProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullScreen ? '80vh' : minHeight,
        width: '100%',
        padding: '32px 16px',
        boxSizing: 'border-box',
        gap: '14px',
      }}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'pathshala-spin 0.75s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        }}
      />
      {message && (
        <p
          style={{
            fontSize: '13.5px',
            color: 'var(--ink-soft)',
            fontWeight: 500,
            margin: 0,
            letterSpacing: '0.01em',
          }}
        >
          {message}
        </p>
      )}

      <style jsx>{`
        @keyframes pathshala-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

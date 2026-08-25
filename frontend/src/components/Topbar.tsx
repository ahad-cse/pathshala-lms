'use client';

import React, { useState } from 'react';
import { useAuth, ROLE_DETAILS } from '@/context/AuthContext';
import { RoleType } from '@/types/auth';
import Link from 'next/link';

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export default function Topbar({ title = 'Dashboard', subtitle }: TopbarProps) {
  const { user, role, switchDemoRole, logout } = useAuth();
  const [isSwitching, setIsSwitching] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const currentRole: RoleType = role || 'student';
  const roleConfig = ROLE_DETAILS[currentRole] || ROLE_DETAILS.student;

  const handleQuickSwitch = async (targetRole: RoleType) => {
    if (targetRole === currentRole) {
      setShowRoleMenu(false);
      return;
    }
    setIsSwitching(true);
    setShowRoleMenu(false);
    try {
      await switchDemoRole(targetRole);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Title / Breadcrumb */}
      <div>
        <h1
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--ink)',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: '12px',
              color: 'var(--ink-soft)',
              margin: '2px 0 0',
              lineHeight: 1,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Action Area: Demo Role Switcher & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Quick Demo Switcher Dropdown (Essential for video walkthrough & grading) */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            disabled={isSwitching}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--canvas)',
              border: '1px solid var(--border)',
              color: 'var(--ink)',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Switch Demo Role for testing"
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: roleConfig.color,
              }}
            />
            <span>
              Role: <strong>{roleConfig.label}</strong>
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {/* Role Switcher Menu */}
          {showRoleMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 6px)',
                width: '240px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                padding: '6px',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--ink-faint)',
                  textTransform: 'uppercase',
                  padding: '6px 10px 4px',
                  letterSpacing: '0.04em',
                }}
              >
                Quick Role Switch (Demo)
              </div>

              {(['admin', 'content_manager', 'instructor', 'student'] as RoleType[]).map((r) => {
                const conf = ROLE_DETAILS[r];
                const isSelected = r === currentRole;

                return (
                  <button
                    key={r}
                    onClick={() => handleQuickSwitch(r)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      backgroundColor: isSelected ? conf.softColor : 'transparent',
                      color: isSelected ? conf.color : 'var(--ink)',
                      fontSize: '12.5px',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      border: 'none',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'background-color 0.12s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: conf.color,
                        }}
                      />
                      <span>{conf.label}</span>
                    </div>
                    {isSelected && (
                      <span style={{ fontSize: '11px', fontWeight: 600 }}>Active</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Home / Course link */}
        <Link
          href="/courses"
          style={{
            fontSize: '12.5px',
            color: 'var(--ink-soft)',
            fontWeight: 500,
            textDecoration: 'none',
            padding: '6px 10px',
            borderRadius: '6px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--canvas)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          Catalog
        </Link>
      </div>
    </header>
  );
}

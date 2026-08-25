'use client';

import React, { useState } from 'react';
import { useAuth, ROLE_DETAILS } from '@/context/AuthContext';
import { RoleType } from '@/types/auth';
import Link from 'next/link';

interface TopbarProps {
  title?: string;
  subtitle?: string;
  onToggleSidebar?: () => void;
}

export default function Topbar({ title = 'Dashboard', subtitle, onToggleSidebar }: TopbarProps) {
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
      className="topbar-header"
      style={{
        height: '64px',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* Title / Breadcrumb / Mobile Hamburger Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            aria-label="Open Navigation Menu"
            className="mobile-menu-btn"
            style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: 'var(--canvas)',
              border: '1px solid var(--border)',
              color: 'var(--ink)',
              cursor: 'pointer',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
        )}

        <div>
          <h1
            className="topbar-title"
            style={{
              fontSize: '17px',
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
              className="topbar-subtitle"
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
      </div>

      {/* Action Area: Demo Role Switcher & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Quick Demo Switcher Dropdown */}
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
              fontSize: '12px',
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
                width: '230px',
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
                  textTransform: 'none',
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
                      fontSize: '12px',
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
                      <span style={{ fontSize: '10.5px', fontWeight: 600 }}>Active</span>
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
            fontSize: '12px',
            color: 'var(--ink-soft)',
            fontWeight: 500,
            textDecoration: 'none',
            padding: '6px 10px',
            borderRadius: '6px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--canvas)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          Courses
        </Link>

        {/* User Mini Avatar Pill */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '4px' }}>
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username}
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
              />
            ) : (
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: roleConfig.color,
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {(user.full_name || user.username).charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

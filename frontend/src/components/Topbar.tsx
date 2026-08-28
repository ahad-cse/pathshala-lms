'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth, ROLE_DETAILS, DEMO_CREDENTIALS } from '@/context/AuthContext';
import { RoleType } from '@/types/auth';
import Logo from '@/components/Logo';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutConfirmModal from '@/components/LogoutConfirmModal';

export default function Topbar() {
  const { user, role, switchDemoRole, logout } = useAuth();
  const [isSwitching, setIsSwitching] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const pathname = usePathname();

  const roleMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking anywhere outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setShowRoleMenu(false);
      }
    }

    if (showRoleMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRoleMenu]);

  const currentRole: RoleType = role || 'student';
  const roleConfig = ROLE_DETAILS[currentRole] || ROLE_DETAILS.student;

  // Root home link based on role
  const getHomeHref = (r: RoleType) => {
    switch (r) {
      case 'admin':
        return '/dashboard';
      case 'instructor':
        return '/instructor/courses';
      case 'content_manager':
        return '/courses';
      case 'student':
        return '/my-courses';
      default:
        return '/';
    }
  };

  // Nav links based on role
  const getNavLinks = (r: RoleType) => {
    switch (r) {
      case 'admin':
        return [
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Courses', href: '/courses' },
          { label: 'Blog', href: '/blog' },
        ];
      case 'content_manager':
        return [
          { label: 'Courses', href: '/courses' },
          { label: 'Blog', href: '/blog' },
        ];
      case 'student':
        return [
          { label: 'My Courses', href: '/my-courses' },
          { label: 'Browse Courses', href: '/courses' },
          { label: 'Blog', href: '/blog' },
        ];
      case 'instructor':
        return [
          { label: 'Courses', href: '/instructor/courses' },
          { label: 'Blog', href: '/blog' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks(currentRole);

  // Active link helper matching sub-routes seamlessly
  const isNavLinkActive = (href: string, currentPath: string) => {
    if (currentPath === href) return true;
    if (href === '/blog' && currentPath.startsWith('/blog')) return true;
    if (href === '/dashboard' && currentPath.startsWith('/dashboard')) return true;
    if (href === '/my-courses' && currentPath.startsWith('/my-courses')) return true;
    if (
      (href === '/courses' || href === '/instructor/courses') &&
      (currentPath.startsWith('/courses') || currentPath.startsWith('/instructor/courses'))
    ) {
      return true;
    }
    return false;
  };

  const handleQuickSwitch = async (targetRole: RoleType) => {
    const targetEmail = DEMO_CREDENTIALS[targetRole]?.identifier;
    if (user?.email === targetEmail) {
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
    <>
      <header
        className="topbar-header"
        style={{
          height: '64px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        }}
      >
        {/* Left: Brand Logo & Mobile Menu Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {navLinks.length > 0 && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="topbar-mobile-toggle"
              aria-label="Toggle navigation menu"
              style={{
                padding: '7px',
                borderRadius: '8px',
                backgroundColor: isMobileMenuOpen ? 'var(--primary)' : 'var(--canvas)',
                border: '1px solid var(--border)',
                color: isMobileMenuOpen ? '#FFFFFF' : 'var(--ink)',
                cursor: 'pointer',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              {isMobileMenuOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          )}

          <Logo size={30} badgeText="LMS" href={getHomeHref(currentRole)} />
        </div>

        {/* Center: Desktop Centered Dynamic Nav Links */}
        {navLinks.length > 0 && (
          <nav
            className="topbar-desktop-nav"
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'var(--canvas)',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid var(--border-soft)',
            }}
          >
            {navLinks.map((item) => {
              const isActive = isNavLinkActive(item.href, pathname);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '7px',
                    fontSize: '13px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#FFFFFF' : 'var(--ink-soft)',
                    backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                    boxShadow: isActive ? '0 1px 4px rgba(242, 102, 42, 0.25)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--surface)';
                      e.currentTarget.style.color = 'var(--ink)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--ink-soft)';
                    }
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Action Area: Demo Role Switcher, User Profile & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Quick Demo Switcher Dropdown */}
          <div ref={roleMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              disabled={isSwitching}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
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
              <span className="topbar-role-text">
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
                  width: '220px',
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

          {/* User Card Pill */}
          {user && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 8px 4px 6px',
                backgroundColor: 'var(--canvas)',
                borderRadius: '99px',
                border: '1px solid var(--border-soft)',
              }}
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: roleConfig.color,
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {(user.full_name || user.username || 'U').charAt(0).toUpperCase()}
                </div>
              )}

              <span className="topbar-user-name" style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', paddingRight: '4px' }}>
                {user.full_name || user.username}
              </span>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            style={{
              padding: '7px',
              borderRadius: '8px',
              backgroundColor: 'var(--canvas)',
              border: '1px solid var(--border-soft)',
              color: 'var(--ink-faint)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            title="Sign Out"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--danger)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--ink-faint)';
              e.currentTarget.style.borderColor = 'var(--border-soft)';
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Slide-Down Menu */}
      {isMobileMenuOpen && navLinks.length > 0 && (
        <div
          className="topbar-mobile-menu"
          style={{
            backgroundColor: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            padding: '12px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            position: 'sticky',
            top: '64px',
            zIndex: 39,
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.06)',
          }}
        >
          {navLinks.map((item) => {
            const isActive = isNavLinkActive(item.href, pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--primary)' : 'var(--ink)',
                  backgroundColor: isActive ? 'rgba(242, 102, 42, 0.08)' : 'transparent',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{item.label}</span>
                {isActive && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />}
              </Link>
            );
          })}
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={logout}
        userName={user?.full_name || user?.username}
      />
    </>
  );
}

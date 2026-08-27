'use client';

import React, { useState } from 'react';
import { AdminUser } from '@/types/content';
import { ROLE_DETAILS } from '@/context/AuthContext';
import { RoleType } from '@/types/auth';

interface RoleChangeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (targetUser: AdminUser, newRole: string) => Promise<void>;
  targetUser: AdminUser | null;
  newRole: string | null;
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: 'Full platform governance, user directory management, and system-wide privileges.',
  content_manager: 'Curriculum categorization, blog article authoring, and draft publication controls.',
  instructor: 'Course creation, chapter/lesson authoring, and MCQ quiz pool evaluations.',
  student: 'Standard learner permissions (course enrollment, lesson tracking, and quiz submissions).',
};

export default function RoleChangeConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  targetUser,
  newRole,
}: RoleChangeConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !targetUser || !newRole) return null;

  const currentRoleConf = ROLE_DETAILS[targetUser.role_type as RoleType] || ROLE_DETAILS.student;
  const newRoleConf = ROLE_DETAILS[newRole as RoleType] || ROLE_DETAILS.student;
  const roleDescription = ROLE_DESCRIPTIONS[newRole] || '';

  const isPromotingToAdmin = newRole === 'admin';

  const handleConfirm = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await onConfirm(targetUser, newRole);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update user role.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 150,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="modal-content-animated"
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '20px',
          border: '1px solid var(--border)',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '28px',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--canvas)',
              color: 'var(--ink)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}>
              Confirm Role Change
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)', margin: '2px 0 0' }}>
              Update access permissions for <strong>{targetUser.username}</strong>
            </p>
          </div>
        </div>

        {/* User Card */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: 'var(--canvas)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: currentRoleConf.color,
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {targetUser.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>
                {targetUser.username}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--ink-faint)' }}>
                {targetUser.email}
              </div>
            </div>
          </div>
        </div>

        {/* Visual Role Transition */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            padding: '14px',
            borderRadius: '12px',
            backgroundColor: 'var(--canvas)',
            border: '1px solid var(--border)',
            marginBottom: '16px',
          }}
        >
          {/* Current Role */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--ink-faint)', fontWeight: 600, marginBottom: '4px' }}>
              Current Role
            </div>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '99px',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: currentRoleConf.softColor,
                color: currentRoleConf.color,
                border: `1px solid ${currentRoleConf.color}30`,
              }}
            >
              {currentRoleConf.label}
            </span>
          </div>

          <div style={{ color: 'var(--ink-faint)', fontSize: '16px', fontWeight: 700 }}>
            ➔
          </div>

          {/* New Role */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--ink-faint)', fontWeight: 600, marginBottom: '4px' }}>
              New Role
            </div>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '99px',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: newRoleConf.softColor,
                color: newRoleConf.color,
                border: `1px solid ${newRoleConf.color}30`,
              }}
            >
              {newRoleConf.label}
            </span>
          </div>
        </div>

        {/* Role Impact Note */}
        <div
          style={{
            fontSize: '12.5px',
            color: 'var(--ink-soft)',
            lineHeight: 1.5,
            padding: '12px',
            borderRadius: '10px',
            backgroundColor: 'var(--canvas)',
            marginBottom: isPromotingToAdmin ? '12px' : '20px',
          }}
        >
          <strong>Permissions granted:</strong> {roleDescription}
        </div>

        {/* Security Warning if promoting to Admin */}
        {isPromotingToAdmin && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: 'var(--danger)',
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: 1.4,
              marginBottom: '20px',
            }}
          >
            Granting <strong>Administrator</strong> privileges allows full governance over all courses, users, and platform settings.
          </div>
        )}

        {/* Error message if any */}
        {errorMsg && (
          <div
            style={{
              backgroundColor: 'var(--danger-soft)',
              color: 'var(--danger)',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '12.5px',
              fontWeight: 500,
              marginBottom: '16px',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--ink-soft)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            style={{
              padding: '10px 22px',
              borderRadius: '8px',
              backgroundColor: newRoleConf.color,
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '13px',
              border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              boxShadow: `0 4px 14px ${newRoleConf.softColor}`,
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading ? 'Updating Role...' : `Confirm & Update to ${newRoleConf.label}`}
          </button>
        </div>
      </div>
    </div>
  );
}

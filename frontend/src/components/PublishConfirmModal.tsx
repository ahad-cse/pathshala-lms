'use client';

import React, { useState } from 'react';

interface PublishConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  articleTitle: string;
  isPublishing: boolean; // true = publish, false = unpublish (draft)
}

export default function PublishConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  articleTitle,
  isPublishing,
}: PublishConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || `Failed to ${isPublishing ? 'publish' : 'unpublish'} article.`);
    } finally {
      setLoading(false);
    }
  };

  const accentColor = isPublishing ? 'var(--success)' : 'var(--warning)';
  const accentBg = isPublishing ? 'var(--success-soft)' : 'var(--warning-soft)';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 120,
        padding: '20px',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="modal-content-animated"
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '18px',
          border: '1px solid var(--border)',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '28px',
          position: 'relative',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Color Accent Stripe */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: accentColor,
          }}
        />

        {/* Icon Header */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: accentBg,
            color: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '18px',
          }}
        >
          {isPublishing ? (
            /* Publish / Live Icon */
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          ) : (
            /* Unpublish / Draft Lock Icon */
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
        </div>

        {/* Modal Title */}
        <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px', fontFamily: 'var(--font-display)' }}>
          {title}
        </h3>

        {/* Target Article Highlight Pill */}
        <div
          style={{
            backgroundColor: 'var(--canvas)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '10px 14px',
            margin: '12px 0 16px',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--ink)',
            lineHeight: 1.4,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '15px' }}>📰</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {articleTitle}
          </span>
        </div>

        {/* Explanatory Message */}
        <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: '0 0 24px', lineHeight: 1.55 }}>
          {isPublishing
            ? 'Publishing this article will make it instantly accessible to all students, readers, and public visitors across the platform.'
            : 'Unpublishing this article will move it into Draft Mode. It will no longer be visible to students or the public until republished.'}
        </p>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              backgroundColor: 'var(--danger-soft)',
              color: 'var(--danger)',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '12.5px',
              fontWeight: 600,
              marginBottom: '18px',
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
              padding: '10px 18px',
              borderRadius: '9px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--ink-soft)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s ease',
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
              borderRadius: '9px',
              backgroundColor: accentColor,
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '13px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: isPublishing
                ? '0 2px 10px rgba(16, 185, 129, 0.3)'
                : '0 2px 10px rgba(245, 158, 11, 0.3)',
              opacity: loading ? 0.7 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {loading ? (
              <span>Processing...</span>
            ) : isPublishing ? (
              <>
                <span>Publish Now</span>
                <span>→</span>
              </>
            ) : (
              <>
                <span>Move to Drafts</span>
                <span>🔒</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

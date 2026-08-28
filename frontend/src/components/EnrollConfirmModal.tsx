'use client';

import React, { useState } from 'react';

interface EnrollConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  courseTitle: string;
  courseCategory?: string;
  lessonCount?: number;
  quizCount?: number;
  actionContext?: 'course' | 'quiz';
}

export default function EnrollConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  courseTitle,
  courseCategory,
  lessonCount,
  quizCount,
  actionContext = 'course',
}: EnrollConfirmModalProps) {
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
      setErrorMsg(err?.message || 'Failed to enroll.');
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
            backgroundColor: 'var(--primary)',
          }}
        />

        {/* Icon Header */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: 'rgba(242, 102, 42, 0.1)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '18px',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>

        {/* Modal Title */}
        <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px', fontFamily: 'var(--font-display)' }}>
          {actionContext === 'quiz' ? 'Unlock Quiz Assessment' : 'Confirm Enrollment'}
        </h3>

        {/* Course Target Card */}
        <div
          style={{
            backgroundColor: 'var(--canvas)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '14px',
            margin: '12px 0 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {courseCategory && (
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                color: 'var(--primary)',
                textTransform: 'none',
                letterSpacing: '0.04em',
              }}
            >
              {courseCategory}
            </span>
          )}
          <div style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.3 }}>
            {courseTitle}
          </div>
          {(lessonCount !== undefined || quizCount !== undefined) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--ink-faint)', marginTop: '2px' }}>
              {lessonCount !== undefined && <span>{lessonCount} Lessons</span>}
              {lessonCount !== undefined && quizCount !== undefined && <span>•</span>}
              {quizCount !== undefined && <span>{quizCount} Quizzes</span>}
            </div>
          )}
        </div>

        {/* Explanatory Message */}
        <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: '0 0 20px', lineHeight: 1.5 }}>
          {actionContext === 'quiz'
            ? 'Enrolling in this course grants you immediate access to its full curriculum, interactive MCQ assessments, and instant server auto-grading.'
            : 'Enrolling will add this to your learning track, unlock all video lectures, and track your completion progress in real-time.'}
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
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '13px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 10px rgba(242, 102, 42, 0.3)',
              opacity: loading ? 0.7 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {loading ? 'Enrolling...' : 'Confirm Enrollment →'}
          </button>
        </div>
      </div>
    </div>
  );
}

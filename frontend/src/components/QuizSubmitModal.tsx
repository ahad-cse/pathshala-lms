'use client';

import React, { useState } from 'react';

interface QuizSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  quizTitle: string;
  totalQuestions: number;
  answeredCount: number;
  passingScore: number;
}

export default function QuizSubmitModal({
  isOpen,
  onClose,
  onConfirm,
  quizTitle,
  totalQuestions,
  answeredCount,
  passingScore,
}: QuizSubmitModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const unansweredCount = totalQuestions - answeredCount;
  const isAllAnswered = unansweredCount === 0;

  const handleConfirm = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.68)',
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
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '18px',
          border: '1px solid var(--border)',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '28px',
          position: 'relative',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Role Accent Stripe */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: isAllAnswered ? 'var(--primary)' : 'var(--warning)',
          }}
        />

        {/* Icon Header */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: isAllAnswered ? 'var(--primary-soft)' : 'var(--warning-soft)',
            color: isAllAnswered ? 'var(--primary)' : 'var(--warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>

        {/* Modal Title */}
        <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 6px', fontFamily: 'var(--font-display)' }}>
          Submit Quiz for Evaluation?
        </h3>

        {/* Quiz Title Banner */}
        <div
          style={{
            backgroundColor: 'var(--canvas)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '10px 14px',
            margin: '10px 0 16px',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--ink)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '15px' }}>📝</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {quizTitle}
          </span>
        </div>

        {/* Answered Progress Metrics Card */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              backgroundColor: isAllAnswered ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
              border: `1px solid ${isAllAnswered ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', letterSpacing: '0.04em' }}>
              Answered
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: isAllAnswered ? 'var(--success)' : 'var(--warning)', marginTop: '2px' }}>
              {answeredCount} / {totalQuestions}
            </div>
          </div>

          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              backgroundColor: 'var(--canvas)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', letterSpacing: '0.04em' }}>
              Pass Threshold
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', marginTop: '2px' }}>
              {passingScore}%
            </div>
          </div>
        </div>

        {/* Warning if unanswered */}
        {!isAllAnswered && (
          <div
            style={{
              backgroundColor: 'var(--warning-soft)',
              color: 'var(--warning)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '12.5px',
              fontWeight: 600,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              lineHeight: 1.45,
            }}
          >
            <span>⚠️</span>
            <span>
              You have <strong>{unansweredCount}</strong> unanswered question(s). Unanswered questions will be scored as 0 points.
            </span>
          </div>
        )}

        <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: '0 0 20px', lineHeight: 1.5 }}>
          Once submitted, your responses are verified server-side. You will receive your instant score breakdown and explanations.
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
            disabled={submitting}
            style={{
              padding: '10px 18px',
              borderRadius: '9px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--ink-soft)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            Review Answers
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            style={{
              padding: '10px 22px',
              borderRadius: '9px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '13px',
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 10px rgba(242, 102, 42, 0.3)',
              opacity: submitting ? 0.7 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {submitting ? (
              <span>Grading Answers...</span>
            ) : (
              <>
                <span>Confirm & Submit</span>
                <span>→</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Quiz, QuizFormData, QuizQuestion } from '@/types/content';
import { quizApi } from '@/lib/api';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  courseDocumentId: string;
  courseTitle: string;
  quiz?: Quiz | null;
}

export default function QuizModal({
  isOpen,
  onClose,
  onSuccess,
  courseDocumentId,
  courseTitle,
  quiz,
}: QuizModalProps) {
  const [formData, setFormData] = useState<QuizFormData>({
    title: '',
    description: '',
    passing_score: 70,
    course: courseDocumentId,
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correct_option_index: 0,
        explanation: '',
      },
    ],
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title || '',
        description: quiz.description || '',
        passing_score: quiz.passing_score || 70,
        course: courseDocumentId,
        questions: quiz.questions && quiz.questions.length > 0 ? quiz.questions : [
          {
            question: '',
            options: ['', '', '', ''],
            correct_option_index: 0,
            explanation: '',
          },
        ],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        passing_score: 70,
        course: courseDocumentId,
        questions: [
          {
            question: '',
            options: ['', '', '', ''],
            correct_option_index: 0,
            explanation: '',
          },
        ],
      });
    }
    setErrorMsg(null);
  }, [quiz, courseDocumentId, isOpen]);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correct_option_index: 0,
          explanation: '',
        },
      ],
    });
  };

  const handleRemoveQuestion = (idx: number) => {
    if (formData.questions.length <= 1) {
      setErrorMsg('A quiz must contain at least 1 question.');
      return;
    }
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== idx),
    });
  };

  const handleQuestionChange = (idx: number, field: keyof QuizQuestion, value: any) => {
    const updated = [...formData.questions];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormData({ ...formData, questions: updated });
  };

  const handleOptionChange = (qIdx: number, optIdx: number, value: string) => {
    const updated = [...formData.questions];
    const updatedOptions = [...updated[qIdx].options];
    updatedOptions[optIdx] = value;
    updated[qIdx] = { ...updated[qIdx], options: updatedOptions };
    setFormData({ ...formData, questions: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMsg('Please enter a quiz title.');
      return;
    }

    // Validate questions
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.question.trim()) {
        setErrorMsg(`Please enter text for Question ${i + 1}.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setErrorMsg(`Please fill in Option ${String.fromCharCode(65 + j)} for Question ${i + 1}.`);
          return;
        }
      }
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      if (quiz) {
        await quizApi.update(quiz.documentId, {
          ...formData,
          course: courseDocumentId,
        });
      } else {
        await quizApi.create({
          ...formData,
          course: courseDocumentId,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save quiz.');
    } finally {
      setSubmitting(false);
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
        zIndex: 140,
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
          maxWidth: '720px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--canvas)',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--role-instructor)', marginBottom: '2px', textTransform: 'none' }}>
              Course Assessment: {courseTitle}
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
              {quiz ? 'Edit Course Assessment Quiz' : 'Create Course Assessment Quiz'}
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--ink-soft)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body / Scrollable Form */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {errorMsg && (
            <div
              style={{
                backgroundColor: 'var(--danger-soft)',
                color: 'var(--danger)',
                border: '1px solid rgba(220, 38, 38, 0.2)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '12.5px',
                fontWeight: 600,
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Title & Passing Score */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)', marginBottom: '5px' }}>
                Quiz Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Next.js 15 & TypeScript Mastery Quiz"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--canvas)',
                  fontSize: '13px',
                  color: 'var(--ink)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)', marginBottom: '5px' }}>
                Passing Score (%) *
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={formData.passing_score}
                onChange={(e) => setFormData({ ...formData, passing_score: Number(e.target.value) })}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--canvas)',
                  fontSize: '13px',
                  color: 'var(--ink)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)', marginBottom: '5px' }}>
              Instructions / Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide context or guidance for students taking this final assessment."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--canvas)',
                fontSize: '13px',
                color: 'var(--ink)',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Questions Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
              Question Pool ({formData.questions.length})
            </h4>

            <button
              type="button"
              onClick={handleAddQuestion}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: 'var(--role-instructor-soft)',
                color: 'var(--role-instructor)',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              + Add Question
            </button>
          </div>

          {/* Questions List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {formData.questions.map((q, qIdx) => (
              <div
                key={qIdx}
                style={{
                  backgroundColor: 'var(--canvas)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--role-instructor)',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {qIdx + 1}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
                      Question {qIdx + 1}
                    </span>
                  </div>

                  {formData.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      title="Remove Question"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Question Input */}
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)}
                  placeholder="Enter the question text..."
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface)',
                    fontSize: '13px',
                    color: 'var(--ink)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />

                {/* 4 Options Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                  {q.options.map((opt, optIdx) => {
                    const isCorrect = q.correct_option_index === optIdx;

                    return (
                      <div
                        key={optIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: 'var(--surface)',
                          border: isCorrect ? '1.5px solid #16A34A' : '1px solid var(--border-soft)',
                          borderRadius: '8px',
                          padding: '6px 10px',
                        }}
                      >
                        <input
                          type="radio"
                          name={`correct_opt_${qIdx}`}
                          checked={isCorrect}
                          onChange={() => handleQuestionChange(qIdx, 'correct_option_index', optIdx)}
                          title="Set as correct answer"
                          style={{ accentColor: '#16A34A', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '11px', fontWeight: 700, color: isCorrect ? '#16A34A' : 'var(--ink-faint)', minWidth: '14px' }}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                          required
                          style={{
                            flex: 1,
                            padding: '4px 6px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            fontSize: '12.5px',
                            color: 'var(--ink)',
                            outline: 'none',
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div>
                  <input
                    type="text"
                    value={q.explanation || ''}
                    onChange={(e) => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                    placeholder="Explanation (shown to students after grading)..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px dashed var(--border)',
                      backgroundColor: 'var(--surface)',
                      fontSize: '12px',
                      color: 'var(--ink)',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Modal Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
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
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 22px',
                borderRadius: '8px',
                backgroundColor: 'var(--role-instructor)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '13px',
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(180, 83, 9, 0.3)',
                opacity: submitting ? 0.75 : 1,
              }}
            >
              {submitting ? 'Saving Quiz...' : (quiz ? 'Save Quiz Changes' : 'Attach Quiz to Course')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

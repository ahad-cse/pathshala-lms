'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { quizApi } from '@/lib/api';
import { Quiz, QuizEvaluationResult } from '@/types/content';
import Link from 'next/link';
import QuizSubmitModal from '@/components/QuizSubmitModal';

interface PageProps {
  params: Promise<{
    courseId: string;
    quizId: string;
  }>;
}

export default function StudentQuizPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { courseId, quizId } = resolvedParams;
  const { user, role, switchDemoRole } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizEvaluationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const loadQuiz = useCallback(async () => {
    try {
      setLoading(true);
      const res = await quizApi.getOne(quizId);
      setQuiz(res.data);
    } catch (err) {
      console.error('Failed to load quiz:', err);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (result) return; // Prevent change after grading
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitModalOpen(true);
  };

  const handleConfirmSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const res = await quizApi.submit(quizId, selectedAnswers);
      setResult(res.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const questions = quiz?.questions || [];
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <ProtectedRoute>
      <AppShell
        title={quiz?.title || 'Course Assessment Quiz'}
        subtitle={`Interactive MCQ Assessment with Server-Side Auto-Grading`}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Breadcrumb Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link
              href="/my-courses"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--primary)',
                textDecoration: 'none',
              }}
            >
              ← Back to My Courses
            </Link>

            {quiz?.passing_score && (
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '99px',
                  backgroundColor: 'var(--warning-soft)',
                  color: 'var(--warning)',
                }}
              >
                Passing Requirement: {quiz.passing_score}%
              </span>
            )}
          </div>

          {/* Author Preview Mode Banner */}
          {user?.role_type && user.role_type !== 'student' && (
            <div
              style={{
                backgroundColor: 'var(--role-instructor-soft)',
                color: 'var(--role-instructor)',
                border: '1px solid rgba(180, 83, 9, 0.25)',
                borderRadius: '10px',
                padding: '12px 18px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <span>🔍 <strong>Author Preview Mode ({user.role_type.replace('_', ' ').toUpperCase()})</strong>: You are previewing and testing the interactive student quiz flow.</span>
              <Link href="/instructor/quizzes" style={{ color: 'var(--role-instructor)', fontWeight: 700, textDecoration: 'underline' }}>
                ← Return to Quiz Studio
              </Link>
            </div>
          )}

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--ink-faint)', fontSize: '14px' }}>
              Loading assessment questions...
            </div>
          ) : !quiz ? (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--surface)', borderRadius: '14px' }}>
              <h3>Quiz Not Found</h3>
              <Link href="/my-courses" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                Return to My Courses
              </Link>
            </div>
          ) : result ? (
            /* Instant Server-Side Graded Results Card */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                style={{
                  backgroundColor: 'var(--surface)',
                  borderRadius: '16px',
                  border: `1.5px solid ${result.passed ? 'var(--success)' : 'var(--danger)'}`,
                  padding: '32px',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    fontSize: '48px',
                    marginBottom: '8px',
                  }}
                >
                  {result.passed ? '🎉' : '📚'}
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 6px' }}>
                  {result.passed ? 'Congratulations! You Passed!' : 'Assessment Incomplete'}
                </h2>

                <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: '0 0 20px' }}>
                  {result.passed
                    ? `Great job! You achieved ${result.score}%, exceeding the ${result.passingScore}% passing threshold.`
                    : `You scored ${result.score}%. The passing threshold is ${result.passingScore}%. Review the explanations below and try again.`}
                </p>

                {/* Score Pill */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    backgroundColor: result.passed ? 'var(--success-soft)' : 'rgba(239, 68, 68, 0.1)',
                    color: result.passed ? 'var(--success)' : 'var(--danger)',
                    fontWeight: 800,
                    fontSize: '18px',
                    marginBottom: '24px',
                  }}
                >
                  <span>Score: {result.score}%</span>
                  <span>•</span>
                  <span>
                    {result.correctCount} of {result.totalQuestions} Correct
                  </span>
                </div>

                {/* Action CTA */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button
                    onClick={handleRetake}
                    style={{
                      padding: '11px 22px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--primary)',
                      color: '#FFFFFF',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: 'none',
                      boxShadow: '0 2px 6px rgba(242, 102, 42, 0.3)',
                    }}
                  >
                    🔄 Retake Assessment
                  </button>

                  <Link
                    href="/my-courses"
                    style={{
                      padding: '11px 22px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--canvas)',
                      border: '1px solid var(--border)',
                      color: 'var(--ink)',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    Back to My Courses
                  </Link>
                </div>
              </div>

              {/* Detailed Breakdown with Explanations */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--ink)', margin: '8px 0 0' }}>
                  Question Evaluation & Explanations ({result.correctCount}/{result.totalQuestions} Correct)
                </h3>

                {result.breakdown.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderRadius: '14px',
                      border: `1px solid ${item.isCorrect ? 'rgba(22, 163, 74, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      padding: '20px 24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-faint)' }}>
                        Question {idx + 1}
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: item.isCorrect ? 'var(--success-soft)' : 'rgba(239, 68, 68, 0.1)',
                          color: item.isCorrect ? 'var(--success)' : 'var(--danger)',
                        }}
                      >
                        {item.isCorrect ? '✓ Correct' : '✕ Incorrect'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                      {item.question}
                    </h4>

                    {/* Options list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {item.options.map((opt, optIdx) => {
                        const isStudentPick = item.submittedAnswer === optIdx;
                        const isCorrectAnswer = item.correctAnswer === optIdx;

                        let optBg = 'var(--canvas)';
                        let optBorder = 'var(--border-soft)';
                        let optColor = 'var(--ink)';

                        if (isCorrectAnswer) {
                          optBg = 'var(--success-soft)';
                          optBorder = 'var(--success)';
                          optColor = 'var(--success)';
                        } else if (isStudentPick && !item.isCorrect) {
                          optBg = 'rgba(239, 68, 68, 0.08)';
                          optBorder = 'var(--danger)';
                          optColor = 'var(--danger)';
                        }

                        return (
                          <div
                            key={optIdx}
                            style={{
                              padding: '10px 14px',
                              borderRadius: '8px',
                              backgroundColor: optBg,
                              border: `1px solid ${optBorder}`,
                              fontSize: '13px',
                              fontWeight: isStudentPick || isCorrectAnswer ? 600 : 400,
                              color: optColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span>{opt}</span>
                            {isCorrectAnswer && <span style={{ fontSize: '11px', fontWeight: 700 }}>✓ Correct Answer</span>}
                            {isStudentPick && !item.isCorrect && <span style={{ fontSize: '11px', fontWeight: 700 }}>Your Pick</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {item.explanation && (
                      <div
                        style={{
                          backgroundColor: 'var(--canvas)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          fontSize: '12.5px',
                          color: 'var(--ink-soft)',
                          lineHeight: 1.4,
                          borderLeft: '3px solid var(--primary)',
                        }}
                      >
                        <strong>Explanation:</strong> {item.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Taking Quiz Form */
            <form onSubmit={handleSubmitQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Quiz Overview Card */}
              <div
                style={{
                  backgroundColor: 'var(--surface)',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  padding: '24px 28px',
                }}
              >
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 6px' }}>
                  {quiz.title}
                </h2>
                <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: '0 0 16px', lineHeight: 1.5 }}>
                  {quiz.description || 'Answer all questions below and submit for instant server-side auto-grading.'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--ink-faint)' }}>
                  <span>{questions.length} Multiple Choice Questions</span>
                  <span style={{ fontWeight: 700, color: 'var(--ink)' }}>
                    Progress: {answeredCount} of {questions.length} answered
                  </span>
                </div>
              </div>

              {/* Questions List */}
              {questions.map((q, qIdx) => {
                const selectedOption = selectedAnswers[qIdx];

                return (
                  <div
                    key={qIdx}
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderRadius: '16px',
                      border: '1px solid var(--border)',
                      padding: '24px 28px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          backgroundColor: selectedOption !== undefined ? 'var(--role-student)' : 'var(--border-soft)',
                          color: selectedOption !== undefined ? '#FFFFFF' : 'var(--ink)',
                          fontSize: '11px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {qIdx + 1}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'none' }}>
                        Question {qIdx + 1}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', margin: 0, lineHeight: 1.4 }}>
                      {q.question}
                    </h3>

                    {/* Radio Options Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedOption === optIdx;

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(qIdx, optIdx)}
                            style={{
                              padding: '12px 16px',
                              borderRadius: '10px',
                              backgroundColor: isSelected ? 'var(--role-student-soft)' : 'var(--canvas)',
                              border: isSelected ? '1.5px solid var(--role-student)' : '1px solid var(--border)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              transition: 'all 0.12s ease',
                            }}
                          >
                            <span
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                border: isSelected ? '5px solid var(--role-student)' : '2px solid var(--border)',
                                backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                                flexShrink: 0,
                              }}
                            />
                            <span style={{ fontSize: '13.5px', fontWeight: isSelected ? 600 : 400, color: isSelected ? 'var(--role-student)' : 'var(--ink)' }}>
                              {opt}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Submit Action Card */}
              <div
                style={{
                  backgroundColor: 'var(--surface)',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  padding: '20px 28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
                  Ready to evaluate? Score will be graded instantly server-side.
                </div>

                {(role || user?.role_type) === 'student' ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsSubmitModalOpen(true);
                    }}
                    disabled={submitting}
                    style={{
                      padding: '12px 28px',
                      borderRadius: '9px',
                      backgroundColor: 'var(--primary)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 800,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? 0.7 : 1,
                      border: 'none',
                      boxShadow: '0 2px 8px rgba(242, 102, 42, 0.3)',
                    }}
                  >
                    {submitting ? 'Auto-Grading Answers...' : 'Submit Quiz for Evaluation →'}
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: 'var(--ink-faint)', fontWeight: 600 }}>
                      🔒 Preview Mode ({role?.toUpperCase() || 'AUTHOR'}):
                    </span>
                    <button
                      type="button"
                      onClick={() => switchDemoRole('student')}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--primary)',
                        color: '#FFFFFF',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(242, 102, 42, 0.25)',
                      }}
                    >
                      Switch to Student Mode to Submit 🎓
                    </button>
                  </div>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Beautiful Confirmation Modal for Quiz Submission */}
        {quiz && (
          <QuizSubmitModal
            isOpen={isSubmitModalOpen}
            onClose={() => setIsSubmitModalOpen(false)}
            onConfirm={handleConfirmSubmitQuiz}
            quizTitle={quiz.title}
            totalQuestions={questions.length}
            answeredCount={answeredCount}
            passingScore={quiz.passing_score || 70}
          />
        )}
      </AppShell>
    </ProtectedRoute>
  );
}

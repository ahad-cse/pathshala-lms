'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import QuizSubmitModal from '@/components/QuizSubmitModal';
import EnrollConfirmModal from '@/components/EnrollConfirmModal';
import { useAuth } from '@/context/AuthContext';
import { quizApi, courseApi, progressApi, enrollmentApi, quizSubmissionApi } from '@/lib/api';
import { Quiz, QuizEvaluationResult, Course, Lesson, QuizSubmission } from '@/types/content';
import confetti from 'canvas-confetti';

interface PageProps {
  params: Promise<{
    courseId: string;
    quizId: string;
  }>;
}

export default function CourseQuizPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { courseId, quizId } = resolvedParams;
  const { user, role } = useAuth();

  const isStudent = (role || user?.role_type) === 'student';

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<{
    percentage: number;
    completedLessons: number;
    totalLessons: number;
    completedLessonIds: string[];
  } | null>(null);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizEvaluationResult | null>(null);
  const [previousSubmission, setPreviousSubmission] = useState<QuizSubmission | null>(null);
  const [isRetaking, setIsRetaking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Enrollment guard
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [quizRes, courseRes, enrollRes, progRes, subRes] = await Promise.all([
        quizApi.getOne(quizId),
        courseId ? courseApi.getOne(courseId).catch(() => null) : Promise.resolve(null),
        isStudent ? enrollmentApi.getMyEnrollments().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        isStudent && courseId ? progressApi.getCourseProgress(courseId).catch(() => null) : Promise.resolve(null),
        isStudent ? quizSubmissionApi.getAll().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      ]);

      const fetchedQuiz = quizRes.data;
      setQuiz(fetchedQuiz);

      if (courseRes?.data) {
        setCourse(courseRes.data);
      }

      if (isStudent) {
        const enrolled = (enrollRes.data || []).some((e: any) => {
          const eCourse = e.course;
          return eCourse?.documentId === courseId || String(eCourse?.id) === courseId;
        });
        setIsEnrolled(enrolled);

        if (progRes?.data) {
          setProgress(progRes.data);
        }

        // Check for previous submissions for this student on this quiz
        const userSubs: QuizSubmission[] = (subRes.data || []).filter((s: any) => {
          const q = s.quiz;
          return q?.documentId === quizId || String(q?.id) === quizId || String(q) === quizId;
        });

        if (userSubs.length > 0) {
          // Sort by submitted_at desc to get most recent
          userSubs.sort((a, b) => new Date(b.submitted_at || 0).getTime() - new Date(a.submitted_at || 0).getTime());
          const latestSub = userSubs[0];
          setPreviousSubmission(latestSub);

          // Build evaluation result from saved submission & quiz questions
          const questions = fetchedQuiz?.questions || [];
          const savedAnswers: Record<string | number, number> = latestSub.answers || {};

          let correctCount = 0;
          const breakdown = questions.map((q, idx) => {
            const submittedAnswer = savedAnswers[idx] !== undefined ? Number(savedAnswers[idx]) : null;
            const correctAnswer = Number(q.correct_option_index);
            const isCorrect = submittedAnswer !== null && submittedAnswer === correctAnswer;
            if (isCorrect) correctCount++;

            return {
              questionIndex: idx,
              question: q.question,
              options: q.options,
              submittedAnswer,
              correctAnswer,
              isCorrect,
              explanation: q.explanation || '',
            };
          });

          setResult({
            submissionId: latestSub.documentId || String(latestSub.id),
            quizId,
            quizTitle: fetchedQuiz.title,
            score: latestSub.score,
            passingScore: fetchedQuiz.passing_score || 70,
            passed: latestSub.passed,
            totalQuestions: questions.length,
            correctCount,
            breakdown,
            submittedAt: latestSub.submitted_at,
          });

          // Preload previous answers in state
          setSelectedAnswers(savedAnswers as Record<number, number>);
        }
      } else {
        setIsEnrolled(true);
      }
    } catch (err) {
      console.error('Failed to load quiz & course data:', err);
    } finally {
      setLoading(false);
    }
  }, [quizId, courseId, isStudent]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (result && !isRetaking) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleConfirmSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const res = await quizApi.submit(quizId, selectedAnswers);
      setResult(res.data);
      setIsRetaking(false);

      if (res.data?.passed) {
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#F2662A', '#16A34A', '#4F46E5', '#E11D48', '#FFD700'],
          });
        } catch (e) {}
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmEnroll = async () => {
    if (!courseId) return;
    await enrollmentApi.enroll(courseId);
    setIsEnrolled(true);
    loadData();
  };

  const handleStartRetake = () => {
    setIsRetaking(true);
    setResult(null);
    setSelectedAnswers({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sortedLessons: Lesson[] = (course?.lessons || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  const courseQuizzes: Quiz[] = course?.quizzes || (quiz ? [quiz] : []);
  const questions = quiz?.questions || [];
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <ProtectedRoute>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--canvas)' }}>
        {/* Mobile Backdrop for Course Drawer */}
        {isSidebarOpen && (
          <div
            className="mobile-backdrop"
            onClick={() => setIsSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(4px)',
              zIndex: 999,
            }}
          />
        )}

        {/* Left Course Curriculum Drawer Sidebar */}
        <aside
          className="lesson-sidebar"
          style={{
            width: isSidebarOpen ? '320px' : '0',
            transition: 'width 0.2s ease',
            overflow: 'hidden',
            backgroundColor: 'var(--surface)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: 0,
            height: '100vh',
            flexShrink: 0,
            zIndex: 30,
          }}
        >
          {/* Header & Course Progress Summary */}
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-soft)' }}>
            <Link
              href={`/courses/${courseId}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: 'var(--primary)',
                textDecoration: 'none',
                marginBottom: '10px',
              }}
            >
              ← Back to Course Page
            </Link>

            <h2
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: 'var(--ink)',
                margin: '0 0 6px',
                lineHeight: 1.3,
              }}
            >
              {course?.title || 'Course Curriculum'}
            </h2>

            {/* Progress Bar for enrolled students */}
            {isStudent && isEnrolled && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 700, color: 'var(--ink-soft)', marginBottom: '4px' }}>
                  <span>Lesson Progress</span>
                  <span style={{ color: 'var(--primary)' }}>{progress?.percentage || 0}%</span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--border-soft)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${progress?.percentage || 0}%`,
                      backgroundColor: 'var(--primary)',
                      borderRadius: '99px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--ink-faint)', marginTop: '4px' }}>
                  {progress?.completedLessons || 0} of {sortedLessons.length} lessons completed
                </div>
              </div>
            )}
          </div>

          {/* Lessons Playlist in Sidebar */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'none', marginBottom: '8px', paddingLeft: '8px' }}>
              Video Lessons ({sortedLessons.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {sortedLessons.map((lesson, idx) => {
                const isCompleted = progress?.completedLessonIds?.includes(lesson.documentId);

                return (
                  <Link
                    key={lesson.documentId}
                    href={`/courses/${courseId}/lessons/${lesson.documentId}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'transparent',
                      color: 'var(--ink)',
                      textDecoration: 'none',
                      transition: 'background-color 0.12s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--canvas)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '6px',
                        backgroundColor: isCompleted ? '#16A34A' : 'var(--border-soft)',
                        color: isCompleted ? '#FFFFFF' : 'var(--ink)',
                        fontSize: '11px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isCompleted ? '✓' : lesson.order || idx + 1}
                    </span>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {lesson.title}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Quizzes Section in Sidebar */}
            {courseQuizzes.length > 0 && (
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-soft)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'none', marginBottom: '8px', paddingLeft: '8px' }}>
                  Course Quizzes & Assessments
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {courseQuizzes.map((q) => {
                    const isActive = q.documentId === quizId;
                    return (
                      <Link
                        key={q.documentId}
                        href={`/courses/${courseId}/quizzes/${q.documentId}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          backgroundColor: isActive ? 'rgba(242, 102, 42, 0.12)' : 'transparent',
                          color: isActive ? 'var(--primary)' : 'var(--ink)',
                          border: isActive ? '1px solid rgba(242, 102, 42, 0.3)' : '1px solid transparent',
                          textDecoration: 'none',
                          fontWeight: isActive ? 700 : 500,
                          fontSize: '12.5px',
                        }}
                      >
                        <span
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '5px',
                            backgroundColor: isActive ? 'var(--primary)' : 'rgba(242, 102, 42, 0.1)',
                            color: isActive ? '#FFFFFF' : 'var(--primary)',
                            fontSize: '10px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          Q
                        </span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                          {q.title}
                        </span>
                        {isActive && (
                          <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary)' }}>Active</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Quiz Viewport Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Top Bar Navigation */}
          <header
            style={{
              height: '56px',
              backgroundColor: 'var(--surface)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 20px',
              position: 'sticky',
              top: 0,
              zIndex: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  color: 'var(--ink)',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
                <span>{isSidebarOpen ? 'Hide Curriculum' : 'Show Curriculum'}</span>
              </button>

              <div style={{ fontSize: '13px', color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Link href="/courses" style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>Courses</Link>
                <span>/</span>
                <Link href={`/courses/${courseId}`} style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>{course?.title || 'Course'}</Link>
                <span>/</span>
                <strong style={{ color: 'var(--ink)' }}>{quiz?.title || 'Quiz'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {quiz?.passing_score && (
                <span
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '99px',
                    backgroundColor: 'rgba(22, 163, 74, 0.1)',
                    color: '#16A34A',
                  }}
                >
                  Passing Score: {quiz.passing_score}%
                </span>
              )}

              <Link
                href={`/courses/${courseId}`}
                style={{
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: 'var(--ink)',
                  textDecoration: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--canvas)',
                  border: '1px solid var(--border)',
                }}
              >
                Exit Quiz ✕
              </Link>
            </div>
          </header>

          {/* Quiz Content Container */}
          <main style={{ flex: 1, padding: '32px 24px', maxWidth: '820px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
            {/* Author Preview Mode Alert */}
            {!isStudent && (
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
                  marginBottom: '24px',
                }}
              >
                <span><strong>Author Preview Mode ({user?.role_type?.replace('_', ' ').toUpperCase()})</strong>: Previewing student quiz evaluation.</span>
                <Link href={`/courses/${courseId}`} style={{ color: 'var(--role-instructor)', fontWeight: 700, textDecoration: 'underline' }}>
                  ← Return to Course Studio
                </Link>
              </div>
            )}

            {loading ? (
              <div style={{ padding: '80px', textAlign: 'center', color: 'var(--ink-faint)', fontSize: '14px' }}>
                Loading assessment questions...
              </div>
            ) : !quiz ? (
              <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--surface)', borderRadius: '14px', border: '1px solid var(--border)' }}>
                <h3 style={{ margin: '0 0 10px' }}>Quiz Not Found</h3>
                <Link href={`/courses/${courseId}`} style={{ color: 'var(--primary)', fontWeight: 700 }}>
                  ← Return to Course
                </Link>
              </div>
            ) : isStudent && isEnrolled === false ? (
              /* Student Not Enrolled Barrier */
              <div
                style={{
                  backgroundColor: 'var(--surface)',
                  borderRadius: '16px',
                  border: '1.5px solid var(--primary)',
                  padding: '40px 24px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                  boxShadow: '0 4px 16px rgba(242, 102, 42, 0.08)',
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(242, 102, 42, 0.1)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>

                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
                    Course Enrollment Required
                  </h2>
                  <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: '6px 0 0', maxWidth: '480px', lineHeight: 1.5 }}>
                    You must be actively enrolled in this course to take its assessment quizzes, submit answers, and receive an auto-graded result.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                  <Link
                    href={`/courses/${courseId}`}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--canvas)',
                      border: '1px solid var(--border)',
                      color: 'var(--ink)',
                      fontSize: '13px',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    ← Back to Course Page
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIsEnrollModalOpen(true)}
                    style={{
                      padding: '10px 22px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--primary)',
                      color: '#FFFFFF',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(242, 102, 42, 0.3)',
                    }}
                  >
                    Enroll in Course & Unlock Quiz
                  </button>
                </div>
              </div>
            ) : result && !isRetaking ? (
              /* Quiz Graded Evaluation Results Card (Saved & Persisted) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderRadius: '16px',
                    border: `1.5px solid ${result.passed ? '#16A34A' : 'var(--danger)'}`,
                    padding: '32px 24px',
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: result.passed ? 'rgba(22, 163, 74, 0.12)' : 'var(--danger-soft)',
                      color: result.passed ? '#16A34A' : 'var(--danger)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                      fontWeight: 800,
                      margin: '0 auto 16px',
                    }}
                  >
                    {result.passed ? '✓' : '✕'}
                  </div>

                  <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 6px' }}>
                    {result.passed ? 'Assessment Completed (Passed)' : 'Assessment Completed (Not Passed)'}
                  </h2>

                  <p style={{ fontSize: '14px', color: 'var(--ink-soft)', margin: '0 0 20px' }}>
                    {result.passed
                      ? `You have already completed this quiz with a score of ${result.score}%, meeting the passing threshold of ${quiz.passing_score}%.`
                      : `Your previous score was ${result.score}% (Passing score: ${quiz.passing_score}%). You can review your answers or retake the assessment.`}
                  </p>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '24px',
                      backgroundColor: 'var(--canvas)',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      marginBottom: '24px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--ink-faint)', fontWeight: 700 }}>PREVIOUS SCORE</div>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: result.passed ? '#16A34A' : 'var(--danger)' }}>
                        {result.score}%
                      </div>
                    </div>
                    <div style={{ width: '1px', height: '30px', backgroundColor: 'var(--border)' }} />
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--ink-faint)', fontWeight: 700 }}>CORRECT ANSWERS</div>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ink)' }}>
                        {result.breakdown?.filter((b) => b.isCorrect).length || 0} / {questions.length}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      onClick={handleStartRetake}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        color: 'var(--ink)',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>Retake Quiz</span>
                    </button>
                    <Link
                      href={`/courses/${courseId}`}
                      style={{
                        padding: '10px 22px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--primary)',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        boxShadow: '0 2px 8px rgba(242, 102, 42, 0.3)',
                      }}
                    >
                      Back to Course Curriculum →
                    </Link>
                  </div>
                </div>

                {/* Detailed Question Feedback Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
                      Saved Answers & Question Feedback
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>
                      Attempt Date: {result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : 'Recorded'}
                    </span>
                  </div>

                  {result.breakdown?.map((b, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: 'var(--surface)',
                        borderRadius: '12px',
                        border: `1.5px solid ${b.isCorrect ? 'rgba(22, 163, 74, 0.3)' : 'rgba(220, 38, 38, 0.3)'}`,
                        padding: '18px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                        <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--ink)' }}>
                          <span style={{ color: 'var(--ink-faint)', marginRight: '6px' }}>{idx + 1}.</span>
                          {b.question}
                        </div>
                        <span
                          style={{
                            fontSize: '11.5px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: b.isCorrect ? 'rgba(22, 163, 74, 0.12)' : 'var(--danger-soft)',
                            color: b.isCorrect ? '#16A34A' : 'var(--danger)',
                            flexShrink: 0,
                          }}
                        >
                          {b.isCorrect ? '✓ Correct' : '✕ Incorrect'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {b.options.map((opt, optIdx) => {
                          const isUserPick = b.submittedAnswer === optIdx;
                          const isRightAnswer = b.correctAnswer === optIdx;

                          let bg = 'var(--canvas)';
                          let border = '1px solid var(--border-soft)';
                          let color = 'var(--ink)';

                          if (isRightAnswer) {
                            bg = 'rgba(22, 163, 74, 0.08)';
                            border = '1.5px solid #16A34A';
                            color = '#16A34A';
                          } else if (isUserPick && !b.isCorrect) {
                            bg = 'var(--danger-soft)';
                            border = '1.5px solid var(--danger)';
                            color = 'var(--danger)';
                          }

                          return (
                            <div
                              key={optIdx}
                              style={{
                                padding: '10px 14px',
                                borderRadius: '8px',
                                backgroundColor: bg,
                                border,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '13px',
                                color,
                                fontWeight: isRightAnswer || isUserPick ? 700 : 400,
                              }}
                            >
                              <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                              {isRightAnswer && <span style={{ fontSize: '11px', fontWeight: 800, color: '#16A34A' }}>Correct Answer</span>}
                              {isUserPick && !isRightAnswer && <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--danger)' }}>Your Answer</span>}
                            </div>
                          );
                        })}
                      </div>

                      {b.explanation && (
                        <div
                          style={{
                            backgroundColor: 'var(--canvas)',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            fontSize: '12.5px',
                            color: 'var(--ink-soft)',
                            lineHeight: 1.45,
                            border: '1px dashed var(--border)',
                          }}
                        >
                          <strong style={{ color: 'var(--ink)' }}>Explanation:</strong> {b.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Live Quiz Question Answering Form (Fresh or Retake) */
              <form onSubmit={(e) => { e.preventDefault(); setIsSubmitModalOpen(true); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                    padding: '24px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', backgroundColor: 'rgba(242, 102, 42, 0.1)', color: 'var(--primary)' }}>
                      {isRetaking ? 'Retake Attempt' : 'Assessment'}
                    </span>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ink-soft)' }}>
                      {answeredCount} of {questions.length} Answered
                    </span>
                  </div>

                  <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 6px', lineHeight: 1.3 }}>
                    {quiz.title}
                  </h1>

                  {quiz.description && (
                    <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.5 }}>
                      {quiz.description}
                    </p>
                  )}
                </div>

                {/* Questions List */}
                {questions.map((q, qIdx) => {
                  const selectedOpt = selectedAnswers[qIdx];

                  return (
                    <div
                      key={qIdx}
                      style={{
                        backgroundColor: 'var(--surface)',
                        borderRadius: '14px',
                        border: selectedOpt !== undefined ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                        padding: '22px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                      }}
                    >
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.4 }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 800, marginRight: '8px' }}>
                          Q{qIdx + 1}.
                        </span>
                        {q.question}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {q.options?.map((opt, optIdx) => {
                          const isSelected = selectedOpt === optIdx;

                          if (isStudent) {
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleSelectOption(qIdx, optIdx)}
                                style={{
                                  padding: '12px 16px',
                                  borderRadius: '10px',
                                  backgroundColor: isSelected ? 'rgba(242, 102, 42, 0.08)' : 'var(--canvas)',
                                  border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-soft)',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  transition: 'all 0.12s ease',
                                }}
                              >
                                <span
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    backgroundColor: isSelected ? 'var(--primary)' : 'var(--surface)',
                                    border: isSelected ? 'none' : '1px solid var(--border)',
                                    color: isSelected ? '#FFFFFF' : 'var(--ink-soft)',
                                    fontSize: '11.5px',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                  }}
                                >
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span style={{ fontSize: '13.5px', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--ink)' : 'var(--ink-soft)' }}>
                                  {opt}
                                </span>
                              </button>
                            );
                          }

                          // Non-student author mode preview
                          const isCorrectKey = Number(q.correct_option_index) === optIdx;
                          return (
                            <div
                              key={optIdx}
                              style={{
                                padding: '12px 16px',
                                borderRadius: '10px',
                                backgroundColor: isCorrectKey ? 'rgba(22, 163, 74, 0.08)' : 'var(--canvas)',
                                border: isCorrectKey ? '1.5px solid #16A34A' : '1px solid var(--border-soft)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: isCorrectKey ? '#16A34A' : 'var(--border-soft)', color: isCorrectKey ? '#FFFFFF' : 'var(--ink-faint)', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span style={{ fontSize: '13.5px', fontWeight: isCorrectKey ? 700 : 400, color: isCorrectKey ? '#16A34A' : 'var(--ink)' }}>
                                  {opt}
                                </span>
                              </div>
                              {isCorrectKey && (
                                <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', backgroundColor: '#16A34A', color: '#FFFFFF' }}>
                                  Answer Key
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Bottom Submit Action */}
                <div
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderRadius: '14px',
                    border: '1px solid var(--border)',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  {isStudent ? (
                    <>
                      <div style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
                        Finished answering? Answers are graded server-side with instant evaluation.
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {previousSubmission && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsRetaking(false);
                              loadData();
                            }}
                            style={{
                              padding: '10px 18px',
                              borderRadius: '8px',
                              backgroundColor: 'var(--canvas)',
                              border: '1px solid var(--border)',
                              color: 'var(--ink)',
                              fontSize: '13px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Cancel Retake
                          </button>
                        )}

                        <button
                          type="submit"
                          disabled={submitting || answeredCount === 0}
                          style={{
                            padding: '12px 28px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--primary)',
                            color: '#FFFFFF',
                            fontSize: '13.5px',
                            fontWeight: 800,
                            cursor: submitting || answeredCount === 0 ? 'not-allowed' : 'pointer',
                            opacity: submitting || answeredCount === 0 ? 0.6 : 1,
                            border: 'none',
                            boxShadow: '0 2px 8px rgba(242, 102, 42, 0.3)',
                          }}
                        >
                          {submitting ? 'Auto-Grading...' : 'Submit Quiz for Evaluation →'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
                        All <strong>{questions.length} questions</strong> and answer keys are configured for student evaluation.
                      </div>
                      <Link
                        href={`/courses/${courseId}`}
                        style={{
                          padding: '9px 18px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--primary)',
                          color: '#FFFFFF',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                      >
                        Back to Course Page →
                      </Link>
                    </>
                  )}
                </div>
              </form>
            )}
          </main>
        </div>

        {/* Submission Confirmation Modal */}
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

        {/* Enrollment Guard Modal */}
        <EnrollConfirmModal
          isOpen={isEnrollModalOpen}
          onClose={() => setIsEnrollModalOpen(false)}
          onConfirm={handleConfirmEnroll}
          courseTitle={course?.title || quiz?.title || 'Course'}
          courseCategory={course?.category}
          actionContext="quiz"
        />
      </div>
    </ProtectedRoute>
  );
}

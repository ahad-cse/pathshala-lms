'use client';

import LoadingSpinner from '@/components/LoadingSpinner';

import confetti from 'canvas-confetti';

import React, { useEffect, useState, useCallback, use } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { courseApi, lessonApi, progressApi, quizApi, enrollmentApi, quizSubmissionApi } from '@/lib/api';
import { Course, CourseProgress, Lesson, Quiz, QuizSubmission } from '@/types/content';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PageProps {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
}

export default function LessonViewerPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { courseId, lessonId } = resolvedParams;
  const router = useRouter();
  const { user, role } = useAuth();
  const isStudent = (role || user?.role_type) === 'student';

  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizSubmissionsMap, setQuizSubmissionsMap] = useState<Record<string, QuizSubmission>>({});
  const [loading, setLoading] = useState(true);
  const [togglingProgress, setTogglingProgress] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);

  const loadLessonData = useCallback(async () => {
    try {
      setLoading(true);
      const [courseRes, lessonRes, enrollRes, progressRes, quizRes, subRes] = await Promise.all([
        courseApi.getOne(courseId),
        lessonApi.getOne(lessonId),
        isStudent ? enrollmentApi.getMyEnrollments().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        isStudent
          ? progressApi.getCourseProgress(courseId).catch(() => ({
              data: {
                courseId,
                totalLessons: 0,
                completedLessons: 0,
                percentage: 0,
                completedLessonIds: [],
              },
            }))
          : Promise.resolve({ data: null }),
        quizApi.getByCourse(courseId).catch(() => ({ data: [] })),
        isStudent ? quizSubmissionApi.getMySubmissions().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      ]);

      setCourse(courseRes.data);
      setCurrentLesson(lessonRes.data);
      setProgress(progressRes.data);
      setQuizzes(quizRes.data || []);

      if (isStudent) {
        const subs = subRes.data || [];
        const subDict: Record<string, QuizSubmission> = {};
        subs.forEach((s: any) => {
          const qDocId = s.quiz?.documentId || (s.quiz as any)?.id;
          if (qDocId) {
            subDict[String(qDocId)] = s;
          }
        });
        setQuizSubmissionsMap(subDict);
      }

      if (isStudent) {
        const myEnrollments = enrollRes.data || [];
        const matched = myEnrollments.some(
          (e: any) =>
            (e.course as any)?.documentId === courseId ||
            String((e.course as any)?.id) === String(courseRes.data?.id)
        );
        setIsEnrolled(matched);
      } else {
        setIsEnrolled(true);
      }
    } catch (err) {
      console.error('Failed to load lesson data:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId, isStudent]);

  useEffect(() => {
    loadLessonData();
  }, [loadLessonData]);

  // Sort lessons in ascending sequence order
  const sortedLessons = (course?.lessons || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  const currentIndex = sortedLessons.findIndex((l) => l.documentId === lessonId);
  const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;

  const isCurrentLessonCompleted = isStudent && (progress?.completedLessonIds?.includes(lessonId) ?? false);

  const handleToggleComplete = async () => {
    if (togglingProgress) return;
    setTogglingProgress(true);
    try {
      const res = await progressApi.toggleLesson(lessonId, courseId);
      setProgress({
        courseId,
        totalLessons: res.data.totalLessons,
        completedLessons: res.data.completedLessons,
        percentage: res.data.percentage,
        completedLessonIds: res.data.completedLessonIds,
      });

      if (res.data?.percentage === 100) {
        try {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#F2662A', '#16A34A', '#4F46E5', '#E11D48', '#FFD700'],
          });
        } catch (e) {}
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to update lesson progress.');
    } finally {
      setTogglingProgress(false);
    }
  };

  // Convert YouTube URL to embed URL
  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    try {
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        const v = urlObj.searchParams.get('v');
        return v ? `https://www.youtube.com/embed/${v}?rel=0` : null;
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return id ? `https://www.youtube.com/embed/${id}?rel=0` : null;
      }
      return url;
    } catch {
      return url;
    }
  };

  const embedVideoUrl = getEmbedUrl(currentLesson?.video_url);

  // Ownership verification for instructors
  const isInstructor = (role || user?.role_type) === 'instructor';
  const isAssignedInstructor =
    isInstructor &&
    Boolean(
      (course?.instructor?.id && course.instructor.id === user?.id) ||
      (course?.instructor?.documentId && course.instructor.documentId === user?.documentId) ||
      course?.co_instructors?.some(
        (ci) => (ci.id && ci.id === user?.id) || (ci.documentId && ci.documentId === user?.documentId)
      )
    );

  if (course && isInstructor && !isAssignedInstructor) {
    return (
      <ProtectedRoute>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '24px',
            textAlign: 'center',
            backgroundColor: 'var(--canvas)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'var(--danger-soft)',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px' }}>
            Access Restricted (403 Forbidden)
          </h2>

          <p style={{ maxWidth: '460px', fontSize: '13.5px', color: 'var(--ink-soft)', marginBottom: '20px', lineHeight: 1.5 }}>
            You are signed in as an Instructor, but you are not assigned to this course curriculum.
          </p>

          <Link
            href="/instructor/courses"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '13px',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(242, 102, 42, 0.25)',
            }}
          >
            ← Return to Course Studio
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--canvas)' }}>
        {/* Mobile Backdrop for Lesson Drawer */}
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

        {/* Left Lesson Playlist Sidebar */}
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
              href={isStudent ? "/my-courses" : `/courses/${courseId}`}
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
              {isStudent ? '← Back to My Courses' : '← Back to Manage Course'}
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

            {/* Progress Bar in Sidebar (Students only) */}
            {isStudent ? (
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 700, color: 'var(--ink-soft)', marginBottom: '4px' }}>
                  <span>Course Progress</span>
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
            ) : (
              <div
                style={{
                  marginTop: '10px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--canvas)',
                  border: '1px solid var(--border-soft)',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: 'var(--ink-soft)',
                }}
              >
                Curriculum Preview • {sortedLessons.length} Lessons
              </div>
            )}
          </div>

          {/* Playlist */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {sortedLessons.map((lesson, idx) => {
                const isActive = lesson.documentId === lessonId;
                const isCompleted = isStudent && (progress?.completedLessonIds?.includes(lesson.documentId) ?? false);

                return (
                  <Link
                    key={lesson.documentId}
                    href={`/courses/${courseId}/lessons/${lesson.documentId}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: isActive ? 'var(--role-student-soft)' : 'transparent',
                      color: isActive ? 'var(--role-student)' : 'var(--ink)',
                      textDecoration: 'none',
                      transition: 'background-color 0.12s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'var(--canvas)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {/* Completion indicator / Order number */}
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        backgroundColor: isCompleted
                          ? 'var(--success)'
                          : isActive
                          ? 'var(--role-student)'
                          : 'var(--border-soft)',
                        color: isCompleted || isActive ? '#FFFFFF' : 'var(--ink)',
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
                          fontSize: '13px',
                          fontWeight: isActive ? 700 : 500,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {lesson.title}
                      </div>
                      {lesson.video_url && (
                        <div style={{ fontSize: '11px', color: 'var(--ink-faint)', marginTop: '2px' }}>
                          Video Stream
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Assessment Quiz Link in Sidebar */}
            {quizzes.length > 0 && (
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-soft)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'none', marginBottom: '8px', paddingLeft: '8px' }}>
                  Course Assessment
                </div>
                {quizzes.map((q) => {
                  const sub = quizSubmissionsMap[q.documentId] || (q.id ? quizSubmissionsMap[String(q.id)] : undefined);

                  return (
                    <Link
                      key={q.documentId}
                      href={`/courses/${courseId}/quizzes/${q.documentId}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: sub ? (sub.passed ? 'rgba(22, 163, 74, 0.08)' : 'rgba(239, 68, 68, 0.08)') : 'var(--warning-soft)',
                        border: sub ? (sub.passed ? '1px solid rgba(22, 163, 74, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)') : '1px solid transparent',
                        color: sub ? (sub.passed ? '#16A34A' : 'var(--danger)') : 'var(--warning)',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '12.5px',
                      }}
                    >
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                        {q.title}
                      </span>
                      {sub && (
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: '99px',
                            backgroundColor: sub.passed ? '#16A34A' : 'var(--danger)',
                            color: '#FFFFFF',
                            flexShrink: 0,
                          }}
                        >
                          {sub.score}% {sub.passed ? '✓' : '✗'}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Main Stage Viewport */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Top Stage Bar */}
          <header
            style={{
              height: '60px',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '6px',
                  borderRadius: '6px',
                  color: 'var(--ink-soft)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={isSidebarOpen ? 'Collapse Playlist' : 'Expand Playlist'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>

              <div style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
                <strong>{course?.title}</strong>
                {currentIndex >= 0 && (
                  <span style={{ color: 'var(--ink-faint)', marginLeft: '8px' }}>
                    • Lesson {currentIndex + 1} of {sortedLessons.length}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Live Completion Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '99px',
                  backgroundColor: 'var(--canvas)',
                  border: '1px solid var(--border)',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: 'var(--ink)',
                }}
              >
                <span style={{ color: 'var(--primary)' }}>{progress?.percentage || 0}% Done</span>
                <span style={{ color: 'var(--ink-faint)' }}>•</span>
                <span style={{ color: 'var(--ink-soft)' }}>{progress?.completedLessons || 0}/{sortedLessons.length}</span>
              </div>

              <Link
                href="/dashboard"
                style={{
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: 'var(--ink-soft)',
                  textDecoration: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--canvas)',
                }}
              >
                Dashboard
              </Link>
            </div>
          </header>

          {/* Lesson Main View Area */}
          <main className="lesson-main" style={{ flex: 1, padding: '32px', maxWidth: '960px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
            {loading ? (
              <LoadingSpinner message="Loading video lesson..." minHeight="400px" />
            ) : !currentLesson ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <h3>Lesson Not Found</h3>
                <Link href="/my-courses" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  ← Return to My Courses
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
                    You must be enrolled in <strong>{course?.title || 'this course'}</strong> to stream video lessons and track learning progress.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                  <Link
                    href={`/courses/${courseId}`}
                    style={{
                      padding: '10px 22px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--primary)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '13.5px',
                      textDecoration: 'none',
                      boxShadow: '0 2px 6px rgba(242, 102, 42, 0.3)',
                    }}
                  >
                    Go to Course & Enroll →
                  </Link>
                  <Link
                    href={role === 'instructor' ? '/instructor/courses' : (isStudent ? '/my-courses' : '/courses')}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--canvas)',
                      border: '1px solid var(--border)',
                      color: 'var(--ink)',
                      fontWeight: 600,
                      fontSize: '13.5px',
                      textDecoration: 'none',
                    }}
                  >
                    Browse All Courses
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Lesson Header & Mark Complete Action */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--primary-soft)',
                        color: 'var(--primary)',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'none',
                        marginBottom: '8px',
                      }}
                    >
                      Lesson {currentLesson.order || currentIndex + 1}
                    </div>

                    <h1
                      style={{
                        fontSize: '26px',
                        fontWeight: 800,
                        color: 'var(--ink)',
                        margin: '0 0 6px',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {currentLesson.title}
                    </h1>
                  </div>

                  {/* Mark Complete / Completed Button (Students only) */}
                  {isStudent ? (
                    <button
                      onClick={handleToggleComplete}
                      disabled={togglingProgress}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        backgroundColor: isCurrentLessonCompleted ? 'var(--success-soft)' : 'var(--primary)',
                        color: isCurrentLessonCompleted ? 'var(--success)' : '#FFFFFF',
                        border: isCurrentLessonCompleted ? '1.5px solid var(--success)' : 'none',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        cursor: togglingProgress ? 'not-allowed' : 'pointer',
                        opacity: togglingProgress ? 0.7 : 1,
                        boxShadow: isCurrentLessonCompleted ? 'none' : '0 2px 8px rgba(242, 102, 42, 0.3)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>{isCurrentLessonCompleted ? '✓ Completed' : 'Mark as Complete'}</span>
                    </button>
                  ) : (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--canvas)',
                        border: '1px solid var(--border)',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'var(--ink-soft)',
                      }}
                    >
                      <span>Preview Mode</span>
                    </div>
                  )}
                </div>

                {/* Video Player */}
                {embedVideoUrl && (
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      backgroundColor: '#0F172A',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                    }}
                  >
                    {embedVideoUrl.includes('youtube.com') ? (
                      <iframe
                        src={embedVideoUrl}
                        title={currentLesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ width: '100%', height: '100%', border: 'none' }}
                      />
                    ) : (
                      <video
                        src={embedVideoUrl}
                        controls
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    )}
                  </div>
                )}

                {/* Lesson Markdown / Reading Content Card */}
                <div
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                    padding: '28px 32px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '14px',
                      lineHeight: '1.7',
                      color: 'var(--ink)',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'inherit',
                    }}
                  >
                    {currentLesson.content}
                  </div>
                </div>

                {/* Stepper Navigation Footer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 0',
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  {prevLesson ? (
                    <Link
                      href={`/courses/${courseId}/lessons/${prevLesson.documentId}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 18px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        color: 'var(--ink)',
                        fontSize: '13px',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      <span>←</span>
                      <span>Previous: {prevLesson.title}</span>
                    </Link>
                  ) : (
                    <div />
                  )}

                  {nextLesson ? (
                    <Link
                      href={`/courses/${courseId}/lessons/${nextLesson.documentId}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--primary)',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        boxShadow: '0 2px 6px rgba(242, 102, 42, 0.3)',
                      }}
                    >
                      <span>Next: {nextLesson.title}</span>
                      <span>→</span>
                    </Link>
                  ) : quizzes.length > 0 ? (
                    <Link
                      href={`/courses/${courseId}/quizzes/${quizzes[0].documentId}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--warning)',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 800,
                        textDecoration: 'none',
                        boxShadow: '0 2px 6px rgba(217, 119, 6, 0.3)',
                      }}
                    >
                      <span>Take Course MCQ Quiz →</span>
                    </Link>
                  ) : isStudent ? (
                    <Link
                      href="/my-courses"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--success)',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      <span>Track Finished • Return to My Courses</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/courses/${courseId}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--primary)',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        boxShadow: '0 2px 6px rgba(242, 102, 42, 0.3)',
                      }}
                    >
                      <span>Return to Course Curriculum →</span>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

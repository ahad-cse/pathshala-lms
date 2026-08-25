'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { courseApi, lessonApi, progressApi, quizApi } from '@/lib/api';
import { Course, CourseProgress, Lesson, Quiz } from '@/types/content';
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
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingProgress, setTogglingProgress] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const loadLessonData = useCallback(async () => {
    try {
      setLoading(true);
      const [courseRes, lessonRes, progressRes, quizRes] = await Promise.all([
        courseApi.getOne(courseId),
        lessonApi.getOne(lessonId),
        progressApi.getCourseProgress(courseId).catch(() => ({
          data: {
            courseId,
            totalLessons: 0,
            completedLessons: 0,
            percentage: 0,
            completedLessonIds: [],
          },
        })),
        quizApi.getByCourse(courseId).catch(() => ({ data: [] })),
      ]);

      setCourse(courseRes.data);
      setCurrentLesson(lessonRes.data);
      setProgress(progressRes.data);
      setQuizzes(quizRes.data || []);
    } catch (err) {
      console.error('Failed to load lesson data:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    loadLessonData();
  }, [loadLessonData]);

  // Sort lessons in ascending sequence order
  const sortedLessons = (course?.lessons || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  const currentIndex = sortedLessons.findIndex((l) => l.documentId === lessonId);
  const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;

  const isCurrentLessonCompleted = progress?.completedLessonIds?.includes(lessonId) ?? false;

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

  return (
    <ProtectedRoute>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--canvas)' }}>
        {/* Left Lesson Playlist Sidebar */}
        <aside
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
          }}
        >
          {/* Header & Course Progress Summary */}
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-soft)' }}>
            <Link
              href="/my-courses"
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
              ← Back to My Courses
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

            {/* Progress Bar in Sidebar */}
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
          </div>

          {/* Playlist */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {sortedLessons.map((lesson, idx) => {
                const isActive = lesson.documentId === lessonId;
                const isCompleted = progress?.completedLessonIds?.includes(lesson.documentId);

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
                          📹 Video Stream
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
                {quizzes.map((q) => (
                  <Link
                    key={q.documentId}
                    href={`/courses/${courseId}/quiz/${q.documentId}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--warning-soft)',
                      color: 'var(--warning)',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '12.5px',
                    }}
                  >
                    <span>🎯</span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {q.title}
                    </span>
                  </Link>
                ))}
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
                <span style={{ color: 'var(--primary)' }}>⚡ {progress?.percentage || 0}% Done</span>
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
          <main style={{ flex: 1, padding: '32px', maxWidth: '960px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--ink-faint)' }}>
                Loading lesson content...
              </div>
            ) : !currentLesson ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <h3>Lesson Not Found</h3>
                <Link href="/my-courses" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  ← Return to My Courses
                </Link>
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

                  {/* Mark Complete / Completed Button */}
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
                      href={`/courses/${courseId}/quiz/${quizzes[0].documentId}`}
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
                      <span>🎯 Take Course MCQ Quiz →</span>
                    </Link>
                  ) : (
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
                      <span>✓ Track Finished • Return to My Courses</span>
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

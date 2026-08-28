'use client';

import React, { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { courseApi, lessonApi, enrollmentApi, quizApi, progressApi } from '@/lib/api';
import { Course, Lesson, Quiz } from '@/types/content';
import StudentProgressTable from '@/components/StudentProgressTable';
import CourseModal from '@/components/CourseModal';
import LessonModal from '@/components/LessonModal';
import QuizModal from '@/components/QuizModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import EnrollConfirmModal from '@/components/EnrollConfirmModal';

interface PageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default function CourseDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { courseId } = resolvedParams;
  const { user, role } = useAuth();
  const router = useRouter();

  const isStudent = (role || user?.role_type) === 'student';

  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [courseProgressPercent, setCourseProgressPercent] = useState<number | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'curriculum' | 'instructor' | 'students' | 'overview'>('curriculum');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [lessonToEdit, setLessonToEdit] = useState<Lesson | null>(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizToEdit, setQuizToEdit] = useState<Quiz | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollModalContext, setEnrollModalContext] = useState<'course' | 'quiz'>('course');

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    type: 'lesson' | 'quiz';
    id: string;
    title: string;
    message?: string;
  }>({
    isOpen: false,
    type: 'lesson',
    id: '',
    title: '',
  });

  const loadCourseData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await courseApi.getOne(courseId);
      const fetchedCourse = res.data;
      setCourse(fetchedCourse);

      // If Student, check enrollment status & progress
      if (isStudent && user) {
        try {
          const [enrollRes, progRes] = await Promise.all([
            enrollmentApi.getMyEnrollments().catch(() => ({ data: [] })),
            progressApi.getCourseProgress(courseId).catch(() => ({ data: null })),
          ]);

          const myEnrollments = enrollRes.data || [];
          const matched = myEnrollments.some(
            (e) => (e.course as any)?.documentId === courseId || (e.course as any)?.id === fetchedCourse?.id
          );
          setIsEnrolled(matched);

          if (progRes?.data) {
            setCourseProgressPercent(progRes.data.percentage || 0);
            setCompletedLessonIds(progRes.data.completedLessonIds || []);
          }
        } catch (e) {
          console.error('Error loading student enrollment status:', e);
        }
      }
    } catch (err) {
      console.error('Failed to load course details:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId, isStudent, user]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  // Ownership verification
  const isOwner =
    user?.role_type === 'instructor' &&
    ((course?.instructor?.id && course.instructor.id === user.id) ||
      (course?.instructor?.documentId && course.instructor.documentId === user.documentId) ||
      course?.co_instructors?.some((ci) => ci.id === user.id || ci.documentId === user.documentId));

  const isManaged = role === 'admin' || role === 'content_manager' || isOwner;

  const handleEnroll = async () => {
    if (!course) return;
    try {
      setEnrolling(true);
      await enrollmentApi.enroll(course.documentId);
      setIsEnrolled(true);
      setToastMessage('Successfully enrolled in this course!');
      setTimeout(() => setToastMessage(null), 3500);
      loadCourseData();
    } catch (err: any) {
      setToastMessage(err?.message || 'Failed to enroll.');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setEnrolling(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteModalState.type === 'lesson') {
      await lessonApi.delete(deleteModalState.id);
      setToastMessage('Lesson deleted successfully.');
    } else if (deleteModalState.type === 'quiz') {
      await quizApi.delete(deleteModalState.id);
      setToastMessage('Assessment quiz deleted.');
    }
    setTimeout(() => setToastMessage(null), 3500);
    loadCourseData();
  };

  if (loading) {
    return (
      <AppShell>
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-soft)' }}>
          Loading course details and curriculum...
        </div>
      </AppShell>
    );
  }

  if (!course) {
    return (
      <AppShell>
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ink)' }}>Course Not Found</h2>
          <p style={{ color: 'var(--ink-soft)', marginTop: '8px' }}>The requested course could not be located.</p>
          <Link
            href="/courses"
            style={{
              display: 'inline-block',
              marginTop: '16px',
              padding: '10px 20px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            ← Back to Course Catalog
          </Link>
        </div>
      </AppShell>
    );
  }

  const lessonsCount = course.lessons?.length || 0;
  const sortedLessons = [...(course.lessons || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  const firstLesson = sortedLessons[0];
  const quizzesList = course.quizzes || [];
  const attachedQuiz = quizzesList.length > 0 ? quizzesList[0] : null;

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Toast Notification */}
        {toastMessage && (
          <div
            className="animate-fade-in-up"
            style={{
              padding: '12px 18px',
              borderRadius: '10px',
              backgroundColor: 'var(--ink)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
            }}
          >
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', opacity: 0.8 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ink-soft)' }}>
          <Link href="/courses" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Courses
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--ink-faint)' }}>{course.category}</span>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {course.title}
          </span>
        </div>

        {/* Compact, Modern Course Header Bar */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            padding: '18px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '5px',
                  backgroundColor: 'var(--canvas)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink)',
                }}
              >
                {course.category}
              </span>

              <span style={{ fontSize: '12px', color: 'var(--ink-faint)', fontWeight: 600 }}>
                • {lessonsCount} Lessons
              </span>

              <span style={{ fontSize: '12px', color: 'var(--ink-faint)', fontWeight: 600 }}>
                • {quizzesList.length} {quizzesList.length === 1 ? 'Quiz' : 'Quizzes'}
              </span>

              <span style={{ fontSize: '12px', color: 'var(--ink-faint)', fontWeight: 600 }}>
                • {course.enrollments?.length || 0} Enrolled
              </span>


            </div>

            <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink)', margin: 0, lineHeight: 1.25 }}>
              {course.title}
            </h1>

            <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.4, maxWidth: '800px' }}>
              {course.description || 'Comprehensive curriculum covering key principles and hands-on modules.'}
            </p>
          </div>

          {/* Header Action Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            {isStudent && (
              <>
                {isEnrolled ? (
                  <Link
                    href={firstLesson ? `/courses/${course.documentId}/lessons/${firstLesson.documentId}` : '#'}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      backgroundColor: '#16A34A',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '13px',
                      textDecoration: 'none',
                      boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
                    }}
                  >
                    <span>Resume Learning</span>
                    {courseProgressPercent !== null && (
                      <span style={{ fontSize: '11px', opacity: 0.9, backgroundColor: 'rgba(255, 255, 255, 0.25)', padding: '2px 6px', borderRadius: '4px' }}>
                        {courseProgressPercent}%
                      </span>
                    )}
                  </Link>
                ) : (
                  <button
                    onClick={() => { setEnrollModalContext('course'); setIsEnrollModalOpen(true); }}
                    disabled={enrolling}
                    style={{
                      padding: '10px 22px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--primary)',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '13px',
                      border: 'none',
                      cursor: enrolling ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 6px rgba(242, 102, 42, 0.3)',
                    }}
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )}
              </>
            )}

            {isManaged && (
              <>
                <button
                  onClick={() => setIsCourseModalOpen(true)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--canvas)',
                    border: '1px solid var(--border)',
                    color: 'var(--ink)',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() => {
                    setLessonToEdit(null);
                    setIsLessonModalOpen(true);
                  }}
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
                  + Add Lesson
                </button>

                <button
                  onClick={() => {
                    setQuizToEdit(null);
                    setIsQuizModalOpen(true);
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--role-instructor)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(180, 83, 9, 0.25)',
                  }}
                >
                  + Add Quiz
                </button>
              </>
            )}
          </div>
        </div>

        {/* Management Tab Navigation (Visible strictly to Admin, CM, and Instructors) */}
        {isManaged && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderBottom: '1px solid var(--border-soft)',
              paddingBottom: '2px',
            }}
          >
            <button
              onClick={() => setActiveTab('curriculum')}
              style={{
                padding: '8px 16px',
                borderRadius: '7px',
                backgroundColor: activeTab === 'curriculum' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'curriculum' ? '#FFFFFF' : 'var(--ink-soft)',
                fontWeight: 700,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Curriculum & Assessment
            </button>

            <button
              onClick={() => setActiveTab('students')}
              style={{
                padding: '8px 16px',
                borderRadius: '7px',
                backgroundColor: activeTab === 'students' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'students' ? '#FFFFFF' : 'var(--ink-soft)',
                fontWeight: 700,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Enrolled Students & Progress
            </button>

            <button
              onClick={() => setActiveTab('instructor')}
              style={{
                padding: '8px 16px',
                borderRadius: '7px',
                backgroundColor: activeTab === 'instructor' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'instructor' ? '#FFFFFF' : 'var(--ink-soft)',
                fontWeight: 700,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Instructors & Faculty
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              style={{
                padding: '8px 16px',
                borderRadius: '7px',
                backgroundColor: activeTab === 'overview' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'overview' ? '#FFFFFF' : 'var(--ink-soft)',
                fontWeight: 700,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Course Overview
            </button>
          </div>
        )}

        {/* Tab 1: Modern Side-by-Side (Lessons Playlist + Assessment Quiz Card) */}
        {activeTab === 'curriculum' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
              gap: '20px',
              alignItems: 'start',
            }}
          >
            {/* Left Column: Sequential Course Lessons Playlist */}
            <div
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
                    Course Lessons Playlist ({lessonsCount})
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--ink-soft)', margin: '2px 0 0' }}>
                    Sequential video modules designed for mastery.
                  </p>
                </div>

                {isManaged && (
                  <button
                    onClick={() => {
                      setLessonToEdit(null);
                      setIsLessonModalOpen(true);
                    }}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--canvas)',
                      border: '1px solid var(--border)',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: 'var(--ink)',
                      cursor: 'pointer',
                    }}
                  >
                    + Add Lesson
                  </button>
                )}
              </div>

              {lessonsCount === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--canvas)', borderRadius: '10px', color: 'var(--ink-faint)', fontSize: '12.5px' }}>
                  No lessons added to this course curriculum yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {sortedLessons.map((lesson, idx) => {
                    const isCompleted = completedLessonIds.includes(lesson.documentId);

                    return (
                      <div
                        key={lesson.documentId || idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--canvas)',
                          border: isCompleted ? '1.5px solid #16A34A' : '1px solid var(--border-soft)',
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <span
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '6px',
                              backgroundColor: isCompleted ? '#16A34A' : 'var(--surface)',
                              color: isCompleted ? '#FFFFFF' : 'var(--ink)',
                              border: isCompleted ? 'none' : '1px solid var(--border)',
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

                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '13px',
                                fontWeight: 700,
                                color: 'var(--ink)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {lesson.title}
                            </div>
                            {lesson.video_url && (
                              <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>
                                Video Stream Ready
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          {isStudent && isEnrolled && (
                            <Link
                              href={`/courses/${course.documentId}/lessons/${lesson.documentId}`}
                              style={{
                                padding: '5px 12px',
                                borderRadius: '6px',
                                backgroundColor: isCompleted ? 'rgba(22, 163, 74, 0.1)' : 'var(--primary)',
                                color: isCompleted ? '#16A34A' : '#FFFFFF',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                textDecoration: 'none',
                              }}
                            >
                              {isCompleted ? 'Review' : 'Play '}
                            </Link>
                          )}

                          {isManaged && (
                            <>
                              <Link
                                href={`/courses/${course.documentId}/lessons/${lesson.documentId}`}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '5px',
                                  backgroundColor: 'var(--surface)',
                                  border: '1px solid var(--border)',
                                  color: 'var(--ink)',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                }}
                              >
                                Preview
                              </Link>
                              <button
                                onClick={() => {
                                  setLessonToEdit(lesson);
                                  setIsLessonModalOpen(true);
                                }}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '5px',
                                  backgroundColor: 'var(--surface)',
                                  border: '1px solid var(--border)',
                                  color: 'var(--ink)',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteModalState({
                                    isOpen: true,
                                    type: 'lesson',
                                    id: lesson.documentId,
                                    title: `Delete Lesson: "${lesson.title}"?`,
                                  })
                                }
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '5px',
                                  backgroundColor: 'var(--danger-soft)',
                                  border: '1px solid rgba(220, 38, 38, 0.2)',
                                  color: 'var(--danger)',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Course Quizzes & Assessments (Supports Multiple Quizzes) */}
            <div
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                position: 'sticky',
                top: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
                    Course Quizzes ({quizzesList.length})
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--ink-soft)', margin: '2px 0 0' }}>
                    Module evaluations & assessments.
                  </p>
                </div>

                {isManaged && (
                  <button
                    onClick={() => {
                      setQuizToEdit(null);
                      setIsQuizModalOpen(true);
                    }}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--role-instructor)',
                      color: '#FFFFFF',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(180, 83, 9, 0.25)',
                    }}
                  >
                    + Add Quiz
                  </button>
                )}
              </div>

              {quizzesList.length === 0 ? (
                <div
                  style={{
                    padding: '24px 20px',
                    textAlign: 'center',
                    backgroundColor: 'var(--canvas)',
                    borderRadius: '12px',
                    border: '1.5px dashed var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
                    No quizzes attached to this course yet.
                  </div>

                  {isManaged && (
                    <button
                      onClick={() => {
                        setQuizToEdit(null);
                        setIsQuizModalOpen(true);
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--role-instructor)',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      + Create First Quiz
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {quizzesList.map((quiz, qIdx) => (
                    <div
                      key={quiz.documentId || qIdx}
                      style={{
                        backgroundColor: 'var(--canvas)',
                        border: '1px solid var(--border-soft)',
                        borderRadius: '12px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--ink)' }}>
                            {quiz.title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '11.5px', color: 'var(--ink-faint)' }}>
                            <span>{quiz.questions?.length || 0} Questions</span>
                            <span>•</span>
                            <span style={{ color: '#16A34A', fontWeight: 700 }}>Pass: {quiz.passing_score}%</span>
                          </div>
                        </div>

                        {isManaged && (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => {
                                setQuizToEdit(quiz);
                                setIsQuizModalOpen(true);
                              }}
                              style={{
                                padding: '3px 8px',
                                borderRadius: '5px',
                                backgroundColor: 'var(--surface)',
                                border: '1px solid var(--border)',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: 'var(--ink)',
                                cursor: 'pointer',
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                setDeleteModalState({
                                  isOpen: true,
                                  type: 'quiz',
                                  id: quiz.documentId,
                                  title: `Delete Quiz: "${quiz.title}"?`,
                                })
                              }
                              style={{
                                padding: '3px 8px',
                                borderRadius: '5px',
                                backgroundColor: 'var(--danger-soft)',
                                border: '1px solid rgba(220, 38, 38, 0.2)',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: 'var(--danger)',
                                cursor: 'pointer',
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>

                      {isStudent && !isEnrolled ? (
                        <button
                          onClick={() => { setEnrollModalContext('course'); setIsEnrollModalOpen(true); }}
                          disabled={enrolling}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px',
                            borderRadius: '7px',
                            backgroundColor: 'var(--canvas)',
                            color: 'var(--primary)',
                            border: '1.5px solid var(--primary)',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: enrolling ? 'not-allowed' : 'pointer',
                            width: '100%',
                          }}
                        >
                          {enrolling ? 'Enrolling...' : 'Enroll to Unlock Quiz'}
                        </button>
                      ) : (
                        <Link
                          href={`/courses/${course.documentId}/quizzes/${quiz.documentId}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px',
                            borderRadius: '7px',
                            backgroundColor: isStudent ? 'var(--primary)' : 'var(--surface)',
                            color: isStudent ? '#FFFFFF' : 'var(--ink)',
                            border: isStudent ? 'none' : '1px solid var(--border)',
                            fontWeight: 700,
                            fontSize: '12px',
                            textDecoration: 'none',
                            boxShadow: isStudent ? '0 2px 6px rgba(242, 102, 42, 0.25)' : 'none',
                          }}
                        >
                          <span>{isStudent ? 'Take Quiz →' : 'Preview Quiz →'}</span>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Instructors & Faculty */}
        {activeTab === 'instructor' && (
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 6px' }}>
                Course Instructors & Faculty Team
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: 0 }}>
                Meet the verified domain experts and educators directing and delivering this course curriculum.
              </p>
            </div>

            {/* 1. Primary / Lead Instructor */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'none' }}>
                Primary Lead Instructor
              </div>

              <div
                style={{
                  backgroundColor: 'var(--canvas)',
                  border: '1.5px solid var(--role-instructor)',
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--role-instructor-soft)',
                    color: 'var(--role-instructor)',
                    fontWeight: 800,
                    fontSize: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {course.instructor?.username?.charAt(0).toUpperCase() || 'I'}
                </div>

                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
                      {course.instructor?.full_name || course.instructor?.username || 'Staff Instructor'}
                    </h4>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '99px',
                        backgroundColor: 'var(--role-instructor)',
                        color: '#FFFFFF',
                      }}
                    >
                      Lead Course Director
                    </span>
                  </div>

                  <div style={{ fontSize: '12.5px', color: 'var(--ink-faint)', marginTop: '3px' }}>
                    {course.instructor?.email || 'instructor@pathshala.edu'}
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: '10px 0 0', lineHeight: 1.5 }}>
                    {(course.instructor as any)?.bio ||
                      'Senior software engineer and educator specializing in web architectures, software design patterns, and interactive curricula.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Co-Instructors & Teaching Faculty */}
            {course.co_instructors && course.co_instructors.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'none' }}>
                  Co-Instructors & Teaching Faculty ({course.co_instructors.length})
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
                  {course.co_instructors.map((coInst) => (
                    <div
                      key={coInst.documentId || coInst.id}
                      style={{
                        backgroundColor: 'var(--canvas)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                      }}
                    >
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--role-instructor-soft)',
                          color: 'var(--role-instructor)',
                          fontWeight: 800,
                          fontSize: '17px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {coInst.username.charAt(0).toUpperCase()}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--ink)' }}>
                            {coInst.full_name || coInst.username}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              backgroundColor: 'var(--canvas)',
                              border: '1px solid var(--border-soft)',
                              color: 'var(--ink-soft)',
                            }}
                          >
                            Faculty
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--ink-faint)', marginTop: '2px' }}>
                          {coInst.email}
                        </div>
                        {coInst.bio && (
                          <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '6px', lineHeight: 1.4 }}>
                            {coInst.bio}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Enrolled Students & Progress Table (Restricted to Course Managers) */}
        {activeTab === 'students' && isManaged && (
          <StudentProgressTable
            allowedCourseId={course.documentId}
            title={`Students Enrolled in "${course.title}"`}
            subtitle={`Live tracking of student module completion rates and quiz assessment outcomes for this specific course.`}
          />
        )}

        {/* Tab 3: Overview & Details */}
        {activeTab === 'overview' && (
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px' }}>
                About this Course
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0 }}>
                {course.description || 'Master modern full-stack development methodologies with industry-tested patterns and hands-on modular lessons.'}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 10px' }}>
                Course Specifications
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--canvas)', border: '1px solid var(--border-soft)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--ink-faint)', fontWeight: 600 }}>Category</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginTop: '2px' }}>{course.category}</div>
                </div>
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--canvas)', border: '1px solid var(--border-soft)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--ink-faint)', fontWeight: 600 }}>Total Curriculum Lessons</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginTop: '2px' }}>{lessonsCount} Video Modules</div>
                </div>
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--canvas)', border: '1px solid var(--border-soft)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--ink-faint)', fontWeight: 600 }}>Assessment Requirement</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginTop: '2px' }}>
                    {attachedQuiz ? `Passing Score: ${attachedQuiz.passing_score}%` : 'Standard Completion'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Course Modal */}
        <CourseModal
          isOpen={isCourseModalOpen}
          onClose={() => setIsCourseModalOpen(false)}
          onSuccess={loadCourseData}
          courseToEdit={course}
        />

        {/* Lesson Modal */}
        <LessonModal
          isOpen={isLessonModalOpen}
          onClose={() => setIsLessonModalOpen(false)}
          onSuccess={loadCourseData}
          targetCourse={course}
          lessonToEdit={lessonToEdit}
          defaultOrder={lessonsCount + 1}
        />

        {/* Quiz Modal */}
        <QuizModal
          isOpen={isQuizModalOpen}
          onClose={() => setIsQuizModalOpen(false)}
          onSuccess={loadCourseData}
          courseDocumentId={course.documentId}
          courseTitle={course.title}
          quiz={quizToEdit}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={deleteModalState.isOpen}
          title={deleteModalState.title}
          message={deleteModalState.message || 'This action cannot be undone.'}
          itemType={deleteModalState.type === 'lesson' ? 'Lesson' : 'Quiz'}
          onClose={() => setDeleteModalState({ ...deleteModalState, isOpen: false })}
          onConfirm={handleConfirmDelete}
        />

        {/* Course Enrollment Confirmation Modal */}
        {course && (
          <EnrollConfirmModal
            isOpen={isEnrollModalOpen}
            onClose={() => setIsEnrollModalOpen(false)}
            onConfirm={handleEnroll}
            courseTitle={course.title}
            courseCategory={course.category}
            lessonCount={lessonsCount}
            quizCount={quizzesList.length}
            actionContext={enrollModalContext}
          />
        )}
      </div>
    </AppShell>
  );
}

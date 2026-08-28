'use client';

import React, { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { courseApi, lessonApi, enrollmentApi, quizApi } from '@/lib/api';
import { Course, Lesson, Enrollment, Quiz } from '@/types/content';
import CourseModal from '@/components/CourseModal';
import LessonModal from '@/components/LessonModal';
import QuizModal from '@/components/QuizModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import EnrollConfirmModal from '@/components/EnrollConfirmModal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CoursesPage() {
  const { user, role } = useAuth();
  const isStudent = (role || user?.role_type) === 'student';
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [courseToEnroll, setCourseToEnroll] = useState<Course | null>(null);

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [activeCourseForLesson, setActiveCourseForLesson] = useState<Course | null>(null);
  const [lessonToEdit, setLessonToEdit] = useState<Lesson | null>(null);

  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [activeCourseForQuiz, setActiveCourseForQuiz] = useState<Course | null>(null);
  const [quizToEdit, setQuizToEdit] = useState<Quiz | null>(null);

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    type: 'course' | 'lesson' | 'quiz';
    id: string;
    title: string;
  }>({
    isOpen: false,
    type: 'course',
    id: '',
    title: '',
  });

  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  const canManageGlobal = role === 'admin' || role === 'content_manager';

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [coursesRes, enrollmentsRes] = await Promise.all([
        courseApi.getAll(),
        role === 'student' ? enrollmentApi.getMyEnrollments().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      ]);

      setCourses(coursesRes?.data || []);

      const enrolledIds = new Set<string>();
      (enrollmentsRes?.data || []).forEach((e: Enrollment) => {
        if (e.course?.documentId) enrolledIds.add(e.course.documentId);
      });
      setEnrolledCourseIds(enrolledIds);
    } catch (err) {
      console.error('Failed to load courses data:', err);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const canManageCourse = (course: Course) => {
    if (canManageGlobal) return true;
    if (role === 'instructor') {
      const instId = course.instructor?.id;
      const instDocId = course.instructor?.documentId;
      return (instId && instId === user?.id) || (instDocId && instDocId === user?.documentId);
    }
    return false;
  };

  const handleEnroll = async (course: Course) => {
    setEnrollingCourseId(course.documentId);
    try {
      await enrollmentApi.enroll(course.documentId);
      setToastMessage(`Successfully enrolled in "${course.title}"!`);
      setEnrolledCourseIds((prev) => new Set(prev).add(course.documentId));
      setTimeout(() => {
        router.push('/my-courses');
      }, 1200);
    } catch (err: any) {
      alert(err?.message || 'Failed to enroll in course.');
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const handleOpenCreateCourse = () => {
    setCourseToEdit(null);
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setCourseToEdit(course);
    setIsCourseModalOpen(true);
  };

  const handleOpenAddLesson = (course: Course) => {
    setActiveCourseForLesson(course);
    setLessonToEdit(null);
    setIsLessonModalOpen(true);
  };

  const handleOpenEditLesson = (course: Course, lesson: Lesson) => {
    setActiveCourseForLesson(course);
    setLessonToEdit(lesson);
    setIsLessonModalOpen(true);
  };

  const handleOpenAddQuiz = (course: Course) => {
    setActiveCourseForQuiz(course);
    setQuizToEdit(null);
    setIsQuizModalOpen(true);
  };

  const handleOpenEditQuiz = (course: Course, quiz: Quiz) => {
    setActiveCourseForQuiz(course);
    setQuizToEdit(quiz);
    setIsQuizModalOpen(true);
  };

  const handleDeleteQuizClick = (quiz: Quiz) => {
    setDeleteModalState({
      isOpen: true,
      type: 'quiz',
      id: quiz.documentId,
      title: `Delete Assessment Quiz: "${quiz.title}"?`,
    });
  };

  const handleDeleteCourseClick = (course: Course) => {
    setDeleteModalState({
      isOpen: true,
      type: 'course',
      id: course.documentId,
      title: `Delete Course: "${course.title}"?`,
    });
  };

  const handleDeleteLessonClick = (lesson: Lesson) => {
    setDeleteModalState({
      isOpen: true,
      type: 'lesson',
      id: lesson.documentId,
      title: `Delete Lesson: "${lesson.title}"?`,
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteModalState.type === 'course') {
      await courseApi.delete(deleteModalState.id);
    } else if (deleteModalState.type === 'lesson') {
      await lessonApi.delete(deleteModalState.id);
    } else if (deleteModalState.type === 'quiz') {
      await quizApi.delete(deleteModalState.id);
    }
    loadData();
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(courses.map((c) => c.category).filter(Boolean)))];

  return (
    <ProtectedRoute>
      <AppShell
        title="Courses"
        subtitle={
          canManageGlobal
            ? 'Manage all courses, curriculum syllabus, and author assignments'
            : 'Explore available courses, interactive lessons, and learning tracks'
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Toast feedback */}
          {toastMessage && (
            <div
              style={{
                backgroundColor: 'var(--success-soft)',
                color: 'var(--success)',
                border: '1px solid rgba(22, 163, 74, 0.2)',
                borderRadius: '10px',
                padding: '12px 18px',
                fontSize: '13.5px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{toastMessage} Redirecting to My Courses...</span>
            </div>
          )}

          {/* Header Controls: Search, Filter & Create Button */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '14px',
              border: '1px solid var(--border)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 'min(100%, 280px)', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search courses by keyword..."
                value={searchQuery}
                onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(6);
            }}
                style={{
                  padding: '9px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--canvas)',
                  fontSize: '13px',
                  color: 'var(--ink)',
                  outline: 'none',
                  flex: 1,
                  maxWidth: '320px',
                }}
              />

              <select
                value={selectedCategory}
                onChange={(e) => {
              setSelectedCategory(e.target.value);
              setVisibleCount(6);
            }}
                style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--canvas)',
                  fontSize: '13px',
                  color: 'var(--ink)',
                  outline: 'none',
                }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Create Course button for Admin & Content Manager */}
            {(canManageGlobal || role === 'instructor') && (
              <button
                onClick={handleOpenCreateCourse}
                className="btn-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(242, 102, 42, 0.3)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Create New Course</span>
              </button>
            )}
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--ink-faint)', fontSize: '14px' }}>
              Loading courses and curriculum...
            </div>
          ) : filteredCourses.length === 0 ? (
            <div
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                padding: '48px 24px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}></div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px' }}>
                No courses found
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: 0 }}>
                Try adjusting your search query or category filter.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '20px' }}>
              {filteredCourses.slice(0, visibleCount).map((course) => {
              const lessonsCount = course.lessons?.length || 0;
              const quizzesCount = course.quizzes?.length || 0;
              const isEnrolled = enrolledCourseIds.has(course.documentId);
              const enrollmentCount = (course.enrollments as any[])?.length || 0;
              const isManaged = canManageCourse(course);

              return (
                <div
                  key={course.documentId || course.id}
                  className="interactive-card"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.03)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  {/* Card Cover Banner */}
                  <div
                    style={{
                      height: '115px',
                      background: `linear-gradient(135deg, ${course.cover_color || 'var(--primary)'} 0%, #0F172A 100%)`,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {course.cover_image_url && (
                      <img
                        src={course.cover_image_url}
                        alt={course.title}
                        className="card-media"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    )}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: course.cover_image_url
                          ? 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.7) 100%)'
                          : 'transparent',
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '99px',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            color: 'var(--ink)',
                            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
                          }}
                        >
                          {course.category || 'General'}
                        </span>

                        {isManaged && (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => handleOpenEditCourse(course)}
                              title="Edit Course"
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                                border: 'none',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: 'var(--ink)',
                                cursor: 'pointer',
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCourseClick(course)}
                              title="Delete Course"
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(220, 38, 38, 0.92)',
                                border: 'none',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#FFFFFF',
                                cursor: 'pointer',
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/courses/${course.documentId}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <h3
                          style={{
                            fontSize: '16px',
                            fontWeight: 800,
                            color: '#FFFFFF',
                            margin: 0,
                            textShadow: '0 1px 3px rgba(0, 0, 0, 0.6)',
                            lineHeight: 1.3,
                          }}
                        >
                          {course.title}
                        </h3>
                      </Link>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Description */}
                    <p
                      style={{
                        fontSize: '13px',
                        color: 'var(--ink-soft)',
                        margin: 0,
                        lineHeight: 1.5,
                        flex: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {course.description || 'Master key concepts with structured lessons and interactive assessments.'}
                    </p>

                    {/* Student Progress Bar (Displayed only for enrolled students) */}
                    {role === 'student' && isEnrolled && (() => {
                      const studentPercent = progressMap[course.documentId] ?? progressMap[String(course.id)] ?? 0;
                      return (
                        <div
                          style={{
                            backgroundColor: 'var(--canvas)',
                            borderRadius: '9px',
                            padding: '8px 12px',
                            border: '1px solid var(--border-soft)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', fontWeight: 700 }}>
                            <span style={{ color: 'var(--ink-soft)' }}>Your Progress</span>
                            <span style={{ color: studentPercent === 100 ? 'var(--success)' : 'var(--primary)', fontWeight: 800 }}>
                              {studentPercent}%
                            </span>
                          </div>
                          <div style={{ height: '5px', backgroundColor: 'var(--border-soft)', borderRadius: '99px', overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${studentPercent}%`,
                                backgroundColor: studentPercent === 100 ? 'var(--success)' : 'var(--primary)',
                                borderRadius: '99px',
                                transition: 'width 0.4s ease',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })()}

                    {/* Metric Counts Bar: Lessons, Quizzes, Students - No Instructor Name */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        borderTop: '1px solid var(--border-soft)',
                        paddingTop: '12px',
                        fontSize: '12px',
                        color: 'var(--ink-soft)',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <strong style={{ color: 'var(--primary)', fontWeight: 800 }}>{lessonsCount}</strong> {lessonsCount === 1 ? 'Lesson' : 'Lessons'}
                      </span>
                      <span style={{ color: 'var(--border)' }}>•</span>
                      <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <strong style={{ color: 'var(--role-instructor)', fontWeight: 800 }}>{quizzesCount}</strong> {quizzesCount === 1 ? 'Quiz' : 'Quizzes'}
                      </span>
                      {enrollmentCount > 0 && (
                        <>
                          <span style={{ color: 'var(--border)' }}>•</span>
                          <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <strong style={{ color: '#16A34A', fontWeight: 800 }}>{enrollmentCount}</strong> Enrolled
                          </span>
                        </>
                      )}
                    </div>

                    {/* CTA Action Button */}
                    <div style={{ marginTop: 'auto' }}>
                      {role === 'student' && isEnrolled ? (
                        <Link
                          href={`/courses/${course.documentId}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--success-soft)',
                            color: 'var(--success)',
                            border: '1px solid rgba(22, 163, 74, 0.25)',
                            fontWeight: 700,
                            fontSize: '13px',
                            textDecoration: 'none',
                            boxSizing: 'border-box',
                          }}
                        >
                          <span>Continue Learning →</span>
                        </Link>
                      ) : (
                        <Link
                          href={`/courses/${course.documentId}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            backgroundColor: role === 'student' || !user ? 'var(--primary)' : 'var(--canvas)',
                            color: role === 'student' || !user ? '#FFFFFF' : 'var(--ink)',
                            border: role === 'student' || !user ? 'none' : '1px solid var(--border)',
                            fontWeight: 700,
                            fontSize: '13px',
                            textDecoration: 'none',
                            boxSizing: 'border-box',
                            boxShadow: role === 'student' || !user ? '0 2px 6px rgba(242, 102, 42, 0.25)' : 'none',
                          }}
                        >
                          <span>
                            {role === 'student' || !user
                              ? 'View Details and Enroll →'
                              : canManageCourse(course)
                              ? 'Manage Course →'
                              : 'View Details →'}
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}            </div>
          )}

          {/* Load More Button */}
          {!loading && filteredCourses.length > visibleCount && (
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <button
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="btn-interactive"
                style={{
                  padding: '12px 28px',
                  borderRadius: '99px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink)',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.color = 'var(--primary)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(242, 102, 42, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--ink)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                }}
              >
                <span>Load More Courses</span>
                <span>↓</span>
              </button>
            </div>
          )}
        </div>

        {/* Course Modal */}
        <CourseModal
          isOpen={isCourseModalOpen}
          onClose={() => setIsCourseModalOpen(false)}
          onSuccess={loadData}
          courseToEdit={courseToEdit}
        />

        {/* Lesson Modal */}
        {activeCourseForLesson && (
          <LessonModal
            isOpen={isLessonModalOpen}
            onClose={() => setIsLessonModalOpen(false)}
            onSuccess={loadData}
            targetCourse={activeCourseForLesson}
            lessonToEdit={lessonToEdit}
            defaultOrder={(activeCourseForLesson.lessons?.length || 0) + 1}
          />
        )}

        {/* Quiz Modal */}
        {activeCourseForQuiz && (
          <QuizModal
            isOpen={isQuizModalOpen}
            onClose={() => setIsQuizModalOpen(false)}
            onSuccess={loadData}
            courseDocumentId={activeCourseForQuiz.documentId}
            courseTitle={activeCourseForQuiz.title}
            quiz={quizToEdit}
          />
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={deleteModalState.isOpen}
          onClose={() => setDeleteModalState((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={handleConfirmDelete}
          title={deleteModalState.title}
          message={`Are you sure you want to delete this ${deleteModalState.type}? This action cannot be undone.`}
          itemType={deleteModalState.type}
        />
      </AppShell>
    </ProtectedRoute>
  );
}

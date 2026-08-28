'use client';

import React, { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { courseApi, lessonApi, quizApi } from '@/lib/api';
import { Course, Lesson, Quiz } from '@/types/content';
import CourseModal from '@/components/CourseModal';
import LessonModal from '@/components/LessonModal';
import QuizModal from '@/components/QuizModal';
import Link from 'next/link';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

export default function InstructorCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

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

  const loadMyCourses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await courseApi.getAll();
      const allCourses: Course[] = res?.data || [];

      // Filter courses strictly owned by this instructor (unless admin)
      const myCourses = allCourses.filter((c) => {
        const instId = c.instructor?.id;
        const instDocId = c.instructor?.documentId;
        return (instId && instId === user?.id) || (instDocId && instDocId === user?.documentId);
      });

      setCourses(myCourses);
    } catch (err) {
      console.error('Failed to load instructor courses:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadMyCourses();
  }, [loadMyCourses]);

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
      title: `Assessment Quiz: ${quiz.title}`,
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
    loadMyCourses();
  };

  return (
    <ProtectedRoute allowedRoles={['instructor', 'admin']}>
      <AppShell
        title="Instructor Studio"
        subtitle={`Authored courses and lesson manager for ${user?.username || 'Instructor'}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header Action Banner */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              padding: '24px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                backgroundColor: 'var(--role-instructor)',
              }}
            />

            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '2px 8px',
                  borderRadius: '99px',
                  backgroundColor: 'var(--role-instructor-soft)',
                  color: 'var(--role-instructor)',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'none',
                  marginBottom: '8px',
                }}
              >
                <span></span>
                <span>Instructor Authoring Portal</span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 4px' }}>
                My Authored Courses ({courses.length})
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: 0 }}>
                You have exclusive authoring rights to edit and manage lessons for these courses.
              </p>
            </div>

            <button
              onClick={handleOpenCreateCourse}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 20px',
                borderRadius: '9px',
                backgroundColor: 'var(--role-instructor)',
                color: '#FFFFFF',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(180, 83, 9, 0.3)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Create New Course</span>
            </button>
          </div>

          {/* Courses List */}
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--ink-faint)', fontSize: '14px' }}>
              Loading your authored courses...
            </div>
          ) : courses.length === 0 ? (
            <div
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                padding: '48px 24px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px' }}></div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 6px' }}>
                You have not created any courses yet
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)', maxWidth: '440px', margin: '0 auto 20px' }}>
                Click the button above to publish your first course and start adding sequential lessons.
              </p>
              <button
                onClick={handleOpenCreateCourse}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--role-instructor)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                + Create Your First Course
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {courses.map((course) => {
                const lessonsCount = course.lessons?.length || 0;

                return (
                  <div
                    key={course.documentId}
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderRadius: '16px',
                      border: '1px solid var(--border)',
                      padding: '24px',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                    }}
                  >
                    {/* Course Header Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            backgroundColor: course.cover_color || 'var(--role-instructor)',
                            color: '#FFFFFF',
                            fontWeight: 800,
                            fontSize: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            overflow: 'hidden',
                          }}
                        >
                          {course.cover_image_url ? (
                            <img
                              src={course.cover_image_url}
                              alt={course.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            course.title.charAt(0).toUpperCase()
                          )}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '6px',
                                backgroundColor: 'var(--canvas)',
                                border: '1px solid var(--border-soft)',
                                color: 'var(--ink-soft)',
                                textTransform: 'none',
                              }}
                            >
                              {course.category}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>
                              • {lessonsCount} {lessonsCount === 1 ? 'Lesson' : 'Lessons'}
                            </span>
                          </div>

                          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
                            {course.title}
                          </h3>

                          <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: '4px 0 0', lineHeight: 1.4 }}>
                            {course.description}
                          </p>
                        </div>
                      </div>

                      {/* Course Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenAddLesson(course)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--primary)',
                            color: '#FFFFFF',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: 'none',
                          }}
                        >
                          + Add Lesson
                        </button>

                        <button
                          onClick={() => handleOpenEditCourse(course)}
                          style={{
                            padding: '8px 12px',
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
                          onClick={() => handleDeleteCourseClick(course)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--danger-soft)',
                            border: '1px solid rgba(220, 38, 38, 0.2)',
                            color: 'var(--danger)',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Lessons Management Table */}
                    <div
                      style={{
                        backgroundColor: 'var(--canvas)',
                        borderRadius: '12px',
                        border: '1px solid var(--border-soft)',
                        padding: '14px',
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'none', marginBottom: '10px' }}>
                        Curriculum Lessons
                      </div>

                      {lessonsCount === 0 ? (
                        <div style={{ textAlign: 'center', padding: '16px', fontSize: '12.5px', color: 'var(--ink-faint)' }}>
                          No lessons added yet. Click "+ Add Lesson" to build your course curriculum.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {course.lessons
                            ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                            .map((lesson, idx) => (
                              <div
                                key={lesson.documentId || idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '10px 14px',
                                  borderRadius: '8px',
                                  backgroundColor: 'var(--surface)',
                                  border: '1px solid var(--border)',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                  <span
                                    style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '6px',
                                      backgroundColor: 'var(--role-instructor-soft)',
                                      color: 'var(--role-instructor)',
                                      fontSize: '12px',
                                      fontWeight: 800,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0,
                                    }}
                                  >
                                    {lesson.order || idx + 1}
                                  </span>

                                  <div>
                                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)' }}>
                                      {lesson.title}
                                    </div>
                                    {lesson.video_url && (
                                      <div style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '2px' }}>
                                        Video Link Attached
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <button
                                    onClick={() => handleOpenEditLesson(course, lesson)}
                                    style={{
                                      padding: '5px 10px',
                                      borderRadius: '6px',
                                      backgroundColor: 'var(--canvas)',
                                      border: '1px solid var(--border)',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      color: 'var(--ink)',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Edit Lesson
                                  </button>

                                  <button
                                    onClick={() => handleDeleteLessonClick(lesson)}
                                    style={{
                                      padding: '5px 10px',
                                      borderRadius: '6px',
                                      backgroundColor: 'var(--danger-soft)',
                                      border: '1px solid rgba(220, 38, 38, 0.2)',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      color: 'var(--danger)',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Course Assessment Quiz Management Section */}
                      <div style={{ marginTop: '16px', borderTop: '1px dashed var(--border)', paddingTop: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--role-instructor)', textTransform: 'none' }}>
                            Final Assessment Quiz
                          </div>

                          {(!course.quizzes || course.quizzes.length === 0) && (
                            <button
                              onClick={() => handleOpenAddQuiz(course)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                backgroundColor: 'var(--role-instructor-soft)',
                                color: 'var(--role-instructor)',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                border: '1px solid rgba(180, 83, 9, 0.25)',
                              }}
                            >
                              + Create & Attach Quiz
                            </button>
                          )}
                        </div>

                        {course.quizzes && course.quizzes.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {course.quizzes.map((q) => (
                              <div
                                key={q.documentId || q.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '12px 16px',
                                  borderRadius: '8px',
                                  backgroundColor: 'var(--surface)',
                                  border: '1.5px solid rgba(180, 83, 9, 0.3)',
                                  gap: '10px',
                                }}
                              >
                                <div>
                                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span></span>
                                    <span>{q.title}</span>
                                  </div>
                                  <div style={{ fontSize: '11.5px', color: 'var(--ink-faint)', marginTop: '2px' }}>
                                    {q.questions?.length || 0} Questions • Passing Threshold: <strong style={{ color: 'var(--ink)' }}>{q.passing_score}%</strong>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <Link
                                    href={`/courses/${course.documentId}/quizzes/${q.documentId}`}
                                    style={{
                                      padding: '6px 12px',
                                      borderRadius: '6px',
                                      backgroundColor: 'var(--canvas)',
                                      border: '1px solid var(--border)',
                                      color: 'var(--ink)',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      textDecoration: 'none',
                                    }}
                                  >
                                    Preview Experience →
                                  </Link>

                                  <button
                                    onClick={() => handleOpenEditQuiz(course, q)}
                                    style={{
                                      padding: '6px 12px',
                                      borderRadius: '6px',
                                      backgroundColor: 'var(--canvas)',
                                      border: '1px solid var(--border)',
                                      color: 'var(--ink)',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Edit Quiz
                                  </button>

                                  <button
                                    onClick={() => handleDeleteQuizClick(q)}
                                    style={{
                                      padding: '6px 10px',
                                      borderRadius: '6px',
                                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                      border: '1px solid rgba(239, 68, 68, 0.2)',
                                      color: 'var(--danger)',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ padding: '12px', textAlign: 'center', backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
                            <span style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>
                              No final assessment quiz attached. Attach an MCQ quiz to evaluate students upon course completion.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Course Modal */}
        <CourseModal
          isOpen={isCourseModalOpen}
          onClose={() => setIsCourseModalOpen(false)}
          onSuccess={loadMyCourses}
          courseToEdit={courseToEdit}
        />

        {/* Lesson Modal */}
        {activeCourseForLesson && (
          <LessonModal
            isOpen={isLessonModalOpen}
            onClose={() => setIsLessonModalOpen(false)}
            onSuccess={loadMyCourses}
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
            onSuccess={loadMyCourses}
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
          message={`Are you sure you want to delete this ${deleteModalState.type}?`}
          itemType={deleteModalState.type}
        />
      </AppShell>
    </ProtectedRoute>
  );
}

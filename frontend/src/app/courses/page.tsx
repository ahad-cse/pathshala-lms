'use client';

import React, { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { courseApi, lessonApi, enrollmentApi } from '@/lib/api';
import { Course, Lesson, Enrollment } from '@/types/content';
import CourseModal from '@/components/CourseModal';
import LessonModal from '@/components/LessonModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CoursesPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [activeCourseForLesson, setActiveCourseForLesson] = useState<Course | null>(null);
  const [lessonToEdit, setLessonToEdit] = useState<Lesson | null>(null);

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    type: 'course' | 'lesson';
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
    } else {
      await lessonApi.delete(deleteModalState.id);
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
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
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
                const isManaged = canManageCourse(course);
                const isExpanded = expandedCourseId === course.documentId;
                const lessonsCount = course.lessons?.length || 0;
                const isEnrolled = enrolledCourseIds.has(course.documentId);
                const isEnrolling = enrollingCourseId === course.documentId;
                const firstLesson = course.lessons?.sort((a, b) => (a.order || 0) - (b.order || 0))[0];

                return (
                  <div
                    key={course.documentId}
                    className="interactive-card"
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderRadius: '16px',
                      border: '1px solid var(--border)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                    }}
                  >
                    {/* Course Banner Header */}
                    <div
                      style={{
                        height: '120px',
                        background: `linear-gradient(135deg, ${course.cover_color || 'var(--primary)'} 0%, #0F172A 100%)`,
                        position: 'relative',
                        overflow: 'hidden',
                        color: '#FFFFFF',
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
                            ? 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.75) 100%)'
                            : 'transparent',
                          padding: '16px 20px',
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
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(0, 0, 0, 0.25)',
                            textTransform: 'none',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {course.category}
                        </span>

                        {isManaged && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => handleOpenEditCourse(course)}
                              title="Edit Course Metadata"
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteCourseClick(course)}
                              title="Delete Course"
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(220, 38, 38, 0.8)',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>

                      <h3
                        style={{
                          fontSize: '17px',
                          fontWeight: 800,
                          margin: 0,
                          color: '#FFFFFF',
                          lineHeight: 1.25,
                        }}
                      >
                        {course.title}
                      </h3>
                      </div>
                    </div>

                    {/* Course Details Body */}
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <p
                        style={{
                          fontSize: '13px',
                          color: 'var(--ink-soft)',
                          margin: '0 0 16px',
                          lineHeight: 1.5,
                          flex: 1,
                        }}
                      >
                        {course.description}
                      </p>

                      {/* Instructor & Metadata Footer */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderTop: '1px solid var(--border-soft)',
                          paddingTop: '14px',
                          fontSize: '12.5px',
                          color: 'var(--ink-faint)',
                          marginBottom: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--border-soft)',
                              color: 'var(--ink)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              fontWeight: 700,
                            }}
                          >
                            {course.instructor?.username?.charAt(0).toUpperCase() || 'S'}
                          </span>
                          <span style={{ color: 'var(--ink)', fontWeight: 600 }}>
                            {course.instructor?.username || 'Staff Author'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--ink-soft)' }}>
                            {lessonsCount} {lessonsCount === 1 ? 'Lesson' : 'Lessons'}
                          </span>
                          {course.quizzes && course.quizzes.length > 0 && (
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '2px 7px',
                                borderRadius: '6px',
                                backgroundColor: 'var(--warning-soft)',
                                color: 'var(--warning)',
                                border: '1px solid rgba(245, 158, 11, 0.25)',
                              }}
                            >
                              Quiz Attached
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Student Enrollment CTA Button */}
                      {role === 'student' && (
                        <div style={{ marginBottom: '10px' }}>
                          {isEnrolled ? (
                            <Link
                              href={firstLesson ? `/courses/${course.documentId}/lessons/${firstLesson.documentId}` : '/my-courses'}
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
                              <span>✓ Enrolled • Go to Lessons</span>
                            </Link>
                          ) : (
                            <button
                              onClick={() => handleEnroll(course)}
                              disabled={isEnrolling}
                              style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                backgroundColor: 'var(--primary)',
                                color: '#FFFFFF',
                                fontWeight: 700,
                                fontSize: '13px',
                                cursor: isEnrolling ? 'not-allowed' : 'pointer',
                                opacity: isEnrolling ? 0.7 : 1,
                                border: 'none',
                                boxShadow: '0 2px 6px rgba(242, 102, 42, 0.3)',
                              }}
                            >
                              {isEnrolling ? 'Enrolling...' : '⚡ Enroll in Course (Free)'}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Lesson Management & Syllabus Accordion */}
                      <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <button
                            onClick={() => setExpandedCourseId(isExpanded ? null : course.documentId)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--primary)',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>{isExpanded ? 'Hide Syllabus' : `View Syllabus (${lessonsCount} Lessons)`}</span>
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              style={{
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.15s ease',
                              }}
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </button>

                          {isManaged && (
                            <button
                              onClick={() => handleOpenAddLesson(course)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                backgroundColor: 'var(--primary-soft)',
                                color: 'var(--primary)',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                border: 'none',
                              }}
                            >
                              + Add Lesson
                            </button>
                          )}
                        </div>

                        {/* Expanded Lessons List */}
                        {isExpanded && (
                          <div
                            style={{
                              marginTop: '10px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              backgroundColor: 'var(--canvas)',
                              borderRadius: '10px',
                              padding: '10px',
                            }}
                          >
                            {lessonsCount === 0 ? (
                              <div style={{ fontSize: '12px', color: 'var(--ink-faint)', textAlign: 'center', padding: '12px' }}>
                                No lessons added yet.
                              </div>
                            ) : (
                              course.lessons
                                ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                                .map((lesson, idx) => (
                                  <div
                                    key={lesson.documentId || idx}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '8px 10px',
                                      borderRadius: '6px',
                                      backgroundColor: 'var(--surface)',
                                      border: '1px solid var(--border-soft)',
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                      <span
                                        style={{
                                          width: '20px',
                                          height: '20px',
                                          borderRadius: '4px',
                                          backgroundColor: 'var(--border-soft)',
                                          color: 'var(--ink)',
                                          fontSize: '11px',
                                          fontWeight: 700,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          flexShrink: 0,
                                        }}
                                      >
                                        {lesson.order || idx + 1}
                                      </span>
                                      <span
                                        style={{
                                          fontSize: '12.5px',
                                          fontWeight: 600,
                                          color: 'var(--ink)',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                        }}
                                      >
                                        {lesson.title}
                                      </span>
                                      {lesson.video_url && (
                                        <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>
                                          📹
                                        </span>
                                      )}
                                    </div>

                                    {isManaged && (
                                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                        <button
                                          onClick={() => handleOpenEditLesson(course, lesson)}
                                          title="Edit Lesson"
                                          style={{
                                            padding: '3px 6px',
                                            borderRadius: '4px',
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--ink-soft)',
                                            cursor: 'pointer',
                                          }}
                                        >
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 20h9" />
                                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                          </svg>
                                        </button>
                                        <button
                                          onClick={() => handleDeleteLessonClick(lesson)}
                                          title="Delete Lesson"
                                          style={{
                                            padding: '3px 6px',
                                            borderRadius: '4px',
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--danger)',
                                            cursor: 'pointer',
                                          }}
                                        >
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                          </svg>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))
                            )}

                            {/* Course Assessment Quizzes */}
                            {course.quizzes && course.quizzes.length > 0 && (
                              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border)' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', marginBottom: '6px' }}>
                                  Course Assessment Quiz:
                                </div>
                                {course.quizzes.map((q) => (
                                  <Link
                                    key={q.documentId || q.id}
                                    href={`/courses/${course.documentId}/quiz/${q.documentId}`}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '8px 10px',
                                      borderRadius: '6px',
                                      backgroundColor: 'var(--warning-soft)',
                                      color: 'var(--warning)',
                                      border: '1px solid rgba(245, 158, 11, 0.25)',
                                      textDecoration: 'none',
                                      fontSize: '12px',
                                      fontWeight: 700,
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span>📝</span>
                                      <span>{q.title}</span>
                                    </div>
                                    <span style={{ fontSize: '11px', opacity: 0.9 }}>Pass: {q.passing_score}% →</span>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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

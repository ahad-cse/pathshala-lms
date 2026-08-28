'use client';

import LoadingSpinner from '@/components/LoadingSpinner';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { courseApi } from '@/lib/api';
import { Course } from '@/types/content';
import CourseModal from '@/components/CourseModal';
import Link from 'next/link';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

export default function InstructorCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
  }>({
    isOpen: false,
    id: '',
    title: '',
  });

  const loadMyCourses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await courseApi.getAll();
      const allCourses: Course[] = res?.data || [];

      // Filter courses strictly assigned to this instructor (lead or co-instructor)
      const myCourses = allCourses.filter((c) => {
        const instId = c.instructor?.id;
        const instDocId = c.instructor?.documentId;
        const isLead = (instId && instId === user?.id) || (instDocId && instDocId === user?.documentId);
        const isCo = c.co_instructors?.some(
          (ci) => (ci.id && ci.id === user?.id) || (ci.documentId && ci.documentId === user?.documentId)
        );
        return isLead || isCo;
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

  const handleDeleteCourseClick = (course: Course) => {
    setDeleteModalState({
      isOpen: true,
      id: course.documentId,
      title: `Delete Course: "${course.title}"?`,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await courseApi.delete(deleteModalState.id);
      setToastMessage('Course deleted successfully.');
      setTimeout(() => setToastMessage(null), 3000);
      loadMyCourses();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete course.');
    }
  };

  // Categories list
  const categories = useMemo(() => {
    const cats = new Set<string>();
    courses.forEach((c) => {
      if (c.category) cats.add(c.category);
    });
    return ['All', ...Array.from(cats)];
  }, [courses]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [courses, searchQuery, selectedCategory]);

  return (
    <ProtectedRoute allowedRoles={['instructor']}>
      <AppShell
        title="Course Studio"
        subtitle="Manage your assigned courses, curriculum modules, and interactive assessments."
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
              <span>{toastMessage}</span>
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
                placeholder="Search your courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                onChange={(e) => setSelectedCategory(e.target.value)}
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
          </div>

          {/* Courses Card Grid */}
          {loading ? (
            <LoadingSpinner message="Loading your assigned courses..." minHeight="300px" />
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
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px' }}>
                No courses found
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: 0 }}>
                {courses.length === 0
                  ? 'You have not created or been assigned to any courses yet.'
                  : 'Try adjusting your search query or category filter.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '20px' }}>
              {filteredCourses.map((course) => {
                const lessonsCount = course.lessons?.length || 0;
                const quizzesCount = course.quizzes?.length || 0;
                const enrollmentCount = (course.enrollments as any[])?.length || 0;

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

                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleOpenEditCourse(course);
                              }}
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
                              onClick={(e) => {
                                e.preventDefault();
                                handleDeleteCourseClick(course);
                              }}
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
                        {course.description || 'Structured lessons, modules, and assessment quizzes.'}
                      </p>

                      {/* Metrics Bar */}
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

                      {/* Manage Curriculum Button */}
                      <div style={{ marginTop: 'auto' }}>
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
                            backgroundColor: 'var(--primary)',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: '13px',
                            textDecoration: 'none',
                            boxSizing: 'border-box',
                            boxShadow: '0 2px 6px rgba(242, 102, 42, 0.25)',
                          }}
                        >
                          <span>Manage Curriculum →</span>
                        </Link>
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

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={deleteModalState.isOpen}
          onClose={() => setDeleteModalState((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={handleConfirmDelete}
          title={deleteModalState.title}
          message="Are you sure you want to delete this course? This action cannot be undone."
          itemType="course"
        />
      </AppShell>
    </ProtectedRoute>
  );
}

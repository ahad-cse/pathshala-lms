'use client';

import React, { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { enrollmentApi } from '@/lib/api';
import { Enrollment } from '@/types/content';
import Link from 'next/link';

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await enrollmentApi.getMyEnrollments();
      setEnrollments(res?.data || []);
    } catch (err) {
      console.error('Failed to load my enrollments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  return (
    <ProtectedRoute allowedRoles={['student', 'admin']}>
      <AppShell
        title="My Enrolled Courses"
        subtitle={`Learning tracks and enrolled curriculum for ${user?.username || 'Student'}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header Banner */}
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
                backgroundColor: 'var(--role-student)',
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
                  backgroundColor: 'var(--role-student-soft)',
                  color: 'var(--role-student)',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                <span>🎓</span>
                <span>Active Enrollments</span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 4px' }}>
                Enrolled Courses ({enrollments.length})
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: 0 }}>
                Pick up where you left off, stream video lessons, and complete practice quizzes.
              </p>
            </div>

            <Link
              href="/courses"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
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
              Browse More Courses →
            </Link>
          </div>

          {/* Enrolled Courses Grid */}
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--ink-faint)', fontSize: '14px' }}>
              Loading your learning tracks...
            </div>
          ) : enrollments.length === 0 ? (
            <div
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                padding: '48px 24px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>📖</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 6px' }}>
                You haven't enrolled in any courses yet
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)', maxWidth: '440px', margin: '0 auto 20px' }}>
                Explore the course catalog and enroll in web development and computer science tracks.
              </p>
              <Link
                href="/courses"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '11px 22px',
                  borderRadius: '9px',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(242, 102, 42, 0.3)',
                }}
              >
                Browse Course Catalog →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {enrollments.map((enrollment) => {
                const course = enrollment.course;
                if (!course) return null;

                const sortedLessons = (course.lessons || []).sort((a, b) => (a.order || 0) - (b.order || 0));
                const lessonsCount = sortedLessons.length;
                const firstLesson = sortedLessons[0];
                const targetUrl = firstLesson
                  ? `/courses/${course.documentId}/lessons/${firstLesson.documentId}`
                  : `/courses`;

                return (
                  <div
                    key={enrollment.documentId}
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderRadius: '16px',
                      border: '1px solid var(--border)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                    }}
                  >
                    {/* Course Banner */}
                    <div
                      style={{
                        height: '110px',
                        backgroundColor: course.cover_color || 'var(--primary)',
                        padding: '16px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        color: '#FFFFFF',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(0, 0, 0, 0.25)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          alignSelf: 'flex-start',
                        }}
                      >
                        {course.category}
                      </span>

                      <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#FFFFFF', lineHeight: 1.25 }}>
                        {course.title}
                      </h3>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: '0 0 16px', lineHeight: 1.4, flex: 1 }}>
                        {course.description}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderTop: '1px solid var(--border-soft)',
                          paddingTop: '12px',
                          fontSize: '12px',
                          color: 'var(--ink-faint)',
                          marginBottom: '16px',
                        }}
                      >
                        <span>Instructor: <strong style={{ color: 'var(--ink)' }}>{course.instructor?.username || 'Staff Author'}</strong></span>
                        <span style={{ fontWeight: 600 }}>{lessonsCount} {lessonsCount === 1 ? 'Lesson' : 'Lessons'}</span>
                      </div>

                      {/* Continue Learning Action Button */}
                      <Link
                        href={targetUrl}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '11px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--primary)',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '13.5px',
                          textDecoration: 'none',
                          boxShadow: '0 2px 6px rgba(242, 102, 42, 0.3)',
                        }}
                      >
                        <span>▶ Start / Continue Learning</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

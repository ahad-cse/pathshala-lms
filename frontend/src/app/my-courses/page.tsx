'use client';

import React, { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { enrollmentApi, progressApi } from '@/lib/api';
import { CourseProgress, Enrollment } from '@/types/content';
import Link from 'next/link';

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, CourseProgress>>({});
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);

  const loadEnrollmentsAndProgress = useCallback(async () => {
    try {
      setLoading(true);
      const res = await enrollmentApi.getMyEnrollments();
      const enrollmentList = res?.data || [];
      setEnrollments(enrollmentList);

      // Fetch progress for each course
      const progressPromises = enrollmentList.map(async (e: Enrollment) => {
        if (!e.course?.documentId) return null;
        try {
          const pRes = await progressApi.getCourseProgress(e.course.documentId);
          return { courseId: e.course.documentId, data: pRes.data };
        } catch {
          return null;
        }
      });

      const progressResults = await Promise.all(progressPromises);
      const newProgressMap: Record<string, CourseProgress> = {};
      progressResults.forEach((r) => {
        if (r && r.courseId) {
          newProgressMap[r.courseId] = r.data;
        }
      });
      setProgressMap(newProgressMap);
    } catch (err) {
      console.error('Failed to load my enrollments and progress:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEnrollmentsAndProgress();
  }, [loadEnrollmentsAndProgress]);

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <AppShell
        title="My Enrolled Courses & Progress"
        subtitle={`Live completion progress and enrolled curriculum for ${user?.username || 'Student'}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header Banner */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
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

              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 4px' }}>
                Enrolled Courses ({enrollments.length})
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: 0 }}>
                Pick up where you left off, stream lessons, track completion %, and earn credentials.
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
              Loading your courses and progress records...
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
              <div style={{ fontSize: '36px', marginBottom: '12px' }}></div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 6px' }}>
                You haven't enrolled in any courses yet
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)', maxWidth: '440px', margin: '0 auto 20px' }}>
                Explore the course catalog and enroll in modern web development tracks.
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
                Browse Courses →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
              {enrollments.slice(0, visibleCount).map((enrollment) => {
                const course = enrollment.course;
                if (!course) return null;

                const sortedLessons = (course.lessons || []).sort((a, b) => (a.order || 0) - (b.order || 0));
                const lessonsCount = sortedLessons.length;
                const firstLesson = sortedLessons[0];
                const courseProgress = progressMap[course.documentId];
                const percentage = courseProgress?.percentage || 0;
                const completedCount = courseProgress?.completedLessons || 0;

                const targetUrl = `/courses/${course.documentId}`;

                return (
                  <div
                    key={enrollment.documentId}
                    className="interactive-card"
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
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(0, 0, 0, 0.35)',
                            textTransform: 'none',
                            letterSpacing: '0.04em',
                            alignSelf: 'flex-start',
                          }}
                        >
                          {course.category}
                        </span>

                        <Link href={targetUrl} style={{ textDecoration: 'none' }}>
                          <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#FFFFFF', lineHeight: 1.25 }}>
                            {course.title}
                          </h3>
                        </Link>
                      </div>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: '0 0 16px', lineHeight: 1.4, flex: 1 }}>
                        {course.description}
                      </p>

                      {/* Clean Track Progress Component */}
                      <div
                        style={{
                          backgroundColor: 'var(--canvas)',
                          borderRadius: '10px',
                          padding: '12px 14px',
                          marginBottom: '16px',
                          border: '1px solid var(--border-soft)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
                            {completedCount} of {lessonsCount} lessons completed
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: percentage === 100 ? 'var(--success)' : 'var(--primary)' }}>
                            {percentage}%
                          </span>
                        </div>
                        <div style={{ height: '6px', backgroundColor: 'var(--border-soft)', borderRadius: '99px', overflow: 'hidden' }}>
                          <div
                            className={percentage > 0 && percentage < 100 ? 'progress-shimmer' : ''}
                            style={{
                              height: '100%',
                              width: `${percentage}%`,
                              backgroundColor: percentage === 100 ? 'var(--success)' : 'var(--primary)',
                              borderRadius: '99px',
                              transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                          />
                        </div>
                      </div>

                      {/* Action Button */}
                      <Link
                        href={targetUrl}
                        className="btn-interactive"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '11px',
                          borderRadius: '8px',
                          backgroundColor: percentage === 100 ? 'var(--surface)' : 'var(--primary)',
                          color: percentage === 100 ? 'var(--ink)' : '#FFFFFF',
                          border: percentage === 100 ? '1px solid var(--border)' : 'none',
                          fontWeight: 700,
                          fontSize: '13.5px',
                          textDecoration: 'none',
                          boxShadow: percentage === 100 ? 'none' : '0 2px 6px rgba(242, 102, 42, 0.3)',
                        }}
                      >
                        <span>{percentage === 100 ? 'View Course Details →' : 'Continue Learning →'}</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {!loading && enrollments.length > visibleCount && (
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
      </AppShell>
    </ProtectedRoute>
  );
}

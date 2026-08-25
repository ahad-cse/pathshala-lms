'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppShell from '@/components/AppShell';
import { apiFetch } from '@/lib/api';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await apiFetch('/api/courses');
        setCourses(res?.data || []);
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  return (
    <ProtectedRoute>
      <AppShell title="Course Catalog" subtitle="Explore available courses and learning tracks">
        <div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-faint)' }}>
              Loading courses...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {courses.map((course) => (
                <div
                  key={course.id}
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderRadius: '14px',
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      height: '100px',
                      backgroundColor: course.cover_color || 'var(--primary)',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'flex-end',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '18px',
                    }}
                  >
                    {course.category}
                  </div>
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
                      {course.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--ink-soft)', flex: 1, margin: '0 0 16px', lineHeight: 1.4 }}>
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
                      }}
                    >
                      <span>Instructor: <strong>{course.instructor?.username || 'Staff'}</strong></span>
                      <span>{course.lessons?.length || 0} Lessons</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

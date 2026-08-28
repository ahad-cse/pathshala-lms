'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { enrollmentApi, progressApi, quizSubmissionApi, courseApi } from '@/lib/api';
import { Enrollment, Progress, QuizSubmission, Course } from '@/types/content';

interface EnrolledStudentRecord {
  enrollmentId: string;
  studentId: number | string;
  studentName: string;
  studentEmail: string;
  studentUsername: string;
  studentAvatar?: string;
  courseId: string;
  courseTitle: string;
  courseCategory: string;
  enrolledAt: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  quizSubmission?: {
    score: number;
    passed: boolean;
    submittedAt: string;
    quizTitle: string;
  };
}

export default function StudentProgressTable({
  title = 'Student Course Progress & Assessment Results',
  subtitle = 'Monitor student completion rates, active enrollments, and quiz evaluation scores.',
  allowedCourseId,
}: {
  title?: string;
  subtitle?: string;
  allowedCourseId?: string;
}) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progresses, setProgresses] = useState<Progress[]>([]);
  const [submissions, setQuizSubmissions] = useState<QuizSubmission[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>(allowedCourseId || 'all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadAllAnalyticsData = async () => {
    try {
      setLoading(true);
      const [enrollRes, progRes, subRes, courseRes] = await Promise.all([
        enrollmentApi.getAll().catch(() => ({ data: [] })),
        progressApi.getAll().catch(() => ({ data: [] })),
        quizSubmissionApi.getAll().catch(() => ({ data: [] })),
        courseApi.getAll().catch(() => ({ data: [] })),
      ]);

      setEnrollments(enrollRes?.data || []);
      setProgresses(progRes?.data || []);
      setQuizSubmissions(subRes?.data || []);
      setCourses(courseRes?.data || []);
    } catch (err) {
      console.error('Failed to load progress analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAnalyticsData();
  }, []);

  // Compute joined Student Records
  const records: EnrolledStudentRecord[] = useMemo(() => {
    if (!enrollments || enrollments.length === 0) return [];

    return enrollments.map((enr) => {
      const student = enr.student as any;
      const course = enr.course as any;

      const studentId = student?.id;
      const studentName = student?.full_name || student?.username || 'Student';
      const studentEmail = student?.email || '';
      const studentUsername = student?.username || '';
      const studentAvatar = student?.avatar_url;

      const courseDocId = course?.documentId || (typeof course === 'string' ? course : '');
      const courseId = course?.id;
      const courseTitle = course?.title || 'Selected Course';
      const courseCategory = course?.category || 'General';

      // Find full course to get lessons count
      const matchedCourse = courses.find(
        (c) => (courseDocId && c.documentId === courseDocId) || (courseId && c.id === courseId)
      );
      const totalLessons = matchedCourse?.lessons?.length || course?.lessons?.length || 0;

      // Completed lessons by this student in this course
      const studentCompletedCount = progresses.filter((p: any) => {
        const pStudentId = p.student?.id || (typeof p.student === 'number' ? p.student : null);
        const pCourseId = p.course?.id || (typeof p.course === 'number' ? p.course : null);
        const pCourseDocId = p.course?.documentId;

        const isSameStudent = pStudentId === studentId;
        const isSameCourse =
          (pCourseId && courseId && pCourseId === courseId) ||
          (pCourseDocId && courseDocId && pCourseDocId === courseDocId);

        return isSameStudent && isSameCourse;
      }).length;

      const progressPercent = totalLessons > 0 ? Math.min(100, Math.round((studentCompletedCount / totalLessons) * 100)) : 0;

      // Find latest quiz submission for this student and this course
      const matchedSubmissions = submissions.filter((s: any) => {
        const sStudentId = s.student?.id || (typeof s.student === 'number' ? s.student : null);
        const sCourseDocId = s.quiz?.course?.documentId;
        const sCourseId = s.quiz?.course?.id;

        const isSameStudent = sStudentId === studentId;
        const isSameCourse =
          (sCourseDocId && courseDocId && sCourseDocId === courseDocId) ||
          (sCourseId && courseId && sCourseId === courseId);

        return isSameStudent && isSameCourse;
      });

      const latestSub = matchedSubmissions.length > 0 ? matchedSubmissions[matchedSubmissions.length - 1] : null;

      return {
        enrollmentId: enr.documentId || String(enr.id),
        studentId: studentId || enr.id,
        studentName,
        studentEmail,
        studentUsername,
        studentAvatar,
        courseId: courseDocId,
        courseTitle,
        courseCategory,
        enrolledAt: enr.enrolled_at || (enr as any).createdAt || '',
        totalLessons,
        completedLessons: studentCompletedCount,
        progressPercent,
        quizSubmission: latestSub
          ? {
              score: latestSub.score,
              passed: Boolean(latestSub.passed),
              submittedAt: latestSub.submitted_at || (latestSub as any).createdAt || '',
              quizTitle: latestSub.quiz?.title || 'Course Quiz',
            }
          : undefined,
      };
    });
  }, [enrollments, progresses, submissions, courses]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Course filter
      if (selectedCourseFilter !== 'all' && rec.courseId !== selectedCourseFilter) {
        return false;
      }

      // Status filter
      if (selectedStatusFilter === 'completed' && rec.progressPercent < 100) return false;
      if (selectedStatusFilter === 'in_progress' && (rec.progressPercent === 0 || rec.progressPercent === 100)) return false;
      if (selectedStatusFilter === 'passed' && !rec.quizSubmission?.passed) return false;
      if (selectedStatusFilter === 'failed' && (!rec.quizSubmission || rec.quizSubmission.passed)) return false;
      if (selectedStatusFilter === 'pending_quiz' && rec.quizSubmission) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = rec.studentName.toLowerCase().includes(q);
        const matchesEmail = rec.studentEmail.toLowerCase().includes(q);
        const matchesCourse = rec.courseTitle.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesCourse) return false;
      }

      return true;
    });
  }, [records, selectedCourseFilter, selectedStatusFilter, searchQuery]);

  // Platform Metrics
  const totalStudentsEnrolled = records.length;
  const avgProgress = totalStudentsEnrolled > 0
    ? Math.round(records.reduce((acc, r) => acc + r.progressPercent, 0) / totalStudentsEnrolled)
    : 0;
  const evaluatedCount = records.filter((r) => r.quizSubmission !== undefined).length;
  const passedCount = records.filter((r) => r.quizSubmission?.passed).length;
  const passRate = evaluatedCount > 0 ? Math.round((passedCount / evaluatedCount) * 100) : 0;

  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
      }}
    >
      {/* Header with Metrics */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 4px' }}>
              {title}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: 0 }}>
              {subtitle}
            </p>
          </div>

          <button
            onClick={loadAllAnalyticsData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--canvas)',
              border: '1px solid var(--border)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--ink)',
              cursor: 'pointer',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>Refresh Progress</span>
          </button>
        </div>

        {/* Aggregate Mini KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            marginTop: '16px',
          }}
        >
          <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: 'var(--canvas)', border: '1px solid var(--border-soft)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'none' }}>Total Enrollments</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink)', marginTop: '2px' }}>{totalStudentsEnrolled}</div>
          </div>

          <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: 'var(--canvas)', border: '1px solid var(--border-soft)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'none' }}>Avg. Completion</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--role-student)', marginTop: '2px' }}>{avgProgress}%</div>
          </div>

          <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: 'var(--canvas)', border: '1px solid var(--border-soft)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'none' }}>Quiz Pass Rate</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#16A34A', marginTop: '2px' }}>{passRate}%</div>
          </div>

          <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: 'var(--canvas)', border: '1px solid var(--border-soft)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'none' }}>Pending Evaluations</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--warning)', marginTop: '2px' }}>{totalStudentsEnrolled - evaluatedCount}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--canvas)',
                fontSize: '12.5px',
                color: 'var(--ink)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ position: 'absolute', left: '11px', top: '11px', color: 'var(--ink-faint)' }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>

          {/* Course Filter Dropdown */}
          {!allowedCourseId && (
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--canvas)',
                fontSize: '12.5px',
                color: 'var(--ink)',
                outline: 'none',
                maxWidth: '200px',
              }}
            >
              <option value="all">All Courses ({courses.length})</option>
              {courses.map((c) => (
                <option key={c.documentId || c.id} value={c.documentId || String(c.id)}>
                  {c.title}
                </option>
              ))}
            </select>
          )}

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--canvas)',
              fontSize: '12.5px',
              color: 'var(--ink)',
              outline: 'none',
            }}
          >
            <option value="all">All Progress Status</option>
            <option value="completed">100% Completed Course</option>
            <option value="in_progress">In Progress (&gt;0%)</option>
            <option value="passed">Passed Quiz</option>
            <option value="failed">Failed Quiz</option>
            <option value="pending_quiz">Pending Quiz Evaluation</option>
          </select>
        </div>
      </div>

      {/* Progress Records Data Table */}
      <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--canvas)', borderBottom: '1px solid var(--border)', color: 'var(--ink-faint)', fontSize: '11.5px', fontWeight: 700 }}>
              <th style={{ padding: '12px 16px' }}>Student</th>
              <th style={{ padding: '12px 16px' }}>Enrolled Course</th>
              <th style={{ padding: '12px 16px' }}>Course Progress</th>
              <th style={{ padding: '12px 16px' }}>Final Assessment Quiz</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Enrolled Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: 'var(--ink-soft)' }}>
                  Loading student progress records...
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: 'var(--ink-faint)' }}>
                  No student progress records found matching the active filters.
                </td>
              </tr>
            ) : (
              filteredRecords.map((rec) => {
                return (
                  <tr
                    key={rec.enrollmentId}
                    style={{
                      borderBottom: '1px solid var(--border-soft)',
                      transition: 'background-color 0.1s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--canvas)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Student Column */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {rec.studentAvatar ? (
                          <img
                            src={rec.studentAvatar}
                            alt={rec.studentName}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--role-student-soft)',
                              color: 'var(--role-student)',
                              fontSize: '12px',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {rec.studentName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{rec.studentName}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--ink-faint)' }}>{rec.studentEmail}</div>
                        </div>
                      </div>
                    </td>

                    {/* Course Column */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ink)', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {rec.courseTitle}
                      </div>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--canvas)',
                          border: '1px solid var(--border-soft)',
                          color: 'var(--ink-soft)',
                          marginTop: '2px',
                          display: 'inline-block',
                        }}
                      >
                        {rec.courseCategory}
                      </span>
                    </td>

                    {/* Course Progress Column */}
                    <td style={{ padding: '12px 16px', minWidth: '180px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, color: rec.progressPercent === 100 ? '#16A34A' : 'var(--ink)' }}>
                          {rec.progressPercent}% Complete
                        </span>
                        <span style={{ color: 'var(--ink-faint)' }}>
                          {rec.completedLessons} / {rec.totalLessons} lessons
                        </span>
                      </div>

                      {/* Progress Track Bar */}
                      <div
                        style={{
                          width: '100%',
                          height: '6px',
                          borderRadius: '99px',
                          backgroundColor: 'var(--canvas)',
                          border: '1px solid var(--border-soft)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${rec.progressPercent}%`,
                            height: '100%',
                            backgroundColor: rec.progressPercent === 100 ? '#16A34A' : 'var(--role-student)',
                            borderRadius: '99px',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </td>

                    {/* Quiz Result Column */}
                    <td style={{ padding: '12px 16px' }}>
                      {rec.quizSubmission ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '11.5px',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              backgroundColor: rec.quizSubmission.passed ? 'rgba(22, 163, 74, 0.1)' : 'var(--danger-soft)',
                              color: rec.quizSubmission.passed ? '#16A34A' : 'var(--danger)',
                              border: rec.quizSubmission.passed ? '1px solid rgba(22, 163, 74, 0.25)' : '1px solid rgba(220, 38, 38, 0.25)',
                            }}
                          >
                            {rec.quizSubmission.passed ? 'Passed' : 'Failed'} ({rec.quizSubmission.score}%)
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--ink-faint)', fontStyle: 'italic' }}>
                          Pending Submission
                        </span>
                      )}
                    </td>

                    {/* Date Column */}
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--ink-faint)', fontSize: '12px' }}>
                      {rec.enrolledAt ? new Date(rec.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

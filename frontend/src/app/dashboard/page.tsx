'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/lib/api';
import RoleChangeConfirmModal from '@/components/RoleChangeConfirmModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { AdminStats, AdminUser } from '@/types/content';
import Link from 'next/link';

const ROLE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  admin: { bg: 'var(--role-admin-soft)', text: 'var(--role-admin)', label: 'Admin' },
  content_manager: { bg: 'var(--role-content-soft)', text: 'var(--role-content)', label: 'Content Manager' },
  instructor: { bg: 'var(--role-instructor-soft)', text: 'var(--role-instructor)', label: 'Instructor' },
  student: { bg: 'var(--role-student-soft)', text: 'var(--role-student)', label: 'Student' },
};

export default function DashboardPage() {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updatingUserId, setUpdatingUserId] = useState<number | string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pendingRoleChange, setPendingRoleChange] = useState<{ user: AdminUser; newRole: string } | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<AdminUser | null>(null);

  // Auto-redirect non-admin roles to their respective primary workspace
  useEffect(() => {
    if (isLoading) return;
    if (role === 'instructor') {
      router.replace('/instructor/courses');
    } else if (role === 'content_manager') {
      router.replace('/courses');
    } else if (role === 'student') {
      router.replace('/my-courses');
    }
  }, [role, isLoading, router]);

  const loadAdminData = useCallback(async () => {
    if (role !== 'admin') return;
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    if (role === 'admin') {
      loadAdminData();
    }
  }, [role, loadAdminData]);

  if (isLoading || (role && role !== 'admin')) {
    return (
      <AppShell>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'var(--ink-soft)' }}>
          Redirecting to your workspace...
        </div>
      </AppShell>
    );
  }

  const handleRoleSelect = (targetUser: AdminUser, newRole: string) => {
    if (targetUser.role_type === newRole) return;
    if (targetUser.id === user?.id && newRole !== 'admin') {
      setToastMessage('Action Blocked: You cannot demote your own active admin account.');
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    setPendingRoleChange({ user: targetUser, newRole });
  };

  const handleConfirmRoleChange = async (targetUser: AdminUser, newRole: string) => {
    setUpdatingUserId(targetUser.id);
    try {
      await adminApi.updateUserRole(targetUser.id, newRole);
      setToastMessage(`Updated role for ${targetUser.username} to ${ROLE_COLORS[newRole]?.label}!`);
      setTimeout(() => setToastMessage(null), 3500);
      loadAdminData();
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteClick = (targetUser: AdminUser) => {
    if (targetUser.id === user?.id) {
      setToastMessage('Action Blocked: You cannot delete your own active admin account.');
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    setPendingDeleteUser(targetUser);
  };

  const handleConfirmDeleteUser = async () => {
    if (!pendingDeleteUser) return;
    await adminApi.deleteUser(pendingDeleteUser.id);
    setToastMessage(`Deleted user ${pendingDeleteUser.username}.`);
    setTimeout(() => setToastMessage(null), 3500);
    loadAdminData();
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role_type === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <ProtectedRoute allowedRoles={['admin']}>
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

          {/* Admin Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}>
                Admin Dashboard
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: '4px 0 0' }}>
                Global platform metrics, user directory, and role-based access governance.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link
                href="/courses"
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--canvas)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink)',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Manage Courses
              </Link>
              <Link
                href="/blog"
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Blog Management
              </Link>
            </div>
          </div>

          {/* Platform Metric KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            {/* Total Users */}
            <div
              style={{
                backgroundColor: 'var(--surface)',
                padding: '20px',
                borderRadius: '14px',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-faint)', marginBottom: '6px' }}>
                Total Platform Users
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--role-admin)' }}>
                {stats?.totalUsers ?? '...'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '4px', lineHeight: 1.4 }}>
                {stats?.usersByRole.student ?? 0} students • {stats?.usersByRole.instructor ?? 0} instructors • {stats?.usersByRole.content_manager ?? 0} content managers • {stats?.usersByRole.admin ?? 0} admin
              </div>
            </div>

            {/* Courses & Lessons */}
            <div
              style={{
                backgroundColor: 'var(--surface)',
                padding: '20px',
                borderRadius: '14px',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-faint)', marginBottom: '6px' }}>
                Total Published Courses
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>
                {stats?.totalCourses ?? '...'}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                {stats?.totalLessons ?? 0} total curriculum lessons
              </div>
            </div>

            {/* Enrollments */}
            <div
              style={{
                backgroundColor: 'var(--surface)',
                padding: '20px',
                borderRadius: '14px',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-faint)', marginBottom: '6px' }}>
                Total Enrollments
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--role-student)' }}>
                {stats?.totalEnrollments ?? '...'}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                Active learner registrations
              </div>
            </div>

            {/* Quizzes & Submissions */}
            <div
              style={{
                backgroundColor: 'var(--surface)',
                padding: '20px',
                borderRadius: '14px',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-faint)', marginBottom: '6px' }}>
                Quizzes & Evaluations
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--role-instructor)' }}>
                {stats?.totalQuizzes ?? '...'}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                {stats?.totalSubmissions ?? 0} evaluated submissions
              </div>
            </div>
          </div>

          {/* User Management & Role Directory */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            {/* Header & Controls */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
                  User Management & Role Directory
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)', margin: '2px 0 0' }}>
                  Assign, promote, or demote platform roles in real-time.
                </p>
              </div>

              {/* Search & Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search user or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--canvas)',
                    fontSize: '12.5px',
                    color: 'var(--ink)',
                    outline: 'none',
                    minWidth: '200px',
                  }}
                />

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--canvas)',
                    fontSize: '12.5px',
                    color: 'var(--ink)',
                    outline: 'none',
                  }}
                >
                  <option value="all">All Roles ({users.length})</option>
                  <option value="admin">Admins ({stats?.usersByRole.admin || 0})</option>
                  <option value="content_manager">Content Managers ({stats?.usersByRole.content_manager || 0})</option>
                  <option value="instructor">Instructors ({stats?.usersByRole.instructor || 0})</option>
                  <option value="student">Students ({stats?.usersByRole.student || 0})</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--canvas)', borderBottom: '1px solid var(--border-soft)' }}>
                    <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--ink-soft)' }}>
                      User Identity
                    </th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--ink-soft)' }}>
                      Current Role
                    </th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--ink-soft)' }}>
                      Change Role
                    </th>
                    <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--ink-soft)', textAlign: 'right' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-faint)', fontSize: '13px' }}>
                        Loading user directory...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-faint)', fontSize: '13px' }}>
                        No users found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSelf = u.id === user?.id;
                      const roleConfig = ROLE_COLORS[u.role_type] || ROLE_COLORS.student;
                      const isUpdating = updatingUserId === u.id;

                      return (
                        <tr
                          key={u.id}
                          style={{
                            borderBottom: '1px solid var(--border-soft)',
                            backgroundColor: isSelf ? 'rgba(99, 102, 241, 0.03)' : 'transparent',
                            transition: 'background-color 0.1s ease',
                          }}
                        >
                          {/* User Identity */}
                          <td style={{ padding: '14px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  backgroundColor: roleConfig.bg,
                                  color: roleConfig.text,
                                  fontWeight: 800,
                                  fontSize: '12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                {u.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>{u.username}</span>
                                  {isSelf && (
                                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', backgroundColor: 'var(--role-admin-soft)', color: 'var(--role-admin)' }}>
                                      You
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>{u.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Current Role Badge */}
                          <td style={{ padding: '14px 18px' }}>
                            <span
                              style={{
                                fontSize: '11.5px',
                                fontWeight: 700,
                                padding: '3px 10px',
                                borderRadius: '99px',
                                backgroundColor: roleConfig.bg,
                                color: roleConfig.text,
                                textTransform: 'none',
                                letterSpacing: '0.03em',
                              }}
                            >
                              {roleConfig.label}
                            </span>
                          </td>

                          {/* Change Role Selector */}
                          <td style={{ padding: '14px 18px' }}>
                            {isSelf ? (
                              <span
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  color: 'var(--ink-faint)',
                                }}
                              >
                                —
                              </span>
                            ) : (
                              <select
                                value={u.role_type}
                                disabled={isUpdating}
                                onChange={(e) => handleRoleSelect(u, e.target.value)}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border)',
                                  backgroundColor: 'var(--surface)',
                                  fontSize: '12.5px',
                                  fontWeight: 600,
                                  color: 'var(--ink)',
                                  cursor: 'pointer',
                                  outline: 'none',
                                }}
                              >
                                <option value="student">Student</option>
                                <option value="instructor">Instructor</option>
                                <option value="content_manager">Content Manager</option>
                                <option value="admin">Admin</option>
                              </select>
                            )}
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                            {!isSelf ? (
                              <button
                                onClick={() => handleDeleteClick(u)}
                                title="Delete user"
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  backgroundColor: 'var(--danger-soft)',
                                  border: '1px solid rgba(220, 38, 38, 0.2)',
                                  color: 'var(--danger)',
                                  fontSize: '11.5px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Delete
                              </button>
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Role Change Confirmation Modal */}
        <RoleChangeConfirmModal
          isOpen={!!pendingRoleChange}
          targetUser={pendingRoleChange?.user || null}
          newRole={pendingRoleChange?.newRole || ''}
          onClose={() => setPendingRoleChange(null)}
          onConfirm={handleConfirmRoleChange}
        />

        {/* Delete User Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={!!pendingDeleteUser}
          title={`Delete user account "${pendingDeleteUser?.username}"?`}
          message="This action will permanently delete this user account. This action cannot be undone."
          itemType="User Account"
          onClose={() => setPendingDeleteUser(null)}
          onConfirm={handleConfirmDeleteUser}
        />
      </AppShell>
    </ProtectedRoute>
  );
}

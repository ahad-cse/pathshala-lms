'use client';

import React, { useEffect, useState, useCallback } from 'react';
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

export default function AdminPage() {
  const { user: currentAdmin } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updatingUserId, setUpdatingUserId] = useState<number | string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pendingRoleChange, setPendingRoleChange] = useState<{ user: AdminUser; newRole: string } | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<AdminUser | null>(null);

  const loadAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleRoleSelect = (targetUser: AdminUser, newRole: string) => {
    if (targetUser.role_type === newRole) return;
    if (targetUser.id === currentAdmin?.id && newRole !== 'admin') {
      setToastMessage('⚠️ Action Blocked: You cannot demote your own active admin account.');
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
    if (targetUser.id === currentAdmin?.id) {
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
      <AppShell
        title="Admin Control Center"
        subtitle="Platform governance, role assignment matrix, and ecosystem analytics"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
              <span>✓</span>
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Platform Metric Overview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '16px' }}>
            {/* Card 1: Users */}
            <div
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                padding: '20px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'none' }}>
                  Total Users
                </span>
                <span style={{ fontSize: '18px' }}>👥</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ink)' }}>
                {stats?.totalUsers || 0}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--role-admin-soft)', color: 'var(--role-admin)' }}>
                  Admin: {stats?.usersByRole?.admin || 0}
                </span>
                <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--role-content-soft)', color: 'var(--role-content)' }}>
                  CM: {stats?.usersByRole?.content_manager || 0}
                </span>
                <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--role-instructor-soft)', color: 'var(--role-instructor)' }}>
                  Instr: {stats?.usersByRole?.instructor || 0}
                </span>
                <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--role-student-soft)', color: 'var(--role-student)' }}>
                  Student: {stats?.usersByRole?.student || 0}
                </span>
              </div>
            </div>

            {/* Card 2: Curriculum */}
            <div
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                padding: '20px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'none' }}>
                  Curriculum Library
                </span>
                <span style={{ fontSize: '18px' }}>📚</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ink)' }}>
                {stats?.totalCourses || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                {stats?.totalLessons || 0} Total Published Lessons
              </div>
            </div>

            {/* Card 3: Enrollments */}
            <div
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                padding: '20px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'none' }}>
                  Student Enrollments
                </span>
                <span style={{ fontSize: '18px' }}>🎓</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ink)' }}>
                {stats?.totalEnrollments || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                Active learning enrollments
              </div>
            </div>

            {/* Card 4: Quizzes */}
            <div
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                padding: '20px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'none' }}>
                  Evaluations & Quizzes
                </span>
                <span style={{ fontSize: '18px' }}>📝</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ink)' }}>
                {stats?.totalQuizzes || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                {stats?.totalSubmissions || 0} Graded Submissions
              </div>
            </div>
          </div>

          {/* User Directory & Role Assignment Section */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
            }}
          >
            {/* Table Header & Controls */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 2px' }}>
                  Platform User Directory & Role Assignments
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)', margin: 0 }}>
                  Manage 4-role access levels (Admin, Content Manager, Instructor, Student)
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Filter users by name/email..."
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
                    width: '220px',
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
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="content_manager">Content Manager</option>
                  <option value="instructor">Instructor</option>
                  <option value="student">Student</option>
                </select>
              </div>
            </div>

            {/* User Directory Table */}
            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--ink-faint)', fontSize: '14px' }}>
                Loading user directory...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-soft)' }}>
                No users found matching query.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--canvas)', borderBottom: '1px solid var(--border)', color: 'var(--ink-faint)', fontSize: '11.5px', textTransform: 'none', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '12px 24px', fontWeight: 700 }}>User Identity</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700 }}>Email Address</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700 }}>Current Role</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700 }}>Assign / Change Role</th>
                      <th style={{ padding: '12px 24px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const roleConfig = ROLE_COLORS[u.role_type] || ROLE_COLORS.student;
                      const isSelf = u.id === currentAdmin?.id;
                      const isUpdating = updatingUserId === u.id;

                      return (
                        <tr
                          key={u.id}
                          style={{
                            borderBottom: '1px solid var(--border-soft)',
                            backgroundColor: isSelf ? 'rgba(79, 70, 229, 0.02)' : 'transparent',
                          }}
                        >
                          {/* Username & Avatar */}
                          <td style={{ padding: '14px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  backgroundColor: roleConfig.bg,
                                  color: roleConfig.text,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '12px',
                                  flexShrink: 0,
                                }}
                              >
                                {u.username.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--ink)' }}>
                                  {u.username}
                                  {isSelf && (
                                    <span style={{ fontSize: '10px', color: 'var(--role-admin)', marginLeft: '6px', fontWeight: 700 }}>
                                      (You)
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>
                                  ID: {u.id}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td style={{ padding: '14px 20px', color: 'var(--ink-soft)' }}>
                            {u.email}
                          </td>

                          {/* Role Badge */}
                          <td style={{ padding: '14px 20px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '3px 10px',
                                borderRadius: '99px',
                                backgroundColor: roleConfig.bg,
                                color: roleConfig.text,
                                fontSize: '11.5px',
                                fontWeight: 700,
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: roleConfig.text }} />
                              {roleConfig.label}
                            </span>
                          </td>

                          {/* Change Role Selector */}
                          <td style={{ padding: '14px 20px' }}>
                            <select
                              value={u.role_type}
                              disabled={isUpdating}
                              onChange={(e) => handleRoleSelect(u, e.target.value)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--canvas)',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: 'var(--ink)',
                                outline: 'none',
                                cursor: isUpdating ? 'wait' : 'pointer',
                              }}
                            >
                              <option value="admin">Admin</option>
                              <option value="content_manager">Content Manager</option>
                              <option value="instructor">Instructor</option>
                              <option value="student">Student</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                            {!isSelf && (
                              <button
                                onClick={() => handleDeleteClick(u)}
                                title="Delete User"
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                  color: 'var(--danger)',
                                  border: '1px solid rgba(239, 68, 68, 0.2)',
                                  fontSize: '11.5px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Management Shortcuts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px' }}>
            <Link
              href="/courses"
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                color: 'var(--ink)',
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700 }}>Course & Syllabus Library</h4>
                <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--ink-soft)' }}>Create, edit, and assign instructors</p>
              </div>
              <span style={{ fontSize: '18px' }}>→</span>
            </Link>

            <Link
              href="/quizzes"
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                color: 'var(--ink)',
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700 }}>MCQ Quiz Management</h4>
                <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--ink-soft)' }}>Manage questions, passing scores, keys</p>
              </div>
              <span style={{ fontSize: '18px' }}>→</span>
            </Link>

            <Link
              href="/blog"
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                color: 'var(--ink)',
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700 }}>Blog & Publications</h4>
                <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--ink-soft)' }}>Draft & Publish management</p>
              </div>
              <span style={{ fontSize: '18px' }}>→</span>
            </Link>
          </div>
        </div>
        {/* Role Change Confirmation Modal */}
        <RoleChangeConfirmModal
          isOpen={!!pendingRoleChange}
          onClose={() => setPendingRoleChange(null)}
          onConfirm={handleConfirmRoleChange}
          targetUser={pendingRoleChange?.user || null}
          newRole={pendingRoleChange?.newRole || null}
        />

        {/* Delete User Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={!!pendingDeleteUser}
          onClose={() => setPendingDeleteUser(null)}
          onConfirm={handleConfirmDeleteUser}
          title="Permanently Delete User"
          message={`Are you sure you want to delete user "${pendingDeleteUser?.username}" (${pendingDeleteUser?.email})? This action cannot be undone.`}
          itemType="User"
        />
      </AppShell>
    </ProtectedRoute>
  );
}

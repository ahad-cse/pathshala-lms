'use client';

import React, { useState, useEffect } from 'react';
import { Course, CourseFormData } from '@/types/content';
import { useAuth } from '@/context/AuthContext';
import { courseApi, userApi } from '@/lib/api';
import { User } from '@/types/auth';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  courseToEdit?: Course | null;
}

const CATEGORIES = [
  'Web Development',
  'Computer Science',
  'Data Science & AI',
  'Mobile App Development',
  'DevOps & Cloud',
  'UI/UX Design',
];

const COLOR_PRESETS = [
  { label: 'PathShala Orange', value: '#F2662A' },
  { label: 'Indigo', value: '#4F46E5' },
  { label: 'Teal', value: '#0D9488' },
  { label: 'Amber', value: '#B45309' },
  { label: 'Emerald', value: '#10B981' },
  { label: 'Purple', value: '#8B5CF6' },
];

export default function CourseModal({ isOpen, onClose, onSuccess, courseToEdit }: CourseModalProps) {
  const { user, role } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [coverColor, setCoverColor] = useState(COLOR_PRESETS[0].value);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [instructorId, setInstructorId] = useState<string>('');
  const [instructorsList, setInstructorsList] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isEditing = Boolean(courseToEdit);
  const isAdminOrCM = role === 'admin' || role === 'content_manager';

  // Load instructor list for admin / content manager
  useEffect(() => {
    if (isAdminOrCM && isOpen) {
      userApi.getAll()
        .then((users) => {
          const qualified = users.filter((u) => u.role_type === 'instructor' || u.role_type === 'admin' || u.role_type === 'content_manager');
          setInstructorsList(qualified);
        })
        .catch((err) => console.warn('Could not fetch instructors list:', err));
    }
  }, [isAdminOrCM, isOpen]);

  // Sync form state with courseToEdit or defaults
  useEffect(() => {
    if (courseToEdit) {
      setTitle(courseToEdit.title);
      setDescription(courseToEdit.description);
      setCategory(courseToEdit.category || CATEGORIES[0]);
      setCoverColor(courseToEdit.cover_color || COLOR_PRESETS[0].value);
      setInstructorId(courseToEdit.instructor?.documentId || '');
    } else {
      setTitle('');
      setDescription('');
      setCategory(CATEGORIES[0]);
      setCoverColor(COLOR_PRESETS[0].value);
      setInstructorId(user?.documentId || '');
    }
    setErrorMsg(null);
  }, [courseToEdit, isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please enter both course title and description.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const payload: CourseFormData = {
      title: title.trim(),
      description: description.trim(),
      category,
      cover_color: coverColor,
    };

    if (isAdminOrCM && instructorId) {
      payload.instructor = instructorId;
    }

    try {
      if (isEditing && courseToEdit) {
        await courseApi.update(courseToEdit.documentId, payload);
      } else {
        await courseApi.create(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save course. Ensure you have the required permissions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="modal-content-animated"
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.25)',
          padding: '28px 32px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
              {isEditing ? 'Edit Course' : 'Create New Course'}
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)', margin: '3px 0 0' }}>
              {isEditing ? 'Update course details and metadata' : 'Set up a new curriculum track in PathShala'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              borderRadius: '6px',
              color: 'var(--ink-faint)',
              cursor: 'pointer',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              backgroundColor: 'var(--danger-soft)',
              color: 'var(--danger)',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '12.5px',
              fontWeight: 500,
              marginBottom: '18px',
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)', marginBottom: '5px' }}>
              Course Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Modern Fullstack React & Node.js"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                fontSize: '13.5px',
                color: 'var(--ink)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Category & Cover Color Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)', marginBottom: '5px' }}>
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)',
                  fontSize: '13px',
                  color: 'var(--ink)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)', marginBottom: '5px' }}>
                Cover Accent Color
              </label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', height: '40px' }}>
                {COLOR_PRESETS.map((color) => {
                  const isSelected = coverColor === color.value;
                  return (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setCoverColor(color.value)}
                      title={color.label}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: color.value,
                        border: isSelected ? '2px solid #0F172A' : '2px solid transparent',
                        boxShadow: isSelected ? '0 0 0 2px #FFFFFF' : 'none',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'transform 0.1s ease',
                        transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Instructor Selection for Admin / Content Manager */}
          {isAdminOrCM && (
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)', marginBottom: '5px' }}>
                Assigned Instructor (Admin/CM Override)
              </label>
              <select
                value={instructorId}
                onChange={(e) => setInstructorId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)',
                  fontSize: '13px',
                  color: 'var(--ink)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">-- Assign Instructor --</option>
                {instructorsList.map((inst) => (
                  <option key={inst.documentId || inst.id} value={inst.documentId || inst.id}>
                    {inst.username} ({inst.email}) [{inst.role_type}]
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Cover Image URL */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)' }}>
                Course Cover Image URL (Optional)
              </label>
              {coverImageUrl && (
                <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>Image Linked</span>
              )}
            </div>
            <input
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... (Direct Image Link)"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                fontSize: '13.5px',
                color: 'var(--ink)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {coverImageUrl && (
              <div style={{ marginTop: '8px', borderRadius: '8px', overflow: 'hidden', height: '80px', border: '1px solid var(--border)', position: 'relative' }}>
                <img
                  src={coverImageUrl}
                  alt="Cover Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)', marginBottom: '5px' }}>
              Description & Syllabus Overview *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail what students will learn, prerequisites, and learning outcomes..."
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                fontSize: '13px',
                color: 'var(--ink)',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--ink-soft)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 22px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '13px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 2px 8px rgba(242, 102, 42, 0.3)',
              }}
            >
              {loading ? 'Saving...' : isEditing ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

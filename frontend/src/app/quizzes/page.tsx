'use client';

import React, { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { courseApi, quizApi } from '@/lib/api';
import { Course, Quiz, QuizFormData, QuizQuestion } from '@/types/content';
import Link from 'next/link';

export default function QuizStudioPage() {
  const { user, role } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');

  // Form State
  const [formData, setFormData] = useState<QuizFormData>({
    title: '',
    description: '',
    passing_score: 70,
    course: '',
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correct_option_index: 0,
        explanation: '',
      },
    ],
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [coursesRes, quizzesRes] = await Promise.all([
        courseApi.getAll(),
        quizApi.getAll(),
      ]);

      const allCourses = coursesRes?.data || [];
      const filteredCourses = role === 'instructor'
        ? allCourses.filter((c) => {
            const instId = c.instructor?.id;
            const instDocId = c.instructor?.documentId;
            return (instId && instId === user?.id) || (instDocId && instDocId === user?.documentId);
          })
        : allCourses;

      setMyCourses(filteredCourses);

      const allQuizzes = quizzesRes?.data || [];
      const filteredQuizzes = role === 'instructor'
        ? allQuizzes.filter((q) => {
            const courseDocId = q.course?.documentId;
            return filteredCourses.some((fc) => fc.documentId === courseDocId);
          })
        : allQuizzes;

      setQuizzes(filteredQuizzes);

      if (filteredCourses.length > 0 && !formData.course) {
        setFormData((prev) => ({ ...prev, course: filteredCourses[0].documentId }));
      }
    } catch (err) {
      console.error('Failed to load instructor quizzes data:', err);
    } finally {
      setLoading(false);
    }
  }, [role, user, formData.course]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreateModal = () => {
    setEditingQuiz(null);
    setFormData({
      title: '',
      description: '',
      passing_score: 70,
      course: myCourses[0]?.documentId || '',
      questions: [
        {
          question: '',
          options: ['', '', '', ''],
          correct_option_index: 0,
          explanation: '',
        },
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    const targetCourseDocId = quiz.course?.documentId || (typeof quiz.course === 'string' ? quiz.course : myCourses[0]?.documentId || '');
    setFormData({
      title: quiz.title || '',
      description: quiz.description || '',
      passing_score: quiz.passing_score || 70,
      course: targetCourseDocId,
      questions: quiz.questions && quiz.questions.length > 0 ? quiz.questions : [
        {
          question: '',
          options: ['', '', '', ''],
          correct_option_index: 0,
          explanation: '',
        },
      ],
    });
    setIsModalOpen(true);
  };

  const handleAddQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correct_option_index: 0,
          explanation: '',
        },
      ],
    }));
  };

  const handleRemoveQuestion = (index: number) => {
    if (formData.questions.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleQuestionChange = (qIndex: number, field: keyof QuizQuestion, value: any) => {
    setFormData((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[qIndex] = { ...newQuestions[qIndex], [field]: value };
      return { ...prev, questions: newQuestions };
    });
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    setFormData((prev) => {
      const newQuestions = [...prev.questions];
      const newOptions = [...newQuestions[qIndex].options];
      newOptions[optIndex] = value;
      newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
      return { ...prev, questions: newQuestions };
    });
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a quiz title.');
      return;
    }
    if (!formData.course) {
      alert('Please select a target course.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingQuiz) {
        await quizApi.update(editingQuiz.documentId, formData);
        setToastMessage(`Quiz "${formData.title}" updated successfully!`);
      } else {
        await quizApi.create(formData);
        setToastMessage(`Quiz "${formData.title}" created successfully!`);
      }
      setTimeout(() => setToastMessage(null), 3500);
      setIsModalOpen(false);
      setEditingQuiz(null);
      setFormData({
        title: '',
        description: '',
        passing_score: 70,
        course: myCourses[0]?.documentId || '',
        questions: [
          {
            question: '',
            options: ['', '', '', ''],
            correct_option_index: 0,
            explanation: '',
          },
        ],
      });
      loadData();
    } catch (err: any) {
      alert(err?.message || (editingQuiz ? 'Failed to update quiz.' : 'Failed to create quiz.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuiz = async (quiz: Quiz) => {
    if (!confirm(`Are you sure you want to delete the quiz "${quiz.title}"?`)) return;
    try {
      await quizApi.delete(quiz.documentId);
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete quiz.');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['instructor', 'content_manager', 'admin']}>
      <AppShell
        title="MCQ Quiz Studio & Auto-Grading Engine"
        subtitle="Author interactive MCQ quizzes with server-side answer keys and instant evaluation"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Action Bar */}
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
              gap: '12px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 4px' }}>
                Course Quizzes ({quizzes.length})
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: 0 }}>
                MCQ assessments with automated server-side evaluation.
              </p>
            </div>

            <button
              onClick={handleOpenCreateModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '8px',
                backgroundColor: 'var(--role-instructor)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                boxShadow: '0 2px 6px rgba(180, 83, 9, 0.3)',
              }}
            >
              <span>+ {editingQuiz ? 'Edit MCQ Quiz' : 'Create New MCQ Quiz'}</span>
            </button>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div
              style={{
                backgroundColor: 'var(--success-soft)',
                color: 'var(--success)',
                border: '1px solid rgba(22, 163, 74, 0.25)',
                borderRadius: '10px',
                padding: '12px 18px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Quizzes List */}
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--ink-faint)', fontSize: '14px' }}>
              Loading authored quizzes...
            </div>
          ) : quizzes.length === 0 ? (
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
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 6px' }}>
                No quizzes authored yet
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)', maxWidth: '440px', margin: '0 auto 16px' }}>
                Create multiple choice questions to test your students' understanding.
              </p>
              <button
                onClick={handleOpenCreateModal}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--role-instructor)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                + Create First Quiz
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '20px' }}>
              {quizzes
                .filter((q) => {
                  if (selectedCourseFilter === 'all') return true;
                  const docId = q.course?.documentId || (typeof q.course === 'string' ? q.course : '');
                  const numId = q.course?.id || (typeof q.course === 'number' ? q.course : null);
                  return docId === selectedCourseFilter || (numId !== null && String(numId) === selectedCourseFilter);
                })
                .map((quiz) => {
                const qCount = quiz.questions?.length || 0;
                const matchedCourse = myCourses.find(
                  (c) =>
                    (quiz.course?.documentId && c.documentId === quiz.course.documentId) ||
                    (quiz.course?.id && c.id === quiz.course.id) ||
                    (typeof quiz.course === 'string' && (c.documentId === quiz.course || c.id === quiz.course)) ||
                    (typeof quiz.course === 'number' && c.id === quiz.course)
                );
                const courseTitle = quiz.course?.title || matchedCourse?.title || 'General Curriculum';
                const courseDocId = quiz.course?.documentId || matchedCourse?.documentId || '';

                return (
                  <div
                    key={quiz.documentId}
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderRadius: '16px',
                      border: '1px solid var(--border)',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                    }}
                  >
                    {/* Prominent Parent Course Header Banner */}
                    <div
                      style={{
                        backgroundColor: 'var(--canvas)',
                        border: '1px solid var(--border-soft)',
                        borderRadius: '10px',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <span style={{ fontSize: '16px', flexShrink: 0 }}></span>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'none' }}>
                            Course
                          </div>
                          <div
                            style={{
                              fontSize: '12.5px',
                              fontWeight: 700,
                              color: 'var(--ink)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            title={`Assigned Course: ${courseTitle}`}
                          >
                            {courseTitle}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        <button
                          onClick={() => handleOpenEditModal(quiz)}
                          title="Edit Quiz"
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--surface)',
                            border: '1px solid var(--border)',
                            color: 'var(--ink-soft)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleDeleteQuiz(quiz)}
                          title="Delete Quiz"
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: 'var(--danger)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Quiz Title & Description */}
                    <div>
                      <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 4px', lineHeight: 1.3 }}>
                        {quiz.title}
                      </h3>
                      <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.4 }}>
                        {quiz.description || 'Interactive MCQ assessment.'}
                      </p>
                    </div>

                    {/* Metrics Footer */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid var(--border-soft)',
                        paddingTop: '10px',
                        fontSize: '12px',
                        color: 'var(--ink-faint)',
                        marginTop: 'auto',
                      }}
                    >
                      <span>{qCount} Questions</span>
                      <span>Pass: <strong style={{ color: 'var(--ink)' }}>{quiz.passing_score}%</strong></span>
                    </div>

                    {/* Open / Preview Quiz Button */}
                    <Link
                      href={`/courses/${courseDocId || quiz.course?.documentId || 'c'}/quizzes/${quiz.documentId}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '9px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--canvas)',
                        border: '1px solid var(--border)',
                        color: 'var(--ink)',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      <span>Open Quiz Assessment →</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Quiz Modal */}
        {isModalOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '16px',
                maxWidth: '720px',
                width: '100%',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                border: '1px solid var(--border)',
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
                    Create MCQ Quiz
                  </h3>
                  <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)', margin: '2px 0 0' }}>
                    Define questions, options, and server-side correct answer keys
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    color: 'var(--ink-soft)',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCreateQuiz} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Target Course & Title */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                        Target Course *
                      </label>
                      <select
                        value={formData.course}
                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--canvas)',
                          fontSize: '13px',
                          color: 'var(--ink)',
                          outline: 'none',
                        }}
                      >
                        {myCourses.map((c) => (
                          <option key={c.documentId} value={c.documentId}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                        Passing Score (%) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.passing_score}
                        onChange={(e) => setFormData({ ...formData, passing_score: Number(e.target.value) })}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--canvas)',
                          fontSize: '13px',
                          color: 'var(--ink)',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                      Quiz Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Next.js Routing & Data Fetching Mastery"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--canvas)',
                        fontSize: '13px',
                        color: 'var(--ink)',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                      Description
                    </label>
                    <textarea
                      placeholder="Brief overview of what this assessment covers..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--canvas)',
                        fontSize: '13px',
                        color: 'var(--ink)',
                        outline: 'none',
                        boxSizing: 'border-box',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  {/* Questions Builder */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <label style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--ink)' }}>
                        Questions & Options ({formData.questions.length})
                      </label>
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--role-instructor-soft)',
                          color: 'var(--role-instructor)',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: 'none',
                        }}
                      >
                        + Add Question
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {formData.questions.map((q, qIdx) => (
                        <div
                          key={qIdx}
                          style={{
                            backgroundColor: 'var(--canvas)',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            padding: '16px 18px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--role-instructor)' }}>
                              Question {qIdx + 1}
                            </span>
                            {formData.questions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestion(qIdx)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--danger)',
                                  fontSize: '11.5px',
                                  cursor: 'pointer',
                                }}
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <input
                            type="text"
                            placeholder="Enter question text..."
                            value={q.question}
                            onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)}
                            required
                            style={{
                              width: '100%',
                              padding: '9px 12px',
                              borderRadius: '8px',
                              border: '1px solid var(--border)',
                              backgroundColor: 'var(--surface)',
                              fontSize: '13px',
                              color: 'var(--ink)',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />

                          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-soft)', marginTop: '4px' }}>
                            Options (Pick correct radio):
                          </div>

                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <input
                                type="radio"
                                name={`correct_${qIdx}`}
                                checked={q.correct_option_index === optIdx}
                                onChange={() => handleQuestionChange(qIdx, 'correct_option_index', optIdx)}
                                style={{ cursor: 'pointer' }}
                              />
                              <input
                                type="text"
                                placeholder={`Option ${optIdx + 1}`}
                                value={opt}
                                onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                                required
                                style={{
                                  flex: 1,
                                  padding: '8px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border)',
                                  backgroundColor: 'var(--surface)',
                                  fontSize: '12.5px',
                                  color: 'var(--ink)',
                                  outline: 'none',
                                }}
                              />
                            </div>
                          ))}

                          <input
                            type="text"
                            placeholder="Explanation (shown to student after evaluation)..."
                            value={q.explanation || ''}
                            onChange={(e) => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-soft)',
                              backgroundColor: 'var(--surface)',
                              fontSize: '12px',
                              color: 'var(--ink-soft)',
                              outline: 'none',
                              boxSizing: 'border-box',
                              marginTop: '4px',
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div
                  style={{
                    padding: '16px 24px',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--canvas)',
                      border: '1px solid var(--border)',
                      color: 'var(--ink)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: '10px 22px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--role-instructor)',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      border: 'none',
                    }}
                  >
                    {submitting ? 'Creating...' : 'Create MCQ Quiz'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}

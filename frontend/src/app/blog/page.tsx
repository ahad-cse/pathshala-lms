'use client';

import React, { useEffect, useState, useCallback } from 'react';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { blogApi } from '@/lib/api';
import { BlogPost, BlogPostFormData } from '@/types/content';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import PublishConfirmModal from '@/components/PublishConfirmModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-faint)' }}>Loading Rich-Text Editor...</div>,
});

export default function BlogPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'published' | 'draft'>('all');

  // Modal State for Authoring
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<BlogPostFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image_url: '',
    is_published: false,
  });
  const [submitting, setSubmitting] = useState(false);

  // Modals for Publish and Delete confirmations
  const [publishModalState, setPublishModalState] = useState<{
    isOpen: boolean;
    post: BlogPost | null;
    isPublishing: boolean;
  }>({
    isOpen: false,
    post: null,
    isPublishing: true,
  });

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    post: BlogPost | null;
  }>({
    isOpen: false,
    post: null,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canAuthor = user && (user.role_type === 'admin' || user.role_type === 'content_manager');

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await blogApi.getAll();
      setPosts(res.data || []);
    } catch (err) {
      console.error('Failed to load blog posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const openCreateModal = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      cover_image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
      is_published: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      cover_image_url: post.cover_image_url || '',
      is_published: post.is_published,
    });
    setIsModalOpen(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('Please provide both a title and article content.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingPost) {
        await blogApi.update(editingPost.documentId, formData);
        setToastMessage(`Updated article "${formData.title}"`);
      } else {
        await blogApi.create(formData);
        setToastMessage(`Created article "${formData.title}"`);
      }
      setIsModalOpen(false);
      setTimeout(() => setToastMessage(null), 3000);
      loadPosts();
    } catch (err: any) {
      alert(err?.message || 'Failed to save blog post.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenPublishModal = (post: BlogPost) => {
    setPublishModalState({
      isOpen: true,
      post,
      isPublishing: !post.is_published,
    });
  };

  const handleConfirmPublish = async () => {
    if (!publishModalState.post) return;
    const post = publishModalState.post;
    const nextStatus = !post.is_published;
    await blogApi.update(post.documentId, { is_published: nextStatus });
    setToastMessage(nextStatus ? `Published "${post.title}"!` : `Moved "${post.title}" to drafts.`);
    setTimeout(() => setToastMessage(null), 3000);
    await loadPosts();
  };

  const handleOpenDeleteModal = (post: BlogPost) => {
    setDeleteModalState({
      isOpen: true,
      post,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalState.post) return;
    await blogApi.delete(deleteModalState.post.documentId);
    setToastMessage(`Deleted "${deleteModalState.post.title}"`);
    setTimeout(() => setToastMessage(null), 3000);
    await loadPosts();
  };

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.excerpt && p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterMode === 'published') return matchesSearch && p.is_published;
    if (filterMode === 'draft') return matchesSearch && !p.is_published;
    return matchesSearch;
  });

  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const remainingPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : [];

  return (
    <AppShell
      title="Blog"
      subtitle="Engineering essays, architectural walkthroughs, and learning resources"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Toast Feedback */}
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

        {/* Toolbar Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            paddingBottom: '4px',
          }}
        >
          {/* Search & Author Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search articles & guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                fontSize: '13px',
                color: 'var(--ink)',
                outline: 'none',
                width: '260px',
              }}
            />

            {canAuthor && (
              <div style={{ display: 'inline-flex', backgroundColor: 'var(--canvas)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <button
                  onClick={() => setFilterMode('all')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: filterMode === 'all' ? 'var(--surface)' : 'transparent',
                    color: filterMode === 'all' ? 'var(--ink)' : 'var(--ink-soft)',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  All ({posts.length})
                </button>
                <button
                  onClick={() => setFilterMode('published')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: filterMode === 'published' ? 'var(--surface)' : 'transparent',
                    color: filterMode === 'published' ? 'var(--success)' : 'var(--ink-soft)',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Published ({posts.filter((p) => p.is_published).length})
                </button>
                <button
                  onClick={() => setFilterMode('draft')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: filterMode === 'draft' ? 'var(--surface)' : 'transparent',
                    color: filterMode === 'draft' ? 'var(--warning)' : 'var(--ink-soft)',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Drafts ({posts.filter((p) => !p.is_published).length})
                </button>
              </div>
            )}
          </div>

          {/* Author CTA */}
          {canAuthor && (
            <button
              onClick={openCreateModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '8px',
                backgroundColor: 'var(--role-content)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(13, 148, 136, 0.25)',
              }}
            >
              <span>+</span>
              <span>Write New Article</span>
            </button>
          )}
        </div>

        {/* Content Feed */}
        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center', color: 'var(--ink-faint)', fontSize: '14px' }}>
            Loading publications...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div
            style={{
              padding: '60px',
              textAlign: 'center',
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
              No Articles Found
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: 0 }}>
              {canAuthor ? 'Click "+ Write New Article" to draft your first rich-text engineering post.' : 'Check back soon for new publications.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Featured Post Card */}
            {featuredPost && (
              <div
                style={{
                  backgroundColor: 'var(--surface)',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                }}
              >
                {/* Cover Image */}
                <div
                  style={{
                    height: '280px',
                    backgroundImage: `url(${featuredPost.cover_image_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      padding: '4px 10px',
                      borderRadius: '99px',
                      backgroundColor: 'rgba(0, 0, 0, 0.65)',
                      backdropFilter: 'blur(8px)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'none',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Featured Story
                  </div>

                  {canAuthor && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        padding: '4px 10px',
                        borderRadius: '99px',
                        backgroundColor: featuredPost.is_published ? 'var(--success)' : 'var(--warning)',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      {featuredPost.is_published ? 'Published' : 'Draft'}
                    </div>
                  )}
                </div>

                {/* Body Content */}
                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--ink-faint)', marginBottom: '10px' }}>
                      <span>By {featuredPost.author?.username || 'Editorial Team'}</span>
                      <span>•</span>
                      <span>{featuredPost.published_date ? new Date(featuredPost.published_date).toLocaleDateString() : 'Draft'}</span>
                    </div>

                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 10px', lineHeight: 1.3 }}>
                      <Link href={`/blog/${featuredPost.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {featuredPost.title}
                      </Link>
                    </h2>

                    <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.6, margin: '0 0 20px' }}>
                      {featuredPost.excerpt || featuredPost.content.replace(/<[^>]*>?/gm, '').slice(0, 160) + '...'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 700,
                        color: 'var(--primary)',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      Read Full Story →
                    </Link>

                    {canAuthor && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenPublishModal(featuredPost)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: featuredPost.is_published ? 'var(--warning-soft)' : 'var(--success-soft)',
                            color: featuredPost.is_published ? 'var(--warning)' : 'var(--success)',
                            border: 'none',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {featuredPost.is_published ? 'Unpublish' : 'Publish'}
                        </button>

                        <button
                          onClick={() => openEditModal(featuredPost)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--canvas)',
                            border: '1px solid var(--border)',
                            color: 'var(--ink)',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleOpenDeleteModal(featuredPost)}
                          style={{
                            padding: '6px 12px',
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
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Remaining Grid of Articles */}
            {remainingPosts.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 290px), 1fr))', gap: '20px' }}>
                {remainingPosts.map((post) => (
                  <div
                    key={post.id}
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderRadius: '14px',
                      border: '1px solid var(--border)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                    }}
                  >
                    {/* Cover Thumbnail */}
                    <div
                      style={{
                        height: '160px',
                        backgroundImage: `url(${post.cover_image_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                      }}
                    >
                      {canAuthor && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            padding: '3px 8px',
                            borderRadius: '99px',
                            backgroundColor: post.is_published ? 'var(--success)' : 'var(--warning)',
                            color: '#FFFFFF',
                            fontSize: '10.5px',
                            fontWeight: 800,
                          }}
                        >
                          {post.is_published ? 'Published' : 'Draft'}
                        </div>
                      )}
                    </div>

                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '11.5px', color: 'var(--ink-faint)', marginBottom: '8px' }}>
                          {post.published_date ? new Date(post.published_date).toLocaleDateString() : 'Draft'} • By {post.author?.username || 'Editorial'}
                        </div>

                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 8px', lineHeight: 1.4 }}>
                          <Link href={`/blog/${post.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {post.title}
                          </Link>
                        </h3>

                        <p style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.5, margin: 0 }}>
                          {post.excerpt || post.content.replace(/<[^>]*>?/gm, '').slice(0, 110) + '...'}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-soft)', paddingTop: '12px' }}>
                        <Link
                          href={`/blog/${post.slug}`}
                          style={{
                            fontSize: '12.5px',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            textDecoration: 'none',
                          }}
                        >
                          Read Article →
                        </Link>

                        {canAuthor && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => handleOpenPublishModal(post)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                backgroundColor: post.is_published ? 'var(--warning-soft)' : 'var(--success-soft)',
                                color: post.is_published ? 'var(--warning)' : 'var(--success)',
                                border: 'none',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              {post.is_published ? 'Unpublish' : 'Publish'}
                            </button>
                            <button
                              onClick={() => openEditModal(post)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                backgroundColor: 'var(--canvas)',
                                border: '1px solid var(--border)',
                                color: 'var(--ink)',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleOpenDeleteModal(post)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                color: 'var(--danger)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Publish / Unpublish Confirmation Modal */}
        {publishModalState.post && (
          <PublishConfirmModal
            isOpen={publishModalState.isOpen}
            onClose={() => setPublishModalState((prev) => ({ ...prev, isOpen: false }))}
            onConfirm={handleConfirmPublish}
            title={publishModalState.isPublishing ? 'Publish Article to Platform' : 'Unpublish Article to Drafts'}
            articleTitle={publishModalState.post.title}
            isPublishing={publishModalState.isPublishing}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalState.post && (
          <DeleteConfirmModal
            isOpen={deleteModalState.isOpen}
            onClose={() => setDeleteModalState((prev) => ({ ...prev, isOpen: false }))}
            onConfirm={handleConfirmDelete}
            title="Delete Article"
            message={`Are you sure you want to permanently delete "${deleteModalState.post.title}"? This action cannot be undone.`}
            itemType="article"
          />
        )}

        {/* Modal: Write / Edit Article with TipTap WYSIWYG Editor */}
        {isModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '20px',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                width: '100%',
                maxWidth: '740px',
                maxHeight: '92vh',
                overflowY: 'auto',
                padding: '28px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 2px' }}>
                    {editingPost ? 'Edit Blog Article' : 'WYSIWYG Rich-Text Article Studio'}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--ink-soft)', margin: 0 }}>
                    Powered by TipTap Rich Text Engine (Bold, Headings, Lists, Quotes & Code Blocks)
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', color: 'var(--ink-faint)', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSavePost} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Mastering Asynchronous Patterns in JavaScript"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--canvas)',
                      fontSize: '13.5px',
                      color: 'var(--ink)',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                    Short Summary / Excerpt
                  </label>
                  <input
                    type="text"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Brief 1-2 sentence overview shown on publication cards"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--canvas)',
                      fontSize: '13px',
                      color: 'var(--ink)',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.cover_image_url}
                    onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--canvas)',
                      fontSize: '13px',
                      color: 'var(--ink)',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* TipTap WYSIWYG Rich Text Editor */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                    Article Body (WYSIWYG Rich Text) *
                  </label>
                  <RichTextEditor
                    content={formData.content}
                    onChange={(html) => setFormData({ ...formData, content: html })}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--canvas)', padding: '12px 16px', borderRadius: '8px' }}>
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--role-content)', cursor: 'pointer' }}
                  />
                  <label htmlFor="is_published" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', cursor: 'pointer' }}>
                    Publish immediately (Make visible to public visitors & students)
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
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
                      backgroundColor: 'var(--role-content)',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? 0.7 : 1,
                    }}
                  >
                    {submitting ? 'Saving...' : editingPost ? 'Save Changes' : 'Create Article'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

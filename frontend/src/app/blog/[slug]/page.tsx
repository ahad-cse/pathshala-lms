'use client';

import LoadingSpinner from '@/components/LoadingSpinner';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { blogApi } from '@/lib/api';
import { BlogPost } from '@/types/content';
import Link from 'next/link';

export default function SingleBlogPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user } = useAuth();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canAuthor = user && (user.role_type === 'admin' || user.role_type === 'content_manager');

  useEffect(() => {
    async function loadPost() {
      if (!slug) return;
      try {
        setLoading(true);
        const res = await blogApi.getOne(slug);
        setPost(res.data);
      } catch (err: any) {
        console.error('Failed to load blog:', err);
        setError(err?.message || 'Blog not found or in draft mode.');
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [slug]);

  const renderInlineFormatted = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ fontWeight: 800, color: 'var(--ink)' }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} style={{ fontStyle: 'italic', color: 'var(--ink)' }}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            style={{
              backgroundColor: 'var(--canvas)',
              border: '1px solid var(--border)',
              padding: '2px 6px',
              borderRadius: '5px',
              fontSize: '0.88em',
              fontFamily: 'monospace',
              color: 'var(--primary)',
              fontWeight: 600,
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const renderRichMarkdown = (content: string) => {
    const isHtml = content.trim().startsWith('<');
    if (isHtml) {
      return (
        <div
          className="rich-article-html"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    return content.split('\n\n').map((block, idx) => {
      const trimmed = block.trim();

      // Heading 3
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: '26px 0 10px', letterSpacing: '-0.01em' }}>
            {renderInlineFormatted(trimmed.replace('### ', ''))}
          </h3>
        );
      }

      // Heading 2
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ink)', margin: '34px 0 12px', letterSpacing: '-0.02em' }}>
            {renderInlineFormatted(trimmed.replace('## ', ''))}
          </h2>
        );
      }

      // Heading 1
      if (trimmed.startsWith('# ')) {
        return (
          <h1 key={idx} style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink)', margin: '38px 0 16px', letterSpacing: '-0.02em' }}>
            {renderInlineFormatted(trimmed.replace('# ', ''))}
          </h1>
        );
      }

      // Code block (``` ... ```)
      if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
        const lines = trimmed.split('\n');
        const codeLines = lines.slice(1, -1).join('\n');
        return (
          <pre
            key={idx}
            style={{
              backgroundColor: '#0F172A',
              color: '#E2E8F0',
              padding: '18px 20px',
              borderRadius: '12px',
              overflowX: 'auto',
              fontSize: '13.5px',
              lineHeight: 1.6,
              fontFamily: 'monospace',
              margin: '20px 0',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <code>{codeLines || trimmed.slice(3, -3)}</code>
          </pre>
        );
      }

      // Blockquote (> ...)
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            style={{
              margin: '18px 0',
              padding: '12px 20px',
              borderLeft: '4px solid var(--role-content)',
              backgroundColor: 'var(--role-content-soft)',
              borderRadius: '0 8px 8px 0',
              color: 'var(--ink)',
              fontSize: '14.5px',
              fontStyle: 'italic',
              lineHeight: 1.7,
            }}
          >
            {renderInlineFormatted(trimmed.replace(/^>\s*/, ''))}
          </blockquote>
        );
      }

      // Bullet list (- or *)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const lines = trimmed.split('\n');
        return (
          <ul key={idx} style={{ margin: '14px 0', paddingLeft: '24px', color: 'var(--ink)' }}>
            {lines.map((line, lIdx) => (
              <li key={lIdx} style={{ fontSize: '14.5px', lineHeight: 1.7, marginBottom: '6px' }}>
                {renderInlineFormatted(line.replace(/^[-*]\s+/, ''))}
              </li>
            ))}
          </ul>
        );
      }

      // Numbered list (1. , 2. )
      if (/^\d+\.\s/.test(trimmed)) {
        const lines = trimmed.split('\n');
        return (
          <ol key={idx} style={{ margin: '14px 0', paddingLeft: '24px', color: 'var(--ink)' }}>
            {lines.map((line, lIdx) => (
              <li key={lIdx} style={{ fontSize: '14.5px', lineHeight: 1.7, marginBottom: '6px' }}>
                {renderInlineFormatted(line.replace(/^\d+\.\s+/, ''))}
              </li>
            ))}
          </ol>
        );
      }

      // Regular Paragraph
      return (
        <p key={idx} style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--ink)', margin: '0 0 18px' }}>
          {renderInlineFormatted(trimmed)}
        </p>
      );
    });
  };

  return (
    <ProtectedRoute>
      <AppShell
      title={post?.title || 'Knowledge Publication'}
      subtitle={post ? (post.published_date ? `Published on ${new Date(post.published_date).toLocaleDateString(undefined, { dateStyle: 'long' })}` : 'Draft Publication') : 'PathShala LMS'}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link
            href="/blog"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--primary)',
              textDecoration: 'none',
            }}
          >
            ← Back to Blog
          </Link>

          {post && canAuthor && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '99px',
                  backgroundColor: post.is_published ? 'var(--success-soft)' : 'var(--warning-soft)',
                  color: post.is_published ? 'var(--success)' : 'var(--warning)',
                }}
              >
                {post.is_published ? 'Published' : 'Draft Mode'}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center', color: 'var(--ink-faint)', fontSize: '14px' }}>
            Loading blog...
          </div>
        ) : error || !post ? (
          <div
            style={{
              padding: '60px',
              textAlign: 'center',
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '12px' }}></div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px' }}>
              Blog Not Accessible
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: '0 0 20px' }}>
              {error || 'This blog is currently in draft mode or does not exist.'}
            </p>
            <Link
              href="/blog"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Browse Published Blogs
            </Link>
          </div>
        ) : (
          <article
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
            }}
          >
            {/* Cover Header Banner */}
            {post.cover_image_url && (
              <div
                style={{
                  height: '320px',
                  backgroundImage: `url(${post.cover_image_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            )}

            <div style={{ padding: '36px 40px' }}>
              {/* Metadata: Date */}
              {post.published_date && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--ink-faint)',
                    marginBottom: '16px',
                    backgroundColor: 'var(--canvas)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-soft)',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{new Date(post.published_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                </div>
              )}

              {/* Title & Excerpt */}
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 12px', lineHeight: 1.3 }}>
                {post.title}
              </h1>

              {post.excerpt && (
                <div
                  style={{
                    fontSize: '16px',
                    color: 'var(--ink-soft)',
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                    marginBottom: '28px',
                    paddingLeft: '16px',
                    borderLeft: '3px solid var(--primary)',
                  }}
                >
                  {post.excerpt}
                </div>
              )}

              {/* Formatted Rich Content */}
              <div style={{ marginTop: '24px' }}>
                {renderRichMarkdown(post.content)}
              </div>
            </div>
          </article>
        )}
      </div>

      <style jsx global>{`
        .rich-article-html {
          font-size: 15px;
          line-height: 1.8;
          color: var(--ink);
        }
        .rich-article-html p {
          margin: 0 0 18px;
        }
        .rich-article-html h1 {
          font-size: 26px;
          font-weight: 800;
          margin: 36px 0 16px;
          color: var(--ink);
        }
        .rich-article-html h2 {
          font-size: 22px;
          font-weight: 800;
          margin: 32px 0 12px;
          color: var(--ink);
        }
        .rich-article-html h3 {
          font-size: 18px;
          font-weight: 800;
          margin: 24px 0 10px;
          color: var(--ink);
        }
        .rich-article-html ul,
        .rich-article-html ol {
          padding-left: 28px;
          margin: 14px 0 18px;
        }
        .rich-article-html li {
          margin-bottom: 6px;
        }
        .rich-article-html blockquote {
          margin: 18px 0;
          padding: 12px 20px;
          border-left: 4px solid var(--role-content);
          background-color: var(--role-content-soft);
          border-radius: 0 8px 8px 0;
          color: var(--ink);
          font-style: italic;
        }
        .rich-article-html pre {
          background-color: #0F172A;
          color: #E2E8F0;
          padding: 18px 20px;
          border-radius: 12px;
          overflow-x: auto;
          font-size: 13.5px;
          line-height: 1.6;
          font-family: monospace;
          margin: 20px 0;
        }
        .rich-article-html hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 28px 0;
        }
      `}</style>
    </AppShell>
    </ProtectedRoute>
  );
}

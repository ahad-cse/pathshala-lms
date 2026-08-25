'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing your engineering article here...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: content || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--ink-faint)', backgroundColor: 'var(--canvas)', borderRadius: '8px' }}>
        Loading Rich Text Studio...
      </div>
    );
  }

  const toolbarBtnStyle = (isActive: boolean) => ({
    padding: '5px 9px',
    borderRadius: '5px',
    border: '1px solid',
    borderColor: isActive ? 'var(--role-content)' : 'var(--border)',
    backgroundColor: isActive ? 'var(--role-content-soft)' : 'var(--surface)',
    color: isActive ? 'var(--role-content)' : 'var(--ink)',
    fontSize: '12px',
    fontWeight: isActive ? 800 : 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.12s ease',
  });

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: '10px',
        overflow: 'hidden',
        backgroundColor: 'var(--canvas)',
      }}
    >
      {/* WYSIWYG Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '8px 10px',
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          flexWrap: 'wrap',
        }}
      >
        {/* Bold */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={toolbarBtnStyle(editor.isActive('bold'))}
          title="Bold (Cmd+B)"
        >
          <strong>B</strong>
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={toolbarBtnStyle(editor.isActive('italic'))}
          title="Italic (Cmd+I)"
        >
          <em>I</em>
        </button>

        {/* Strike */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          style={toolbarBtnStyle(editor.isActive('strike'))}
          title="Strikethrough"
        >
          <s>S</s>
        </button>

        <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border)', margin: '0 4px' }} />

        {/* Heading 1 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          style={toolbarBtnStyle(editor.isActive('heading', { level: 1 }))}
          title="Heading 1"
        >
          H1
        </button>

        {/* Heading 2 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          style={toolbarBtnStyle(editor.isActive('heading', { level: 2 }))}
          title="Heading 2"
        >
          H2
        </button>

        {/* Heading 3 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          style={toolbarBtnStyle(editor.isActive('heading', { level: 3 }))}
          title="Heading 3"
        >
          H3
        </button>

        <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border)', margin: '0 4px' }} />

        {/* Bullet List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          style={toolbarBtnStyle(editor.isActive('bulletList'))}
          title="Bullet List"
        >
          • Bullet
        </button>

        {/* Numbered List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          style={toolbarBtnStyle(editor.isActive('orderedList'))}
          title="Numbered List"
        >
          1. List
        </button>

        {/* Blockquote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          style={toolbarBtnStyle(editor.isActive('blockquote'))}
          title="Blockquote"
        >
          “ Quote
        </button>

        {/* Code Block */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          style={toolbarBtnStyle(editor.isActive('codeBlock'))}
          title="Code Block"
        >
          &lt;/&gt; Code
        </button>

        <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border)', margin: '0 4px' }} />

        {/* Horizontal Rule */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          style={toolbarBtnStyle(false)}
          title="Divider Line"
        >
          ― Line
        </button>

        {/* Undo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          style={{ ...toolbarBtnStyle(false), opacity: editor.can().undo() ? 1 : 0.4 }}
          title="Undo (Cmd+Z)"
        >
          ↩ Undo
        </button>

        {/* Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          style={{ ...toolbarBtnStyle(false), opacity: editor.can().redo() ? 1 : 0.4 }}
          title="Redo (Cmd+Shift+Z)"
        >
          ↪ Redo
        </button>
      </div>

      {/* Editable Canvas */}
      <div style={{ padding: '16px', minHeight: '220px', maxHeight: '380px', overflowY: 'auto' }}>
        <EditorContent editor={editor} className="tiptap-editor-content" />
      </div>

      {/* Internal CSS for Editor typography */}
      <style jsx global>{`
        .tiptap-editor-content .tiptap {
          outline: none;
          min-height: 180px;
          font-size: 14px;
          line-height: 1.7;
          color: var(--ink);
        }
        .tiptap-editor-content .tiptap p.is-editor-empty:first-child::before {
          color: var(--ink-faint);
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .tiptap-editor-content .tiptap p {
          margin: 0 0 12px;
        }
        .tiptap-editor-content .tiptap h1 {
          font-size: 22px;
          font-weight: 800;
          margin: 20px 0 10px;
          color: var(--ink);
        }
        .tiptap-editor-content .tiptap h2 {
          font-size: 18px;
          font-weight: 800;
          margin: 18px 0 8px;
          color: var(--ink);
        }
        .tiptap-editor-content .tiptap h3 {
          font-size: 16px;
          font-weight: 700;
          margin: 14px 0 6px;
          color: var(--ink);
        }
        .tiptap-editor-content .tiptap ul,
        .tiptap-editor-content .tiptap ol {
          padding-left: 24px;
          margin: 8px 0 14px;
        }
        .tiptap-editor-content .tiptap li {
          margin-bottom: 4px;
        }
        .tiptap-editor-content .tiptap blockquote {
          border-left: 3px solid var(--role-content);
          background-color: var(--role-content-soft);
          padding: 8px 14px;
          border-radius: 0 6px 6px 0;
          margin: 12px 0;
          font-style: italic;
        }
        .tiptap-editor-content .tiptap pre {
          background-color: #0F172A;
          color: #E2E8F0;
          padding: 12px 16px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 13px;
          overflow-x: auto;
          margin: 12px 0;
        }
        .tiptap-editor-content .tiptap hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 20px 0;
        }
      `}</style>
    </div>
  );
}

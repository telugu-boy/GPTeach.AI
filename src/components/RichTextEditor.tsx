
import React, { useMemo } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: true }),
      Placeholder.configure({ placeholder: placeholder || 'Write here...' }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class:
          'min-h-[160px] prose prose-sm max-w-none p-3 rounded-xl bg-white/70 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button className="px-2 py-1 rounded bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40" onClick={() => editor?.chain().focus().toggleBold().run()}>Bold</button>
        <button className="px-2 py-1 rounded bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40" onClick={() => editor?.chain().focus().toggleItalic().run()}>Italic</button>
        <button className="px-2 py-1 rounded bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40" onClick={() => editor?.chain().focus().toggleUnderline().run()}>Underline</button>
        <button className="px-2 py-1 rounded bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40" onClick={() => editor?.chain().focus().toggleBulletList().run()}>• List</button>
        <button className="px-2 py-1 rounded bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40" onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1. List</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

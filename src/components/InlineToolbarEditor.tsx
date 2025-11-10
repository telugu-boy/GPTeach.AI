import React from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export default function InlineToolbarEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder || '...' }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none px-4 py-3 min-h-[48px] text-[15px] leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const setLink = () => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <>
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="flex gap-1 rounded-xl border border-white/40 bg-white/90 p-1.5 shadow-[0_12px_32px_-20px_rgba(15,118,110,0.6)] backdrop-blur-xl dark:border-white/20 dark:bg-slate-900/90"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn("p-1.5 rounded-lg transition-colors hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40", editor.isActive('bold') && 'bg-emerald-200/70 dark:bg-emerald-800/60')}
          >
            <Bold size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn("p-1.5 rounded-lg transition-colors hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40", editor.isActive('italic') && 'bg-emerald-200/70 dark:bg-emerald-800/60')}
          >
            <Italic size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn("p-1.5 rounded-lg transition-colors hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40", editor.isActive('underline') && 'bg-emerald-200/70 dark:bg-emerald-800/60')}
          >
            <UnderlineIcon size={15} />
          </button>
          <button onClick={setLink} className={cn("p-1.5 rounded-lg transition-colors hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40", editor.isActive('link') && 'bg-emerald-200/70 dark:bg-emerald-800/60')}>
            <LinkIcon size={15} />
          </button>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </>
  );
}
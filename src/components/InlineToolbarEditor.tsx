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
        class: 'prose prose-sm max-w-none focus:outline-none p-3 min-h-[40px]',
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
          className="flex gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg rounded-md p-1"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn("p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700", editor.isActive('bold') && 'bg-slate-200 dark:bg-slate-600')}
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn("p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700", editor.isActive('italic') && 'bg-slate-200 dark:bg-slate-600')}
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn("p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700", editor.isActive('underline') && 'bg-slate-200 dark:bg-slate-600')}
          >
            <UnderlineIcon size={16} />
          </button>
          <button onClick={setLink} className={cn("p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700", editor.isActive('link') && 'bg-slate-200 dark:bg-slate-600')}>
            <LinkIcon size={16} />
          </button>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </>
  );
}
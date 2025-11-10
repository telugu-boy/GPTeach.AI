import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import AISuggestionPopup from './AISuggestionPopup';

export type InlineToolbarEditorHandle = {
  focus: () => void;
  setContent: (html: string) => void;
};

type InlineToolbarEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  enableAISuggestions?: boolean;
  context?: string;
};

const InlineToolbarEditor = forwardRef<InlineToolbarEditorHandle, InlineToolbarEditorProps>(
(
  {
    value,
    onChange,
    placeholder,
    enableAISuggestions = false,
    context,
  },
  ref
) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const [showAIButton, setShowAIButton] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  
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
    onFocus: () => {
      if (enableAISuggestions) {
        setShowAIButton(true);
      }
    },
    onBlur: () => {
      setTimeout(() => setShowAIButton(false), 200);
    },
  });

  useEffect(() => {
    if (editor && typeof value === 'string') {
      const currentHtml = editor.getHTML();
      const sanitizedValue = value || '';
      if (sanitizedValue !== currentHtml) {
        editor.commands.setContent(sanitizedValue, false);
      }
    }
  }, [editor, value]);

  useImperativeHandle(ref, () => ({
    focus: () => {
      editor?.commands.focus();
    },
    setContent: (html: string) => {
      if (!editor) return;
      editor.commands.setContent(html || '', false);
    },
  }), [editor]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSuggestions) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showSuggestions]);

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

  const handleShowSuggestions = () => {
    if (!editorRef.current) return;
    
    const rect = editorRef.current.getBoundingClientRect();
    setSuggestionPosition({
      top: rect.bottom + 8,
      left: rect.left,
    });
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    if (editor) {
      editor.commands.setContent(suggestion);
      onChange(suggestion);
    }
  };

  return (
    <div ref={editorRef} className="relative">
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
          <button 
            onClick={setLink} 
            className={cn("p-1.5 rounded-lg transition-colors hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40", editor.isActive('link') && 'bg-emerald-200/70 dark:bg-emerald-800/60')}
          >
            <LinkIcon size={15} />
          </button>
          
          {enableAISuggestions && (
            <>
              <div className="mx-1 w-px bg-slate-300 dark:bg-slate-600" />
              <button
                onClick={handleShowSuggestions}
                className="group relative p-1.5 rounded-lg transition-all hover:bg-gradient-to-br hover:from-emerald-500 hover:to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30"
                title="AI Suggestions"
              >
                <Sparkles size={15} className="text-emerald-600 group-hover:text-white transition-colors" />
              </button>
            </>
          )}
        </BubbleMenu>
      )}
      
      <EditorContent editor={editor} />
      
      {/* AI Floating Button */}
      {enableAISuggestions && showAIButton && !showSuggestions && (
        <button
          onClick={handleShowSuggestions}
          className="absolute right-2 top-2 animate-in fade-in slide-in-from-right-2 duration-200 flex items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-110"
          title="AI Suggestions"
        >
          <Sparkles size={16} />
        </button>
      )}
      
      {/* AI Suggestion Popup */}
      {showSuggestions && (
        <AISuggestionPopup
          placeholder={placeholder || ''}
          currentContent={editor?.getText() || ''}
          position={suggestionPosition}
          onSelect={handleSelectSuggestion}
          onClose={() => setShowSuggestions(false)}
          context={context}
        />
      )}
    </div>
  );
});

export default InlineToolbarEditor;
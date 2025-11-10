// Inline Toolbar Editor - Simple editor for chat interface
import React, { useImperativeHandle, forwardRef } from 'react';

export interface InlineToolbarEditorHandle {
  setContent: (content: string) => void;
  focus: () => void;
  getHTML: () => string;
}

interface InlineToolbarEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const InlineToolbarEditor = forwardRef<InlineToolbarEditorHandle, InlineToolbarEditorProps>(
  ({ value, onChange, placeholder }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      setContent: (content: string) => {
        onChange(content);
        if (textareaRef.current) {
          textareaRef.current.value = content;
        }
      },
      focus: () => {
        textareaRef.current?.focus();
      },
      getHTML: () => {
        return value;
      },
    }));

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    };

    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      // Auto-resize the textarea
      const target = e.currentTarget;
      target.style.height = 'auto';
      target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
    };

    return (
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onInput={handleInput}
        placeholder={placeholder}
        className="w-full resize-none border-0 bg-transparent px-4 py-3 text-[15px] leading-relaxed text-slate-900 placeholder-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder-slate-500"
        style={{ minHeight: '48px', maxHeight: '200px' }}
        rows={1}
      />
    );
  }
);

InlineToolbarEditor.displayName = 'InlineToolbarEditor';

export default InlineToolbarEditor;


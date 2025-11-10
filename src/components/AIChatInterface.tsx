// src/components/AIChatInterface.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import GlassCard from './GlassCard';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import type { RootState } from '../app/store';
import { updatePlan, updatePlanCell } from '../features/plans/plansSlice';
import { generateCompleteLessonPlan, type LessonPlanRequest } from '../services/lessonPlanGeneratorService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
    'Create a complete lesson plan for grade 5 math on fractions',
    'Generate learning objectives for a high school biology class on photosynthesis',
    'Suggest some introductory activities for a lesson on the American Revolution',
];

export default function AIChatInterface() {
  const dispatch = useDispatch();
  const plans = useSelector((s: RootState) => s.plans.items);
  const currentId = useSelector((s: RootState) => s.plans.currentId) || plans[0]?.id;
  const currentPlan = plans.find(p => p.id === currentId);

  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, blockquote: false, horizontalRule: false }),
      Placeholder.configure({ placeholder: 'Message GPTeach AI...' }),
    ],
    editorProps: {
      attributes: { class: 'prose prose-sm max-w-none focus:outline-none px-4 py-3 min-h-[48px] text-[15px] leading-relaxed' },
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (promptText?: string) => {
    const textToSend = promptText || editor?.getText().trim();
    if (!textToSend || isProcessing) return;

    if (!currentPlan) {
        setMessages((prev) => [...prev, { id: nanoid(), role: 'assistant', content: "Please select a lesson plan to edit first.", timestamp: new Date() }]);
        return;
    }
    
    setIsProcessing(true);
    const htmlToSend = promptText ? `<p>${promptText}</p>` : editor?.getHTML() || `<p>${textToSend}</p>`;
    const userMessage: Message = { id: nanoid(), role: 'user', content: htmlToSend, timestamp: new Date() };
    
    // **THE FIX**: This functional update is critical. It queues the user message and thinking
    // indicator together, preventing race conditions that cause UI bugs like "You You".
    const assistantThinkingMessageId = nanoid();
    setMessages(prev => [
      ...prev,
      userMessage,
      { id: assistantThinkingMessageId, role: 'assistant', content: '<div class="flex items-center gap-2"><div class="animate-spin h-5 w-5 rounded-full border-b-2 border-slate-500"></div><span>Generating your lesson plan...</span></div>', timestamp: new Date() }
    ]);
    
    editor?.commands.clearContent(true);

    try {
      const textLower = textToSend.toLowerCase();
      const gradeMatch = textLower.match(/grade (\d+)/);
      const subjectMatch = textLower.match(/(math|biology|history|science|english|arts)/i);
      const topicMatch = textLower.match(/(?:on|for|about) ([\w\s]+)/);

      const request: LessonPlanRequest = {
          grade: gradeMatch ? gradeMatch[1] : currentPlan.grade,
          subject: subjectMatch ? subjectMatch[0] : currentPlan.subject,
          topic: topicMatch ? topicMatch[1].trim() : currentPlan.topic,
          additionalInfo: textToSend,
      };
      
      const result = await generateCompleteLessonPlan(request, currentPlan.tableContent);
      
      currentPlan.tableContent.forEach(row => {
          row.cells.forEach(cell => {
              if (cell.placeholder && result.updates.has(cell.placeholder)) {
                  const newContent = result.updates.get(cell.placeholder)!;
                  const labelMatch = cell.content.match(/<(strong|b)>.*?<\/(strong|b)>/);
                  const finalContent = labelMatch ? `${labelMatch[0]} ${newContent}` : newContent;
                  
                  dispatch(updatePlanCell({
                      planId: currentPlan.id,
                      rowId: row.id,
                      cellId: cell.id,
                      content: finalContent
                  }));
              }
          });
      });

      dispatch(updatePlan({
          id: currentPlan.id,
          title: result.title,
          grade: request.grade,
          subject: request.subject,
          topic: request.topic,
      }));
      
      const successMessageContent = `✅ I've updated the lesson plan: <strong>${result.title}</strong>. The changes are now visible in the editor.`;
      setMessages(prev => prev.map(msg => msg.id === assistantThinkingMessageId ? { ...msg, content: successMessageContent } : msg));

    } catch (error) {
      console.error("AI Generation Error:", error);
      const err = error as Error;
      // The error message from the thrown error will now be displayed correctly.
      const errorMessageContent = `Sorry, I encountered an error: ${err.message}`;
      setMessages(prev => prev.map(msg => msg.id === assistantThinkingMessageId ? { ...msg, content: errorMessageContent } : msg));
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handlePromptClick = (prompt: string) => handleSendMessage(prompt);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="mx-auto flex h-full max-w-4xl flex-col">
        <GlassCard className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex shrink-0 items-center justify-center border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <Sparkles size={20} className="text-emerald-600 dark:text-emerald-500" />
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">GPTeach AI</h2>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 py-12">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <Sparkles size={32} />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100">Welcome to GPTeach AI</h3>
                <p className="mb-8 max-w-md text-center text-sm text-slate-600 dark:text-slate-400">I can help you create lesson plans. Try a prompt to get started.</p>
                 <div className="w-full max-w-md space-y-2">
                    {QUICK_PROMPTS.map((prompt, i) => (
                        <button key={i} onClick={() => handlePromptClick(prompt)} className="w-full text-left text-sm p-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 transition-colors">
                            {prompt}
                        </button>
                    ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                {messages.map((message) => (
                  <div key={message.id} className={`border-b border-slate-100 px-6 py-6 dark:border-slate-800 ${message.role === 'assistant' ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-900'}`}>
                    <div className="mx-auto max-w-3xl">
                      <div className="mb-2 flex items-center gap-2">
                        <div className={`flex h-6 w-6 items-center justify-center rounded ${message.role === 'assistant' ? 'bg-emerald-600 text-white dark:bg-emerald-500' : 'bg-slate-600 text-white dark:bg-slate-400'}`}>
                          {message.role === 'assistant' ? <Sparkles size={14} /> : <span className="text-xs font-semibold">You</span>}
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{message.role === 'assistant' ? 'GPTeach AI' : 'You'}</span>
                      </div>
                      <div className="prose prose-sm max-w-none text-slate-700 dark:prose-invert dark:text-slate-300" dangerouslySetInnerHTML={{ __html: message.content }} />
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto max-w-3xl">
              <div className="relative flex items-center gap-2">
                <div className="flex-1 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm transition-all duration-200 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800" onKeyDown={handleKeyPress}>
                  <EditorContent editor={editor} />
                </div>
                <button onClick={() => handleSendMessage()} disabled={isProcessing || !editor?.getText().trim()} className="shrink-0 rounded-xl bg-emerald-600 p-3 text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:disabled:bg-slate-700 dark:disabled:text-slate-500" aria-label="Send message">
                  {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
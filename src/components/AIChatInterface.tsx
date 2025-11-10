// src/components/AIChatInterface.tsx (New Code)

import React, { useState } from 'react';
import { Send, Sparkles, MessageSquare, BookOpen, ListChecks, FileText } from 'lucide-react';
import GlassCard from './GlassCard';

const quickPrompts = [
  'Draft objectives for grade 5 science on ecosystems',
  'Suggest differentiation ideas for mixed abilities',
  'Provide formative assessment checks for this lesson',
];

export default function AIChatInterface() {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="h-full w-full overflow-hidden bg-gradient-to-br from-slate-100/60 via-white/70 to-emerald-50/60 px-4 py-6 dark:from-slate-950/80 dark:via-slate-900/70 dark:to-emerald-950/50">
      <div className="mx-auto flex h-full max-w-sm flex-col gap-4">
        <GlassCard className="flex items-center gap-3 rounded-[24px] border border-white/40 bg-white/65 py-3 pl-4 pr-5 text-slate-700 shadow-[0_20px_45px_-35px_rgba(16,185,129,0.45)] backdrop-blur-2xl dark:border-white/20 dark:bg-slate-900/70">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-300">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Assistant</p>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">GPTeach AI</h2>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col gap-4 rounded-[26px] border border-white/35 bg-white/70 p-5 text-sm text-slate-600 shadow-[0_24px_60px_-40px_rgba(15,118,110,0.45)] backdrop-blur-2xl dark:border-white/20 dark:bg-slate-900/70 dark:text-slate-300">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-300">
              <MessageSquare size={18} />
            </div>
            <p className="leading-relaxed">
              Welcome to your planning companion. Share your lesson focus, grade, or the learning outcomes you need, and I’ll craft ready-to-use prompts, activities, and assessments tailored to your plan.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Quick prompts</p>
            <div className="flex flex-col gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInputValue(prompt)}
                  className="group flex items-center gap-3 rounded-2xl border border-white/40 bg-white/60 px-4 py-3 text-left text-sm font-medium text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200/70 hover:text-emerald-600 dark:border-white/20 dark:bg-slate-900/70 dark:text-slate-300"
                >
                  <Sparkles size={16} className="text-emerald-500 transition-transform duration-200 group-hover:scale-110" />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2 rounded-2xl border border-white/40 bg-white/55 p-3 text-xs text-slate-500 dark:border-white/20 dark:bg-slate-900/65 dark:text-slate-400">
            <p className="font-semibold uppercase tracking-[0.28em] text-slate-400">Popular requests</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Lesson hooks', icon: <Sparkles size={14} /> },
                { label: 'Mini-assessments', icon: <ListChecks size={14} /> },
                { label: 'Rubrics', icon: <FileText size={14} /> },
                { label: 'Resource lists', icon: <BookOpen size={14} /> },
              ].map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/60 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-[0_10px_24px_-18px_rgba(15,118,110,0.45)] dark:border-white/20 dark:bg-slate-900/70 dark:text-slate-300"
                >
                  {item.icon}
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="mt-auto flex flex-col gap-3 rounded-[26px] border border-white/35 bg-white/75 p-4 shadow-[0_22px_52px_-38px_rgba(16,185,129,0.5)] backdrop-blur-2xl dark:border-white/20 dark:bg-slate-900/70">
          <label htmlFor="assistant-input" className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Message GPTeach
          </label>
          <div className="relative">
            <input
              id="assistant-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a request or choose a prompt..."
              className="w-full rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-sm text-slate-700 shadow-inner transition-all duration-200 focus:border-emerald-300 focus:outline-none focus:ring-0 dark:border-white/20 dark:bg-slate-900/70 dark:text-slate-100"
            />
            <button
              disabled={!inputValue.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border border-emerald-200/70 bg-emerald-500/20 p-2 text-emerald-600 transition-colors duration-200 hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:border-slate-200/60 disabled:bg-slate-200/40 disabled:text-slate-400 dark:border-emerald-400/30 dark:bg-emerald-500/30 dark:text-emerald-200 dark:disabled:border-slate-700 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
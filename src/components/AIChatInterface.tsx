// src/components/AIChatInterface.tsx (New Code)

import React, { useState } from 'react';
import { Send, Sparkles, MessageSquare } from 'lucide-react';

export default function AIChatInterface() {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="h-full flex flex-col p-4 bg-slate-50 dark:bg-slate-900/50 border-l border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="text-emerald-500" />
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">GPTeach Assistant</h2>
      </div>

      {/* Welcome Message */}
      <div className="flex-1 text-sm text-slate-600 dark:text-slate-400">
        <p className="mb-4">
          Welcome to the Lesson Planner.
I can help you create organized, effective lesson plans in less time.
Tell me your subject, grade level, and objectives to get started.
          </p>
      </div>

      {/* Input Area */}
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Start planning..."
            className="w-full pl-4 pr-12 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
          />
          <button
            disabled={!inputValue.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg bg-slate-600 text-white hover:bg-slate-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
  );
}
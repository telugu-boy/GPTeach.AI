// AI Suggestion Popup - Grammarly-style elegant suggestion component
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, Wand2, BookOpen, Lightbulb } from 'lucide-react';
import { generateSuggestions, type Suggestion } from '../services/openRouterService';
import { searchOutcomes, formatOutcomeForDisplay, loadCurriculumData } from '../services/curriculumDataService';

interface AISuggestionPopupProps {
  placeholder: string;
  currentContent: string;
  position: { top: number; left: number };
  onSelect: (suggestion: string) => void;
  onClose: () => void;
  context?: string;
}

export default function AISuggestionPopup({
  placeholder,
  currentContent,
  position,
  onSelect,
  onClose,
  context = '',
}: AISuggestionPopupProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSuggestions();
  }, [placeholder, currentContent]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      // Check if this is an outcome field
      const isOutcomeField = placeholder.toLowerCase().includes('outcome');
      
      let outcomesData: string[] = [];
      if (isOutcomeField) {
        const outcomes = await searchOutcomes(currentContent || placeholder);
        outcomesData = outcomes.map(formatOutcomeForDisplay);
      }

      const aiSuggestions = await generateSuggestions({
        placeholder,
        currentContent,
        context,
        outcomesData,
      });

      setSuggestions(aiSuggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (suggestion: Suggestion) => {
    onSelect(suggestion.text);
    onClose();
  };

  const getCategoryIcon = (category: Suggestion['category']) => {
    switch (category) {
      case 'outcome':
        return <BookOpen size={14} className="text-purple-500" />;
      case 'ai':
        return <Sparkles size={14} className="text-emerald-500" />;
      case 'template':
        return <Lightbulb size={14} className="text-amber-500" />;
      default:
        return <Wand2 size={14} className="text-blue-500" />;
    }
  };

  const getCategoryLabel = (category: Suggestion['category']) => {
    switch (category) {
      case 'outcome':
        return 'Curriculum';
      case 'ai':
        return 'AI Generated';
      case 'template':
        return 'Template';
      default:
        return 'Suggestion';
    }
  };

  return (
    <div
      ref={popupRef}
      className="fixed z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
      style={{
        top: position.top,
        left: position.left,
        maxWidth: '420px',
        minWidth: '320px',
      }}
    >
      <div className="rounded-2xl border border-emerald-200/60 bg-white shadow-[0_20px_60px_-15px_rgba(16,185,129,0.3)] backdrop-blur-xl dark:border-emerald-800/60 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30">
            <Sparkles size={14} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              AI Suggestions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {placeholder}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
              <path d="M4 4l8 8M12 4l-8 8" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Suggestions List */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-500" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Generating suggestions...
              </p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <Wand2 className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No suggestions available
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSelect(suggestion)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="group relative w-full animate-in fade-in slide-in-from-left-2 duration-200 rounded-xl border border-transparent bg-slate-50/50 p-3 text-left transition-all hover:border-emerald-200 hover:bg-emerald-50/80 hover:shadow-md hover:shadow-emerald-100/50 dark:bg-slate-800/50 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/30"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'backwards',
                  }}
                >
                  {/* Category Badge */}
                  <div className="mb-2 flex items-center gap-1.5">
                    {getCategoryIcon(suggestion.category)}
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {getCategoryLabel(suggestion.category)}
                    </span>
                    {suggestion.confidence && (
                      <span className="ml-auto text-xs text-slate-400">
                        {Math.round(suggestion.confidence * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Suggestion Text */}
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                    {suggestion.text}
                  </p>

                  {/* Hover Effect */}
                  {hoveredIndex === index && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-medium text-white shadow-lg">
                        Click to insert
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-4 py-2.5 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <Sparkles size={12} />
            <span>Powered by AI • Press ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}


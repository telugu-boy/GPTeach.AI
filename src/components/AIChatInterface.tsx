// src/components/AIChatInterface.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../app/store';
import GlassCard from './GlassCard';
import InlineToolbarEditor, { InlineToolbarEditorHandle } from './InlineToolbarEditor';
import { chatWithAI } from '../services/geminiService';
import { updatePlan, updatePlanCell, addPlan, setCurrentPlan } from '../features/plans/plansSlice';
import { loadCurriculumData, getOutcomesByGrade } from '../services/curriculumDataService';
import type { Plan, Row, Cell } from '../lib/types';
import { nanoid } from '@reduxjs/toolkit';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickPrompts = [
  'Create a complete lesson plan for grade 5 math on fractions',
  'Generate a lesson plan for grade 3 science about ecosystems',
  'Make a complete plan for grade 7 English on poetry analysis',
  'Build a lesson plan for grade 4 social studies on local history',
];

const createDefaultTable = (): Row[] => [
  {
    id: nanoid(),
    cells: [
      { id: nanoid(), content: '<strong>Date:</strong>', placeholder: 'Date' },
      { id: nanoid(), content: '<strong>Grade/Class:</strong>', placeholder: 'Grade/Class' },
      { id: nanoid(), content: '<strong>Name:</strong>', placeholder: 'Name' },
    ],
  },
  {
    id: nanoid(),
    cells: [
      { id: nanoid(), content: '<strong>Course/level:</strong>', placeholder: 'Course/level' },
      { id: nanoid(), content: '<strong>School:</strong>', placeholder: 'School' },
      { id: nanoid(), content: '<strong>Lesson time:</strong>', placeholder: 'Lesson time' },
    ],
  },
  {
    id: nanoid(),
    cells: [
      { id: nanoid(), content: '<strong>Prerequisites/Previous Knowledge:</strong>', placeholder: 'Students should have a basic understanding of...' },
      { id: nanoid(), content: '<strong>Location/facility:</strong>', placeholder: 'e.g., Classroom, Gym' },
    ],
  },
  {
    id: nanoid(),
    cells: [
      { id: nanoid(), content: '<strong>Outcome(s) (quoted from program of studies):</strong>', placeholder: 'e.g., SCI10-1: Analyze the structure of cells' },
      { id: nanoid(), content: '<strong>Resources (e.g., materials for teacher and/or learner, technical requirements):</strong>', placeholder: 'Textbooks, video links, chart paper' },
    ],
  },
  {
    id: nanoid(),
    cells: [
      { id: nanoid(), content: '<strong>Goal of this lesson/demo (what will students know, understand and be able to do after this lesson):</strong>', placeholder: 'What will students know, understand, and be able to do?' },
      { id: nanoid(), content: '<strong>Safety Considerations:</strong>', placeholder: 'e.g., Proper handling of lab equipment' },
    ],
  },
  {
    id: nanoid(),
    cells: [{ id: nanoid(), content: '<strong>Essential question(s):</strong>', placeholder: 'Enter essential questions...' }],
  },
  {
    id: nanoid(),
    cells: [{ id: nanoid(), content: '<strong>Essential vocabulary:</strong>', placeholder: 'Enter essential vocabulary...' }],
  },
  {
    id: nanoid(),
    cells: [{ id: nanoid(), content: '<strong>Cross-curricular connections (opportunities for synthesis and application) - choose specific outcomes.</strong>', placeholder: 'Enter cross-curricular connections...' }],
  },
  {
    id: nanoid(),
    cells: [{ id: nanoid(), content: '<strong>Differentiated instructions (i.e., select one student and select one group and provide detailed instructions):</strong>', placeholder: 'Enter differentiated instructions...' }],
  },
  {
    id: nanoid(),
    isHeader: true,
    cells: [
      { id: nanoid(), content: '<b>Time for activity (in minutes)</b>', placeholder: '' },
      { id: nanoid(), content: '<b>Description of activity, New learning</b>', placeholder: '' },
      { id: nanoid(), content: '<b>Check for understanding (formative, summative assessments)</b>', placeholder: '' },
    ]
  },
  {
    id: nanoid(),
    cells: [
      { id: nanoid(), content: '', placeholder: 'Anticipatory set/hook/introduction' },
      { id: nanoid(), content: '', placeholder: 'Body/activities/strategies (this section should be VERY detailed)' },
      { id: nanoid(), content: '<ul><li>real world, community connections</li><li>Student Feedback opportunities</li><li>Looking ahead</li></ul>', placeholder: 'Closing' },
    ]
  }
];

export default function AIChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<InlineToolbarEditorHandle>(null);
  const dispatch = useDispatch();
  
  const plansState = useSelector((s: RootState) => (s as any).plans);
  const plans = plansState?.items || [];
  const currentId = plansState?.currentId || plans[0]?.id;
  const currentPlan = plans.find((p: Plan) => p.id === currentId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const ensurePlanExists = (): Plan => {
    if (currentPlan) return currentPlan;
    
    // Create a default plan
    const newPlan: Plan = {
      id: nanoid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: 'Untitled Lesson',
      grade: '',
      subject: '',
      topic: '',
      duration: 60,
      outcomes: [],
      objectives: '',
      materials: [],
      priorKnowledge: '',
      activities: [],
      assessment: '',
      differentiation: '',
      extensions: '',
      references: '',
      rubric: { criteria: [] },
      tableContent: createDefaultTable(),
      classId: 'default',
      folderId: null,
    };
    
    dispatch(addPlan(newPlan));
    dispatch(setCurrentPlan(newPlan.id));
    return newPlan;
  };

  const extractLessonInfo = (input: string): { grade?: string; subject?: string; topic?: string } => {
    const lower = input.toLowerCase();
    const info: { grade?: string; subject?: string; topic?: string } = {};
    
    // Extract grade
    const gradeMatch = lower.match(/grade\s*(\d+|k|kindergarten)/i);
    if (gradeMatch) {
      info.grade = gradeMatch[1].toUpperCase() === 'KINDERGARTEN' ? 'K' : gradeMatch[1];
    }
    
    // Extract subject
    const subjects = ['math', 'mathematics', 'science', 'english', 'social studies', 'history', 'geography', 'language arts'];
    for (const subject of subjects) {
      if (lower.includes(subject)) {
        info.subject = subject.charAt(0).toUpperCase() + subject.slice(1);
        break;
      }
    }
    
    // Extract topic
    const topicMatch = lower.match(/(?:on|about|for|topic:)\s+([a-z\s]+?)(?:\.|,|$|grade|for)/i);
    if (topicMatch) {
      info.topic = topicMatch[1].trim();
    }
    
    return info;
  };

  const handleGeneratePlan = async (userInput: string) => {
    const plan = ensurePlanExists();
    const info = extractLessonInfo(userInput);
    
    setIsLoading(true);
    
    try {
      await loadCurriculumData().catch(() => {});
      
      // Get curriculum context if grade is available
      let curriculumContext = '';
      if (info.grade) {
        const outcomes = getOutcomesByGrade(info.grade);
        curriculumContext = outcomes.slice(0, 10).map(o => `${o.outcome}: ${o.description}`).join('\n');
      }
      
      // Build comprehensive prompt
      const prompt = `You are an expert teacher. Generate a complete lesson plan with the following details:

Grade: ${info.grade || 'Not specified'}
Subject: ${info.subject || 'Not specified'}
Topic: ${info.topic || 'Not specified'}

${curriculumContext ? `Relevant Curriculum Outcomes:\n${curriculumContext}\n` : ''}

Generate content for each field below. Return ONLY a valid JSON object with these exact keys (no markdown, no code blocks):

{
  "Date": "Specific date (e.g., April 12, 2025)",
  "Grade/Class": "Grade ${info.grade || '5'} – Class ${info.grade ? info.grade + 'A' : '5A'}",
  "Name": "Lesson title: ${info.topic || 'Topic'} for Grade ${info.grade || '5'}",
  "Course/level": "${info.subject || 'Subject'} – Grade ${info.grade || '5'}",
  "School": "Name of school (e.g., Lincoln Elementary School)",
  "Lesson time": "Duration (e.g., 60 minutes or 9:00 AM - 10:00 AM)",
  "Students should have a basic understanding of...": "Prerequisites: What students should already know (2-3 sentences)",
  "e.g., Classroom, Gym": "Location (e.g., Classroom, Library, Computer Lab)",
  "e.g., SCI10-1: Analyze the structure of cells": "Curriculum outcomes quoted from program of studies (2-3 specific outcomes with codes if available)",
  "Textbooks, video links, chart paper": "List of resources and materials needed (use <ul><li> format, 3-5 items)",
  "What will students know, understand, and be able to do?": "Learning goals: What students will achieve by end of lesson (2-3 sentences)",
  "e.g., Proper handling of lab equipment": "Safety considerations (1-2 sentences, or 'N/A' if not applicable)",
  "Enter essential questions...": "2-3 essential driving questions for the lesson (use <ul><li> format)",
  "Enter essential vocabulary...": "5-8 key vocabulary terms students should learn (use <ul><li> format or comma-separated)",
  "Enter cross-curricular connections...": "How this lesson connects to other subjects (1-2 sentences)",
  "Enter differentiated instructions...": "Specific strategies for diverse learners: one for individual student, one for group (2-3 sentences)",
  "Anticipatory set/hook/introduction": "Engaging opening activity to hook students (2-3 sentences, VERY specific)",
  "Body/activities/strategies (this section should be VERY detailed)": "Main lesson activities with step-by-step instructions. Be VERY detailed (6-10 sentences, numbered steps if helpful)",
  "Closing": "Lesson wrap-up with real-world connections, student feedback opportunities, and looking ahead (use <ul><li> format)"
}

IMPORTANT: Return ONLY the JSON object. No explanations, no markdown code blocks, just the raw JSON.`;

      const response = await chatWithAI(prompt, '');
      
      // Try to parse JSON from response
      let lessonData: Record<string, string> = {};
      try {
        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          lessonData = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.warn('Failed to parse JSON, using fallback', e);
        // If JSON parsing fails, use a simple field extraction
        lessonData = {
          "Date": "March 15, 2025",
          "Grade/Class": `Grade ${info.grade || '5'} - Class A`,
          "Name": "Your Name",
          "Course/level": `${info.subject || 'Mathematics'} - Grade ${info.grade || '5'}`,
          "School": "Your School",
          "Lesson time": "60 minutes",
          "Prerequisites/Previous Knowledge": response.substring(0, 200),
          "Body/activities/strategies": response.substring(200, 600),
        };
      }
      
      // Update plan title
      const title = `${info.grade ? `Grade ${info.grade}` : 'Lesson'} ${info.subject || ''} - ${info.topic || 'Plan'}`.trim();
      dispatch(updatePlan({ id: plan.id, title }));
      
      // Map lesson data to cells using exact placeholder matching
      let updatedCount = 0;
      plan.tableContent.forEach((row: Row) => {
        row.cells.forEach((cell: Cell) => {
          if (cell.placeholder && cell.placeholder.trim()) {
            const placeholder = cell.placeholder.trim();
            
            // Try exact match first
            if (lessonData[placeholder]) {
              const labelMatch = cell.content.match(/^<strong>.*?<\/strong>/i);
              const newContent = labelMatch ? `${labelMatch[0]} <p>${lessonData[placeholder]}</p>` : `<p>${lessonData[placeholder]}</p>`;
              
              dispatch(updatePlanCell({
                planId: plan.id,
                rowId: row.id,
                cellId: cell.id,
                content: newContent,
              }));
              updatedCount++;
            } else {
              // Try fuzzy matching for common variations
              for (const [key, value] of Object.entries(lessonData)) {
                const keyLower = key.toLowerCase().replace(/[^\w\s]/g, '');
                const placeholderLower = placeholder.toLowerCase().replace(/[^\w\s]/g, '');
                
                // Check if key matches placeholder (allowing for partial matches on longer fields)
                const isMatch = 
                  keyLower === placeholderLower ||
                  (keyLower.length > 10 && placeholderLower.includes(keyLower)) ||
                  (placeholderLower.length > 10 && keyLower.includes(placeholderLower));
                
                if (isMatch) {
                  const labelMatch = cell.content.match(/^<strong>.*?<\/strong>/i);
                  const newContent = labelMatch ? `${labelMatch[0]} <p>${value}</p>` : `<p>${value}</p>`;
                  
                  dispatch(updatePlanCell({
                    planId: plan.id,
                    rowId: row.id,
                    cellId: cell.id,
                    content: newContent,
                  }));
                  updatedCount++;
                  break;
                }
              }
            }
          }
        });
      });
      
      const successMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ <strong>Lesson plan generated!</strong><br/><br/>Updated ${updatedCount} fields for:<br/>• Grade: ${info.grade || 'Not specified'}<br/>• Subject: ${info.subject || 'Not specified'}<br/>• Topic: ${info.topic || 'Not specified'}<br/><br/>You can now review and edit any field.`,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, successMsg]);
      
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Sorry, there was an error generating the lesson plan. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again with more specific details.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = inputValue.trim();
    setInputValue('');
    
    // Check if user wants to generate a lesson plan
    const lower = userInput.toLowerCase();
    const isGenerateRequest = 
      lower.includes('lesson plan') ||
      lower.includes('study plan') ||
      lower.includes('create') ||
      lower.includes('generate') ||
      lower.includes('make') ||
      lower.includes('build') ||
      lower.includes('fill');
    
    if (isGenerateRequest) {
      await handleGeneratePlan(userInput);
    } else {
      // Regular chat
      setIsLoading(true);
      try {
        const response = await chatWithAI(userInput, '');
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleQuickPrompt = async (prompt: string) => {
    setInputValue(prompt);
    editorRef.current?.setContent(prompt);
    
    // Auto-send after a brief delay
    setTimeout(async () => {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: prompt,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      await handleGeneratePlan(prompt);
    }, 100);
  };

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
          {/* Header */}
          <div className="flex shrink-0 items-center justify-center border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <Sparkles size={20} className="text-emerald-600 dark:text-emerald-500" />
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">GPTeach AI</h2>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {messages.length === 0 ? (
              /* Empty State */
              <div className="flex h-full flex-col items-center justify-center px-6 py-12">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <Sparkles size={32} />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Welcome to GPTeach AI
                </h3>
                <p className="mb-8 max-w-md text-center text-sm text-slate-600 dark:text-slate-400">
                  I can generate complete lesson plans for you! Just tell me the grade, subject, and topic.
                </p>
                
                <div className="w-full max-w-md">
                  <p className="mb-3 text-xs font-medium text-slate-500 dark:text-slate-400">Quick prompts</p>
                  <div className="flex flex-col gap-2">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handleQuickPrompt(prompt)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Messages */
              <div className="flex flex-col">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`border-b border-slate-100 px-6 py-6 dark:border-slate-800 ${
                      message.role === 'assistant' ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="mx-auto max-w-3xl">
                      <div className="mb-2 flex items-center gap-2">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded ${
                            message.role === 'assistant'
                              ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                              : 'bg-slate-600 text-white dark:bg-slate-400'
                          }`}
                        >
                          {message.role === 'assistant' ? (
                            <Sparkles size={14} />
                          ) : (
                            <span className="text-xs font-semibold">You</span>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {message.role === 'assistant' ? 'GPTeach AI' : 'You'}
                        </span>
                      </div>
                      <div
                        className="prose prose-sm max-w-none text-slate-700 dark:prose-invert dark:text-slate-300"
                        dangerouslySetInnerHTML={{ __html: message.content }}
                      />
                    </div>
                  </div>
                ))}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="border-b border-slate-100 bg-slate-50 px-6 py-6 dark:border-slate-800 dark:bg-slate-800/50">
                    <div className="mx-auto max-w-3xl">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-600 text-white dark:bg-emerald-500">
                          <Loader2 size={14} className="animate-spin" />
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          GPTeach AI
                        </span>
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Generating your lesson plan...
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto max-w-3xl">
              <div className="relative flex items-center gap-2">
                <div 
                  className="flex-1 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm transition-all duration-200 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                  onKeyDown={handleKeyPress}
                >
                  <InlineToolbarEditor
                    ref={editorRef}
                    value={inputValue}
                    onChange={setInputValue}
                    placeholder="Message GPTeach AI..."
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="shrink-0 rounded-xl bg-emerald-600 p-3 text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

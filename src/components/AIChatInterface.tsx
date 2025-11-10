// src/components/AIChatInterface.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../app/store';
import GlassCard from './GlassCard';
import InlineToolbarEditor, { InlineToolbarEditorHandle } from './InlineToolbarEditor';
import { chatWithAI, type ConversationMessage } from '../services/geminiService';
import { generateCompleteLessonPlan, generateFieldContent, type LessonPlanRequest } from '../services/lessonPlanGeneratorService';
import { updatePlan, updatePlanCell } from '../features/plans/plansSlice';
import { setHighlightCellId } from '../features/ui/uiSlice';
import { searchOutcomes, loadCurriculumData, formatOutcomeForDisplay, getOutcomesByGrade } from '../services/curriculumDataService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  meta?: {
    type?: 'wizard-suggestion' | 'wizard-mode-choice' | 'info';
  }
}

interface ManualFieldContext {
  rowId: string;
  cellId: string;
  placeholder: string;
  suggestion: string;
}

const quickPrompts = [
  'Create a complete lesson plan for grade 5 math on fractions',
  'Generate a lesson plan for grade 3 science about ecosystems',
  'Make a complete plan for grade 7 English on poetry analysis',
  'Build a lesson plan for grade 4 social studies on local history',
];

export default function AIChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [isAdvancingField, setIsAdvancingField] = useState(false);
  const [inputHighlight, setInputHighlight] = useState(false);
  const [wizard, setWizard] = useState<{
    active: boolean;
    info: { grade?: string; subject?: string; topic?: string; duration?: string };
    awaiting?: 'grade' | 'subject' | 'topic' | null;
    awaitingMode?: boolean;
    mode?: 'step' | 'full';
    queue: Array<{ rowId: string; cellId: string; placeholder: string }>;
    currentIndex: number;
    currentSuggestion?: string;
    conversationHistory: ConversationMessage[];
  }>({ active: false, info: {}, awaiting: null, queue: [], currentIndex: 0, currentSuggestion: undefined, conversationHistory: [] });
  const wizardRef = useRef(wizard);
  useEffect(() => { wizardRef.current = wizard; }, [wizard]);
  const [chatHistory, setChatHistory] = useState<ConversationMessage[]>([]);
  const chatHistoryRef = useRef(chatHistory);
  useEffect(() => { chatHistoryRef.current = chatHistory; }, [chatHistory]);
  const [lastLessonRequest, setLastLessonRequest] = useState<LessonPlanRequest>({});
  const lastLessonRequestRef = useRef(lastLessonRequest);
  useEffect(() => { lastLessonRequestRef.current = lastLessonRequest; }, [lastLessonRequest]);
  const [activeManualField, setActiveManualField] = useState<ManualFieldContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<InlineToolbarEditorHandle>(null);
  const dispatch = useDispatch();
  
  // Get current lesson plan context
  const plans = useSelector((s: RootState) => s.plans.items);
  const currentId = useSelector((s: RootState) => s.plans.currentId) || plans[0]?.id;
  const currentPlan = plans.find(p => p.id === currentId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildContext = (): string => {
    if (!currentPlan || !currentPlan.tableContent) return 'No lesson plan selected.';
    
    const context = [`Lesson Plan: ${currentPlan.title || 'Untitled'}`];
    
    currentPlan.tableContent.slice(0, 10).forEach((row) => {
      const rowContent = row.cells
        .map((cell) => `${cell.placeholder}: ${cell.content || 'Empty'}`)
        .join(', ');
      if (rowContent) context.push(rowContent);
    });
    
    return context.join('\n');
  };

  const summarizeLessonRequest = (info: LessonPlanRequest): string => {
    const parts: string[] = [];
    if (info.grade) parts.push(`Grade ${info.grade}`);
    if (info.subject) parts.push(info.subject);
    if (info.topic) parts.push(info.topic);
    const headline = parts.length ? parts.join(' • ') : 'this lesson plan';
    const duration = info.duration ? ` (${info.duration})` : '';
    return `Plan request: ${headline}${duration}`.trim();
  };

  const getActiveLessonRequest = (): LessonPlanRequest => {
    const combined: LessonPlanRequest = {
      ...lastLessonRequestRef.current,
      ...wizardRef.current.info,
    };
    return combined;
  };

  const buildModeSelectionLabel = (mode: 'step' | 'full'): string =>
    mode === 'full' ? 'Full plan please.' : 'Let’s go step by step.';

  const buildModeAssistantAcknowledgement = (mode: 'step' | 'full'): string =>
    mode === 'full'
      ? 'Great, I’ll generate the complete lesson plan for you.'
      : 'Great. I will go field by field and propose content. You can approve or skip each suggestion.';

  const stripHtmlTags = (html: string): string =>
    html.replace(/<[^>]*?>/g, '').replace(/\s+/g, ' ').trim();

  const handleWizardModeSelection = async (
    mode: 'step' | 'full',
    source: 'button' | 'text',
    rawInput?: string
  ): Promise<void> => {
    if (!wizardRef.current.active) return;

    const userPhrase = source === 'button' ? buildModeSelectionLabel(mode) : (rawInput || mode);

    if (source === 'button') {
      const userMessage: Message = {
        id: (Date.now() + Math.random()).toString(),
        role: 'user',
        content: userPhrase,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
    }

    const updatedHistory = [
      ...wizardRef.current.conversationHistory,
      { role: 'user', parts: userPhrase } as ConversationMessage,
    ];

    setWizard((w) => ({ ...w, awaitingMode: false, mode, conversationHistory: updatedHistory }));

    setLastLessonRequest((prev) => ({ ...prev, ...wizardRef.current.info }));
    setActiveManualField(null);

    if (mode === 'full') {
      const prompt = `Generate full plan for ${wizardRef.current.info.grade ? `grade ${wizardRef.current.info.grade}` : ''} ${wizardRef.current.info.subject ?? ''} ${wizardRef.current.info.topic ? `on ${wizardRef.current.info.topic}` : ''}`.replace(/\s+/g, ' ').trim();
      const acknowledgement = buildModeAssistantAcknowledgement(mode);
      const historyWithAck = [...updatedHistory, { role: 'model', parts: acknowledgement } as ConversationMessage];
      setWizard((w) => ({ ...w, conversationHistory: historyWithAck }));
      enqueueAssistant(acknowledgement);
      await handleGenerateLessonPlan(prompt.length ? prompt : 'Generate a complete lesson plan using the current context and curriculum data.');
      setWizard((w) => ({ ...w, active: false, currentSuggestion: undefined, conversationHistory: [] }));
    } else {
      const acknowledgement = buildModeAssistantAcknowledgement(mode);
      const historyWithAck = [...updatedHistory, { role: 'model', parts: acknowledgement } as ConversationMessage];
      setWizard((w) => ({ ...w, conversationHistory: historyWithAck }));
      enqueueAssistant(acknowledgement);
      await startWizardFieldLoop();
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !currentPlan) return;

    const userInput = inputValue.trim();
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // If wizard is awaiting a specific info value, capture it instead of chatting
      if (wizard.active && wizard.awaiting) {
        const infoUpdate = { ...wizard.info, [wizard.awaiting]: userInput };
        const fieldsProvided = ['grade','subject','topic'].filter(k => (infoUpdate as any)[k]).length;
        const nextMissing = fieldsProvided < 2 ? getNextMissingInfo(infoUpdate) : null;

        const conversationHistory = [...wizard.conversationHistory, { role: 'user', parts: userInput } as ConversationMessage];
        setLastLessonRequest(infoUpdate);

        if (nextMissing) {
          const response = `Got it. What ${labelForInfo(nextMissing)} should I use?`;
          const updatedHistory = [...conversationHistory, { role: 'model', parts: response } as ConversationMessage];
          setWizard((w) => ({ ...w, info: infoUpdate, awaiting: nextMissing, conversationHistory: updatedHistory }));
          enqueueAssistant(response);
        } else {
          const response = 'Would you like me to generate the full plan at once, or go step by step following the fields? Choose an option below.';
          const updatedHistory = [...conversationHistory, { role: 'model', parts: response } as ConversationMessage];
          setWizard((w) => ({ ...w, info: infoUpdate, awaiting: null, awaitingMode: true, conversationHistory: updatedHistory }));
          enqueueAssistant(response, { type: 'wizard-mode-choice' });
        }
        setIsLoading(false);
        return;
      }

      if (wizard.active && wizard.awaitingMode) {
        const lower = userInput.toLowerCase();
        const mode: 'step' | 'full' = lower.includes('full') ? 'full' : 'step';
        await handleWizardModeSelection(mode, 'text', userInput);
        setIsLoading(false);
        return;
      }

      // If wizard is active (not awaiting) and user typed right after a suggestion,
      // treat the input as feedback to revise the current suggestion.
      if (wizard.active && !wizard.awaiting && wizard.currentSuggestion) {
        const revised = await rewriteCurrentSuggestion(userInput);
        setWizard((w) => ({ ...w, currentSuggestion: revised }));
        enqueueAssistant(
          `<em>Sure — what about this instead?</em><br/>${revised}<br/><br/>Should I put this into your Lesson Plan?`,
          { type: 'wizard-suggestion' }
        );
        setIsLoading(false);
        return;
      }

      const lessonRequestEntry: ConversationMessage = { role: 'user', parts: userInput };

      // Detect if the user wants a full generation
      if (detectGenerateLessonPlanRequest(userInput)) {
        await startWizard(userInput);
        setIsLoading(false);
        return;
      }

      // If we are in manual field revision mode, handle feedback first
      if (await handleActiveManualFieldFeedback(userInput, lessonRequestEntry)) {
        setIsLoading(false);
        return;
      }

      // Check for direct field commands or autofill requests
      if (await handleCommand(userInput, lessonRequestEntry)) {
        setIsLoading(false);
        return;
      }

      // Regular chat response with full conversation context
      const historyForCall = [...chatHistoryRef.current, lessonRequestEntry];
      setChatHistory(historyForCall);
      const context = buildContext();
      const aiResponseText = await chatWithAI(userInput, context, historyForCall);

      setChatHistory((prev) => [...prev, { role: 'model', parts: aiResponseText }]);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setActiveManualField(null);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const enqueueAssistant = (content: string, meta?: Message['meta']) => {
    setMessages((prev) => [
      ...prev,
      { id: (Date.now() + Math.random()).toString(), role: 'assistant', content, timestamp: new Date(), meta },
    ]);
  };

  const labelForInfo = (k: 'grade' | 'subject' | 'topic') =>
    k === 'grade' ? 'grade (e.g., 5 or K)' : k === 'subject' ? 'subject (e.g., Math, Science)' : 'topic/focus';

  const getNextMissingInfo = (info: { grade?: string; subject?: string; topic?: string }) => {
    if (!info.grade) return 'grade' as const;
    if (!info.subject) return 'subject' as const;
    if (!info.topic) return 'topic' as const;
    return null;
  };

  const startWizard = async (userInput?: string, presetInfo?: LessonPlanRequest, presetMode?: 'step' | 'full') => {
    if (!currentPlan || !currentPlan.tableContent) return;
    await loadCurriculumData().catch(() => {});
    const info = presetInfo ? { ...presetInfo } : extractLessonPlanRequest(userInput || '');
    setActiveManualField(null);
    const provided = ['grade','subject','topic'].filter(k => (info as any)[k]).length;
    const awaiting = provided < 2 ? getNextMissingInfo(info) : null;

    // Build the field queue from placeholders (skip labels without placeholder)
    const queue: Array<{ rowId: string; cellId: string; placeholder: string }> = [];
    currentPlan.tableContent.forEach((row) => {
      row.cells.forEach((cell) => {
        if (cell.placeholder && cell.placeholder.trim()) {
          queue.push({ rowId: row.id, cellId: cell.id, placeholder: cell.placeholder });
        }
      });
    });

    // Initialize conversation history with the user's request
    const initialUserMessage = userInput?.trim() || summarizeLessonRequest(info);
    const initialHistory: ConversationMessage[] = [
      { role: 'user', parts: initialUserMessage },
    ];

    setWizard({
      active: true,
      info,
      awaiting,
      awaitingMode: false,
      mode: presetMode,
      queue,
      currentIndex: 0,
      currentSuggestion: undefined,
      conversationHistory: initialHistory,
    });
    setLastLessonRequest(info);

    if (awaiting) {
      const question = `Before I generate, I need a bit more info. What ${labelForInfo(awaiting)} should I use?`;
      setWizard((w) => ({
        ...w,
        conversationHistory: [
          ...initialHistory,
          { role: 'model', parts: question } as ConversationMessage,
        ],
      }));
      enqueueAssistant(question);
      return;
    }

    if (presetMode) {
      await handleWizardModeSelection(presetMode, 'text', buildModeSelectionLabel(presetMode));
      return;
    }

    const prompt = 'Would you like me to generate the full plan at once, or go step by step following the fields? Choose an option below.';
    setWizard((w) => ({
      ...w,
      awaitingMode: true,
      conversationHistory: [
        ...initialHistory,
        { role: 'model', parts: prompt } as ConversationMessage,
      ],
    }));
    enqueueAssistant(prompt, { type: 'wizard-mode-choice' });
  };

  const startWizardFieldLoop = async () => {
    // Generate suggestion for current field
    const suggestion = await generateSuggestionForCurrent();
    setWizard((w) => ({ ...w, currentSuggestion: suggestion }));
    // highlight current cell
    const field = currentField();
    if (field) dispatch(setHighlightCellId(field.cellId));
    // Also add a message with the approval question
    enqueueAssistant(
      `<strong>${currentFieldLabel()}</strong><br/>${suggestion}<br/><br/>Should I put this into your Lesson Plan?`,
      { type: 'wizard-suggestion' }
    );
  };

  const currentField = () => wizardRef.current.queue[wizardRef.current.currentIndex];
  const currentFieldLabel = () => currentField()?.placeholder || 'Field';

  const generateSuggestionForCurrent = async (): Promise<string> => {
    const field = currentField();
    if (!field) return 'No more fields.';
    const request: LessonPlanRequest = wizard.info;
    
    // Add the field name to conversation history as user request
    const conversationHistory = [...wizard.conversationHistory];
    conversationHistory.push({
      role: 'user',
      parts: `I need content for the "${field.placeholder}" field of this lesson plan.`
    });
    
    // Outcomes special handling: assemble from curriculum if grade exists
    if (/outcome/i.test(field.placeholder)) {
      if (request.grade) {
        const all = getOutcomesByGrade(request.grade);
        const filtered = (wizard.info.topic ? all.filter(o => o.description.toLowerCase().includes((wizard.info.topic || '').toLowerCase()) || o.strand.toLowerCase().includes((wizard.info.topic || '').toLowerCase())) : all);
        const top = filtered.length ? filtered.slice(0, 20) : all.slice(0, 20);
        const lines = top.map((o) => `- ${formatOutcomeForDisplay(o)}`).join('<br/>');
        // Provide concise quoted list first; then let model trim to the field if needed
        const result = `<em>Quoted from program of studies:</em><br/>${lines}`;
        
        // Add result to history (use 'model' for Gemini)
        conversationHistory.push({
          role: 'model',
          parts: result
        });
        setWizard((w) => ({ ...w, conversationHistory }));
        
        return result;
      }
      // Fallback to model with instruction to quote outcomes
      const html = await generateFieldContent(field.placeholder, request, buildContext(), conversationHistory);
      
      // Add result to history (use 'model' for Gemini)
      conversationHistory.push({
        role: 'model',
        parts: html
      });
      setWizard((w) => ({ ...w, conversationHistory }));
      
      return html;
    }
    // Generic field
    // Build extra context for grades 7/9 (or any grade): provide a compact list of relevant outcomes as context
    let extraContext = buildContext();
    if (request.grade) {
      const all = getOutcomesByGrade(request.grade);
      const filtered = (wizard.info.topic ? all.filter(o => o.description.toLowerCase().includes((wizard.info.topic || '').toLowerCase()) || o.strand.toLowerCase().includes((wizard.info.topic || '').toLowerCase())) : all);
      const top = filtered.slice(0, 30).map(o => `${o.outcome}: ${o.description}`).join('\n');
      extraContext += `\n\nCurriculum outcomes context:\n${top}`;
    }
    let html = await generateFieldContent(field.placeholder, request, extraContext, conversationHistory);
    // Simple validation heuristics to reduce mismatches
    if (/grade\/class/i.test(field.placeholder)) {
      const looksLikeDate = /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})\b/i.test(html);
      if (looksLikeDate) {
        html = await generateFieldContent(field.placeholder, request, `${extraContext}\n\nSTRICT: Do NOT output dates. Output only grade and class (e.g., "Grade 5 – Class 5B").`, conversationHistory);
      }
    } else if (/date/i.test(field.placeholder)) {
      const looksLikeGrade = /\bgrade\s*\d+/i.test(html);
      if (looksLikeGrade) {
        html = await generateFieldContent(field.placeholder, request, `${extraContext}\n\nSTRICT: Do NOT mention grade or class. Output a date only.`, conversationHistory);
      }
    } else if (/school/i.test(field.placeholder)) {
      if (html.length > 120) {
        html = await generateFieldContent(field.placeholder, request, `${extraContext}\n\nSTRICT: Output only the school name, max 6 words.`, conversationHistory);
      }
    }
    
    // Add result to history (use 'model' for Gemini)
    conversationHistory.push({
      role: 'model',
      parts: html
    });
    setWizard((w) => ({ ...w, conversationHistory }));
    
    return html;
  };

  const rewriteCurrentSuggestion = async (feedback: string): Promise<string> => {
    const field = currentField();
    if (!field) return wizard.currentSuggestion || '';
    
    // Add user feedback to conversation history
    const conversationHistory = [...wizard.conversationHistory];
    conversationHistory.push({
      role: 'user',
      parts: feedback
    });
    
    // Build a targeted rewrite prompt using chatWithAI
    const contextParts: string[] = [];
    contextParts.push(`Field: ${field.placeholder}`);
    contextParts.push(`Previous suggestion (HTML): ${wizard.currentSuggestion || ''}`);
    contextParts.push(`User feedback: ${feedback}`);
    if (wizard.info.grade) {
      const all = getOutcomesByGrade(wizard.info.grade);
      const filtered = (wizard.info.topic ? all.filter(o => o.description.toLowerCase().includes((wizard.info.topic || '').toLowerCase()) || o.strand.toLowerCase().includes((wizard.info.topic || '').toLowerCase())) : all);
      const top = filtered.slice(0, 12).map(o => `${o.outcome}: ${o.description}`).join('\n');
      contextParts.push(`Relevant curriculum outcomes:\n${top}`);
    }
    contextParts.push('Constraints: Keep it concise (1–2 sentences or a short bullet list). Return valid minimal HTML only (<p>, <ul>, <li>, <strong>, <em>). Do not include headings or restate the field name.');
    const context = contextParts.join('\n\n');
    const revised = await chatWithAI('Revise the suggestion according to the user feedback and constraints. Return only HTML.', context, conversationHistory);
    
    // Add revised suggestion to conversation history (use 'model' for Gemini)
    conversationHistory.push({
      role: 'model',
      parts: revised
    });
    setWizard((w) => ({ ...w, conversationHistory }));
    
    return revised;
  };

  const findFieldByPlaceholder = (predicate: (placeholder: string) => boolean) => {
    if (!currentPlan?.tableContent) return null;
    for (const row of currentPlan.tableContent) {
      for (const cell of row.cells) {
        if (cell.placeholder && predicate(cell.placeholder)) {
          return {
            rowId: row.id,
            cellId: cell.id,
            placeholder: cell.placeholder,
            currentContent: cell.content || '',
          };
        }
      }
    }
    return null;
  };

  const detectFieldCommand = (input: string) => {
    if (!currentPlan?.tableContent) return null;
    const normalized = input.toLowerCase();
    const rules: Array<{ keywords: string[]; predicate: (placeholder: string) => boolean }> = [
      { keywords: ['date', 'today', 'tomorrow'], predicate: (ph) => /date/i.test(ph) },
      { keywords: ['grade', 'class'], predicate: (ph) => /grade/i.test(ph) && /class/i.test(ph) },
      { keywords: ['school', 'campus'], predicate: (ph) => /school/i.test(ph) },
      {
        keywords: ['lesson time', 'time slot', 'duration', 'time'],
        predicate: (ph) => /lesson\s*time|duration|time\b/i.test(ph),
      },
      { keywords: ['name', 'title'], predicate: (ph) => /name|title/i.test(ph) },
      { keywords: ['course', 'level', 'subject'], predicate: (ph) => /course|level|subject/i.test(ph) },
      { keywords: ['location', 'room', 'facility'], predicate: (ph) => /location|facility|room/i.test(ph) },
      { keywords: ['resources', 'materials'], predicate: (ph) => /resource|material/i.test(ph) },
      { keywords: ['outcome', 'standard'], predicate: (ph) => /outcome|standard/i.test(ph) },
    ];

    for (const rule of rules) {
      if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
        const match = findFieldByPlaceholder(rule.predicate);
        if (match) return match;
      }
    }
    return null;
  };

  const handleFieldUpdateCommand = async (
    field: { rowId: string; cellId: string; placeholder: string; currentContent: string },
    historyAfterUser: ConversationMessage[]
  ): Promise<void> => {
    if (!currentPlan) return;

    const request = getActiveLessonRequest();
    const extraContext = buildContext();
    const suggestion = await generateFieldContent(field.placeholder, request, extraContext, historyAfterUser);

    dispatch(updatePlanCell({
      planId: currentPlan.id,
      rowId: field.rowId,
      cellId: field.cellId,
      content: suggestion,
    }));
    dispatch(setHighlightCellId(field.cellId));

    const assistantMessage = `<strong>${field.placeholder}</strong><br/>${suggestion}<br/><br/>Updated this field in your lesson plan.`;
    enqueueAssistant(assistantMessage);

    setActiveManualField({
      rowId: field.rowId,
      cellId: field.cellId,
      placeholder: field.placeholder,
      suggestion,
    });

    setChatHistory((prev) => [
      ...prev,
      { role: 'model', parts: `Updated ${field.placeholder}: ${stripHtmlTags(suggestion)}` },
    ]);
  };

  const handleActiveManualFieldFeedback = async (
    feedback: string,
    userEntry: ConversationMessage
  ): Promise<boolean> => {
    if (!activeManualField || !currentPlan) return false;

    const normalized = feedback.toLowerCase();
    const placeholderKeywords = activeManualField.placeholder.toLowerCase().split(/\W+/).filter(Boolean);
    const likelyFeedback =
      normalized.length <= 80 ||
      /(use|change|update|revise|regenerate|rewrite|shorter|longer|keep|today|tomorrow|yes|no|okay|fine)/i.test(feedback) ||
      placeholderKeywords.some((kw) => kw.length > 3 && normalized.includes(kw));

    if (!likelyFeedback) {
      return false;
    }

    const historyAfterUser = [...chatHistoryRef.current, userEntry];
    setChatHistory(historyAfterUser);

    const contextParts: string[] = [];
    contextParts.push(`Lesson context:\n${buildContext()}`);
    contextParts.push(`Field: ${activeManualField.placeholder}`);
    contextParts.push(`Previous suggestion (HTML): ${activeManualField.suggestion}`);
    contextParts.push(`User feedback: ${feedback}`);
    contextParts.push('Constraints: Keep it concise (1–2 sentences or up to 3 bullets). Return valid minimal HTML only (<p>, <ul>, <li>, <strong>, <em>). Do not include headings or restate the field label.');
    const context = contextParts.join('\n\n');

    const revised = await chatWithAI(
      'Revise the suggestion according to the user feedback and constraints. Return only HTML.',
      context,
      historyAfterUser
    );

    setChatHistory((prev) => [...prev, { role: 'model', parts: revised }]);

    dispatch(updatePlanCell({
      planId: currentPlan.id,
      rowId: activeManualField.rowId,
      cellId: activeManualField.cellId,
      content: revised,
    }));
    dispatch(setHighlightCellId(activeManualField.cellId));

    setActiveManualField({
      ...activeManualField,
      suggestion: revised,
    });

    enqueueAssistant(`<strong>${activeManualField.placeholder}</strong><br/>${revised}<br/><br/>Updated this field in your lesson plan.`);
    return true;
  };

  const handleCommand = async (
    input: string,
    userEntry: ConversationMessage
  ): Promise<boolean> => {
    const normalized = input.trim().toLowerCase();

    const fieldTarget = detectFieldCommand(normalized);
    if (fieldTarget) {
      const historyAfterUser = [...chatHistoryRef.current, userEntry];
      setChatHistory(historyAfterUser);
      setActiveManualField(null);
      await handleFieldUpdateCommand(fieldTarget, historyAfterUser);
      return true;
    }

    if (/fill in the document|fill the document|complete the document|fill in the plan/.test(normalized)) {
      const historyAfterUser = [...chatHistoryRef.current, userEntry];
      setChatHistory(historyAfterUser);
      setActiveManualField(null);

      const request = getActiveLessonRequest();
      if (!request.grade && !request.subject && !request.topic) {
        const response = 'I can fill in the lesson plan after you tell me the grade, subject, and topic.';
        enqueueAssistant(response);
        setChatHistory((prev) => [...prev, { role: 'model', parts: response }]);
        return true;
      }

      await startWizard(undefined, request, 'step');
      return true;
    }

    return false;
  };

  const approveCurrentSuggestion = async () => {
    const field = currentField();
    if (!field || !wizard.currentSuggestion || !currentPlan) return;
    // Preserve existing label if present, append suggestion content after the bold label
    const existingRow = currentPlan.tableContent.find(r => r.id === field.rowId);
    const existingCell = existingRow?.cells.find(c => c.id === field.cellId);
    const existing = existingCell?.content || '';
    const labelMatch = existing.match(/^<strong>.*?<\/strong>/i);
    let mergedHtml = wizard.currentSuggestion;
    if (labelMatch) {
      const labelHtml = labelMatch[0];
      const rest = wizard.currentSuggestion.replace(/^<strong>.*?<\/strong>\s*/i, '');
      mergedHtml = `${labelHtml} ${rest}`;
    }
    dispatch(updatePlanCell({
      planId: currentPlan.id,
      rowId: field.rowId,
      cellId: field.cellId,
      content: mergedHtml,
    }));
    setIsAdvancingField(true);
    await nextWizardStep();
    setIsAdvancingField(false);
  };

  const regenerateCurrentSuggestion = async () => {
    setIsAdvancingField(true);
    const suggestion = await generateSuggestionForCurrent();
    setWizard((w) => ({ ...w, currentSuggestion: suggestion }));
    enqueueAssistant(
      `<strong>${currentFieldLabel()}</strong><br/>${suggestion}<br/><br/>Should I put this into your Lesson Plan?`,
      { type: 'wizard-suggestion' }
    );
    setIsAdvancingField(false);
  };

  const skipCurrentSuggestion = async () => {
    setIsAdvancingField(true);
    await nextWizardStep();
    setIsAdvancingField(false);
  };

  const nextWizardStep = async () => {
    const nextIndex = wizardRef.current.currentIndex + 1;
    if (nextIndex >= wizardRef.current.queue.length) {
      setWizard((w) => ({ ...w, active: false, currentSuggestion: undefined, conversationHistory: [] }));
      dispatch(setHighlightCellId(undefined));
      enqueueAssistant('All done. I have finished going through the fields. You can refine any field further with the ✨ button.');
      return;
    }
    setWizard((w) => ({ ...w, currentIndex: nextIndex, currentSuggestion: undefined }));
    const suggestion = await generateSuggestionForCurrent();
    setWizard((w) => ({ ...w, currentSuggestion: suggestion }));
    const field = currentField();
    if (field) dispatch(setHighlightCellId(field.cellId));
    enqueueAssistant(
      `<strong>${currentFieldLabel()}</strong><br/>${suggestion}<br/><br/>Should I put this into your Lesson Plan?`,
      { type: 'wizard-suggestion' }
    );
  };

  const detectGenerateLessonPlanRequest = (input: string): boolean => {
    const lowerInput = input.toLowerCase();
    const keywords = [
      'create a lesson plan',
      'generate a lesson plan',
      'make a lesson plan',
      'build a lesson plan',
      'complete lesson plan',
      'fill out the lesson plan',
      'create complete',
      'generate complete',
      'make complete plan',
    ];
    
    return keywords.some(keyword => lowerInput.includes(keyword));
  };

  const handleGenerateLessonPlan = async (userInput: string) => {
    if (!currentPlan || !currentPlan.tableContent) return;
    
    setIsUpdatingPlan(true);
    
    try {
      // Extract lesson plan requirements from user input
      const request = extractLessonPlanRequest(userInput);
      setLastLessonRequest(request);
      
      // Generate the lesson plan
      const generatedPlan = await generateCompleteLessonPlan(request, currentPlan.tableContent);
      
      // Update the title
      if (generatedPlan.title) {
        dispatch(updatePlan({ id: currentPlan.id, title: generatedPlan.title }));
      }
      
      // Update all the cells with generated content
      let updatedCount = 0;
      for (const update of generatedPlan.updates) {
        dispatch(updatePlanCell({
          planId: currentPlan.id,
          rowId: update.rowId,
          cellId: update.cellId,
          content: update.content,
        }));
        updatedCount++;
        
        // Small delay to show progressive updates
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Send success message
      const successMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `✅ <strong>Lesson plan generated successfully!</strong><br/><br/>I've filled in ${updatedCount} fields based on your requirements:<br/>• ${request.grade ? `Grade ${request.grade}` : 'General'}<br/>• ${request.subject || 'Subject not specified'}<br/>• ${request.topic || 'Topic not specified'}<br/><br/>You can now review and edit any field as needed. Click on any field to see AI suggestions for improvements!`,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, successMessage]);
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while generating the lesson plan. Please try again with more specific details (grade, subject, topic).',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  const extractLessonPlanRequest = (input: string): LessonPlanRequest => {
    const lowerInput = input.toLowerCase();
    const request: LessonPlanRequest = {};
    
    // Extract grade
    const gradeMatch = lowerInput.match(/grade\s*(\d+|k|kindergarten)/i);
    if (gradeMatch) {
      request.grade = gradeMatch[1].toUpperCase() === 'KINDERGARTEN' ? 'K' : gradeMatch[1].toUpperCase();
    }
    
    // Extract subject
    const subjects = ['math', 'mathematics', 'science', 'english', 'social studies', 'history', 'geography'];
    for (const subject of subjects) {
      if (lowerInput.includes(subject)) {
        request.subject = subject.charAt(0).toUpperCase() + subject.slice(1);
        break;
      }
    }
    
    // Extract topic (words after "on" or "about" or "for")
    const topicMatch = lowerInput.match(/(?:on|about|for|topic:)\s+([a-z\s]+?)(?:\.|,|$|grade|for)/i);
    if (topicMatch) {
      request.topic = topicMatch[1].trim();
    }
    
    // Extract duration
    const durationMatch = lowerInput.match(/(\d+)\s*(minute|min|hour|hr)/i);
    if (durationMatch) {
      request.duration = durationMatch[0];
    }
    
    // Store the full input as additional info
    request.additionalInfo = input;
    
    return request;
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
    editorRef.current?.setContent(prompt);
    requestAnimationFrame(() => {
      editorRef.current?.focus();
    });
    setInputHighlight(true);
    window.setTimeout(() => setInputHighlight(false), 250);
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
        {/* Single Card Container */}
        <GlassCard className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-center border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <Sparkles size={20} className="text-emerald-600 dark:text-emerald-500" />
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">GPTeach AI</h2>
            </div>
          </div>

          {/* Scrollable Messages Area */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden"
          >
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
                  I can generate complete lesson plans for you! Just tell me the grade, subject, and topic. I'll fill out all the fields automatically using curriculum data. You can also ask questions or request specific improvements.
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
                      {message.meta?.type === 'wizard-suggestion' ? (
                        <div className="space-y-3">
                          <div
                            className="prose prose-sm max-w-none text-slate-700 dark:prose-invert dark:text-slate-300"
                            dangerouslySetInnerHTML={{ __html: message.content }}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={approveCurrentSuggestion}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                            >
                              Use
                            </button>
                            <button
                              onClick={regenerateCurrentSuggestion}
                              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                              Regenerate
                            </button>
                            <button
                              onClick={skipCurrentSuggestion}
                              className="rounded-lg border border-transparent px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                              Skip
                            </button>
                          </div>
                        </div>
                      ) : message.meta?.type === 'wizard-mode-choice' ? (
                        <div className="space-y-3">
                          <div
                            className="prose prose-sm max-w-none text-slate-700 dark:prose-invert dark:text-slate-300"
                            dangerouslySetInnerHTML={{ __html: message.content }}
                          />
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleWizardModeSelection('full', 'button')}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                            >
                              Generate Full Plan
                            </button>
                            <button
                              onClick={() => handleWizardModeSelection('step', 'button')}
                              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                              Go Step-by-Step
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="prose prose-sm max-w-none text-slate-700 dark:prose-invert dark:text-slate-300"
                          dangerouslySetInnerHTML={{ __html: message.content }}
                        />
                      )}
                    </div>
                  </div>
                ))}
                
              {/* Loading indicator */}
              {(isLoading || isUpdatingPlan || isAdvancingField) && (
                <div className="border-b border-slate-100 bg-slate-50 px-6 py-6 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="mx-auto max-w-3xl">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-600 text-white dark:bg-emerald-500">
                        {isUpdatingPlan ? (
                          <CheckCircle2 size={14} className="animate-pulse" />
                        ) : (
                          <Loader2 size={14} className="animate-spin" />
                        )}
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        GPTeach AI
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {isUpdatingPlan ? 'Updating lesson plan fields...' : (isAdvancingField ? 'Generating next field...' : 'Thinking...')}
                    </div>
                  </div>
                </div>
              )}
                
                <div ref={messagesEndRef} />
            </div>
            )}
          </div>

          {/* Input Area - Fixed at Bottom */}
          <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto max-w-3xl">
              <div className="relative flex items-center gap-2">
                <div 
                  className={`flex-1 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm transition-all duration-200 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 ${inputHighlight ? 'ring-2 ring-emerald-400/70 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : ''}`}
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
                  disabled={!inputValue.trim() || isLoading || isUpdatingPlan}
                  className="shrink-0 rounded-xl bg-emerald-600 p-3 text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
                  aria-label="Send message"
                >
                  {isLoading || isUpdatingPlan ? (
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
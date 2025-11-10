// src/lib/types.ts

export type Outcome = {
  id: string;
  subject: string;
  grade: string;
  code: string;
  description: string;
  jurisdiction: 'Alberta' | 'Other';
  gradeLabel?: string;
  strand?: string;
  strandSlug?: string;
};

export type TimedActivity = {
  id: string;
  minutes: number;
  title: string;
  details: string;
};

export type Cell = {
  id: string;
  content: string; // HTML content from the editor
  placeholder: string;
  colSpan?: number; // Kept for backward compatibility if needed
  size?: number; // Width percentage (0-100) for resizable panels
};

export type Row = {
  id: string;
  cells: Cell[];
  isHeader?: boolean;
};

export type RubricLevel = {
  label: string;
  descriptor: string;
};

export type RubricCriterion = {
  id: string;
  name: string;
  levels: RubricLevel[];
};

export type Rubric = {
  criteria: RubricCriterion[];
};

export type Plan = {
  id: string;
  createdAt: string;
  updatedAt: string;
  templateId?: string;
  title: string;
  grade: string;
  subject: string;
  topic: string;
  duration: number;
  outcomes: Outcome[];
  objectives: string;
  materials: string[];
  priorKnowledge: string;
  activities: TimedActivity[];
  assessment: string;
  differentiation: string;
  extensions: string;
  references: string;
  rubric: Rubric;
  tableContent: Row[];
  classId?: string;
  folderId?: string | null;
  uploadedFile?: { name: string; type: string };
  deletedAt?: string | null;
  gcalEventId?: string | null;
};

export type Class = {
  id: string;
  name: string;
  section: string;
  grade?: string;
  subject?: string;
  semester?: string;
  color: string;
  archived?: boolean;
  deletedAt?: string | null;
};

export type Folder = {
  id: string;
  name: string;
  classId: string;
  parentId: string | null;
  createdAt: string;
  color: string;
  deletedAt?: string | null;
};

export type TemplateField =
  | 'title'
  | 'grade'
  | 'subject'
  | 'duration'
  | 'outcomes'
  | 'objectives'
  | 'materials'
  | 'priorKnowledge'
  | 'activities'
  | 'assessment'
  | 'differentiation'
  | 'extensions'
  | 'references'
  | 'rubric'
  | 'date'
  | 'school'
  | 'teacherName'
  | 'courseLevel'
  | 'lessonTime'
  | 'location'
  | 'resources'
  | 'safety'
  | 'essentialQuestions'
  | 'essentialVocabulary'
  | 'crossCurricular'
  | 'timedActivities'
  | 'understandingChecks'
  | 'anticipatorySet'
  | 'bodySequence'
  | 'closing'
  | 'studentFeedback'
  | 'lookingAhead';

export type Template = {
  id: string;
  name: string;
  summary: string; // Added for UI display
  fields: TemplateField[];
  scaffold?: any; // For pre-filled template content
};

export type TemplatePreviewVariant = 'classic' | 'split' | 'sectioned';
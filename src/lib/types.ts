// src/lib/types.ts (Corrected)

export type Outcome = {
  id: string
  subject: string
  grade: string
  code: string // e.g., 'ELA6-1.1'
  description: string
  jurisdiction: 'Alberta' | 'Other'
  gradeLabel?: string
  strand?: string
  strandSlug?: string
}

export type TimedActivity = {
  id: string
  minutes: number
  title: string
  details: string
}

export type Cell = {
  id: string;
  content: string; // HTML content from the editor
  placeholder: string;
  colSpan?: number;
};

export type Row = {
  id: string;
  cells: Cell[];
  isHeader?: boolean;
};

export type RubricLevel = {
  label: string
  descriptor: string
}

export type RubricCriterion = {
  id: string
  name: string
  levels: RubricLevel[]
}

export type Rubric = {
  criteria: RubricCriterion[]
}

export type Plan = {
  id: string
  createdAt: string
  updatedAt: string
  templateId?: string
  title: string
  grade: string
  subject: string
  duration: number
  outcomes: Outcome[]
  objectives: string
  materials: string[]
  priorKnowledge: string
  activities: TimedActivity[]
  assessment: string
  differentiation: string
  extensions: string
  references: string
  rubric: Rubric
  tableContent: Row[] // This property is now correctly included
}

export type Class = {
  id: string
  name: string
  section: string
  grade?: string
  subject?: string
  semester?: string
  color: string;
  archived?: boolean;
}

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

export type Template = {
  id: string
  name: string
  fields: TemplateField[]
  variables?: string[] // e.g., ['{duration}', '{grade}']
}
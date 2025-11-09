import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit'
import type { Plan, TimedActivity, RubricCriterion, Outcome, Row, Cell, TemplateField } from '../../lib/types'

type PlansState = {
  items: Plan[]
  currentId?: string
}

const createDefaultTable = (): Row[] => [
    {
      id: nanoid(),
      cells: [
        { id: nanoid(), content: '<strong>Date:</strong>', placeholder: 'Date', colSpan: 1 },
        { id: nanoid(), content: '<strong>Grade/Class:</strong>', placeholder: 'Grade/Class', colSpan: 1 },
        { id: nanoid(), content: '<strong>Name:</strong>', placeholder: 'Name', colSpan: 1 },
      ],
    },
    {
      id: nanoid(),
      cells: [
        { id: nanoid(), content: '<strong>Course/level:</strong>', placeholder: 'Course/level', colSpan: 1 },
        { id: nanoid(), content: '<strong>School:</strong>', placeholder: 'School', colSpan: 1 },
        { id: nanoid(), content: '<strong>Lesson time:</strong>', placeholder: 'Lesson time', colSpan: 1 },
      ],
    },
    {
      id: nanoid(),
      cells: [
        { id: nanoid(), content: '<strong>Prerequisites/Previous Knowledge:</strong>', placeholder: 'Students should have a basic understanding of...', colSpan: 2 },
        { id: nanoid(), content: '<strong>Location/facility:</strong>', placeholder: 'e.g., Classroom, Gym', colSpan: 1 },
      ],
    },
    {
      id: nanoid(),
      cells: [
        { id: nanoid(), content: '<strong>Outcome(s) (quoted from program of studies):</strong>', placeholder: 'e.g., SCI10-1: Analyze the structure of cells', colSpan: 2 },
        { id: nanoid(), content: '<strong>Resources (e.g., materials for teacher and/or learner, technical requirements):</strong>', placeholder: 'Textbooks, video links, chart paper', colSpan: 1 },
      ],
    },
    {
      id: nanoid(),
      cells: [
        { id: nanoid(), content: '<strong>Goal of this lesson/demo (what will students know, understand and be able to do after this lesson):</strong>', placeholder: 'What will students know, understand, and be able to do?', colSpan: 2 },
        { id: nanoid(), content: '<strong>Safety Considerations:</strong>', placeholder: 'e.g., Proper handling of lab equipment', colSpan: 1 },
      ],
    },
    {
      id: nanoid(),
      cells: [{ id: nanoid(), content: '<strong>Essential question(s):</strong>', placeholder: 'Enter essential questions...', colSpan: 3 }],
    },
    {
      id: nanoid(),
      cells: [{ id: nanoid(), content: '<strong>Essential vocabulary:</strong>', placeholder: 'Enter essential vocabulary...', colSpan: 3 }],
    },
    {
      id: nanoid(),
      cells: [{ id: nanoid(), content: '<strong>Cross-curricular connections (opportunities for synthesis and application) - choose specific outcomes.</strong>', placeholder: 'Enter cross-curricular connections...', colSpan: 3 }],
    },
    {
      id: nanoid(),
      cells: [{ id: nanoid(), content: '<strong>Differentiated instructions (i.e., select one student and select one group and provide detailed instructions):</strong>', placeholder: 'Enter differentiated instructions...', colSpan: 3 }],
    },
    {
      id: nanoid(),
      isHeader: true,
      cells: [
          { id: nanoid(), content: '<b>Time for activity (in minutes)</b>', placeholder: '', colSpan: 1 },
          { id: nanoid(), content: '<b>Description of activity, New learning</b>', placeholder: '', colSpan: 1 },
          { id: nanoid(), content: '<b>Check for understanding (formative, summative assessments)</b>', placeholder: '', colSpan: 1 },
      ]
    },
    {
      id: nanoid(),
      cells: [
          { id: nanoid(), content: '', placeholder: 'Anticipatory set/hook/introduction', colSpan: 1 },
          { id: nanoid(), content: '', placeholder: 'Body/activities/strategies (this section should be VERY detailed)', colSpan: 1 },
          { id: nanoid(), content: '<ul><li>real world, community connections</li><li>Student Feedback opportunities</li><li>Looking ahead</li></ul>', placeholder: 'Closing', colSpan: 1 },
      ]
    }
];

// Helper to create a new table structure from a template's fields
const createTableFromTemplate = (fields: TemplateField[]): Row[] => {
    const newRows: Row[] = [];
    const fieldToAction: Record<TemplateField, () => void> = {
        title: () => newRows.push({
            id: nanoid(),
            cells: [{ id: nanoid(), content: 'Title:', placeholder: 'Enter lesson title...', colSpan: 3 }]
        }),
        grade: () => newRows.push({
            id: nanoid(),
            cells: [
                { id: nanoid(), content: 'Grade:', placeholder: 'e.g., Grade 5', colSpan: 1 },
                { id: nanoid(), content: 'Subject:', placeholder: 'e.g., Mathematics', colSpan: 1 },
                { id: nanoid(), content: 'Duration (min):', placeholder: 'e.g., 60', colSpan: 1 },
            ]
        }),
        subject: () => {}, // Handled with grade
        duration: () => {}, // Handled with grade
        outcomes: () => newRows.push({
            id: nanoid(),
            cells: [{ id: nanoid(), content: 'Outcomes:', placeholder: 'List program of studies outcomes...', colSpan: 3 }]
        }),
        objectives: () => newRows.push({
            id: nanoid(),
            cells: [{ id: nanoid(), content: 'Objectives:', placeholder: 'What will students be able to do?', colSpan: 3 }]
        }),
        materials: () => newRows.push({
            id: nanoid(),
            cells: [{ id: nanoid(), content: 'Materials & Resources:', placeholder: 'List all required materials...', colSpan: 3 }]
        }),
        priorKnowledge: () => newRows.push({
            id: nanoid(),
            cells: [{ id: nanoid(), content: 'Prior Knowledge:', placeholder: 'What should students already know?', colSpan: 3 }]
        }),
        activities: () => newRows.push(
            {
                id: nanoid(),
                isHeader: true,
                cells: [
                    { id: nanoid(), content: '<b>Time (min)</b>', placeholder: '', colSpan: 1 },
                    { id: nanoid(), content: '<b>Activity Description</b>', placeholder: '', colSpan: 2 },
                ]
            },
            {
                id: nanoid(),
                cells: [
                    { id: nanoid(), content: '', placeholder: 'e.g., 15', colSpan: 1 },
                    { id: nanoid(), content: '', placeholder: 'Introduction / Hook', colSpan: 2 },
                ]
            }
        ),
        assessment: () => newRows.push({
            id: nanoid(),
            cells: [{ id: nanoid(), content: 'Assessment:', placeholder: 'How will you check for understanding?', colSpan: 3 }]
        }),
        differentiation: () => newRows.push({
            id: nanoid(),
            cells: [{ id: nanoid(), content: 'Differentiation:', placeholder: 'How will you support diverse learners?', colSpan: 3 }]
        }),
        extensions: () => newRows.push({
            id: nanoid(),
            cells: [{ id: nanoid(), content: 'Extensions:', placeholder: 'Activities for early finishers...', colSpan: 3 }]
        }),
        references: () => newRows.push({
            id: nanoid(),
            cells: [{ id: nanoid(), content: 'References:', placeholder: 'Cite any sources used...', colSpan: 3 }]
        }),
        rubric: () => newRows.push({
            id: nanoid(),
            cells: [{ id: nanoid(), content: 'Rubric:', placeholder: 'Define criteria for success...', colSpan: 3 }]
        }),
    };

    fields.forEach(field => {
        if (fieldToAction[field]) {
            fieldToAction[field]();
        }
    });

    return newRows;
};

const emptyPlan = (): Plan => ({
  id: nanoid(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  title: 'Untitled Lesson',
  grade: '',
  subject: '',
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
  tableContent: createDefaultTable(), // Use the default table structure
})

const initial: PlansState = {
  items: [emptyPlan()],
  currentId: undefined
}

const plansSlice = createSlice({
  name: 'plans',
  initialState: initial,
  reducers: {
    createPlan(state) {
      const p = emptyPlan()
      state.items.unshift(p)
      state.currentId = p.id
    },
    setCurrentPlan(state, action: PayloadAction<string | undefined>) {
      state.currentId = action.payload
    },
    updatePlan(state, action: PayloadAction<Partial<Plan> & { id: string }>) {
      const idx = state.items.findIndex(p => p.id === action.payload.id)
      if (idx >= 0) {
        state.items[idx] = { ...state.items[idx], ...action.payload, updatedAt: new Date().toISOString() }
      }
    },
    deletePlan(state, action: PayloadAction<string>) {
      state.items = state.items.filter(p => p.id !== action.payload)
      if (state.currentId === action.payload) state.currentId = state.items[0]?.id
    },
    setOutcomesForPlan(state, action: PayloadAction<{ planId: string; outcomes: Outcome[] }>) {
      const plan = state.items.find(p => p.id === action.payload.planId)
      if (plan) plan.outcomes = action.payload.outcomes
    },
    updatePlanCell(state, action: PayloadAction<{ planId: string; rowId: string; cellId: string; content: string }>) {
        const plan = state.items.find(p => p.id === action.payload.planId);
        if (plan) {
            const row = plan.tableContent.find(r => r.id === action.payload.rowId);
            if (row) {
                const cell = row.cells.find(c => c.id === action.payload.cellId);
                if (cell) {
                    cell.content = action.payload.content;
                }
            }
        }
    },
    addPlanRow(state, action: PayloadAction<{ planId: string }>) {
        const plan = state.items.find(p => p.id === action.payload.planId);
        if (plan) {
            const newRow: Row = {
                id: nanoid(),
                cells: [{ id: nanoid(), content: '', placeholder: 'New section', colSpan: 3 }]
            };
            plan.tableContent.push(newRow);
        }
    },
    removePlanRow(state, action: PayloadAction<{ planId: string; rowId: string }>) {
        const plan = state.items.find(p => p.id === action.payload.planId);
        if (plan) {
            plan.tableContent = plan.tableContent.filter(row => row.id !== action.payload.rowId);
        }
    },
    applyTemplateToPlan(state, action: PayloadAction<{ planId: string; fields: TemplateField[] }>) {
        const plan = state.items.find(p => p.id === action.payload.planId);
        if (plan) {
            plan.tableContent = createTableFromTemplate(action.payload.fields);
        }
    }
  }
})

export const {
  createPlan, setCurrentPlan, updatePlan, deletePlan,
  setOutcomesForPlan, updatePlanCell, addPlanRow, removePlanRow,
  applyTemplateToPlan
} = plansSlice.actions

export default plansSlice.reducer
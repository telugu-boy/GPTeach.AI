import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit'
import type { Plan, Outcome, Row, Cell, TemplateField } from '../../lib/types'

type PlansState = {
  items: Plan[]
  currentId?: string
}

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

const emptyPlan = (classId: string, folderId: string | null): Plan => ({
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
  classId,
  folderId,
})

const createTableFromTemplate = (fields: TemplateField[]): Row[] => {
    const newRows: Row[] = [];
    const fieldToAction: Record<TemplateField, () => void> = {
        title: () => {},
        grade: () => {},
        subject: () => {},
        duration: () => {},
        outcomes: () => newRows.push({ id: nanoid(), cells: [{ id: nanoid(), content: '<strong>Outcomes:</strong>', placeholder: 'List program of studies outcomes...' }]}),
        objectives: () => newRows.push({ id: nanoid(), cells: [{ id: nanoid(), content: '<strong>Objectives:</strong>', placeholder: 'What will students be able to do?' }]}),
        materials: () => newRows.push({ id: nanoid(), cells: [{ id: nanoid(), content: '<strong>Materials & Resources:</strong>', placeholder: 'List all required materials...' }]}),
        priorKnowledge: () => newRows.push({ id: nanoid(), cells: [{ id: nanoid(), content: '<strong>Prior Knowledge:</strong>', placeholder: 'What should students already know?' }]}),
        activities: () => newRows.push(
            { id: nanoid(), isHeader: true, cells: [ { id: nanoid(), content: '<b>Time (min)</b>', placeholder: '' }, { id: nanoid(), content: '<b>Activity Description</b>', placeholder: '' } ]},
            { id: nanoid(), cells: [ { id: nanoid(), content: '', placeholder: 'e.g., 15' }, { id: nanoid(), content: '', placeholder: 'Introduction / Hook' } ]}
        ),
        assessment: () => newRows.push({ id: nanoid(), cells: [{ id: nanoid(), content: '<strong>Assessment:</strong>', placeholder: 'How will you check for understanding?' }]}),
        differentiation: () => newRows.push({ id: nanoid(), cells: [{ id: nanoid(), content: '<strong>Differentiation:</strong>', placeholder: 'How will you support diverse learners?' }]}),
        extensions: () => newRows.push({ id: nanoid(), cells: [{ id: nanoid(), content: '<strong>Extensions:</strong>', placeholder: 'Activities for early finishers...' }]}),
        references: () => newRows.push({ id: nanoid(), cells: [{ id: nanoid(), content: '<strong>References:</strong>', placeholder: 'Cite any sources used...' }]}),
        rubric: () => newRows.push({ id: nanoid(), cells: [{ id: nanoid(), content: '<strong>Rubric:</strong>', placeholder: 'Define criteria for success...' }]}),
        date: () => {}, school: () => {}, teacherName: () => {}, courseLevel: () => {}, lessonTime: () => {}, location: () => {}, resources: () => {}, safety: () => {}, essentialQuestions: () => {}, essentialVocabulary: () => {}, crossCurricular: () => {}, timedActivities: () => {}, understandingChecks: () => {}, anticipatorySet: () => {}, bodySequence: () => {}, closing: () => {}, studentFeedback: () => {}, lookingAhead: () => {},
    };

    fields.forEach(field => {
        if (fieldToAction[field]) {
            fieldToAction[field]();
        }
    });
    return newRows;
};

const initial: PlansState = {
  items: [],
  currentId: undefined,
}

type CreatePlanPayload = {
    classId: string;
    folderId: string | null;
    title: string;
    grade: string;
    subject: string;
    topic: string;
    fields: TemplateField[];
    optionalFieldContent: Partial<Record<TemplateField, string>>;
};

const plansSlice = createSlice({
  name: 'plans',
  initialState: initial,
  reducers: {
    addPlan(state, action: PayloadAction<Plan>) {
        state.items.push(action.payload);
    },
    createPlan(state, action: PayloadAction<CreatePlanPayload>) {
      const { classId, folderId, title, grade, subject, topic, fields, optionalFieldContent } = action.payload;
      const tableContent = createTableFromTemplate(fields);

      const fieldToCellMarker: Partial<Record<TemplateField, string>> = {
          outcomes: '<strong>Outcomes:</strong>', objectives: '<strong>Objectives:</strong>', materials: '<strong>Materials & Resources:</strong>', priorKnowledge: '<strong>Prior Knowledge:</strong>', assessment: '<strong>Assessment:</strong>', differentiation: '<strong>Differentiation:</strong>', extensions: '<strong>Extensions:</strong>', references: '<strong>References:</strong>', rubric: '<strong>Rubric:</strong>'
      };

      if (optionalFieldContent) {
          for (const [field, content] of Object.entries(optionalFieldContent)) {
              if (!content) continue;
              const marker = fieldToCellMarker[field as TemplateField];
              let cellUpdated = false;
              if (marker) {
                  for (const row of tableContent) {
                      for (const cell of row.cells) {
                          if (cell.content.includes(marker)) {
                              cell.content += `<p>${content.replace(/\n/g, '<br>')}</p>`;
                              cellUpdated = true;
                              break;
                          }
                      }
                      if (cellUpdated) break;
                  }
              } else if (field === 'activities') {
                  const activitiesHeaderIndex = tableContent.findIndex(row => row.isHeader && row.cells.some(cell => cell.content.includes('Activity Description')));
                  if (activitiesHeaderIndex !== -1 && activitiesHeaderIndex + 1 < tableContent.length) {
                      tableContent[activitiesHeaderIndex + 1].cells[1].content = `<p>${content.replace(/\n/g, '<br>')}</p>`;
                  }
              }
          }
      }

      const newPlan: Plan = {
          ...emptyPlan(classId, folderId),
          title, grade, subject, topic,
          tableContent: [
              { id: nanoid(), cells: [ { id: nanoid(), content: `<strong>Grade:</strong> ${grade}`, placeholder: '' }, { id: nanoid(), content: `<strong>Subject:</strong> ${subject}`, placeholder: '' }, { id: nanoid(), content: `<strong>Topic:</strong> ${topic}`, placeholder: '' } ] },
              ...tableContent
          ],
      };
      
      state.items.unshift(newPlan);
      state.currentId = newPlan.id;
    },
    importUploadedPlan(state, action: PayloadAction<{ classId: string; folderId: string | null; file: { name: string; type: string } }>) {
        const { classId, folderId, file } = action.payload;
        const title = file.name.lastIndexOf('.') > 0 ? file.name.slice(0, file.name.lastIndexOf('.')) : file.name;
        const newPlan: Plan = { ...emptyPlan(classId, folderId), id: nanoid(), title, uploadedFile: file, tableContent: [ { id: nanoid(), cells: [{ id: nanoid(), content: `<h3>Uploaded File: ${file.name}</h3><p>This lesson plan was created from an uploaded file. You can add notes and details below.</p>`, placeholder: '' }] } ] };
        state.items.unshift(newPlan);
        state.currentId = newPlan.id;
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
    softDeletePlan(state, action: PayloadAction<string>) {
        const plan = state.items.find(p => p.id === action.payload);
        if (plan) plan.deletedAt = new Date().toISOString();
    },
    restorePlan(state, action: PayloadAction<string>) {
        const plan = state.items.find(p => p.id === action.payload);
        if (plan) plan.deletedAt = null;
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
            plan.updatedAt = new Date().toISOString();
            const row = plan.tableContent.find(r => r.id === action.payload.rowId);
            const cell = row?.cells.find(c => c.id === action.payload.cellId);
            if (cell) cell.content = action.payload.content;
        }
    },
    addPlanRow(state, action: PayloadAction<{ planId: string, rowIndex?: number }>) {
        const plan = state.items.find(p => p.id === action.payload.planId);
        if (plan) {
            plan.updatedAt = new Date().toISOString();
            const newRow: Row = { id: nanoid(), cells: [{ id: nanoid(), content: '', placeholder: 'New section' }] };
            if (action.payload.rowIndex !== undefined) {
                plan.tableContent.splice(action.payload.rowIndex + 1, 0, newRow);
            } else {
                plan.tableContent.push(newRow);
            }
        }
    },
    removePlanRow(state, action: PayloadAction<{ planId: string; rowId: string }>) {
        const plan = state.items.find(p => p.id === action.payload.planId);
        if (plan) {
            plan.updatedAt = new Date().toISOString();
            plan.tableContent = plan.tableContent.filter(row => row.id !== action.payload.rowId);
        }
    },
    applyTemplateToPlan(state, action: PayloadAction<{ planId: string; fields: TemplateField[] }>) {
        const plan = state.items.find(p => p.id === action.payload.planId);
        if (plan) {
            plan.updatedAt = new Date().toISOString();
            plan.tableContent = createTableFromTemplate(action.payload.fields);
        }
    },
    duplicatePlan(state, action: PayloadAction<{ planId: string }>) {
        const originalPlan = state.items.find(p => p.id === action.payload.planId);
        if (originalPlan) {
            const newPlan: Plan = { ...JSON.parse(JSON.stringify(originalPlan)), id: nanoid(), title: `${originalPlan.title} Copy`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            state.items.unshift(newPlan);
        }
    },
    pasteCopiedPlan(state, action: PayloadAction<{ sourcePlanId: string, targetClassId: string, targetFolderId: string | null }>) {
        const originalPlan = state.items.find(p => p.id === action.payload.sourcePlanId);
        if (originalPlan) {
            const newPlan: Plan = { ...JSON.parse(JSON.stringify(originalPlan)), id: nanoid(), classId: action.payload.targetClassId, folderId: action.payload.targetFolderId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            state.items.unshift(newPlan);
        }
    },
    movePlan(state, action: PayloadAction<{ planId: string; targetClassId: string; targetFolderId: string | null }>) {
        const plan = state.items.find(p => p.id === action.payload.planId);
        if (plan) {
            plan.classId = action.payload.targetClassId;
            plan.folderId = action.payload.targetFolderId;
            plan.updatedAt = new Date().toISOString();
        }
    },
    resizePlanRow(state, action: PayloadAction<{ planId: string; rowId: string; sizes: number[] }>) {
        const plan = state.items.find(p => p.id === action.payload.planId);
        const row = plan?.tableContent.find(r => r.id === action.payload.rowId);
        if (row) {
            action.payload.sizes.forEach((size, index) => {
                if (row.cells[index]) row.cells[index].size = size;
            });
            plan.updatedAt = new Date().toISOString();
        }
    },
    splitPlanCell(state, action: PayloadAction<{ planId: string; rowId: string; cellId: string }>) {
        const plan = state.items.find(p => p.id === action.payload.planId);
        const row = plan?.tableContent.find(r => r.id === action.payload.rowId);
        if (row) {
            const cellIndex = row.cells.findIndex(c => c.id === action.payload.cellId);
            if (cellIndex !== -1) {
                const originalCell = row.cells[cellIndex];
                const newCell: Cell = { id: nanoid(), content: '', placeholder: '...', size: (originalCell.size || 50) / 2 };
                originalCell.size = (originalCell.size || 50) / 2;
                row.cells.splice(cellIndex + 1, 0, newCell);
                plan.updatedAt = new Date().toISOString();
            }
        }
    },
    mergePlanCell(state, action: PayloadAction<{ planId: string; rowId: string; cellId: string }>) {
        const plan = state.items.find(p => p.id === action.payload.planId);
        const row = plan?.tableContent.find(r => r.id === action.payload.rowId);
        if (row && row.cells.length > 1) {
            const cellIndex = row.cells.findIndex(c => c.id === action.payload.cellId);
            if (cellIndex > 0) {
                const mergingCell = row.cells[cellIndex];
                const targetCell = row.cells[cellIndex - 1];
                targetCell.size = (targetCell.size || 50) + (mergingCell.size || 0);
                if(mergingCell.content && mergingCell.content !== '<p></p>') targetCell.content += ` ${mergingCell.content}`;
                row.cells.splice(cellIndex, 1);
                plan.updatedAt = new Date().toISOString();
            }
        }
    },
    movePlanRow(state, action: PayloadAction<{ planId: string; fromIndex: number; toIndex: number }>) {
        const plan = state.items.find(p => p.id === action.payload.planId);
        if (plan) {
            const [movedRow] = plan.tableContent.splice(action.payload.fromIndex, 1);
            if (movedRow) {
                plan.tableContent.splice(action.payload.toIndex, 0, movedRow);
                plan.updatedAt = new Date().toISOString();
            }
        }
    },
    movePlanCell(state, action: PayloadAction<{ planId: string; rowId: string; fromIndex: number; toIndex: number }>) {
        const plan = state.items.find(p => p.id === action.payload.planId);
        const row = plan?.tableContent.find(r => r.id === action.payload.rowId);
        if (row) {
            const [movedCell] = row.cells.splice(action.payload.fromIndex, 1);
            if (movedCell) {
                row.cells.splice(action.payload.toIndex, 0, movedCell);
                plan.updatedAt = new Date().toISOString();
            }
        }
    },
    linkPlanToCalendarEvent(state, action: PayloadAction<{ planId: string; eventId: string }>) {
        const plan = state.items.find(p => p.id === action.payload.planId);
        if (plan) {
            plan.gcalEventId = action.payload.eventId;
            plan.updatedAt = new Date().toISOString();
        }
    },
  }
})

export const {
  addPlan, createPlan, setCurrentPlan, updatePlan, deletePlan,
  setOutcomesForPlan, updatePlanCell, addPlanRow, removePlanRow,
  applyTemplateToPlan, importUploadedPlan,
  duplicatePlan, pasteCopiedPlan, movePlan,
  softDeletePlan, restorePlan, linkPlanToCalendarEvent,
  resizePlanRow, splitPlanCell, mergePlanCell, movePlanRow, movePlanCell
} = plansSlice.actions

export default plansSlice.reducer
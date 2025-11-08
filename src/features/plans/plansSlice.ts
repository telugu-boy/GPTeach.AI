
import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit'
import type { Plan, TimedActivity, RubricCriterion, Outcome } from '../../lib/types'

type PlansState = {
  items: Plan[]
  currentId?: string
}

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
  rubric: { criteria: [] }
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
    addActivity(state, action: PayloadAction<{ planId: string; activity: TimedActivity }>) {
      const plan = state.items.find(p => p.id === action.payload.planId)
      if (plan) plan.activities.push(action.payload.activity)
    },
    updateActivities(state, action: PayloadAction<{ planId: string; activities: TimedActivity[] }>) {
      const plan = state.items.find(p => p.id === action.payload.planId)
      if (plan) plan.activities = action.payload.activities
    },
    setRubric(state, action: PayloadAction<{ planId: string; criteria: RubricCriterion[] }>) {
      const plan = state.items.find(p => p.id === action.payload.planId)
      if (plan) plan.rubric.criteria = action.payload.criteria
    },
    setOutcomesForPlan(state, action: PayloadAction<{ planId: string; outcomes: Outcome[] }>) {
      const plan = state.items.find(p => p.id === action.payload.planId)
      if (plan) plan.outcomes = action.payload.outcomes
    }
  }
})

export const {
  createPlan, setCurrentPlan, updatePlan, deletePlan,
  addActivity, updateActivities, setRubric, setOutcomesForPlan
} = plansSlice.actions

export default plansSlice.reducer

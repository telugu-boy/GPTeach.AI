
import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit'
import type { Template, TemplateField } from '../../lib/types'
import { lessonPlanTemplates } from '../../lib/templatesData'

type TemplatesState = {
  items: Template[]
}

const initialState: TemplatesState = {
  items: lessonPlanTemplates
}

const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    addTemplate: {
      prepare: (name: string, fields: TemplateField[], variables?: string[]) => ({
        payload: { id: nanoid(), name, fields, variables }
      }),
      reducer(state, action: PayloadAction<Template>) {
        state.items.push(action.payload)
      }
    },
    updateTemplate(state, action: PayloadAction<Template>) {
      const idx = state.items.findIndex(t => t.id === action.payload.id)
      if (idx >= 0) state.items[idx] = action.payload
    },
    deleteTemplate(state, action: PayloadAction<string>) {
      state.items = state.items.filter(t => t.id !== action.payload)
    }
  }
})

export const { addTemplate, updateTemplate, deleteTemplate } = templatesSlice.actions
export default templatesSlice.reducer

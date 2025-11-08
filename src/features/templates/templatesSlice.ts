
import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit'
import type { Template, TemplateField } from '../../lib/types'

type TemplatesState = {
  items: Template[]
}

const defaultTemplate: Template = {
  id: 'default',
  name: 'Alberta POS - Core',
  fields: [
    'title','grade','subject','duration','outcomes','objectives',
    'materials','priorKnowledge','activities','assessment','differentiation',
    'extensions','references','rubric'
  ],
  variables: ['{duration}','{grade}','{subject}','{outcomeCodes}']
}

const initialState: TemplatesState = {
  items: [defaultTemplate]
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

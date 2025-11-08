
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Outcome } from '../../lib/types'

type OutcomesState = {
  items: Outcome[]
  filters: {
    subject: string
    grade: string
    query: string
  }
}

const initialState: OutcomesState = {
  items: [
    {
      id: 'ela6-1.1',
      subject: 'ELA',
      grade: '6',
      code: 'ELA6-1.1',
      description: 'Explore thoughts, ideas, feelings and experiences.',
      jurisdiction: 'Alberta'
    },
    {
      id: 'sci7-2.3',
      subject: 'Science',
      grade: '7',
      code: 'SCI7-2.3',
      description: 'Investigate and describe ecological interactions.',
      jurisdiction: 'Alberta'
    }
  ],
  filters: { subject: '', grade: '', query: '' }
}

const outcomesSlice = createSlice({
  name: 'outcomes',
  initialState,
  reducers: {
    setOutcomes(state, action: PayloadAction<Outcome[]>) {
      state.items = action.payload
    },
    setOutcomeFilters(state, action: PayloadAction<OutcomesState['filters']>) {
      state.filters = action.payload
    }
  }
})

export const { setOutcomes, setOutcomeFilters } = outcomesSlice.actions
export default outcomesSlice.reducer

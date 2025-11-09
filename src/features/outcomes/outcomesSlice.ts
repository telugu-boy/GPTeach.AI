
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import type { Outcome } from '../../lib/types'
import { getDb } from '../../lib/firebase'

type OutcomesState = {
  items: Outcome[]
  filters: {
    subject: string
    grade: string
    query: string
  }
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error?: string
}

export const fetchOutcomes = createAsyncThunk<Outcome[], void, { rejectValue: string }>(
  'outcomes/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const db = getDb()
      if (!db) {
        throw new Error('Firebase is not configured. Set the VITE_FIREBASE_* env vars and reload.')
      }
      const snapshot = await getDocs(query(collection(db, 'mathOutcomes'), orderBy('code')))
      return snapshot.docs.map((doc) => {
        const data = doc.data() as Outcome
        return {
          id: doc.id,
          subject: data.subject ?? 'Mathematics',
          grade: data.grade,
          code: data.code,
          description: data.description,
          jurisdiction: data.jurisdiction ?? 'Alberta',
          gradeLabel: data.gradeLabel,
          strand: data.strand,
          strandSlug: data.strandSlug
        }
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load outcomes.'
      return rejectWithValue(message)
    }
  }
)

const initialState: OutcomesState = {
  items: [],
  filters: { subject: '', grade: '', query: '' },
  status: 'idle',
  error: undefined
}

const outcomesSlice = createSlice({
  name: 'outcomes',
  initialState,
  reducers: {
    setOutcomes(state, action: PayloadAction<Outcome[]>) {
      state.items = action.payload
      state.status = 'succeeded'
      state.error = undefined
    },
    setOutcomeFilters(state, action: PayloadAction<OutcomesState['filters']>) {
      state.filters = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOutcomes.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchOutcomes.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
        state.error = undefined
      })
      .addCase(fetchOutcomes.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? action.error.message
      })
    }
})

export const { setOutcomes, setOutcomeFilters } = outcomesSlice.actions
export default outcomesSlice.reducer


import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type UIState = {
  theme: 'light' | 'dark' | 'system'
  loading: boolean
  promptPreviewOpen: boolean
  highlightCellId?: string
}

const initialState: UIState = {
  theme: 'light',
  loading: false,
  promptPreviewOpen: true,
  highlightCellId: undefined,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<UIState['theme']>) {
      state.theme = action.payload
      const root = document.documentElement
      if (state.theme === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },
    setPromptPreviewOpen(state, action: PayloadAction<boolean>) {
      state.promptPreviewOpen = action.payload
    },
    setHighlightCellId(state, action: PayloadAction<string | undefined>) {
      state.highlightCellId = action.payload
    }
  }
})

export const { setTheme, setLoading, setPromptPreviewOpen, setHighlightCellId } = uiSlice.actions
export default uiSlice.reducer

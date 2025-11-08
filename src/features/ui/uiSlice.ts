
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type UIState = {
  theme: 'light' | 'dark' | 'system'
  loading: boolean
  promptPreviewOpen: boolean
}

const initialState: UIState = {
  theme: 'light',
  loading: false,
  promptPreviewOpen: true,
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
    }
  }
})

export const { setTheme, setLoading, setPromptPreviewOpen } = uiSlice.actions
export default uiSlice.reducer

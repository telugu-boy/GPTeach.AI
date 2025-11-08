
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '../features/ui/uiSlice'
import templatesReducer from '../features/templates/templatesSlice'
import plansReducer from '../features/plans/plansSlice'
import outcomesReducer from '../features/outcomes/outcomesSlice'
import { persistMiddleware } from './storage'

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    templates: templatesReducer,
    plans: plansReducer,
    outcomes: outcomesReducer,
  },
  middleware: (getDefault) => getDefault().concat(persistMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

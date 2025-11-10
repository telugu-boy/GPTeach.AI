// src/app/store.ts

import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '../features/ui/uiSlice'
import templatesReducer from '../features/templates/templatesSlice'
import plansReducer from '../features/plans/plansSlice'
import outcomesReducer from '../features/outcomes/outcomesSlice'
import classesReducer from '../features/classes/classesSlice'
import foldersReducer from '../features/folders/foldersSlice';
import clipboardReducer from '../features/clipboard/clipboardSlice';
import authReducer from '../features/auth/authSlice';
// FIX: Import preloadedState and the middleware
import { persistMiddleware, preloadedState } from './storage'

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    templates: templatesReducer,
    plans: plansReducer,
    outcomes: outcomesReducer,
    classes: classesReducer,
    folders: foldersReducer,
    clipboard: clipboardReducer,
    auth: authReducer,
  },
  // FIX: Add the preloadedState to the configuration
  preloadedState,
  middleware: (getDefault) => getDefault({
    // It's good practice to make the middleware serializable check compatible
    // with the persisted state which may contain non-serializable data if not careful.
    // This is optional but recommended.
    serializableCheck: {
      ignoredActions: ['persist/PERSIST'],
      ignoredPaths: ['some.path.to.ignore'],
    },
  }).concat(persistMiddleware),
})

export type RootState = typeof store.getState
export type AppDispatch = typeof store.dispatch
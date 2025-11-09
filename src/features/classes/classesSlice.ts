import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';
import type { Class } from '../../lib/types';

type ClassesState = {
  items: Class[];
};

const initialState: ClassesState = {
  items: [],
};

const classesSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {
    addClass(state, action: PayloadAction<{ name: string; section: string; grade?: string; subject?: string; semester?: string; color: string }>) {
      const newClass: Class = {
        id: nanoid(),
        name: action.payload.name,
        section: action.payload.section,
        grade: action.payload.grade,
        subject: action.payload.subject,
        semester: action.payload.semester,
        color: action.payload.color,
        archived: false,
      };
      state.items.push(newClass);
    },
    updateClass(state, action: PayloadAction<Partial<Class> & { id: string }>) {
      const index = state.items.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    archiveClass(state, action: PayloadAction<string>) {
      const index = state.items.findIndex(c => c.id === action.payload);
      if (index !== -1) {
        state.items[index].archived = true;
      }
    },
    unarchiveClass(state, action: PayloadAction<string>) {
      const index = state.items.findIndex(c => c.id === action.payload);
      if (index !== -1) {
        state.items[index].archived = false;
      }
    },
    deleteClass(state, action: PayloadAction<string>) {
      state.items = state.items.filter(c => c.id !== action.payload);
    }
  },
});

export const { addClass, updateClass, archiveClass, unarchiveClass, deleteClass } = classesSlice.actions;
export default classesSlice.reducer;
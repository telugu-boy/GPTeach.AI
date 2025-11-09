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
    addClass(state, action: PayloadAction<{ name: string; section: string }>) {
      const newClass: Class = {
        id: nanoid(),
        name: action.payload.name,
        section: action.payload.section,
      };
      state.items.push(newClass);
    },
    // Future reducers like deleteClass, updateClass can be added here
  },
});

export const { addClass } = classesSlice.actions;
export default classesSlice.reducer;
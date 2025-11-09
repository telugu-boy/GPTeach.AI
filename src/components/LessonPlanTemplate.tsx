/*
JSON Schema for the 'tableContent' property of a Plan object:
[
  {
    "id": "string", // Unique ID for the row
    "cells": [
      {
        "id": "string",        // Unique ID for the cell
        "content": "string",     // HTML content from the rich text editor
        "placeholder": "string", // Placeholder text for the editor
        "colSpan": "number"      // Optional, defaults to 1, determines cell width in a 3-column grid
      }
    ],
    "isHeader": "boolean" // Optional, for styling header rows differently
  }
]
*/
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../app/store';
import { updatePlan, updatePlanCell, addPlanRow, removePlanRow } from '../features/plans/plansSlice';
import InlineToolbarEditor from './InlineToolbarEditor';
import ExportControls from './ExportControls';

export default function LessonPlanTemplate() {
  const dispatch = useDispatch();
  const plans = useSelector((s: RootState) => s.plans.items);
  const currentId = useSelector((s: RootState) => s.plans.currentId) || plans[0]?.id;
  const plan = plans.find(p => p.id === currentId);

  if (!plan) {
    return (
      <div className="p-8 text-center text-slate-500">
        Please create or select a lesson plan to begin.
      </div>
    );
  }

  const { tableContent: planRows, id: planId } = plan;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updatePlan({ id: planId, title: e.target.value }));
  };

  const handleUpdateCell = (rowId: string, cellId: string, newContent: string) => {
    dispatch(updatePlanCell({ planId, rowId, cellId, content: newContent }));
  };

  const handleAddRow = () => {
    dispatch(addPlanRow({ planId }));
  };
  
  const handleRemoveRow = (rowId: string) => {
    dispatch(removePlanRow({ planId, rowId }));
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-sm">
        <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
            <input 
                type="text"
                value={plan.title}
                onChange={handleTitleChange}
                placeholder="Untitled Lesson Plan"
                className="w-full text-2xl md:text-3xl font-bold bg-transparent focus:outline-none text-slate-800 dark:text-slate-100"
            />
            <ExportControls />
        </div>

        <div className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800">
            {planRows.map((row) => (
                <div key={row.id} className="group flex border-b border-slate-300 dark:border-slate-700 last:border-b-0">
                    <div className="grid grid-cols-3 flex-1">
                        {row.cells.map((cell) => (
                            <div
                                key={cell.id}
                                className="border-r border-slate-300 dark:border-slate-700 last:border-r-0"
                                style={{ gridColumn: `span ${cell.colSpan || 1} / span ${cell.colSpan || 1}` }}
                            >
                                <InlineToolbarEditor
                                    value={cell.content}
                                    onChange={(newContent) => handleUpdateCell(row.id, cell.id, newContent)}
                                    placeholder={cell.placeholder}
                                />
                            </div>
                        ))}
                    </div>
                     {!row.isHeader && (
                        <button 
                            onClick={() => handleRemoveRow(row.id)} 
                            className="w-8 flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40 transition-opacity">
                            <Trash2 size={16}/>
                        </button>
                     )}
                </div>
            ))}
        </div>
        <div className="mt-2">
            <button 
                onClick={handleAddRow} 
                className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                <Plus size={16} /> Add Section
            </button>
        </div>
    </div>
  );
}
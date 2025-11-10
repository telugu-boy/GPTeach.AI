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
        "size": "number"         // Width percentage (0-100)
      }
    ],
    "isHeader": "boolean" // Optional, for styling header rows differently
  }
]
*/
import React from 'react';
import { Plus, Trash2, Split } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import type { RootState } from '../app/store';
import { 
    updatePlan, 
    updatePlanCell, 
    addPlanRow, 
    removePlanRow,
    resizePlanRow,
    splitPlanCell,
    mergePlanCell
} from '../features/plans/plansSlice';
import InlineToolbarEditor from './InlineToolbarEditor';
import ExportControls from './ExportControls';

export default function LessonPlanTemplate() {
  const dispatch = useDispatch();
  const plans = useSelector((s: RootState) => s.plans.items);
  const currentId = useSelector((s: RootState) => s.plans.currentId) || plans[0]?.id;
  const plan = plans.find(p => p.id === currentId);

  if (!plan) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        Please create or select a lesson plan to begin.
      </div>
    );
  }

  const { tableContent: planRows, id: planId } = plan;

  return (
    <div className="relative h-full w-full overflow-auto">
      {/* Subtle liquid glass background */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20" />
      <div className="pointer-events-none fixed -left-40 top-20 -z-10 h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl opacity-60 animate-[float_26s_ease-in-out_infinite] dark:bg-emerald-500/10" />
      <div className="pointer-events-none fixed right-[-10rem] bottom-[-8rem] -z-10 h-96 w-96 rounded-full bg-cyan-400/15 blur-[160px] opacity-40 animate-[float-delayed_32s_ease-in-out_infinite] dark:bg-cyan-500/10" />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-sm">
        {/* Header with subtle glass effect */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
          <input 
            type="text"
            value={plan.title}
            onChange={(e) => dispatch(updatePlan({ id: planId, title: e.target.value }))}
            placeholder="Untitled Lesson Plan"
            className="w-full text-2xl md:text-3xl font-bold bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <ExportControls />
        </div>

        {/* Main table with glass styling */}
        <div className="rounded-xl border border-slate-300/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] backdrop-blur-sm overflow-hidden">
          {planRows.map((row) => (
            <div key={row.id} className="group flex border-b border-slate-200/60 dark:border-slate-700/60 last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
              <PanelGroup 
                direction="horizontal"
                className="flex-1"
                onLayout={(layout: number[]) => dispatch(resizePlanRow({ planId, rowId: row.id, sizes: layout }))}
              >
                {row.cells.map((cell, cellIndex) => (
                  <React.Fragment key={cell.id}>
                    <Panel defaultSize={cell.size || (100 / row.cells.length)} minSize={10}>
                      <div className="relative h-full group/cell">
                        <InlineToolbarEditor
                          value={cell.content}
                          onChange={(newContent) => dispatch(updatePlanCell({ planId, rowId: row.id, cellId: cell.id, content: newContent }))}
                          placeholder={cell.placeholder}
                        />
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/cell:opacity-100 transition-opacity">
                          <button 
                            onClick={() => dispatch(splitPlanCell({ planId, rowId: row.id, cellId: cell.id }))}
                            className="p-1.5 rounded-lg bg-white/90 hover:bg-emerald-50 dark:bg-slate-700/90 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 shadow-sm backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 transition-all hover:scale-105" 
                            title="Split Cell">
                            <Split size={14} />
                          </button>
                          {row.cells.length > 1 && (
                            <button 
                              onClick={() => dispatch(mergePlanCell({ planId, rowId: row.id, cellId: cell.id }))}
                              className="p-1.5 rounded-lg bg-white/90 hover:bg-red-50 dark:bg-slate-700/90 dark:hover:bg-red-900/40 text-slate-600 hover:text-red-600 dark:text-slate-300 shadow-sm backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 transition-all hover:scale-105"
                              title="Remove Cell">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </Panel>
                    {cellIndex < row.cells.length - 1 && (
                      <PanelResizeHandle className="w-1 bg-slate-200/70 dark:bg-slate-600/70 hover:bg-emerald-400/60 dark:hover:bg-emerald-600/60 transition-colors" />
                    )}
                  </React.Fragment>
                ))}
              </PanelGroup>
              {!row.isHeader && (
                <button 
                  onClick={() => dispatch(removePlanRow({ planId, rowId: row.id }))}
                  className="w-8 flex items-center justify-center text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-all"
                  title="Remove Row">
                  <Trash2 size={16}/>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add row button with glass effect */}
        <div className="mt-3">
          <button 
            onClick={() => dispatch(addPlanRow({ planId }))} 
            className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300/70 dark:border-slate-600/70 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-emerald-50/50 dark:hover:bg-slate-700/40 hover:border-emerald-300/70 dark:hover:border-emerald-600/50 transition-all backdrop-blur-sm">
            <Plus size={16} /> Add Row
          </button>
        </div>
      </div>
    </div>
  );
}

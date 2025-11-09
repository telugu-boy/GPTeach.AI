// src/components/LessonPlanTemplate.tsx (Updated)

import React from 'react';
import { nanoid } from 'nanoid';
import { Plus, Trash2 } from 'lucide-react';
import InlineToolbarEditor from './InlineToolbarEditor';

// --- TYPES ---
type Cell = {
  id: string;
  content: string; // HTML content from the editor
  placeholder: string;
  colSpan?: number;
};

type Row = {
  id: string;
  cells: Cell[];
  isHeader?: boolean;
};

// --- INITIAL STATE FACTORY ---
const createInitialPlan = (): Row[] => [
  {
    id: nanoid(),
    cells: [
      { id: nanoid(), content: 'Date:', placeholder: 'Date', colSpan: 1 },
      { id: nanoid(), content: 'Grade/Class:', placeholder: 'Grade/Class', colSpan: 1 },
      { id: nanoid(), content: 'Name:', placeholder: 'Name', colSpan: 1 },
    ],
  },
  {
    id: nanoid(),
    cells: [
      { id: nanoid(), content: 'Course/level:', placeholder: 'Course/level', colSpan: 1 },
      { id: nanoid(), content: 'School:', placeholder: 'School', colSpan: 1 },
      { id: nanoid(), content: 'Lesson time:', placeholder: 'Lesson time', colSpan: 1 },
    ],
  },
  {
    id: nanoid(),
    cells: [
      { id: nanoid(), content: 'Prerequisites/Previous Knowledge:', placeholder: '', colSpan: 2 },
      { id: nanoid(), content: 'Location/facility:', placeholder: '', colSpan: 1 },
    ],
  },
  {
    id: nanoid(),
    cells: [
      { id: nanoid(), content: 'Outcome(s) (quoted from program of studies):', placeholder: '', colSpan: 2 },
      { id: nanoid(), content: 'Resources (e.g., materials for teacher and/or learner, technical requirements):', placeholder: '', colSpan: 1 },
    ],
  },
  {
    id: nanoid(),
    cells: [
      { id: nanoid(), content: 'Goal of this lesson/demo (what will students know, understand and be able to do after this lesson):', placeholder: '', colSpan: 2 },
      { id: nanoid(), content: 'Safety Considerations:', placeholder: '', colSpan: 1 },
    ],
  },
  {
    id: nanoid(),
    cells: [{ id: nanoid(), content: 'Essential question(s):', placeholder: '', colSpan: 3 }],
  },
  {
    id: nanoid(),
    cells: [{ id: nanoid(), content: 'Essential vocabulary:', placeholder: '', colSpan: 3 }],
  },
  {
    id: nanoid(),
    cells: [{ id: nanoid(), content: 'Cross-curricular connections (opportunities for synthesis and application) - choose specific outcomes.', placeholder: '', colSpan: 3 }],
  },
  {
    id: nanoid(),
    cells: [{ id: nanoid(), content: 'Differentiated instructions (i.e., select one student and select one group and provide detailed instructions):', placeholder: '', colSpan: 3 }],
  },
  {
    id: nanoid(),
    isHeader: true,
    cells: [
        { id: nanoid(), content: '<b>Time for activity (in minutes)</b>', placeholder: '', colSpan: 1 },
        { id: nanoid(), content: '<b>Description of activity, New learning</b>', placeholder: '', colSpan: 1 },
        { id: nanoid(), content: '<b>Check for understanding (formative, summative assessments)</b>', placeholder: '', colSpan: 1 },
    ]
  },
  {
    id: nanoid(),
    cells: [
        { id: nanoid(), content: '', placeholder: 'Anticipatory set/hook/introduction', colSpan: 1 },
        { id: nanoid(), content: '', placeholder: 'Body/activities/strategies (this section should be VERY detailed)', colSpan: 1 },
        { id: nanoid(), content: '', placeholder: 'Closing: 1. real world, community connections, 2. Student Feedback opportunities, 3. Looking ahead', colSpan: 1 },
    ]
  }
];


// --- MAIN COMPONENT ---
export default function LessonPlanTemplate() {
  const [planRows, setPlanRows] = React.useState<Row[]>(createInitialPlan());

  const updateCell = (rowId: string, cellId: string, newContent: string) => {
    setPlanRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === rowId) {
          return {
            ...row,
            cells: row.cells.map((cell) =>
              cell.id === cellId ? { ...cell, content: newContent } : cell
            ),
          };
        }
        return row;
      })
    );
  };

  const addRow = () => {
    const newRow: Row = {
        id: nanoid(),
        cells: [{ id: nanoid(), content: '', placeholder: 'New section', colSpan: 3 }]
    };
    setPlanRows([...planRows, newRow]);
  };
  
  const removeRow = (rowId: string) => {
      setPlanRows(planRows.filter(row => row.id !== rowId));
  }

  return (
    <div className="max-w-7xl mx-auto p-4 font-sans text-sm">
        <div className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800">
            {planRows.map((row) => (
                <div key={row.id} className="group flex border-b border-slate-300 dark:border-slate-700">
                    <div className="grid grid-cols-3 flex-1">
                        {row.cells.map((cell) => (
                            <div
                                key={cell.id}
                                className="border-r border-slate-300 dark:border-slate-700 last:border-r-0"
                                style={{ gridColumn: `span ${cell.colSpan || 1} / span ${cell.colSpan || 1}` }}
                            >
                                <InlineToolbarEditor
                                    value={cell.content}
                                    onChange={(newContent) => updateCell(row.id, cell.id, newContent)}
                                    placeholder={cell.placeholder}
                                />
                            </div>
                        ))}
                    </div>
                     {!row.isHeader && (
                        <button 
                            onClick={() => removeRow(row.id)} 
                            className="w-8 flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40 transition-opacity">
                            <Trash2 size={16}/>
                        </button>
                     )}
                </div>
            ))}
        </div>
        <div className="mt-2">
            <button 
                onClick={addRow} 
                className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                <Plus size={16} /> Add Section
            </button>
        </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Palette, X } from 'lucide-react';
import { addClass, updateClass } from '../features/classes/classesSlice';
import type { Class } from '../lib/types';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  classItem?: Class | null;
}

const PASTEL_COLORS = [
  '#fca5a5', '#fdba74', '#fcd34d', '#86efac', '#7dd3fc', '#a5b4fc', '#d8b4fe'
];

export default function CreateClassModal({ isOpen, onClose, onSuccess, classItem }: CreateClassModalProps) {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [semester, setSemester] = useState('');
  const [section, setSection] = useState('');
  const [subject, setSubject] = useState('');
  const [color, setColor] = useState(PASTEL_COLORS[3]);

  const isEditMode = Boolean(classItem);

  useEffect(() => {
    if (isOpen && classItem) {
      setName(classItem.name);
      setGrade(classItem.grade || '');
      setSemester(classItem.semester || '');
      setSection(classItem.section || '');
      setSubject(classItem.subject || '');
      setColor(classItem.color);
    }
  }, [isOpen, classItem]);

  const handleResetAndClose = () => {
    setName('');
    setGrade('');
    setSemester('');
    setSection('');
    setSubject('');
    setColor(PASTEL_COLORS[3]);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const classData = { name, grade, semester, section, subject, color };

    if (isEditMode && classItem) {
      dispatch(updateClass({ id: classItem.id, ...classData }));
    } else {
      dispatch(addClass(classData));
    }

    if (onSuccess) {
      onSuccess();
    }
    handleResetAndClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold">{isEditMode ? 'Edit Class' : 'Create Class'}</h2>
          <button onClick={handleResetAndClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="className" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Classroom Name (required)
              </label>
              <input
                id="className"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="gradeLevel" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Grade Level
                </label>
                <input
                  id="gradeLevel"
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="e.g., Grade 9, 11/12"
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Mathematics, ELA"
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="section" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Section / Block
                    </label>
                    <input
                    id="section"
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="e.g., Section 2, Block A"
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <div>
                    <label htmlFor="semester" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Semester
                    </label>
                    <input
                    id="semester"
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="e.g., Fall 2025"
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Theme Color
              </label>
              <div className="flex items-center flex-wrap gap-3">
                {PASTEL_COLORS.map((themeColor) => (
                  <button
                    key={themeColor}
                    type="button"
                    onClick={() => setColor(themeColor)}
                    className="w-8 h-8 rounded-full transition-transform duration-150 ease-in-out hover:scale-110"
                    style={{ backgroundColor: themeColor }}
                    aria-label={`Set color to ${themeColor}`}
                  >
                    {color === themeColor && (
                      <div className="w-full h-full rounded-full ring-2 ring-offset-2 ring-emerald-500 dark:ring-offset-slate-800" />
                    )}
                  </button>
                ))}
                <label className="w-8 h-8 rounded-full cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 relative">
                  <Palette size={16} />
                  <input
                    type="color"
                    value={color}
                    onInput={(e) => setColor(e.currentTarget.value)}
                    className="absolute w-full h-full opacity-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-lg">
            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:bg-emerald-300"
              disabled={!name.trim()}
            >
              {isEditMode ? 'Save Changes' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
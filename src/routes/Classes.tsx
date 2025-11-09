import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../app/store';
import { addClass } from '../features/classes/classesSlice';
import { Link, useNavigate } from 'react-router-dom';
import { Folder, MoreVertical, TrendingUp } from 'lucide-react';
import type { Class } from '../lib/types';

// Empty state component when no classes are present
const NoClasses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCreateClass = () => {
    // In a real app, this would open a form/modal.
    // For this demo, we'll add a sample class.
    dispatch(addClass({ name: 'Sample Class', section: 'Section 1' }));
  };
  
  const handleCreatePlan = () => {
    // Navigate to the builder page
    navigate('/builder');
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="max-w-md">
        <img src="https://www.gstatic.com/classroom/empty_states_home.svg" alt="No classes" className="mx-auto h-48 w-48" />
        <h2 className="mt-6 text-xl font-medium text-slate-700 dark:text-slate-300">You don't have any classes yet</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
            Create a class to start organizing your lesson plans.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={handleCreateClass}
            className="px-5 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
          >
            Create Class
          </button>
          <button
            onClick={handleCreatePlan}
            className="px-5 py-2 rounded-md text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-emerald-600"
          >
            Create Lesson Plan
          </button>
        </div>
      </div>
    </div>
  );
};

// Card component to display a single class
const ClassCard = ({ classItem }: { classItem: Class }) => {
  return (
    <div className="flex flex-col rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <div className="relative p-4 h-28 text-white" style={{ 
          backgroundColor: '#0d806a',
          backgroundImage: `url(https://gstatic.com/classroom/themes/Honors.jpg)`,
          backgroundSize: 'cover',
        }}>
        <Link to={`/class/${classItem.id}`} className="relative z-10">
          <h3 className="text-xl font-medium hover:underline">{classItem.name}</h3>
        </Link>
        {classItem.section && <p className="text-sm relative z-10">{classItem.section}</p>}
      </div>
      <div className="flex-grow min-h-[100px]">
        {/* Future content like upcoming assignments can go here */}
      </div>
      <div className="flex items-center justify-end p-2 border-t border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
          <button aria-label="Open gradebook" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><TrendingUp size={20} /></button>
          <button aria-label="Open folder" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><Folder size={20} /></button>
          <button aria-label="More options" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><MoreVertical size={20} /></button>
      </div>
    </div>
  );
};

export default function Classes() {
  const { items: classes } = useSelector((state: RootState) => state.classes);

  if (classes.length === 0) {
    return <NoClasses />;
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {classes.map((classItem) => (
          <ClassCard key={classItem.id} classItem={classItem} />
        ))}
      </div>
    </div>
  );
}
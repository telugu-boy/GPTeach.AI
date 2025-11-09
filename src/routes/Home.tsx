import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addClass } from '../features/classes/classesSlice';

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCreateClass = () => {
    // For demo, add a sample class and navigate to the classes page
    dispatch(addClass({ name: 'Sample Class', section: 'Section 1' }));
    navigate('/classes');
  };

  return (
    <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center pb-28"> {/* Increased padding-bottom to shift content up more */}
            <img 
                src="https://www.svgheart.com/wp-content/uploads/2023/01/graduation-cap_709-430-min.png" 
                alt="Graduation Cap" 
                className="mx-auto h-24 w-auto mb-8" // Increased margin-bottom
            />
            <h1 className="text-5xl font-bold text-slate-800 dark:text-slate-100">Welcome to Lesson Planner</h1> {/* Increased text size */}
            <p className="mt-6 text-xl text-slate-600 dark:text-slate-400"> {/* Increased text size and margin-top */}
                Organize your teaching materials, create lesson plans, and manage your classes seamlessly.
            </p>
            <div className="mt-10 flex justify-center gap-4"> {/* Increased margin-top */}
                <button
                    onClick={handleCreateClass}
                    className="px-7 py-3.5 rounded-xl bg-emerald-500 text-white font-semibold text-xl hover:bg-emerald-600 transition-colors" // Increased text size
                >
                    Create a Class
                </button>
                <button
                    onClick={() => navigate('/classes')}
                    className="px-7 py-3.5 rounded-xl bg-slate-200 text-slate-800 font-semibold text-xl hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors" // Increased text size
                >
                    View My Classes
                </button>
            </div>
        </div>
    </div>
  );
}
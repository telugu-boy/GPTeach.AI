import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateClassModal from '../components/CreateClassModal';

export default function Home() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreationSuccess = () => {
    setIsModalOpen(false); // Close the modal
    navigate('/classes');   // Navigate to the classes page
  };

  return (
    <>
      <div className="p-6 h-full flex items-center justify-center">
          <div className="text-center pb-28">
              <img 
                  src="https://www.svgheart.com/wp-content/uploads/2023/01/graduation-cap_709-430-min.png" 
                  alt="Graduation Cap" 
                  className="mx-auto h-24 w-auto mb-8"
              />
              <h1 className="text-5xl font-bold text-slate-800 dark:text-slate-100">Welcome to Lesson Planner</h1>
              <p className="mt-6 text-xl text-slate-600 dark:text-slate-400">
                  Organize your teaching materials, create lesson plans, and manage your classes seamlessly.
              </p>
              <div className="mt-10 flex justify-center gap-4">
                  <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-7 py-3.5 rounded-xl bg-emerald-500 text-white font-semibold text-xl hover:bg-emerald-600 transition-colors"
                  >
                      Create a Class
                  </button>
                  <button
                      onClick={() => navigate('/classes')}
                      className="px-7 py-3.5 rounded-xl bg-slate-200 text-slate-800 font-semibold text-xl hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                      View My Classes
                  </button>
              </div>
          </div>
      </div>
      <CreateClassModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleCreationSuccess}
      />
    </>
  );
}
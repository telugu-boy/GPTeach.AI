import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../app/store';
import { Link, useNavigate } from 'react-router-dom';
import { Folder, MoreVertical, TrendingUp, Plus } from 'lucide-react';
import type { Class } from '../lib/types';
import CreateClassModal from '../components/CreateClassModal';
import { archiveClass } from '../features/classes/classesSlice';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const NoClasses = ({ onCreateClick }: { onCreateClick: () => void }) => {
  const navigate = useNavigate();
  
  const handleCreatePlan = () => {
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
            onClick={onCreateClick}
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

const ClassCard = ({ classItem, onEdit, onArchive }: { classItem: Class; onEdit: () => void; onArchive: () => void; }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const details = [
    classItem.grade,
    classItem.subject,
    classItem.semester,
  ].filter(Boolean).join(' · ');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
      <div className="relative p-4 h-28 text-white rounded-t-lg" style={{ backgroundColor: classItem.color }}>
        <Link to={`/class/${classItem.id}`} className="relative z-10">
          <h3 className="text-xl font-medium hover:underline">{classItem.name}</h3>
        </Link>
        {classItem.section && <p className="text-sm relative z-10">{classItem.section}</p>}
      </div>
      <div className="flex-grow min-h-[100px] p-4 text-sm text-slate-500 dark:text-slate-400">
        {details || <span className="italic">No details provided.</span>}
      </div>
      <div className="flex items-center justify-end p-2 border-t border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
          <button aria-label="Open gradebook" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><TrendingUp size={20} /></button>
          <button aria-label="Open folder" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><Folder size={20} /></button>
          <div className="relative" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(prev => !prev)} aria-label="More options" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <MoreVertical size={20} />
            </button>
            {isMenuOpen && (
                <div className="absolute right-0 bottom-full mb-1 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-20">
                    <ul className="py-1">
                        <li>
                            <button
                                onClick={() => { onEdit(); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                Edit
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => { onArchive(); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                            >
                                Archive
                            </button>
                        </li>
                    </ul>
                </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default function Classes() {
  const dispatch = useDispatch();
  const { items: all_classes } = useSelector((state: RootState) => state.classes);
  const classes = all_classes.filter(c => !c.archived);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [classToArchive, setClassToArchive] = useState<Class | null>(null);

  const handleOpenCreateModal = () => {
    setEditingClass(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (classItem: Class) => {
    setEditingClass(classItem);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClass(null);
  };

  const handleArchiveRequest = (classItem: Class) => {
    setClassToArchive(classItem);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmArchive = () => {
    if (classToArchive) {
      dispatch(archiveClass(classToArchive.id));
    }
    setIsConfirmModalOpen(false);
    setClassToArchive(null);
  };

  if (classes.length === 0 && all_classes.length === 0) {
    return (
      <>
        <NoClasses onCreateClick={handleOpenCreateModal} />
        <CreateClassModal isOpen={isModalOpen} onClose={handleCloseModal} />
      </>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Classes</h1>
            <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
            >
                <Plus size={16} /> Create Class
            </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {classes.map((classItem) => (
            <ClassCard 
              key={classItem.id} 
              classItem={classItem} 
              onEdit={() => handleOpenEditModal(classItem)} 
              onArchive={() => handleArchiveRequest(classItem)}
            />
          ))}
        </div>
         {classes.length === 0 && all_classes.length > 0 && (
          <div className="text-center col-span-full py-12">
            <p className="text-slate-500">You have no active classes. Check the "Archived Classes" tab.</p>
          </div>
        )}
      </div>
      <CreateClassModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        classItem={editingClass}
      />
      <ConfirmDeleteModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmArchive}
        itemName={classToArchive?.name}
        actionType="archive"
      />
    </>
  );
}
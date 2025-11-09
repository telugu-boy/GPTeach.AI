import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../app/store';
import { ArchiveRestore, Trash2, MoreVertical } from 'lucide-react';
import type { Class } from '../lib/types';
import { unarchiveClass, deleteClass } from '../features/classes/classesSlice';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

// Card for archived classes
const ArchivedClassCard = ({ classItem, onUnarchive, onDelete }: { classItem: Class; onUnarchive: () => void; onDelete: () => void; }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    <div className="flex flex-col rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm opacity-70 hover:opacity-100 transition-opacity">
      <div className="relative p-4 h-28 text-white rounded-t-lg" style={{ backgroundColor: classItem.color }}>
          <h3 className="text-xl font-medium">{classItem.name}</h3>
        {classItem.section && <p className="text-sm">{classItem.section}</p>}
      </div>
      <div className="flex-grow p-4">
        {/* Can add more details here if needed */}
      </div>
      <div className="flex items-center justify-end p-2 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onUnarchive} aria-label="Unarchive class" className="flex items-center gap-2 p-2 rounded-md text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              <ArchiveRestore size={18} /> Unarchive
          </button>
          <div className="relative" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(prev => !prev)} aria-label="More options" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <MoreVertical size={20} />
            </button>
            {isMenuOpen && (
                <div className="absolute right-0 bottom-full mb-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-20">
                    <ul className="py-1">
                        <li>
                            <button
                                onClick={() => { onDelete(); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                            >
                                <Trash2 size={16} /> Delete Permanently
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

export default function ArchivedClasses() {
  const dispatch = useDispatch();
  const { items: all_classes } = useSelector((state: RootState) => state.classes);
  const archivedClasses = all_classes.filter(c => c.archived);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  const handleDeleteRequest = (classItem: Class) => {
    setClassToDelete(classItem);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (classToDelete) {
      dispatch(deleteClass(classToDelete.id));
    }
    setIsDeleteModalOpen(false);
    setClassToDelete(null);
  };

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Archived Classes</h1>
        </div>
        {archivedClasses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">You don't have any archived classes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {archivedClasses.map((classItem) => (
              <ArchivedClassCard 
                key={classItem.id} 
                classItem={classItem} 
                onUnarchive={() => dispatch(unarchiveClass(classItem.id))}
                onDelete={() => handleDeleteRequest(classItem)}
              />
            ))}
          </div>
        )}
      </div>
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={classToDelete?.name}
        actionType="delete"
      />
    </>
  );
}
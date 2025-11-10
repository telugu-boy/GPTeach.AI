import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { RootState, AppDispatch } from '../app/store';
import { createPlan, setCurrentPlan, importUploadedPlan, duplicatePlan, pasteCopiedPlan, updatePlan, softDeletePlan, movePlan } from '../features/plans/plansSlice';
import { updateClass } from '../features/classes/classesSlice';
import { duplicateFolder, updateFolder, moveFolder, pasteCopiedFolder, softDeleteFolder } from '../features/folders/foldersSlice';
import { copyItem, clearClipboard } from '../features/clipboard/clipboardSlice';
import { Plus, Upload, MoreVertical, Search, FileText, Folder as FolderIcon, Copy, Trash2, Move, CopyPlus, Edit, ClipboardPaste, ArrowRight, Calendar } from 'lucide-react';
import type { Plan, Folder } from '../lib/types';
import { cn } from '../lib/utils';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import MoveItemModal from '../components/MoveItemModal';
import CreateFolderModal from '../components/CreateFolderModal';
import CreatePlanModal, { type CreatePlanData } from '../components/CreatePlanModal';
import AddToCalendarModal from '../components/AddToCalendarModal'; // <-- ADD THIS IMPORT
import { DndContext, PointerSensor, useSensor, useSensors, useDraggable, useDroppable } from '@dnd-kit/core';

const ItemMenu = ({ item, type, onOpenMove, onConfirmDelete, onEdit, onOpenCalendar }: { item: Plan | Folder, type: 'plan' | 'folder', onOpenMove: () => void, onConfirmDelete: () => void, onEdit: () => void, onOpenCalendar?: () => void }) => {
    const dispatch = useDispatch();
    const menuRef = useRef<HTMLDivElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCopy = () => {
        dispatch(copyItem({ itemId: item.id, itemType: type }));
        setIsMenuOpen(false);
    };

    const handleDuplicate = () => {
        if (type === 'plan') dispatch(duplicatePlan({ planId: item.id }));
        else dispatch(duplicateFolder({ folderId: item.id }));
        setIsMenuOpen(false);
    }
    
    const handleEdit = () => {
        onEdit();
        setIsMenuOpen(false);
    }
    
    const handleCalendar = () => {
        if (onOpenCalendar) onOpenCalendar();
        setIsMenuOpen(false);
    }

    return (
        <div className="relative" ref={menuRef} onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsMenuOpen(p => !p)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
                <MoreVertical size={20} />
            </button>
            {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-20">
                    <ul className="py-1 text-sm text-slate-700 dark:text-slate-300">
                        <li><button onClick={handleEdit} className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"><Edit size={16}/> Edit</button></li>
                        {type === 'plan' && onOpenCalendar && (
                            <li><button onClick={handleCalendar} className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"><Calendar size={16}/> Add to Calendar</button></li>
                        )}
                        <li><button onClick={handleCopy} className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"><Copy size={16}/> Copy</button></li>
                        <li><button onClick={onOpenMove} className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"><Move size={16}/> Move</button></li>
                        <li><button onClick={handleDuplicate} className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"><CopyPlus size={16}/> Duplicate</button></li>
                        <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
                        <li><button onClick={onConfirmDelete} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"><Trash2 size={16}/> Delete</button></li>
                    </ul>
                </div>
            )}
        </div>
    );
}

const LessonPlanCard = ({ plan, onOpenMove, onConfirmDelete, onOpenCalendar }: { plan: Plan; onOpenMove: (plan: Plan) => void; onConfirmDelete: (plan: Plan) => void; onOpenCalendar: (plan: Plan) => void; }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(plan.title);

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: plan.id, data: { type: 'plan' } });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    };
    
    const handleSave = () => {
        if (title.trim() && title !== plan.title) {
            dispatch(updatePlan({ id: plan.id, title: title.trim() }));
        }
        setIsEditing(false);
    }

    const handleOpenPlan = () => {
        dispatch(setCurrentPlan(plan.id));
        navigate('/planner');
    }
    
    const fileType = plan.uploadedFile 
        ? (plan.uploadedFile.name.split('.').pop()?.toUpperCase() || 'File') 
        : 'Lesson Plan';

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className={cn("rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm flex flex-col group transition-shadow hover:shadow-md cursor-grab", isDragging && "opacity-50 z-30")}
            onDoubleClick={handleOpenPlan}
        >
            <div className="p-4 flex-grow flex items-start gap-3" {...attributes} {...listeners}>
                <FileText size={32} className="text-emerald-500 flex-shrink-0 mt-1" />
                <div className="flex-grow">
                    {isEditing ? (
                        <input value={title} onChange={e => setTitle(e.target.value)} onBlur={handleSave} onKeyDown={e => e.key === 'Enter' && handleSave()} autoFocus onClick={e => e.stopPropagation()} className="w-full bg-transparent border-b-2 focus:outline-none cursor-text" />
                    ) : (
                        <h3 onDoubleClick={e => {e.stopPropagation(); e.preventDefault(); setIsEditing(true)}} className="font-semibold text-lg hover:underline">{plan.title}</h3>
                    )}
                    <p className="text-sm text-slate-500">{fileType}</p>
                    <p className="text-sm text-slate-500">Updated: {new Date(plan.updatedAt).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="border-t p-2 flex justify-between items-center">
                 <button onClick={handleOpenPlan} className="flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-50 dark:hover:bg-emerald-900/60 ml-1">
                    Open File <ArrowRight size={14}/>
                </button>
                <div onClick={e => e.stopPropagation()}>
                    <ItemMenu item={plan} type="plan" onOpenMove={() => onOpenMove(plan)} onConfirmDelete={() => onConfirmDelete(plan)} onEdit={() => setIsEditing(true)} onOpenCalendar={() => onOpenCalendar(plan)} />
                </div>
            </div>
        </div>
    );
};

const FolderCard = ({ folder, onOpenMove, onConfirmDelete, onEdit }: { folder: Folder, onOpenMove: (folder: Folder) => void, onConfirmDelete: (folder: Folder) => void, onEdit: (folder: Folder) => void }) => {
    const navigate = useNavigate();
    const { attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging } = useDraggable({ id: folder.id, data: { type: 'folder' } });
    const { isOver, setNodeRef: setDroppableRef } = useDroppable({ id: folder.id, data: { type: 'folder' } });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    };

    const setNodeRef = (node: HTMLElement | null) => {
        setDraggableRef(node);
        setDroppableRef(node);
    };

    const handleOpenFolder = () => navigate(`/class/${folder.classId}/folder/${folder.id}`);

    return (
        <div 
            ref={setNodeRef} 
            style={style}
            onDoubleClick={handleOpenFolder}
            className={cn(
                "rounded-lg border bg-white dark:bg-slate-900 shadow-sm flex flex-col group transition-all hover:shadow-md cursor-grab",
                isDragging && "opacity-50 z-30",
                isOver ? "ring-2 ring-emerald-500 ring-offset-2" : "border-slate-200 dark:border-slate-700"
            )}
        >
            <div className="flex-grow" {...attributes} {...listeners}>
                <div className="p-4 h-24 text-white rounded-t-lg flex items-start gap-3" style={{ backgroundColor: folder.color }}>
                     <FolderIcon size={32} className="flex-shrink-0 mt-1" />
                    <div className="flex-grow">
                        <h3 className="font-semibold text-lg hover:underline">{folder.name}</h3>
                    </div>
                </div>
                <div className="min-h-[60px] p-4">
                    <p className="text-sm text-slate-500">Folder</p>
                </div>
            </div>
            <div className="border-t p-2 flex justify-between items-center" onClick={(e) => e.stopPropagation()}>
                <button onClick={handleOpenFolder} className="flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-50 dark:hover:bg-emerald-900/60 ml-1">
                    Open Folder <ArrowRight size={14}/>
                </button>
                <ItemMenu item={folder} type="folder" onOpenMove={() => onOpenMove(folder)} onConfirmDelete={() => onConfirmDelete(folder)} onEdit={() => onEdit(folder)} />
            </div>
        </div>
    );
};


const ClassDashboard = () => {
  const { classId, folderId = null } = useParams<{ classId: string; folderId?: string }>();
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { items: allPlans } = useSelector((state: RootState) => state.plans);
  const { items: allClasses } = useSelector((state: RootState) => state.classes);
  const { items: allFolders } = useSelector((state: RootState) => state.folders);
  const { itemId: copiedItemId, itemType: copiedItemType } = useSelector((state: RootState) => state.clipboard);

  const classItem = allClasses.find(c => c.id === classId);
  const currentFolder = allFolders.find(f => f.id === folderId);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'date' | 'name'>('date');
  const [itemToModify, setItemToModify] = useState<Plan | Folder | null>(null);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null);
  const [isCreatePlanModalOpen, setIsCreatePlanModalOpen] = useState(false);
  const [isEditingClassName, setIsEditingClassName] = useState(false);
  const [className, setClassName] = useState(classItem?.name || '');
  const [isFileDraggingOver, setIsFileDraggingOver] = useState(false);

  // --- NEW STATE FOR CALENDAR MODAL --- //
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [planToAddToCalendar, setPlanToAddToCalendar] = useState<Plan | null>(null);

  const handleOpenCalendarModal = (plan: Plan) => {
    setPlanToAddToCalendar(plan);
    setIsCalendarModalOpen(true);
  };


  useEffect(() => {
    if (classItem) {
        setClassName(classItem.name);
    }
  }, [classItem]);

  const items = useMemo(() => {
    const plansInFolder = allPlans.filter(p => p.classId === classId && p.folderId === folderId && !p.deletedAt);
    const foldersInFolder = allFolders.filter(f => f.classId === classId && f.parentId === folderId && !f.deletedAt);
    
    const combined = [
        ...foldersInFolder.map(f => ({...f, type: 'folder' as const})),
        ...plansInFolder.map(p => ({...p, type: 'plan' as const}))
    ];

    const filtered = combined.filter(item => (item.name || item.title).toLowerCase().includes(searchTerm.toLowerCase()));

    return filtered.sort((a, b) => {
      if (sortOrder === 'name') {
        return (a.name || a.title).localeCompare(b.name || b.title);
      }
      const dateA = new Date(a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [allPlans, allFolders, classId, folderId, searchTerm, sortOrder]);

  const handleCreatePlan = () => setIsCreatePlanModalOpen(true);
  const handleConfirmCreatePlan = (data: CreatePlanData, andOpen: boolean) => {
    if (classId) {
        dispatch(createPlan({ ...data, classId, folderId }));
        setIsCreatePlanModalOpen(false);
        if (andOpen) {
            navigate('/planner');
        }
    }
  };

  const handleCreateFolder = () => {
      setFolderToEdit(null);
      setIsFolderModalOpen(true);
  };
  
  const handleOpenEditFolder = (folder: Folder) => {
      setFolderToEdit(folder);
      setIsFolderModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && classId) {
      dispatch(importUploadedPlan({ classId, folderId, file: { name: file.name, type: file.type } }));
    }
    if(fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const handleOpenMoveModal = (item: Plan | Folder) => {
    setItemToModify(item);
    setIsMoveModalOpen(true);
  };
  
  const handleConfirmMove = (moveDetails: { targetClassId: string; targetFolderId: string | null }) => {
    if (!itemToModify) return;
    const { targetClassId, targetFolderId } = moveDetails;

    if ('folderId' in itemToModify) { // It's a Plan
        dispatch(movePlan({ planId: itemToModify.id, targetClassId, targetFolderId }));
    } else { // It's a Folder
        dispatch(moveFolder({ folderId: itemToModify.id, targetClassId, targetParentId: targetFolderId }));
    }
    setIsMoveModalOpen(false);
    setItemToModify(null);
  };

  const handleOpenDeleteModal = (item: Plan | Folder) => {
    setItemToModify(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToModify) return;

    if ('folderId' in itemToModify) { // It's a plan
        dispatch(softDeletePlan(itemToModify.id));
    } else { // It's a folder
        dispatch(softDeleteFolder(itemToModify.id));
    }
    setIsDeleteModalOpen(false);
    setItemToModify(null);
  };
  
  const handlePaste = () => {
      if(copiedItemId && copiedItemType && classId) {
          if(copiedItemType === 'plan') {
              dispatch(pasteCopiedPlan({ sourcePlanId: copiedItemId, targetClassId: classId, targetFolderId: folderId }));
          } else {
              dispatch(pasteCopiedFolder({ sourceFolderId: copiedItemId, targetClassId: classId, targetParentId: folderId }));
          }
          dispatch(clearClipboard());
      }
  };

  const handleSaveClassName = () => {
      if (classItem && className.trim() && className !== classItem.name) {
          dispatch(updateClass({ id: classItem.id, name: className.trim() }));
      }
      setIsEditingClassName(false);
  }
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: any) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      
      const activeItem = items.find(i => i.id === active.id);
      if (!activeItem) return;

      const targetFolderId = over.id === 'root-droppable' ? folderId : (over.data.current?.type === 'folder' ? over.id : folderId);
      
      if(activeItem.type === 'plan') {
          dispatch(movePlan({ planId: active.id, targetClassId: classId!, targetFolderId: targetFolderId }));
      } else if (activeItem.type === 'folder') {
          if (active.id !== targetFolderId) {
              dispatch(moveFolder({ folderId: active.id, targetClassId: classId!, targetParentId: targetFolderId }));
          }
      }
  };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.types.includes('Files')) {
            setIsFileDraggingOver(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFileDraggingOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFileDraggingOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && classId) {
            const file = e.dataTransfer.files[0];
            dispatch(importUploadedPlan({ classId, folderId, file: { name: file.name, type: file.type } }));
            e.dataTransfer.clearData();
        }
    };

  const { setNodeRef: setRootDroppableRef, isOver: isOverRoot } = useDroppable({ id: 'root-droppable' });

  const Breadcrumbs = () => (
    <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-4">
      <Link to="/classes" className="hover:underline">My Classes</Link>
      {classItem && <><span className="mx-2">/</span><Link to={`/class/${classId}`} className="hover:underline">{classItem.name}</Link></>}
      {currentFolder && <><span className="mx-2">/</span><span>{currentFolder.name}</span></>}
    </nav>
  );

  if (!classItem) return <div className="p-8 text-center text-slate-500">Loading or class not found...</div>;

  return (
    <div 
        className="relative h-full"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
    >
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="p-6">
          <Breadcrumbs />
          <div className="flex justify-between items-center mb-6">
              {isEditingClassName && !currentFolder ? (
                  <input
                      value={className}
                      onChange={e => setClassName(e.target.value)}
                      onBlur={handleSaveClassName}
                      onKeyDown={e => e.key === 'Enter' && handleSaveClassName()}
                      className="text-3xl font-bold bg-transparent border-b-2 focus:outline-none"
                      autoFocus
                  />
              ) : (
                  <h1 onDoubleClick={() => !currentFolder && setIsEditingClassName(true)} className="text-3xl font-bold cursor-pointer">{currentFolder?.name || classItem.name}</h1>
              )}
              <div className="flex items-center gap-2">
                  {copiedItemId && <button onClick={handlePaste} className="flex items-center gap-2 px-4 py-2 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"><ClipboardPaste size={16}/> Paste</button>}
                  <button onClick={handleCreateFolder} className="flex items-center gap-2 px-4 py-2 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"><FolderIcon size={16}/> New Folder</button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"><Upload size={16}/> Upload</button>
                  <button onClick={handleCreatePlan} className="flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"><Plus size={16} /> New Plan</button>
              </div>
          </div>
          
          <div className="mb-6 flex items-center gap-4">
              <div className="relative flex-grow">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search plans and folders..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-300 dark:border-slate-600"/>
              </div>
              <select value={sortOrder} onChange={e => setSortOrder(e.target.value as 'date' | 'name')} className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
              </select>
          </div>

          <div 
              ref={setRootDroppableRef} 
              className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[200px] rounded-lg p-2 transition-colors", isOverRoot && "bg-emerald-50 dark:bg-emerald-900/20")}
          >
            {items.map((item) => (
              item.type === 'folder' 
              ? <FolderCard 
                  key={item.id} 
                  folder={item} 
                  onOpenMove={() => handleOpenMoveModal(item)} 
                  onConfirmDelete={() => handleOpenDeleteModal(item)}
                  onEdit={handleOpenEditFolder}
                  />
              : <LessonPlanCard 
                  key={item.id} 
                  plan={item} 
                  onOpenMove={() => handleOpenMoveModal(item)} 
                  onConfirmDelete={() => handleOpenDeleteModal(item)}
                  onOpenCalendar={handleOpenCalendarModal}
                />
            ))}
          </div>
          {items.length === 0 && (
              <div className="text-center col-span-full py-12 text-slate-500">
                  <p>This folder is empty.</p>
              </div>
          )}
        </div>
      </DndContext>
      {isFileDraggingOver && (
          <div className="absolute inset-4 bg-emerald-500/20 border-4 border-dashed border-emerald-600 rounded-lg flex items-center justify-center z-40 pointer-events-none">
              <div className="text-center text-emerald-800 font-semibold text-xl">
                  <Upload size={48} className="mx-auto mb-4" />
                  Drop file to upload
              </div>
          </div>
      )}
      <MoveItemModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        onMove={handleConfirmMove}
        item={itemToModify}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToModify ? ('title' in itemToModify ? itemToModify.title : itemToModify.name) : ''}
        actionType="delete"
      />
      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        classId={classId || ''}
        parentId={folderId}
        folderItem={folderToEdit}
      />
      <CreatePlanModal
        isOpen={isCreatePlanModalOpen}
        onClose={() => setIsCreatePlanModalOpen(false)}
        onCreate={handleConfirmCreatePlan}
      />
      <AddToCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        plan={planToAddToCalendar}
      />
    </div>
  );
};

export default ClassDashboard;
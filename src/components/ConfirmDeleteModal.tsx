import React from 'react';
import { X, Archive, AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string | null;
  actionType?: 'archive' | 'delete';
}

export default function ConfirmDeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemName, 
  actionType = 'archive'
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  const isArchive = actionType === 'archive';
  const title = isArchive ? 'Archive Class' : 'Delete Class Permanently';
  const bodyText = isArchive 
    ? `Are you sure you want to archive the class "${itemName || 'this item'}"? You can find it later in the archived classes tab.`
    : `Are you sure you want to permanently delete the class "${itemName || 'this item'}"? This action cannot be undone.`;
  const confirmText = isArchive ? 'Archive' : 'Delete';
  const Icon = isArchive ? Archive : AlertTriangle;
  const iconBgColor = isArchive ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-red-100 dark:bg-red-900/30';
  const iconColor = isArchive ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';
  const confirmBtnColor = isArchive ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm m-4">
        <div className="p-6 text-center">
          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${iconBgColor}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} aria-hidden="true" />
          </div>
          <h3 className="mt-5 text-lg font-medium text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <div className="mt-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {bodyText}
            </p>
          </div>
        </div>
        <div className="flex justify-end p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 mr-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md text-white text-sm font-medium ${confirmBtnColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
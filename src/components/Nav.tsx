// src/components/Nav.tsx (Updated)

import { Link, NavLink } from 'react-router-dom';
import { Home, ClipboardEdit, LayoutTemplate, ListChecks, Library, FileText, Settings, BookOpen } from 'lucide-react';

export default function Nav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ' +
    (isActive
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-50'
      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300');

  return (
    <aside className="w-64 flex-shrink-0 h-screen flex flex-col bg-white dark:bg-slate-950/80 border-r border-slate-200 dark:border-slate-800">
      <div className="p-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100 mb-8">
          <span className="p-2 rounded-lg bg-emerald-500 text-white">
            <BookOpen size={20} />
          </span>
          <span>Lesson Planner</span>
        </Link>
        
        <nav className="flex flex-col gap-2">
          <NavLink to="/" className={linkClass} end>
            <Home size={18} />
            <span>Home</span>
          </NavLink>
          
          <NavLink to="/drafts" className={linkClass}>
            <FileText size={18} />
            <span>Drafts</span>
          </NavLink>
          
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Teaching Tools</h3>

            <div className="flex flex-col gap-2">
              <NavLink to="/planner" className={linkClass}>
                <ClipboardEdit size={18} />
                <span>AI Planner</span>
              </NavLink>
              <NavLink to="/templates" className={linkClass}>
                <LayoutTemplate size={18} />
                <span>Templates</span>
              </NavLink>
              <NavLink to="/outcomes" className={linkClass}>
                <ListChecks size={18} />
                <span>Outcomes</span>
              </NavLink>
              <NavLink to="/library" className={linkClass}>
                <Library size={18} />
                <span>Materials</span>
              </NavLink>
            </div>
          </div>
        </nav>
      </div>

      <div className="mt-auto p-4">
        <NavLink to="/settings" className={linkClass}>
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
import { Link, NavLink } from 'react-router-dom';
import { Home, FileText, ClipboardEdit, LayoutTemplate, ListChecks, Library, Settings, BookCopy, ChevronLeft } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Nav({ isCollapsed, onToggle }: { isCollapsed: boolean, onToggle: () => void }) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-4 py-2 rounded-lg text-base font-medium transition-colors',
      isCollapsed ? 'px-[1.375rem]' : 'px-4', // Uses padding to center icon when collapsed
      isActive
        ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-50'
        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
    );

  // This class smoothly animates the text width and opacity
  const textClass = cn(
    'whitespace-nowrap overflow-hidden transition-all duration-200 ease-in-out',
    isCollapsed ? 'max-w-0 opacity-0' : 'max-w-full opacity-100'
  );

  return (
    <aside className={cn(
      'relative flex-shrink-0 h-screen flex flex-col bg-white dark:bg-slate-950/80 border-r border-slate-200 dark:border-slate-800 py-4 transition-all duration-300 ease-in-out',
      isCollapsed ? 'w-20' : 'w-64'
    )}>
      {/* Collapse Toggle Button */}
      <button 
        onClick={onToggle}
        className="absolute -right-3 top-8 z-10 p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
      >
        <ChevronLeft size={16} className={cn('transition-transform', isCollapsed && 'rotate-180')} />
      </button>

      {/* Header */}
      <div className={cn("mb-8", isCollapsed ? 'px-0 text-center' : 'px-4')}>
        <Link to="/" className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
          <span className={cn("inline-block h-8 w-8 rounded-lg bg-emerald-500 flex-shrink-0", isCollapsed && 'mx-auto')}></span>
          <span className={cn(textClass, "text-xl")}>Lesson Planner</span>
        </Link>
      </div>
      
      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col gap-2 px-2">
        <NavLink to="/" className={linkClass} end>
          <Home size={20} className="flex-shrink-0" />
          <span className={textClass}>Home</span>
        </NavLink>
        <NavLink to="/classes" className={linkClass}>
          <BookCopy size={20} className="flex-shrink-0" />
          <span className={textClass}>My Classes</span>
        </NavLink>
        <NavLink to="/drafts" className={linkClass}>
          <FileText size={20} className="flex-shrink-0" />
          <span className={textClass}>Drafts</span>
        </NavLink>
        
        {/* Tools Section */}
        <div className={cn("pt-4", isCollapsed ? 'mt-2' : 'mt-4 border-t border-slate-200 dark:border-slate-700')}>
          <h3 className={cn("mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider", isCollapsed ? 'text-center' : 'px-4')}>
            <span className={textClass}>Tools</span>
          </h3>
          <div className="flex flex-col gap-2">
            <NavLink to="/builder" className={linkClass}>
              <ClipboardEdit size={20} className="flex-shrink-0" />
              <span className={textClass}>Builder</span>
            </NavLink>
            <NavLink to="/planner" className={linkClass}>
              <ClipboardEdit size={20} className="flex-shrink-0" />
              <span className={textClass}>AI Planner</span>
            </NavLink>
            <NavLink to="/templates" className={linkClass}>
              <LayoutTemplate size={20} className="flex-shrink-0" />
              <span className={textClass}>Templates</span>
            </NavLink>
            <NavLink to="/outcomes" className={linkClass}>
              <ListChecks size={20} className="flex-shrink-0" />
              <span className={textClass}>Outcomes</span>
            </NavLink>
            <NavLink to="/library" className={linkClass}>
              <Library size={20} className="flex-shrink-0" />
              <span className={textClass}>Materials</span>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Settings (bottom) */}
      <div className="mt-auto px-2">
        <NavLink to="/settings" className={linkClass}>
          <Settings size={20} className="flex-shrink-0" />
          <span className={textClass}>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
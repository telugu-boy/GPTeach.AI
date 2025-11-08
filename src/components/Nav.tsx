
import { Link, NavLink } from 'react-router-dom'
import { BookOpen, ListChecks, LayoutTemplate, Library, Settings, FileText } from 'lucide-react'

export default function Nav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    'px-3 py-2 rounded-xl hover:bg-emerald-100/60 dark:hover:bg-emerald-900/30 ' +
    (isActive ? 'bg-emerald-100/80 dark:bg-emerald-900/40 ' : '')

  return (
    <div className="flex items-center justify-between mb-6">
      <Link to="/" className="flex items-center gap-2 text-2xl font-semibold">
        <span className="inline-block h-8 w-8 rounded-xl bg-accent-500"></span>
        Lesson Planner
      </Link>
      <nav className="flex gap-2 text-sm">
        <NavLink to="/" className={linkClass}><BookOpen className="inline h-4 w-4 mr-1" /> Builder</NavLink>
        <NavLink to="/templates" className={linkClass}><LayoutTemplate className="inline h-4 w-4 mr-1" /> Templates</NavLink>
        <NavLink to="/outcomes" className={linkClass}><ListChecks className="inline h-4 w-4 mr-1" /> Outcomes</NavLink>
        <NavLink to="/library" className={linkClass}><Library className="inline h-4 w-4 mr-1" /> Materials</NavLink>
        <NavLink to="/drafts" className={linkClass}><FileText className="inline h-4 w-4 mr-1" /> Drafts</NavLink>
        <NavLink to="/settings" className={linkClass}><Settings className="inline h-4 w-4 mr-1" /> Settings</NavLink>
      </nav>
    </div>
  )
}

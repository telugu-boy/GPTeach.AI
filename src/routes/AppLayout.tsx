// src/routes/AppLayout.tsx (Updated)

import { Outlet } from 'react-router-dom';
import Nav from '../components/Nav';

export default function AppLayout() {
  return (
    // This container controls the entire screen layout.
    // It's changed to a flex-row to accommodate the sidebar.
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      
      {/* 1. The new sidebar navigation */}
      <Nav />

      {/* 2. The Page Content Area */}
      {/* 'flex-1' makes this area fill all remaining space next to the sidebar. */}
      {/* 'overflow-y-auto' makes only the main content scrollable. */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
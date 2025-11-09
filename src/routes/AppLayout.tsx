// src/routes/AppLayout.tsx (Updated)

import { Outlet } from 'react-router-dom';
import Nav from '../components/Nav';

export default function AppLayout() {
  return (
    // This container controls the entire screen layout.
    // I've added "py-6" to create the buffer space at the top and bottom.
    <div className="flex flex-col h-screen max-h-screen bg-white dark:bg-slate-900 py-6">
      
      {/* 1. The Consistent Navigation Bar */}
      {/* It's centered and has a max-width, and will never move. */}
      <header className="w-full max-w-7xl mx-auto px-4">
        <Nav />
      </header>

      {/* 2. The Page Content Area */}
      {/* 'flex-1' makes this area fill all remaining space below the Nav bar. */}
      {/* 'min-h-0' allows the child components (like the planner) to handle their own scrolling. */}
      <main className="flex-1 min-h-0">
        <Outlet />
      </main>
    </div>
  );
}
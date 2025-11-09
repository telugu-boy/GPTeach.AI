import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Nav from '../components/Nav';

export default function AppLayout() {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      
      <Nav 
        isCollapsed={isNavCollapsed} 
        onToggle={() => setIsNavCollapsed(!isNavCollapsed)} 
      />

      <main className="flex-1 min-h-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
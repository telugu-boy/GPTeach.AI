// src/main.tsx (Corrected)

import './styles/index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { store } from './app/store';

// Route Components
import AppLayout from './routes/AppLayout';
import Home from './routes/Home';
import Classes from './routes/Classes';
import ArchivedClasses from './routes/ArchivedClasses';
import Templates from './routes/Templates';
import Outcomes from './routes/Outcomes';
import Settings from './routes/Settings';
import LessonPlanner from './routes/LessonPlanner';
import Library from './routes/Library';
import ClassDashboard from './routes/ClassDashboard';
import SignIn from './routes/SignIn';
import Calendar from './routes/Calendar';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'classes', element: <Classes /> },
      { path: 'class/:classId', element: <ClassDashboard /> },
      { path: 'class/:classId/folder/:folderId', element: <ClassDashboard /> },
      { path: 'archived-classes', element: <ArchivedClasses /> },
      { path: 'planner', element: <LessonPlanner /> },
      { path: 'templates', element: <Templates /> },
      { path: 'outcomes', element: <Outcomes /> },
      { path: 'library', element: <Library /> },
      { path: 'settings', element: <Settings /> },
      { path: 'signin', element: <SignIn /> },
      { path: 'calendar', element: <Calendar /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
);
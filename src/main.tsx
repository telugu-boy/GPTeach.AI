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
import Builder from './routes/Builder';
import Templates from './routes/Templates';
import Outcomes from './routes/Outcomes';
import Library from './routes/Library';
import Settings from './routes/Settings';
import Drafts from './routes/Drafts';
import LessonPlanner from './routes/LessonPlanner';


// Placeholder for other routes
const Placeholder = ({ title }: { title: string }) => <div className="p-6"><h1 className="text-2xl font-bold">{title}</h1><p>This page is a placeholder.</p></div>;

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'classes', element: <Classes /> },
      { path: 'builder', element: <Builder /> },
      { path: 'planner', element: <LessonPlanner /> },
      { path: 'templates', element: <Templates /> },
      { path: 'outcomes', element: <Outcomes /> },
      { path: 'library', element: <Library /> },
      { path: 'drafts', element: <Drafts /> },
      { path: 'settings', element: <Settings /> },
      { path: 'class/:classId', element: <Placeholder title="Class Details" /> },
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
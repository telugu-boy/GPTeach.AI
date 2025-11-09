// src/main.tsx (Corrected)

import './styles/index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { store } from './app/store';

// Route Components
import AppLayout from './routes/AppLayout';
import Builder from './routes/Builder';
import Templates from './routes/Templates';
import Outcomes from './routes/Outcomes';
import Settings from './routes/Settings';
import LessonPlanner from './routes/LessonPlanner';
import Library from './routes/Library';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />, // AppLayout is the shell for ALL pages.
    children: [
      { index: true, element: <Builder /> }, // The Builder component is now the home page.
      { path: 'planner', element: <LessonPlanner /> },
      { path: 'templates', element: <Templates /> },
      { path: 'outcomes', element: <Outcomes /> },
      { path: 'library', element: <Library /> },
      { path: 'settings', element: <Settings /> },
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
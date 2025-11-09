// src/routes/LessonPlanner.tsx (Updated)

import React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import LessonPlanTemplate from '../components/LessonPlanTemplate';
import AIChatInterface from '../components/AIChatInterface';

export default function LessonPlanner() {
  return (
    <PanelGroup direction="horizontal" className="h-full w-full">
      <Panel defaultSize={65} minSize={40}>
        <div className="h-full w-full overflow-y-auto">
          <LessonPlanTemplate />
        </div>
      </Panel>
      <PanelResizeHandle className="w-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-300 dark:hover:bg-emerald-700 transition-colors" />
      <Panel defaultSize={35} minSize={20}>
        <aside className="h-full w-full">
          <AIChatInterface />
        </aside>
      </Panel>
    </PanelGroup>
  );
}
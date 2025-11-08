
import React from 'react'
import GlassCard from '../components/GlassCard'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../app/store'
import { setTheme } from '../features/ui/uiSlice'

export default function Settings() {
  const dispatch = useDispatch()
  const theme = useSelector((s: RootState) => s.ui.theme)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GlassCard className="space-y-3">
        <h2 className="text-xl font-semibold">Appearance</h2>
        <div className="flex gap-2">
          <button onClick={() => dispatch(setTheme('light'))} className={"px-4 py-2 rounded-xl " + (theme==='light' ? "bg-accent-500 text-white" : "bg-emerald-100")}>Light</button>
          <button onClick={() => dispatch(setTheme('dark'))} className={"px-4 py-2 rounded-xl " + (theme==='dark' ? "bg-accent-500 text-white" : "bg-emerald-100")}>Dark</button>
        </div>
      </GlassCard>
      <GlassCard className="space-y-3">
        <h2 className="text-xl font-semibold">Placeholder API</h2>
        <p className="text-sm text-gray-600">Set your GPT API later. For now, this is a UI-only demo.</p>
      </GlassCard>
    </div>
  )
}


import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../app/store'
import GlassCard from '../components/GlassCard'
import { deletePlan, setCurrentPlan } from '../features/plans/plansSlice'

export default function Drafts() {
  const dispatch = useDispatch()
  const { items } = useSelector((s: RootState) => s.plans)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(p => (
        <GlassCard key={p.id} className="space-y-2">
          <div className="font-semibold">{p.title || 'Untitled'}</div>
          <div className="text-sm text-gray-600">{new Date(p.updatedAt).toLocaleString()}</div>
          <div className="flex gap-2">
            <button onClick={() => dispatch(setCurrentPlan(p.id))} className="px-3 py-1 rounded-xl bg-emerald-100">Open</button>
            <button onClick={() => dispatch(deletePlan(p.id))} className="px-3 py-1 rounded-xl bg-red-100 text-red-700">Delete</button>
          </div>
        </GlassCard>
      ))}
      {items.length === 0 && <p className="text-sm text-gray-500">No drafts yet.</p>}
    </div>
  )
}


import React, { useState } from 'react'
import GlassCard from './GlassCard'
import type { TimedActivity } from '../lib/types'

export default function ActivitiesEditor({
  activities, onChange
}: {
  activities: TimedActivity[]
  onChange: (items: TimedActivity[]) => void
}) {
  const add = () => {
    const id = Math.random().toString(36).slice(2)
    onChange([...activities, { id, minutes: 10, title: 'New Activity', details: '' }])
  }
  const remove = (id: string) => onChange(activities.filter(a => a.id !== id))
  const update = (id: string, updates: Partial<TimedActivity>) =>
    onChange(activities.map(a => (a.id === id ? { ...a, ...updates } : a)))

  const move = (from: number, to: number) => {
    const copy = [...activities]
    const [item] = copy.splice(from, 1)
    copy.splice(to, 0, item)
    onChange(copy)
  }

  return (
    <GlassCard className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Activities</h3>
        <button onClick={add} className="px-3 py-1 rounded-xl bg-accent-500 text-white">Add Activity</button>
      </div>
      <div className="space-y-3">
        {activities.map((a, idx) => (
          <div key={a.id} className="rounded-xl border border-white/40 dark:border-gray-700 p-3 bg-white/60 dark:bg-gray-800/40">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
              <input className="md:col-span-2 px-3 py-2 rounded-xl bg-white/80 dark:bg-gray-800/60 border border-white/40 dark:border-gray-700"
                value={a.title} onChange={(e) => update(a.id, { title: e.target.value })} />
              <input className="md:col-span-1 px-3 py-2 rounded-xl bg-white/80 dark:bg-gray-800/60 border border-white/40 dark:border-gray-700"
                type="number" min={1} value={a.minutes} onChange={(e) => update(a.id, { minutes: Number(e.target.value) })} />
              <textarea className="md:col-span-3 px-3 py-2 rounded-xl bg-white/80 dark:bg-gray-800/60 border border-white/40 dark:border-gray-700"
                value={a.details} onChange={(e) => update(a.id, { details: e.target.value })} placeholder="Details / steps" />
            </div>
            <div className="flex gap-2 mt-2">
              <button disabled={idx===0} onClick={() => move(idx, idx-1)} className="px-2 py-1 rounded bg-emerald-100 disabled:opacity-50">↑</button>
              <button disabled={idx===activities.length-1} onClick={() => move(idx, idx+1)} className="px-2 py-1 rounded bg-emerald-100 disabled:opacity-50">↓</button>
              <button onClick={() => remove(a.id)} className="ml-auto px-2 py-1 rounded bg-red-100 text-red-700">Remove</button>
            </div>
          </div>
        ))}
        {activities.length === 0 && <p className="text-sm text-gray-500">No activities yet.</p>}
      </div>
    </GlassCard>
  )
}


import React from 'react'
import GlassCard from './GlassCard'
import type { RubricCriterion, RubricLevel } from '../lib/types'

export default function RubricBuilder({
  criteria,
  onChange,
}: {
  criteria: RubricCriterion[]
  onChange: (criteria: RubricCriterion[]) => void
}) {
  const updateCriterion = (id: string, updates: Partial<RubricCriterion>) => {
    onChange(criteria.map(c => (c.id === id ? { ...c, ...updates } : c)))
  }

  const addCriterion = () => {
    const id = Math.random().toString(36).slice(2)
    onChange([...criteria, { id, name: 'New Criterion', levels: defaultLevels() }])
  }

  const removeCriterion = (id: string) => {
    onChange(criteria.filter(c => c.id != id))
  }

  const updateLevel = (cid: string, idx: number, updates: Partial<RubricLevel>) => {
    const copy = criteria.map(c => ({ ...c, levels: c.levels.map(l => ({...l})) }))
    const c = copy.find(c => c.id === cid)!
    c.levels[idx] = { ...c.levels[idx], ...updates }
    onChange(copy)
  }

  return (
    <GlassCard className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Rubric</h3>
        <button onClick={addCriterion} className="px-3 py-1 rounded-xl bg-accent-500 text-white">Add Criterion</button>
      </div>
      <div className="space-y-4">
        {criteria.map((c) => (
          <div key={c.id} className="rounded-xl border border-white/40 dark:border-gray-700 p-3 bg-white/60 dark:bg-gray-800/40">
            <div className="flex gap-2 items-center mb-2">
              <input
                className="flex-1 px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-800/60 border border-white/40 dark:border-gray-700"
                value={c.name}
                onChange={(e) => updateCriterion(c.id, { name: e.target.value })}
              />
              <button onClick={() => removeCriterion(c.id)} className="px-2 py-1 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30">Remove</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              {c.levels.map((l, i) => (
                <div key={i} className="space-y-1">
                  <input
                    className="w-full px-2 py-1 rounded bg-white/80 dark:bg-gray-800/60 border border-white/40 dark:border-gray-700"
                    value={l.label}
                    onChange={(e) => updateLevel(c.id, i, { label: e.target.value })}
                  />
                  <textarea
                    className="w-full px-2 py-1 min-h-[72px] rounded bg-white/80 dark:bg-gray-800/60 border border-white/40 dark:border-gray-700"
                    value={l.descriptor}
                    onChange={(e) => updateLevel(c.id, i, { descriptor: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        {criteria.length === 0 && <p className="text-sm text-gray-500">No criteria yet. Add your first criterion.</p>}
      </div>
    </GlassCard>
  )
}

function defaultLevels(): RubricLevel[] {
  return [
    { label: 'Exemplary', descriptor: '' },
    { label: 'Proficient', descriptor: '' },
    { label: 'Developing', descriptor: '' },
    { label: 'Beginning', descriptor: '' },
  ]
}

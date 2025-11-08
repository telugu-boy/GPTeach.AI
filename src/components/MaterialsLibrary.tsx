
import React, { useState } from 'react'
import GlassCard from './GlassCard'

export default function MaterialsLibrary({
  materials,
  onChange
}: {
  materials: string[]
  onChange: (items: string[]) => void
}) {
  const [input, setInput] = useState('')
  const add = () => {
    if (!input.trim()) return
    onChange([...materials, input.trim()])
    setInput('')
  }
  const remove = (val: string) => onChange(materials.filter(m => m !== val))

  return (
    <GlassCard className="space-y-3">
      <h3 className="font-semibold">Materials</h3>
      <div className="flex gap-2">
        <input className="flex-1 px-3 py-2 rounded-xl bg-white/70 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700"
         value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g., Chart paper, Markers, Video link" />
        <button onClick={add} className="px-4 py-2 rounded-xl bg-accent-500 text-white">Add</button>
      </div>
      <ul className="flex flex-wrap gap-2">
        {materials.map((m, i) => (
          <li key={i} className="px-3 py-1 rounded-full bg-white/70 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700">
            {m}
            <button onClick={() => remove(m)} className="ml-2 text-red-600">×</button>
          </li>
        ))}
      </ul>
      {materials.length === 0 && <p className="text-sm text-gray-500">No materials added yet.</p>}
    </GlassCard>
  )
}

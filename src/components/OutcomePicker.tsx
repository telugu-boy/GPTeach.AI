
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../app/store'
import { setOutcomeFilters } from '../features/outcomes/outcomesSlice'
import type { Outcome } from '../lib/types'

export default function OutcomePicker({
  selected,
  onChange
}: {
  selected: Outcome[],
  onChange: (items: Outcome[]) => void
}) {
  const dispatch = useDispatch()
  const { items, filters } = useSelector((s: RootState) => s.outcomes)

  const filtered = items.filter(o =>
    (!filters.subject || o.subject === filters.subject) &&
    (!filters.grade || o.grade === filters.grade) &&
    (!filters.query || (o.code + ' ' + o.description).toLowerCase().includes(filters.query.toLowerCase()))
  )

  const toggle = (o: Outcome) => {
    const exists = selected.some(x => x.id === o.id)
    onChange(exists ? selected.filter(x => x.id !== o.id) : [...selected, o])
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input placeholder="Search outcomes..." value={filters.query} onChange={(e) => dispatch(setOutcomeFilters({ ...filters, query: e.target.value }))}
         className="px-3 py-2 rounded-xl bg-white/70 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700" />
        <input placeholder="Subject (e.g., ELA, Science)" value={filters.subject} onChange={(e) => dispatch(setOutcomeFilters({ ...filters, subject: e.target.value }))}
         className="px-3 py-2 rounded-xl bg-white/70 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700" />
        <input placeholder="Grade (e.g., 6, 7)" value={filters.grade} onChange={(e) => dispatch(setOutcomeFilters({ ...filters, grade: e.target.value }))}
         className="px-3 py-2 rounded-xl bg-white/70 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700" />
      </div>
      <div className="max-h-64 overflow-auto rounded-xl border border-white/40 dark:border-gray-700 bg-white/60 dark:bg-gray-800/40">
        {filtered.map((o) => (
          <label key={o.id} className="flex items-start gap-2 p-2 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20 cursor-pointer">
            <input type="checkbox" checked={selected.some(s => s.id === o.id)} onChange={() => toggle(o)} />
            <div>
              <div className="font-medium">{o.code}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{o.description}</div>
            </div>
          </label>
        ))}
        {filtered.length === 0 && <div className="p-3 text-sm text-gray-500">No outcomes match your filters.</div>}
      </div>
    </div>
  )
}


import React from 'react'
import GlassCard from '../components/GlassCard'
import OutcomePicker from '../components/OutcomePicker'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../app/store'
import { setOutcomesForPlan } from '../features/plans/plansSlice'

export default function Outcomes() {
  const dispatch = useDispatch()
  const plans = useSelector((s: RootState) => s.plans.items)
  const plan = plans[0]
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GlassCard>
        <h2 className="text-xl font-semibold mb-2">Find Outcomes</h2>
        <OutcomePicker
          selected={plan.outcomes}
          onChange={(o) => dispatch(setOutcomesForPlan({ planId: plan.id, outcomes: o }))}
        />
      </GlassCard>
      <GlassCard>
        <h2 className="text-xl font-semibold mb-2">Selected</h2>
        <ul className="space-y-2">
          {plan.outcomes.map(o => (
            <li key={o.id} className="rounded-xl border p-2 bg-white/60 dark:bg-gray-800/40">
              <div className="font-medium">{o.code}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{o.description}</div>
            </li>
          ))}
          {plan.outcomes.length === 0 && <p className="text-sm text-gray-500">None selected.</p>}
        </ul>
      </GlassCard>
    </div>
  )
}

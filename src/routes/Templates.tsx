
import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../app/store'
import { addTemplate, deleteTemplate, updateTemplate } from '../features/templates/templatesSlice'
import GlassCard from '../components/GlassCard'
import type { TemplateField, Template } from '../lib/types'

const allFields: TemplateField[] = [
  'title','grade','subject','duration','outcomes','objectives','materials','priorKnowledge',
  'activities','assessment','differentiation','extensions','references','rubric'
]

export default function Templates() {
  const { items } = useSelector((s: RootState) => s.templates)
  const dispatch = useDispatch()
  const [name, setName] = useState('New Template')
  const [fields, setFields] = useState<TemplateField[]>(['title', 'grade', 'subject', 'duration', 'outcomes', 'activities'])

  const toggleField = (f: TemplateField) =>
    setFields(fields.includes(f) ? fields.filter(x => x !== f) : [...fields, f])

  const create = () => {
    dispatch(addTemplate(name, fields, ['{duration}','{grade}','{subject}','{outcomeCodes}']))
    setName('New Template')
    setFields(['title', 'grade', 'subject', 'duration', 'outcomes', 'activities'])
  }

  const update = (tpl: Template, delta: Partial<Template>) => {
    dispatch(updateTemplate({ ...tpl, ...delta }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <GlassCard className="space-y-3">
        <h2 className="text-xl font-semibold">Create Template</h2>
        <input className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700"
          value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          {allFields.map(f => (
            <label key={f} className={"px-3 py-1 rounded-full border cursor-pointer " + (fields.includes(f) ? "bg-emerald-100" : "bg-white/60")}>
              <input type="checkbox" className="mr-2" checked={fields.includes(f)} onChange={() => toggleField(f)} />
              {f}
            </label>
          ))}
        </div>
        <button onClick={create} className="px-4 py-2 rounded-xl bg-accent-500 text-white">Add Template</button>
      </GlassCard>

      <div className="lg:col-span-2 space-y-4">
        {items.map((tpl) => (
          <GlassCard key={tpl.id} className="space-y-3">
            <div className="flex items-center gap-3">
              <input className="flex-1 px-3 py-2 rounded-xl bg-white/70 dark:bg-gray-800/50 border"
                value={tpl.name} onChange={(e) => update(tpl, { name: e.target.value })} />
              <button onClick={() => dispatch(deleteTemplate(tpl.id))} className="px-3 py-2 rounded-xl bg-red-100 text-red-700">Delete</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {allFields.map((f) => {
                const active = tpl.fields.includes(f)
                const toggle = () => {
                  const next = active ? tpl.fields.filter(x => x !== f) : [...tpl.fields, f]
                  update(tpl, { fields: next })
                }
                return (
                  <button key={f} onClick={toggle} className={"px-3 py-1 rounded-full border " + (active ? "bg-emerald-100" : "bg-white/60")}>
                    {f}
                  </button>
                )
              })}
            </div>
            <div>
              <label className="block text-sm mb-1">Variables (comma-separated)</label>
              <input className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-gray-800/50 border"
                value={(tpl.variables || []).join(', ')}
                onChange={(e) => update(tpl, { variables: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
            </div>
          </GlassCard>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-500">No templates yet.</p>}
      </div>
    </div>
  )
}

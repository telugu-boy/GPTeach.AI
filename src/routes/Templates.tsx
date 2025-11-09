
import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../app/store'
import GlassCard from '../components/GlassCard'
import TemplatePreview from '../components/TemplatePreview'
import type { TemplateField, Template, TemplatePreviewVariant } from '../lib/types'
import { applyTemplateToPlan } from '../features/plans/plansSlice'
import { labelForField } from '../lib/templateFields'

const AUTO_TEMPLATE_VARIANTS: Array<{
  id: string
  name: string
  summary: string
  previewVariant: TemplatePreviewVariant
}> = [
  {
    id: 'classic',
    name: 'Auto template · Classic table',
    summary: 'Traditional two-column table for direct data entry.',
    previewVariant: 'classic'
  },
  {
    id: 'split',
    name: 'Auto template · Logistics grid',
    summary: 'Compact grid for logistics with detailed blocks for instruction.',
    previewVariant: 'split'
  },
  {
    id: 'sectioned',
    name: 'Auto template · Sectioned storyboard',
    summary: 'Grouped panels for logistics, learning design, and reflection.',
    previewVariant: 'sectioned'
  }
]

export default function Templates() {
  const dispatch = useDispatch()
  const { items } = useSelector((s: RootState) => s.templates)
  const plans = useSelector((s: RootState) => s.plans.items)
  const currentId = useSelector((s: RootState) => s.plans.currentId) || plans[0]?.id
  const currentPlan = plans.find((p) => p.id === currentId)
  const [selectedFields, setSelectedFields] = useState<TemplateField[]>([])

  const fieldOptions = useMemo(() => {
    const unique = new Set<TemplateField>()
    items.forEach((tpl) => tpl.fields.forEach((field) => unique.add(field)))
    return Array.from(unique).sort((a, b) => labelForField(a).localeCompare(labelForField(b)))
  }, [items])

  const filteredTemplates = useMemo(() => {
    if (selectedFields.length === 0) return items
    return items.filter((tpl) => selectedFields.every((f) => tpl.fields.includes(f)))
  }, [items, selectedFields])

  const generatedTemplates = useMemo(() => {
    if (filteredTemplates.length > 0 || selectedFields.length === 0) return []
    const orderedFields = [...selectedFields]
    const key = [...selectedFields].sort().join('-')
    return AUTO_TEMPLATE_VARIANTS.map((variant) => ({
      id: `generated-${variant.id}-${key}`,
      name: variant.name,
      summary: variant.summary,
      fields: orderedFields,
      previewVariant: variant.previewVariant
    })) as Template[]
  }, [filteredTemplates.length, selectedFields])

  const templatesToRender = generatedTemplates.length ? generatedTemplates : filteredTemplates

  const toggleField = (field: TemplateField) => {
    setSelectedFields((prev) => (prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]))
  }

  const clearFilters = () => setSelectedFields([])

  const apply = (template: Template) => {
    if (!currentPlan) return
    dispatch(applyTemplateToPlan({ planId: currentPlan.id, template }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="space-y-4">
        <GlassCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Active Lesson</h2>
            <Link to="/builder" className="text-sm text-accent-500 underline">
              Open Builder
            </Link>
          </div>
          {currentPlan ? (
            <div>
              <p className="font-medium">{currentPlan.title}</p>
              <p className="text-sm text-gray-600">
                Grade {currentPlan.grade || '—'} · {currentPlan.subject || 'Subject TBD'} · {currentPlan.duration} min
              </p>
              {currentPlan.templateId && (
                <p className="mt-2 text-xs text-emerald-700 bg-emerald-100/80 inline-block px-2 py-1 rounded-full">
                  Using template: {items.find((tpl) => tpl.id === currentPlan.templateId)?.name || 'Custom'}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Create a plan in the Builder tab before applying a template.</p>
          )}
        </GlassCard>

        <GlassCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Filter by Subheading</h2>
            {selectedFields.length > 0 && (
              <button onClick={clearFilters} className="text-sm text-accent-500 underline">
                Clear
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500">Select the table sections you want to see in templates.</p>
          <div className="flex flex-wrap gap-2">
            {fieldOptions.map((field) => {
              const active = selectedFields.includes(field)
              return (
                <label
                  key={field}
                  className={`px-3 py-1 rounded-full border cursor-pointer ${
                    active ? 'bg-emerald-100 border-emerald-300' : 'bg-white/60'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={active}
                    onChange={() => toggleField(field)}
                  />
                  {labelForField(field)}
                </label>
              )
            })}
          </div>
        </GlassCard>
      </div>

      <div className="lg:col-span-3 space-y-4">
        {templatesToRender.map((tpl) => {
          const isApplied = currentPlan?.templateId === tpl.id
          const isGenerated = generatedTemplates.some((gen) => gen.id === tpl.id)
          return (
            <GlassCard key={tpl.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{tpl.name}</h3>
                  {tpl.summary && <p className="text-sm text-gray-600 mt-1">{tpl.summary}</p>}
                  {isGenerated && (
                    <p className="text-xs text-amber-700 bg-amber-100/80 inline-block px-2 py-1 rounded-full mt-2">
                      Auto-generated from filters
                    </p>
                  )}
                </div>
                {isApplied && (
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">Applied</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {tpl.fields.map((field) => (
                  <span
                    key={`${tpl.id}-${field}`}
                    className="px-3 py-1 rounded-full bg-white/70 dark:bg-gray-800/40 border border-white/50 text-sm"
                  >
                    {labelForField(field)}
                  </span>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">Preview</p>
                <div className="max-h-80 overflow-auto rounded-lg">
                  <TemplatePreview fields={tpl.fields} variant={tpl.previewVariant} />
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                  {tpl.fields.length} subheading{tpl.fields.length === 1 ? '' : 's'} ·{' '}
                  {tpl.scaffold ? 'Includes scaffolded text' : 'Structure only'}
                </p>
                <button
                  onClick={() => apply(tpl)}
                  disabled={!currentPlan}
                  className={`px-4 py-2 rounded-xl text-white ${
                    isApplied ? 'bg-emerald-500' : 'bg-accent-500 hover:bg-accent-600'
                  } ${!currentPlan ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {isApplied ? 'Template Applied' : 'Use Template'}
                </button>
              </div>
            </GlassCard>
          )
        })}

        {templatesToRender.length === 0 && (
          <GlassCard>
            <p className="text-sm text-gray-500">
              No templates match all selected subheadings. Adjust the filters to see more options.
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  )
}

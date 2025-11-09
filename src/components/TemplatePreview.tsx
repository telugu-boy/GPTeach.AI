import React from 'react'
import type { TemplateField, TemplatePreviewVariant } from '../lib/types'
import { FIELD_HINTS, labelForField } from '../lib/templateFields'

type PreviewRow =
  | { type: 'standard'; field: TemplateField }
  | { type: 'timed'; field: 'timedActivities' }

const DEFAULT_HINT = 'Space for detailed notes or bullet points.'
const LOGISTICS_FIELDS: TemplateField[] = [
  'date',
  'grade',
  'subject',
  'school',
  'teacherName',
  'courseLevel',
  'lessonTime',
  'location',
  'duration'
]
const REFLECTION_FIELDS: TemplateField[] = ['closing', 'studentFeedback', 'lookingAhead', 'references']

export default function TemplatePreview({
  fields,
  variant = 'classic'
}: {
  fields: TemplateField[]
  variant?: TemplatePreviewVariant
}) {
  if (variant === 'split') return <SplitPreview fields={fields} />
  if (variant === 'sectioned') return <SectionedPreview fields={fields} />
  return <ClassicPreview fields={fields} />
}

function ClassicPreview({ fields }: { fields: TemplateField[] }) {
  const rows: PreviewRow[] = []
  fields.forEach((field) => {
    if (field === 'timedActivities') {
      rows.push({ type: 'timed', field: 'timedActivities' })
    } else {
      rows.push({ type: 'standard', field })
    }
  })

  return (
    <div className="border border-gray-300 rounded-lg bg-white/90 shadow-sm overflow-hidden">
      <table className="w-full border-collapse text-xs">
        <tbody>
          {rows.map((row, index) => {
            if (row.type === 'timed') {
              return (
                <tr key={`${row.field}-${index}`}>
                  <td colSpan={2} className="p-0 border-t border-gray-300">
                    <TimedActivitiesPreview />
                  </td>
                </tr>
              )
            }
            return (
              <tr key={`${row.field}-${index}`}>
                <td className="w-1/3 border-t border-gray-300 bg-gray-50 px-3 py-2 font-semibold uppercase tracking-wide">
                  {labelForField(row.field)}
                </td>
                <td className="border-t border-l border-gray-300 h-12 px-3 py-2 italic text-gray-500">
                  {FIELD_HINTS[row.field] || DEFAULT_HINT}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function SplitPreview({ fields }: { fields: TemplateField[] }) {
  const logisticSet = new Set(LOGISTICS_FIELDS)
  const logistics = fields.filter((field) => logisticSet.has(field))
  const rest = fields.filter((field) => !logisticSet.has(field))

  return (
    <div className="border border-gray-300 rounded-lg bg-white shadow-sm overflow-hidden text-xs">
      {logistics.length > 0 && (
        <div className="grid grid-cols-2 border-b border-gray-300 divide-x divide-gray-200">
          {logistics.map((field) => (
            <div key={field} className="p-3 bg-gray-50">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-600">{labelForField(field)}</p>
              <p className="mt-1 text-gray-500 italic">{FIELD_HINTS[field] || DEFAULT_HINT}</p>
            </div>
          ))}
        </div>
      )}
      <div className="divide-y divide-gray-200">
        {rest.map((field) =>
          field === 'timedActivities' ? (
            <div key={field} className="p-0">
              <TimedActivitiesPreview />
            </div>
          ) : (
            <div key={field} className="p-3">
              <p className="text-[11px] font-semibold text-gray-700">{labelForField(field)}</p>
              <div className="mt-2 min-h-[56px] rounded border border-dashed border-gray-300 p-2 text-gray-500 italic">
                {FIELD_HINTS[field] || DEFAULT_HINT}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}

function SectionedPreview({ fields }: { fields: TemplateField[] }) {
  const reflectionSet = new Set(REFLECTION_FIELDS)
  const logistics = fields.filter((field) => LOGISTICS_FIELDS.includes(field))
  const instruction = fields.filter(
    (field) => !LOGISTICS_FIELDS.includes(field) && !reflectionSet.has(field)
  )
  const reflection = fields.filter((field) => reflectionSet.has(field))

  const sections = [
    { title: 'Logistics', items: logistics },
    { title: 'Learning Design', items: instruction },
    { title: 'Reflection & Follow-up', items: reflection }
  ].filter((section) => section.items.length > 0)

  return (
    <div className="border border-gray-300 rounded-lg bg-white/90 shadow-sm overflow-hidden text-xs">
      {sections.map((section) => (
        <div key={section.title} className="border-b border-gray-200 last:border-none">
          <div className="bg-gray-100 px-4 py-2 font-semibold uppercase tracking-wide text-gray-700">
            {section.title}
          </div>
          <div className="divide-y divide-gray-200">
            {section.items.map((field) =>
              field === 'timedActivities' ? (
                <div key={field} className="p-0">
                  <TimedActivitiesPreview />
                </div>
              ) : (
                <div key={field} className="flex flex-col md:flex-row md:items-center">
                  <div className="md:w-1/3 px-4 py-3 font-semibold text-gray-700">{labelForField(field)}</div>
                  <div className="md:w-2/3 border-t md:border-t-0 md:border-l border-gray-200 px-4 py-3 italic text-gray-500">
                    {FIELD_HINTS[field] || DEFAULT_HINT}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function TimedActivitiesPreview() {
  return (
    <div className="w-full">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="border-b border-gray-300 bg-gray-50 px-3 py-2 text-left font-semibold uppercase tracking-wide">
              Time for activity (minutes)
            </th>
            <th className="border-b border-l border-gray-300 bg-gray-50 px-3 py-2 text-left font-semibold uppercase tracking-wide">
              Description of activity / new learning
            </th>
            <th className="border-b border-l border-gray-300 bg-gray-50 px-3 py-2 text-left font-semibold uppercase tracking-wide">
              Check for understanding
            </th>
          </tr>
        </thead>
        <tbody>
          {[0, 1, 2].map((row) => (
            <tr key={`timed-row-${row}`}>
              <td className="border-b border-gray-300 px-3 py-3 text-gray-400 italic">e.g., 10 min</td>
              <td className="border-b border-l border-gray-300 px-3 py-3 text-gray-400 italic">
                Outline the learning task, cues, and transitions.
              </td>
              <td className="border-b border-l border-gray-300 px-3 py-3 text-gray-400 italic">
                List checks (questioning, exit slip, observation).
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

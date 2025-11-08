
  import React, { useMemo } from 'react'
  import { useDispatch, useSelector } from 'react-redux'
  import type { RootState } from '../app/store'
  import { createPlan, setCurrentPlan, updatePlan, setOutcomesForPlan } from '../features/plans/plansSlice'
  import GlassCard from '../components/GlassCard'
  import OutcomePicker from '../components/OutcomePicker'
  import RichTextEditor from '../components/RichTextEditor'
  import ActivitiesEditor from '../components/ActivitiesEditor'
  import MaterialsLibrary from '../components/MaterialsLibrary'
  import PromptPreview from '../components/PromptPreview'
  import ControlsBar from '../components/ControlsBar'
  import { planToMarkdown, exportMarkdown, exportJSON } from '../lib/exporters'
  import type { Outcome } from '../lib/types'

  export default function Builder() {
    const dispatch = useDispatch()
    const plans = useSelector((s: RootState) => s.plans.items)
    const currentId = useSelector((s: RootState) => s.plans.currentId) || plans[0]?.id
    const plan = plans.find(p => p.id === currentId)!

    const prompt = useMemo(() => {
      const codes = plan.outcomes.map(o => o.code).join(', ')
      return `Create a lesson plan with the following details:
- Grade: ${plan.grade}
- Subject: ${plan.subject}
- Duration: ${plan.duration} minutes
- Outcomes: ${codes}
- Constraints: differentiate for diverse learners; include materials and assessments.
Use the following structure: Objectives, Materials, Prior Knowledge, Timed Activities, Assessment, Differentiation, Extensions, References. Include rubric.`
    }, [plan])

    const share = () => {
      const md = planToMarkdown(plan)
      const encoded = encodeURIComponent(md)
      const url = `${location.origin}${location.pathname}#share=${encoded}`
      navigator.clipboard.writeText(url)
      alert('Public link copied to clipboard (client-only demo).')
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Lesson Details</h2>
              <div className="flex gap-2">
                <button onClick={() => dispatch(createPlan())} className="px-3 py-1 rounded-xl bg-accent-500 text-white">New Plan</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input className="md:col-span-2 px-3 py-2 rounded-xl bg-white/70 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700"
               placeholder="Title" value={plan.title}
               onChange={(e) => dispatch(updatePlan({ id: plan.id, title: e.target.value }))} />
              <input className="px-3 py-2 rounded-xl bg-white/70 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700"
               placeholder="Grade" value={plan.grade}
               onChange={(e) => dispatch(updatePlan({ id: plan.id, grade: e.target.value }))} />
              <input className="px-3 py-2 rounded-xl bg-white/70 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700"
               placeholder="Subject" value={plan.subject}
               onChange={(e) => dispatch(updatePlan({ id: plan.id, subject: e.target.value }))} />
              <input type="number" className="px-3 py-2 rounded-xl bg-white/70 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700"
               placeholder="Duration (min)" value={plan.duration}
               onChange={(e) => dispatch(updatePlan({ id: plan.id, duration: Number(e.target.value) }))} />
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="font-semibold mb-2">Outcomes</h3>
            <OutcomePicker
              selected={plan.outcomes}
              onChange={(out: Outcome[]) => dispatch(setOutcomesForPlan({ planId: plan.id, outcomes: out }))}
            />
          </GlassCard>

          <MaterialsLibrary
            materials={plan.materials}
            onChange={(items) => dispatch(updatePlan({ id: plan.id, materials: items }))}
          />

          <GlassCard className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Objectives</h3>
                <RichTextEditor value={plan.objectives} onChange={(v) => dispatch(updatePlan({ id: plan.id, objectives: v }))} />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Prior Knowledge</h3>
                <RichTextEditor value={plan.priorKnowledge} onChange={(v) => dispatch(updatePlan({ id: plan.id, priorKnowledge: v }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Assessment</h3>
                <RichTextEditor value={plan.assessment} onChange={(v) => dispatch(updatePlan({ id: plan.id, assessment: v }))} />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Differentiation</h3>
                <RichTextEditor value={plan.differentiation} onChange={(v) => dispatch(updatePlan({ id: plan.id, differentiation: v }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Extensions</h3>
                <RichTextEditor value={plan.extensions} onChange={(v) => dispatch(updatePlan({ id: plan.id, extensions: v }))} />
              </div>
              <div>
                <h3 className="font-semibold mb-2">References</h3>
                <RichTextEditor value={plan.references} onChange={(v) => dispatch(updatePlan({ id: plan.id, references: v }))} />
              </div>
            </div>
          </GlassCard>

          <ActivitiesEditor
            activities={plan.activities}
            onChange={(items) => dispatch(updatePlan({ id: plan.id, activities: items }))}
          />
        </div>

        <div className="space-y-6">
          <PromptPreview prompt={prompt} />
          <GlassCard className="space-y-3">
            <h3 className="font-semibold">Actions</h3>
            <ControlsBar
              canExport={Boolean(plan.title.trim())}
              onExportMarkdown={() => exportMarkdown(plan)}
              onExportJSON={() => exportJSON(plan)}
              onGenerate={() => alert('Placeholder: call GPT API with prompt above')}
              onShare={share}
            />
          </GlassCard>
        </div>
      </div>
    )
  }

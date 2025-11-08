
import type { Plan } from './types'

export function planToMarkdown(plan: Plan): string {
  const date = new Date(plan.updatedAt || plan.createdAt).toLocaleString()
  return [
    `# ${plan.title}`,
    ``,
    `**Subject:** ${plan.subject}  `,
    `**Grade:** ${plan.grade}  `,
    `**Duration:** ${plan.duration} minutes  `,
    ``,
    `## Outcomes`,
    plan.outcomes.map(o => `- **${o.code}** — ${o.description}`).join('\n') || '_None_',
    ``,
    `## Objectives`,
    plan.objectives || '_None_',
    ``,
    `## Materials`,
    plan.materials.map(m => `- ${m}`).join('\n') || '_None_',
    ``,
    `## Prior Knowledge`,
    plan.priorKnowledge || '_None_',
    ``,
    `## Activities`,
    plan.activities.map(a => `- **(${a.minutes}m) ${a.title}** — ${a.details}`).join('\n') || '_None_',
    ``,
    `## Assessment`,
    plan.assessment || '_None_',
    ``,
    `## Differentiation`,
    plan.differentiation || '_None_',
    ``,
    `## Extensions`,
    plan.extensions || '_None_',
    ``,
    `## References`,
    plan.references || '_None_',
    ``,
    `---`,
    `_Last updated: ${date}_`
  ].join('\n')
}

export function downloadText(filename: string, content: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportMarkdown(plan: Plan) {
  downloadText(`${sanitize(plan.title)}.md`, planToMarkdown(plan), 'text/markdown')
}

export function exportJSON(plan: Plan) {
  downloadText(`${sanitize(plan.title)}.json`, JSON.stringify(plan, null, 2), 'application/json')
}

function sanitize(name: string) {
  return name.replace(/[^a-z0-9-_]+/gi, '_')
}

// TODO: implement PDF/DOCX exports using client-side libs on demand (e.g., jsPDF/docx) later.

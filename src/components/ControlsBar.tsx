
import React from 'react'
import { exportMarkdown, exportJSON } from '../lib/exporters'

export default function ControlsBar({
  canExport,
  onExportMarkdown,
  onExportJSON,
  onGenerate,
  onShare
}: {
  canExport: boolean,
  onExportMarkdown: () => void,
  onExportJSON: () => void,
  onGenerate: () => void,
  onShare: () => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button className="px-4 py-2 rounded-xl bg-accent-500 text-white" onClick={onGenerate}>Generate</button>
      <button className="px-4 py-2 rounded-xl bg-emerald-100" disabled={!canExport} onClick={onExportMarkdown}>Export .md</button>
      <button className="px-4 py-2 rounded-xl bg-emerald-100" disabled={!canExport} onClick={onExportJSON}>Export .json</button>
      <button className="px-4 py-2 rounded-xl bg-emerald-100" disabled={!canExport} onClick={onShare}>Get Public Link</button>
    </div>
  )
}


import React from 'react'
import GlassCard from './GlassCard'

type Props = {
  prompt: string
}

export default function PromptPreview({ prompt }: Props) {
  return (
    <GlassCard className="h-full">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Prompt Preview</h3>
      <textarea
        className="w-full h-[260px] p-3 rounded-xl bg-white/70 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700"
        value={prompt}
        readOnly
      />
    </GlassCard>
  )
}

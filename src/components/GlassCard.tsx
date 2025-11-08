export default function GlassCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={
      ['glass rounded-2xl p-5 shadow-glass',
       'text-slate-900 dark:text-slate-100'].join(' ') + (className ? ` ${className}` : '')
    }>
      {children}
    </div>
  )
}

type Tone = 'neutral' | 'success' | 'warning' | 'info' | 'danger'

const toneClass: Record<Tone, string> = {
  neutral: 'bg-black/5 text-[rgb(var(--text))] dark:bg-white/10',
  success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  info: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  danger: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: Tone
}) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        toneClass[tone],
      ].join(' ')}
    >
      {children}
    </span>
  )
}


import type { InputHTMLAttributes } from 'react'

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        'h-10 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 text-sm',
        'text-[rgb(var(--text))] placeholder:text-[rgb(var(--muted))]',
        'focus-ring',
        className ?? '',
      ].join(' ')}
    />
  )
}


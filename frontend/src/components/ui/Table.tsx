import type { PropsWithChildren } from 'react'

export function Table({ children }: PropsWithChildren) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[rgb(var(--border))]">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  )
}

export function THead({ children }: PropsWithChildren) {
  return (
    <thead className="bg-black/5 text-xs text-[rgb(var(--muted))] dark:bg-white/5">
      {children}
    </thead>
  )
}

export function TBody({ children }: PropsWithChildren) {
  return <tbody className="divide-y divide-[rgb(var(--border))]">{children}</tbody>
}

export function TH({ children }: PropsWithChildren) {
  return <th className="px-4 py-3 font-medium">{children}</th>
}

export function TD({
  children,
  className,
  colSpan,
}: PropsWithChildren<{ className?: string; colSpan?: number }>) {
  return (
    <td className={['px-4 py-3', className ?? ''].join(' ')} colSpan={colSpan}>
      {children}
    </td>
  )
}


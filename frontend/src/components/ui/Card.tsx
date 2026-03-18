import type { PropsWithChildren, ReactNode } from 'react'

export function Card({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return <div className={['card', className ?? ''].join(' ')}>{children}</div>
}

export function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: string
  subtitle?: string
  right?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-5">
      <div>
        <div className="text-sm font-semibold text-[rgb(var(--text))]">
          {title}
        </div>
        {subtitle ? (
          <div className="mt-1 text-xs text-[rgb(var(--muted))]">{subtitle}</div>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  )
}

export function CardBody({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return <div className={['px-5 pb-5', className ?? ''].join(' ')}>{children}</div>
}


import { useRef } from 'react'
import { useClickOutside } from '../../hooks/useClickOutside'

export function Dropdown({
  open,
  onClose,
  align = 'right',
  children,
}: {
  open: boolean
  onClose: () => void
  align?: 'left' | 'right'
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, onClose, open)

  if (!open) return null
  return (
    <div
      ref={ref}
      className={[
        'absolute z-50 mt-2 min-w-64 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-lg',
        align === 'right' ? 'right-0' : 'left-0',
      ].join(' ')}
    >
      {children}
    </div>
  )
}


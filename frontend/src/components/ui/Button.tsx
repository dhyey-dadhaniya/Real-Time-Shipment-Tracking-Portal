import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  isLoading?: boolean
}

const variantClass: Record<Variant, string> = {
  primary:
    'bg-[rgb(var(--primary))] text-white hover:brightness-110 active:brightness-95',
  secondary:
    'bg-[rgb(var(--card))] text-[rgb(var(--text))] border border-[rgb(var(--border))] hover:bg-black/5 dark:hover:bg-white/5',
  ghost: 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5',
  danger:
    'bg-[rgb(var(--danger))] text-white hover:brightness-110 active:brightness-95',
}

const sizeClass: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  isLoading,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading
  return (
    <button
      {...props}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium',
        'transition focus-ring disabled:opacity-60 disabled:cursor-not-allowed',
        variantClass[variant],
        sizeClass[size],
        className ?? '',
      ].join(' ')}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          <span>Loading</span>
        </span>
      ) : (
        children
      )}
    </button>
  )
}


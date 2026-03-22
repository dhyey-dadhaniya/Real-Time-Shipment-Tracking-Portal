import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ToastVariant = 'default' | 'destructive'

export interface ToastInput {
  title: string
  variant?: ToastVariant
}

interface ToastContextValue {
  toast: (input: ToastInput) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<Required<ToastInput> | null>(null)

  const toast = useCallback((input: ToastInput) => {
    setActive({
      title: input.title,
      variant: input.variant ?? 'default',
    })
    window.setTimeout(() => setActive(null), 4500)
  }, [])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {active ? (
        <div
          role="status"
          className={[
            'fixed bottom-4 right-4 z-[100] max-w-sm rounded-xl px-4 py-3 text-sm shadow-lg',
            active.variant === 'destructive'
              ? 'bg-rose-600 text-white'
              : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900',
          ].join(' ')}
        >
          {active.title}
        </div>
      ) : null}
    </ToastContext.Provider>
  )
}

export function useToastContext(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return ctx
}

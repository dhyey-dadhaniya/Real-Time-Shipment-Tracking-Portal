import { useEffect } from 'react'

export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  onOutside: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return

    const handler = (event: MouseEvent) => {
      const el = ref.current
      if (!el) return
      if (event.target instanceof Node && el.contains(event.target)) return
      onOutside()
    }

    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [enabled, onOutside, ref])
}


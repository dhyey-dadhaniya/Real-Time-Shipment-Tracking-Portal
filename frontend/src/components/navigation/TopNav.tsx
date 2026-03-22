import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Moon, Sun } from 'lucide-react'
import { Button } from '../ui/Button'
import { useUiStore } from '../../store/uiStore'
import { useAuth } from '@/contexts/auth-context'
import { ROUTES } from '@/constants/routes'

export function TopNav() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)

  const initials = useMemo(() => {
    const e = user?.email ?? ''
    const parts = e.split('@')[0]?.split(/[.\s_]/) ?? []
    const a = parts[0]?.[0] ?? 'U'
    const b = parts[1]?.[0] ?? (parts[0]?.[1] ?? 'S')
    return (a + b).toUpperCase()
  }, [user?.email])

  const nextTheme = useMemo(() => {
    if (theme === 'light') return 'dark'
    if (theme === 'dark') return 'system'
    return 'light'
  }, [theme])

  return (
    <div className="sticky top-0 z-30 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg))]/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-end gap-2 px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            logout()
            navigate(ROUTES.LOGIN, { replace: true })
          }}
          aria-label="Sign out"
        >
          <LogOut size={18} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(nextTheme)}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
        </Button>

        <div className="ml-2 flex items-center gap-3">
          <div className="hidden text-right leading-tight sm:block">
            <div className="text-sm font-semibold">{user?.email ?? '—'}</div>
            <div className="text-xs text-[rgb(var(--muted))]">{user?.role ?? ''}</div>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-black/5 text-sm font-semibold dark:bg-white/10">
            {initials}
          </div>
        </div>
      </div>
    </div>
  )
}

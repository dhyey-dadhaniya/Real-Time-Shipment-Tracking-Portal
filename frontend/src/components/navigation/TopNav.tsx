import { useMemo, useState } from 'react'
import { Bell, Moon, Search, Sun } from 'lucide-react'
import { Button } from '../ui/Button'
import { Dropdown } from '../ui/Dropdown'
import { Input } from '../ui/Input'
import { useUiStore } from '../../store/uiStore'

export function TopNav() {
  const [notifOpen, setNotifOpen] = useState(false)
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)

  const nextTheme = useMemo(() => {
    if (theme === 'light') return 'dark'
    if (theme === 'dark') return 'system'
    return 'light'
  }, [theme])

  return (
    <div className="sticky top-0 z-30 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg))]/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-xl items-center gap-2">
          <div className="relative w-full">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted))]"
            />
            <Input
              placeholder="Search shipments, carriers, orders…"
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(nextTheme)}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-[rgb(var(--primary-2))]" />
            </Button>
            <Dropdown open={notifOpen} onClose={() => setNotifOpen(false)}>
              <div className="p-4">
                <div className="text-sm font-semibold">Notifications</div>
                <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                  Latest activity (dummy data)
                </div>
              </div>
              <div className="divide-y divide-[rgb(var(--border))]">
                {[
                  'Shipment SHP-102 moved to IN_TRANSIT',
                  'New bid received on LOAD-77',
                  'Carrier “NorthStar Logistics” is now Active',
                ].map((t) => (
                  <div key={t} className="px-4 py-3 text-sm">
                    {t}
                  </div>
                ))}
              </div>
              <div className="p-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => setNotifOpen(false)}
                >
                  Close
                </Button>
              </div>
            </Dropdown>
          </div>

          <div className="ml-2 flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <div className="text-sm font-semibold">Shipper Admin</div>
              <div className="text-xs text-[rgb(var(--muted))]">Bengaluru</div>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-black/5 text-sm font-semibold dark:bg-white/10">
              SA
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


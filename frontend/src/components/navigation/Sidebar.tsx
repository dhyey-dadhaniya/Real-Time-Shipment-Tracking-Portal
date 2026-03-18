import { NavLink } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { navItems } from './navItems'
import { useUiStore } from '../../store/uiStore'
import { Button } from '../ui/Button'

function cx({ isActive }: { isActive: boolean }) {
  return [
    'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-[rgb(var(--primary))]/10 text-[rgb(var(--text))]'
      : 'text-[rgb(var(--muted))] hover:bg-black/5 hover:text-[rgb(var(--text))] dark:hover:bg-white/5',
  ].join(' ')
}

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggle = useUiStore((s) => s.toggleSidebar)

  return (
    <aside
      className={[
        'fixed inset-y-0 left-0 z-40 hidden border-r border-[rgb(var(--border))] bg-[rgb(var(--card))] lg:flex',
        'transition-[width] duration-200',
        collapsed ? 'w-20' : 'w-72',
      ].join(' ')}
    >
      <div className="flex w-full flex-col px-3 py-4">
        <div className="flex items-center justify-between gap-3 px-2">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--primary-2))] text-white">
              <span className="text-sm font-semibold">ITX</span>
            </div>
            {!collapsed ? (
              <div className="leading-tight">
                <div className="text-sm font-semibold">Infotact Logistics</div>
                <div className="text-xs text-[rgb(var(--muted))]">
                  Shipment Control
                </div>
              </div>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </Button>
        </div>

        <div className="mt-6 flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink key={item.to} to={item.to} className={cx} end>
                <Icon size={18} />
                {!collapsed ? <span>{item.label}</span> : null}
              </NavLink>
            )
          })}
        </div>

        {!collapsed ? (
          <div className="mt-4 rounded-2xl border border-[rgb(var(--border))] bg-gradient-to-br from-black/5 to-transparent p-4 text-xs text-[rgb(var(--muted))] dark:from-white/5">
            Tip: Open <span className="font-medium">Real-time Tracking</span> to
            see simulated WebSocket location updates.
          </div>
        ) : null}
      </div>
    </aside>
  )
}


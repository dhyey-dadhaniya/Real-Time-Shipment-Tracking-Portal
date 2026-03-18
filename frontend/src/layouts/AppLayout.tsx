import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/navigation/Sidebar'
import { TopNav } from '../components/navigation/TopNav'
import { useUiStore } from '../store/uiStore'

export function AppLayout() {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed)

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      <Sidebar />
      <div
        className={[
          'min-h-screen transition-[padding] duration-200',
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72',
        ].join(' ')}
      >
        <TopNav />
        <main className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}


import { Button } from '@/components/ui/Button'
import { DashboardKpiCards, DashboardRecentTable } from '@/components/features/dashboard'
import { useAuth } from '@/contexts/auth-context'
import { useDashboardPage } from '@/hooks/dashboard/useDashboardPage'

export function DashboardPage() {
  const { hasRole } = useAuth()
  const { dashboard, refetch } = useDashboardPage()

  if (!hasRole('SHIPPER')) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-4">
        <div className="text-xl font-semibold">Dashboard</div>
        <p className="text-sm text-[rgb(var(--muted))]">
          This overview is for shippers. Sign in as a <strong>SHIPPER</strong> to see KPIs and recent
          activity, or use <strong>Marketplace</strong> / <strong>Carrier Management</strong> for carrier
          tools.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xl font-semibold">Dashboard</div>
          <div className="mt-1 text-sm text-[rgb(var(--muted))]">
            Summary of your posted shipments and their status.
          </div>
        </div>
        <Button size="sm" variant="secondary" onClick={() => void refetch()} isLoading={dashboard.loading}>
          Refresh
        </Button>
      </div>

      {dashboard.error ? (
        <div className="card p-4 text-sm text-rose-600 dark:text-rose-300">{dashboard.error}</div>
      ) : null}

      <DashboardKpiCards kpis={dashboard.data?.kpis} loading={dashboard.loading} />

      <DashboardRecentTable rows={dashboard.data?.recentShipments ?? []} loading={dashboard.loading} />
    </div>
  )
}

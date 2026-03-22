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
          The dashboard uses your shipper shipments API. Sign in as a <strong>SHIPPER</strong> to see
          KPIs, or open <strong>Marketplace</strong> / <strong>Carriers</strong> for carrier flows.
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
            Data from <code className="text-xs">GET /api/shipments</code> (Spring Boot).
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

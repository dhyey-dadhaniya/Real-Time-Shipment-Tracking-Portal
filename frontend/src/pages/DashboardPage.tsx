import { useEffect } from 'react'
import { DollarSign, Package, Truck, Waves } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Table, TBody, TD, TH, THead } from '../components/ui/Table'
import { Badge } from '../components/ui/Badge'
import { MiniBarChart } from '../components/charts/MiniChart'
import { useDataStore } from '../store/dataStore'
import type { ShipmentStatus } from '../models'

function statusTone(status: ShipmentStatus) {
  switch (status) {
    case 'DELIVERED':
      return 'success' as const
    case 'IN_TRANSIT':
      return 'info' as const
    case 'AWAITING_PICKUP':
      return 'warning' as const
    default:
      return 'neutral' as const
  }
}

export function DashboardPage() {
  const dashboard = useDataStore((s) => s.dashboard)
  const loadDashboard = useDataStore((s) => s.loadDashboard)

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  const kpis = dashboard.data?.kpis

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div>
        <div className="text-xl font-semibold">Dashboard</div>
        <div className="mt-1 text-sm text-[rgb(var(--muted))]">
          Operational overview with dummy data (SaaS-style logistics panel).
        </div>
      </div>

      {dashboard.error ? (
        <div className="card p-4 text-sm text-rose-600 dark:text-rose-300">
          {dashboard.error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader
            title="Total Orders"
            subtitle={dashboard.loading ? 'Loading…' : 'Last 7 days'}
            right={<Package size={18} className="text-[rgb(var(--muted))]" />}
          />
          <CardBody>
            <div className="text-2xl font-semibold">
              {kpis ? kpis.totalOrders : '—'}
            </div>
            <div className="mt-3">
              <MiniBarChart data={dashboard.data?.ordersByDay ?? [0, 0, 0]} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Active Shipments"
            subtitle="Not delivered"
            right={<Waves size={18} className="text-[rgb(var(--muted))]" />}
          />
          <CardBody>
            <div className="text-2xl font-semibold">
              {kpis ? kpis.activeShipments : '—'}
            </div>
            <div className="mt-2 text-sm text-[rgb(var(--muted))]">
              Tracking enabled with WebSocket simulation.
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Vehicles"
            subtitle="Registered carriers"
            right={<Truck size={18} className="text-[rgb(var(--muted))]" />}
          />
          <CardBody>
            <div className="text-2xl font-semibold">
              {kpis ? kpis.vehicles : '—'}
            </div>
            <div className="mt-2 text-sm text-[rgb(var(--muted))]">
              Across active carriers.
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Revenue"
            subtitle="Orders value"
            right={<DollarSign size={18} className="text-[rgb(var(--muted))]" />}
          />
          <CardBody>
            <div className="text-2xl font-semibold">
              {kpis ? `₹${kpis.revenue.toLocaleString()}` : '—'}
            </div>
            <div className="mt-3">
              <MiniBarChart data={dashboard.data?.revenueByDay ?? [0, 0, 0]} />
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Recent Shipments"
          subtitle="Quick view of shipment status"
        />
        <CardBody>
          <Table>
            <THead>
              <tr>
                <TH>Shipment</TH>
                <TH>Route</TH>
                <TH>Weight</TH>
                <TH>Status</TH>
                <TH>Tracking</TH>
              </tr>
            </THead>
            <TBody>
              {(dashboard.data?.recentShipments ?? []).map((s) => (
                <tr key={s.id}>
                  <TD className="font-medium">{s.id}</TD>
                  <TD className="text-[rgb(var(--muted))]">
                    {s.originCity} → {s.destinationCity}
                  </TD>
                  <TD>{s.weightKg} kg</TD>
                  <TD>
                    <Badge tone={statusTone(s.status)}>{s.status}</Badge>
                  </TD>
                  <TD className="text-[rgb(var(--muted))]">{s.trackingCode}</TD>
                </tr>
              ))}
              {dashboard.loading ? (
                <tr>
                  <TD>
                    <span className="text-[rgb(var(--muted))]">Loading…</span>
                  </TD>
                  <TD />
                  <TD />
                  <TD />
                  <TD />
                </tr>
              ) : null}
            </TBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  )
}


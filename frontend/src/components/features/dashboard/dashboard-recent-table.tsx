import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Table, TBody, TD, TH, THead } from '@/components/ui/Table'
import type { DashboardShipmentRow } from '@/utils/dashboard-derive'
import { ShipmentStatusBadge } from './shipment-status-badge'

interface DashboardRecentTableProps {
  rows: DashboardShipmentRow[]
  loading: boolean
}

export function DashboardRecentTable({ rows, loading }: DashboardRecentTableProps) {
  return (
    <Card>
      <CardHeader title="Recent Shipments" subtitle="Your most recently updated loads" />
      <CardBody>
        <Table>
          <THead>
            <tr>
              <TH>ID</TH>
              <TH>Route</TH>
              <TH>Weight</TH>
              <TH>Status</TH>
              <TH>Tracking</TH>
            </tr>
          </THead>
          <TBody>
            {rows.map((s) => (
              <tr key={s.id}>
                <TD className="font-medium">{s.id}</TD>
                <TD className="text-[rgb(var(--muted))]">
                  {s.originCity} → {s.destinationCity}
                </TD>
                <TD>{s.weightKg} kg</TD>
                <TD>
                  <ShipmentStatusBadge status={s.status} />
                </TD>
                <TD className="text-[rgb(var(--muted))]">{s.trackingCode}</TD>
              </tr>
            ))}
            {loading ? (
              <tr>
                <TD colSpan={5} className="text-[rgb(var(--muted))]">
                  Loading…
                </TD>
              </tr>
            ) : null}
            {!loading && rows.length === 0 ? (
              <tr>
                <TD colSpan={5} className="text-[rgb(var(--muted))]">
                  No shipments yet. Post one from Marketplace.
                </TD>
              </tr>
            ) : null}
          </TBody>
        </Table>
      </CardBody>
    </Card>
  )
}

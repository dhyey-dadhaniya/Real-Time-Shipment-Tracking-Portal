import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Table, TBody, TD, TH, THead } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ShipmentStatusBadge } from '@/components/features/dashboard'
import { useCarrierManagementPage } from '@/hooks/carrier-management/useCarrierManagementPage'
import { useAuth } from '@/contexts/auth-context'
import type { ShipmentStatusApi } from '@/types'

function nextActions(status: ShipmentStatusApi): ShipmentStatusApi[] {
  if (status === 'AWAITING_PICKUP') return ['IN_TRANSIT']
  if (status === 'IN_TRANSIT') return ['DELIVERED']
  return []
}

export function CarrierManagementPage() {
  const { hasRole } = useAuth()
  const c = useCarrierManagementPage()

  if (!hasRole('CARRIER')) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-4">
        <div className="text-xl font-semibold">Carrier assignments</div>
        <p className="text-sm text-[rgb(var(--muted))]">
          Manage jobs assigned to you and move shipments through pickup, in transit, and delivered. Sign in
          as a <strong>CARRIER</strong>.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div>
        <div className="text-xl font-semibold">Carrier management</div>
        <div className="mt-1 text-sm text-[rgb(var(--muted))]">
          Update status as you progress through each assigned shipment.
        </div>
      </div>

      <Card>
        <CardHeader
          title="My assigned shipments"
          subtitle="Jobs currently assigned to your account"
          right={
            <Button size="sm" variant="secondary" onClick={() => void c.refetch()} isLoading={c.loading}>
              Refresh
            </Button>
          }
        />
        <CardBody>
          {c.error ? (
            <div className="mb-3 text-sm text-rose-600 dark:text-rose-300">{c.error}</div>
          ) : null}

          <Table>
            <THead>
              <tr>
                <TH>ID</TH>
                <TH>Route</TH>
                <TH>Weight</TH>
                <TH>Status</TH>
                <TH>Next step</TH>
              </tr>
            </THead>
            <TBody>
              {c.rows.map((row) => {
                const actions = nextActions(row.status)
                return (
                  <tr key={row.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <TD className="font-medium">{row.id}</TD>
                    <TD className="text-[rgb(var(--muted))]">
                      {row.origin} → {row.destination}
                    </TD>
                    <TD>{row.weightKg} kg</TD>
                    <TD>
                      <ShipmentStatusBadge status={row.status} />
                    </TD>
                    <TD>
                      <div className="flex flex-wrap gap-2">
                        {actions.map((st) => (
                          <Button
                            key={st}
                            size="sm"
                            variant="secondary"
                            isLoading={c.pendingId === row.id && c.statusUpdating}
                            onClick={() => c.updateStatus(row.id, st)}
                          >
                            Set {st}
                          </Button>
                        ))}
                        {actions.length === 0 ? (
                          <Badge tone="neutral">No transition</Badge>
                        ) : null}
                      </div>
                    </TD>
                  </tr>
                )
              })}
              {c.loading ? (
                <tr>
                  <TD colSpan={5} className="text-[rgb(var(--muted))]">
                    Loading…
                  </TD>
                </tr>
              ) : null}
              {!c.loading && c.rows.length === 0 ? (
                <tr>
                  <TD colSpan={5} className="text-[rgb(var(--muted))]">
                    No assignments yet. Win a bid on the marketplace.
                  </TD>
                </tr>
              ) : null}
            </TBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  )
}

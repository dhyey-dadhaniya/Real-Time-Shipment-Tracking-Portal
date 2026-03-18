import { useEffect } from 'react'
import { Pencil, Eye } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Table, TBody, TD, TH, THead } from '../components/ui/Table'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { useDataStore } from '../store/dataStore'

export function CarrierManagementPage() {
  const carriers = useDataStore((s) => s.carriers)
  const loadCarriers = useDataStore((s) => s.loadCarriers)

  useEffect(() => {
    void loadCarriers()
  }, [loadCarriers])

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div>
        <div className="text-xl font-semibold">Carrier Management</div>
        <div className="mt-1 text-sm text-[rgb(var(--muted))]">
          Manage carriers, status, and fleet size (dummy data).
        </div>
      </div>

      <Card>
        <CardHeader
          title="Carriers"
          subtitle="View/edit carriers"
          right={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void loadCarriers()}
              isLoading={carriers.loading}
            >
              Refresh
            </Button>
          }
        />
        <CardBody>
          {carriers.error ? (
            <div className="mb-3 text-sm text-rose-600 dark:text-rose-300">
              {carriers.error}
            </div>
          ) : null}

          <Table>
            <THead>
              <tr>
                <TH>Carrier</TH>
                <TH>Status</TH>
                <TH>Vehicles</TH>
                <TH>Actions</TH>
              </tr>
            </THead>
            <TBody>
              {carriers.data.map((c) => (
                <tr key={c.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <TD>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-[rgb(var(--muted))]">{c.id}</div>
                  </TD>
                  <TD>
                    <Badge tone={c.status === 'ACTIVE' ? 'success' : 'neutral'}>
                      {c.status}
                    </Badge>
                  </TD>
                  <TD>{c.vehicleCount}</TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => alert('View (placeholder)')}>
                        <Eye size={16} />
                        View
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => alert('Edit (placeholder)')}>
                        <Pencil size={16} />
                        Edit
                      </Button>
                    </div>
                  </TD>
                </tr>
              ))}
              {carriers.loading ? (
                <tr>
                  <TD className="text-[rgb(var(--muted))]">Loading…</TD>
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


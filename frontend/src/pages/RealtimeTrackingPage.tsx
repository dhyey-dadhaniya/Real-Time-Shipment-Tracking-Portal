import { useMemo } from 'react'
import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ShipmentStatusBadge } from '@/components/features/dashboard'
import { useRealtimeTrackingPage } from '@/hooks/realtime-tracking/useRealtimeTrackingPage'

export function RealtimeTrackingPage() {
  const rt = useRealtimeTrackingPage()

  const selectedShipment = useMemo(
    () => rt.rows.find((s) => s.id === rt.selectedId) ?? null,
    [rt.rows, rt.selectedId],
  )

  if (!rt.isCarrier) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-4">
        <div className="text-xl font-semibold">Real-time tracking</div>
        <p className="text-sm text-[rgb(var(--muted))]">
          WebSocket <code className="text-xs">/ws</code> topic{' '}
          <code className="text-xs">/topic/shipments/&#123;id&#125;</code> plus tracking history. Sign in as
          a <strong>CARRIER</strong>.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xl font-semibold">Real-time tracking</div>
          <div className="mt-1 text-sm text-[rgb(var(--muted))]">
            STOMP over WebSocket (JWT on CONNECT) + REST history. Live points: {rt.liveCount}
          </div>
        </div>
        <Button size="sm" variant="secondary" onClick={() => void rt.refetchHistory()} isLoading={rt.historyLoading}>
          Reload history
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Assigned shipments</div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void rt.refetchShipments()}
              isLoading={rt.shipmentsLoading}
            >
              Refresh
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {rt.rows.map((s) => {
              const active = s.id === rt.selectedId
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => rt.setSelectedId(s.id)}
                  className={[
                    'w-full rounded-2xl border p-3 text-left transition focus-ring',
                    active
                      ? 'border-[rgb(var(--primary-2))] bg-[rgb(var(--primary-2))]/5'
                      : 'border-[rgb(var(--border))] hover:bg-black/5 dark:hover:bg-white/5',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">{s.id}</div>
                    <Badge tone="info">WS</Badge>
                  </div>
                  <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                    {s.origin} → {s.destination}
                  </div>
                  <div className="mt-2">
                    <ShipmentStatusBadge status={s.status} />
                  </div>
                </button>
              )
            })}
            {!rt.rows.length && !rt.shipmentsLoading ? (
              <div className="text-sm text-[rgb(var(--muted))]">No assigned shipments.</div>
            ) : null}
            {rt.shipmentsError ? (
              <div className="text-sm text-rose-600 dark:text-rose-300">{rt.shipmentsError}</div>
            ) : null}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-[rgb(var(--border))] p-4">
            <div className="text-sm font-semibold">
              {selectedShipment ? `Shipment #${selectedShipment.id}` : 'Select a shipment'}
            </div>
            <div className="mt-1 text-xs text-[rgb(var(--muted))]">
              {rt.lastPosition
                ? `Last: ${rt.lastPosition[0].toFixed(4)}, ${rt.lastPosition[1].toFixed(4)}`
                : 'Waiting for tracking points…'}
            </div>
          </div>
          <div className="h-[520px]">
            <MapContainer
              center={rt.lastPosition ?? [12.9716, 77.5946]}
              zoom={6}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {rt.pathPositions.length ? (
                <>
                  <Polyline positions={rt.pathPositions} pathOptions={{ color: '#22d3ee', weight: 4 }} />
                  <Marker position={rt.pathPositions[rt.pathPositions.length - 1]} />
                </>
              ) : (
                <Marker position={[12.9716, 77.5946]} />
              )}
            </MapContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}

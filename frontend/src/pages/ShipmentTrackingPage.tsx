import { useMemo } from 'react'
import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ShipmentStatusBadge } from '@/components/features/dashboard'
import { useShipmentTrackingPage } from '@/hooks/shipment-tracking/useShipmentTrackingPage'
import { useAuth } from '@/contexts/auth-context'

export function ShipmentTrackingPage() {
  const { hasRole } = useAuth()
  const t = useShipmentTrackingPage()

  const polyline = useMemo(
    () => t.trackingPoints.map((p) => [p.lat, p.lng] as [number, number]),
    [t.trackingPoints],
  )
  const lastPoint = t.trackingPoints[t.trackingPoints.length - 1]

  if (!hasRole('SHIPPER')) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-4">
        <div className="text-xl font-semibold">Shipment tracking</div>
        <p className="text-sm text-[rgb(var(--muted))]">
          Map uses <code className="text-xs">GET /api/tracking/shipments/{'{id}'}/history</code>. Sign in as
          a <strong>SHIPPER</strong> (shipment owner).
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div>
        <div className="text-xl font-semibold">Shipment tracking</div>
        <div className="mt-1 text-sm text-[rgb(var(--muted))]">
          Route from <code className="text-xs">GET /api/tracking/shipments/&#123;id&#125;/history</code>.
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Your shipments</div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void t.refetchShipments()}
              isLoading={t.shipmentsLoading}
            >
              Refresh
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {t.shipments.map((s) => {
              const active = s.id === t.selectedId
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => t.setSelectedId(s.id)}
                  className={[
                    'w-full rounded-2xl border p-3 text-left transition focus-ring',
                    active
                      ? 'border-[rgb(var(--primary-2))] bg-[rgb(var(--primary-2))]/5'
                      : 'border-[rgb(var(--border))] hover:bg-black/5 dark:hover:bg-white/5',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{s.id}</div>
                      <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                        {s.origin} → {s.destination}
                      </div>
                    </div>
                    <ShipmentStatusBadge status={s.status} />
                  </div>
                  <div className="mt-2 text-xs text-[rgb(var(--muted))]">Tracking: {s.trackingId}</div>
                </button>
              )
            })}
            {t.shipmentsLoading ? (
              <div className="text-sm text-[rgb(var(--muted))]">Loading…</div>
            ) : null}
            {t.shipmentsError ? (
              <div className="text-sm text-rose-600 dark:text-rose-300">{t.shipmentsError}</div>
            ) : null}
          </div>

        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[rgb(var(--border))] p-4">
            <div>
              <div className="text-sm font-semibold">
                {t.selectedShipment
                  ? `${t.selectedShipment.origin} → ${t.selectedShipment.destination}`
                  : '—'}
              </div>
              <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                {t.selectedShipment
                  ? `Shipment ${t.selectedShipment.id} • ${t.selectedShipment.weightKg} kg`
                  : 'Select a shipment'}
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void t.refetchHistory()}
              isLoading={t.historyLoading}
              disabled={t.selectedId == null}
            >
              Reload route
            </Button>
          </div>

          {t.historyError ? (
            <div className="px-4 py-2 text-sm text-rose-600 dark:text-rose-300">{t.historyError}</div>
          ) : null}

          <div className="h-[520px]">
            <MapContainer
              center={lastPoint ? [lastPoint.lat, lastPoint.lng] : [12.9716, 77.5946]}
              zoom={7}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {polyline.length ? (
                <>
                  <Polyline positions={polyline} pathOptions={{ color: '#0284c7', weight: 4 }} />
                  <Marker position={polyline[0]} />
                  <Marker position={polyline[polyline.length - 1]} />
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

import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useDataStore } from '../store/dataStore'
import type { Shipment, ShipmentStatus } from '../models'

function tone(status: ShipmentStatus) {
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

export function ShipmentTrackingPage() {
  const shipmentsState = useDataStore((s) => s.shipments)
  const loadShipments = useDataStore((s) => s.loadShipments)
  const trackingByShipmentId = useDataStore((s) => s.trackingByShipmentId)
  const loadTracking = useDataStore((s) => s.loadTracking)

  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    void loadShipments()
  }, [loadShipments])

  useEffect(() => {
    const first = shipmentsState.data[0]?.id
    if (!selectedId && first) setSelectedId(first)
  }, [selectedId, shipmentsState.data])

  useEffect(() => {
    if (!selectedId) return
    void loadTracking(selectedId)
  }, [loadTracking, selectedId])

  const selectedShipment = useMemo<Shipment | null>(() => {
    if (!selectedId) return null
    return shipmentsState.data.find((s) => s.id === selectedId) ?? null
  }, [selectedId, shipmentsState.data])

  const tracking = selectedId ? trackingByShipmentId[selectedId]?.data ?? [] : []
  const polyline = tracking.map((p) => [p.lat, p.lng] as [number, number])
  const lastPoint = tracking[tracking.length - 1]

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div>
        <div className="text-xl font-semibold">Shipment Tracking</div>
        <div className="mt-1 text-sm text-[rgb(var(--muted))]">
          Map view with markers and a highlighted route (dummy + mocked API).
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Shipments</div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void loadShipments()}
              isLoading={shipmentsState.loading}
            >
              Refresh
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {shipmentsState.data.map((s) => {
              const active = s.id === selectedId
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
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
                        {s.originCity} → {s.destinationCity}
                      </div>
                    </div>
                    <Badge tone={tone(s.status)}>{s.status}</Badge>
                  </div>
                  <div className="mt-2 text-xs text-[rgb(var(--muted))]">
                    Tracking: {s.trackingCode}
                  </div>
                </button>
              )
            })}
            {shipmentsState.loading ? (
              <div className="text-sm text-[rgb(var(--muted))]">Loading…</div>
            ) : null}
            {shipmentsState.error ? (
              <div className="text-sm text-rose-600 dark:text-rose-300">
                {shipmentsState.error}
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[rgb(var(--border))] p-4">
            <div>
              <div className="text-sm font-semibold">
                {selectedShipment ? `${selectedShipment.originCity} → ${selectedShipment.destinationCity}` : '—'}
              </div>
              <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                {selectedShipment ? `Shipment ${selectedShipment.id} • ${selectedShipment.weightKg} kg` : 'Select a shipment'}
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => selectedId && void loadTracking(selectedId)}
              isLoading={selectedId ? trackingByShipmentId[selectedId]?.loading : false}
              disabled={!selectedId}
            >
              Reload route
            </Button>
          </div>

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


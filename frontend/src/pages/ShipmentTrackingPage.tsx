import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ShipmentStatusBadge } from '@/components/features/dashboard'
import { useShipmentTrackingPage } from '@/hooks/shipment-tracking/useShipmentTrackingPage'
import { useAuth } from '@/contexts/auth-context'
import { geocodePlace } from '@/utils/geocode'

/** Neutral India overview when there is nothing to fit (no GPS, geocode pending/failed). */
const MAP_FALLBACK_CENTER: [number, number] = [20.5937, 78.9629]
const MAP_FALLBACK_ZOOM = 5

function MapFitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap()
  const key = useMemo(
    () => positions.map((p) => `${p[0].toFixed(5)},${p[1].toFixed(5)}`).join('|'),
    [positions],
  )

  useEffect(() => {
    if (positions.length >= 2) {
      const b = L.latLngBounds(positions)
      if (b.isValid()) {
        map.fitBounds(b, { padding: [48, 48], maxZoom: 12 })
        return
      }
    }
    if (positions.length === 1) {
      map.setView(positions[0], 9)
      return
    }
    map.setView(MAP_FALLBACK_CENTER, MAP_FALLBACK_ZOOM)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- positions fingerprinted in `key`
  }, [map, key])

  return null
}

export function ShipmentTrackingPage() {
  const { hasRole } = useAuth()
  const t = useShipmentTrackingPage()

  /** Avoid showing the previous shipment's GPS trail while the new history request is in flight. */
  const gpsPoints = t.historyLoading ? [] : t.trackingPoints
  const polyline = useMemo(
    () => gpsPoints.map((p) => [p.lat, p.lng] as [number, number]),
    [gpsPoints],
  )

  const [approxRoute, setApproxRoute] = useState<[number, number][]>([])
  const [geocodeLoading, setGeocodeLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    const ship = t.selectedShipment

    if (!ship || polyline.length > 0) {
      setApproxRoute([])
      setGeocodeLoading(false)
      return
    }

    setGeocodeLoading(true)
    ;(async () => {
      try {
        const [o, d] = await Promise.all([
          geocodePlace(`${ship.origin}, India`),
          geocodePlace(`${ship.destination}, India`),
        ])
        if (cancelled) return
        const pts: [number, number][] = []
        if (o) pts.push([o.lat, o.lng])
        if (d) pts.push([d.lat, d.lng])
        setApproxRoute(pts)
      } catch {
        if (!cancelled) setApproxRoute([])
      } finally {
        if (!cancelled) setGeocodeLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [t.selectedShipment?.id, t.selectedShipment?.origin, t.selectedShipment?.destination, polyline.length])

  const fitPositions = useMemo(() => {
    if (polyline.length > 0) return polyline
    return approxRoute
  }, [polyline, approxRoute])

  const mapBusy = t.historyLoading || (polyline.length === 0 && geocodeLoading)

  if (!hasRole('SHIPPER')) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-4">
        <div className="text-xl font-semibold">Shipment tracking</div>
        <p className="text-sm text-[rgb(var(--muted))]">
          Follow carrier GPS updates on a map for shipments you created. Sign in as a{' '}
          <strong>SHIPPER</strong> (shipment owner).
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div>
        <div className="text-xl font-semibold">Shipment tracking</div>
        <div className="mt-1 text-sm text-[rgb(var(--muted))]">
          The line on the map reflects checkpoints your carrier has reported. If none are available yet, we
          show an estimated line between origin and destination using map search (OpenStreetMap data).
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
            <div className="flex items-center gap-2">
              {mapBusy ? (
                <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-medium text-[rgb(var(--muted))] dark:bg-white/10">
                  Loading map…
                </span>
              ) : null}
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
          </div>

          {t.historyError ? (
            <div className="px-4 py-2 text-sm text-rose-600 dark:text-rose-300">{t.historyError}</div>
          ) : null}

          {polyline.length === 0 && approxRoute.length > 0 ? (
            <div className="border-b border-[rgb(var(--border))] px-4 py-2 text-xs text-[rgb(var(--muted))]">
              Dashed line: approximate origin → destination (no carrier GPS points yet). Solid line appears when
              tracking updates exist.
            </div>
          ) : null}

          <div className="h-[520px]">
            <MapContainer
              center={MAP_FALLBACK_CENTER}
              zoom={MAP_FALLBACK_ZOOM}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapFitBounds positions={fitPositions} />

              {polyline.length > 0 ? (
                <>
                  <Polyline positions={polyline} pathOptions={{ color: '#0284c7', weight: 4 }} />
                  <Marker position={polyline[0]} />
                  <Marker position={polyline[polyline.length - 1]} />
                </>
              ) : approxRoute.length > 0 ? (
                <>
                  {approxRoute.length >= 2 ? (
                    <Polyline
                      positions={approxRoute}
                      pathOptions={{ color: '#64748b', weight: 3, dashArray: '10 14' }}
                    />
                  ) : null}
                  {approxRoute.map((pos, i) => (
                    <Marker key={`${i}-${pos[0]}-${pos[1]}`} position={pos} />
                  ))}
                </>
              ) : null}
            </MapContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}

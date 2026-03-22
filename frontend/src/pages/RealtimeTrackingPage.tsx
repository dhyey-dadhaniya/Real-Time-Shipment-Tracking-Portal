import { useEffect, useMemo } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ShipmentStatusBadge } from '@/components/features/dashboard'
import {
  useRealtimeTrackingPage,
  type WsConnectionStatus,
} from '@/hooks/realtime-tracking/useRealtimeTrackingPage'

const MAP_FALLBACK: [number, number] = [20.5937, 78.9629]
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
    map.setView(MAP_FALLBACK, MAP_FALLBACK_ZOOM)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- positions fingerprinted in `key`
  }, [map, key])

  return null
}

function wsBadgeTone(status: WsConnectionStatus) {
  if (status === 'live') return 'success' as const
  if (status === 'connecting') return 'info' as const
  if (status === 'reconnecting') return 'warning' as const
  if (status === 'error') return 'danger' as const
  return 'neutral' as const
}

function wsBadgeLabel(status: WsConnectionStatus) {
  if (status === 'live') return 'Live'
  if (status === 'connecting') return 'Connecting…'
  if (status === 'reconnecting') return 'Reconnecting…'
  if (status === 'error') return 'Connection error'
  return 'Idle'
}

export function RealtimeTrackingPage() {
  const rt = useRealtimeTrackingPage()

  if (!rt.isCarrier) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-4">
        <div className="text-xl font-semibold">Real-time tracking</div>
        <p className="text-sm text-[rgb(var(--muted))]">
          See live vehicle positions on a map for shipments assigned to you. Sign in as a{' '}
          <strong>CARRIER</strong> to use this page.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xl font-semibold">Real-time tracking</div>
            <Badge tone={wsBadgeTone(rt.wsState.status)}>{wsBadgeLabel(rt.wsState.status)}</Badge>
          </div>
          <div className="mt-1 text-sm text-[rgb(var(--muted))]">
            Live updates merge with your saved route. Showing {rt.liveCount} new point
            {rt.liveCount === 1 ? '' : 's'} in this session.
            {rt.wsState.detail ? (
              <span className="mt-1 block text-xs opacity-90">{rt.wsState.detail}</span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => rt.reconnectWebSocket()}>
            Reconnect live feed
          </Button>
          <Button size="sm" variant="secondary" onClick={() => void rt.refetchHistory()} isLoading={rt.historyLoading}>
            Reload history
          </Button>
        </div>
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
                    <Badge tone="info">Live</Badge>
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
              {rt.selectedShipment ? `Shipment #${rt.selectedShipment.id}` : 'Select a shipment'}
            </div>
            <div className="mt-1 text-xs text-[rgb(var(--muted))]">
              {rt.historyError ? (
                <span className="text-rose-600 dark:text-rose-300">{rt.historyError}</span>
              ) : rt.mapResolving ? (
                'Loading route (history or geocode)…'
              ) : rt.lastPosition ? (
                <>
                  {rt.mapPathIsApproximate ? (
                    <span className="block text-amber-700 dark:text-amber-300">
                      Approximate route (no GPS points yet). Last:{' '}
                    </span>
                  ) : null}
                  Last: {rt.lastPosition[0].toFixed(4)}, {rt.lastPosition[1].toFixed(4)}
                </>
              ) : (
                'No GPS data and geocoding did not resolve origin/destination.'
              )}
            </div>
          </div>
          <div className="h-[520px]">
            <MapContainer
              center={MAP_FALLBACK}
              zoom={MAP_FALLBACK_ZOOM}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapFitBounds positions={rt.pathPositions} />
              {rt.pathPositions.length ? (
                <>
                  <Polyline
                    positions={rt.pathPositions}
                    pathOptions={{
                      color: '#22d3ee',
                      weight: 4,
                      dashArray: rt.mapPathIsApproximate ? '10 8' : undefined,
                      opacity: rt.mapPathIsApproximate ? 0.85 : 1,
                    }}
                  />
                  <Marker position={rt.pathPositions[rt.pathPositions.length - 1]} />
                </>
              ) : null}
            </MapContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}

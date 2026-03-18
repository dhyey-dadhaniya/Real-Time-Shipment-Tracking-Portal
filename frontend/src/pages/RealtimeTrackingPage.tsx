import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { useDataStore } from '../store/dataStore'

type LivePoint = { id: string; lat: number; lng: number; route: [number, number][]; idx: number }

const cityCoords: Record<string, [number, number]> = {
  Bengaluru: [12.9716, 77.5946],
  Mysuru: [12.2958, 76.6394],
  Chennai: [13.0827, 80.2707],
  Hyderabad: [17.385, 78.4867],
  Hubballi: [15.3647, 75.124],
  Mangaluru: [12.9141, 74.856],
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function buildRoute(from: [number, number], to: [number, number]) {
  const steps = 18
  const pts: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    // add slight wobble for realism
    const wobble = Math.sin(t * Math.PI * 3) * 0.08
    pts.push([lerp(from[0], to[0], t) + wobble, lerp(from[1], to[1], t) - wobble])
  }
  return pts
}

export function RealtimeTrackingPage() {
  const shipments = useDataStore((s) => s.shipments)
  const loadShipments = useDataStore((s) => s.loadShipments)

  const [running, setRunning] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [live, setLive] = useState<LivePoint[]>([])
  const timer = useRef<number | null>(null)

  useEffect(() => {
    void loadShipments()
  }, [loadShipments])

  useEffect(() => {
    if (!shipments.data.length) return
    const seed = shipments.data
      .filter((s) => s.status === 'IN_TRANSIT' || s.status === 'AWAITING_PICKUP')
      .slice(0, 3)
      .map((s) => {
        const from = cityCoords[s.originCity] ?? cityCoords.Bengaluru
        const to = cityCoords[s.destinationCity] ?? cityCoords.Chennai
        const route = buildRoute(from, to)
        return { id: s.id, lat: route[0][0], lng: route[0][1], route, idx: 0 }
      })
    setLive(seed)
    setSelectedId((prev) => prev ?? seed[0]?.id ?? null)
  }, [shipments.data])

  useEffect(() => {
    if (!running) return
    timer.current = window.setInterval(() => {
      setLive((points) =>
        points.map((p) => {
          const nextIdx = (p.idx + 1) % p.route.length
          const [lat, lng] = p.route[nextIdx]
          return { ...p, idx: nextIdx, lat, lng }
        }),
      )
    }, 2000)

    return () => {
      if (timer.current) window.clearInterval(timer.current)
    }
  }, [running])

  const selected = useMemo(() => live.find((p) => p.id === selectedId) ?? null, [live, selectedId])
  const selectedRoute = selected?.route ?? []

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-semibold">Real-time Tracking</div>
          <div className="mt-1 text-sm text-[rgb(var(--muted))]">
            WebSocket simulation: updates every 2 seconds (client-side).
          </div>
        </div>
        <Button variant={running ? 'secondary' : 'primary'} onClick={() => setRunning((v) => !v)}>
          {running ? 'Pause' : 'Resume'}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card className="p-4">
          <div className="text-sm font-semibold">Live Shipments</div>
          <div className="mt-3 space-y-2">
            {live.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={[
                  'w-full rounded-2xl border p-3 text-left transition focus-ring',
                  p.id === selectedId
                    ? 'border-[rgb(var(--primary-2))] bg-[rgb(var(--primary-2))]/5'
                    : 'border-[rgb(var(--border))] hover:bg-black/5 dark:hover:bg-white/5',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">{p.id}</div>
                  <Badge tone={running ? 'info' : 'neutral'}>
                    {running ? 'LIVE' : 'PAUSED'}
                  </Badge>
                </div>
                <div className="mt-2 text-xs text-[rgb(var(--muted))]">
                  Lat {p.lat.toFixed(4)} • Lng {p.lng.toFixed(4)}
                </div>
              </button>
            ))}
            {!live.length ? (
              <div className="text-sm text-[rgb(var(--muted))]">
                Loading shipments…
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-[rgb(var(--border))] p-4">
            <div className="text-sm font-semibold">
              {selected ? `Route for ${selected.id}` : 'Select a live shipment'}
            </div>
            <div className="mt-1 text-xs text-[rgb(var(--muted))]">
              Marker moves along the polyline to simulate telematics pings.
            </div>
          </div>
          <div className="h-[520px]">
            <MapContainer
              center={selected ? [selected.lat, selected.lng] : [12.9716, 77.5946]}
              zoom={6}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {selectedRoute.length ? (
                <Polyline positions={selectedRoute} pathOptions={{ color: '#22d3ee', weight: 4 }} />
              ) : null}

              {live.map((p) => (
                <Marker key={p.id} position={[p.lat, p.lng]} />
              ))}
            </MapContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}


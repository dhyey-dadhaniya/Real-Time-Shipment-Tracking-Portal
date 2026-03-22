import { Client, type IMessage } from '@stomp/stompjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import { API_ENDPOINTS } from '@/api/endpoints'
import { Card } from '@/components/ui/Card'
import { ShipmentStatusBadge } from '@/components/features/dashboard'
import { ROUTES } from '@/constants/routes'
import type { ShipmentResponseDto, TrackingUpdateResponseDto } from '@/types'
import { geocodePlace } from '@/utils/geocode'
import { resolveApiUrl } from '@/utils/resolveApiUrl'

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

function num(v: string | number): number {
  return typeof v === 'number' ? v : Number(v)
}

function mergeHistoryPoints(
  rest: TrackingUpdateResponseDto[],
  live: TrackingUpdateResponseDto[],
): [number, number][] {
  const merged = [...rest, ...live]
  merged.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
  return merged.map((p) => [num(p.latitude), num(p.longitude)] as [number, number])
}

async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  let parsed: unknown
  if (text) {
    try {
      parsed = JSON.parse(text) as unknown
    } catch {
      parsed = undefined
    }
  }
  if (!res.ok) {
    const msg =
      parsed && typeof parsed === 'object' && parsed !== null && 'error' in parsed
        ? String((parsed as { error?: string }).error ?? text)
        : text || res.statusText
    throw new Error(msg)
  }
  if (parsed === undefined && text) {
    throw new Error('Invalid response from server')
  }
  return parsed as T
}

export function PublicTrackPage() {
  const { trackingId: trackingIdParam } = useParams<{ trackingId: string }>()
  const trackingId = trackingIdParam ? decodeURIComponent(trackingIdParam) : ''

  const [shipment, setShipment] = useState<ShipmentResponseDto | null>(null)
  const [history, setHistory] = useState<TrackingUpdateResponseDto[]>([])
  const [live, setLive] = useState<TrackingUpdateResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [approxRoute, setApproxRoute] = useState<[number, number][]>([])
  const [geocodeLoading, setGeocodeLoading] = useState(false)
  const [wsNote, setWsNote] = useState<string | null>(null)

  const intentionalCloseRef = useRef(false)

  useEffect(() => {
    intentionalCloseRef.current = false
    setLive([])
    setWsNote(null)
    if (!trackingId.trim()) {
      setShipment(null)
      setHistory([])
      setLoading(false)
      setError('Missing tracking ID.')
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setShipment(null)
    setHistory([])

    ;(async () => {
      try {
        const [sRes, hRes] = await Promise.all([
          fetch(resolveApiUrl(API_ENDPOINTS.SHIPMENTS.TRACK(trackingId))),
          fetch(resolveApiUrl(API_ENDPOINTS.SHIPMENTS.TRACK_HISTORY(trackingId))),
        ])
        const sJson = await readJson<ShipmentResponseDto>(sRes)
        const hJson = await readJson<TrackingUpdateResponseDto[]>(hRes)
        if (cancelled) return
        setShipment(sJson)
        setHistory(Array.isArray(hJson) ? hJson : [])
      } catch (e) {
        if (!cancelled) {
          setShipment(null)
          setHistory([])
          setError(e instanceof Error ? e.message : 'Failed to load shipment.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [trackingId])

  const gpsPath = useMemo(() => mergeHistoryPoints(history, live), [history, live])

  useEffect(() => {
    let cancelled = false
    if (!shipment || gpsPath.length > 0) {
      setApproxRoute([])
      setGeocodeLoading(false)
      return
    }
    setGeocodeLoading(true)
    ;(async () => {
      try {
        const [o, d] = await Promise.all([
          geocodePlace(`${shipment.origin}, India`),
          geocodePlace(`${shipment.destination}, India`),
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
  }, [shipment?.id, shipment?.origin, shipment?.destination, gpsPath.length])

  const pathPositions = useMemo(() => {
    if (gpsPath.length > 0) return gpsPath
    return approxRoute
  }, [gpsPath, approxRoute])

  const mapApprox = gpsPath.length === 0 && approxRoute.length > 0
  const mapBusy = loading || (gpsPath.length === 0 && geocodeLoading)
  const last = pathPositions[pathPositions.length - 1] ?? null

  useEffect(() => {
    if (!shipment?.id) return

    const wsHost = window.location.host
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${wsHost}/ws`
    const client = new Client({
      brokerURL: wsUrl,
      connectionTimeout: 15000,
      reconnectDelay: 4000,
      onConnect: () => {
        setWsNote('Live updates connected.')
        client.subscribe(`/topic/shipments/${shipment.id}`, (message: IMessage) => {
          try {
            const body = JSON.parse(message.body) as TrackingUpdateResponseDto
            setLive((prev) => [...prev.slice(-120), body])
          } catch {
            /* ignore */
          }
        })
      },
      onDisconnect: () => {
        if (!intentionalCloseRef.current) setWsNote('Live connection closed; map still shows last loaded data.')
      },
      onStompError: () => setWsNote('Live updates are not available. The map still shows your saved route.'),
      onWebSocketError: () =>
        setWsNote('Live updates are not available right now. The map still shows your saved route.'),
    })

    client.activate()
    return () => {
      intentionalCloseRef.current = true
      void client.deactivate()
    }
  }, [shipment?.id])

  return (
    <div className="min-h-screen bg-[rgb(var(--surface-1))] text-[rgb(var(--text))]">
      <header className="border-b border-[rgb(var(--border))] bg-[rgb(var(--surface-2))] px-4 py-3">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold">Shipment tracking</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link className="text-[rgb(var(--primary-2))] underline" to={ROUTES.PUBLIC_TRACK}>
              New lookup
            </Link>
            <Link className="text-[rgb(var(--muted))] underline" to={ROUTES.LOGIN}>
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-6">
        {error ? (
          <Card className="p-4">
            <div className="text-sm font-medium text-rose-600 dark:text-rose-300">{error}</div>
            <p className="mt-2 text-sm text-[rgb(var(--muted))]">
              Check the tracking ID and try again, or ask the shipper for the correct link.
            </p>
          </Card>
        ) : null}

        {shipment ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
            <Card className="p-4">
              <div className="text-xs text-[rgb(var(--muted))]">Tracking ID</div>
              <div className="mt-1 font-mono text-sm">{shipment.trackingId}</div>
              <div className="mt-3 text-xs text-[rgb(var(--muted))]">Route</div>
              <div className="mt-1 text-sm">
                {shipment.origin} → {shipment.destination}
              </div>
              <div className="mt-3">
                <ShipmentStatusBadge status={shipment.status} />
              </div>
              {wsNote ? <div className="mt-3 text-xs text-[rgb(var(--muted))]">{wsNote}</div> : null}
            </Card>

            <Card className="overflow-hidden">
              <div className="border-b border-[rgb(var(--border))] p-4">
                <div className="text-sm font-semibold">Map</div>
                <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                  {mapBusy
                    ? 'Loading route…'
                    : last
                      ? mapApprox
                        ? `Approximate route (dashed). Reference: ${last[0].toFixed(4)}, ${last[1].toFixed(4)}`
                        : `Last position: ${last[0].toFixed(4)}, ${last[1].toFixed(4)}`
                      : 'No GPS points yet and geocoding did not resolve the cities.'}
                </div>
              </div>
              <div className="h-[480px]">
                <MapContainer
                  center={MAP_FALLBACK}
                  zoom={MAP_FALLBACK_ZOOM}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapFitBounds positions={pathPositions} />
                  {pathPositions.length ? (
                    <>
                      <Polyline
                        positions={pathPositions}
                        pathOptions={{
                          color: '#22d3ee',
                          weight: 4,
                          dashArray: mapApprox ? '10 8' : undefined,
                          opacity: mapApprox ? 0.85 : 1,
                        }}
                      />
                      <Marker position={pathPositions[pathPositions.length - 1]} />
                    </>
                  ) : null}
                </MapContainer>
              </div>
            </Card>
          </div>
        ) : !loading && !error ? (
          <p className="text-sm text-[rgb(var(--muted))]">Enter a tracking ID to continue.</p>
        ) : null}

        {loading ? (
          <div className="text-sm text-[rgb(var(--muted))]">Loading shipment…</div>
        ) : null}
      </main>
    </div>
  )
}

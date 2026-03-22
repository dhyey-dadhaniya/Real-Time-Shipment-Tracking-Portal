import { Client, type IMessage, ReconnectionTimeMode } from '@stomp/stompjs'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { API_ENDPOINTS } from '@/api/endpoints'
import { useAuth } from '@/contexts/auth-context'
import { useAPI } from '@/hooks/useApi'
import type { ShipmentResponseDto, TrackingUpdateResponseDto } from '@/types'
import { geocodePlace } from '@/utils/geocode'

function num(v: string | number): number {
  return typeof v === 'number' ? v : Number(v)
}

function toSortedPath(
  history: TrackingUpdateResponseDto[],
  live: TrackingUpdateResponseDto[],
): [number, number][] {
  const merged = [...(history ?? []), ...live]
  merged.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
  return merged.map((p) => [num(p.latitude), num(p.longitude)] as [number, number])
}

export type WsConnectionStatus = 'idle' | 'connecting' | 'live' | 'reconnecting' | 'error'

export interface WsConnectionState {
  status: WsConnectionStatus
  detail: string | null
}

export function useRealtimeTrackingPage() {
  const { token, hasRole } = useAuth()
  const isCarrier = hasRole('CARRIER')

  const shipments = useAPI<ShipmentResponseDto[]>(API_ENDPOINTS.CARRIER.SHIPMENTS, {
    method: 'GET',
    immediate: isCarrier,
    key: `rt-${isCarrier}`,
  })

  const rows = shipments.data ?? []

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [liveMessages, setLiveMessages] = useState<TrackingUpdateResponseDto[]>([])
  const [wsState, setWsState] = useState<WsConnectionState>({ status: 'idle', detail: null })
  const [wsSessionKey, setWsSessionKey] = useState(0)
  const [approxRoute, setApproxRoute] = useState<[number, number][]>([])
  const [geocodeLoading, setGeocodeLoading] = useState(false)

  const intentionalCloseRef = useRef(false)

  const historyUrl =
    selectedId != null ? API_ENDPOINTS.TRACKING.HISTORY(selectedId) : API_ENDPOINTS.TRACKING.HISTORY(0)

  const history = useAPI<TrackingUpdateResponseDto[]>(historyUrl, {
    method: 'GET',
    immediate: isCarrier && selectedId != null,
    key: `${selectedId}-${isCarrier}`,
  })

  const selectedShipment = useMemo(
    () => rows.find((s) => s.id === selectedId) ?? null,
    [rows, selectedId],
  )

  /**
   * While a new history request is in flight, ignore `history.data` so we never paint the previous
   * shipment's trail. When there are zero GPS rows, we fall back to geocoded origin → destination.
   */
  const trustedHistory = useMemo(() => {
    if (selectedId == null || history.loading) return []
    return history.data ?? []
  }, [selectedId, history.loading, history.data])

  const gpsPath = useMemo(
    () => toSortedPath(trustedHistory, liveMessages),
    [trustedHistory, liveMessages],
  )

  useEffect(() => {
    const first = rows[0]?.id
    if (selectedId == null && first != null) setSelectedId(first)
  }, [selectedId, rows])

  useEffect(() => {
    setLiveMessages([])
  }, [selectedId])

  useEffect(() => {
    let cancelled = false
    if (!selectedShipment || gpsPath.length > 0) {
      setApproxRoute([])
      setGeocodeLoading(false)
      return
    }

    setGeocodeLoading(true)
    ;(async () => {
      try {
        const [o, d] = await Promise.all([
          geocodePlace(`${selectedShipment.origin}, India`),
          geocodePlace(`${selectedShipment.destination}, India`),
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
  }, [selectedShipment?.id, selectedShipment?.origin, selectedShipment?.destination, gpsPath.length])

  const pathPositions = useMemo(() => {
    if (gpsPath.length > 0) return gpsPath
    return approxRoute
  }, [gpsPath, approxRoute])

  const mapPathIsApproximate = gpsPath.length === 0 && approxRoute.length > 0

  useEffect(() => {
    if (!token || selectedId == null || !isCarrier) {
      intentionalCloseRef.current = true
      setWsState({ status: 'idle', detail: null })
      return
    }

    intentionalCloseRef.current = false
    setWsState({ status: 'connecting', detail: 'Connecting to live feed…' })

    const wsHost = window.location.host
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${wsHost}/ws`

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: { Authorization: `Bearer ${token}` },
      connectionTimeout: 15000,
      reconnectDelay: 2500,
      maxReconnectDelay: 60_000,
      reconnectTimeMode: ReconnectionTimeMode.EXPONENTIAL,
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      onConnect: () => {
        setWsState({ status: 'live', detail: 'Receiving live location updates.' })
        client.subscribe(`/topic/shipments/${selectedId}`, (message: IMessage) => {
          try {
            const body = JSON.parse(message.body) as TrackingUpdateResponseDto
            setLiveMessages((prev) => [...prev.slice(-120), body])
          } catch {
            /* ignore malformed */
          }
        })
      },
      onDisconnect: () => {
        if (intentionalCloseRef.current) {
          setWsState({ status: 'idle', detail: null })
          return
        }
        setWsState({
          status: 'reconnecting',
          detail: 'Connection lost — reconnecting automatically…',
        })
      },
      onStompError: () => {
        setWsState({
          status: 'error',
          detail: 'Live updates hit an error. Try Reconnect live feed.',
        })
      },
      onWebSocketError: () => {
        setWsState((prev) =>
          prev.status === 'live'
            ? { status: 'reconnecting', detail: 'Network issue — reconnecting…' }
            : {
                status: 'error',
                detail: 'Could not start live updates. Check your connection or use Reconnect live feed.',
              },
        )
      },
    })

    client.activate()

    return () => {
      intentionalCloseRef.current = true
      void client.deactivate()
    }
  }, [isCarrier, selectedId, token, wsSessionKey])

  const lastPosition = pathPositions[pathPositions.length - 1] ?? null

  const refetchHistory = useCallback(() => void history.refetch(), [history])

  const reconnectWebSocket = useCallback(() => {
    intentionalCloseRef.current = false
    setWsState({ status: 'connecting', detail: 'Reconnecting now…' })
    setWsSessionKey((k) => k + 1)
  }, [])

  return {
    isCarrier,
    rows,
    shipmentsLoading: shipments.loading,
    shipmentsError: shipments.error?.message ?? null,
    refetchShipments: shipments.refetch,
    selectedId,
    setSelectedId,
    selectedShipment,
    pathPositions,
    mapPathIsApproximate,
    lastPosition,
    historyLoading: history.loading,
    historyError: history.error?.message ?? null,
    liveCount: liveMessages.length,
    refetchHistory,
    wsState,
    reconnectWebSocket,
    mapResolving: history.loading || (gpsPath.length === 0 && geocodeLoading),
  }
}

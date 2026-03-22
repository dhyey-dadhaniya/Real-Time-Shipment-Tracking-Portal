import { Client, type IMessage } from '@stomp/stompjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { API_ENDPOINTS } from '@/api/endpoints'
import { useAuth } from '@/contexts/auth-context'
import { useAPI } from '@/hooks/useApi'
import type { ShipmentResponseDto, TrackingUpdateResponseDto } from '@/types'

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

export function useRealtimeTrackingPage() {
  const { token, hasRole } = useAuth()
  const isCarrier = hasRole('CARRIER')

  const shipments = useAPI<ShipmentResponseDto[]>(API_ENDPOINTS.CARRIER.SHIPMENTS, {
    method: 'GET',
    immediate: isCarrier,
    key: `rt-${isCarrier}`,
  })

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [liveMessages, setLiveMessages] = useState<TrackingUpdateResponseDto[]>([])

  const history = useAPI<TrackingUpdateResponseDto[]>(
    () =>
      selectedId != null
        ? API_ENDPOINTS.TRACKING.HISTORY(selectedId)
        : API_ENDPOINTS.TRACKING.HISTORY(0),
    {
      method: 'GET',
      immediate: isCarrier && selectedId != null,
      key: `${selectedId}-${isCarrier}`,
    },
  )

  useEffect(() => {
    const first = shipments.data?.[0]?.id
    if (selectedId == null && first != null) setSelectedId(first)
  }, [selectedId, shipments.data])

  useEffect(() => {
    setLiveMessages([])
  }, [selectedId])

  useEffect(() => {
    if (!token || selectedId == null || !isCarrier) return

    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`
    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        client.subscribe(`/topic/shipments/${selectedId}`, (message: IMessage) => {
          try {
            const body = JSON.parse(message.body) as TrackingUpdateResponseDto
            setLiveMessages((prev) => [...prev.slice(-120), body])
          } catch {
            /* ignore malformed */
          }
        })
      },
    })
    client.activate()
    return () => {
      void client.deactivate()
    }
  }, [isCarrier, selectedId, token])

  const pathPositions = useMemo(
    () => toSortedPath(history.data ?? [], liveMessages),
    [history.data, liveMessages],
  )

  const lastPosition = pathPositions[pathPositions.length - 1] ?? null

  const refetchHistory = useCallback(() => void history.refetch(), [history])

  return {
    isCarrier,
    rows: shipments.data ?? [],
    shipmentsLoading: shipments.loading,
    shipmentsError: shipments.error?.message ?? null,
    refetchShipments: shipments.refetch,
    selectedId,
    setSelectedId,
    pathPositions,
    lastPosition,
    historyLoading: history.loading,
    liveCount: liveMessages.length,
    refetchHistory,
  }
}

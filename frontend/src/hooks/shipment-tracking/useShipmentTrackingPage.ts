import { useEffect, useMemo, useState } from 'react'
import { API_ENDPOINTS } from '@/api/endpoints'
import { useAPI } from '@/hooks/useApi'
import type { ShipmentResponseDto, TrackingUpdateResponseDto } from '@/types'

export interface MapPoint {
  lat: number
  lng: number
  at: string
}

function toMapPoints(history: TrackingUpdateResponseDto[]): MapPoint[] {
  const sorted = [...history].sort(
    (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
  )
  return sorted.map((p) => ({
    lat: Number(p.latitude),
    lng: Number(p.longitude),
    at: p.updatedAt,
  }))
}

export function useShipmentTrackingPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const shipments = useAPI<ShipmentResponseDto[]>(API_ENDPOINTS.SHIPMENTS.LIST)

  const historyUrl =
    selectedId != null ? API_ENDPOINTS.TRACKING.HISTORY(selectedId) : API_ENDPOINTS.TRACKING.HISTORY(0)

  const history = useAPI<TrackingUpdateResponseDto[]>(historyUrl, {
    method: 'GET',
    immediate: selectedId != null,
    key: selectedId,
  })

  useEffect(() => {
    const first = shipments.data?.[0]?.id
    if (selectedId == null && first != null) setSelectedId(first)
  }, [selectedId, shipments.data])

  const selectedShipment = useMemo(() => {
    if (selectedId == null || !shipments.data) return null
    return shipments.data.find((s) => s.id === selectedId) ?? null
  }, [selectedId, shipments.data])

  const trackingPoints = useMemo(
    () => toMapPoints(history.data ?? []),
    [history.data],
  )

  return {
    shipments: shipments.data ?? [],
    shipmentsLoading: shipments.loading,
    shipmentsError: shipments.error?.message ?? null,
    refetchShipments: shipments.refetch,
    selectedId,
    setSelectedId,
    selectedShipment,
    trackingPoints,
    historyLoading: history.loading,
    historyError: history.error?.message ?? null,
    refetchHistory: history.refetch,
  }
}

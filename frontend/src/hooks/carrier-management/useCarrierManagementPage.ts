import { useCallback, useEffect, useRef, useState } from 'react'
import { API_ENDPOINTS } from '@/api/endpoints'
import { useAPI } from '@/hooks/useApi'
import type { ShipmentResponseDto, ShipmentStatusApi, UpdateShipmentStatusRequestDto } from '@/types'

export function useCarrierManagementPage() {
  const list = useAPI<ShipmentResponseDto[]>(API_ENDPOINTS.CARRIER.SHIPMENTS)

  const shipmentIdRef = useRef(0)
  const statusUpdate = useAPI<ShipmentResponseDto>(
    () => API_ENDPOINTS.OPERATIONS.UPDATE_STATUS(shipmentIdRef.current),
    {
      method: 'POST',
      immediate: false,
      showToastOnSuccess: true,
      successMessage: 'Status updated',
      onSuccess: () => void list.refetch(),
    },
  )

  const [pendingId, setPendingId] = useState<number | null>(null)

  useEffect(() => {
    if (!statusUpdate.loading) setPendingId(null)
  }, [statusUpdate.loading])

  const updateStatus = useCallback(
    (shipmentId: number, status: ShipmentStatusApi) => {
      shipmentIdRef.current = shipmentId
      setPendingId(shipmentId)
      const body: UpdateShipmentStatusRequestDto = { status }
      void statusUpdate.execute(body)
    },
    [statusUpdate],
  )

  return {
    rows: list.data ?? [],
    loading: list.loading,
    error: list.error?.message ?? null,
    refetch: list.refetch,
    updateStatus,
    pendingId,
    statusUpdating: statusUpdate.loading,
  }
}

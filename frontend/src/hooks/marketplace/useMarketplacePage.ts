import { useCallback, useRef, useState } from 'react'
import { API_ENDPOINTS } from '@/api/endpoints'
import { useAuth } from '@/contexts/auth-context'
import { useAPI } from '@/hooks/useApi'
import type { BidResponseDto, ShipmentResponseDto } from '@/types'

export function useMarketplacePage() {
  const { hasRole } = useAuth()
  const isCarrier = hasRole('CARRIER')
  const isShipper = hasRole('SHIPPER')

  const [selectedShipmentId, setSelectedShipmentId] = useState<number | null>(null)

  const [loadForm, setLoadForm] = useState({ origin: '', destination: '', weightKg: '' })
  const [bidAmount, setBidAmount] = useState('')

  const marketplace = useAPI<ShipmentResponseDto[]>(API_ENDPOINTS.MARKETPLACE.SHIPMENTS, {
    method: 'GET',
    immediate: isCarrier,
    key: `mkt-${isCarrier}`,
  })

  const myShipments = useAPI<ShipmentResponseDto[]>(API_ENDPOINTS.SHIPMENTS.LIST, {
    method: 'GET',
    immediate: isShipper,
    key: `ship-${isShipper}`,
  })

  const myBids = useAPI<BidResponseDto[]>(API_ENDPOINTS.BIDS.LIST, {
    method: 'GET',
    immediate: isCarrier,
    key: `bids-${isCarrier}`,
  })

  const bidsForShipment = useAPI<BidResponseDto[]>(
    () =>
      selectedShipmentId != null
        ? API_ENDPOINTS.BIDS.FOR_SHIPMENT(selectedShipmentId)
        : '/api/bids/shipment/0',
    {
      method: 'GET',
      immediate: isShipper && selectedShipmentId != null,
      key: selectedShipmentId,
    },
  )

  const createShipment = useAPI<ShipmentResponseDto>(API_ENDPOINTS.SHIPMENTS.CREATE, {
    method: 'POST',
    immediate: false,
    showToastOnSuccess: true,
    successMessage: 'Shipment created',
    onSuccess: () => {
      void myShipments.refetch()
      setLoadForm({ origin: '', destination: '', weightKg: '' })
    },
  })

  const placeBid = useAPI<BidResponseDto>(API_ENDPOINTS.BIDS.CREATE, {
    method: 'POST',
    immediate: false,
    showToastOnSuccess: true,
    successMessage: 'Bid placed',
    onSuccess: () => {
      void marketplace.refetch()
      void myBids.refetch()
    },
  })

  const acceptBidIdRef = useRef(0)
  const acceptBid = useAPI<BidResponseDto>(
    () => API_ENDPOINTS.BIDS.ACCEPT(acceptBidIdRef.current),
    {
      method: 'POST',
      immediate: false,
      showToastOnSuccess: true,
      successMessage: 'Bid accepted',
      onSuccess: () => {
        void myShipments.refetch()
        void bidsForShipment.refetch()
      },
    },
  )

  const onCreateLoad = useCallback(() => {
    const weightKg = Number(loadForm.weightKg)
    if (!loadForm.origin.trim() || !loadForm.destination.trim() || !Number.isFinite(weightKg)) return
    void createShipment.execute({
      origin: loadForm.origin.trim(),
      destination: loadForm.destination.trim(),
      weightKg,
    })
  }, [createShipment, loadForm])

  const onCreateBid = useCallback(() => {
    if (selectedShipmentId == null) return
    const amount = Number(bidAmount)
    if (!Number.isFinite(amount)) return
    void placeBid.execute({ shipmentId: selectedShipmentId, amount })
    setBidAmount('')
  }, [bidAmount, placeBid, selectedShipmentId])

  const onAcceptBid = useCallback(
    (bidId: number) => {
      acceptBidIdRef.current = bidId
      void acceptBid.execute({})
    },
    [acceptBid],
  )

  const boardRows: ShipmentResponseDto[] = isCarrier
    ? (marketplace.data ?? [])
    : (myShipments.data ?? [])

  const boardLoading = isCarrier ? marketplace.loading : myShipments.loading
  const boardError = isCarrier ? marketplace.error?.message : myShipments.error?.message

  return {
    isCarrier,
    isShipper,
    selectedShipmentId,
    setSelectedShipmentId,
    loadForm,
    setLoadForm,
    bidAmount,
    setBidAmount,
    boardRows,
    boardLoading,
    boardError,
    bidsState: {
      data: bidsForShipment.data ?? [],
      loading: bidsForShipment.loading,
      error: bidsForShipment.error?.message ?? null,
    },
    myBids: { data: myBids.data ?? [], loading: myBids.loading },
    createLoading: createShipment.loading,
    placeBidLoading: placeBid.loading,
    acceptLoading: acceptBid.loading,
    onCreateLoad,
    onCreateBid,
    onAcceptBid,
    refreshBoard: () => {
      if (isCarrier) void marketplace.refetch()
      if (isShipper) void myShipments.refetch()
    },
    refreshBids: () => void bidsForShipment.refetch(),
  }
}

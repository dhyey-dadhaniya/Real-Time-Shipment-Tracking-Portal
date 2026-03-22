/** Matches com.logistics.entity.ShipmentStatus */
export type ShipmentStatusApi = 'POSTED' | 'AWAITING_PICKUP' | 'IN_TRANSIT' | 'DELIVERED'

export interface ShipmentResponseDto {
  id: number
  origin: string
  destination: string
  weightKg: string | number
  status: ShipmentStatusApi
  trackingId: string
  createdAt: string
  shipperId: number
  awardedCarrierId: number | null
}

export interface CreateShipmentRequestDto {
  origin: string
  destination: string
  weightKg: number
}

export interface UpdateShipmentStatusRequestDto {
  status: ShipmentStatusApi
}

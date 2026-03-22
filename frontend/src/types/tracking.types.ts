import type { ShipmentStatusApi } from './shipment.types'

export interface TrackingUpdateRequestDto {
  latitude: number
  longitude: number
  statusMessage?: string
}

export interface TrackingUpdateResponseDto {
  shipmentId: number
  trackingId: string
  latitude: string | number
  longitude: string | number
  statusMessage: string | null
  shipmentStatus: ShipmentStatusApi
  updatedAt: string
}

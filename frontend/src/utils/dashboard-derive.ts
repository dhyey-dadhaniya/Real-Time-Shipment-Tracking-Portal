import type { ShipmentResponseDto } from '@/types'

/** KPIs derived only from GET /api/shipments — no mock fields. */
export interface DashboardKpiView {
  totalShipments: number
  activeShipments: number
}

export interface DashboardShipmentRow {
  id: string
  originCity: string
  destinationCity: string
  weightKg: number
  status: ShipmentResponseDto['status']
  trackingCode: string
}

export function deriveDashboardKpis(shipments: ShipmentResponseDto[]): DashboardKpiView {
  const activeShipments = shipments.filter((s) => s.status !== 'DELIVERED').length
  return {
    totalShipments: shipments.length,
    activeShipments,
  }
}

export function toDashboardShipmentRow(s: ShipmentResponseDto): DashboardShipmentRow {
  return {
    id: String(s.id),
    originCity: s.origin,
    destinationCity: s.destination,
    weightKg: typeof s.weightKg === 'string' ? Number(s.weightKg) : s.weightKg,
    status: s.status,
    trackingCode: s.trackingId,
  }
}

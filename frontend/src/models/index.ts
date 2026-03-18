export type ShipmentStatus =
  | 'OPEN_FOR_BIDS'
  | 'AWAITING_PICKUP'
  | 'IN_TRANSIT'
  | 'DELIVERED'

export type OrderStatus = 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'

export type CarrierStatus = 'ACTIVE' | 'INACTIVE'

export type Role = 'SHIPPER' | 'CARRIER'

export type Shipment = {
  id: string
  trackingCode: string
  originCity: string
  destinationCity: string
  weightKg: number
  status: ShipmentStatus
  createdAt: string
  awardedCarrierId?: string
}

export type Load = {
  id: string
  originCity: string
  destinationCity: string
  weightKg: number
  shipperName: string
  status: 'OPEN' | 'AWARDED'
  createdAt: string
}

export type Bid = {
  id: string
  loadId: string
  carrierId: string
  carrierName: string
  amount: number
  createdAt: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
}

export type Carrier = {
  id: string
  name: string
  status: CarrierStatus
  vehicleCount: number
}

export type Order = {
  id: string
  shipmentId: string
  customer: string
  value: number
  status: OrderStatus
  createdAt: string
}

export type TrackingPosition = {
  shipmentId: string
  lat: number
  lng: number
  timestamp: string
}

export type DashboardKpis = {
  totalOrders: number
  activeShipments: number
  vehicles: number
  revenue: number
}


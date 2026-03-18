import type { Bid, Carrier, Load, Order, Shipment, TrackingPosition } from '../models'

const nowIso = () => new Date().toISOString()

export const carriers: Carrier[] = [
  { id: 'CAR-1', name: 'NorthStar Logistics', status: 'ACTIVE', vehicleCount: 18 },
  { id: 'CAR-2', name: 'BlueRoute Freight', status: 'ACTIVE', vehicleCount: 9 },
  { id: 'CAR-3', name: 'Kaveri Transport Co.', status: 'INACTIVE', vehicleCount: 6 },
]

export const shipments: Shipment[] = [
  {
    id: 'SHP-101',
    trackingCode: 'TRK-8H2K9',
    originCity: 'Bengaluru',
    destinationCity: 'Mysuru',
    weightKg: 840,
    status: 'IN_TRANSIT',
    createdAt: nowIso(),
    awardedCarrierId: 'CAR-1',
  },
  {
    id: 'SHP-102',
    trackingCode: 'TRK-3P1Q2',
    originCity: 'Bengaluru',
    destinationCity: 'Chennai',
    weightKg: 1200,
    status: 'AWAITING_PICKUP',
    createdAt: nowIso(),
    awardedCarrierId: 'CAR-2',
  },
  {
    id: 'SHP-103',
    trackingCode: 'TRK-6Z9W1',
    originCity: 'Hubballi',
    destinationCity: 'Bengaluru',
    weightKg: 520,
    status: 'OPEN_FOR_BIDS',
    createdAt: nowIso(),
  },
]

export const loads: Load[] = [
  {
    id: 'LOAD-77',
    originCity: 'Bengaluru',
    destinationCity: 'Hyderabad',
    weightKg: 950,
    shipperName: 'Acme Ecom',
    status: 'OPEN',
    createdAt: nowIso(),
  },
  {
    id: 'LOAD-78',
    originCity: 'Mangaluru',
    destinationCity: 'Bengaluru',
    weightKg: 640,
    shipperName: 'Coastal Foods',
    status: 'OPEN',
    createdAt: nowIso(),
  },
]

export const bids: Bid[] = [
  {
    id: 'BID-1',
    loadId: 'LOAD-77',
    carrierId: 'CAR-1',
    carrierName: 'NorthStar Logistics',
    amount: 42000,
    createdAt: nowIso(),
    status: 'PENDING',
  },
  {
    id: 'BID-2',
    loadId: 'LOAD-77',
    carrierId: 'CAR-2',
    carrierName: 'BlueRoute Freight',
    amount: 39900,
    createdAt: nowIso(),
    status: 'PENDING',
  },
]

export const orders: Order[] = [
  {
    id: 'ORD-9001',
    shipmentId: 'SHP-101',
    customer: 'Retail Hub',
    value: 76000,
    status: 'IN_TRANSIT',
    createdAt: nowIso(),
  },
  {
    id: 'ORD-9002',
    shipmentId: 'SHP-102',
    customer: 'Pharma Direct',
    value: 112000,
    status: 'PENDING',
    createdAt: nowIso(),
  },
  {
    id: 'ORD-9003',
    shipmentId: 'SHP-101',
    customer: 'Warehouse South',
    value: 54000,
    status: 'DELIVERED',
    createdAt: nowIso(),
  },
]

export const tracking: TrackingPosition[] = [
  {
    shipmentId: 'SHP-101',
    lat: 12.9716,
    lng: 77.5946,
    timestamp: nowIso(),
  },
  {
    shipmentId: 'SHP-101',
    lat: 12.85,
    lng: 76.95,
    timestamp: nowIso(),
  },
]


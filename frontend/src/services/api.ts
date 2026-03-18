import { api } from './apiClient'
import type { Bid, Carrier, Load, Order, Shipment, TrackingPosition } from '../models'

export async function getDashboard() {
  const res = await api.get('/dashboard')
  return res.data as {
    kpis: {
      totalOrders: number
      activeShipments: number
      vehicles: number
      revenue: number
    }
    recentShipments: Shipment[]
    ordersByDay: number[]
    revenueByDay: number[]
  }
}

export async function listShipments() {
  const res = await api.get('/shipments')
  return res.data as Shipment[]
}

export async function getShipmentTracking(shipmentId: string) {
  const res = await api.get(`/shipments/${shipmentId}/tracking`)
  return res.data as TrackingPosition[]
}

export async function listLoads() {
  const res = await api.get('/loads')
  return res.data as Load[]
}

export async function createLoad(input: Pick<Load, 'originCity' | 'destinationCity' | 'weightKg' | 'shipperName'>) {
  const res = await api.post('/loads', input)
  return res.data as Load
}

export async function listBidsForLoad(loadId: string) {
  const res = await api.get(`/loads/${loadId}/bids`)
  return res.data as Bid[]
}

export async function createBid(input: Pick<Bid, 'loadId' | 'carrierId' | 'carrierName' | 'amount'>) {
  const res = await api.post('/bids', input)
  return res.data as Bid
}

export async function listCarriers() {
  const res = await api.get('/carriers')
  return res.data as Carrier[]
}

export async function listOrders() {
  const res = await api.get('/orders')
  return res.data as Order[]
}


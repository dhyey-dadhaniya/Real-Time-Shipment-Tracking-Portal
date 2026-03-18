import axios, {
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { bids, carriers, loads, orders, shipments, tracking } from './mockDb'
import type { Bid, Carrier, DashboardKpis, Load, Order, Shipment, TrackingPosition } from '../models'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function json<T>(
  config: InternalAxiosRequestConfig,
  data: T,
  status = 200,
): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'ERROR',
    headers: {},
    config,
  }
}

function notFound(config: InternalAxiosRequestConfig) {
  return json(config, { message: 'Not found' } as unknown as never, 404)
}

function badRequest(config: InternalAxiosRequestConfig, message: string) {
  return json(config, { message } as unknown as never, 400)
}

function parseBody<T>(config: InternalAxiosRequestConfig): T | null {
  if (!config.data) return null
  if (typeof config.data === 'string') {
    try {
      return JSON.parse(config.data) as T
    } catch {
      return null
    }
  }
  return config.data as T
}

const mockAdapter: AxiosAdapter = async (config) => {
  // Simulate latency
  await sleep(350)

  const method = (config.method ?? 'get').toLowerCase()
  const url = config.url ?? ''

  // Dashboard
  if (method === 'get' && url === '/dashboard') {
    const kpis: DashboardKpis = {
      totalOrders: orders.length,
      activeShipments: shipments.filter((s) => s.status !== 'DELIVERED').length,
      vehicles: carriers.reduce((acc, c) => acc + c.vehicleCount, 0),
      revenue: orders.reduce((acc, o) => acc + o.value, 0),
    }
    return json(config, {
      kpis,
      recentShipments: shipments.slice(0, 5),
      ordersByDay: [12, 18, 9, 22, 28, 20, 24],
      revenueByDay: [12000, 18000, 9000, 22000, 28000, 20000, 24000],
    })
  }

  // Shipments
  if (method === 'get' && url === '/shipments') {
    return json(config, shipments as Shipment[])
  }

  // Tracking positions
  const trackingMatch = url.match(/^\/shipments\/([^/]+)\/tracking$/)
  if (trackingMatch && method === 'get') {
    const shipmentId = trackingMatch[1]
    const points = tracking.filter((p) => p.shipmentId === shipmentId)
    return json(config, points as TrackingPosition[])
  }

  // Loads
  if (url === '/loads' && method === 'get') {
    return json(config, loads as Load[])
  }
  if (url === '/loads' && method === 'post') {
    const body = parseBody<Pick<Load, 'originCity' | 'destinationCity' | 'weightKg' | 'shipperName'>>(
      config,
    )
    if (!body?.originCity || !body.destinationCity || !body.weightKg || !body.shipperName) {
      return badRequest(config, 'Missing required fields')
    }
    const newLoad: Load = {
      id: `LOAD-${Math.floor(100 + Math.random() * 900)}`,
      originCity: body.originCity,
      destinationCity: body.destinationCity,
      weightKg: Number(body.weightKg),
      shipperName: body.shipperName,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    }
    loads.unshift(newLoad)
    return json(config, newLoad, 201)
  }

  // Bids
  const bidsMatch = url.match(/^\/loads\/([^/]+)\/bids$/)
  if (bidsMatch && method === 'get') {
    const loadId = bidsMatch[1]
    return json(config, bids.filter((b) => b.loadId === loadId) as Bid[])
  }
  if (url === '/bids' && method === 'post') {
    const body = parseBody<Pick<Bid, 'loadId' | 'carrierId' | 'carrierName' | 'amount'>>(config)
    if (!body?.loadId || !body.carrierId || !body.carrierName || !body.amount) {
      return badRequest(config, 'Missing required fields')
    }
    const newBid: Bid = {
      id: `BID-${Math.floor(10 + Math.random() * 900)}`,
      loadId: body.loadId,
      carrierId: body.carrierId,
      carrierName: body.carrierName,
      amount: Number(body.amount),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }
    bids.unshift(newBid)
    return json(config, newBid, 201)
  }

  // Carriers
  if (url === '/carriers' && method === 'get') {
    return json(config, carriers as Carrier[])
  }

  // Orders
  if (url === '/orders' && method === 'get') {
    return json(config, orders as Order[])
  }

  return notFound(config)
}

export const api = axios.create({
  baseURL: '/mock',
  adapter: mockAdapter,
})


import { create } from 'zustand'
import type { Bid, Carrier, Load, Order, Shipment, TrackingPosition } from '../models'
import {
  createBid,
  createLoad,
  getDashboard,
  getShipmentTracking,
  listBidsForLoad,
  listCarriers,
  listLoads,
  listOrders,
  listShipments,
} from '../services/api'

type AsyncState<T> = {
  data: T
  loading: boolean
  error: string | null
}

type DataState = {
  dashboard: AsyncState<{
    kpis: { totalOrders: number; activeShipments: number; vehicles: number; revenue: number }
    recentShipments: Shipment[]
    ordersByDay: number[]
    revenueByDay: number[]
  } | null>
  shipments: AsyncState<Shipment[]>
  trackingByShipmentId: Record<string, AsyncState<TrackingPosition[]>>
  loads: AsyncState<Load[]>
  bidsByLoadId: Record<string, AsyncState<Bid[]>>
  carriers: AsyncState<Carrier[]>
  orders: AsyncState<Order[]>

  loadDashboard: () => Promise<void>
  loadShipments: () => Promise<void>
  loadTracking: (shipmentId: string) => Promise<void>
  loadLoads: () => Promise<void>
  loadBidsForLoad: (loadId: string) => Promise<void>
  submitLoad: (input: Pick<Load, 'originCity' | 'destinationCity' | 'weightKg' | 'shipperName'>) => Promise<void>
  submitBid: (input: Pick<Bid, 'loadId' | 'carrierId' | 'carrierName' | 'amount'>) => Promise<void>
  loadCarriers: () => Promise<void>
  loadOrders: () => Promise<void>
}

const emptyAsync = <T,>(data: T): AsyncState<T> => ({ data, loading: false, error: null })

export const useDataStore = create<DataState>((set, get) => ({
  dashboard: emptyAsync(null),
  shipments: emptyAsync([]),
  trackingByShipmentId: {},
  loads: emptyAsync([]),
  bidsByLoadId: {},
  carriers: emptyAsync([]),
  orders: emptyAsync([]),

  loadDashboard: async () => {
    set({ dashboard: { ...get().dashboard, loading: true, error: null } })
    try {
      const data = await getDashboard()
      set({ dashboard: { data, loading: false, error: null } })
    } catch (e) {
      set({
        dashboard: { data: null, loading: false, error: e instanceof Error ? e.message : 'Failed to load dashboard' },
      })
    }
  },

  loadShipments: async () => {
    set({ shipments: { ...get().shipments, loading: true, error: null } })
    try {
      const data = await listShipments()
      set({ shipments: { data, loading: false, error: null } })
    } catch (e) {
      set({
        shipments: { data: [], loading: false, error: e instanceof Error ? e.message : 'Failed to load shipments' },
      })
    }
  },

  loadTracking: async (shipmentId) => {
    const current = get().trackingByShipmentId[shipmentId] ?? emptyAsync<TrackingPosition[]>([])
    set({
      trackingByShipmentId: {
        ...get().trackingByShipmentId,
        [shipmentId]: { ...current, loading: true, error: null },
      },
    })
    try {
      const data = await getShipmentTracking(shipmentId)
      set({
        trackingByShipmentId: {
          ...get().trackingByShipmentId,
          [shipmentId]: { data, loading: false, error: null },
        },
      })
    } catch (e) {
      set({
        trackingByShipmentId: {
          ...get().trackingByShipmentId,
          [shipmentId]: {
            data: [],
            loading: false,
            error: e instanceof Error ? e.message : 'Failed to load tracking',
          },
        },
      })
    }
  },

  loadLoads: async () => {
    set({ loads: { ...get().loads, loading: true, error: null } })
    try {
      const data = await listLoads()
      set({ loads: { data, loading: false, error: null } })
    } catch (e) {
      set({
        loads: { data: [], loading: false, error: e instanceof Error ? e.message : 'Failed to load loads' },
      })
    }
  },

  loadBidsForLoad: async (loadId) => {
    const current = get().bidsByLoadId[loadId] ?? emptyAsync<Bid[]>([])
    set({
      bidsByLoadId: {
        ...get().bidsByLoadId,
        [loadId]: { ...current, loading: true, error: null },
      },
    })
    try {
      const data = await listBidsForLoad(loadId)
      set({
        bidsByLoadId: {
          ...get().bidsByLoadId,
          [loadId]: { data, loading: false, error: null },
        },
      })
    } catch (e) {
      set({
        bidsByLoadId: {
          ...get().bidsByLoadId,
          [loadId]: {
            data: [],
            loading: false,
            error: e instanceof Error ? e.message : 'Failed to load bids',
          },
        },
      })
    }
  },

  submitLoad: async (input) => {
    set({ loads: { ...get().loads, loading: true, error: null } })
    try {
      await createLoad(input)
      const data = await listLoads()
      set({ loads: { data, loading: false, error: null } })
    } catch (e) {
      set({
        loads: { data: get().loads.data, loading: false, error: e instanceof Error ? e.message : 'Failed to create load' },
      })
    }
  },

  submitBid: async (input) => {
    const current = get().bidsByLoadId[input.loadId] ?? emptyAsync<Bid[]>([])
    set({
      bidsByLoadId: {
        ...get().bidsByLoadId,
        [input.loadId]: { ...current, loading: true, error: null },
      },
    })
    try {
      await createBid(input)
      const data = await listBidsForLoad(input.loadId)
      set({
        bidsByLoadId: {
          ...get().bidsByLoadId,
          [input.loadId]: { data, loading: false, error: null },
        },
      })
    } catch (e) {
      set({
        bidsByLoadId: {
          ...get().bidsByLoadId,
          [input.loadId]: {
            data: current.data,
            loading: false,
            error: e instanceof Error ? e.message : 'Failed to create bid',
          },
        },
      })
    }
  },

  loadCarriers: async () => {
    set({ carriers: { ...get().carriers, loading: true, error: null } })
    try {
      const data = await listCarriers()
      set({ carriers: { data, loading: false, error: null } })
    } catch (e) {
      set({
        carriers: { data: [], loading: false, error: e instanceof Error ? e.message : 'Failed to load carriers' },
      })
    }
  },

  loadOrders: async () => {
    set({ orders: { ...get().orders, loading: true, error: null } })
    try {
      const data = await listOrders()
      set({ orders: { data, loading: false, error: null } })
    } catch (e) {
      set({
        orders: { data: [], loading: false, error: e instanceof Error ? e.message : 'Failed to load orders' },
      })
    }
  },
}))


/**
 * Path constants only — use with useAPI(..., { method }).
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
  },
  SHIPMENTS: {
    LIST: '/api/shipments',
    CREATE: '/api/shipments',
    BY_ID: (id: number | string) => `/api/shipments/${id}`,
    TRACK: (trackingId: string) => `/api/shipments/track/${encodeURIComponent(trackingId)}`,
    TRACK_HISTORY: (trackingId: string) =>
      `/api/shipments/track/${encodeURIComponent(trackingId)}/history`,
  },
  MARKETPLACE: {
    SHIPMENTS: '/api/marketplace/shipments',
  },
  CARRIER: {
    SHIPMENTS: '/api/carrier/shipments',
  },
  BIDS: {
    LIST: '/api/bids',
    CREATE: '/api/bids',
    FOR_SHIPMENT: (shipmentId: number | string) => `/api/bids/shipment/${shipmentId}`,
    ACCEPT: (bidId: number | string) => `/api/bids/${bidId}/accept`,
  },
  OPERATIONS: {
    UPDATE_STATUS: (shipmentId: number | string) =>
      `/api/operations/shipments/${shipmentId}/status`,
  },
  TRACKING: {
    PUBLISH: (shipmentId: number | string) => `/api/tracking/shipments/${shipmentId}`,
    HISTORY: (shipmentId: number | string) => `/api/tracking/shipments/${shipmentId}/history`,
  },
} as const

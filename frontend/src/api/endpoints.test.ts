import { describe, expect, it } from 'vitest'
import { API_ENDPOINTS } from './endpoints'

describe('API_ENDPOINTS.SHIPMENTS (public track)', () => {
  it('encodes tracking IDs for path segments', () => {
    const id = 'TRK/odd-id'
    expect(API_ENDPOINTS.SHIPMENTS.TRACK(id)).toBe(`/api/shipments/track/${encodeURIComponent(id)}`)
    expect(API_ENDPOINTS.SHIPMENTS.TRACK_HISTORY(id)).toBe(
      `/api/shipments/track/${encodeURIComponent(id)}/history`,
    )
  })
})

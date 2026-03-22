/**
 * Dev geocoding via Nominatim (proxied in vite.config.ts to avoid CORS).
 * For production, use your own geocoder or backend proxy with rate limits.
 */
export async function geocodePlace(query: string): Promise<{ lat: number; lng: number } | null> {
  const q = query.trim()
  if (!q) return null
  const url = `/nominatim/search?format=json&limit=1&q=${encodeURIComponent(q)}`
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  })
  if (!res.ok) return null
  const data = (await res.json()) as { lat?: string; lon?: string }[]
  const row = data?.[0]
  if (!row?.lat || !row?.lon) return null
  const lat = Number(row.lat)
  const lng = Number(row.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { lat, lng }
}

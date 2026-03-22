import { config } from '@/config/env'

/** Absolute or same-origin path for `fetch` (avoids coupling public pages to the authenticated axios client). */
export function resolveApiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  const base = config.apiUrl.replace(/\/$/, '')
  return base ? `${base}${p}` : p
}

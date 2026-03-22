/**
 * App config from environment (aligned with sikh-gurus-admin-panel-frontend 1).
 * Vite only exposes variables prefixed with VITE_.
 */
function getEnv(key: string, fallback = ''): string {
  return (import.meta.env as Record<string, string | undefined>)[key] ?? fallback
}

/** Prefer VITE_API_BASE_URL (reference project); fall back to VITE_API_URL for compatibility. */
const rawApi =
  getEnv('VITE_API_BASE_URL', '') || getEnv('VITE_API_URL', '')

export const config = {
  /** Base URL for Spring Boot API; empty = same origin + Vite dev proxy. */
  apiUrl: rawApi.replace(/\/$/, ''),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const

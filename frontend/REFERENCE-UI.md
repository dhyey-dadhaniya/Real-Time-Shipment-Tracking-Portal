# UI / architecture reference

This frontend follows the same conventions as:

**`frontend/sikh-gurus-admin-panel-frontend 1/sikh-gurus-admin-panel-frontend/`**

Notable alignments:

| Area | Reference pattern |
|------|-------------------|
| Entry | `App/index.tsx` + providers |
| Routing | `router.tsx` + `createBrowserRouter` + `RouterProvider` |
| Auth shell | `layouts/auth-layout.tsx` + `Outlet` |
| Env | `config/env.ts` — `VITE_API_BASE_URL` (fallback `VITE_API_URL`) |
| HTTP | `api/client.ts` — `withCredentials`, `Authorization` + `access-token` |
| Data | `useAPI` + `API_ENDPOINTS` only (see `.cursor/rules`) |

Cursor rules in `.cursor/rules/` are synced from that reference project.

Do not copy reference-only assets (logos, brand images, museum-specific pages).

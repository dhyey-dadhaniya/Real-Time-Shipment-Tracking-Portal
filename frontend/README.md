# Frontend – Real-Time Shipment Tracking Portal

React 19 + TypeScript + Vite + Tailwind. Consumes the Spring Boot API and, for carriers, maintains a **STOMP/WebSocket** subscription for live GPS points on the map (**Leaflet**).

---

## Run

```bash
cd frontend
npm install
npm run dev
```

Dev server: **http://localhost:5173** (or next free port).

Set **`VITE_API_BASE_URL`** in `.env` (e.g. `http://localhost:8080/api/`) so REST calls hit the backend. WebSocket uses **`/ws`** on the **same origin** as the dev server; Vite proxies `/ws` to the backend (see `vite.config.ts`).

---

## Week 4 deliverables (per project PDF)

| Requirement | Implementation |
|---------------|------------------|
| React dashboard + map | Shipper tracking, carrier real-time page, marketplace, etc. |
| Leaflet map | `react-leaflet` + OpenStreetMap tiles |
| WebSocket on map | `useRealtimeTrackingPage` — STOMP subscribe to `/topic/shipments/{id}` |
| Graceful reconnect | `@stomp/stompjs`: exponential backoff, heartbeats, intentional close on unmount; UI shows **Live / Reconnecting / Error** + **Reconnect WebSocket** |

---

## Live tracking hook (`src/hooks/realtime-tracking/useRealtimeTrackingPage.ts`)

- **CONNECT** headers: `Authorization: Bearer <JWT>` (matches `WebSocketAuthChannelInterceptor` on the server).
- **Auto-reconnect:** `reconnectTimeMode: EXPONENTIAL`, capped by `maxReconnectDelay`.
- **Heartbeats:** 10s in/out to detect stale connections.
- **Manual reconnect:** increments an internal session key → `deactivate()` / new `activate()` cycle.
- **REST:** `GET /api/tracking/shipments/{id}/history` bootstraps the polyline; STOMP appends live points.

Full sequence diagrams and security notes: **[../docs/WEBSOCKET_ARCHITECTURE.md](../docs/WEBSOCKET_ARCHITECTURE.md)**.

---

## Build

```bash
npm run build
npm run preview
```

For `preview`, configure your host or env so `/api` and `/ws` still reach the backend (or use a single reverse proxy in production).

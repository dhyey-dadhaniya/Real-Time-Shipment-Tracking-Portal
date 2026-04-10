# Real-Time Shipment Tracking Portal – Frontend

A React single-page application built with TypeScript and Vite, styled with Tailwind CSS. It consumes the Spring Boot REST API for logistics workflows (dashboard, shipments, marketplace, carriers) and uses **STOMP over WebSocket** with **Leaflet** for live carrier tracking maps. The stack emphasizes type-safe API access, route-based code organization, and Vitest for unit tests on critical helpers.

## 🏗️ Architecture

The app follows a typical SPA + API pattern:

```
Browser (React) → Vite dev server (same origin) → proxy /api & /ws → Spring Boot backend
```

- **Vite**: Dev server and production build; `vite.config.ts` proxies `/api` and `/ws` to the backend during development so the browser calls same-origin URLs.
- **React Router**: Client-side routing; protected routes wrap authenticated areas.
- **REST**: Axios-based client (`src/api/`) with `VITE_API_BASE_URL` pointing at the API (e.g. `http://localhost:8080/api/`).
- **Real-time**: `@stomp/stompjs` connects to `/ws`, subscribes to `/topic/shipments/{id}` with `Authorization: Bearer <JWT>`; see **[../docs/WEBSOCKET_ARCHITECTURE.md](../docs/WEBSOCKET_ARCHITECTURE.md)** for sequence diagrams and security notes.

| Area | Implementation |
|------|------------------|
| Dashboard & maps | Shipper tracking, carrier real-time page, marketplace, etc. |
| Map | `react-leaflet` + OpenStreetMap tiles |
| Live updates | `useRealtimeTrackingPage` — STOMP subscribe; REST `GET /api/tracking/shipments/{id}/history` bootstraps the polyline |
| Resilience | Exponential reconnect, heartbeats, manual **Reconnect WebSocket**; UI states **Live / Reconnecting / Error** |

**Live tracking hook:** `src/hooks/realtime-tracking/useRealtimeTrackingPage.ts` — CONNECT headers match server `WebSocketAuthChannelInterceptor`; auto-reconnect with capped delay; intentional close on unmount.

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 20+ (LTS recommended; align with your team’s version)
- **npm**: >= 10.0.0
- **Backend**: Spring Boot API running (see `../backend/README.md`)

### Installation

```bash
cd frontend
npm install
```

### Environment Setup

Create your environment file from the example (if present) or add `.env` in `frontend/`:

```env
# Base URL for REST calls (include trailing slash if your client expects it)
VITE_API_BASE_URL=http://localhost:8080/api/
```

WebSocket traffic uses **`/ws`** on the **same origin** as the Vite dev server; the proxy forwards it to the backend.

## 💻 Development

### Start Development Server

```bash
npm run dev
```

- Serves the app (default **http://localhost:5173**, or next free port).
- Hot module replacement via Vite.

### Build

```bash
npm run build
```

Runs `tsc -b` then `vite build` for production assets.

### Preview Production Build

```bash
npm run preview
```

Ensure `/api` and `/ws` still reach the backend (env, reverse proxy, or same proxy setup as production).

### Tests

```bash
npm run test        # single run (Vitest)
npm run test:watch  # watch mode
```

## 📁 Project Structure

```
frontend/
├── index.html                 # Vite HTML shell
├── package.json               # Dependencies & scripts
├── package-lock.json
├── vite.config.ts             # Dev server; proxy `/api` and `/ws` to backend
├── vitest.config.ts           # Unit tests (e.g. API helpers)
├── eslint.config.js           # ESLint (flat config)
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── README.md
├── .env                       # Local env (not committed); `VITE_*` variables
└── src/
    ├── main.tsx               # React root
    ├── index.css              # Global styles (Tailwind)
    ├── router.tsx             # Route definitions
    ├── App/
    │   └── index.tsx          # App shell
    ├── api/                   # Axios client, REST paths, tests
    │   ├── client.ts
    │   ├── endpoints.ts
    │   ├── endpoints.test.ts
    │   └── index.ts
    ├── components/
    │   ├── features/          # Domain UI (auth forms, dashboard widgets)
    │   │   ├── auth/
    │   │   └── dashboard/
    │   ├── layout/            # Protected routes, home redirect
    │   ├── navigation/        # Sidebar, top nav, nav items
    │   └── ui/                # Shared primitives (Button, Card, Table, …)
    ├── config/
    │   └── env.ts             # Typed env access
    ├── constants/
    │   └── routes.ts
    ├── contexts/              # Auth & toast providers
    ├── hooks/                 # Page logic and shared hooks
    │   ├── auth/
    │   ├── carrier-management/
    │   ├── dashboard/
    │   ├── marketplace/
    │   ├── realtime-tracking/ # STOMP live map
    │   ├── shipment-tracking/
    │   ├── useApi.ts
    │   └── useToast.ts
    ├── layouts/               # App layout vs auth layout
    ├── pages/                 # Route screens; `pages/auth/` for login/register
    ├── services/
    │   └── leafletFix.ts      # Leaflet/CSS integration helpers
    ├── store/
    │   └── uiStore.ts
    ├── types/                 # Shared TypeScript types
    └── utils/                 # API URL resolution, geocode, auth helpers, …
```

CI/CD for the monorepo lives under **`.github/workflows/`** at the **repository root** (not inside `frontend/`).

## 🚨 Code Quality

### Linting

```bash
npm run lint
```

Uses ESLint with the flat config in `eslint.config.js`.

This frontend is designed to work with the **Spring Boot** backend in `../backend/` for authentication, shipments, tracking, and WebSocket/STOMP.

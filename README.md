# Real-Time Shipment Tracking Portal

A full-stack logistics platform where shippers publish loads, carriers bid and operate assigned shipments, and stakeholders monitor movement on a **Leaflet** map with optional **STOMP/WebSocket** live updates.

## Features

- **Authentication** — JWT-based API security; role separation (shipper / carrier).
- **Marketplace** — Carriers discover open loads and submit bids.
- **Operations** — Shippers accept bids; carriers update shipment status and publish GPS checkpoints.
- **Tracking** — REST history plus broker broadcasts on `/topic/shipments/{shipmentId}`.
- **Public tracking** — No account required: open `/track/{trackingId}` using the shipment’s public tracking code (`GET /api/shipments/track/{trackingId}` and `/history`).

## Architecture

| Layer | Stack |
|--------|--------|
| API | Spring Boot 3, Spring Security, JPA, PostgreSQL |
| Real-time | Spring WebSocket / STOMP, simple broker |
| UI | React 19, TypeScript, Vite, Tailwind, react-leaflet |

Detailed WebSocket design: [docs/WEBSOCKET_ARCHITECTURE.md](docs/WEBSOCKET_ARCHITECTURE.md).

## Repository layout

```
├── backend/          # Spring Boot application
├── frontend/         # Vite + React SPA
├── docs/             # Architecture and integration notes
└── WEEK1_README.md   # Supplementary API reference (early milestones)
```

## Prerequisites

- **JDK 17+**
- **Node.js 20+** (or current LTS)
- **PostgreSQL** (local database for development)

## Configuration

- **Backend** — `backend/.env` or environment variables: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET` (see [backend/README.md](backend/README.md)).
- **Frontend** — `frontend/.env`: `VITE_API_BASE_URL` (e.g. `http://localhost:8080/` for direct API calls, or leave empty to use the Vite dev proxy).

## Run locally

**API**

```bash
cd backend
mvn spring-boot:run
```

Default: `http://localhost:8080`

**Web app**

```bash
cd frontend
npm install
npm run dev
```

Dev server proxies `/api` and `/ws` to the backend (see `frontend/vite.config.ts`).

## Automated tests

**Backend (JUnit 5)**

```bash
cd backend
mvn test
```

Uses the `test` profile with an in-memory **H2** database (`src/test/resources/application-test.properties`).

**Frontend (Vitest)**

```bash
cd frontend
npm test
```

**CI** — On push and pull request, [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs backend tests and frontend build/tests.

## API highlights

| Use case | Method & path |
|----------|----------------|
| Register / login | `POST /api/auth/register`, `POST /api/auth/login` |
| Public shipment snapshot | `GET /api/shipments/track/{trackingId}` |
| Public GPS history | `GET /api/shipments/track/{trackingId}/history` |
| Authenticated history | `GET /api/tracking/shipments/{id}/history` |
| Carrier GPS update | `POST /api/tracking/shipments/{id}` |

Full Week-1 style reference: [WEEK1_README.md](WEEK1_README.md).

## Documentation

- [backend/README.md](backend/README.md) — Data model, security, REST and WebSocket entry points.
- [frontend/README.md](frontend/README.md) — UI modules, env vars, STOMP client behavior.
- [docs/WEBSOCKET_ARCHITECTURE.md](docs/WEBSOCKET_ARCHITECTURE.md) — Topics, JWT on `CONNECT`, reconnection.

## License

This project is provided as sample / coursework source. Add a `LICENSE` file if you distribute it.

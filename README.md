# Real-Time Shipment Tracking Portal

Logistics marketplace: shippers post loads, carriers bid, customers track shipments in real time.  
**(Internship Project – Task 3)**

---

## Four-week roadmap

| Week   | Focus |
|--------|--------|
| **Week 1** | Marketplace schema, auth (JWT), REST APIs — see **WEEK1_README.md** |
| **Week 2** | Load board & bidding logic (accept bid, lock shipment) — backend |
| **Week 3** | WebSocket + live GPS tracking (broadcast by shipment) — backend |
| **Week 4** | React dashboard, map UI, testing, README — frontend & wrap-up |

---

## Project overview (common for backend & frontend)

| Part     | Description                    |
|----------|--------------------------------|
| Backend  | Spring Boot API (Week 1–3: auth, shipments, bids, WebSocket) |
| Frontend | React dashboard (Week 4: tracking + map, WebSocket)        |

---

## Repository structure

```
Real-Time-Shipment-Tracking-Portal/
├── backend/          # Spring Boot API (Week 1–3) — see backend/README.md
├── frontend/         # React app (Week 4) — see frontend/README.md
├── README.md         # This file (project overview)
└── WEEK1_README.md   # Week 1 API & day-wise plan
```

---

## How to run

| Part     | Command / doc                    |
|----------|-----------------------------------|
| Backend  | `cd backend` then `mvn spring-boot:run` — see **backend/README.md** |
| Frontend | `cd frontend` then `npm install` & `npm run dev` — see **frontend/README.md** |

Backend API: **http://localhost:8080**

---

## Docs

- **WEEK1_README.md** — Week 1 implementation details (schema, auth, API).
- **backend/README.md** — Backend (Week 1–3) setup, config, API, WebSocket.
- **frontend/README.md** — Frontend (Week 4) setup and planned features.

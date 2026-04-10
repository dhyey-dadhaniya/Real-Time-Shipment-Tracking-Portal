# Backend – Real-Time Shipment Tracking Portal

Spring Boot API for the logistics marketplace. Covers **Week 1** (schema & auth), **Week 2** (load board & bidding), and **Week 3** (WebSocket & live tracking).

---

## Tech stack

| Component   | Technology              |
|------------|-------------------------|
| Language   | Java 17                 |
| Framework  | Spring Boot 3.x          |
| Database   | PostgreSQL               |
| Security   | Spring Security + JWT    |
| Data       | Spring Data JPA          |
| Build      | Maven                    |
| Real-time  | Spring WebSocket + STOMP (`/ws`, `/topic/...`) |

---

## WebSocket & STOMP (Week 3–4)

- **Endpoint:** `ws://<host>:8080/ws` (browser dev often uses Vite proxy: `ws://localhost:5173/ws` → 8080).
- **Broker:** Simple in-memory broker, application prefix `/app`, broker destination prefix `/topic`.
- **Live topic:** `/topic/shipments/{shipmentId}` — payload is JSON `TrackingUpdateResponse` after each `POST /api/tracking/shipments/{id}`.
- **Auth:** JWT in STOMP `CONNECT` frame header `Authorization: Bearer <token>` — see `WebSocketAuthChannelInterceptor`.

**Code:** `config/WebSocketConfig.java`, `config/WebSocketAuthChannelInterceptor.java`, `service/TrackingService.java` (`SimpMessagingTemplate#convertAndSend`).

**Full architecture write-up (PDF Week 4):** [../docs/WEBSOCKET_ARCHITECTURE.md](../docs/WEBSOCKET_ARCHITECTURE.md)

---

## Prerequisites

- **Java 17**
- **Maven**
- **PostgreSQL** (DB created, e.g. `shipment_tracking`)

---

## Run

From project root:

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Or from `backend/` directly:

```bash
mvn spring-boot:run
```

API base: **http://localhost:8080**

---

## Configuration

Defaults in `src/main/resources/application.properties`. Override with env:

- `DB_URL` – e.g. `jdbc:postgresql://localhost:5432/shipment_tracking`
- `DB_USERNAME` – DB user
- `DB_PASSWORD` – DB password
- `JWT_SECRET` – min 32 chars in production

---

## Quick API check

- **Register (Shipper):**  
  `POST /api/auth/register`  
  Body: `{ "name": "Test Shipper", "email": "shipper@test.com", "password": "password123", "role": "SHIPPER" }`

- **Login:**  
  `POST /api/auth/login`  
  Body: `{ "email": "shipper@test.com", "password": "password123" }`  
  Use returned `token`: `Authorization: Bearer <token>`

- **Public tracking:**  
  `GET /api/shipments/track/{trackingId}` (no auth)

---

## Folder structure

```
backend/
├── pom.xml                              # Maven build and dependencies
├── .env.example                         # Example env vars (copy to `.env` locally)
├── README.md
├── src/
│   ├── main/
│   │   ├── java/com/logistics/
│   │   │   ├── ShipmentTrackingApplication.java   # Spring Boot entry point
│   │   │   ├── config/                            # Security, WebSocket/STOMP
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── WebSocketConfig.java
│   │   │   │   └── WebSocketAuthChannelInterceptor.java
│   │   │   ├── controller/                        # REST endpoints
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── BidController.java
│   │   │   │   ├── CarrierController.java
│   │   │   │   ├── MarketplaceController.java
│   │   │   │   ├── OperationsController.java
│   │   │   │   ├── ShipmentController.java
│   │   │   │   └── TrackingController.java
│   │   │   ├── dto/                               # Request/response DTOs
│   │   │   ├── entity/                            # JPA entities (User, Shipment, Bid, …)
│   │   │   ├── exception/                         # GlobalExceptionHandler
│   │   │   ├── repository/                        # Spring Data JPA repositories
│   │   │   ├── security/                          # JWT filter, provider, user details
│   │   │   └── service/                           # Business logic
│   │   └── resources/
│   │       └── application.properties             # Defaults; override with env vars
│   └── test/
│       ├── java/com/logistics/                    # Unit & integration tests
│       └── resources/
│           └── application-test.properties        # Test profile (e.g. in-memory DB)
```

Repository-wide CI is under **`.github/workflows/`** at the project root (not inside `backend/`).

---

## Notes

- **Week 1**: Full API & day-wise plan → root **WEEK1_README.md** (paths refer to code under `backend/`).
- **Week 2**: Accept-bid, lock shipment to AWAITING_PICKUP (backend).
- **Week 3**: WebSocket/STOMP, GPS endpoint, broadcast by shipment (backend).
- Do not commit secrets; use env vars for production.

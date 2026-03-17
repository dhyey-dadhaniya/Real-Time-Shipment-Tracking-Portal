# Project 3 – Week 1: Marketplace Schema and Authentication

This folder contains the **Week 1** implementation for **Task 3: Real-Time Shipment Tracking Portal & Logistics Marketplace**, as per the internship PDF.

## Week 1 Goals (from PDF)

- Establish Spring Boot repository and configure PostgreSQL.
- Design schema for multi-tenant marketplace: **Users** (Shipper vs Carrier), **Shipments**, **Bids**.
- Implement **Spring Security with JWT** so Carriers cannot access Shipper-specific data, and vice versa.

---

## Day-by-Day Breakdown

### Day 1 – Spring Boot scaffolding
- **pom.xml**: Spring Boot 3.2, Web, JPA, PostgreSQL, Security, JWT (jjwt), Validation.
- **application.properties**: DB URL/credentials (env: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`), JPA/Hibernate, JWT secret (env: `JWT_SECRET`).
- **ShipmentTrackingApplication.java**: Main class.

### Day 2 – Relational schema (JPA entities)
- **User**: id, name, email, password, role (SHIPPER | CARRIER), createdAt; `@OneToMany` to Shipment and Bid.
- **Shipment**: id, origin, destination, weightKg, status (POSTED → AWAITING_PICKUP → IN_TRANSIT → DELIVERED), trackingId, shipper, bids.
- **Bid**: id, amount, status (PENDING | ACCEPTED | REJECTED), shipment, carrier.
- Enums: `UserRole`, `ShipmentStatus`, `BidStatus`.

### Day 3 – Data access and config
- **UserRepository**, **ShipmentRepository**, **BidRepository** (Spring Data JPA).
- PostgreSQL and JPA configured in **application.properties**.

### Day 4 – Spring Security and JWT
- **JwtProperties**: `jwt.secret`, `jwt.expiration-ms`.
- **JwtProvider**: generate/parse/validate token, email + role in claims.
- **JwtAuthenticationFilter**: extract Bearer token, set `SecurityContext`.
- **UserDetailsServiceImpl**: load user by email for login.
- **SecurityConfig**: stateless session, permit `/api/auth/register`, `/api/auth/login`, `/api/shipments/track/**`; role-based rules for shipments (SHIPPER) and bids/marketplace (CARRIER).
- **AuthService** + **AuthController**: register, login; return JWT in **AuthResponse**.

### Day 5 – Role-based REST API
- **ShipmentController** (SHIPPER): `POST /api/shipments`, `GET /api/shipments`, `GET /api/shipments/{id}`.
- **GET /api/shipments/track/{trackingId}`**: public (end-customer tracking).
- **BidController** (CARRIER): `POST /api/bids`, `GET /api/bids`.
- **MarketplaceController** (CARRIER): `GET /api/marketplace/shipments` (available loads).
- **CurrentUserService**: resolve current user from `SecurityContext` for ownership checks.
- **GlobalExceptionHandler**: validation and auth error responses.

---

## How to Run

1. **PostgreSQL**: Create DB (e.g. `shipment_tracking`) and set env or properties:
   - `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` (or defaults in `backend/src/main/resources/application.properties`).
2. **JWT**: Set `JWT_SECRET` (min 32 chars) in production; dev default is in properties.
3. Build and run (from project root):
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```
4. **Register** (Shipper or Carrier):
   - `POST /api/auth/register`  
     Body: `{ "name": "Shipper One", "email": "shipper@test.com", "password": "password123", "role": "SHIPPER" }`
   - Or `"role": "CARRIER"` for carrier.
5. **Login**: `POST /api/auth/login` with `{ "email": "...", "password": "..." }` → use returned `token` in header: `Authorization: Bearer <token>`.
6. **Shipper**: Create shipment `POST /api/shipments` (origin, destination, weightKg); list `GET /api/shipments`.
7. **Carrier**: List loads `GET /api/marketplace/shipments`; place bid `POST /api/bids` with `{ "shipmentId": 1, "amount": 100.50 }`.
8. **Public tracking**: `GET /api/shipments/track/{trackingId}` (no auth).

---

## What’s next (Week 2–4)

- **Week 2:** Load board & bidding — Shipper accept bid, reject others, set shipment to AWAITING_PICKUP (backend).
- **Week 3:** WebSocket & live tracking — GPS endpoint, broadcast to shipment topic (backend).
- **Week 4:** React dashboard with map, WebSocket client, testing, README (frontend).

---

## Git / Evaluation

- Commit **per day** (or per logical unit) with semantic messages (e.g. `feat: add JWT filter`, `fix: shipment ownership check`).
- Use a **feature branch** and merge via **Pull Request** to `main` as per PDF guidelines.
- Ensure **no secrets** in repo; use environment variables for `JWT_SECRET` and DB credentials.

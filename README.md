# Real-Time Shipment Tracking Portal

A logistics marketplace where shippers post loads, carriers bid on them, and customers can track shipments. (Internship Project – Task 3)

---

## Project structure

```
Real-Time-Shipment-Tracking-Portal/
├── backend/          # Spring Boot API (Java 17, PostgreSQL, JWT)
├── frontend/         # React dashboard (tracking + map, Week 4)
├── README.md         # This file
└── WEEK1_README.md   # Week 1 API details
```

---

## Tech stack

| Part      | Technology              |
|-----------|-------------------------|
| Backend   | Java 17, Spring Boot 3.x |
| Database  | PostgreSQL              |
| Security  | Spring Security + JWT    |
| Frontend  | React (see `frontend/`) |

---

## Run the project

### Backend

```bash
cd backend
```

Set DB (optional): env vars `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, or edit `backend/src/main/resources/application.properties`.

```bash
mvn clean install
mvn spring-boot:run
```

API: **http://localhost:8080**

### Frontend

See `frontend/README.md`. (React app to be added in Week 4.)

---

## Quick API check

- **Register (Shipper):**  
  `POST http://localhost:8080/api/auth/register`  
  Body: `{ "name": "Test Shipper", "email": "shipper@test.com", "password": "password123", "role": "SHIPPER" }`

- **Login:**  
  `POST http://localhost:8080/api/auth/login`  
  Body: `{ "email": "shipper@test.com", "password": "password123" }`  
  Use returned `token` in header: `Authorization: Bearer <token>`

- **Public tracking:**  
  `GET http://localhost:8080/api/shipments/track/{trackingId}`

---

## Backend structure (`backend/`)

```
backend/src/main/java/com/logistics/
├── config/          # Security config
├── controller/      # REST APIs (auth, shipments, bids, marketplace)
├── dto/             # Request/Response objects
├── entity/          # JPA entities (User, Shipment, Bid)
├── exception/       # Global error handling
├── repository/      # Database access
├── security/        # JWT and auth filter
└── service/         # Business logic
```

---

## Notes

- Use **environment variables** for `JWT_SECRET` and DB credentials in production.
- Week 1 details: `WEEK1_README.md` (paths there refer to code under `backend/`).

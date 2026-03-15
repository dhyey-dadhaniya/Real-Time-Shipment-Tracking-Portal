# Real-Time Shipment Tracking Portal

A logistics marketplace where shippers post loads, carriers bid on them, and customers can track shipments. (Internship Project – Task 3)

---

## Tech Stack

| Part           | Technology        |
|----------------|-------------------|
| Language       | Java 17           |
| Backend        | Spring Boot 3.x   |
| Database       | PostgreSQL        |
| API            | REST (JSON)       |
| Security       | Spring Security + JWT |
| Data           | Spring Data JPA   |
| Build          | Maven             |

---

## Prerequisites

- **Java 17** installed
- **Maven** installed
- **PostgreSQL** installed and running
- A database created (e.g. `shipment_tracking`)

---

## Run the Project

### 1. Clone and open project

```bash
git clone <your-repo-url>
cd Real-Time-Shipment-Tracking-Portal
```

### 2. Set database (optional)

By default the app uses:

- URL: `jdbc:postgresql://localhost:5432/shipment_tracking`
- Username: `postgres`
- Password: `postgres`

To change, set environment variables or edit `src/main/resources/application.properties`:

- `DB_URL` – database URL
- `DB_USERNAME` – database username
- `DB_PASSWORD` – database password

### 3. Build and run

```bash
mvn clean install
mvn spring-boot:run
```

Or only run (if already built):

```bash
mvn spring-boot:run
```

App runs at: **http://localhost:8080**

---

## Quick API Check

- **Register (Shipper):**  
  `POST http://localhost:8080/api/auth/register`  
  Body: `{ "name": "Test Shipper", "email": "shipper@test.com", "password": "password123", "role": "SHIPPER" }`

- **Login:**  
  `POST http://localhost:8080/api/auth/login`  
  Body: `{ "email": "shipper@test.com", "password": "password123" }`  
  Use the returned `token` in header: `Authorization: Bearer <token>`

- **Public tracking:**  
  `GET http://localhost:8080/api/shipments/track/{trackingId}`  
  (No login required)

---

## Project Structure (main parts)

```
src/main/java/com/logistics/
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

- Use **environment variables** for `JWT_SECRET` and DB credentials in production; do not commit secrets.
- For detailed Week 1 API usage and day-wise plan, see `WEEK1_README.md`.

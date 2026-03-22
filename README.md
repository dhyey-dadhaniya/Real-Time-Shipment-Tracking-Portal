# 🚚 Real-Time Shipment Tracking Portal

## 📌 Description

A full-stack logistics platform where **shippers** manage loads and marketplace bidding, **carriers** run assigned shipments and publish GPS checkpoints, and **stakeholders** follow routes on an interactive **Leaflet** map. The app uses a **Spring Boot** REST API, **PostgreSQL**, **JWT** auth, and optional **STOMP/WebSocket** updates for live tracking.

## 🚀 Features

* 🔐 JWT-based authentication with shipper / carrier roles
* 🛒 Marketplace for open loads and bidding
* 📍 Shipment tracking with REST history and carrier GPS updates
* 🗺️ Map views (react-leaflet) for tracking and real-time follow-up
* ⚡ Live updates via WebSocket/STOMP on `/topic/shipments/{shipmentId}`
* 🌐 **Public tracking** — no account: `/track` and `/track/{trackingId}` in the UI; public REST endpoints for snapshot and history
* 📱 Responsive UI (Tailwind) for dashboard, marketplace, carriers, and realtime pages

## 🛠️ Tech Stack

**Backend**

* Java 17
* Spring Boot 3.2 (Web, Security, Data JPA, WebSocket)
* PostgreSQL
* Maven
* JWT (jjwt)

**Frontend**

* React 19
* TypeScript
* Vite 8
* Tailwind CSS
* react-leaflet, Leaflet
* Axios, Zustand, `@stomp/stompjs`, React Router 7

## 📂 Project Structure

```
Real-Time-Shipment-Tracking-Portal/
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/logistics/   # REST, JPA, security, WebSocket config
│       └── test/                      # JUnit (e.g. public track API)
├── frontend/
│   ├── index.html
│   ├── vite.config.ts                 # proxy: /api, /ws, /nominatim
│   ├── package.json
│   └── src/
│       ├── api/
│       ├── pages/
│       ├── hooks/
│       └── components/
├── README.md
├── backend/README.md
└── frontend/README.md
```

## ⚙️ Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/Real-Time-Shipment-Tracking-Portal.git
cd Real-Time-Shipment-Tracking-Portal
```

2. **Database** — Create a PostgreSQL database (e.g. `shipment_tracking`).

3. **Backend** — Configure env (or `backend/.env`): `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET` (see [backend/README.md](backend/README.md)).

4. **Frontend** — Copy `frontend/.env.example` to `frontend/.env`. For local dev you can leave `VITE_API_BASE_URL` empty so Vite proxies `/api` and `/ws` to the backend.

5. **Install & run backend**

```bash
cd backend
mvn spring-boot:run
```

API: [http://localhost:8080](http://localhost:8080)

6. **Install & run frontend**

```bash
cd frontend
npm install
npm run dev
```

App: [http://localhost:5173](http://localhost:5173) (or next free port)


## ▶️ Usage

* Register as shipper or carrier, then log in.
* Use **Dashboard**, **Shipment tracking**, **Marketplace**, **Carriers**, and **Realtime** from the main layout (after login).
* **Public track:** open `/track`, enter a tracking ID, or go directly to `/track/{trackingId}` — no login required.
* Carriers publish location updates via the API; subscribed clients see live points on the map over WebSocket where enabled.

## 📸 Screenshots

## carriers
<img width="1917" height="822" alt="image" src="https://github.com/user-attachments/assets/19dc35e8-3939-4192-9a54-a6a488e8dc73" />

## shippers
![image](https://github.com/user-attachments/assets/9150a709-b5a7-42ee-9a22-bce97f4dd3fc)




## 🧪 Testing

**Backend (JUnit 5, H2 test profile)**

```bash
cd backend
mvn test
```

**Frontend (Vitest)**

```bash
cd frontend
npm test
```

For watch mode: `npm run test:watch` in `frontend/`.

## 🤝 Contributing

Pull requests are welcome. For larger changes, open an issue first to discuss scope.

## 📜 License

This project is licensed under the **MIT License** — add or update a `LICENSE` file in the repo root if you publish it.

## 👨‍💻 Author

* **Dhyey Dadhaniya**

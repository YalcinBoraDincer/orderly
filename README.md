# Orderly — Premium Restaurant Management Ecosystem

A fully-integrated, full-stack restaurant operations platform engineered for high-performance service orchestration. Built with a scalable Java/Spring Boot ecosystem and a modern React-based administrative interface with premium glassmorphic aesthetics.

---

## 🛠️ Technology Stack

### 🔙 Backend Engineering
![Java 21](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot 4.0](https://img.shields.io/badge/Spring%20Boot-4.0-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6.x-6DB33F?style=flat-square&logo=springsecurity&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

### 🎨 Frontend & UI
![React 19](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite&logoColor=white)
![Vanilla CSS](https://img.shields.io/badge/CSS-Midnight%20%26%20Gold-1572B6?style=flat-square&logo=css3&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-HTTP-5A29E4?style=flat-square&logo=axios&logoColor=white)

### ⚙️ DevOps & Documentation
![Docker](https://img.shields.io/badge/Docker-Container-2496ED?style=flat-square&logo=docker&logoColor=white)
![OpenAPI 3](https://img.shields.io/badge/Swagger-API%20Docs-85EA2D?style=flat-square&logo=swagger&logoColor=black)
![Maven](https://img.shields.io/badge/Build-Maven-C71A36?style=flat-square&logo=apachemaven&logoColor=white)

---

## 💎 Core Features

- **🔐 Enterprise-Grade Security:** State-of-the-art stateless JWT authentication implementing secure refresh token rotation and fine-grained role-based access control (ADMIN, WAITER, KITCHEN).
- **🎭 'Midnight & Gold' Dashboard:** Real-time interactive venue map providing instantaneous visualization of dynamic table states (Available, Occupied, Reserved) with high-contrast UX.
- **📅 Integrated Reservation Engine:** Dynamic scheduling module with auto-table-blocking logic. Intelligently transitions physical assets from RESERVED to OCCUPIED upon client arrival.
- **🍳 Live KDS (Kitchen Display System):** Multi-stage queue pipeline (`PENDING → PREPARING → READY`) engineered with atomic transactional state updates to ensure absolute process reliability.
- **📦 Order Lifecycle Governance:** Granular item-level control mechanism, robust conflict resolution algorithms preventing state overrides, and streamlined checkout throughput.
- **📱 Contactless Assets:** Automated digital interaction points enabled by server-side high-fidelity QR code emission leveraging the ZXing engine.

---

## ⚡ Deployment Guide

### 🐳 Containerized Deployment (Highly Recommended)

The fastest way to provision both the service ecosystem and interactive frontplane along with robust database persistence.

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/orderly.git
cd orderly

# Trigger multi-stage deterministic build pipelines and daemonize
docker-compose up --build -d
```

Once deployment completes successfully, access metrics are provisioned as follows:

| Component | Network Location | Interface |
| :--- | :--- | :--- |
| **Frontend Client** | [http://localhost:5173](http://localhost:5173) | Web Application |
| **Central API** | [http://localhost:8080](http://localhost:8080) | Core Service |
| **API Schema** | [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) | OpenApi UI |

---

## 📐 Domain Architecture

### 📊 Entity Relationship Matrix

```mermaid
erDiagram
    USER ||--o{ ORDER : takes
    USER ||--o{ REFRESH_TOKEN : owns
    TABLE ||--o{ ORDER : hosts
    TABLE ||--o{ RESERVATION : scheduled_at
    CATEGORY ||--o{ MENU_ITEM : classifies
    ORDER ||--|{ ORDER_ITEM : contains
    MENU_ITEM ||--o{ ORDER_ITEM : instantiates
    ORDER ||--o{ PAYMENT : settled_by
```

### 🏗️ Component Stratification (Backend)

```text
com.bora.orderly
├── 🚪 config/         # Security, CORS, JWT Strategies
├── 📡 controller/     # Exposed REST Boundaries (Contracts & Implementation)
├── 💼 service/        # Orchestration Layer & Transaction Boundaries
├── 💾 repository/     # Spring Data Data-Access Gateways
├── 📦 entity/         # Persistence Identity Models (JPA Hibernate)
├── 📨 dto/            # Ingress Validation (Requests) & Egress Contracts (Responses)
├── 🛠️ exception/      # Standardized Global Error Propagation Handling
└── 📑 enums/          # Rigid State Matrices (Order, Table, Item Statuses)
```

---

## 🚦 Pipeline Workflows

### 🛒 Order Progression Pipeline
```text
NEW ORDER ─► [PENDING] ─► [IN_PROGRESS] ─► [READY] ─► [DELIVERED] ─► [CLOSED/PAID]
                                │                                      │
                                └──────────────────────────────────────┘
                                              CANCELLED
```
*Table lifecycle hooks trigger automated atomic releases back to availability queues upon termination conditions (`CLOSED`, `CANCELLED`).*

### 📅 Reservation State Propagation
```text
DRAFT ─► [PENDING] ─► [CONFIRMED] ──┐ 
                              (Same-Day Event Triggers)
                                    ▼
                        TABLE STATE ◄═► [RESERVED] ─► [COMPLETED] ─► [AVAILABLE]
```

---

## 🛡️ Environment Configuration Matrix

Key variables configured in `docker-compose.yml` / `.env` to drive microservice behavior.

| Matrix Key | Baseline Config | Specification |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://db:5432/orderlydb` | RDBMS connection URI |
| `JWT_SECRET` | `[SHA-256 SALT HASH]` | Cryptographic token signature seed |
| `JWT_EXPIRATION_MS` | `86400000` | Primary credential validity period |
| `VITE_API_URL` | `http://localhost:8080` | Cross-Origin reference link |

---

## 🖋️ Ownership & Licensing

**Authored by:** Bora ([GitHub Profile](https://github.com/YOUR_USERNAME))  
**License Scope:** Open Distributed and transparent under the provisions of the [MIT License](LICENSE).

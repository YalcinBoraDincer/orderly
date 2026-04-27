# 🍽️ Orderly — Restaurant Order Management System

> A production-ready REST API for restaurant management, built with Spring Boot 4, PostgreSQL, and Docker.

---

## 🚀 Tech Stack

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Swagger](https://img.shields.io/badge/Docs-Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)

---

## ✨ Features

- 🔐 **JWT Authentication** with refresh token rotation (access: 24h, refresh: 7 days)
- 👥 **Role-based access control** — ADMIN, WAITER, KITCHEN
- 📋 **Menu & Category management** with soft delete and availability toggle
- 🪑 **Table management** with QR code generation (ZXing)
- 📦 **Full order lifecycle** — `PENDING → IN_PROGRESS → READY → DELIVERED → CLOSED`
- 👨‍🍳 **Kitchen display API** — real-time order queue for kitchen staff
- 🐳 **Dockerized** — single command startup with Docker Compose
- 📖 **Swagger UI** — fully documented API with OpenAPI 3
- ⚡ **Global exception handling** — consistent JSON error responses

---

## 🏃 Quick Start

### With Docker (Recommended)

```bash
git clone https://github.com/YOUR_USERNAME/orderly-api.git
cd orderly-api
docker-compose up
```

That's it. No Java, no PostgreSQL installation needed.

| Service | URL |
|---------|-----|
| API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |

### Without Docker

```bash
# PostgreSQL must be running locally
# Update application.properties with your DB credentials
./mvnw spring-boot:run
```

---

## 📡 API Endpoints

### 🔑 Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login & get tokens |
| POST | `/api/auth/refresh` | ❌ | Refresh access token |
| POST | `/api/auth/logout` | ✅ | Revoke all refresh tokens |

### 📋 Categories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | ❌ | List all active categories |
| GET | `/api/categories/{id}` | ❌ | Get category by ID |
| POST | `/api/categories` | ADMIN | Create category |
| PUT | `/api/categories/{id}` | ADMIN | Update category |
| DELETE | `/api/categories/{id}` | ADMIN | Soft delete category |

### 🍕 Menu Items
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/menu` | ❌ | List available items |
| GET | `/api/menu/{id}` | ❌ | Get item by ID |
| GET | `/api/menu/category/{id}` | ❌ | Filter by category |
| POST | `/api/menu` | ADMIN | Create menu item |
| PUT | `/api/menu/{id}` | ADMIN | Update menu item |
| PATCH | `/api/menu/{id}/availability` | ADMIN | Toggle availability |

### 🪑 Tables
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tables` | ✅ | List all tables with status |
| GET | `/api/tables/{id}` | ✅ | Get table by ID |
| GET | `/api/tables/{id}/qr` | ✅ | Download QR code (PNG) |
| POST | `/api/tables` | ADMIN | Create table |
| PATCH | `/api/tables/{id}/status` | ✅ | Update table status |

### 📦 Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | ✅ | Create new order |
| GET | `/api/orders/{id}` | ✅ | Get order details |
| GET | `/api/orders/table/{id}/active` | ✅ | Get active order for table |
| PATCH | `/api/orders/{id}/status` | ✅ | Update order status |
| POST | `/api/orders/{id}/items` | ✅ | Add items to order |

### 👨‍🍳 Kitchen
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/kitchen/orders` | KITCHEN | List active orders |
| PATCH | `/api/kitchen/orders/{id}/start` | KITCHEN | Start preparing order |
| PATCH | `/api/kitchen/items/{id}/ready` | KITCHEN | Mark item as ready |

---

## 🗄️ Database Schema

```
users ──────────────────────── orders
                                  │
categories ──── menu_items ───────┤
                                  │
restaurant_tables ────────────────┤
                                  │
                             order_items
                                  │
                             menu_items

refresh_tokens ──── users
```

**Tables:** `users`, `categories`, `menu_items`, `restaurant_tables`, `orders`, `order_items`, `refresh_tokens`

---

## 🏗️ Architecture

```
controller/
├── interface (Swagger docs)
└── impl (HTTP mapping)

service/
├── interface (contract)
└── impl (business logic)

repository/       ← Spring Data JPA
entity/           ← JPA models
dto/
├── request/      ← input validation
└── response/     ← API output
enums/            ← UserRole, OrderStatus, TableStatus, ItemStatus
exception/        ← Global error handling
config/           ← Security, JWT, QR Code
```

---

## 🔄 Order Flow

```
Create Order ──→ PENDING ──→ IN_PROGRESS ──→ READY ──→ DELIVERED ──→ CLOSED
                                │                                      │
                                └──────────────────────────────────────┘
                                              CANCELLED
```

When order is **CLOSED** or **CANCELLED** → Table status automatically becomes **AVAILABLE** ✅

---

## 🐳 Docker

```bash
# Start everything
docker-compose up

# Start in background
docker-compose up -d

# Rebuild after code changes
docker-compose up --build

# Stop
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

---

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_URL` | `jdbc:postgresql://localhost:5432/postgres` | Database URL |
| `DB_USERNAME` | `postgres` | DB username |
| `DB_PASSWORD` | `1` | DB password |
| `DB_SCHEMA` | `orderly` | PostgreSQL schema |
| `JWT_SECRET` | `...` | JWT signing secret (min 32 chars) |
| `JWT_EXPIRATION` | `86400000` | Access token TTL (ms) |
| `JWT_REFRESH_EXPIRATION` | `604800000` | Refresh token TTL (ms) |

---

## 👤 Author

**Bora** — [GitHub](https://github.com/YOUR_USERNAME)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

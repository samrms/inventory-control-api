# Inventory Control API

Per-warehouse inventory management with stock transfers, reservations, purchase orders, and audit logging.

## Stack

| Category   | Technology                       |
| ---------- | -------------------------------- |
| Runtime    | Node.js 24                       |
| Framework  | Express 5                        |
| Database   | PostgreSQL 17                    |
| Auth       | JWT + Argon2                     |
| Migrations | node-pg-migrate                  |
| Logging    | Pino                             |
| Security   | Helmet, CORS, express-rate-limit |
| Testing    | Vitest + Supertest               |
| Formatting | Prettier                         |
| CI/CD      | GitHub Actions                   |
| Container  | Docker                           |
| Deploy     | Render                           |

## Requirements

- Node.js 24+
- PostgreSQL 17+
- pnpm 10+

## Getting Started

```bash
cp .env.example .env          # configure env vars
pnpm install                   # install dependencies
pnpm migrate                   # run database migrations
pnpm seed                      # populate database with sample data
pnpm dev                       # start dev server with hot-reload
```

Server runs at `http://localhost:3000`. Health check: `GET /health`.

## Environment Variables

| Variable       | Required | Description                   |
| -------------- | -------- | ----------------------------- |
| `PORT`         | Yes      | Server port (e.g. `3000`)     |
| `DATABASE_URL` | Yes      | PostgreSQL connection string  |
| `JWT_SECRET`   | Yes      | Secret for signing JWT tokens |
| `NODE_ENV`     | No       | `development` or `production` |

## Testing

```bash
pnpm test:unit          # unit tests (no DB needed)
pnpm test:integration   # integration tests (needs PostgreSQL)
pnpm test:e2e           # end-to-end tests (needs PostgreSQL)
pnpm test               # run all tests
```

### Docker Testing

```bash
pnpm test:docker        # spins up test PostgreSQL, runs all tiers, tears down
```

Requires Docker. Uses `docker-compose.test.yml` on port 5433.

## Project Structure

```
src/
  app.js                          # Express app, middleware, route mounting
  server.js                       # Entry point
  config/
    dotenv.js                     # Env var validation
  database/
    connection.js                 # pg Pool
    seed.js                       # Sample data seeder
    migrations/                   # 13 node-pg-migrate files
  modules/
    auth/                         # Register, login (public)
    users/                        # User CRUD (admin)
    products/                     # Product CRUD
    warehouses/                   # Warehouse CRUD
    inventory/                    # Stock receive/issue/adjust
    movements/                    # Stock movement history
    transfers/                    # Inter-warehouse transfers
    reservations/                 # Stock reservations
    suppliers/                    # Supplier CRUD
    purchase-orders/              # Procurement
    audit-logs/                   # Audit trail
    health/                       # Health check
  shared/
    errors/                       # AppError + error middleware
    logger/                       # Pino logger
    middleware/                    # authenticate, authorize
    validation/                   # Pagination parser
    audit/                        # AuditLogRepository
tests/
  unit/                           # Mocked services/controllers
  integration/                    # Repositories against real DB
  e2e/                            # Full HTTP tests with supertest
  helpers/                        # DB setup, auth tokens, e2e bootstrap
```

Each module follows the container pattern:

```
module/
  repository.js       # Data access (pg queries)
  service.js          # Business logic
  controller.js       # HTTP handlers
  routes.js           # Router factory
  validation.js       # Request validation
  module.container.js # DI wiring
  index.js            # Barrel export
```

## Authentication

All routes except `/health` and `/api/v1/auth/*` require a JWT token:

```
Authorization: Bearer <token>
```

Tokens are obtained via `POST /api/v1/auth/login`.

## Roles

| Role       | Permissions                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| `ADMIN`    | Full access to all endpoints                                                                                  |
| `MANAGER`  | CRUD on products, warehouses, suppliers; receive/issue/adjust stock; transfers, reservations, purchase orders |
| `OPERATOR` | Read access; issue stock; create/release/fulfill reservations                                                 |

## Pagination

All list endpoints support pagination:

| Param   | Default | Max   |
| ------- | ------- | ----- |
| `page`  | `1`     | -     |
| `limit` | `20`    | `100` |

Response shape:

```json
{
    "data": [],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 100,
        "totalPages": 5
    }
}
```

## API Reference

Base URL: `/api/v1`

### Auth

| Method | Path             | Auth | Description        |
| ------ | ---------------- | ---- | ------------------ |
| `POST` | `/auth/register` | -    | Register user      |
| `POST` | `/auth/login`    | -    | Login, returns JWT |

**Register body:** `name` (required), `email` (required), `password` (min 6 chars)

**Login body:** `email`, `password`

---

### Users

| Method   | Path         | Auth  | Description      |
| -------- | ------------ | ----- | ---------------- |
| `GET`    | `/users`     | ADMIN | List users       |
| `GET`    | `/users/:id` | ADMIN | Get user         |
| `PATCH`  | `/users/:id` | ADMIN | Update user role |
| `DELETE` | `/users/:id` | ADMIN | Soft-delete user |

---

### Products

| Method   | Path            | Auth           | Description                                     |
| -------- | --------------- | -------------- | ----------------------------------------------- |
| `GET`    | `/products`     | Any            | List products (supports `?search`, `?category`) |
| `GET`    | `/products/:id` | Any            | Get product                                     |
| `POST`   | `/products`     | ADMIN, MANAGER | Create product                                  |
| `PATCH`  | `/products/:id` | ADMIN, MANAGER | Update product                                  |
| `DELETE` | `/products/:id` | ADMIN, MANAGER | Soft-delete product                             |

**Create body:** `sku` (required, unique), `name` (required), `price`, `cost`, `description`, `category`, `unit`, `minimumStock`, `maximumStock`

---

### Warehouses

| Method   | Path              | Auth           | Description           |
| -------- | ----------------- | -------------- | --------------------- |
| `GET`    | `/warehouses`     | Any            | List warehouses       |
| `GET`    | `/warehouses/:id` | Any            | Get warehouse         |
| `POST`   | `/warehouses`     | ADMIN, MANAGER | Create warehouse      |
| `PATCH`  | `/warehouses/:id` | ADMIN, MANAGER | Update warehouse      |
| `DELETE` | `/warehouses/:id` | ADMIN, MANAGER | Soft-delete warehouse |

**Create body:** `code` (required, unique), `name` (required), `address`

---

### Inventory

| Method | Path                                 | Auth                     | Description                                            |
| ------ | ------------------------------------ | ------------------------ | ------------------------------------------------------ |
| `GET`  | `/inventory`                         | Any                      | List inventory (supports `?warehouseId`, `?productId`) |
| `GET`  | `/inventory/summary`                 | Any                      | Stock summary                                          |
| `GET`  | `/inventory/low-stock`               | Any                      | Items below minimum stock                              |
| `GET`  | `/inventory/:warehouseId/:productId` | Any                      | Stock for a product in a warehouse                     |
| `POST` | `/inventory/receive`                 | ADMIN, MANAGER           | Receive stock                                          |
| `POST` | `/inventory/issue`                   | ADMIN, MANAGER, OPERATOR | Issue stock                                            |
| `POST` | `/inventory/adjust`                  | ADMIN, MANAGER           | Adjust stock                                           |

**Receive/Issue body:** `warehouseId`, `productId`, `quantity` (> 0)

**Adjust body:** `warehouseId`, `productId`, `quantity`, `type` (`ADJUSTMENT_IN` or `ADJUSTMENT_OUT`)

---

### Movements

| Method | Path         | Auth | Description          |
| ------ | ------------ | ---- | -------------------- |
| `GET`  | `/movements` | Any  | List stock movements |

---

### Transfers

| Method | Path                      | Auth           | Description                         |
| ------ | ------------------------- | -------------- | ----------------------------------- |
| `GET`  | `/transfers`              | Any            | List transfers (supports `?status`) |
| `GET`  | `/transfers/:id`          | Any            | Get transfer with items             |
| `POST` | `/transfers`              | ADMIN, MANAGER | Create transfer                     |
| `POST` | `/transfers/:id/complete` | ADMIN, MANAGER | Complete transfer (moves stock)     |
| `POST` | `/transfers/:id/cancel`   | ADMIN, MANAGER | Cancel pending transfer             |

**Create body:** `sourceWarehouseId`, `destinationWarehouseId` (must differ), `items` (array of `{ productId, quantity }`)

**Status flow:** `PENDING` -> `COMPLETED` or `CANCELLED`

---

### Reservations

| Method | Path                        | Auth                     | Description         |
| ------ | --------------------------- | ------------------------ | ------------------- |
| `GET`  | `/reservations`             | Any                      | List reservations   |
| `GET`  | `/reservations/:id`         | Any                      | Get reservation     |
| `POST` | `/reservations`             | ADMIN, MANAGER, OPERATOR | Create reservation  |
| `POST` | `/reservations/:id/release` | ADMIN, MANAGER, OPERATOR | Release reservation |
| `POST` | `/reservations/:id/fulfill` | ADMIN, MANAGER, OPERATOR | Fulfill reservation |

**Create body:** `warehouseId`, `productId`, `quantity` (> 0)

**Status flow:** `ACTIVE` -> `RELEASED` or `FULFILLED` or `EXPIRED`

---

### Suppliers

| Method   | Path             | Auth           | Description          |
| -------- | ---------------- | -------------- | -------------------- |
| `GET`    | `/suppliers`     | Any            | List suppliers       |
| `GET`    | `/suppliers/:id` | Any            | Get supplier         |
| `POST`   | `/suppliers`     | ADMIN, MANAGER | Create supplier      |
| `PATCH`  | `/suppliers/:id` | ADMIN, MANAGER | Update supplier      |
| `DELETE` | `/suppliers/:id` | ADMIN, MANAGER | Soft-delete supplier |

**Create body:** `name` (required), `email`, `phone`, `address`, `contactPerson`

---

### Purchase Orders

| Method | Path                           | Auth           | Description                   |
| ------ | ------------------------------ | -------------- | ----------------------------- |
| `GET`  | `/purchase-orders`             | Any            | List purchase orders          |
| `GET`  | `/purchase-orders/:id`         | Any            | Get purchase order with items |
| `POST` | `/purchase-orders`             | ADMIN, MANAGER | Create purchase order         |
| `POST` | `/purchase-orders/:id/receive` | ADMIN, MANAGER | Receive PO (adds stock)       |
| `POST` | `/purchase-orders/:id/cancel`  | ADMIN, MANAGER | Cancel PO                     |

**Create body:** `supplierId`, `warehouseId`, `items` (array of `{ productId, quantity, unitCost }`)

**Status flow:** `DRAFT` -> `ORDERED` -> `PARTIALLY_RECEIVED` / `RECEIVED` / `CANCELLED`

---

### Audit Logs

| Method | Path          | Auth  | Description     |
| ------ | ------------- | ----- | --------------- |
| `GET`  | `/audit-logs` | ADMIN | List audit logs |

---

### Health

| Method | Path      | Auth | Description                                  |
| ------ | --------- | ---- | -------------------------------------------- |
| `GET`  | `/health` | -    | Returns `{ status: "ok", timestamp: "..." }` |

## Database Schema

12 tables with UUID primary keys, foreign keys with `ON DELETE CASCADE`, and soft deletes (`deleted_at`) on `users`, `products`, `warehouses`, and `suppliers`.

Run `pnpm migrate` to apply migrations. Create a new migration with `pnpm migrate:create <name>`.

## Docker

```bash
docker compose up -d          # start postgres + api
docker compose down           # stop all services
```

## Deployment (Render)

1. Push to `main` branch
2. Add `RENDER_SERVICE_ID` and `RENDER_API_KEY` as GitHub repo secrets
3. CI runs all test tiers on push/PR
4. Merges to `main` trigger auto-deploy via `render.yaml` (runs migrations, starts server)

**render.yaml** provisions a free PostgreSQL database and links it to the web service.

## License

MIT

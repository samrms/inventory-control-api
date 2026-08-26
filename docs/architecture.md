# Architecture

## Project Structure

```
src/
  app.js                          # Express app, middleware, route mounting
  server.js                       # Entry point
  config/
    dotenv.js                     # Env var validation
  database/
    connection.js                 # pg Pool
    migrations/                   # 14 node-pg-migrate files
  modules/
    auth/                         # Sign-up, sign-in, logout
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

## Module Pattern

Each module follows the container pattern:

```
module/
  *.repository.js       # Data access (pg queries)
  *.service.js          # Business logic
  *.controller.js       # HTTP handlers
  *.validation.js       # Request validation
  *.container.js        # DI wiring + router
```

All dependencies are injected via constructors through container files. No direct imports between modules.

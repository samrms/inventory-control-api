# API Reference

Base URL: `/api/v1`

## Authentication

All routes except `/health` and `/api/v1/auth/*` require a JWT token:

```
Authorization: Bearer <token>
```

Tokens are obtained via `POST /api/v1/auth/sign-in`.

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

## Endpoints

### Auth

| Method | Path            | Auth | Description          |
| ------ | --------------- | ---- | -------------------- |
| `POST` | `/auth/sign-up` | -    | Sign up              |
| `POST` | `/auth/sign-in` | -    | Sign in, returns JWT |
| `POST` | `/auth/logout`  | JWT  | Revoke current token |

**Sign-up body:** `name` (required), `email` (required), `password` (min 6 chars)

**Sign-in body:** `email`, `password`

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

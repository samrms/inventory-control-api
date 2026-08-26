# Database

PostgreSQL 17 with node-pg-migrate for schema management.

## Tables

| Table                  | Description                      |
| ---------------------- | -------------------------------- |
| `users`                | User accounts with roles         |
| `products`             | Product catalog                  |
| `warehouses`           | Warehouse locations              |
| `inventory`            | Per-warehouse stock levels       |
| `stock_movements`      | Stock increase/decrease history  |
| `transfers`            | Inter-warehouse transfer headers |
| `transfer_items`       | Products within a transfer       |
| `reservations`         | Stock reservations               |
| `suppliers`            | Supplier registry                |
| `purchase_orders`      | Procurement headers              |
| `purchase_order_items` | Products within a purchase order |
| `audit_logs`           | Audit trail for all mutations    |
| `revoked_tokens`       | JWT blacklist for logout         |

## Conventions

- UUID primary keys (`gen_random_uuid()`)
- Foreign keys with `ON DELETE CASCADE` or `ON DELETE SET NULL`
- Soft deletes (`deleted_at`) on `users`, `products`, `warehouses`, `suppliers`
- `created_at` and `updated_at` timestamps on most tables

## Migrations

```bash
pnpm migrate                                    # apply pending migrations
npx node-pg-migrate down --migrations-dir src/database/migrations  # rollback last
npx node-pg-migrate create --migrations-dir src/database/migrations <name>  # create new
```

14 migration files in `src/database/migrations/`.

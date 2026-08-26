import {
    parsePagination,
    paginateResponse,
} from '../../shared/validation/pagination.js'

export class InventoryRepository {
    constructor(pool) {
        this.pool = pool
    }

    async findAll(query) {
        const { limit, offset, page } = parsePagination(query)
        const conditions = []
        const params = []
        let paramIndex = 1

        if (query.warehouseId) {
            conditions.push(`i.warehouse_id = $${paramIndex++}`)
            params.push(query.warehouseId)
        }

        if (query.productId) {
            conditions.push(`i.product_id = $${paramIndex++}`)
            params.push(query.productId)
        }

        const where =
            conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

        const countResult = await this.pool.query(
            `SELECT COUNT(*) FROM inventory i ${where}`,
            params
        )

        const result = await this.pool.query(
            `SELECT i.*, w.code AS warehouse_code, w.name AS warehouse_name,
                    p.sku, p.name AS product_name, p.unit,
                    (i.quantity - i.reserved_quantity) AS available_stock
             FROM inventory i
             JOIN warehouses w ON w.id = i.warehouse_id AND w.deleted_at IS NULL
             JOIN products p ON p.id = i.product_id AND p.deleted_at IS NULL
             ${where}
             ORDER BY w.code, p.sku
             LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
            [...params, limit, offset]
        )

        return paginateResponse(
            result.rows,
            parseInt(countResult.rows[0].count),
            page,
            limit
        )
    }

    async findByWarehouseAndProduct(warehouseId, productId) {
        const result = await this.pool.query(
            `SELECT i.*, w.code AS warehouse_code, p.sku, p.name AS product_name,
                    (i.quantity - i.reserved_quantity) AS available_stock
             FROM inventory i
             JOIN warehouses w ON w.id = i.warehouse_id AND w.deleted_at IS NULL
             JOIN products p ON p.id = i.product_id AND p.deleted_at IS NULL
             WHERE i.warehouse_id = $1 AND i.product_id = $2`,
            [warehouseId, productId]
        )
        return result.rows[0] || null
    }

    async findLowStock(query) {
        const { limit, offset, page } = parsePagination(query)

        const countResult = await this.pool.query(
            `SELECT COUNT(*)
             FROM inventory i
             JOIN products p ON p.id = i.product_id AND p.deleted_at IS NULL
             WHERE i.quantity < p.minimum_stock`
        )

        const result = await this.pool.query(
            `SELECT i.*, w.code AS warehouse_code, w.name AS warehouse_name,
                    p.sku, p.name AS product_name, p.minimum_stock, p.maximum_stock,
                    (i.quantity - i.reserved_quantity) AS available_stock
             FROM inventory i
             JOIN products p ON p.id = i.product_id AND p.deleted_at IS NULL
             JOIN warehouses w ON w.id = i.warehouse_id AND w.deleted_at IS NULL
             WHERE i.quantity < p.minimum_stock
             ORDER BY (i.quantity::float / NULLIF(p.minimum_stock, 0)) ASC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        )

        return paginateResponse(
            result.rows,
            parseInt(countResult.rows[0].count),
            page,
            limit
        )
    }

    async getSummary() {
        const result = await this.pool.query(
            `SELECT
                (SELECT COUNT(*) FROM products WHERE deleted_at IS NULL) AS total_products,
                (SELECT COUNT(*) FROM warehouses WHERE deleted_at IS NULL) AS total_warehouses,
                COALESCE(SUM(quantity), 0) AS total_units,
                COALESCE(SUM(reserved_quantity), 0) AS reserved_units,
                (SELECT COUNT(*)
                 FROM inventory i
                 JOIN products p ON p.id = i.product_id AND p.deleted_at IS NULL
                 WHERE i.quantity < p.minimum_stock) AS low_stock_items
             FROM inventory`
        )
        return result.rows[0]
    }

    async lockAndFind(warehouseId, productId, client) {
        const result = await client.query(
            `SELECT * FROM inventory
             WHERE warehouse_id = $1 AND product_id = $2
             FOR UPDATE`,
            [warehouseId, productId]
        )
        return result.rows[0] || null
    }

    async upsert(warehouseId, productId, quantityChange, client) {
        const result = await client.query(
            `INSERT INTO inventory (warehouse_id, product_id, quantity, reserved_quantity)
             VALUES ($1, $2, $3, 0)
             ON CONFLICT (warehouse_id, product_id)
             DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity,
                          updated_at = NOW()
             RETURNING *`,
            [warehouseId, productId, quantityChange]
        )
        return result.rows[0]
    }

    async incrementReserved(warehouseId, productId, amount, client) {
        const result = await client.query(
            `UPDATE inventory
             SET reserved_quantity = reserved_quantity + $3,
                 updated_at = NOW()
             WHERE warehouse_id = $1 AND product_id = $2
             RETURNING *`,
            [warehouseId, productId, amount]
        )
        return result.rows[0]
    }

    async decrementReserved(warehouseId, productId, amount, client) {
        const result = await client.query(
            `UPDATE inventory
             SET reserved_quantity = reserved_quantity - $3,
                 updated_at = NOW()
             WHERE warehouse_id = $1 AND product_id = $2
             RETURNING *`,
            [warehouseId, productId, amount]
        )
        return result.rows[0]
    }

    async decrementQuantity(warehouseId, productId, amount, client) {
        const result = await client.query(
            `UPDATE inventory
             SET quantity = quantity - $3,
                 updated_at = NOW()
             WHERE warehouse_id = $1 AND product_id = $2
             RETURNING *`,
            [warehouseId, productId, amount]
        )
        return result.rows[0]
    }
}

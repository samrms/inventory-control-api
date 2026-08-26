export class PurchaseOrdersRepository {
    constructor(pool, parsePagination, paginateResponse) {
        this.pool = pool
        this.parsePagination = parsePagination
        this.paginateResponse = paginateResponse
    }

    async findAll(query) {
        const { limit, offset, page } = this.parsePagination(query)
        const conditions = []
        const params = []
        let paramIndex = 1

        if (query.status) {
            conditions.push(`po.status = $${paramIndex++}`)
            params.push(query.status)
        }

        if (query.supplierId) {
            conditions.push(`po.supplier_id = $${paramIndex++}`)
            params.push(query.supplierId)
        }

        if (query.warehouseId) {
            conditions.push(`po.warehouse_id = $${paramIndex++}`)
            params.push(query.warehouseId)
        }

        const where =
            conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

        const countResult = await this.pool.query(
            `SELECT COUNT(*) FROM purchase_orders po ${where}`,
            params
        )

        const result = await this.pool.query(
            `SELECT po.*,
                    s.name AS supplier_name,
                    w.code AS warehouse_code, w.name AS warehouse_name,
                    u.name AS created_by_name
             FROM purchase_orders po
             JOIN suppliers s ON s.id = po.supplier_id AND s.deleted_at IS NULL
             JOIN warehouses w ON w.id = po.warehouse_id AND w.deleted_at IS NULL
             JOIN users u ON u.id = po.created_by AND u.deleted_at IS NULL
             ${where}
             ORDER BY po.created_at DESC
             LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
            [...params, limit, offset]
        )

        return this.paginateResponse(
            result.rows,
            parseInt(countResult.rows[0].count),
            page,
            limit
        )
    }

    async findById(id) {
        const result = await this.pool.query(
            `SELECT po.*,
                    s.name AS supplier_name,
                    w.code AS warehouse_code, w.name AS warehouse_name
             FROM purchase_orders po
             JOIN suppliers s ON s.id = po.supplier_id AND s.deleted_at IS NULL
             JOIN warehouses w ON w.id = po.warehouse_id AND w.deleted_at IS NULL
             WHERE po.id = $1`,
            [id]
        )
        return result.rows[0] || null
    }

    async findItems(purchaseOrderId) {
        const result = await this.pool.query(
            `SELECT poi.*, p.sku, p.name AS product_name
             FROM purchase_order_items poi
             JOIN products p ON p.id = poi.product_id AND p.deleted_at IS NULL
             WHERE poi.purchase_order_id = $1`,
            [purchaseOrderId]
        )
        return result.rows
    }

    async create({ supplierId, warehouseId, items, createdBy }, client) {
        const conn = client || this.pool

        const poResult = await conn.query(
            `INSERT INTO purchase_orders (supplier_id, warehouse_id, created_by)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [supplierId, warehouseId, createdBy]
        )
        const po = poResult.rows[0]

        for (const item of items) {
            await conn.query(
                `INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_cost)
                 VALUES ($1, $2, $3, $4)`,
                [po.id, item.productId, item.quantity, item.unitCost]
            )
        }

        return po
    }

    async updateStatus(id, status, client) {
        const conn = client || this.pool
        const result = await conn.query(
            `UPDATE purchase_orders
             SET status = $1, updated_at = NOW()
             WHERE id = $2
             RETURNING *`,
            [status, id]
        )
        return result.rows[0] || null
    }
}

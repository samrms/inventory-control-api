export class ReservationsRepository {
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

        if (query.warehouseId) {
            conditions.push(`r.warehouse_id = $${paramIndex++}`)
            params.push(query.warehouseId)
        }

        if (query.productId) {
            conditions.push(`r.product_id = $${paramIndex++}`)
            params.push(query.productId)
        }

        if (query.status) {
            conditions.push(`r.status = $${paramIndex++}`)
            params.push(query.status)
        }

        const where =
            conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

        const countResult = await this.pool.query(
            `SELECT COUNT(*) FROM reservations r ${where}`,
            params
        )

        const result = await this.pool.query(
            `SELECT r.*,
                    w.code AS warehouse_code,
                    p.sku, p.name AS product_name,
                    u.name AS created_by_name
             FROM reservations r
             JOIN warehouses w ON w.id = r.warehouse_id AND w.deleted_at IS NULL
             JOIN products p ON p.id = r.product_id AND p.deleted_at IS NULL
             JOIN users u ON u.id = r.created_by AND u.deleted_at IS NULL
             ${where}
             ORDER BY r.created_at DESC
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
            `SELECT r.*,
                    w.code AS warehouse_code,
                    p.sku, p.name AS product_name
             FROM reservations r
             JOIN warehouses w ON w.id = r.warehouse_id AND w.deleted_at IS NULL
             JOIN products p ON p.id = r.product_id AND p.deleted_at IS NULL
             WHERE r.id = $1`,
            [id]
        )
        return result.rows[0] || null
    }

    async create(
        { warehouseId, productId, quantity, reference, expiresAt, createdBy },
        client
    ) {
        const conn = client || this.pool
        const result = await conn.query(
            `INSERT INTO reservations (warehouse_id, product_id, quantity, reference, expires_at, created_by)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
                warehouseId,
                productId,
                quantity,
                reference || null,
                expiresAt || null,
                createdBy,
            ]
        )
        return result.rows[0]
    }

    async updateStatus(id, status, client) {
        const conn = client || this.pool
        const result = await conn.query(
            `UPDATE reservations SET status = $1 WHERE id = $2 RETURNING *`,
            [status, id]
        )
        return result.rows[0] || null
    }
}

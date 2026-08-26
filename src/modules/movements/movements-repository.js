import {
    parsePagination,
    paginateResponse,
} from '../../shared/validation/pagination.js'

export class MovementsRepository {
    constructor(pool) {
        this.pool = pool
    }

    async findAll(query) {
        const { limit, offset, page } = parsePagination(query)
        const conditions = []
        const params = []
        let paramIndex = 1

        if (query.warehouseId) {
            conditions.push(`m.warehouse_id = $${paramIndex++}`)
            params.push(query.warehouseId)
        }

        if (query.productId) {
            conditions.push(`m.product_id = $${paramIndex++}`)
            params.push(query.productId)
        }

        if (query.type) {
            conditions.push(`m.type = $${paramIndex++}`)
            params.push(query.type)
        }

        if (query.userId) {
            conditions.push(`m.user_id = $${paramIndex++}`)
            params.push(query.userId)
        }

        const where =
            conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

        const countResult = await this.pool.query(
            `SELECT COUNT(*) FROM stock_movements m ${where}`,
            params
        )

        const result = await this.pool.query(
            `SELECT m.*,
                    w.code AS warehouse_code,
                    p.sku, p.name AS product_name,
                    u.name AS user_name
             FROM stock_movements m
             JOIN warehouses w ON w.id = m.warehouse_id AND w.deleted_at IS NULL
             JOIN products p ON p.id = m.product_id AND p.deleted_at IS NULL
             JOIN users u ON u.id = m.user_id AND u.deleted_at IS NULL
             ${where}
             ORDER BY m.created_at DESC
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
}

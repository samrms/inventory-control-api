import {
    parsePagination,
    paginateResponse,
} from '../../shared/validation/pagination.js'

export class TransfersRepository {
    constructor(pool) {
        this.pool = pool
    }

    async findAll(query) {
        const { limit, offset, page } = parsePagination(query)
        const conditions = []
        const params = []
        let paramIndex = 1

        if (query.status) {
            conditions.push(`t.status = $${paramIndex++}`)
            params.push(query.status)
        }

        if (query.sourceWarehouseId) {
            conditions.push(`t.source_warehouse_id = $${paramIndex++}`)
            params.push(query.sourceWarehouseId)
        }

        if (query.destinationWarehouseId) {
            conditions.push(`t.destination_warehouse_id = $${paramIndex++}`)
            params.push(query.destinationWarehouseId)
        }

        const where =
            conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

        const countResult = await this.pool.query(
            `SELECT COUNT(*) FROM transfers t ${where}`,
            params
        )

        const result = await this.pool.query(
            `SELECT t.*,
                    sw.code AS source_code, sw.name AS source_name,
                    dw.code AS dest_code, dw.name AS dest_name,
                    u.name AS created_by_name
             FROM transfers t
             JOIN warehouses sw ON sw.id = t.source_warehouse_id AND sw.deleted_at IS NULL
             JOIN warehouses dw ON dw.id = t.destination_warehouse_id AND dw.deleted_at IS NULL
             JOIN users u ON u.id = t.created_by AND u.deleted_at IS NULL
             ${where}
             ORDER BY t.created_at DESC
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

    async findById(id) {
        const result = await this.pool.query(
            `SELECT t.*,
                    sw.code AS source_code, sw.name AS source_name,
                    dw.code AS dest_code, dw.name AS dest_name
             FROM transfers t
             JOIN warehouses sw ON sw.id = t.source_warehouse_id AND sw.deleted_at IS NULL
             JOIN warehouses dw ON dw.id = t.destination_warehouse_id AND dw.deleted_at IS NULL
             WHERE t.id = $1`,
            [id]
        )
        return result.rows[0] || null
    }

    async findItems(transferId) {
        const result = await this.pool.query(
            `SELECT ti.*, p.sku, p.name AS product_name
             FROM transfer_items ti
             JOIN products p ON p.id = ti.product_id AND p.deleted_at IS NULL
             WHERE ti.transfer_id = $1`,
            [transferId]
        )
        return result.rows
    }

    async create(
        { sourceWarehouseId, destinationWarehouseId, items, createdBy },
        client
    ) {
        const conn = client || this.pool

        const transferResult = await conn.query(
            `INSERT INTO transfers (source_warehouse_id, destination_warehouse_id, created_by)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [sourceWarehouseId, destinationWarehouseId, createdBy]
        )
        const transfer = transferResult.rows[0]

        for (const item of items) {
            await conn.query(
                `INSERT INTO transfer_items (transfer_id, product_id, quantity)
                 VALUES ($1, $2, $3)`,
                [transfer.id, item.productId, item.quantity]
            )
        }

        return transfer
    }

    async updateStatus(id, status, client) {
        const conn = client || this.pool
        const result = await conn.query(
            `UPDATE transfers
             SET status = $2::VARCHAR(20),
                 completed_at = CASE WHEN $2 = 'COMPLETED' THEN NOW() ELSE completed_at END
             WHERE id = $1
             RETURNING *`,
            [id, status]
        )
        return result.rows[0] || null
    }
}

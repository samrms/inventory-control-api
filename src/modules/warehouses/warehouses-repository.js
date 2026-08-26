import {
    parsePagination,
    paginateResponse,
} from '../../shared/validation/pagination.js'

export class WarehousesRepository {
    constructor(pool) {
        this.pool = pool
    }

    async findAll(query) {
        const { limit, offset, page } = parsePagination(query)
        const conditions = ['w.deleted_at IS NULL']
        const params = []
        let paramIndex = 1

        if (query.search) {
            conditions.push(
                `(w.name ILIKE $${paramIndex} OR w.code ILIKE $${paramIndex})`
            )
            params.push(`%${query.search}%`)
            paramIndex++
        }

        const where = `WHERE ${conditions.join(' AND ')}`

        const countResult = await this.pool.query(
            `SELECT COUNT(*) FROM warehouses w ${where}`,
            params
        )

        const result = await this.pool.query(
            `SELECT w.*
             FROM warehouses w
             ${where}
             ORDER BY w.created_at DESC
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
            'SELECT * FROM warehouses WHERE id = $1 AND deleted_at IS NULL',
            [id]
        )
        return result.rows[0] || null
    }

    async findByCode(code) {
        const result = await this.pool.query(
            'SELECT * FROM warehouses WHERE code = $1 AND deleted_at IS NULL',
            [code]
        )
        return result.rows[0] || null
    }

    async create({ code, name, description, address }) {
        const result = await this.pool.query(
            `INSERT INTO warehouses (code, name, description, address)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [code, name, description || null, address || null]
        )
        return result.rows[0]
    }

    async update(id, data) {
        const result = await this.pool.query(
            `UPDATE warehouses
             SET name = COALESCE($1, name),
                 description = COALESCE($2, description),
                 address = COALESCE($3, address),
                 updated_at = NOW()
             WHERE id = $4 AND deleted_at IS NULL
             RETURNING *`,
            [data.name, data.description, data.address, id]
        )
        return result.rows[0] || null
    }

    async delete(id) {
        const result = await this.pool.query(
            `UPDATE warehouses SET deleted_at = NOW(), updated_at = NOW()
             WHERE id = $1 AND deleted_at IS NULL
             RETURNING *`,
            [id]
        )
        return result.rows[0] || null
    }
}

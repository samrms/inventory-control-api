import {
    parsePagination,
    paginateResponse,
} from '../../shared/validation/pagination.js'

export class SuppliersRepository {
    constructor(pool) {
        this.pool = pool
    }

    async findAll(query) {
        const { limit, offset, page } = parsePagination(query)
        const conditions = ['s.deleted_at IS NULL']
        const params = []
        let paramIndex = 1

        if (query.search) {
            conditions.push(
                `(s.name ILIKE $${paramIndex} OR s.document ILIKE $${paramIndex})`
            )
            params.push(`%${query.search}%`)
            paramIndex++
        }

        const where = `WHERE ${conditions.join(' AND ')}`

        const countResult = await this.pool.query(
            `SELECT COUNT(*) FROM suppliers s ${where}`,
            params
        )

        const result = await this.pool.query(
            `SELECT s.*
             FROM suppliers s
             ${where}
             ORDER BY s.created_at DESC
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
            'SELECT * FROM suppliers WHERE id = $1 AND deleted_at IS NULL',
            [id]
        )
        return result.rows[0] || null
    }

    async create({ name, document, email, phone }) {
        const result = await this.pool.query(
            `INSERT INTO suppliers (name, document, email, phone)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [name, document || null, email || null, phone || null]
        )
        return result.rows[0]
    }

    async update(id, data) {
        const result = await this.pool.query(
            `UPDATE suppliers
             SET name = COALESCE($1, name),
                 document = COALESCE($2, document),
                 email = COALESCE($3, email),
                 phone = COALESCE($4, phone),
                 updated_at = NOW()
             WHERE id = $5 AND deleted_at IS NULL
             RETURNING *`,
            [data.name, data.document, data.email, data.phone, id]
        )
        return result.rows[0] || null
    }

    async delete(id) {
        const result = await this.pool.query(
            `UPDATE suppliers SET deleted_at = NOW(), updated_at = NOW()
             WHERE id = $1 AND deleted_at IS NULL
             RETURNING *`,
            [id]
        )
        return result.rows[0] || null
    }
}

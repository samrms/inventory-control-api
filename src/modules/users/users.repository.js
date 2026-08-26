export class UsersRepository {
    constructor(pool, parsePagination, paginateResponse) {
        this.pool = pool
        this.parsePagination = parsePagination
        this.paginateResponse = paginateResponse
    }

    async findAll(query) {
        const { limit, offset, page } = this.parsePagination(query)
        const conditions = ['deleted_at IS NULL']
        const params = []
        let paramIndex = 1

        if (query.search) {
            conditions.push(
                `(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`
            )
            params.push(`%${query.search}%`)
            paramIndex++
        }

        const where = `WHERE ${conditions.join(' AND ')}`

        const countResult = await this.pool.query(
            `SELECT COUNT(*) FROM users ${where}`,
            params
        )

        const result = await this.pool.query(
            `SELECT id, name, email, role, created_at, updated_at
             FROM users ${where}
             ORDER BY created_at DESC
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
            `SELECT id, name, email, role, created_at, updated_at
             FROM users WHERE id = $1 AND deleted_at IS NULL`,
            [id]
        )
        return result.rows[0] || null
    }

    async update(id, { name, email, role }) {
        const result = await this.pool.query(
            `UPDATE users
             SET name = COALESCE($1, name),
                 email = COALESCE($2, email),
                 role = COALESCE($3, role),
                 updated_at = NOW()
             WHERE id = $4 AND deleted_at IS NULL
             RETURNING id, name, email, role, created_at, updated_at`,
            [name, email, role, id]
        )
        return result.rows[0] || null
    }

    async delete(id) {
        const result = await this.pool.query(
            `UPDATE users SET deleted_at = NOW(), updated_at = NOW()
             WHERE id = $1 AND deleted_at IS NULL
             RETURNING id, name, email, role`,
            [id]
        )
        return result.rows[0] || null
    }
}

export class AuditLogsRepository {
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

        if (query.userId) {
            conditions.push(`a.user_id = $${paramIndex++}`)
            params.push(query.userId)
        }

        if (query.entityType) {
            conditions.push(`a.entity_type = $${paramIndex++}`)
            params.push(query.entityType)
        }

        if (query.action) {
            conditions.push(`a.action = $${paramIndex++}`)
            params.push(query.action)
        }

        const where =
            conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

        const countResult = await this.pool.query(
            `SELECT COUNT(*) FROM audit_logs a ${where}`,
            params
        )

        const result = await this.pool.query(
            `SELECT a.*, u.name AS user_name
             FROM audit_logs a
             LEFT JOIN users u ON u.id = a.user_id AND u.deleted_at IS NULL
             ${where}
             ORDER BY a.created_at DESC
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
}

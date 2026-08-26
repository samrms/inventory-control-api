export class AuditLogRepository {
    constructor(pool) {
        this.pool = pool
    }

    async create({ userId, action, entityType, entityId, metadata }, client) {
        const conn = client || this.pool
        await conn.query(
            `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
             VALUES ($1, $2, $3, $4, $5)`,
            [userId, action, entityType, entityId, metadata || null]
        )
    }
}

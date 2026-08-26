export class AuthRepository {
    constructor(pool) {
        this.pool = pool
    }

    async findByEmail(email) {
        const result = await this.pool.query(
            'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
            [email]
        )
        return result.rows[0] || null
    }

    async create({ name, email, passwordHash, role }) {
        const result = await this.pool.query(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, email, role, created_at`,
            [name, email, passwordHash, role]
        )
        return result.rows[0]
    }
}

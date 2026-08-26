import crypto from 'crypto'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { env } from '../../config/dotenv.js'
export class AuthService {
    constructor(authRepository, pool, AppError) {
        this.authRepository = authRepository
        this.pool = pool
        this.AppError = AppError
    }

    async signUp({ name, email, password }) {
        const existing = await this.authRepository.findByEmail(email)
        if (existing) {
            throw new this.AppError('Email already in use', 409)
        }

        const passwordHash = await argon2.hash(password)
        try {
            return await this.authRepository.create({
                name,
                email,
                passwordHash,
                role: 'OPERATOR',
            })
        } catch (err) {
            if (err.code === '23505') {
                throw new this.AppError('Email already in use', 409)
            }
            throw err
        }
    }

    async signIn({ email, password }) {
        const user = await this.authRepository.findByEmail(email)
        if (!user) {
            throw new this.AppError('Invalid credentials', 401)
        }

        if (user.deleted_at) {
            throw new this.AppError('Account is disabled', 403)
        }

        const valid = await argon2.verify(user.password_hash, password)
        if (!valid) {
            throw new this.AppError('Invalid credentials', 401)
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            env.jwt_secret,
            { expiresIn: '24h' }
        )

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        }
    }

    async logout(token) {
        const decoded = jwt.decode(token)
        if (!decoded || !decoded.exp) {
            throw new this.AppError('Invalid token', 400)
        }

        const tokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex')

        const expiresAt = new Date(decoded.exp * 1000)

        await this.pool.query(
            `INSERT INTO revoked_tokens (token_hash, user_id, expires_at)
             VALUES ($1, $2, $3)
             ON CONFLICT (token_hash) DO NOTHING`,
            [tokenHash, decoded.id, expiresAt]
        )

        await this.pool.query(
            'DELETE FROM revoked_tokens WHERE expires_at < NOW()'
        )
    }
}

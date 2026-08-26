import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { env } from '../../config/dotenv.js'
import { AppError } from '../../shared/errors/app-error.js'

export class AuthService {
    constructor(authRepository) {
        this.authRepository = authRepository
    }

    async register({ name, email, password }) {
        const existing = await this.authRepository.findByEmail(email)
        if (existing) {
            throw new AppError('Email already in use', 409)
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
                throw new AppError('Email already in use', 409)
            }
            throw err
        }
    }

    async login({ email, password }) {
        const user = await this.authRepository.findByEmail(email)
        if (!user) {
            throw new AppError('Invalid credentials', 401)
        }

        if (user.deleted_at) {
            throw new AppError('Account is disabled', 403)
        }

        const valid = await argon2.verify(user.password_hash, password)
        if (!valid) {
            throw new AppError('Invalid credentials', 401)
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
}

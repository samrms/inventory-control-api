import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { env } from '../../config/dotenv.js'
import { pool } from '../../database/connection.js'
import { AppError } from '../errors/app-error.js'

export async function authenticate(req, res, next) {
    const header = req.headers.authorization

    if (!header || !header.startsWith('Bearer ')) {
        return next(new AppError('Missing or invalid token', 401))
    }

    const token = header.split(' ')[1]

    try {
        const payload = jwt.verify(token, env.jwt_secret)

        const tokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex')

        const result = await pool.query(
            'SELECT 1 FROM revoked_tokens WHERE token_hash = $1',
            [tokenHash]
        )

        if (result.rows.length > 0) {
            return next(new AppError('Token has been revoked', 401))
        }

        req.user = { id: payload.id, role: payload.role }
        next()
    } catch (err) {
        if (err instanceof AppError) {
            return next(err)
        }
        return next(new AppError('Invalid or expired token', 401))
    }
}

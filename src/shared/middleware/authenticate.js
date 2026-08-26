import jwt from 'jsonwebtoken'
import { env } from '../../config/dotenv.js'
import { AppError } from '../errors/app-error.js'

export function authenticate(req, res, next) {
    const header = req.headers.authorization

    if (!header || !header.startsWith('Bearer ')) {
        return next(new AppError('Missing or invalid token', 401))
    }

    const token = header.split(' ')[1]

    try {
        const payload = jwt.verify(token, env.jwt_secret)
        req.user = { id: payload.id, role: payload.role }
        next()
    } catch {
        return next(new AppError('Invalid or expired token', 401))
    }
}

import logger from '../logger/logger.js'
import { AppError } from './app-error.js'

export function errorMiddleware(err, req, res, _next) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
        })
    }

    logger.error(err)

    return res.status(500).json({
        error: 'Internal server error',
    })
}

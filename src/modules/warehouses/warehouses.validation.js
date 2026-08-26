import { AppError } from '../../shared/errors/app-error.js'

export function validateCreateWarehouse(req, res, next) {
    const { code, name } = req.body

    if (!code || code.trim().length === 0) {
        return next(new AppError('Warehouse code is required', 400))
    }

    if (!name || name.trim().length === 0) {
        return next(new AppError('Warehouse name is required', 400))
    }

    next()
}

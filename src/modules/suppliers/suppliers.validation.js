import { AppError } from '../../shared/errors/app-error.js'

export function validateCreateSupplier(req, res, next) {
    const { name } = req.body

    if (!name || name.trim().length === 0) {
        return next(new AppError('Supplier name is required', 400))
    }

    next()
}

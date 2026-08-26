import { AppError } from '../../shared/errors/app-error.js'

export function validateCreateProduct(req, res, next) {
    const { sku, name } = req.body

    if (!sku || sku.trim().length === 0) {
        return next(new AppError('SKU is required', 400))
    }

    if (!name || name.trim().length === 0) {
        return next(new AppError('Name is required', 400))
    }

    if (req.body.price !== undefined && req.body.price < 0) {
        return next(new AppError('Price must be >= 0', 400))
    }

    if (req.body.cost !== undefined && req.body.cost < 0) {
        return next(new AppError('Cost must be >= 0', 400))
    }

    next()
}

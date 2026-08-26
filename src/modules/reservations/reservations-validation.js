import { AppError } from '../../shared/errors/app-error.js'

export function validateCreateReservation(req, res, next) {
    const { warehouseId, productId, quantity } = req.body

    if (!warehouseId) return next(new AppError('warehouseId is required', 400))
    if (!productId) return next(new AppError('productId is required', 400))
    if (!quantity || quantity <= 0)
        return next(new AppError('quantity must be > 0', 400))

    next()
}

import { AppError } from '../../shared/errors/app-error.js'

export function validateCreateTransfer(req, res, next) {
    const { sourceWarehouseId, destinationWarehouseId, items } = req.body

    if (!sourceWarehouseId)
        return next(new AppError('sourceWarehouseId is required', 400))
    if (!destinationWarehouseId)
        return next(new AppError('destinationWarehouseId is required', 400))
    if (sourceWarehouseId === destinationWarehouseId) {
        return next(
            new AppError('Source and destination must be different', 400)
        )
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
        return next(new AppError('At least one item is required', 400))
    }

    for (const item of items) {
        if (!item.productId)
            return next(new AppError('Each item must have a productId', 400))
        if (!item.quantity || item.quantity <= 0)
            return next(new AppError('Each item quantity must be > 0', 400))
    }

    next()
}

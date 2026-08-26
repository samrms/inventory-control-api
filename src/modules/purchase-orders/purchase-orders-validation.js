import { AppError } from '../../shared/errors/app-error.js'

export function validateCreatePurchaseOrder(req, res, next) {
    const { supplierId, warehouseId, items } = req.body

    if (!supplierId) return next(new AppError('supplierId is required', 400))
    if (!warehouseId) return next(new AppError('warehouseId is required', 400))
    if (!items || !Array.isArray(items) || items.length === 0) {
        return next(new AppError('At least one item is required', 400))
    }

    for (const item of items) {
        if (!item.productId)
            return next(new AppError('Each item must have a productId', 400))
        if (!item.quantity || item.quantity <= 0)
            return next(new AppError('Each item quantity must be > 0', 400))
        if (item.unitCost === undefined || item.unitCost < 0)
            return next(new AppError('Each item unitCost must be >= 0', 400))
    }

    next()
}

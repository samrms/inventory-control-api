import { AppError } from '../../shared/errors/app-error.js'

export function validateStockOperation(req, res, next) {
    const { warehouseId, productId, quantity } = req.body

    if (!warehouseId) return next(new AppError('warehouseId is required', 400))
    if (!productId) return next(new AppError('productId is required', 400))
    if (!quantity || quantity <= 0)
        return next(new AppError('quantity must be > 0', 400))

    next()
}

export function validateAdjustStock(req, res, next) {
    const { warehouseId, productId, quantity, type } = req.body
    const validTypes = ['ADJUSTMENT_IN', 'ADJUSTMENT_OUT']

    if (!warehouseId) return next(new AppError('warehouseId is required', 400))
    if (!productId) return next(new AppError('productId is required', 400))
    if (!quantity || quantity <= 0)
        return next(new AppError('quantity must be > 0', 400))
    if (!type || !validTypes.includes(type)) {
        return next(
            new AppError(`type must be one of: ${validTypes.join(', ')}`, 400)
        )
    }

    next()
}

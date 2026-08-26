import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { authorize } from '../../shared/middleware/authorize.js'
import {
    validateStockOperation,
    validateAdjustStock,
} from './inventory-validation.js'

export function inventoryRoutes(controller) {
    const router = Router()

    router.use(authenticate)

    router.get('/summary', (req, res, next) =>
        controller.getSummary(req, res, next)
    )
    router.get('/low-stock', (req, res, next) =>
        controller.getLowStock(req, res, next)
    )
    router.get('/', (req, res, next) => controller.list(req, res, next))
    router.get('/:warehouseId/:productId', (req, res, next) =>
        controller.getByWarehouseAndProduct(req, res, next)
    )

    router.post(
        '/receive',
        authorize('ADMIN', 'MANAGER'),
        validateStockOperation,
        (req, res, next) => controller.receiveStock(req, res, next)
    )
    router.post(
        '/issue',
        authorize('ADMIN', 'MANAGER', 'OPERATOR'),
        validateStockOperation,
        (req, res, next) => controller.issueStock(req, res, next)
    )
    router.post(
        '/adjust',
        authorize('ADMIN', 'MANAGER'),
        validateAdjustStock,
        (req, res, next) => controller.adjustStock(req, res, next)
    )

    return router
}

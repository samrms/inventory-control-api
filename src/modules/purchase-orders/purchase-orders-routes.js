import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { authorize } from '../../shared/middleware/authorize.js'
import { validateCreatePurchaseOrder } from './purchase-orders-validation.js'

export function purchaseOrdersRoutes(controller) {
    const router = Router()

    router.use(authenticate)

    router.get('/', (req, res, next) => controller.list(req, res, next))
    router.get('/:id', (req, res, next) => controller.getById(req, res, next))
    router.post(
        '/',
        authorize('ADMIN', 'MANAGER'),
        validateCreatePurchaseOrder,
        (req, res, next) => controller.create(req, res, next)
    )
    router.post(
        '/:id/submit',
        authorize('ADMIN', 'MANAGER'),
        (req, res, next) => controller.submit(req, res, next)
    )
    router.post(
        '/:id/receive',
        authorize('ADMIN', 'MANAGER'),
        (req, res, next) => controller.receive(req, res, next)
    )
    router.post(
        '/:id/cancel',
        authorize('ADMIN', 'MANAGER'),
        (req, res, next) => controller.cancel(req, res, next)
    )

    return router
}

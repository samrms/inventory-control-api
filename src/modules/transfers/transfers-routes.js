import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { authorize } from '../../shared/middleware/authorize.js'
import { validateCreateTransfer } from './transfers-validation.js'

export function transfersRoutes(controller) {
    const router = Router()

    router.use(authenticate)

    router.get('/', (req, res, next) => controller.list(req, res, next))
    router.get('/:id', (req, res, next) => controller.getById(req, res, next))
    router.post(
        '/',
        authorize('ADMIN', 'MANAGER'),
        validateCreateTransfer,
        (req, res, next) => controller.create(req, res, next)
    )
    router.post(
        '/:id/complete',
        authorize('ADMIN', 'MANAGER'),
        (req, res, next) => controller.complete(req, res, next)
    )
    router.post(
        '/:id/cancel',
        authorize('ADMIN', 'MANAGER'),
        (req, res, next) => controller.cancel(req, res, next)
    )

    return router
}

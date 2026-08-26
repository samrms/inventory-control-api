import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { authorize } from '../../shared/middleware/authorize.js'
import { validateCreateReservation } from './reservations-validation.js'

export function reservationsRoutes(controller) {
    const router = Router()

    router.use(authenticate)

    router.get('/', (req, res, next) => controller.list(req, res, next))
    router.get('/:id', (req, res, next) => controller.getById(req, res, next))
    router.post(
        '/',
        authorize('ADMIN', 'MANAGER', 'OPERATOR'),
        validateCreateReservation,
        (req, res, next) => controller.create(req, res, next)
    )
    router.post(
        '/:id/release',
        authorize('ADMIN', 'MANAGER', 'OPERATOR'),
        (req, res, next) => controller.release(req, res, next)
    )
    router.post(
        '/:id/fulfill',
        authorize('ADMIN', 'MANAGER', 'OPERATOR'),
        (req, res, next) => controller.fulfill(req, res, next)
    )

    return router
}

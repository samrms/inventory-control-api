import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { authorize } from '../../shared/middleware/authorize.js'
import { validateCreateReservation } from './reservations.validation.js'
import { reservationsController } from './reservation.container.js'

const router = Router()

router.use(authenticate)
router.get('/', (req, res, next) => reservationsController.list(req, res, next))
router.get('/:id', (req, res, next) =>
    reservationsController.getById(req, res, next)
)
router.post(
    '/',
    authorize('ADMIN', 'MANAGER', 'OPERATOR'),
    validateCreateReservation,
    (req, res, next) => reservationsController.create(req, res, next)
)
router.post(
    '/:id/release',
    authorize('ADMIN', 'MANAGER', 'OPERATOR'),
    (req, res, next) => reservationsController.release(req, res, next)
)
router.post(
    '/:id/fulfill',
    authorize('ADMIN', 'MANAGER', 'OPERATOR'),
    (req, res, next) => reservationsController.fulfill(req, res, next)
)

export { router as reservationsRoutes }

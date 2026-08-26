import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { authorize } from '../../shared/middleware/authorize.js'
import { validateCreateTransfer } from './transfers.validation.js'
import { transfersController } from './transfer.container.js'

const router = Router()

router.use(authenticate)
router.get('/', (req, res, next) => transfersController.list(req, res, next))
router.get('/:id', (req, res, next) =>
    transfersController.getById(req, res, next)
)
router.post(
    '/',
    authorize('ADMIN', 'MANAGER'),
    validateCreateTransfer,
    (req, res, next) => transfersController.create(req, res, next)
)
router.post('/:id/complete', authorize('ADMIN', 'MANAGER'), (req, res, next) =>
    transfersController.complete(req, res, next)
)
router.post('/:id/cancel', authorize('ADMIN', 'MANAGER'), (req, res, next) =>
    transfersController.cancel(req, res, next)
)

export { router as transfersRoutes }

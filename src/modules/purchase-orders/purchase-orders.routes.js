import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { authorize } from '../../shared/middleware/authorize.js'
import { validateCreatePurchaseOrder } from './purchase-orders.validation.js'
import { purchaseOrdersController } from './purchase-order.container.js'

const router = Router()

router.use(authenticate)
router.get('/', (req, res, next) =>
    purchaseOrdersController.list(req, res, next)
)
router.get('/:id', (req, res, next) =>
    purchaseOrdersController.getById(req, res, next)
)
router.post(
    '/',
    authorize('ADMIN', 'MANAGER'),
    validateCreatePurchaseOrder,
    (req, res, next) => purchaseOrdersController.create(req, res, next)
)
router.post('/:id/submit', authorize('ADMIN', 'MANAGER'), (req, res, next) =>
    purchaseOrdersController.submit(req, res, next)
)
router.post('/:id/receive', authorize('ADMIN', 'MANAGER'), (req, res, next) =>
    purchaseOrdersController.receive(req, res, next)
)
router.post('/:id/cancel', authorize('ADMIN', 'MANAGER'), (req, res, next) =>
    purchaseOrdersController.cancel(req, res, next)
)

export { router as purchaseOrdersRoutes }

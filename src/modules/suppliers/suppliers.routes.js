import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { authorize } from '../../shared/middleware/authorize.js'
import { validateCreateSupplier } from './suppliers.validation.js'
import { suppliersController } from './supplier.container.js'

const router = Router()

router.use(authenticate)
router.get('/', (req, res, next) => suppliersController.list(req, res, next))
router.get('/:id', (req, res, next) =>
    suppliersController.getById(req, res, next)
)
router.post(
    '/',
    authorize('ADMIN', 'MANAGER'),
    validateCreateSupplier,
    (req, res, next) => suppliersController.create(req, res, next)
)
router.patch('/:id', authorize('ADMIN', 'MANAGER'), (req, res, next) =>
    suppliersController.update(req, res, next)
)
router.delete('/:id', authorize('ADMIN', 'MANAGER'), (req, res, next) =>
    suppliersController.delete(req, res, next)
)

export { router as suppliersRoutes }

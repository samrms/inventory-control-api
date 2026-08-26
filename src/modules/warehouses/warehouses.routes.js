import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { authorize } from '../../shared/middleware/authorize.js'
import { validateCreateWarehouse } from './warehouses.validation.js'
import { warehousesController } from './warehouse.container.js'

const router = Router()

router.use(authenticate)
router.get('/', (req, res, next) => warehousesController.list(req, res, next))
router.get('/:id', (req, res, next) =>
    warehousesController.getById(req, res, next)
)
router.post(
    '/',
    authorize('ADMIN', 'MANAGER'),
    validateCreateWarehouse,
    (req, res, next) => warehousesController.create(req, res, next)
)
router.patch('/:id', authorize('ADMIN', 'MANAGER'), (req, res, next) =>
    warehousesController.update(req, res, next)
)
router.delete('/:id', authorize('ADMIN', 'MANAGER'), (req, res, next) =>
    warehousesController.delete(req, res, next)
)

export { router as warehousesRoutes }

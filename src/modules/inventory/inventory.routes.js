import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { authorize } from '../../shared/middleware/authorize.js'
import {
    validateStockOperation,
    validateAdjustStock,
} from './inventory.validation.js'
import { inventoryController } from './inventory.container.js'

const router = Router()

router.use(authenticate)
router.get('/summary', (req, res, next) =>
    inventoryController.getSummary(req, res, next)
)
router.get('/low-stock', (req, res, next) =>
    inventoryController.getLowStock(req, res, next)
)
router.get('/', (req, res, next) => inventoryController.list(req, res, next))
router.get('/:warehouseId/:productId', (req, res, next) =>
    inventoryController.getByWarehouseAndProduct(req, res, next)
)
router.post(
    '/receive',
    authorize('ADMIN', 'MANAGER'),
    validateStockOperation,
    (req, res, next) => inventoryController.receiveStock(req, res, next)
)
router.post(
    '/issue',
    authorize('ADMIN', 'MANAGER', 'OPERATOR'),
    validateStockOperation,
    (req, res, next) => inventoryController.issueStock(req, res, next)
)
router.post(
    '/adjust',
    authorize('ADMIN', 'MANAGER'),
    validateAdjustStock,
    (req, res, next) => inventoryController.adjustStock(req, res, next)
)

export { router as inventoryRoutes }

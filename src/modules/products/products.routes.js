import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { authorize } from '../../shared/middleware/authorize.js'
import { validateCreateProduct } from './products.validation.js'
import { productsController } from './product.container.js'

const router = Router()

router.use(authenticate)
router.get('/', (req, res, next) => productsController.list(req, res, next))
router.get('/:id', (req, res, next) =>
    productsController.getById(req, res, next)
)
router.post(
    '/',
    authorize('ADMIN', 'MANAGER'),
    validateCreateProduct,
    (req, res, next) => productsController.create(req, res, next)
)
router.patch('/:id', authorize('ADMIN', 'MANAGER'), (req, res, next) =>
    productsController.update(req, res, next)
)
router.delete('/:id', authorize('ADMIN', 'MANAGER'), (req, res, next) =>
    productsController.delete(req, res, next)
)

export { router as productsRoutes }

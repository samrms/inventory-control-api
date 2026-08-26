import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { authorize } from '../../shared/middleware/authorize.js'
import { validateCreateProduct } from './products-validation.js'

export function productsRoutes(controller) {
    const router = Router()

    router.use(authenticate)

    router.get('/', (req, res, next) => controller.list(req, res, next))
    router.get('/:id', (req, res, next) => controller.getById(req, res, next))
    router.post(
        '/',
        authorize('ADMIN', 'MANAGER'),
        validateCreateProduct,
        (req, res, next) => controller.create(req, res, next)
    )
    router.patch('/:id', authorize('ADMIN', 'MANAGER'), (req, res, next) =>
        controller.update(req, res, next)
    )
    router.delete('/:id', authorize('ADMIN', 'MANAGER'), (req, res, next) =>
        controller.delete(req, res, next)
    )

    return router
}

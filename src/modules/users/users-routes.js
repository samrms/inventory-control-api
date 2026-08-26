import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { authorize } from '../../shared/middleware/authorize.js'
import { validateUpdateUser } from './users-validation.js'

export function usersRoutes(controller) {
    const router = Router()

    router.use(authenticate)
    router.use(authorize('ADMIN'))

    router.get('/', (req, res, next) => controller.list(req, res, next))
    router.get('/:id', (req, res, next) => controller.getById(req, res, next))
    router.patch('/:id', validateUpdateUser, (req, res, next) =>
        controller.update(req, res, next)
    )
    router.delete('/:id', (req, res, next) => controller.delete(req, res, next))

    return router
}

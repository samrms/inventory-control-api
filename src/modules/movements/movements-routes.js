import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate.js'

export function movementsRoutes(controller) {
    const router = Router()

    router.use(authenticate)

    router.get('/', (req, res, next) => controller.list(req, res, next))

    return router
}

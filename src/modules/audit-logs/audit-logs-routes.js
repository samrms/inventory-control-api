import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { authorize } from '../../shared/middleware/authorize.js'

export function auditLogsRoutes(controller) {
    const router = Router()

    router.use(authenticate)
    router.use(authorize('ADMIN'))

    router.get('/', (req, res, next) => controller.list(req, res, next))

    return router
}

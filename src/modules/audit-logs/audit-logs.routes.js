import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { authorize } from '../../shared/middleware/authorize.js'
import { auditLogsController } from './audit-log.container.js'

const router = Router()

router.use(authenticate)
router.use(authorize('ADMIN'))
router.get('/', (req, res, next) => auditLogsController.list(req, res, next))

export { router as auditLogsRoutes }

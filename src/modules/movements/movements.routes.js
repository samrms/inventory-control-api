import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { movementsController } from './movement.container.js'

const router = Router()

router.use(authenticate)
router.get('/', (req, res, next) => movementsController.list(req, res, next))

export { router as movementsRoutes }

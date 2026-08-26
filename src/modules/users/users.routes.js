import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { authorize } from '../../shared/middleware/authorize.js'
import { validateUpdateUser } from './users.validation.js'
import { usersController } from './users.container.js'

const router = Router()

router.use(authenticate)
router.use(authorize('ADMIN'))
router.get('/', (req, res, next) => usersController.list(req, res, next))
router.get('/:id', (req, res, next) => usersController.getById(req, res, next))
router.patch('/:id', validateUpdateUser, (req, res, next) =>
    usersController.update(req, res, next)
)
router.delete('/:id', (req, res, next) =>
    usersController.delete(req, res, next)
)

export { router as usersRoutes }

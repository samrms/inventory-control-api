import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { validateSignUp, validateSignIn } from './auth.validation.js'
import { authController } from './auth.container.js'

const router = Router()

router.post('/sign-up', validateSignUp, (req, res, next) =>
    authController.signUp(req, res, next)
)
router.post('/sign-in', validateSignIn, (req, res, next) =>
    authController.signIn(req, res, next)
)
router.post('/logout', authenticate, (req, res, next) =>
    authController.logout(req, res, next)
)

export { router as authRoutes }

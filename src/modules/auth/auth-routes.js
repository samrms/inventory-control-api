import { Router } from 'express'
import { validateRegister, validateLogin } from './auth-validation.js'

export function authRoutes(controller) {
    const router = Router()

    router.post('/register', validateRegister, (req, res, next) =>
        controller.register(req, res, next)
    )
    router.post('/login', validateLogin, (req, res, next) =>
        controller.login(req, res, next)
    )

    return router
}

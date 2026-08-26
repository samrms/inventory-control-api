import { pool } from '../../database/connection.js'
import { AuthRepository } from './auth-repository.js'
import { AuthService } from './auth-service.js'
import { AuthController } from './auth-controller.js'
import { authRoutes } from './auth-routes.js'

const authRepository = new AuthRepository(pool)
const authService = new AuthService(authRepository)
const authController = new AuthController(authService)
const routes = authRoutes(authController)

export { routes as authRoutes }

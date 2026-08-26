import { pool } from '../../database/connection.js'
import { AppError } from '../../shared/errors/app-error.js'
import { AuthRepository } from './auth.repository.js'
import { AuthService } from './auth.service.js'
import { AuthController } from './auth.controller.js'

const authRepository = new AuthRepository(pool)
const authService = new AuthService(authRepository, pool, AppError)
const authController = new AuthController(authService)

export { authController }

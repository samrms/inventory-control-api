import { pool } from '../../database/connection.js'
import { AppError } from '../../shared/errors/app-error.js'
import {
    parsePagination,
    paginateResponse,
} from '../../shared/validation/pagination.js'
import { UsersRepository } from './users.repository.js'
import { UsersService } from './users.service.js'
import { UsersController } from './users.controller.js'

const usersRepository = new UsersRepository(
    pool,
    parsePagination,
    paginateResponse
)
const usersService = new UsersService(usersRepository, AppError)
const usersController = new UsersController(usersService)

export { usersController }

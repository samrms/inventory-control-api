import { pool } from '../../database/connection.js'
import {
    parsePagination,
    paginateResponse,
} from '../../shared/validation/pagination.js'
import { MovementsRepository } from './movements.repository.js'
import { MovementsService } from './movements.service.js'
import { MovementsController } from './movements.controller.js'

const movementsRepository = new MovementsRepository(
    pool,
    parsePagination,
    paginateResponse
)
const movementsService = new MovementsService(movementsRepository)
const movementsController = new MovementsController(movementsService)

export { movementsController }

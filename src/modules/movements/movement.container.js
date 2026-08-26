import { pool } from '../../database/connection.js'
import { MovementsRepository } from './movements-repository.js'
import { MovementsService } from './movements-service.js'
import { MovementsController } from './movements-controller.js'
import { movementsRoutes } from './movements-routes.js'

const movementsRepository = new MovementsRepository(pool)
const movementsService = new MovementsService(movementsRepository)
const movementsController = new MovementsController(movementsService)
const routes = movementsRoutes(movementsController)

export { routes as movementsRoutes }

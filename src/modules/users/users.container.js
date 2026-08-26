import { pool } from '../../database/connection.js'
import { UsersRepository } from './users-repository.js'
import { UsersService } from './users-service.js'
import { UsersController } from './users-controller.js'
import { usersRoutes } from './users-routes.js'

const usersRepository = new UsersRepository(pool)
const usersService = new UsersService(usersRepository)
const usersController = new UsersController(usersService)
const routes = usersRoutes(usersController)

export { routes as usersRoutes }

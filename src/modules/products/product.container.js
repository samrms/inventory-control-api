import { pool } from '../../database/connection.js'
import { AuditLogRepository } from '../../shared/audit/audit-log.js'
import { ProductsRepository } from './products-repository.js'
import { ProductsService } from './products-service.js'
import { ProductsController } from './products-controller.js'
import { productsRoutes } from './products-routes.js'

const auditLogRepository = new AuditLogRepository(pool)
const productsRepository = new ProductsRepository(pool)
const productsService = new ProductsService(
    productsRepository,
    auditLogRepository
)
const productsController = new ProductsController(productsService)
const routes = productsRoutes(productsController)

export { routes as productsRoutes }

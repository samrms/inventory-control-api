import { pool } from '../../database/connection.js'
import { AuditLogRepository } from '../../shared/audit/audit-log.js'
import { SuppliersRepository } from './suppliers-repository.js'
import { SuppliersService } from './suppliers-service.js'
import { SuppliersController } from './suppliers-controller.js'
import { suppliersRoutes } from './suppliers-routes.js'

const auditLogRepository = new AuditLogRepository(pool)
const suppliersRepository = new SuppliersRepository(pool)
const suppliersService = new SuppliersService(
    suppliersRepository,
    auditLogRepository
)
const suppliersController = new SuppliersController(suppliersService)
const routes = suppliersRoutes(suppliersController)

export { routes as suppliersRoutes }

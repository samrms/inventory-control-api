import { pool } from '../../database/connection.js'
import { AuditLogRepository } from '../../shared/audit/audit-log.js'
import { TransfersRepository } from './transfers-repository.js'
import { TransfersService } from './transfers-service.js'
import { TransfersController } from './transfers-controller.js'
import { transfersRoutes } from './transfers-routes.js'
import { inventoryRepository } from '../inventory/index.js'

const auditLogRepository = new AuditLogRepository(pool)
const transfersRepository = new TransfersRepository(pool)
const transfersService = new TransfersService(
    transfersRepository,
    inventoryRepository,
    auditLogRepository,
    pool
)
const transfersController = new TransfersController(transfersService)
const routes = transfersRoutes(transfersController)

export { routes as transfersRoutes }

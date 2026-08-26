import { pool } from '../../database/connection.js'
import { AuditLogRepository } from '../../shared/audit/audit-log.js'
import { WarehousesRepository } from './warehouses-repository.js'
import { WarehousesService } from './warehouses-service.js'
import { WarehousesController } from './warehouses-controller.js'
import { warehousesRoutes } from './warehouses-routes.js'

const auditLogRepository = new AuditLogRepository(pool)
const warehousesRepository = new WarehousesRepository(pool)
const warehousesService = new WarehousesService(
    warehousesRepository,
    auditLogRepository
)
const warehousesController = new WarehousesController(warehousesService)
const routes = warehousesRoutes(warehousesController)

export { routes as warehousesRoutes }

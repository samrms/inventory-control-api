import { pool } from '../../database/connection.js'
import { AuditLogRepository } from '../../shared/audit/audit-log.js'
import { InventoryRepository } from './inventory-repository.js'
import { InventoryService } from './inventory-service.js'
import { InventoryController } from './inventory-controller.js'
import { inventoryRoutes } from './inventory-routes.js'

const inventoryRepository = new InventoryRepository(pool)
const auditLogRepository = new AuditLogRepository(pool)
const inventoryService = new InventoryService(
    inventoryRepository,
    auditLogRepository,
    pool
)
const inventoryController = new InventoryController(inventoryService)
const routes = inventoryRoutes(inventoryController)

export { routes as inventoryRoutes, inventoryRepository }

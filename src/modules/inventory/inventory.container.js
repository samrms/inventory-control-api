import { pool } from '../../database/connection.js'
import { AppError } from '../../shared/errors/app-error.js'
import {
    parsePagination,
    paginateResponse,
} from '../../shared/validation/pagination.js'
import { AuditLogRepository } from '../../shared/audit/audit-log.js'
import { InventoryRepository } from './inventory.repository.js'
import { InventoryService } from './inventory.service.js'
import { InventoryController } from './inventory.controller.js'

const auditLogRepository = new AuditLogRepository(pool)
const inventoryRepository = new InventoryRepository(
    pool,
    parsePagination,
    paginateResponse
)
const inventoryService = new InventoryService(
    inventoryRepository,
    auditLogRepository,
    pool,
    AppError
)
const inventoryController = new InventoryController(inventoryService)

export { inventoryController, inventoryRepository }

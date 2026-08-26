import { pool } from '../../database/connection.js'
import { AppError } from '../../shared/errors/app-error.js'
import {
    parsePagination,
    paginateResponse,
} from '../../shared/validation/pagination.js'
import { AuditLogRepository } from '../../shared/audit/audit-log.js'
import { WarehousesRepository } from './warehouses.repository.js'
import { WarehousesService } from './warehouses.service.js'
import { WarehousesController } from './warehouses.controller.js'

const auditLogRepository = new AuditLogRepository(pool)
const warehousesRepository = new WarehousesRepository(
    pool,
    parsePagination,
    paginateResponse
)
const warehousesService = new WarehousesService(
    warehousesRepository,
    auditLogRepository,
    AppError
)
const warehousesController = new WarehousesController(warehousesService)

export { warehousesController }

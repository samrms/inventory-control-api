import { pool } from '../../database/connection.js'
import { AppError } from '../../shared/errors/app-error.js'
import {
    parsePagination,
    paginateResponse,
} from '../../shared/validation/pagination.js'
import { AuditLogRepository } from '../../shared/audit/audit-log.js'
import { TransfersRepository } from './transfers.repository.js'
import { TransfersService } from './transfers.service.js'
import { TransfersController } from './transfers.controller.js'
import { inventoryRepository } from '../inventory/inventory.container.js'

const auditLogRepository = new AuditLogRepository(pool)
const transfersRepository = new TransfersRepository(
    pool,
    parsePagination,
    paginateResponse
)
const transfersService = new TransfersService(
    transfersRepository,
    inventoryRepository,
    auditLogRepository,
    pool,
    AppError
)
const transfersController = new TransfersController(transfersService)

export { transfersController }

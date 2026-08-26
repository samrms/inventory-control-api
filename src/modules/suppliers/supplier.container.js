import { pool } from '../../database/connection.js'
import { AppError } from '../../shared/errors/app-error.js'
import {
    parsePagination,
    paginateResponse,
} from '../../shared/validation/pagination.js'
import { AuditLogRepository } from '../../shared/audit/audit-log.js'
import { SuppliersRepository } from './suppliers.repository.js'
import { SuppliersService } from './suppliers.service.js'
import { SuppliersController } from './suppliers.controller.js'

const auditLogRepository = new AuditLogRepository(pool)
const suppliersRepository = new SuppliersRepository(
    pool,
    parsePagination,
    paginateResponse
)
const suppliersService = new SuppliersService(
    suppliersRepository,
    auditLogRepository,
    AppError
)
const suppliersController = new SuppliersController(suppliersService)

export { suppliersController }

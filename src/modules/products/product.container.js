import { pool } from '../../database/connection.js'
import { AppError } from '../../shared/errors/app-error.js'
import {
    parsePagination,
    paginateResponse,
} from '../../shared/validation/pagination.js'
import { AuditLogRepository } from '../../shared/audit/audit-log.js'
import { ProductsRepository } from './products.repository.js'
import { ProductsService } from './products.service.js'
import { ProductsController } from './products.controller.js'

const auditLogRepository = new AuditLogRepository(pool)
const productsRepository = new ProductsRepository(
    pool,
    parsePagination,
    paginateResponse
)
const productsService = new ProductsService(
    productsRepository,
    auditLogRepository,
    AppError
)
const productsController = new ProductsController(productsService)

export { productsController }

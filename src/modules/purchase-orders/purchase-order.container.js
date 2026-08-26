import { pool } from '../../database/connection.js'
import { AppError } from '../../shared/errors/app-error.js'
import {
    parsePagination,
    paginateResponse,
} from '../../shared/validation/pagination.js'
import { AuditLogRepository } from '../../shared/audit/audit-log.js'
import { PurchaseOrdersRepository } from './purchase-orders.repository.js'
import { PurchaseOrdersService } from './purchase-orders.service.js'
import { PurchaseOrdersController } from './purchase-orders.controller.js'

const auditLogRepository = new AuditLogRepository(pool)
const purchaseOrdersRepository = new PurchaseOrdersRepository(
    pool,
    parsePagination,
    paginateResponse
)
const purchaseOrdersService = new PurchaseOrdersService(
    purchaseOrdersRepository,
    auditLogRepository,
    pool,
    AppError
)
const purchaseOrdersController = new PurchaseOrdersController(
    purchaseOrdersService
)

export { purchaseOrdersController }

import { pool } from '../../database/connection.js'
import { AppError } from '../../shared/errors/app-error.js'
import {
    parsePagination,
    paginateResponse,
} from '../../shared/validation/pagination.js'
import { AuditLogRepository } from '../../shared/audit/audit-log.js'
import { ReservationsRepository } from './reservations.repository.js'
import { ReservationsService } from './reservations.service.js'
import { ReservationsController } from './reservations.controller.js'
import { inventoryRepository } from '../inventory/inventory.container.js'

const auditLogRepository = new AuditLogRepository(pool)
const reservationsRepository = new ReservationsRepository(
    pool,
    parsePagination,
    paginateResponse
)
const reservationsService = new ReservationsService(
    reservationsRepository,
    inventoryRepository,
    auditLogRepository,
    pool,
    AppError
)
const reservationsController = new ReservationsController(reservationsService)

export { reservationsController }

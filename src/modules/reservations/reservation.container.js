import { pool } from '../../database/connection.js'
import { AuditLogRepository } from '../../shared/audit/audit-log.js'
import { ReservationsRepository } from './reservations-repository.js'
import { ReservationsService } from './reservations-service.js'
import { ReservationsController } from './reservations-controller.js'
import { reservationsRoutes } from './reservations-routes.js'
import { inventoryRepository } from '../inventory/index.js'

const auditLogRepository = new AuditLogRepository(pool)
const reservationsRepository = new ReservationsRepository(pool)
const reservationsService = new ReservationsService(
    reservationsRepository,
    inventoryRepository,
    auditLogRepository,
    pool
)
const reservationsController = new ReservationsController(reservationsService)
const routes = reservationsRoutes(reservationsController)

export { routes as reservationsRoutes }

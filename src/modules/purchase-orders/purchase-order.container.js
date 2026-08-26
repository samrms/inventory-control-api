import { pool } from '../../database/connection.js'
import { AuditLogRepository } from '../../shared/audit/audit-log.js'
import { PurchaseOrdersRepository } from './purchase-orders-repository.js'
import { PurchaseOrdersService } from './purchase-orders-service.js'
import { PurchaseOrdersController } from './purchase-orders-controller.js'
import { purchaseOrdersRoutes } from './purchase-orders-routes.js'

const auditLogRepository = new AuditLogRepository(pool)
const purchaseOrdersRepository = new PurchaseOrdersRepository(pool)
const purchaseOrdersService = new PurchaseOrdersService(
    purchaseOrdersRepository,
    auditLogRepository,
    pool
)
const purchaseOrdersController = new PurchaseOrdersController(
    purchaseOrdersService
)
const routes = purchaseOrdersRoutes(purchaseOrdersController)

export { routes as purchaseOrdersRoutes }

import { pool } from '../../database/connection.js'
import { AuditLogsRepository } from './audit-logs-repository.js'
import { AuditLogsService } from './audit-logs-service.js'
import { AuditLogsController } from './audit-logs-controller.js'
import { auditLogsRoutes } from './audit-logs-routes.js'

const auditLogsRepository = new AuditLogsRepository(pool)
const auditLogsService = new AuditLogsService(auditLogsRepository)
const auditLogsController = new AuditLogsController(auditLogsService)
const routes = auditLogsRoutes(auditLogsController)

export { routes as auditLogsRoutes }

import { pool } from '../../database/connection.js'
import {
    parsePagination,
    paginateResponse,
} from '../../shared/validation/pagination.js'
import { AuditLogsRepository } from './audit-logs.repository.js'
import { AuditLogsService } from './audit-logs.service.js'
import { AuditLogsController } from './audit-logs.controller.js'

const auditLogsRepository = new AuditLogsRepository(
    pool,
    parsePagination,
    paginateResponse
)
const auditLogsService = new AuditLogsService(auditLogsRepository)
const auditLogsController = new AuditLogsController(auditLogsService)

export { auditLogsController }

export class AuditLogsService {
    constructor(auditLogsRepository) {
        this.auditLogsRepository = auditLogsRepository
    }

    async list(query) {
        return this.auditLogsRepository.findAll(query)
    }
}

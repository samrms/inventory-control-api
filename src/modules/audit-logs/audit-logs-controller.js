export class AuditLogsController {
    constructor(auditLogsService) {
        this.auditLogsService = auditLogsService
    }

    async list(req, res, next) {
        try {
            const result = await this.auditLogsService.list(req.query)
            res.json(result)
        } catch (err) {
            next(err)
        }
    }
}

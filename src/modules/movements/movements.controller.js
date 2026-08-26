export class MovementsController {
    constructor(movementsService) {
        this.movementsService = movementsService
        this.list = this.list.bind(this)
    }

    async list(req, res, next) {
        try {
            const result = await this.movementsService.list(req.query)
            res.json(result)
        } catch (err) {
            next(err)
        }
    }
}

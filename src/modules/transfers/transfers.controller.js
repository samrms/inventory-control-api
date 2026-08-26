export class TransfersController {
    constructor(transfersService) {
        this.transfersService = transfersService
        this.list = this.list.bind(this)
        this.getById = this.getById.bind(this)
        this.create = this.create.bind(this)
        this.complete = this.complete.bind(this)
        this.cancel = this.cancel.bind(this)
    }

    async list(req, res, next) {
        try {
            const result = await this.transfersService.list(req.query)
            res.json(result)
        } catch (err) {
            next(err)
        }
    }

    async getById(req, res, next) {
        try {
            const transfer = await this.transfersService.getById(req.params.id)
            res.json({ data: transfer })
        } catch (err) {
            next(err)
        }
    }

    async create(req, res, next) {
        try {
            const transfer = await this.transfersService.create(
                req.body,
                req.user.id
            )
            res.status(201).json({ data: transfer })
        } catch (err) {
            next(err)
        }
    }

    async complete(req, res, next) {
        try {
            await this.transfersService.complete(req.params.id, req.user.id)
            res.json({ message: 'Transfer completed' })
        } catch (err) {
            next(err)
        }
    }

    async cancel(req, res, next) {
        try {
            await this.transfersService.cancel(req.params.id, req.user.id)
            res.json({ message: 'Transfer cancelled' })
        } catch (err) {
            next(err)
        }
    }
}

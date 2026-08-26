export class WarehousesController {
    constructor(warehousesService) {
        this.warehousesService = warehousesService
        this.list = this.list.bind(this)
        this.getById = this.getById.bind(this)
        this.create = this.create.bind(this)
        this.update = this.update.bind(this)
        this.delete = this.delete.bind(this)
    }

    async list(req, res, next) {
        try {
            const result = await this.warehousesService.list(req.query)
            res.json(result)
        } catch (err) {
            next(err)
        }
    }

    async getById(req, res, next) {
        try {
            const warehouse = await this.warehousesService.getById(
                req.params.id
            )
            res.json({ data: warehouse })
        } catch (err) {
            next(err)
        }
    }

    async create(req, res, next) {
        try {
            const warehouse = await this.warehousesService.create(
                req.body,
                req.user.id
            )
            res.status(201).json({ data: warehouse })
        } catch (err) {
            next(err)
        }
    }

    async update(req, res, next) {
        try {
            const warehouse = await this.warehousesService.update(
                req.params.id,
                req.body,
                req.user.id
            )
            res.json({ data: warehouse })
        } catch (err) {
            next(err)
        }
    }

    async delete(req, res, next) {
        try {
            await this.warehousesService.delete(req.params.id, req.user.id)
            res.status(204).end()
        } catch (err) {
            next(err)
        }
    }
}

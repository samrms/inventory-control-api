export class SuppliersController {
    constructor(suppliersService) {
        this.suppliersService = suppliersService
    }

    async list(req, res, next) {
        try {
            const result = await this.suppliersService.list(req.query)
            res.json(result)
        } catch (err) {
            next(err)
        }
    }

    async getById(req, res, next) {
        try {
            const supplier = await this.suppliersService.getById(req.params.id)
            res.json({ data: supplier })
        } catch (err) {
            next(err)
        }
    }

    async create(req, res, next) {
        try {
            const supplier = await this.suppliersService.create(
                req.body,
                req.user.id
            )
            res.status(201).json({ data: supplier })
        } catch (err) {
            next(err)
        }
    }

    async update(req, res, next) {
        try {
            const supplier = await this.suppliersService.update(
                req.params.id,
                req.body,
                req.user.id
            )
            res.json({ data: supplier })
        } catch (err) {
            next(err)
        }
    }

    async delete(req, res, next) {
        try {
            await this.suppliersService.delete(req.params.id, req.user.id)
            res.status(204).end()
        } catch (err) {
            next(err)
        }
    }
}

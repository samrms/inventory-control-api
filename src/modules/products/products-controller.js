export class ProductsController {
    constructor(productsService) {
        this.productsService = productsService
    }

    async list(req, res, next) {
        try {
            const result = await this.productsService.list(req.query)
            res.json(result)
        } catch (err) {
            next(err)
        }
    }

    async getById(req, res, next) {
        try {
            const product = await this.productsService.getById(req.params.id)
            res.json({ data: product })
        } catch (err) {
            next(err)
        }
    }

    async create(req, res, next) {
        try {
            const product = await this.productsService.create(
                req.body,
                req.user.id
            )
            res.status(201).json({ data: product })
        } catch (err) {
            next(err)
        }
    }

    async update(req, res, next) {
        try {
            const product = await this.productsService.update(
                req.params.id,
                req.body,
                req.user.id
            )
            res.json({ data: product })
        } catch (err) {
            next(err)
        }
    }

    async delete(req, res, next) {
        try {
            await this.productsService.delete(req.params.id, req.user.id)
            res.status(204).end()
        } catch (err) {
            next(err)
        }
    }
}

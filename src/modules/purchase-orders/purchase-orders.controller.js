export class PurchaseOrdersController {
    constructor(purchaseOrdersService) {
        this.purchaseOrdersService = purchaseOrdersService
        this.list = this.list.bind(this)
        this.getById = this.getById.bind(this)
        this.create = this.create.bind(this)
        this.submit = this.submit.bind(this)
        this.receive = this.receive.bind(this)
        this.cancel = this.cancel.bind(this)
    }

    async list(req, res, next) {
        try {
            const result = await this.purchaseOrdersService.list(req.query)
            res.json(result)
        } catch (err) {
            next(err)
        }
    }

    async getById(req, res, next) {
        try {
            const po = await this.purchaseOrdersService.getById(req.params.id)
            res.json({ data: po })
        } catch (err) {
            next(err)
        }
    }

    async create(req, res, next) {
        try {
            const po = await this.purchaseOrdersService.create(
                req.body,
                req.user.id
            )
            res.status(201).json({ data: po })
        } catch (err) {
            next(err)
        }
    }

    async submit(req, res, next) {
        try {
            await this.purchaseOrdersService.submit(req.params.id, req.user.id)
            res.json({ message: 'Purchase order submitted' })
        } catch (err) {
            next(err)
        }
    }

    async receive(req, res, next) {
        try {
            await this.purchaseOrdersService.receive(req.params.id, req.user.id)
            res.json({ message: 'Purchase order received' })
        } catch (err) {
            next(err)
        }
    }

    async cancel(req, res, next) {
        try {
            await this.purchaseOrdersService.cancel(req.params.id, req.user.id)
            res.json({ message: 'Purchase order cancelled' })
        } catch (err) {
            next(err)
        }
    }
}

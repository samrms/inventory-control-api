export class InventoryController {
    constructor(inventoryService) {
        this.inventoryService = inventoryService
        this.list = this.list.bind(this)
        this.getByWarehouseAndProduct = this.getByWarehouseAndProduct.bind(this)
        this.getLowStock = this.getLowStock.bind(this)
        this.getSummary = this.getSummary.bind(this)
        this.receiveStock = this.receiveStock.bind(this)
        this.issueStock = this.issueStock.bind(this)
        this.adjustStock = this.adjustStock.bind(this)
    }

    async list(req, res, next) {
        try {
            const result = await this.inventoryService.list(req.query)
            res.json(result)
        } catch (err) {
            next(err)
        }
    }

    async getByWarehouseAndProduct(req, res, next) {
        try {
            const entry = await this.inventoryService.getByWarehouseAndProduct(
                req.params.warehouseId,
                req.params.productId
            )
            res.json({ data: entry })
        } catch (err) {
            next(err)
        }
    }

    async getLowStock(req, res, next) {
        try {
            const result = await this.inventoryService.getLowStock(req.query)
            res.json(result)
        } catch (err) {
            next(err)
        }
    }

    async getSummary(req, res, next) {
        try {
            const summary = await this.inventoryService.getSummary()
            res.json({ data: summary })
        } catch (err) {
            next(err)
        }
    }

    async receiveStock(req, res, next) {
        try {
            await this.inventoryService.receiveStock(
                req.body.warehouseId,
                req.body.productId,
                req.body.quantity,
                req.user.id,
                req.body.referenceType,
                req.body.referenceId,
                req.body.reason
            )
            res.status(201).json({ message: 'Stock received' })
        } catch (err) {
            next(err)
        }
    }

    async issueStock(req, res, next) {
        try {
            await this.inventoryService.issueStock(
                req.body.warehouseId,
                req.body.productId,
                req.body.quantity,
                req.user.id,
                req.body.reason
            )
            res.status(201).json({ message: 'Stock issued' })
        } catch (err) {
            next(err)
        }
    }

    async adjustStock(req, res, next) {
        try {
            await this.inventoryService.adjustStock(
                req.body.warehouseId,
                req.body.productId,
                req.body.quantity,
                req.body.type,
                req.user.id,
                req.body.reason
            )
            res.status(201).json({ message: 'Stock adjusted' })
        } catch (err) {
            next(err)
        }
    }
}

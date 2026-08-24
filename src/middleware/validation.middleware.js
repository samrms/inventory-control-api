class ValidationMiddleware {
    constructor() {
        this.createProductValidation = this.createProductValidation.bind(this)
    }
    async createProductValidation(req, res, next) {
        const { sku, name, price } = req.body

        if (!!sku && !!name && !!price) {
            next()
        }

        if (!sku) {
            return res.status(400).json({
                type: `PRODUCT_SKU_IS_REQUIRED`,
                message: `product sku is required`,
            })
        }

        if (!name) {
            return res.status(400).json({
                type: `PRODUCT_NAME_IS_REQUIRED`,
                message: `product name is required`,
            })
        }

        if (!price) {
            return res.status(400).json({
                type: `PRODUCT_PRICE_IS_REQUIRED`,
                message: `product price is required`,
            })
        }
        return res.status(400).json({
            type: `ALL_PRODUCT_ATTRIBUTES_IS_REQUIRED`,
            message: `all products attributes is required`,
        })
    }
}
export { ValidationMiddleware }

function validateCreateProduct(req, res, next) {
    const { sku, name, price } = req.body

    if (!sku) {
        return res.status(400).json({
            message: 'SKU is required',
        })
    }

    if (!name) {
        return res.status(400).json({
            message: 'Name is required',
        })
    }

    if (price <= 0) {
        return res.status(400).json({
            message: 'Price must be greater than zero',
        })
    }

    next()
}

export { validateCreateProduct }

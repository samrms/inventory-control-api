class ProductController {
    constructor(productService) {
        this.productService = productService
        this.getAllProducts = this.getAllProducts.bind(this)
        this.getProductById = this.getProductById.bind(this)
        this.createProduct = this.createProduct.bind(this)
        this.updateProduct = this.updateProduct.bind(this)
        this.deleteProduct = this.deleteProduct.bind(this)
    }
    async getAllProducts(req, res) {
        const { query } = req
        const result = await this.productService.getAllProducts({ query })
        return res.status(200).json(result)
    }
    async getProductById(req, res) {
        const { id } = req.params
        const result = await this.productService.getProductById({ id })
        return res.status(200).json(result)
    }
    async createProduct(req, res) {
        const { body } = req
        const result = await this.productService.createProduct({ body })
        return res.status(201).json(result)
    }
    async updateProduct(req, res) {
        const {
            body,
            params: { id },
        } = req
        await this.productService.updateProduct({ id, body })
        return res.status(204).send('product_updated')
    }
    async deleteProduct(req, res) {
        const { id } = req.params
        await this.productService.deleteProduct({ id })
        return res.status(204).send('product_deleted')
    }
}

export { ProductController }

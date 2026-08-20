class ProductController {
    constructor(productService) {
        this.productService = productService
        this.getAllProducts = this.getAllProducts.bind(this)
    }
    async getAllProducts(req, res) {
        const { query } = req
        const products = await this.productService.getAllProducts({ query })
        return res.status(200).json(products)
    }
    async getProductById(req, res) {}
    async createProduct(req, res) {}
    async updateProduct(req, res) {}
    async deleteProduct(req, res) {}
}

export { ProductController }

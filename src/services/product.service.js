class ProductServices {
    constructor(productRepository) {
        this.productRepository = productRepository
    }

    async getAllProducts({ query }) {
        const page = Number(query.page) || 1
        const limit = Number(query.limit) || 5

        const { rows } = await this.productRepository.findAll()

        const data = rows.slice((page - 1) * limit, page * limit)
        const total = rows.length
        const totalPages = Math.ceil(total / limit)

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
            _links: {
                self: {
                    href: '/products',
                },
                create: {
                    href: '/products',
                    method: 'POST',
                },
                next: {
                    href: '/products?page=1&limit=5',
                },
            },
        }
    }
    async getProductById({ id }) {
        return this.productRepository.findById({ id })
    }
    async createProduct({ data }) {}
    async updateProduct({ id, data }) {}
    async deleteProduct({ id }) {}
}

export { ProductServices }

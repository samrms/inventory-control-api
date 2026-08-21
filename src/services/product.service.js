class ProductServices {
    constructor(productRepository) {
        this.productRepository = productRepository
    }

    async getAllProducts({ query }) {
        const page = Number(query.page) || 1
        const limit = Number(query.limit) || 5
        const offset = (page - 1) * limit

        const { resultPagination, resultCount } =
            await this.productRepository.findAll({
                limit,
                offset,
            })

        const data = resultPagination
        const total = Number(resultCount.count)
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

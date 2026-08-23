class ProductServices {
    constructor(productRepository) {
        this.productRepository = productRepository
    }

    async getAllProducts({ query }) {
        const limit = Math.min(
            Math.max(!Number(query.limit) ? 5 : Number(query.limit), 5),
            100
        )

        const { count } = await this.productRepository.countAll()

        const page = Math.min(
            Math.max(!Number(query.page) ? 1 : Number(query.page), 1),
            Number(count) / limit
        )

        const offset = (page - 1) * limit

        const { data = [] } = await this.productRepository.findAll({
            limit,
            offset,
        })

        const total = Number(count)
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
        const { data = [] } = await this.productRepository.findById({
            id,
        })

        return {
            data,
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
    async createProduct({ body }) {
        const input = {
            sku: body.sku,
            name: body.name,
            description: body.description,
            price: parseFloat(body.price),
            minimum_quantity: Number(
                body.minimum_quantity || body.minimumQuantity
            ),
        }

        const { data = [] } = await this.productRepository.create({ input })

        return {
            data,
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
    async updateProduct({ id, body }) {
        await this.productRepository.update({
            id,
            body,
        })
    }
    async deleteProduct({ id }) {
        await this.productRepository.delete({ id })
    }
}

export { ProductServices }

export class ProductsService {
    constructor(productsRepository, auditLogRepository, AppError) {
        this.productsRepository = productsRepository
        this.auditLogRepository = auditLogRepository
        this.AppError = AppError
    }

    async list(query) {
        return this.productsRepository.findAll(query)
    }

    async getById(id) {
        const product = await this.productsRepository.findById(id)
        if (!product) {
            throw new this.AppError('Product not found', 404)
        }
        return product
    }

    async create(data, userId) {
        const existing = await this.productsRepository.findBySku(data.sku)
        if (existing) {
            throw new this.AppError('SKU already exists', 409)
        }

        let product
        try {
            product = await this.productsRepository.create(data)
        } catch (err) {
            if (err.code === '23505') {
                throw new this.AppError('SKU already exists', 409)
            }
            throw err
        }

        await this.auditLogRepository.create({
            userId,
            action: 'PRODUCT_CREATED',
            entityType: 'product',
            entityId: product.id,
            metadata: { sku: product.sku, name: product.name },
        })

        return product
    }

    async update(id, data, userId) {
        const product = await this.productsRepository.findById(id)
        if (!product) {
            throw new this.AppError('Product not found', 404)
        }

        const updated = await this.productsRepository.update(id, data)

        await this.auditLogRepository.create({
            userId,
            action: 'PRODUCT_UPDATED',
            entityType: 'product',
            entityId: id,
        })

        return updated
    }

    async delete(id, userId) {
        const product = await this.productsRepository.findById(id)
        if (!product) {
            throw new this.AppError('Product not found', 404)
        }

        const deleted = await this.productsRepository.delete(id)

        await this.auditLogRepository.create({
            userId,
            action: 'PRODUCT_DELETED',
            entityType: 'product',
            entityId: id,
        })

        return deleted
    }
}

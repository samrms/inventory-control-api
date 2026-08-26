import { AppError } from '../../shared/errors/app-error.js'

export class SuppliersService {
    constructor(suppliersRepository, auditLogRepository) {
        this.suppliersRepository = suppliersRepository
        this.auditLogRepository = auditLogRepository
    }

    async list(query) {
        return this.suppliersRepository.findAll(query)
    }

    async getById(id) {
        const supplier = await this.suppliersRepository.findById(id)
        if (!supplier) {
            throw new AppError('Supplier not found', 404)
        }
        return supplier
    }

    async create(data, userId) {
        const supplier = await this.suppliersRepository.create(data)

        await this.auditLogRepository.create({
            userId,
            action: 'SUPPLIER_CREATED',
            entityType: 'supplier',
            entityId: supplier.id,
            metadata: { name: supplier.name },
        })

        return supplier
    }

    async update(id, data, userId) {
        const supplier = await this.suppliersRepository.findById(id)
        if (!supplier) {
            throw new AppError('Supplier not found', 404)
        }

        const updated = await this.suppliersRepository.update(id, data)

        await this.auditLogRepository.create({
            userId,
            action: 'SUPPLIER_UPDATED',
            entityType: 'supplier',
            entityId: id,
        })

        return updated
    }

    async delete(id, userId) {
        const supplier = await this.suppliersRepository.findById(id)
        if (!supplier) {
            throw new AppError('Supplier not found', 404)
        }

        const deleted = await this.suppliersRepository.delete(id)

        await this.auditLogRepository.create({
            userId,
            action: 'SUPPLIER_DELETED',
            entityType: 'supplier',
            entityId: id,
        })

        return deleted
    }
}

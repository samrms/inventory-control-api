import { AppError } from '../../shared/errors/app-error.js'

export class WarehousesService {
    constructor(warehousesRepository, auditLogRepository) {
        this.warehousesRepository = warehousesRepository
        this.auditLogRepository = auditLogRepository
    }

    async list(query) {
        return this.warehousesRepository.findAll(query)
    }

    async getById(id) {
        const warehouse = await this.warehousesRepository.findById(id)
        if (!warehouse) {
            throw new AppError('Warehouse not found', 404)
        }
        return warehouse
    }

    async create(data, userId) {
        const existing = await this.warehousesRepository.findByCode(data.code)
        if (existing) {
            throw new AppError('Warehouse code already exists', 409)
        }

        let warehouse
        try {
            warehouse = await this.warehousesRepository.create(data)
        } catch (err) {
            if (err.code === '23505') {
                throw new AppError('Warehouse code already exists', 409)
            }
            throw err
        }

        await this.auditLogRepository.create({
            userId,
            action: 'WAREHOUSE_CREATED',
            entityType: 'warehouse',
            entityId: warehouse.id,
            metadata: { code: warehouse.code, name: warehouse.name },
        })

        return warehouse
    }

    async update(id, data, userId) {
        const warehouse = await this.warehousesRepository.findById(id)
        if (!warehouse) {
            throw new AppError('Warehouse not found', 404)
        }

        const updated = await this.warehousesRepository.update(id, data)

        await this.auditLogRepository.create({
            userId,
            action: 'WAREHOUSE_UPDATED',
            entityType: 'warehouse',
            entityId: id,
        })

        return updated
    }

    async delete(id, userId) {
        const warehouse = await this.warehousesRepository.findById(id)
        if (!warehouse) {
            throw new AppError('Warehouse not found', 404)
        }

        const deleted = await this.warehousesRepository.delete(id)

        await this.auditLogRepository.create({
            userId,
            action: 'WAREHOUSE_DELETED',
            entityType: 'warehouse',
            entityId: id,
        })

        return deleted
    }
}

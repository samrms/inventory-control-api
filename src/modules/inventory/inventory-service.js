import { AppError } from '../../shared/errors/app-error.js'

export class InventoryService {
    constructor(inventoryRepository, auditLogRepository, pool) {
        this.inventoryRepository = inventoryRepository
        this.auditLogRepository = auditLogRepository
        this.pool = pool
    }

    async list(query) {
        return this.inventoryRepository.findAll(query)
    }

    async getByWarehouseAndProduct(warehouseId, productId) {
        const entry = await this.inventoryRepository.findByWarehouseAndProduct(
            warehouseId,
            productId
        )
        if (!entry) {
            throw new AppError('Inventory entry not found', 404)
        }
        return entry
    }

    async getLowStock(query) {
        return this.inventoryRepository.findLowStock(query)
    }

    async getSummary() {
        return this.inventoryRepository.getSummary()
    }

    async receiveStock(
        warehouseId,
        productId,
        quantity,
        userId,
        referenceType,
        referenceId,
        reason
    ) {
        const client = await this.pool.connect()
        try {
            await client.query('BEGIN')

            await this.inventoryRepository.upsert(
                warehouseId,
                productId,
                quantity,
                client
            )

            await client.query(
                `INSERT INTO stock_movements (warehouse_id, product_id, user_id, type, quantity, reference_type, reference_id, reason)
                 VALUES ($1, $2, $3, 'RECEIPT', $4, $5, $6, $7)`,
                [
                    warehouseId,
                    productId,
                    userId,
                    quantity,
                    referenceType || null,
                    referenceId || null,
                    reason || null,
                ]
            )

            await this.auditLogRepository.create(
                {
                    userId,
                    action: 'STOCK_RECEIVED',
                    entityType: 'inventory',
                    entityId: null,
                    metadata: { warehouseId, productId, quantity },
                },
                client
            )

            await client.query('COMMIT')
        } catch (err) {
            await client.query('ROLLBACK')
            throw err
        } finally {
            client.release()
        }
    }

    async issueStock(warehouseId, productId, quantity, userId, reason) {
        const client = await this.pool.connect()
        try {
            await client.query('BEGIN')

            const inv = await this.inventoryRepository.lockAndFind(
                warehouseId,
                productId,
                client
            )
            const available = inv ? inv.quantity - inv.reserved_quantity : 0
            if (available < quantity) {
                throw new AppError(
                    `Insufficient stock. Available: ${available}, requested: ${quantity}`,
                    400
                )
            }

            await this.inventoryRepository.decrementQuantity(
                warehouseId,
                productId,
                quantity,
                client
            )

            await client.query(
                `INSERT INTO stock_movements (warehouse_id, product_id, user_id, type, quantity, reason)
                 VALUES ($1, $2, $3, 'ISSUE', $4, $5)`,
                [warehouseId, productId, userId, quantity, reason || null]
            )

            await this.auditLogRepository.create(
                {
                    userId,
                    action: 'STOCK_ISSUED',
                    entityType: 'inventory',
                    entityId: null,
                    metadata: { warehouseId, productId, quantity },
                },
                client
            )

            await client.query('COMMIT')
        } catch (err) {
            await client.query('ROLLBACK')
            throw err
        } finally {
            client.release()
        }
    }

    async adjustStock(warehouseId, productId, quantity, type, userId, reason) {
        if (!['ADJUSTMENT_IN', 'ADJUSTMENT_OUT'].includes(type)) {
            throw new AppError('Invalid adjustment type', 400)
        }

        const client = await this.pool.connect()
        try {
            await client.query('BEGIN')

            if (type === 'ADJUSTMENT_OUT') {
                const inv = await this.inventoryRepository.lockAndFind(
                    warehouseId,
                    productId,
                    client
                )
                const available = inv ? inv.quantity - inv.reserved_quantity : 0
                if (available < quantity) {
                    throw new AppError(
                        `Insufficient stock for adjustment. Available: ${available}`,
                        400
                    )
                }
                await this.inventoryRepository.decrementQuantity(
                    warehouseId,
                    productId,
                    quantity,
                    client
                )
            } else {
                await this.inventoryRepository.upsert(
                    warehouseId,
                    productId,
                    quantity,
                    client
                )
            }

            await client.query(
                `INSERT INTO stock_movements (warehouse_id, product_id, user_id, type, quantity, reason)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [warehouseId, productId, userId, type, quantity, reason || null]
            )

            await this.auditLogRepository.create(
                {
                    userId,
                    action:
                        type === 'ADJUSTMENT_IN'
                            ? 'STOCK_ADJUSTED_IN'
                            : 'STOCK_ADJUSTED_OUT',
                    entityType: 'inventory',
                    entityId: null,
                    metadata: { warehouseId, productId, quantity, type },
                },
                client
            )

            await client.query('COMMIT')
        } catch (err) {
            await client.query('ROLLBACK')
            throw err
        } finally {
            client.release()
        }
    }
}

import { AppError } from '../../shared/errors/app-error.js'

export class TransfersService {
    constructor(
        transfersRepository,
        inventoryRepository,
        auditLogRepository,
        pool
    ) {
        this.transfersRepository = transfersRepository
        this.inventoryRepository = inventoryRepository
        this.auditLogRepository = auditLogRepository
        this.pool = pool
    }

    async list(query) {
        return this.transfersRepository.findAll(query)
    }

    async getById(id) {
        const transfer = await this.transfersRepository.findById(id)
        if (!transfer) {
            throw new AppError('Transfer not found', 404)
        }
        transfer.items = await this.transfersRepository.findItems(id)
        return transfer
    }

    async create({ sourceWarehouseId, destinationWarehouseId, items }, userId) {
        const transfer = await this.transfersRepository.create({
            sourceWarehouseId,
            destinationWarehouseId,
            items,
            createdBy: userId,
        })

        await this.auditLogRepository.create({
            userId,
            action: 'TRANSFER_CREATED',
            entityType: 'transfer',
            entityId: transfer.id,
            metadata: {
                sourceWarehouseId,
                destinationWarehouseId,
                itemCount: items.length,
            },
        })

        return this.getById(transfer.id)
    }

    async complete(id, userId) {
        const client = await this.pool.connect()
        try {
            await client.query('BEGIN')

            const transfer = await client.query(
                'SELECT * FROM transfers WHERE id = $1 FOR UPDATE',
                [id]
            )
            if (transfer.rows.length === 0) {
                throw new AppError('Transfer not found', 404)
            }
            if (transfer.rows[0].status !== 'PENDING') {
                throw new AppError(
                    `Cannot complete transfer in status ${transfer.rows[0].status}`,
                    400
                )
            }

            const t = transfer.rows[0]
            const items = await client.query(
                'SELECT * FROM transfer_items WHERE transfer_id = $1',
                [id]
            )

            for (const item of items.rows) {
                const sourceInv = await client.query(
                    'SELECT * FROM inventory WHERE warehouse_id = $1 AND product_id = $2 FOR UPDATE',
                    [t.source_warehouse_id, item.product_id]
                )

                if (
                    sourceInv.rows.length === 0 ||
                    sourceInv.rows[0].quantity < item.quantity
                ) {
                    throw new AppError(
                        `Insufficient stock for product ${item.product_id} in source warehouse`,
                        400
                    )
                }

                await client.query(
                    `UPDATE inventory SET quantity = quantity - $3, updated_at = NOW()
                     WHERE warehouse_id = $1 AND product_id = $2`,
                    [t.source_warehouse_id, item.product_id, item.quantity]
                )

                await client.query(
                    `INSERT INTO inventory (warehouse_id, product_id, quantity, reserved_quantity)
                     VALUES ($1, $2, $3, 0)
                     ON CONFLICT (warehouse_id, product_id)
                     DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity,
                                  updated_at = NOW()`,
                    [t.destination_warehouse_id, item.product_id, item.quantity]
                )

                await client.query(
                    `INSERT INTO stock_movements (warehouse_id, product_id, user_id, type, quantity, reference_type, reference_id, reason)
                     VALUES ($1, $2, $3, 'TRANSFER_OUT', $4, 'transfer', $5, $6)`,
                    [
                        t.source_warehouse_id,
                        item.product_id,
                        userId,
                        item.quantity,
                        id,
                        `Transfer #${id}`,
                    ]
                )

                await client.query(
                    `INSERT INTO stock_movements (warehouse_id, product_id, user_id, type, quantity, reference_type, reference_id, reason)
                     VALUES ($1, $2, $3, 'TRANSFER_IN', $4, 'transfer', $5, $6)`,
                    [
                        t.destination_warehouse_id,
                        item.product_id,
                        userId,
                        item.quantity,
                        id,
                        `Transfer #${id}`,
                    ]
                )
            }

            await client.query(
                `UPDATE transfers SET status = 'COMPLETED', completed_at = NOW() WHERE id = $1`,
                [id]
            )

            await this.auditLogRepository.create(
                {
                    userId,
                    action: 'TRANSFER_COMPLETED',
                    entityType: 'transfer',
                    entityId: id,
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

        return this.getById(id)
    }

    async cancel(id, userId) {
        const transfer = await this.transfersRepository.findById(id)
        if (!transfer) {
            throw new AppError('Transfer not found', 404)
        }
        if (transfer.status !== 'PENDING') {
            throw new AppError(
                `Cannot cancel transfer in status ${transfer.status}`,
                400
            )
        }

        await this.transfersRepository.updateStatus(id, 'CANCELLED')

        await this.auditLogRepository.create({
            userId,
            action: 'TRANSFER_CANCELLED',
            entityType: 'transfer',
            entityId: id,
        })

        return this.getById(id)
    }
}

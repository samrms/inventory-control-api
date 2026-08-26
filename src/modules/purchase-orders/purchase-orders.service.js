export class PurchaseOrdersService {
    constructor(purchaseOrdersRepository, auditLogRepository, pool, AppError) {
        this.purchaseOrdersRepository = purchaseOrdersRepository
        this.auditLogRepository = auditLogRepository
        this.pool = pool
        this.AppError = AppError
    }

    async list(query) {
        return this.purchaseOrdersRepository.findAll(query)
    }

    async getById(id) {
        const po = await this.purchaseOrdersRepository.findById(id)
        if (!po) {
            throw new this.AppError('Purchase order not found', 404)
        }
        po.items = await this.purchaseOrdersRepository.findItems(id)
        return po
    }

    async create({ supplierId, warehouseId, items }, userId) {
        const po = await this.purchaseOrdersRepository.create({
            supplierId,
            warehouseId,
            items,
            createdBy: userId,
        })

        await this.auditLogRepository.create({
            userId,
            action: 'PURCHASE_ORDER_CREATED',
            entityType: 'purchase_order',
            entityId: po.id,
            metadata: { supplierId, warehouseId, itemCount: items.length },
        })

        return this.getById(po.id)
    }

    async submit(id, userId) {
        const po = await this.purchaseOrdersRepository.findById(id)
        if (!po) {
            throw new this.AppError('Purchase order not found', 404)
        }
        if (po.status !== 'DRAFT') {
            throw new this.AppError(
                `Cannot submit PO in status ${po.status}`,
                400
            )
        }

        await this.purchaseOrdersRepository.updateStatus(id, 'ORDERED')

        await this.auditLogRepository.create({
            userId,
            action: 'PURCHASE_ORDER_ORDERED',
            entityType: 'purchase_order',
            entityId: id,
        })

        return this.getById(id)
    }

    async receive(id, userId) {
        const client = await this.pool.connect()
        try {
            await client.query('BEGIN')

            const po = await client.query(
                'SELECT * FROM purchase_orders WHERE id = $1 FOR UPDATE',
                [id]
            )
            if (po.rows.length === 0) {
                throw new this.AppError('Purchase order not found', 404)
            }
            if (po.rows[0].status !== 'ORDERED') {
                throw new this.AppError(
                    `Cannot receive PO in status ${po.rows[0].status}`,
                    400
                )
            }

            const order = po.rows[0]
            const items = await client.query(
                'SELECT * FROM purchase_order_items WHERE purchase_order_id = $1',
                [id]
            )

            for (const item of items.rows) {
                await client.query(
                    `INSERT INTO inventory (warehouse_id, product_id, quantity, reserved_quantity)
                     VALUES ($1, $2, $3, 0)
                     ON CONFLICT (warehouse_id, product_id)
                     DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity,
                                  updated_at = NOW()`,
                    [order.warehouse_id, item.product_id, item.quantity]
                )

                await client.query(
                    `INSERT INTO stock_movements (warehouse_id, product_id, user_id, type, quantity, reference_type, reference_id, reason)
                     VALUES ($1, $2, $3, 'RECEIPT', $4, 'purchase_order', $5, $6)`,
                    [
                        order.warehouse_id,
                        item.product_id,
                        userId,
                        item.quantity,
                        id,
                        `PO #${id} received`,
                    ]
                )
            }

            await client.query(
                `UPDATE purchase_orders SET status = 'RECEIVED', updated_at = NOW() WHERE id = $1`,
                [id]
            )

            await this.auditLogRepository.create(
                {
                    userId,
                    action: 'PURCHASE_ORDER_RECEIVED',
                    entityType: 'purchase_order',
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
        const po = await this.purchaseOrdersRepository.findById(id)
        if (!po) {
            throw new this.AppError('Purchase order not found', 404)
        }
        if (!['DRAFT', 'ORDERED'].includes(po.status)) {
            throw new this.AppError(
                `Cannot cancel PO in status ${po.status}`,
                400
            )
        }

        await this.purchaseOrdersRepository.updateStatus(id, 'CANCELLED')

        await this.auditLogRepository.create({
            userId,
            action: 'PURCHASE_ORDER_CANCELLED',
            entityType: 'purchase_order',
            entityId: id,
        })

        return this.getById(id)
    }
}

import { AppError } from '../../shared/errors/app-error.js'

export class ReservationsService {
    constructor(
        reservationsRepository,
        inventoryRepository,
        auditLogRepository,
        pool
    ) {
        this.reservationsRepository = reservationsRepository
        this.inventoryRepository = inventoryRepository
        this.auditLogRepository = auditLogRepository
        this.pool = pool
    }

    async list(query) {
        return this.reservationsRepository.findAll(query)
    }

    async getById(id) {
        const reservation = await this.reservationsRepository.findById(id)
        if (!reservation) {
            throw new AppError('Reservation not found', 404)
        }
        return reservation
    }

    async create(
        { warehouseId, productId, quantity, reference, expiresAt },
        userId
    ) {
        const client = await this.pool.connect()
        try {
            await client.query('BEGIN')

            const inv = await this.inventoryRepository.lockAndFind(
                warehouseId,
                productId,
                client
            )
            if (!inv) {
                throw new AppError('Inventory entry not found', 404)
            }

            const available = inv.quantity - inv.reserved_quantity
            if (available < quantity) {
                throw new AppError(
                    `Insufficient available stock. Available: ${available}, requested: ${quantity}`,
                    400
                )
            }

            await this.inventoryRepository.incrementReserved(
                warehouseId,
                productId,
                quantity,
                client
            )

            const reservation = await this.reservationsRepository.create(
                {
                    warehouseId,
                    productId,
                    quantity,
                    reference,
                    expiresAt,
                    createdBy: userId,
                },
                client
            )

            await this.auditLogRepository.create(
                {
                    userId,
                    action: 'RESERVATION_CREATED',
                    entityType: 'reservation',
                    entityId: reservation.id,
                },
                client
            )

            await client.query('COMMIT')

            return reservation
        } catch (err) {
            await client.query('ROLLBACK')
            throw err
        } finally {
            client.release()
        }
    }

    async release(id, userId) {
        const client = await this.pool.connect()
        try {
            await client.query('BEGIN')

            const reservation = await client.query(
                'SELECT * FROM reservations WHERE id = $1 FOR UPDATE',
                [id]
            )
            if (reservation.rows.length === 0) {
                throw new AppError('Reservation not found', 404)
            }

            const r = reservation.rows[0]
            if (r.status !== 'ACTIVE') {
                throw new AppError(
                    `Cannot release reservation in status ${r.status}`,
                    400
                )
            }

            await this.inventoryRepository.decrementReserved(
                r.warehouse_id,
                r.product_id,
                r.quantity,
                client
            )
            await this.reservationsRepository.updateStatus(
                id,
                'RELEASED',
                client
            )

            await this.auditLogRepository.create(
                {
                    userId,
                    action: 'RESERVATION_RELEASED',
                    entityType: 'reservation',
                    entityId: id,
                },
                client
            )

            await client.query('COMMIT')

            return this.getById(id)
        } catch (err) {
            await client.query('ROLLBACK')
            throw err
        } finally {
            client.release()
        }
    }

    async fulfill(id, userId) {
        const client = await this.pool.connect()
        try {
            await client.query('BEGIN')

            const reservation = await client.query(
                'SELECT * FROM reservations WHERE id = $1 FOR UPDATE',
                [id]
            )
            if (reservation.rows.length === 0) {
                throw new AppError('Reservation not found', 404)
            }

            const r = reservation.rows[0]
            if (r.status !== 'ACTIVE') {
                throw new AppError(
                    `Cannot fulfill reservation in status ${r.status}`,
                    400
                )
            }

            const inv = await this.inventoryRepository.lockAndFind(
                r.warehouse_id,
                r.product_id,
                client
            )
            if (!inv || inv.quantity < r.quantity) {
                throw new AppError(
                    'Insufficient stock to fulfill reservation',
                    400
                )
            }

            await this.inventoryRepository.decrementReserved(
                r.warehouse_id,
                r.product_id,
                r.quantity,
                client
            )
            await this.inventoryRepository.decrementQuantity(
                r.warehouse_id,
                r.product_id,
                r.quantity,
                client
            )
            await this.reservationsRepository.updateStatus(
                id,
                'FULFILLED',
                client
            )

            await client.query(
                `INSERT INTO stock_movements (warehouse_id, product_id, user_id, type, quantity, reference_type, reference_id, reason)
                 VALUES ($1, $2, $3, 'ISSUE', $4, 'reservation', $5, $6)`,
                [
                    r.warehouse_id,
                    r.product_id,
                    userId,
                    r.quantity,
                    id,
                    `Reservation #${id} fulfilled`,
                ]
            )

            await this.auditLogRepository.create(
                {
                    userId,
                    action: 'RESERVATION_FULFILLED',
                    entityType: 'reservation',
                    entityId: id,
                },
                client
            )

            await client.query('COMMIT')

            return this.getById(id)
        } catch (err) {
            await client.query('ROLLBACK')
            throw err
        } finally {
            client.release()
        }
    }
}

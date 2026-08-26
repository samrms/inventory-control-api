import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import pg from 'pg'
import { InventoryRepository } from '../../src/modules/inventory/inventory.repository.js'
import { runMigrations, teardown, seedTestData } from '../helpers/db.js'

let pool
let repo
let seed

beforeAll(async () => {
    pool = new pg.Pool({
        connectionString:
            process.env.DATABASE_URL ||
            'postgresql://postgres:postgres@localhost:5432/inventory_control_test',
    })
    await teardown(pool)
    await runMigrations(pool)
    repo = new InventoryRepository(pool)
    seed = await seedTestData(pool)
})

afterAll(async () => {
    await teardown(pool)
    await pool.end()
})

beforeEach(async () => {
    await pool.query('DELETE FROM inventory')
    await pool.query('DELETE FROM stock_movements')
})

describe('InventoryRepository', () => {
    describe('upsert', () => {
        it('should create inventory entry', async () => {
            const client = await pool.connect()
            try {
                const entry = await repo.upsert(
                    seed.warehouse.id,
                    seed.product.id,
                    50,
                    client
                )

                expect(entry.quantity).toBe(50)
                expect(entry.warehouse_id).toBe(seed.warehouse.id)
                expect(entry.product_id).toBe(seed.product.id)
            } finally {
                client.release()
            }
        })

        it('should increment existing inventory', async () => {
            const client = await pool.connect()
            try {
                await repo.upsert(
                    seed.warehouse.id,
                    seed.product.id,
                    30,
                    client
                )
                const entry = await repo.upsert(
                    seed.warehouse.id,
                    seed.product.id,
                    20,
                    client
                )

                expect(entry.quantity).toBe(50)
            } finally {
                client.release()
            }
        })
    })

    describe('lockAndFind', () => {
        it('should find and lock inventory row', async () => {
            const client = await pool.connect()
            try {
                await repo.upsert(
                    seed.warehouse.id,
                    seed.product.id,
                    10,
                    client
                )

                const entry = await repo.lockAndFind(
                    seed.warehouse.id,
                    seed.product.id,
                    client
                )

                expect(entry).not.toBeNull()
                expect(entry.quantity).toBe(10)
            } finally {
                client.release()
            }
        })

        it('should return null if not found', async () => {
            const client = await pool.connect()
            try {
                const entry = await repo.lockAndFind(
                    '00000000-0000-0000-0000-000000000000',
                    '00000000-0000-0000-0000-000000000000',
                    client
                )
                expect(entry).toBeNull()
            } finally {
                client.release()
            }
        })
    })

    describe('decrementQuantity', () => {
        it('should decrement quantity', async () => {
            const client = await pool.connect()
            try {
                await repo.upsert(
                    seed.warehouse.id,
                    seed.product.id,
                    100,
                    client
                )

                await repo.decrementQuantity(
                    seed.warehouse.id,
                    seed.product.id,
                    30,
                    client
                )

                const entry = await repo.lockAndFind(
                    seed.warehouse.id,
                    seed.product.id,
                    client
                )
                expect(entry.quantity).toBe(70)
            } finally {
                client.release()
            }
        })
    })

    describe('incrementReserved / decrementReserved', () => {
        it('should manage reserved quantity', async () => {
            const client = await pool.connect()
            try {
                await repo.upsert(
                    seed.warehouse.id,
                    seed.product.id,
                    50,
                    client
                )

                await repo.incrementReserved(
                    seed.warehouse.id,
                    seed.product.id,
                    10,
                    client
                )

                let entry = await repo.lockAndFind(
                    seed.warehouse.id,
                    seed.product.id,
                    client
                )
                expect(entry.reserved_quantity).toBe(10)

                await repo.decrementReserved(
                    seed.warehouse.id,
                    seed.product.id,
                    5,
                    client
                )

                entry = await repo.lockAndFind(
                    seed.warehouse.id,
                    seed.product.id,
                    client
                )
                expect(entry.reserved_quantity).toBe(5)
            } finally {
                client.release()
            }
        })
    })

    describe('getSummary', () => {
        it('should return summary', async () => {
            const client = await pool.connect()
            try {
                await repo.upsert(
                    seed.warehouse.id,
                    seed.product.id,
                    25,
                    client
                )
            } finally {
                client.release()
            }

            const summary = await repo.getSummary()

            expect(summary).toBeDefined()
            expect(Number(summary.total_products)).toBeGreaterThanOrEqual(1)
            expect(Number(summary.total_warehouses)).toBeGreaterThanOrEqual(1)
        })
    })
})

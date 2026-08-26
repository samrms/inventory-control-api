import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import pg from 'pg'
import { ProductsRepository } from '../../src/modules/products/products-repository.js'
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
    repo = new ProductsRepository(pool)
    seed = await seedTestData(pool)
})

afterAll(async () => {
    await teardown(pool)
    await pool.end()
})

beforeEach(async () => {
    await pool.query('DELETE FROM inventory')
    await pool.query('DELETE FROM stock_movements')
    await pool.query('DELETE FROM products WHERE sku != $1', ['SKU-001'])
    await pool.query(
        'UPDATE products SET deleted_at = NULL, updated_at = NOW() WHERE sku = $1',
        ['SKU-001']
    )
})

describe('ProductsRepository', () => {
    describe('create', () => {
        it('should create a product', async () => {
            const product = await repo.create({
                sku: 'KB-002',
                name: 'Keyboard Pro',
                price: 299.9,
                cost: 150.0,
                minimumStock: 5,
                maximumStock: 50,
            })

            expect(product.sku).toBe('KB-002')
            expect(product.name).toBe('Keyboard Pro')
            expect(product.id).toBeDefined()
        })
    })

    describe('findAll', () => {
        it('should return paginated products', async () => {
            await repo.create({ sku: 'MOUSE-001', name: 'Mouse', price: 50 })

            const result = await repo.findAll({ page: 1, limit: 20 })

            expect(result.data.length).toBeGreaterThanOrEqual(1)
            expect(result.pagination).toBeDefined()
            expect(result.pagination.total).toBeGreaterThanOrEqual(1)
        })

        it('should filter by search', async () => {
            await repo.create({ sku: 'CAM-001', name: 'Webcam HD', price: 80 })

            const result = await repo.findAll({ search: 'webcam' })

            expect(result.data.some((p) => p.name === 'Webcam HD')).toBeTruthy()
        })

        it('should filter by category', async () => {
            await pool.query(
                `INSERT INTO products (sku, name, price, category)
                 VALUES ('CAT-001', 'Category Item', 10, 'electronics')`
            )

            const result = await repo.findAll({ category: 'electronics' })

            expect(
                result.data.some((p) => p.category === 'electronics')
            ).toBeTruthy()
        })
    })

    describe('findById', () => {
        it('should find a product by id', async () => {
            const found = await repo.findById(seed.product.id)

            expect(found).not.toBeNull()
            expect(found.sku).toBe('SKU-001')
        })

        it('should return null for deleted product', async () => {
            const second = await repo.create({
                sku: 'DEL-001',
                name: 'To Delete',
                price: 10,
            })

            await repo.delete(second.id)

            const found = await repo.findById(second.id)
            expect(found).toBeNull()
        })
    })

    describe('findBySku', () => {
        it('should find by sku', async () => {
            const found = await repo.findBySku('SKU-001')
            expect(found).not.toBeNull()
        })

        it('should return null for non-existent sku', async () => {
            const found = await repo.findBySku('NOPE')
            expect(found).toBeNull()
        })
    })

    describe('update', () => {
        it('should update a product', async () => {
            const updated = await repo.update(seed.product.id, {
                name: 'Updated Keyboard',
                price: 350,
            })

            expect(updated.name).toBe('Updated Keyboard')
            expect(Number(updated.price)).toBe(350)
        })
    })

    describe('delete (soft-delete)', () => {
        it('should soft-delete a product', async () => {
            const toDelete = await repo.create({
                sku: 'SOFT-001',
                name: 'Soft Delete Me',
                price: 50,
            })

            const deleted = await repo.delete(toDelete.id)

            expect(deleted).not.toBeNull()
            expect(deleted.deleted_at).not.toBeNull()

            const found = await repo.findById(toDelete.id)
            expect(found).toBeNull()
        })
    })
})

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { setup, getSeed } from '../helpers/e2e-setup.js'

let app
let token

beforeAll(async () => {
    const result = await setup()
    app = result.app

    const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@e2e.com', password: 'password123' })

    token = loginRes.body.data.token
})

afterAll(async () => {
    const { getPool } = await import('../helpers/e2e-setup.js')
    const pool = getPool()
    if (pool) await pool.end()
})

describe('Inventory E2E', () => {
    describe('POST /api/v1/inventory/receive', () => {
        it('should receive stock', async () => {
            const seed = getSeed()
            const res = await request(app)
                .post('/api/v1/inventory/receive')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    warehouseId: seed.warehouse1.id,
                    productId: seed.product1.id,
                    quantity: 100,
                    reason: 'Initial stock',
                })

            expect(res.status).toBe(201)
            expect(res.body.message).toBe('Stock received')
        })

        it('should return 400 for missing warehouseId', async () => {
            const seed = getSeed()
            const res = await request(app)
                .post('/api/v1/inventory/receive')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    productId: seed.product1.id,
                    quantity: 10,
                })

            expect(res.status).toBe(400)
        })

        it('should return 400 for quantity <= 0', async () => {
            const seed = getSeed()
            const res = await request(app)
                .post('/api/v1/inventory/receive')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    warehouseId: seed.warehouse1.id,
                    productId: seed.product1.id,
                    quantity: -5,
                })

            expect(res.status).toBe(400)
        })
    })

    describe('GET /api/v1/inventory', () => {
        it('should list inventory', async () => {
            const res = await request(app)
                .get('/api/v1/inventory')
                .set('Authorization', `Bearer ${token}`)

            expect(res.status).toBe(200)
            expect(res.body.data).toBeInstanceOf(Array)
        })
    })

    describe('GET /api/v1/inventory/summary', () => {
        it('should return summary', async () => {
            const res = await request(app)
                .get('/api/v1/inventory/summary')
                .set('Authorization', `Bearer ${token}`)

            expect(res.status).toBe(200)
            expect(res.body.data).toBeDefined()
        })
    })

    describe('POST /api/v1/inventory/issue', () => {
        it('should issue stock', async () => {
            const seed = getSeed()
            const res = await request(app)
                .post('/api/v1/inventory/issue')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    warehouseId: seed.warehouse1.id,
                    productId: seed.product1.id,
                    quantity: 10,
                    reason: 'Sale',
                })

            expect(res.status).toBe(201)
            expect(res.body.message).toBe('Stock issued')
        })
    })

    describe('POST /api/v1/inventory/adjust', () => {
        it('should adjust stock in', async () => {
            const seed = getSeed()
            const res = await request(app)
                .post('/api/v1/inventory/adjust')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    warehouseId: seed.warehouse1.id,
                    productId: seed.product1.id,
                    quantity: 5,
                    type: 'ADJUSTMENT_IN',
                    reason: 'Found extra',
                })

            expect(res.status).toBe(201)
            expect(res.body.message).toBe('Stock adjusted')
        })

        it('should return 400 for invalid type', async () => {
            const seed = getSeed()
            const res = await request(app)
                .post('/api/v1/inventory/adjust')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    warehouseId: seed.warehouse1.id,
                    productId: seed.product1.id,
                    quantity: 5,
                    type: 'INVALID',
                })

            expect(res.status).toBe(400)
        })
    })

    describe('GET /api/v1/inventory/:warehouseId/:productId', () => {
        it('should get inventory by warehouse and product', async () => {
            const seed = getSeed()
            const res = await request(app)
                .get(
                    `/api/v1/inventory/${seed.warehouse1.id}/${seed.product1.id}`
                )
                .set('Authorization', `Bearer ${token}`)

            expect(res.status).toBe(200)
            expect(res.body.data).toBeDefined()
            expect(Number(res.body.data.quantity)).toBeGreaterThanOrEqual(1)
        })
    })
})

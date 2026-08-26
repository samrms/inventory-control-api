import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { setup } from '../helpers/e2e-setup.js'

let app
let token
let seed

beforeAll(async () => {
    const result = await setup()
    app = result.app
    seed = result.seed

    const signInRes = await request(app)
        .post('/api/v1/auth/sign-in')
        .send({ email: 'admin@e2e.com', password: 'password123' })

    token = signInRes.body.data.token

    await request(app)
        .post('/api/v1/inventory/receive')
        .set('Authorization', `Bearer ${token}`)
        .send({
            warehouseId: seed.warehouse1.id,
            productId: seed.product1.id,
            quantity: 100,
            reason: 'Seed stock for transfers',
        })
})

afterAll(async () => {
    const { getPool } = await import('../helpers/e2e-setup.js')
    const pool = getPool()
    if (pool) await pool.end()
})

describe('Transfers E2E', () => {
    describe('POST /api/v1/transfers', () => {
        it('should create a transfer', async () => {
            const res = await request(app)
                .post('/api/v1/transfers')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    sourceWarehouseId: seed.warehouse1.id,
                    destinationWarehouseId: seed.warehouse2.id,
                    items: [{ productId: seed.product1.id, quantity: 10 }],
                })

            expect(res.status).toBe(201)
            expect(res.body.data).toHaveProperty('id')
            expect(res.body.data.status).toBe('PENDING')
        })

        it('should return 400 for same warehouse', async () => {
            const res = await request(app)
                .post('/api/v1/transfers')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    sourceWarehouseId: seed.warehouse1.id,
                    destinationWarehouseId: seed.warehouse1.id,
                    items: [{ productId: seed.product1.id, quantity: 5 }],
                })

            expect(res.status).toBe(400)
        })

        it('should return 400 for empty items', async () => {
            const res = await request(app)
                .post('/api/v1/transfers')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    sourceWarehouseId: seed.warehouse1.id,
                    destinationWarehouseId: seed.warehouse2.id,
                    items: [],
                })

            expect(res.status).toBe(400)
        })
    })

    describe('GET /api/v1/transfers', () => {
        it('should list transfers', async () => {
            const res = await request(app)
                .get('/api/v1/transfers')
                .set('Authorization', `Bearer ${token}`)

            expect(res.status).toBe(200)
            expect(res.body.data).toBeInstanceOf(Array)
        })
    })

    describe('GET /api/v1/transfers/:id', () => {
        it('should get transfer by id', async () => {
            const listRes = await request(app)
                .get('/api/v1/transfers')
                .set('Authorization', `Bearer ${token}`)

            const transferId = listRes.body.data[0].id

            const res = await request(app)
                .get(`/api/v1/transfers/${transferId}`)
                .set('Authorization', `Bearer ${token}`)

            expect(res.status).toBe(200)
            expect(res.body.data.id).toBe(transferId)
        })
    })

    describe('POST /api/v1/transfers/:id/complete', () => {
        it('should complete a pending transfer', async () => {
            const listRes = await request(app)
                .get('/api/v1/transfers?status=PENDING')
                .set('Authorization', `Bearer ${token}`)

            const pending = listRes.body.data.find(
                (t) => t.status === 'PENDING'
            )

            if (!pending) {
                const createRes = await request(app)
                    .post('/api/v1/transfers')
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        sourceWarehouseId: seed.warehouse1.id,
                        destinationWarehouseId: seed.warehouse2.id,
                        items: [{ productId: seed.product1.id, quantity: 5 }],
                    })

                const res = await request(app)
                    .post(
                        `/api/v1/transfers/${createRes.body.data.id}/complete`
                    )
                    .set('Authorization', `Bearer ${token}`)

                expect(res.status).toBe(200)
                expect(res.body.message).toBe('Transfer completed')
            } else {
                const res = await request(app)
                    .post(`/api/v1/transfers/${pending.id}/complete`)
                    .set('Authorization', `Bearer ${token}`)

                expect(res.status).toBe(200)
            }
        })
    })

    describe('POST /api/v1/transfers/:id/cancel', () => {
        it('should cancel a pending transfer', async () => {
            const createRes = await request(app)
                .post('/api/v1/transfers')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    sourceWarehouseId: seed.warehouse1.id,
                    destinationWarehouseId: seed.warehouse2.id,
                    items: [{ productId: seed.product1.id, quantity: 2 }],
                })

            const newTransferId = createRes.body.data.id

            const res = await request(app)
                .post(`/api/v1/transfers/${newTransferId}/cancel`)
                .set('Authorization', `Bearer ${token}`)

            expect(res.status).toBe(200)
            expect(res.body.message).toBe('Transfer cancelled')
        })
    })
})

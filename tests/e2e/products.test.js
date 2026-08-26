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

describe('Products E2E', () => {
    describe('GET /api/v1/products', () => {
        it('should list products', async () => {
            const res = await request(app)
                .get('/api/v1/products')
                .set('Authorization', `Bearer ${token}`)

            expect(res.status).toBe(200)
            expect(res.body.data).toBeInstanceOf(Array)
            expect(res.body.data.length).toBeGreaterThanOrEqual(1)
        })

        it('should return 401 without token', async () => {
            const res = await request(app).get('/api/v1/products')
            expect(res.status).toBe(401)
        })

        it('should filter by search', async () => {
            const res = await request(app)
                .get('/api/v1/products?search=keyboard')
                .set('Authorization', `Bearer ${token}`)

            expect(res.status).toBe(200)
            expect(
                res.body.data.some((p) =>
                    p.name.toLowerCase().includes('keyboard')
                )
            ).toBeTruthy()
        })

        it('should paginate', async () => {
            const res = await request(app)
                .get('/api/v1/products?page=1&limit=1')
                .set('Authorization', `Bearer ${token}`)

            expect(res.status).toBe(200)
            expect(res.body.data.length).toBeLessThanOrEqual(1)
        })
    })

    describe('POST /api/v1/products', () => {
        it('should create a product', async () => {
            const res = await request(app)
                .post('/api/v1/products')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    sku: 'E2E-NEW-001',
                    name: 'E2E Test Product',
                    price: 199.99,
                    cost: 99.99,
                    minimumStock: 5,
                    maximumStock: 50,
                    category: 'electronics',
                })

            expect(res.status).toBe(201)
            expect(res.body.data.sku).toBe('E2E-NEW-001')
            expect(res.body.data.name).toBe('E2E Test Product')
        })

        it('should return 400 for missing sku', async () => {
            const res = await request(app)
                .post('/api/v1/products')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'No SKU' })

            expect(res.status).toBe(400)
        })

        it('should return 409 for duplicate sku', async () => {
            const res = await request(app)
                .post('/api/v1/products')
                .set('Authorization', `Bearer ${token}`)
                .send({ sku: 'SKU-001', name: 'Duplicate' })

            expect(res.status).toBe(409)
        })
    })

    describe('GET /api/v1/products/:id', () => {
        it('should get a product by id', async () => {
            const seed = getSeed()
            const res = await request(app)
                .get(`/api/v1/products/${seed.product1.id}`)
                .set('Authorization', `Bearer ${token}`)

            expect(res.status).toBe(200)
            expect(res.body.data.sku).toBe('SKU-001')
        })

        it('should return 404 for non-existent id', async () => {
            const res = await request(app)
                .get('/api/v1/products/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${token}`)

            expect(res.status).toBe(404)
        })
    })

    describe('PATCH /api/v1/products/:id', () => {
        it('should update a product', async () => {
            const seed = getSeed()
            const res = await request(app)
                .patch(`/api/v1/products/${seed.product1.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Updated Keyboard', price: 350 })

            expect(res.status).toBe(200)
            expect(res.body.data.name).toBe('Updated Keyboard')
        })
    })

    describe('DELETE /api/v1/products/:id', () => {
        it('should soft-delete a product', async () => {
            const seed = getSeed()
            const res = await request(app)
                .delete(`/api/v1/products/${seed.product2.id}`)
                .set('Authorization', `Bearer ${token}`)

            expect(res.status).toBe(204)

            const getRes = await request(app)
                .get(`/api/v1/products/${seed.product2.id}`)
                .set('Authorization', `Bearer ${token}`)

            expect(getRes.status).toBe(404)
        })
    })
})

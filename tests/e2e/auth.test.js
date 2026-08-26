import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { setup } from '../helpers/e2e-setup.js'

let app

beforeAll(async () => {
    const result = await setup()
    app = result.app
})

afterAll(async () => {
    const { getPool } = await import('../helpers/e2e-setup.js')
    const pool = getPool()
    if (pool) await pool.end()
})

describe('Auth E2E', () => {
    describe('POST /api/v1/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app).post('/api/v1/auth/register').send({
                name: 'New User',
                email: 'newuser@e2e.com',
                password: 'password123',
            })

            expect(res.status).toBe(201)
            expect(res.body.data).toHaveProperty('id')
            expect(res.body.data.name).toBe('New User')
            expect(res.body.data.email).toBe('newuser@e2e.com')
            expect(res.body.data.role).toBe('OPERATOR')
        })

        it('should return 400 for missing fields', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({ name: 'Test' })

            expect(res.status).toBe(400)
            expect(res.body.error).toBeDefined()
        })

        it('should return 400 for short password', async () => {
            const res = await request(app).post('/api/v1/auth/register').send({
                name: 'Test',
                email: 'short@e2e.com',
                password: '123',
            })

            expect(res.status).toBe(400)
        })

        it('should return 409 for duplicate email', async () => {
            const res = await request(app).post('/api/v1/auth/register').send({
                name: 'Admin',
                email: 'admin@e2e.com',
                password: 'password123',
            })

            expect(res.status).toBe(409)
        })
    })

    describe('POST /api/v1/auth/login', () => {
        it('should login and return token', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({ email: 'admin@e2e.com', password: 'password123' })

            expect(res.status).toBe(200)
            expect(res.body.data).toHaveProperty('token')
            expect(res.body.data).toHaveProperty('user')
            expect(res.body.data.user.email).toBe('admin@e2e.com')
            expect(res.body.data.user.role).toBe('ADMIN')
        })

        it('should return 401 for wrong password', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({ email: 'admin@e2e.com', password: 'wrongpassword' })

            expect(res.status).toBe(401)
        })

        it('should return 401 for non-existent email', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({ email: 'noone@e2e.com', password: 'password123' })

            expect(res.status).toBe(401)
        })
    })
})

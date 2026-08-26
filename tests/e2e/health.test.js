import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { setup } from '../helpers/e2e-setup.js'

let app
let seed

beforeAll(async () => {
    const result = await setup()
    app = result.app
    seed = result.seed
})

afterAll(async () => {
    const { getPool } = await import('../helpers/e2e-setup.js')
    const pool = getPool()
    if (pool) await pool.end()
})

describe('Health E2E', () => {
    it('GET /health - should return ok', async () => {
        const res = await request(app).get('/health')

        expect(res.status).toBe(200)
        expect(res.body.status).toBe('ok')
        expect(res.body.timestamp).toBeDefined()
    })
})

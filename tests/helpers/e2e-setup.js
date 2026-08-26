import pg from 'pg'
import { runMigrations, teardown } from './db.js'

let _app = null
let _pool = null
let _seed = null

export async function setup() {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-e2e'
    process.env.DATABASE_URL =
        process.env.DATABASE_URL ||
        'postgresql://postgres:postgres@localhost:5432/inventory_control_test'

    if (!_pool) {
        _pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
    }

    await teardown(_pool)
    await runMigrations(_pool)
    _seed = await seedDB(_pool)

    const { app } = await import('../../src/app.js')
    _app = app

    return { app: _app, pool: _pool, seed: _seed }
}

export function getApp() {
    if (!_app) throw new Error('Call setup() first')
    return _app
}

export function getPool() {
    return _pool
}

export function getSeed() {
    if (!_seed) throw new Error('Call setup() first')
    return _seed
}

async function seedDB(pool) {
    const argon2 = await import('argon2')
    const passwordHash = await argon2.hash('password123')

    const admin = await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ('Admin User', 'admin@e2e.com', $1, 'ADMIN')
         RETURNING id, name, email, role`,
        [passwordHash]
    )

    const operator = await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ('Operator User', 'operator@e2e.com', $1, 'OPERATOR')
         RETURNING id, name, email, role`,
        [passwordHash]
    )

    const warehouse1 = await pool.query(
        `INSERT INTO warehouses (code, name)
         VALUES ('WH-01', 'Main Warehouse')
         RETURNING id, code, name`
    )

    const warehouse2 = await pool.query(
        `INSERT INTO warehouses (code, name)
         VALUES ('WH-02', 'Secondary Warehouse')
         RETURNING id, code, name`
    )

    const product1 = await pool.query(
        `INSERT INTO products (sku, name, price, cost, minimum_stock, maximum_stock, category)
         VALUES ('SKU-001', 'Keyboard', 299.90, 150.00, 10, 100, 'electronics')
         RETURNING id, sku, name`
    )

    const product2 = await pool.query(
        `INSERT INTO products (sku, name, price, cost, minimum_stock, maximum_stock, category)
         VALUES ('SKU-002', 'Mouse', 99.90, 45.00, 20, 200, 'electronics')
         RETURNING id, sku, name`
    )

    const supplier = await pool.query(
        `INSERT INTO suppliers (name, email, phone)
         VALUES ('Tech Supplies', 'contact@tech.com', '+551199999')
         RETURNING id, name`
    )

    return {
        admin: admin.rows[0],
        operator: operator.rows[0],
        warehouse1: warehouse1.rows[0],
        warehouse2: warehouse2.rows[0],
        product1: product1.rows[0],
        product2: product2.rows[0],
        supplier: supplier.rows[0],
    }
}

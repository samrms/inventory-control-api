import pg from 'pg'
import argon2 from 'argon2'

export function createTestPool() {
    return new pg.Pool({
        connectionString:
            process.env.DATABASE_URL ||
            'postgresql://postgres:postgres@localhost:5432/inventory_control_test',
    })
}

export async function runMigrations(pool) {
    const migrations = [
        `CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(150) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'OPERATOR',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            deleted_at TIMESTAMPTZ
        )`,
        `DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check') THEN
                ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('ADMIN', 'MANAGER', 'OPERATOR'));
            END IF;
        END $$`,
        `CREATE TABLE IF NOT EXISTS products (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            sku VARCHAR(50) NOT NULL UNIQUE,
            name VARCHAR(150) NOT NULL,
            description TEXT,
            category VARCHAR(100),
            unit VARCHAR(30) DEFAULT 'unit',
            price NUMERIC(10,2) NOT NULL DEFAULT 0,
            cost NUMERIC(10,2) NOT NULL DEFAULT 0,
            minimum_stock INTEGER NOT NULL DEFAULT 0,
            maximum_stock INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            deleted_at TIMESTAMPTZ
        )`,
        `DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_price_check') THEN
                ALTER TABLE products ADD CONSTRAINT products_price_check CHECK (price >= 0);
            END IF;
        END $$`,
        `DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_cost_check') THEN
                ALTER TABLE products ADD CONSTRAINT products_cost_check CHECK (cost >= 0);
            END IF;
        END $$`,
        `DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_minimum_stock_check') THEN
                ALTER TABLE products ADD CONSTRAINT products_minimum_stock_check CHECK (minimum_stock >= 0);
            END IF;
        END $$`,
        `DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_maximum_stock_check') THEN
                ALTER TABLE products ADD CONSTRAINT products_maximum_stock_check CHECK (maximum_stock >= 0);
            END IF;
        END $$`,
        `CREATE TABLE IF NOT EXISTS warehouses (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            code VARCHAR(20) NOT NULL UNIQUE,
            name VARCHAR(150) NOT NULL,
            description TEXT,
            address TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            deleted_at TIMESTAMPTZ
        )`,
        `CREATE TABLE IF NOT EXISTS inventory (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
            product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            quantity INTEGER NOT NULL DEFAULT 0,
            reserved_quantity INTEGER NOT NULL DEFAULT 0,
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(warehouse_id, product_id)
        )`,
        `DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_quantity_check') THEN
                ALTER TABLE inventory ADD CONSTRAINT inventory_quantity_check CHECK (quantity >= 0);
            END IF;
        END $$`,
        `DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_reserved_quantity_check') THEN
                ALTER TABLE inventory ADD CONSTRAINT inventory_reserved_quantity_check CHECK (reserved_quantity >= 0);
            END IF;
        END $$`,
        `CREATE TABLE IF NOT EXISTS stock_movements (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
            product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            type VARCHAR(20) NOT NULL,
            quantity INTEGER NOT NULL,
            reference_type VARCHAR(50),
            reference_id UUID,
            reason TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )`,
        `DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stock_movements_type_check') THEN
                ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_type_check
                CHECK (type IN ('RECEIPT', 'ISSUE', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'TRANSFER_IN', 'TRANSFER_OUT'));
            END IF;
        END $$`,
        `DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stock_movements_quantity_check') THEN
                ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_quantity_check CHECK (quantity > 0);
            END IF;
        END $$`,
        `CREATE TABLE IF NOT EXISTS transfers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            source_warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
            destination_warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
            status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
            created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            completed_at TIMESTAMPTZ
        )`,
        `DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transfers_status_check') THEN
                ALTER TABLE transfers ADD CONSTRAINT transfers_status_check
                CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED'));
            END IF;
        END $$`,
        `DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transfers_warehouses_check') THEN
                ALTER TABLE transfers ADD CONSTRAINT transfers_warehouses_check
                CHECK (source_warehouse_id <> destination_warehouse_id);
            END IF;
        END $$`,
        `CREATE TABLE IF NOT EXISTS transfer_items (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            transfer_id UUID NOT NULL REFERENCES transfers(id) ON DELETE CASCADE,
            product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            quantity INTEGER NOT NULL
        )`,
        `DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transfer_items_quantity_check') THEN
                ALTER TABLE transfer_items ADD CONSTRAINT transfer_items_quantity_check CHECK (quantity > 0);
            END IF;
        END $$`,
        `CREATE TABLE IF NOT EXISTS reservations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
            product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            quantity INTEGER NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
            reference TEXT,
            expires_at TIMESTAMPTZ,
            created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )`,
        `DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reservations_status_check') THEN
                ALTER TABLE reservations ADD CONSTRAINT reservations_status_check
                CHECK (status IN ('ACTIVE', 'RELEASED', 'FULFILLED', 'EXPIRED'));
            END IF;
        END $$`,
        `DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reservations_quantity_check') THEN
                ALTER TABLE reservations ADD CONSTRAINT reservations_quantity_check CHECK (quantity > 0);
            END IF;
        END $$`,
        `CREATE TABLE IF NOT EXISTS suppliers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(200) NOT NULL,
            document VARCHAR(30),
            email VARCHAR(255),
            phone VARCHAR(30),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            deleted_at TIMESTAMPTZ
        )`,
        `CREATE TABLE IF NOT EXISTS purchase_orders (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
            warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
            status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
            created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )`,
        `DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'purchase_orders_status_check') THEN
                ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_status_check
                CHECK (status IN ('DRAFT', 'ORDERED', 'RECEIVED', 'CANCELLED'));
            END IF;
        END $$`,
        `CREATE TABLE IF NOT EXISTS purchase_order_items (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
            product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            quantity INTEGER NOT NULL,
            unit_cost NUMERIC(10,2) NOT NULL
        )`,
        `DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'poi_quantity_check') THEN
                ALTER TABLE purchase_order_items ADD CONSTRAINT poi_quantity_check CHECK (quantity > 0);
            END IF;
        END $$`,
        `DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'poi_unit_cost_check') THEN
                ALTER TABLE purchase_order_items ADD CONSTRAINT poi_unit_cost_check CHECK (unit_cost >= 0);
            END IF;
        END $$`,
        `CREATE TABLE IF NOT EXISTS audit_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE SET NULL,
            action VARCHAR(100) NOT NULL,
            entity_type VARCHAR(50) NOT NULL,
            entity_id UUID,
            metadata JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )`,
    ]

    for (const sql of migrations) {
        await pool.query(sql)
    }

    const indexes = [
        `CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON inventory(warehouse_id)`,
        `CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id)`,
        `CREATE INDEX IF NOT EXISTS idx_movements_warehouse ON stock_movements(warehouse_id)`,
        `CREATE INDEX IF NOT EXISTS idx_movements_product ON stock_movements(product_id)`,
        `CREATE INDEX IF NOT EXISTS idx_movements_user ON stock_movements(user_id)`,
        `CREATE INDEX IF NOT EXISTS idx_movements_type ON stock_movements(type)`,
        `CREATE INDEX IF NOT EXISTS idx_movements_created ON stock_movements(created_at)`,
        `CREATE INDEX IF NOT EXISTS idx_transfers_source ON transfers(source_warehouse_id)`,
        `CREATE INDEX IF NOT EXISTS idx_transfers_dest ON transfers(destination_warehouse_id)`,
        `CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfers(status)`,
        `CREATE INDEX IF NOT EXISTS idx_transfer_items_transfer ON transfer_items(transfer_id)`,
        `CREATE INDEX IF NOT EXISTS idx_reservations_warehouse ON reservations(warehouse_id)`,
        `CREATE INDEX IF NOT EXISTS idx_reservations_product ON reservations(product_id)`,
        `CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status)`,
        `CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id)`,
        `CREATE INDEX IF NOT EXISTS idx_purchase_orders_warehouse ON purchase_orders(warehouse_id)`,
        `CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status)`,
        `CREATE INDEX IF NOT EXISTS idx_po_items_po ON purchase_order_items(purchase_order_id)`,
        `CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id)`,
        `CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id)`,
        `CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at)`,
        `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`,
        `CREATE INDEX IF NOT EXISTS idx_products_deleted ON products(deleted_at)`,
    ]

    for (const sql of indexes) {
        await pool.query(sql)
    }
}

export async function teardown(pool) {
    const tables = [
        'audit_logs',
        'purchase_order_items',
        'purchase_orders',
        'suppliers',
        'reservations',
        'transfer_items',
        'transfers',
        'stock_movements',
        'inventory',
        'warehouses',
        'products',
        'users',
    ]

    for (const table of tables) {
        await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`)
    }
    await pool.query('DROP TABLE IF EXISTS pgmigrations CASCADE')
}

export async function seedTestData(pool) {
    const passwordHash = await argon2.hash('password123')

    const user = await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ('Test Admin', 'admin@test.com', $1, 'ADMIN')
         RETURNING id`,
        [passwordHash]
    )

    const warehouse = await pool.query(
        `INSERT INTO warehouses (code, name)
         VALUES ('WH-01', 'Test Warehouse')
         RETURNING id`
    )

    const product = await pool.query(
        `INSERT INTO products (sku, name, price, cost, minimum_stock, maximum_stock)
         VALUES ('SKU-001', 'Test Product', 100.00, 50.00, 10, 100)
         RETURNING id`
    )

    const supplier = await pool.query(
        `INSERT INTO suppliers (name, email)
         VALUES ('Test Supplier', 'supplier@test.com')
         RETURNING id`
    )

    return {
        user: user.rows[0],
        warehouse: warehouse.rows[0],
        product: product.rows[0],
        supplier: supplier.rows[0],
    }
}

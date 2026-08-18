CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id),
    type_mov VARCHAR(20) NOT NULL DEFAULT 'ADJUSTMENT' CHECK (type_mov IN ('IN', 'OUT', 'ADJUSTMENT')),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reason VARCHAR(100) CHECK (reason IN ( 'PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'LOSS')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

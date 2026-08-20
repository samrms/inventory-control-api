CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id),
    type_mov VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    reason VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

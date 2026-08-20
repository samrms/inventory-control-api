CREATE TABLE IF NOT EXISTS inventories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    minimum_quantity INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NULL
);

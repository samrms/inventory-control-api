exports.up = (pgm) => {
    pgm.createTable('products', {
        id: {
            type: 'UUID',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        sku: { type: 'VARCHAR(50)', notNull: true, unique: true },
        name: { type: 'VARCHAR(150)', notNull: true },
        description: { type: 'TEXT' },
        category: { type: 'VARCHAR(100)' },
        unit: { type: 'VARCHAR(30)', default: 'unit' },
        price: { type: 'NUMERIC(10,2)', notNull: true, default: 0 },
        cost: { type: 'NUMERIC(10,2)', notNull: true, default: 0 },
        minimum_stock: { type: 'INTEGER', notNull: true, default: 0 },
        maximum_stock: { type: 'INTEGER', notNull: true, default: 0 },
        created_at: { type: 'TIMESTAMPTZ', default: pgm.func('NOW()') },
        updated_at: { type: 'TIMESTAMPTZ', default: pgm.func('NOW()') },
        deleted_at: { type: 'TIMESTAMPTZ', default: null },
    })

    pgm.addConstraint('products', 'products_price_check', {
        check: 'price >= 0',
    })
    pgm.addConstraint('products', 'products_cost_check', {
        check: 'cost >= 0',
    })
    pgm.addConstraint('products', 'products_minimum_stock_check', {
        check: 'minimum_stock >= 0',
    })
    pgm.addConstraint('products', 'products_maximum_stock_check', {
        check: 'maximum_stock >= 0',
    })
}

exports.down = (pgm) => {
    pgm.dropTable('products')
}

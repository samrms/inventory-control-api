exports.up = (pgm) => {
    pgm.createTable('stock_movements', {
        id: {
            type: 'UUID',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        warehouse_id: {
            type: 'UUID',
            notNull: true,
            references: 'warehouses(id)',
        },
        product_id: {
            type: 'UUID',
            notNull: true,
            references: 'products(id)',
        },
        user_id: {
            type: 'UUID',
            notNull: true,
            references: 'users(id)',
        },
        type: { type: 'VARCHAR(20)', notNull: true },
        quantity: { type: 'INTEGER', notNull: true },
        reference_type: { type: 'VARCHAR(50)' },
        reference_id: { type: 'UUID' },
        reason: { type: 'TEXT' },
        created_at: { type: 'TIMESTAMPTZ', default: pgm.func('NOW()') },
    })

    pgm.addConstraint('stock_movements', 'stock_movements_type_check', {
        check: `type IN ('RECEIPT', 'ISSUE', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'TRANSFER_IN', 'TRANSFER_OUT')`,
    })
    pgm.addConstraint('stock_movements', 'stock_movements_quantity_check', {
        check: 'quantity > 0',
    })
}

exports.down = (pgm) => {
    pgm.dropTable('stock_movements')
}

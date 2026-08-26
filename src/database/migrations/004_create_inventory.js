exports.up = (pgm) => {
    pgm.createTable('inventory', {
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
        quantity: { type: 'INTEGER', notNull: true, default: 0 },
        reserved_quantity: { type: 'INTEGER', notNull: true, default: 0 },
        updated_at: { type: 'TIMESTAMPTZ', default: pgm.func('NOW()') },
    })

    pgm.addConstraint('inventory', 'inventory_warehouse_product_unique', {
        unique: ['warehouse_id', 'product_id'],
    })
    pgm.addConstraint('inventory', 'inventory_quantity_check', {
        check: 'quantity >= 0',
    })
    pgm.addConstraint('inventory', 'inventory_reserved_quantity_check', {
        check: 'reserved_quantity >= 0',
    })
}

exports.down = (pgm) => {
    pgm.dropTable('inventory')
}

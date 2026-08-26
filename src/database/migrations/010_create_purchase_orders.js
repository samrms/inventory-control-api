exports.up = (pgm) => {
    pgm.createTable('purchase_orders', {
        id: {
            type: 'UUID',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        supplier_id: {
            type: 'UUID',
            notNull: true,
            references: 'suppliers(id)',
        },
        warehouse_id: {
            type: 'UUID',
            notNull: true,
            references: 'warehouses(id)',
        },
        status: {
            type: 'VARCHAR(20)',
            notNull: true,
            default: 'DRAFT',
        },
        created_by: {
            type: 'UUID',
            notNull: true,
            references: 'users(id)',
        },
        created_at: { type: 'TIMESTAMPTZ', default: pgm.func('NOW()') },
        updated_at: { type: 'TIMESTAMPTZ', default: pgm.func('NOW()') },
    })

    pgm.addConstraint('purchase_orders', 'purchase_orders_status_check', {
        check: "status IN ('DRAFT', 'ORDERED', 'RECEIVED', 'CANCELLED')",
    })
}

exports.down = (pgm) => {
    pgm.dropTable('purchase_orders')
}

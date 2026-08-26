exports.up = (pgm) => {
    pgm.createTable('reservations', {
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
        quantity: { type: 'INTEGER', notNull: true },
        status: {
            type: 'VARCHAR(20)',
            notNull: true,
            default: 'ACTIVE',
        },
        reference: { type: 'TEXT' },
        expires_at: { type: 'TIMESTAMPTZ', default: null },
        created_by: {
            type: 'UUID',
            notNull: true,
            references: 'users(id)',
        },
        created_at: { type: 'TIMESTAMPTZ', default: pgm.func('NOW()') },
    })

    pgm.addConstraint('reservations', 'reservations_status_check', {
        check: "status IN ('ACTIVE', 'RELEASED', 'FULFILLED', 'EXPIRED')",
    })
    pgm.addConstraint('reservations', 'reservations_quantity_check', {
        check: 'quantity > 0',
    })
}

exports.down = (pgm) => {
    pgm.dropTable('reservations')
}

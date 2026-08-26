exports.up = (pgm) => {
    pgm.createTable('transfers', {
        id: {
            type: 'UUID',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        source_warehouse_id: {
            type: 'UUID',
            notNull: true,
            references: 'warehouses(id)',
        },
        destination_warehouse_id: {
            type: 'UUID',
            notNull: true,
            references: 'warehouses(id)',
        },
        status: {
            type: 'VARCHAR(20)',
            notNull: true,
            default: 'PENDING',
        },
        created_by: {
            type: 'UUID',
            notNull: true,
            references: 'users(id)',
        },
        notes: { type: 'TEXT' },
        created_at: { type: 'TIMESTAMPTZ', default: pgm.func('NOW()') },
        completed_at: { type: 'TIMESTAMPTZ', default: null },
    })

    pgm.addConstraint('transfers', 'transfers_status_check', {
        check: "status IN ('PENDING', 'COMPLETED', 'CANCELLED')",
    })
    pgm.addConstraint('transfers', 'transfers_warehouses_check', {
        check: 'source_warehouse_id <> destination_warehouse_id',
    })
}

exports.down = (pgm) => {
    pgm.dropTable('transfers')
}

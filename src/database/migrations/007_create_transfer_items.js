exports.up = (pgm) => {
    pgm.createTable('transfer_items', {
        id: {
            type: 'UUID',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        transfer_id: {
            type: 'UUID',
            notNull: true,
            references: 'transfers(id)',
            onDelete: 'CASCADE',
        },
        product_id: {
            type: 'UUID',
            notNull: true,
            references: 'products(id)',
        },
        quantity: { type: 'INTEGER', notNull: true },
    })

    pgm.addConstraint('transfer_items', 'transfer_items_quantity_check', {
        check: 'quantity > 0',
    })
}

exports.down = (pgm) => {
    pgm.dropTable('transfer_items')
}

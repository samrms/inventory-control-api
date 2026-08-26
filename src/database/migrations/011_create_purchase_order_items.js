exports.up = (pgm) => {
    pgm.createTable('purchase_order_items', {
        id: {
            type: 'UUID',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        purchase_order_id: {
            type: 'UUID',
            notNull: true,
            references: 'purchase_orders(id)',
            onDelete: 'CASCADE',
        },
        product_id: {
            type: 'UUID',
            notNull: true,
            references: 'products(id)',
        },
        quantity: { type: 'INTEGER', notNull: true },
        unit_cost: { type: 'NUMERIC(10,2)', notNull: true },
    })

    pgm.addConstraint('purchase_order_items', 'poi_quantity_check', {
        check: 'quantity > 0',
    })
    pgm.addConstraint('purchase_order_items', 'poi_unit_cost_check', {
        check: 'unit_cost >= 0',
    })
}

exports.down = (pgm) => {
    pgm.dropTable('purchase_order_items')
}

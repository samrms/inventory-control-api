exports.up = (pgm) => {
    pgm.createIndex('inventory', 'warehouse_id', {
        name: 'idx_inventory_warehouse',
    })
    pgm.createIndex('inventory', 'product_id', {
        name: 'idx_inventory_product',
    })
    pgm.createIndex('stock_movements', 'warehouse_id', {
        name: 'idx_movements_warehouse',
    })
    pgm.createIndex('stock_movements', 'product_id', {
        name: 'idx_movements_product',
    })
    pgm.createIndex('stock_movements', 'user_id', {
        name: 'idx_movements_user',
    })
    pgm.createIndex('stock_movements', 'type', { name: 'idx_movements_type' })
    pgm.createIndex('stock_movements', 'created_at', {
        name: 'idx_movements_created',
    })
    pgm.createIndex('transfers', 'source_warehouse_id', {
        name: 'idx_transfers_source',
    })
    pgm.createIndex('transfers', 'destination_warehouse_id', {
        name: 'idx_transfers_dest',
    })
    pgm.createIndex('transfers', 'status', { name: 'idx_transfers_status' })
    pgm.createIndex('transfer_items', 'transfer_id', {
        name: 'idx_transfer_items_transfer',
    })
    pgm.createIndex('reservations', 'warehouse_id', {
        name: 'idx_reservations_warehouse',
    })
    pgm.createIndex('reservations', 'product_id', {
        name: 'idx_reservations_product',
    })
    pgm.createIndex('reservations', 'status', {
        name: 'idx_reservations_status',
    })
    pgm.createIndex('purchase_orders', 'supplier_id', {
        name: 'idx_purchase_orders_supplier',
    })
    pgm.createIndex('purchase_orders', 'warehouse_id', {
        name: 'idx_purchase_orders_warehouse',
    })
    pgm.createIndex('purchase_orders', 'status', {
        name: 'idx_purchase_orders_status',
    })
    pgm.createIndex('purchase_order_items', 'purchase_order_id', {
        name: 'idx_po_items_po',
    })
    pgm.createIndex('audit_logs', 'user_id', { name: 'idx_audit_logs_user' })
    pgm.createIndex('audit_logs', ['entity_type', 'entity_id'], {
        name: 'idx_audit_logs_entity',
    })
    pgm.createIndex('audit_logs', 'created_at', {
        name: 'idx_audit_logs_created',
    })
    pgm.createIndex('products', 'category', { name: 'idx_products_category' })
    pgm.createIndex('products', 'deleted_at', { name: 'idx_products_deleted' })
}

exports.down = (pgm) => {
    pgm.dropIndex('inventory', 'idx_inventory_warehouse')
    pgm.dropIndex('inventory', 'idx_inventory_product')
    pgm.dropIndex('stock_movements', 'idx_movements_warehouse')
    pgm.dropIndex('stock_movements', 'idx_movements_product')
    pgm.dropIndex('stock_movements', 'idx_movements_user')
    pgm.dropIndex('stock_movements', 'idx_movements_type')
    pgm.dropIndex('stock_movements', 'idx_movements_created')
    pgm.dropIndex('transfers', 'idx_transfers_source')
    pgm.dropIndex('transfers', 'idx_transfers_dest')
    pgm.dropIndex('transfers', 'idx_transfers_status')
    pgm.dropIndex('transfer_items', 'idx_transfer_items_transfer')
    pgm.dropIndex('reservations', 'idx_reservations_warehouse')
    pgm.dropIndex('reservations', 'idx_reservations_product')
    pgm.dropIndex('reservations', 'idx_reservations_status')
    pgm.dropIndex('purchase_orders', 'idx_purchase_orders_supplier')
    pgm.dropIndex('purchase_orders', 'idx_purchase_orders_warehouse')
    pgm.dropIndex('purchase_orders', 'idx_purchase_orders_status')
    pgm.dropIndex('purchase_order_items', 'idx_po_items_po')
    pgm.dropIndex('audit_logs', 'idx_audit_logs_user')
    pgm.dropIndex('audit_logs', 'idx_audit_logs_entity')
    pgm.dropIndex('audit_logs', 'idx_audit_logs_created')
    pgm.dropIndex('products', 'idx_products_category')
    pgm.dropIndex('products', 'idx_products_deleted')
}

exports.up = (pgm) => {
    pgm.createTable('warehouses', {
        id: {
            type: 'UUID',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        code: { type: 'VARCHAR(20)', notNull: true, unique: true },
        name: { type: 'VARCHAR(150)', notNull: true },
        description: { type: 'TEXT' },
        address: { type: 'TEXT' },
        created_at: { type: 'TIMESTAMPTZ', default: pgm.func('NOW()') },
        updated_at: { type: 'TIMESTAMPTZ', default: pgm.func('NOW()') },
        deleted_at: { type: 'TIMESTAMPTZ', default: null },
    })
}

exports.down = (pgm) => {
    pgm.dropTable('warehouses')
}

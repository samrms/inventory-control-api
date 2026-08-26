exports.up = (pgm) => {
    pgm.createTable('suppliers', {
        id: {
            type: 'UUID',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        name: { type: 'VARCHAR(200)', notNull: true },
        document: { type: 'VARCHAR(30)' },
        email: { type: 'VARCHAR(255)' },
        phone: { type: 'VARCHAR(30)' },
        created_at: { type: 'TIMESTAMPTZ', default: pgm.func('NOW()') },
        updated_at: { type: 'TIMESTAMPTZ', default: pgm.func('NOW()') },
        deleted_at: { type: 'TIMESTAMPTZ', default: null },
    })
}

exports.down = (pgm) => {
    pgm.dropTable('suppliers')
}

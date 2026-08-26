exports.up = (pgm) => {
    pgm.createTable('audit_logs', {
        id: {
            type: 'UUID',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        user_id: {
            type: 'UUID',
            references: 'users(id)',
        },
        action: { type: 'VARCHAR(100)', notNull: true },
        entity_type: { type: 'VARCHAR(50)', notNull: true },
        entity_id: { type: 'UUID' },
        metadata: { type: 'JSONB' },
        created_at: { type: 'TIMESTAMPTZ', default: pgm.func('NOW()') },
    })
}

exports.down = (pgm) => {
    pgm.dropTable('audit_logs')
}

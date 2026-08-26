exports.up = (pgm) => {
    pgm.createTable('revoked_tokens', {
        id: {
            type: 'UUID',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        token_hash: {
            type: 'VARCHAR(64)',
            notNull: true,
            unique: true,
        },
        user_id: {
            type: 'UUID',
            references: 'users(id)',
            onDelete: 'SET NULL',
        },
        expires_at: {
            type: 'TIMESTAMPTZ',
            notNull: true,
        },
        created_at: {
            type: 'TIMESTAMPTZ',
            default: pgm.func('NOW()'),
        },
    })

    pgm.createIndex('revoked_tokens', 'token_hash', {
        name: 'idx_revoked_tokens_hash',
    })
    pgm.createIndex('revoked_tokens', 'expires_at', {
        name: 'idx_revoked_tokens_expires',
    })
}

exports.down = (pgm) => {
    pgm.dropTable('revoked_tokens')
}

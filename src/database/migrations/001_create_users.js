exports.up = (pgm) => {
    pgm.createTable('users', {
        id: {
            type: 'UUID',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        name: { type: 'VARCHAR(150)', notNull: true },
        email: { type: 'VARCHAR(255)', notNull: true, unique: true },
        password_hash: { type: 'VARCHAR(255)', notNull: true },
        role: {
            type: 'VARCHAR(20)',
            notNull: true,
            default: 'OPERATOR',
        },
        created_at: { type: 'TIMESTAMPTZ', default: pgm.func('NOW()') },
        updated_at: { type: 'TIMESTAMPTZ', default: pgm.func('NOW()') },
        deleted_at: { type: 'TIMESTAMPTZ', default: null },
    })

    pgm.addConstraint('users', 'users_role_check', {
        check: "role IN ('ADMIN', 'MANAGER', 'OPERATOR')",
    })
}

exports.down = (pgm) => {
    pgm.dropTable('users')
}

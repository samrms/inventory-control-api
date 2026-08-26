import argon2 from 'argon2'

const ADMIN_PASSWORD = 'admin123'
const MANAGER_PASSWORD = 'manager123'
const OPERATOR_PASSWORD = 'operator123'

export async function seed(client) {
    const adminHash = await argon2.hash(ADMIN_PASSWORD)
    const managerHash = await argon2.hash(MANAGER_PASSWORD)
    const operatorHash = await argon2.hash(OPERATOR_PASSWORD)

    const admin = await client.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'ADMIN')
         ON CONFLICT (email) DO NOTHING
         RETURNING id, name, email, role`,
        ['Admin', 'admin@example.com', adminHash]
    )

    const manager = await client.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'MANAGER')
         ON CONFLICT (email) DO NOTHING
         RETURNING id, name, email, role`,
        ['Manager', 'manager@example.com', managerHash]
    )

    const operator = await client.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'OPERATOR')
         ON CONFLICT (email) DO NOTHING
         RETURNING id, name, email, role`,
        ['Operator', 'operator@example.com', operatorHash]
    )

    console.log('Users:')
    if (admin.rows[0])
        console.log(`  Admin     - ${admin.rows[0].email} / ${ADMIN_PASSWORD}`)
    if (manager.rows[0])
        console.log(
            `  Manager   - ${manager.rows[0].email} / ${MANAGER_PASSWORD}`
        )
    if (operator.rows[0])
        console.log(
            `  Operator  - ${operator.rows[0].email} / ${OPERATOR_PASSWORD}`
        )
}

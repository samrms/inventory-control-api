const suppliers = [
    {
        name: 'Tech Supplies Ltda',
        document: '12.345.678/0001-90',
        email: 'sales@techsupplies.com',
        phone: '+5511988887777',
    },
    {
        name: 'Distribuidora Digital',
        document: '98.765.432/0001-10',
        email: 'vendas@distdigital.com',
        phone: '+5521999998888',
    },
]

export async function seed(client) {
    const created = []

    for (const s of suppliers) {
        const result = await client.query(
            `INSERT INTO suppliers (name, document, email, phone)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT DO NOTHING
             RETURNING id, name`,
            [s.name, s.document, s.email, s.phone]
        )
        if (result.rows[0]) created.push(result.rows[0])
    }

    console.log(`\nSuppliers:  ${created.length} created`)
}

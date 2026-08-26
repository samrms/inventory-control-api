export async function seed(client) {
    const wh1 = await client.query(
        `INSERT INTO warehouses (code, name, description, address)
         VALUES ('WH-01', 'Central Warehouse', 'Main distribution center', '123 Main St, São Paulo - SP')
         ON CONFLICT (code) DO NOTHING
         RETURNING id, code, name`
    )

    const wh2 = await client.query(
        `INSERT INTO warehouses (code, name, description, address)
         VALUES ('WH-02', 'Branch Warehouse', 'Secondary branch', '456 Oak Ave, Rio de Janeiro - RJ')
         ON CONFLICT (code) DO NOTHING
         RETURNING id, code, name`
    )

    console.log(
        `\nWarehouses: ${wh1.rows[0] ? 'WH-01' : 'exists'} | ${wh2.rows[0] ? 'WH-02' : 'exists'}`
    )
}

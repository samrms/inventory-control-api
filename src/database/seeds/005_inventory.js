export async function seed(client) {
    const whResult = await client.query(
        `SELECT id, code FROM warehouses WHERE deleted_at IS NULL`
    )
    const warehouses = whResult.rows

    const prodResult = await client.query(
        `SELECT id FROM products WHERE deleted_at IS NULL`
    )
    const products = prodResult.rows

    if (warehouses.length === 0 || products.length === 0) {
        console.log('\nInventory:  skipped (no warehouses or products)')
        return
    }

    const wh1 = warehouses.find((w) => w.code === 'WH-01') || warehouses[0]
    const wh2 = warehouses.find((w) => w.code === 'WH-02') || warehouses[1]

    for (const p of products.slice(0, 5)) {
        await client.query(
            `INSERT INTO inventory (warehouse_id, product_id, quantity, reserved_quantity)
             VALUES ($1, $2, $3, 0)
             ON CONFLICT (warehouse_id, product_id)
             DO UPDATE SET quantity = $3, updated_at = NOW()`,
            [wh1.id, p.id, Math.floor(Math.random() * 50) + 20]
        )
    }

    if (wh2) {
        for (const p of products.slice(0, 3)) {
            await client.query(
                `INSERT INTO inventory (warehouse_id, product_id, quantity, reserved_quantity)
                 VALUES ($1, $2, $3, 0)
                 ON CONFLICT (warehouse_id, product_id)
                 DO UPDATE SET quantity = $3, updated_at = NOW()`,
                [wh2.id, p.id, Math.floor(Math.random() * 30) + 10]
            )
        }
    }

    console.log('\nInventory:  seeded')
}

const products = [
    {
        sku: 'KB-001',
        name: 'Mechanical Keyboard',
        description: 'Cherry MX Blue switches, full size',
        category: 'electronics',
        unit: 'unit',
        price: 349.9,
        cost: 180.0,
        minimumStock: 10,
        maximumStock: 100,
    },
    {
        sku: 'MS-001',
        name: 'Wireless Mouse',
        description: 'Ergonomic, 16000 DPI',
        category: 'electronics',
        unit: 'unit',
        price: 129.9,
        cost: 55.0,
        minimumStock: 20,
        maximumStock: 200,
    },
    {
        sku: 'MN-001',
        name: '27" Monitor',
        description: '4K IPS, 144Hz',
        category: 'electronics',
        unit: 'unit',
        price: 1899.9,
        cost: 950.0,
        minimumStock: 5,
        maximumStock: 30,
    },
    {
        sku: 'CB-001',
        name: 'USB-C Cable',
        description: '2m, braided, 100W PD',
        category: 'accessories',
        unit: 'unit',
        price: 39.9,
        cost: 12.0,
        minimumStock: 50,
        maximumStock: 500,
    },
    {
        sku: 'HD-001',
        name: '2TB External HDD',
        description: 'USB 3.2, portable',
        category: 'storage',
        unit: 'unit',
        price: 299.9,
        cost: 140.0,
        minimumStock: 10,
        maximumStock: 80,
    },
    {
        sku: 'WK-001',
        name: 'Wrist Rest',
        description: 'Memory foam, ergonomic',
        category: 'accessories',
        unit: 'unit',
        price: 59.9,
        cost: 18.0,
        minimumStock: 15,
        maximumStock: 150,
    },
    {
        sku: 'HS-001',
        name: 'USB Headset',
        description: 'Stereo, noise-cancelling mic',
        category: 'electronics',
        unit: 'unit',
        price: 199.9,
        cost: 85.0,
        minimumStock: 10,
        maximumStock: 60,
    },
    {
        sku: 'WC-001',
        name: 'HD Webcam',
        description: '1080p, auto-focus',
        category: 'electronics',
        unit: 'unit',
        price: 149.9,
        cost: 60.0,
        minimumStock: 10,
        maximumStock: 70,
    },
]

export async function seed(client) {
    const created = []

    for (const p of products) {
        const result = await client.query(
            `INSERT INTO products (sku, name, description, category, unit, price, cost, minimum_stock, maximum_stock)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (sku) DO NOTHING
             RETURNING id, sku, name`,
            [
                p.sku,
                p.name,
                p.description,
                p.category,
                p.unit,
                p.price,
                p.cost,
                p.minimumStock,
                p.maximumStock,
            ]
        )
        if (result.rows[0]) created.push(result.rows[0])
    }

    console.log(`\nProducts:   ${created.length} created`)
}

class ProductRepository {
    constructor(pool) {
        this.pool = pool
    }
    async countAll() {
        const sql = `SELECT COUNT(*) FROM products;`

        const {
            rows: [{ count }],
        } = await this.pool.query(sql)

        return { count }
    }
    async findAll({ limit, offset }) {
        const sql = `
            SELECT * FROM products
            ORDER BY sku
            LIMIT $1 OFFSET $2;
          `

        const { rows: data } = await this.pool.query(sql, [limit, offset])

        return { data }
    }

    async findById({ id }) {
        const sql = `SELECT * FROM products WHERE id = $1;`
        const { rows: data } = await this.pool.query(sql, [id])
        return { data }
    }
    async findBySku({ sku }) {
        const sql = `SELECT * FROM products WHERE sku = $1;`
        const { rows: data } = await this.pool.query(sql, [sku])
        return { data }
    }
    async create({ input }) {
        const { sku, name, description, price } = input
        const sql = `
          INSERT INTO products (sku, name, description, price)
          VALUES ($1, $2, $3, $4)
          RETURNING *;
      `
        const { rows: data } = await this.pool.query(sql, [
            sku,
            name,
            description,
            price,
        ])
        return { data }
    }
    async update({ id, body }) {
        const { name, description, price } = body
        const sql = `
        UPDATE products
        SET name = $1,
            description = $2,
            price = $3,
            updated_at = NOW()
        WHERE id = $4;
      `
        await this.pool.query(sql, [name, description, parseFloat(price), id])
    }
    async delete({ id }) {
        const sql = `
          UPDATE products
          SET deleted_at = NOW()
          WHERE id = $1;
        `
        await this.pool.query(sql, [id])
    }
}

export { ProductRepository }

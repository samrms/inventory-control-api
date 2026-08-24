class ProductRepository {
    constructor(pool) {
        this.pool = pool
    }

    async buildSql({ params }) {
        const filters = []
        const pagination = []
        const minPrice = {}
        const values = []
        let count = 1

        for (let param in params) {
            for (let key in params[param]) {
                if (params[param][key] || params[param][key] == 0) {
                    if (key == 'search') {
                        filters.push(`name ILIKE '%' || $${count} || '%'`)
                    }
                    if (key == 'minPrice') {
                        minPrice['exists'] = true
                        minPrice['pointer'] = count
                    }
                    if (key == 'maxPrice' && minPrice) {
                        filters.push(
                            `price BETWEEN $${minPrice['pointer']} AND $${count}`
                        )
                    }
                    if (key == 'limit') {
                        pagination.push(`LIMIT $${count}`)
                    }
                    if (key == 'offset') {
                        pagination.push(`OFFSET $${count}`)
                    }
                    values.push(params[param][key])
                    count++
                }
            }
        }
        return { filters, pagination, values }
    }
    async countAll({ filter }) {
        console.log(filter)
        const { filters, values } = await this.buildSql({ params: { filter } })

        const sql = `
          SELECT COUNT(*)
          FROM products
          WHERE ${filters ? `${filters.join(' AND ')} AND` : ''} deleted_at IS NULL;
        `
        console.log(sql, values)
        const {
            rows: [{ count }],
        } = await this.pool.query(sql, values)
        return { count }
    }
    async findAll({ params }) {
        const { filters, pagination, values } = await this.buildSql({ params })

        const sql = `
          SELECT
          *
          FROM products
          WHERE ${filters ? `${filters.join(' AND ')} AND ` : ''} deleted_at IS NULL
          ORDER BY sku
          ${pagination.join(' ')};
        `
        const { rows: data } = await this.pool.query(sql, values)
        console.log(sql)
        console.log(values)

        return { data }
    }
    async findById({ id }) {
        const sql = `SELECT * FROM products WHERE id = $1 AND deleted_at IS NULL;`
        const { rows: data } = await this.pool.query(sql, [id])
        return { data }
    }
    async findBySku({ sku }) {
        const sql = `SELECT * FROM products WHERE sku = $1 AND deleted_at IS NULL;`
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

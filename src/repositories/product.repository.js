class ProductRepository {
    constructor(pool) {
        this.pool = pool
    }
    async findAll() {
        const sql = `SELECT * FROM products ORDER BY sku`
        const { rows } = await this.pool.query(sql)

        return { rows }
    }

    async findById({ id }) {
        const sql = `SELECT * FROM products WHERE id = $1;`
        const { rows } = await this.pool.query(sql, [id])
        return { rows }
    }
    async findBySku({ sku }) {
        const sql = `SELECT * FROM products WHERE sku = $1;`
        const { rows } = await this.pool.query(sql, [sku])
        return { rows }
    }
    async create({ data }) {}
    async update({ id, data }) {}
    async delete({ id }) {}
}

export { ProductRepository }

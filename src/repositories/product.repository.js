class ProductRepository {
    constructor(pool) {
        this.pool = pool
    }
    async findAll({ limit, offset }) {
        const sqlPagination = `
            SELECT * FROM products
            ORDER BY sku
            LIMIT $1 OFFSET $2;
          `

        const sqlTotalCount = `
          SELECT COUNT(*) FROM products
        `
        const [
            { rows: resultPagination },
            {
                rows: [resultCount],
            },
        ] = await Promise.all([
            this.pool.query(
                `
              SELECT *
              FROM products
              ORDER BY created_at DESC
              LIMIT $1 OFFSET $2
            `,
                [limit, offset]
            ),

            this.pool.query(`
              SELECT COUNT(*)
              FROM products
            `),
        ])
        return { resultPagination, resultCount }
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

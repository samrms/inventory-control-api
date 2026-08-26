export class ProductsRepository {
    constructor(pool, parsePagination, paginateResponse) {
        this.pool = pool
        this.parsePagination = parsePagination
        this.paginateResponse = paginateResponse
    }

    async findAll(query) {
        const { limit, offset, page } = this.parsePagination(query)
        const conditions = ['p.deleted_at IS NULL']
        const params = []
        let paramIndex = 1

        if (query.search) {
            conditions.push(
                `(p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`
            )
            params.push(`%${query.search}%`)
            paramIndex++
        }

        if (query.category) {
            conditions.push(`p.category = $${paramIndex++}`)
            params.push(query.category)
        }

        const where = `WHERE ${conditions.join(' AND ')}`

        const countResult = await this.pool.query(
            `SELECT COUNT(*) FROM products p ${where}`,
            params
        )

        const result = await this.pool.query(
            `SELECT p.*
             FROM products p
             ${where}
             ORDER BY p.created_at DESC
             LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
            [...params, limit, offset]
        )

        return this.paginateResponse(
            result.rows,
            parseInt(countResult.rows[0].count),
            page,
            limit
        )
    }

    async findById(id) {
        const result = await this.pool.query(
            'SELECT * FROM products WHERE id = $1 AND deleted_at IS NULL',
            [id]
        )
        return result.rows[0] || null
    }

    async findBySku(sku) {
        const result = await this.pool.query(
            'SELECT * FROM products WHERE sku = $1 AND deleted_at IS NULL',
            [sku]
        )
        return result.rows[0] || null
    }

    async create({
        sku,
        name,
        description,
        category,
        unit,
        price,
        cost,
        minimumStock,
        maximumStock,
    }) {
        const result = await this.pool.query(
            `INSERT INTO products (sku, name, description, category, unit, price, cost, minimum_stock, maximum_stock)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [
                sku,
                name,
                description || null,
                category || null,
                unit || 'unit',
                price || 0,
                cost || 0,
                minimumStock || 0,
                maximumStock || 0,
            ]
        )
        return result.rows[0]
    }

    async update(id, data) {
        const result = await this.pool.query(
            `UPDATE products
             SET name = COALESCE($1, name),
                 description = COALESCE($2, description),
                 category = COALESCE($3, category),
                 unit = COALESCE($4, unit),
                 price = COALESCE($5, price),
                 cost = COALESCE($6, cost),
                 minimum_stock = COALESCE($7, minimum_stock),
                 maximum_stock = COALESCE($8, maximum_stock),
                 updated_at = NOW()
             WHERE id = $9 AND deleted_at IS NULL
             RETURNING *`,
            [
                data.name,
                data.description,
                data.category,
                data.unit,
                data.price,
                data.cost,
                data.minimumStock,
                data.maximumStock,
                id,
            ]
        )
        return result.rows[0] || null
    }

    async delete(id) {
        const result = await this.pool.query(
            `UPDATE products SET deleted_at = NOW(), updated_at = NOW()
             WHERE id = $1 AND deleted_at IS NULL
             RETURNING *`,
            [id]
        )
        return result.rows[0] || null
    }
}

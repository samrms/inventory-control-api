import { pool } from '../database/pg-database.js'

class ProductModel {
  async findAll() {
    const result = await pool.query(
      `
      SELECT * FROM products WHERE deleted_at IS NULL
      `,
    )

    return result.rows
  }
  async create({ product }) {
    const { sku, name, description, price } = product

    const result = await pool.query(
      `
        INSERT INTO products (sku, name, description, price)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [sku, name, description, price],
    )

    return result.rows
  }
  async findById({ id }) {
    const result = await pool.query(
      `
      SELECT * FROM products
      WHERE id = $1 AND deleted_at IS NULL
      `,
      [id],
    )

    if (result.rows.length === 0) {
      return { message: 'This product does not exists' }
    }

    return result.rows
  }
  async update({ id, body }) {
    const { name, description = '', price } = body

    const result = await pool.query(
      `
        UPDATE products
        SET
          name = $1,
          price = $2,
          description = $3,
          updated_at = NOW()
        WHERE id = $4
        RETURNING *;
      `,
      [name, price, description, id],
    )

    return result.rows
  }
  async delete({ id }) {
    const result = await pool.query(
      `
      UPDATE products
      SET deleted_at = NOW()
      WHERE id = $1
        AND deleted_at IS NULL
      RETURNING *;
      `,
      [id],
    )
    return result.rows
  }
}

export default new ProductModel()

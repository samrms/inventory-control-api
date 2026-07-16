import { pool } from '../database/pg-database.js'

class MovementModel {
  async create({ body }) {
    const { product_id, type, quantity, reason } = body
    const result = await pool.query(
      `
          INSERT INTO stock_movements (product_id, type, quantity, reason)
          VALUES ($1, $2, $3, $4)
          RETURNING *;
          `,
      [product_id, type, quantity, reason],
    )
    return result.rows
  }

  async findAll() {
    const result = await pool.query(`
      SELECT * FROM stock_movements
      `)
    return result.rows
  }
}

export default new MovementModel()

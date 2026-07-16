import { pool } from '../database/pg-database.js'

class TrashModel {
  async trash(params) {
    const result = await pool.query(`
      SELECT *
      FROM products
      WHERE deleted_at IS NOT NULL;
    `)

    if (!!params) {
      const { id } = params
      return result.rows.filter((_) => id === _.id)
    }
    return result.rows
  }
  async restore({ id }) {
    const result = await pool.query(
      `
        UPDATE products
        SET deleted_at = null
        WHERE id = $1;
      `,
      [id],
    )
    return result.rows
  }
}

export default new TrashModel()

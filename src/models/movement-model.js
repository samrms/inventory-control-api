import { pool } from '../database/pg-database.js'

class MovementModel {
    async in({ body }) {
        const { product_id, quantity } = body

        const result = await pool.query(
            `
      INSERT INTO stock_movements (
          product_id,
          type_mov,
          quantity,
          reason
      )
      VALUES ($1, $2, ABS($3), $4)
      RETURNING *;
      `,
            [product_id, 'IN', quantity, 'PURCHASE']
        )
        await pool.query(
            `
      INSERT INTO stock (
          product_id,
          quantity
      )
      VALUES ($1, $2)
      ON CONFLICT (product_id)
      DO UPDATE
      SET quantity = stock.quantity + EXCLUDED.quantity;
      `,
            [product_id, quantity]
        )

        return result.rows
    }
    async out({ body }) {
        const { product_id, quantity, reason } = body

        const result = await pool.query(
            `
        INSERT INTO stock_movements (product_id, type_mov, quantity, reason)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `,
            [product_id, 'OUT', quantity, reason]
        )
        await pool.query(
            `
      INSERT INTO stock (product_id, quantity)
      VALUES ($1, $2)
      ON CONFLICT (product_id)
      DO UPDATE SET quantity = stock.quantity - EXCLUDED.quantity;
      `,
            [product_id, quantity]
        )

        return result.rows
    }
    async stock() {
        const result = await pool.query(
            `
        SELECT
          p.id,
          p.sku,
          p.name,
          quantity
        FROM stock
        INNER JOIN products p ON product_id = p.id
        WHERE p.deleted_at IS NULL
      `
        )
        return result.rows
    }

    async movement() {
        const result = await pool.query(
            `
        SELECT * FROM stock_movements
      `
        )

        return result.rows
    }
}

export default new MovementModel()

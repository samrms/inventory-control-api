import { Router } from 'express'
import { pool } from '../../database/connection.js'

export function healthRoutes() {
    const router = Router()

    router.get('/', async (req, res, next) => {
        try {
            await pool.query('SELECT 1')
            res.json({ status: 'ok', timestamp: new Date().toISOString() })
        } catch (err) {
            next(err)
        }
    })

    return router
}

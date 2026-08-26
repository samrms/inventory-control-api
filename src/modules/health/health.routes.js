import { Router } from 'express'
import { pool } from '../../database/connection.js'

const router = Router()

router.get('/', async (req, res, next) => {
    try {
        await pool.query('SELECT 1')
        res.json({ status: 'ok', timestamp: new Date().toISOString() })
    } catch (err) {
        next(err)
    }
})

export { router as healthRoutes }

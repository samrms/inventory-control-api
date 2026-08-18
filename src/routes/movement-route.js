import { Router } from 'express'
import movementController from '../controllers/movement-controller.js'

const router = Router()

router.get('/stock', movementController.stock)
router.get('/stock/movement', movementController.movement)

router.post('/stock-in', movementController.in)
router.post('/stock-out', movementController.out)

export { router as movementRoutes }

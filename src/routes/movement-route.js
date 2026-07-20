import { Router } from 'express'
import movementController from '../controllers/movement-controller.js'

const movement = Router()

movement.get('/stock', movementController.stock)
movement.get('/stock/movement', movementController.movement)

movement.post('/stock-in', movementController.in)
movement.post('/stock-out', movementController.out)

export { movement }

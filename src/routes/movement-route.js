import { Router } from 'express'

import movementController from '../controllers/movement-controller.js'
import { validateCreateMovement } from '../middleware/movement-validation.js'

const movement = Router()

movement.get('/', movementController.findAll)
movement.post('/', validateCreateMovement, movementController.create)

export { movement }

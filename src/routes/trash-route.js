import { Router } from 'express'
import trashController from '../controllers/trash-controller.js'

const trash = Router()

trash.get('/', trashController.trash)
trash.get('/:id', trashController.trashById)
trash.patch('/:id/restore', trashController.restore)

export { trash }

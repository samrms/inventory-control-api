import { Router } from 'express'
import trashController from '../controllers/trash-controller.js'

const router = Router()

router.get('/', trashController.trash)
router.get('/:id', trashController.trashById)
router.patch('/:id/restore', trashController.restore)

export { router as trashRoutes }

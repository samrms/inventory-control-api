import { Router } from 'express'
import { productController } from '../container/product.container.js'

const router = Router()

router.get('/', productController.getAllProducts)

export { router as productRoute }

import { Router } from 'express'
import { productController } from '../container/product.container.js'

const router = Router()

router.get('/', productController.getAllProducts)
router.post('/', productController.createProduct)
router.get('/:id', productController.getProductById)
router.put('/:id', productController.updateProduct)
router.delete('/:id', productController.deleteProduct)

export { router as productRoute }

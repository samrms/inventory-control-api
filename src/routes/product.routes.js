import { Router } from 'express'
import {
    productController,
    productValidationMiddleware,
} from '../container/product.container.js'

const router = Router()

router.get('/', productController.getAllProducts)
router.post('/', productValidationMiddleware, productController.createProduct)
router.get('/:id', productController.getProductById)
router.put('/:id', productController.updateProduct)
router.delete('/:id', productController.deleteProduct)

export { router as productRoute }

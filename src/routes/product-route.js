import { Router } from 'express'

import productController from '../controllers/product-controller.js'

import { validateCreateProduct } from '../middleware/product-validation.js'

const router = Router()
/**
 * @openapi
 * /products:
 *   get:
 *     summary: List all products
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: List of products
 */

router.get('/', productController.main)
router.post('/', validateCreateProduct, productController.create)
router.get('/:id', productController.byId)
router.put('/:id', validateCreateProduct, productController.uptdate)
router.delete('/:id', productController.delete)

export { router as productRoutes }

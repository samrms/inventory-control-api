import { Router } from 'express'

import productController from '../controllers/product-controller.js'

import { validateCreateProduct } from '../middleware/product-validation.js'

const product = Router()

product.get('/', productController.main)
product.post('/', validateCreateProduct, productController.create)
product.get('/:id', productController.byId)
product.put('/:id', validateCreateProduct, productController.uptdate)
product.delete('/:id', productController.delete)

export { product }

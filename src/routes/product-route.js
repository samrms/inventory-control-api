import { Router } from 'express'

import ProductController from '../controllers/product-controller.js'

import { validateCreateProduct } from '../middleware/product-validation.js'

const product = Router()

product.get('/', ProductController.main)
product.get('/:id', ProductController.byId)
product.post('/', validateCreateProduct, ProductController.create)
product.put('/:id', validateCreateProduct, ProductController.uptdate)
product.delete('/:id', ProductController.delete)

export { product }

import { pool } from '../database/connection.js'
import { ProductController } from '../controllers/product.controller.js'
import { ProductRepository } from '../repositories/product.repository.js'
import { ProductServices } from '../services/product.service.js'

const productRepository = new ProductRepository(pool)
const productService = new ProductServices(productRepository)
const productController = new ProductController(productService)

export { productController }

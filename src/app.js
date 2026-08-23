import express from 'express'
import { productRoute } from './routes/product.routes.js'
import { errorHandler } from './middleware/error.middleware.js'

const app = express()

app.use(express.json())

app.use('/api/v1/products', productRoute)

app.use(errorHandler)

export { app }

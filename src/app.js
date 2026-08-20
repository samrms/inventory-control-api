import express from 'express'
import { productRoute } from './routes/product.routes.js'

const app = express()

app.use(express.json())

app.use('/products', productRoute)

export { app }

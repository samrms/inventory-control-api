import express from 'express'

import { product } from './routes/product-route.js'
import { movement } from './routes/movement-route.js'

const app = express()

app.use(express.json())

app.use('/product', product)
app.use('/movement', movement)

export { app }

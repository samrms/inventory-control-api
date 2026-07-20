import express from 'express'

import { product } from './routes/product-route.js'
import { movement } from './routes/movement-route.js'
import { trash } from './routes/trash-route.js'

const app = express()

app.use(express.json())

app.use('/product', movement)
app.use('/product/trash', trash)
app.use('/product', product)

export { app }

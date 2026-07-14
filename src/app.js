import express from 'express'

import { product } from './routes/product-route.js'

const app = express()

app.use(express.json())

app.use('/product', product)

export { app }

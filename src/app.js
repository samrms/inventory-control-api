import express from 'express'

import { productRoutes } from './routes/product-route.js'
import { movementRoutes } from './routes/movement-route.js'
import { trashRoutes } from './routes/trash-route.js'
import { openapiRoute } from './routes/openapi-route.js'

const app = express()

app.use(express.json())

app.use('/products', movementRoutes)
app.use('/products/trash', trashRoutes)
app.use('/products', productRoutes)
app.use('/docs', openapiRoute)

export { app }

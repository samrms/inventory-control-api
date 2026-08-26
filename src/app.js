import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'

import { authRoutes } from './modules/auth/index.js'
import { usersRoutes } from './modules/users/index.js'
import { productsRoutes } from './modules/products/index.js'
import { warehousesRoutes } from './modules/warehouses/index.js'
import { inventoryRoutes } from './modules/inventory/index.js'
import { movementsRoutes } from './modules/movements/index.js'
import { transfersRoutes } from './modules/transfers/index.js'
import { reservationsRoutes } from './modules/reservations/index.js'
import { suppliersRoutes } from './modules/suppliers/index.js'
import { purchaseOrdersRoutes } from './modules/purchase-orders/index.js'
import { auditLogsRoutes } from './modules/audit-logs/index.js'
import { healthRoutes } from './modules/health/index.js'
import { errorMiddleware } from './shared/errors/error-middleware.js'

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
    })
)

const api = '/api/v1'

app.use(`${api}/auth`, authRoutes)
app.use(`${api}/users`, usersRoutes)
app.use(`${api}/products`, productsRoutes)
app.use(`${api}/warehouses`, warehousesRoutes)
app.use(`${api}/inventory`, inventoryRoutes)
app.use(`${api}/movements`, movementsRoutes)
app.use(`${api}/transfers`, transfersRoutes)
app.use(`${api}/reservations`, reservationsRoutes)
app.use(`${api}/suppliers`, suppliersRoutes)
app.use(`${api}/purchase-orders`, purchaseOrdersRoutes)
app.use(`${api}/audit-logs`, auditLogsRoutes)
app.use('/health', healthRoutes())

app.use(errorMiddleware)

export { app }

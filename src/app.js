import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'

import { authRoutes } from './modules/auth/auth.routes.js'
import { usersRoutes } from './modules/users/users.routes.js'
import { productsRoutes } from './modules/products/products.routes.js'
import { warehousesRoutes } from './modules/warehouses/warehouses.routes.js'
import { inventoryRoutes } from './modules/inventory/inventory.routes.js'
import { movementsRoutes } from './modules/movements/movements.routes.js'
import { transfersRoutes } from './modules/transfers/transfers.routes.js'
import { reservationsRoutes } from './modules/reservations/reservations.routes.js'
import { suppliersRoutes } from './modules/suppliers/suppliers.routes.js'
import { purchaseOrdersRoutes } from './modules/purchase-orders/purchase-orders.routes.js'
import { auditLogsRoutes } from './modules/audit-logs/audit-logs.routes.js'
import { healthRoutes } from './modules/health/health.routes.js'
import { docsRoutes } from './modules/docs/docs.routes.js'
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
app.use(`${api}/docs`, docsRoutes)
app.use('/health', healthRoutes)

app.use(errorMiddleware)

export { app }

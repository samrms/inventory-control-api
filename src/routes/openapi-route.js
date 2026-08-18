import { Router } from 'express'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const router = Router()

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'inventory-control-api',
            version: '1.0.0',
            description: 'API for inventory control',
        },
    },
    apis: ['./src/**/*.js'],
}

const swaggerSpec = swaggerJsdoc(options)

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

export { router as openapiRoute }

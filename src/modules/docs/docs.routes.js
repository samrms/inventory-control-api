import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import { parse } from 'yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const specPath = join(__dirname, '..', '..', '..', 'openapi.yaml')
const spec = parse(readFileSync(specPath, 'utf-8'))

const router = Router()

router.use('/', swaggerUi.serve)
router.get('/', swaggerUi.setup(spec))

router.get('/openapi.yaml', (req, res) => {
    res.type('text/yaml').send(readFileSync(specPath, 'utf-8'))
})

export { router as docsRoutes }

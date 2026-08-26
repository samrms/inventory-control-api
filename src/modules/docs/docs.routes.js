import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { Router } from 'express'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const specPath = join(__dirname, '..', '..', '..', 'openapi.yaml')

const router = Router()

router.get('/', (req, res) => {
    res.type('html').send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Inventory Control API</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
        SwaggerUIBundle({
            url: '/docs/openapi.yaml',
            dom_id: '#swagger-ui',
            presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
            layout: 'BaseLayout'
        })
    </script>
</body>
</html>`)
})

router.get('/openapi.yaml', (req, res) => {
    try {
        const yaml = readFileSync(specPath, 'utf-8')
        res.type('text/yaml').send(yaml)
    } catch {
        res.status(500).json({ error: 'Failed to load OpenAPI spec' })
    }
})

export { router as docsRoutes }

import { app } from './app.js'
import { env } from './config/dotenv.js'
import logger from './shared/logger/logger.js'

const PORT = env.port

app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`)
})

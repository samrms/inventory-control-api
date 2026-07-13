import { app } from './app.js'
import { env } from './config/dotenv.js'

const PORT = env.port

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
)

import pg from 'pg'
import { env } from '../config/dotenv.js'

const { Pool } = pg

const pool = new Pool({
  connectionString: env.db_url,
})

export { pool }

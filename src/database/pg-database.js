import pg from 'pg'
import { env } from '../config/dotenv.js'

const { Pool } = pg

const pool = new Pool({
  host: env.db_host,
  port: 5432,
  user: env.db_user,
  password: env.db_password,
  database: env.db_name,
})

export { pool }

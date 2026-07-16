import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from '../pg-database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log(__dirname)
console.log(__filename)

const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')

await pool.query(sql)

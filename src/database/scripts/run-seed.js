import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { pool } from '../pg-database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const seedFiles = ['products.sql'] //'inventory.sql', 'stock-movements.sql']

async function runSeed() {
    try {
        for (const file of seedFiles) {
            const filePath = path.join(__dirname, '../seed', file)
            const sql = readFileSync(filePath, 'utf8')

            await pool.query(sql)

            console.log(`Executed ${file}`)
        }
    } catch (error) {
        console.error('Error executing schema:', error)
        process.exitCode = 1
    } finally {
        await pool.end()
    }
}

runSeed()

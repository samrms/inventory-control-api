import 'dotenv/config'
import { readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const seedsDir = join(__dirname, 'seeds')

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
})

async function run() {
    const client = await pool.connect()

    try {
        const check = await client.query(
            "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users')"
        )
        if (!check.rows[0].exists) {
            console.error(
                'Tables not found. Run migrations first: pnpm migrate'
            )
            process.exit(1)
        }

        await client.query('BEGIN')

        const files = (await readdir(seedsDir))
            .filter((f) => f.endsWith('.js'))
            .sort()

        console.log(`Seeding ${files.length} file(s)...\n`)

        for (const file of files) {
            const { seed } = await import(join(seedsDir, file))
            await seed(client)
        }

        await client.query('COMMIT')
        console.log('\nSeed completed!')
    } catch (err) {
        await client.query('ROLLBACK')
        console.error('Seed failed:', err)
        process.exit(1)
    } finally {
        client.release()
        await pool.end()
    }
}

run()

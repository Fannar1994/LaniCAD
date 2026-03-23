// Initialize Turso database with LániCAD schema
require('dotenv').config()
const { createClient } = require('@libsql/client')
const fs = require('fs')
const path = require('path')

async function initDb() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })

  console.log('Connecting to Turso database...')

  // Read and split schema into individual statements
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8')
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  console.log(`Running ${statements.length} SQL statements...`)

  for (const sql of statements) {
    try {
      await client.execute(sql)
      // Show first 60 chars of each statement
      const preview = sql.replace(/\s+/g, ' ').slice(0, 60)
      console.log(`  ✓ ${preview}...`)
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`)
      console.error(`    SQL: ${sql.slice(0, 100)}...`)
    }
  }

  // Verify tables
  const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  console.log('\nTables created:')
  for (const row of tables.rows) {
    console.log(`  • ${row.name}`)
  }

  client.close()
  console.log('\nDatabase initialized successfully!')
}

initDb().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})

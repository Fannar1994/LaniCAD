require('dotenv').config()
const { createClient } = require('@libsql/client')
const bcrypt = require('bcrypt')

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function seed() {
  const users = [
    { email: 'fannar@lanicad.is', name: 'Fannar', role: 'admin', pw: 'Fannar2024!' },
    { email: 'pall@byko.is', name: 'Páll Jónsson', role: 'user', pw: 'byko2024' },
    { email: 'sigrun@byko.is', name: 'Sigrún Helgadóttir', role: 'user', pw: 'byko2024' },
    { email: 'gudmundur@byko.is', name: 'Guðmundur Þórsson', role: 'user', pw: 'byko2024' },
    { email: 'hanna@byko.is', name: 'Hanna Björk', role: 'user', pw: 'byko2024' },
  ]

  for (const u of users) {
    const hash = await bcrypt.hash(u.pw, 10)
    try {
      const { rows } = await db.execute({
        sql: `INSERT INTO users (email, password_hash, name, role)
              VALUES (?, ?, ?, ?)
              ON CONFLICT (email) DO NOTHING
              RETURNING id, email, name, role`,
        args: [u.email, hash, u.name, u.role],
      })
      if (rows.length > 0) {
        console.log(`Created: ${rows[0].email} (${rows[0].role})`)
      } else {
        console.log(`Skipped (exists): ${u.email}`)
      }
    } catch (err) {
      console.error(`Error creating ${u.email}:`, err.message)
    }
  }

  // Show all users
  const { rows } = await db.execute('SELECT id, email, name, role, created_at FROM users ORDER BY created_at')
  console.log('\nAll users:')
  console.table(rows)

  db.close()
}

seed()

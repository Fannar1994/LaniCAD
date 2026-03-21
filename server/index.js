require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-to-a-random-secret'

// ── Database ──
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// ── Middleware ──
app.use(cors())
app.use(express.json())

// JWT auth middleware
function authenticate(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Vantar auðkenningu' })
  }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET)
    req.user = payload // { id, email, role }
    next()
  } catch {
    return res.status(401).json({ error: 'Ógilt auðkenni' })
  }
}

// ══════════════════════════════════════════
// Auth
// ══════════════════════════════════════════

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Vantar netfang og lykilorð' })
  }
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Rangt netfang eða lykilorð' })
    }
    const user = rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Rangt netfang eða lykilorð' })
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, created_at: user.created_at },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Villa í innskráningu' })
  }
})

// ══════════════════════════════════════════
// Projects
// ══════════════════════════════════════════

app.get('/api/projects', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC',
      [req.user.id]
    )
    res.json(rows)
  } catch (err) {
    console.error('Fetch projects error:', err)
    res.status(500).json({ error: 'Villa við að sækja verkefni' })
  }
})

app.get('/api/projects/:id', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Verkefni fannst ekki' })
    res.json(rows[0])
  } catch (err) {
    console.error('Fetch project error:', err)
    res.status(500).json({ error: 'Villa við að sækja verkefni' })
  }
})

app.post('/api/projects', authenticate, async (req, res) => {
  const { name, type, client, data, line_items } = req.body
  if (!name || !type) {
    return res.status(400).json({ error: 'Vantar heiti og tegund' })
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO projects (user_id, name, type, client, data, line_items)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, name, type, JSON.stringify(client || {}), JSON.stringify(data || {}), JSON.stringify(line_items || [])]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('Create project error:', err)
    res.status(500).json({ error: 'Villa við að búa til verkefni' })
  }
})

app.put('/api/projects/:id', authenticate, async (req, res) => {
  const { name, client, data, line_items } = req.body
  try {
    const sets = []
    const vals = []
    let i = 1
    if (name !== undefined) { sets.push(`name = $${i++}`); vals.push(name) }
    if (client !== undefined) { sets.push(`client = $${i++}`); vals.push(JSON.stringify(client)) }
    if (data !== undefined) { sets.push(`data = $${i++}`); vals.push(JSON.stringify(data)) }
    if (line_items !== undefined) { sets.push(`line_items = $${i++}`); vals.push(JSON.stringify(line_items)) }
    if (sets.length === 0) return res.status(400).json({ error: 'Ekkert til að uppfæra' })
    vals.push(req.params.id, req.user.id)
    const { rows } = await pool.query(
      `UPDATE projects SET ${sets.join(', ')} WHERE id = $${i++} AND user_id = $${i} RETURNING *`,
      vals
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Verkefni fannst ekki' })
    res.json(rows[0])
  } catch (err) {
    console.error('Update project error:', err)
    res.status(500).json({ error: 'Villa við að uppfæra verkefni' })
  }
})

app.delete('/api/projects/:id', authenticate, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    )
    if (rowCount === 0) return res.status(404).json({ error: 'Verkefni fannst ekki' })
    res.json({ ok: true })
  } catch (err) {
    console.error('Delete project error:', err)
    res.status(500).json({ error: 'Villa við að eyða verkefni' })
  }
})

// ══════════════════════════════════════════
// Templates
// ══════════════════════════════════════════

app.get('/api/templates', authenticate, async (req, res) => {
  try {
    let query = 'SELECT * FROM templates WHERE (user_id = $1 OR is_public = true)'
    const vals = [req.user.id]
    if (req.query.type) {
      query += ' AND type = $2'
      vals.push(req.query.type)
    }
    query += ' ORDER BY name'
    const { rows } = await pool.query(query, vals)
    res.json(rows)
  } catch (err) {
    console.error('Fetch templates error:', err)
    res.status(500).json({ error: 'Villa við að sækja sniðmát' })
  }
})

app.post('/api/templates', authenticate, async (req, res) => {
  const { type, name, description, config, is_public } = req.body
  if (!type || !name) {
    return res.status(400).json({ error: 'Vantar tegund og heiti' })
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO templates (user_id, type, name, description, config, is_public)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, type, name, description || '', JSON.stringify(config || {}), is_public || false]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('Create template error:', err)
    res.status(500).json({ error: 'Villa við að búa til sniðmát' })
  }
})

app.delete('/api/templates/:id', authenticate, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM templates WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    )
    if (rowCount === 0) return res.status(404).json({ error: 'Sniðmát fannst ekki' })
    res.json({ ok: true })
  } catch (err) {
    console.error('Delete template error:', err)
    res.status(500).json({ error: 'Villa við að eyða sniðmáti' })
  }
})

// ══════════════════════════════════════════
// Products
// ══════════════════════════════════════════

app.get('/api/products', async (req, res) => {
  try {
    let query = 'SELECT * FROM products WHERE active = true'
    const vals = []
    if (req.query.calculator_type) {
      query += ' AND calculator_type = $1'
      vals.push(req.query.calculator_type)
    }
    query += ' ORDER BY rental_no'
    const { rows } = await pool.query(query, vals)
    res.json(rows)
  } catch (err) {
    console.error('Fetch products error:', err)
    res.status(500).json({ error: 'Villa við að sækja vörur' })
  }
})

app.post('/api/products', authenticate, async (req, res) => {
  const { calculator_type, rental_no, sale_no, description, category, rates, sale_price, weight } = req.body
  if (!calculator_type || !rental_no || !description) {
    return res.status(400).json({ error: 'Vantar tegund, vörunúmer og lýsingu' })
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO products (calculator_type, rental_no, sale_no, description, category, rates, sale_price, weight)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (rental_no) DO UPDATE SET
         calculator_type = EXCLUDED.calculator_type,
         sale_no = EXCLUDED.sale_no,
         description = EXCLUDED.description,
         category = EXCLUDED.category,
         rates = EXCLUDED.rates,
         sale_price = EXCLUDED.sale_price,
         weight = EXCLUDED.weight
       RETURNING *`,
      [calculator_type, rental_no, sale_no || '', description, category || '', JSON.stringify(rates || {}), sale_price || 0, weight || 0]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('Upsert product error:', err)
    res.status(500).json({ error: 'Villa við að vista vöru' })
  }
})

// ══════════════════════════════════════════
// Health check
// ══════════════════════════════════════════

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', db: 'connected' })
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' })
  }
})

// ── Start ──
app.listen(PORT, () => {
  console.log(`LániCAD API running on http://localhost:${PORT}`)
})

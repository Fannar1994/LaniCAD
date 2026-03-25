require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const { createClient } = require('@libsql/client')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Anthropic = require('@anthropic-ai/sdk')

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-to-a-random-secret'
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET is not set — using insecure default. Set JWT_SECRET in your environment for production.')
}

// Allowed origins for CORS
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:4173')
  .split(',').map(s => s.trim())

// ── Claude AI (lazy — only created when first needed) ──
let _anthropic = null
function getAnthropic() {
  if (!_anthropic) {
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _anthropic
}

// ── Database (Turso / libSQL) ──
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
})

// ── Security Middleware ──
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.set('trust proxy', 1)

// Rate limiting: 100 requests per 15 min per IP (general)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Of margar beiðnir — reyndu aftur síðar' },
})

// Stricter rate limit for auth endpoints: 10 per 15 min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Of margar innskráningartilraunir' },
})

app.use(generalLimiter)

// CORS — allow configured origins
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true)
    if (ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*')) {
      return callback(null, true)
    }
    callback(new Error('CORS not allowed'))
  },
  credentials: true,
}))

app.use(express.json({ limit: '2mb' }))

// Root route — landing page
app.get('/', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="is">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>LániCAD API</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; background: #404042; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .card { background: #2a2a2c; border-radius: 16px; padding: 48px; max-width: 500px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
        h1 { font-size: 2rem; margin-bottom: 8px; }
        h1 span { color: #f5c800; }
        p { color: #aaa; margin-bottom: 24px; }
        .status { display: inline-block; background: #1a1a1c; padding: 12px 24px; border-radius: 8px; font-family: monospace; color: #4ade80; }
        a { color: #f5c800; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .links { margin-top: 24px; display: flex; flex-direction: column; gap: 8px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Láni<span>CAD</span> API</h1>
        <p>REST API þjónn fyrir LániCAD kerfið</p>
        <div class="status">● Online</div>
        <div class="links">
          <a href="/api/health">Heilsufarsskoðun (Health Check)</a>
        </div>
      </div>
    </body>
    </html>
  `)
})

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

app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Vantar netfang og lykilorð' })
  }
  try {
    const { rows } = await db.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] })
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
    // Log successful login
    req.user = { id: user.id, email: user.email, role: user.role }
    await logAudit(req, 'login', 'user', user.id, { email: user.email })

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, created_at: user.created_at },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Villa í innskráningu' })
  }
})

// Admin-only middleware
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Aðeins stjórnendur hafa aðgang' })
  }
  next()
}

// ── Audit Log Helper ──
async function logAudit(req, action, entityType, entityId, details = {}) {
  try {
    await db.execute({
      sql: `INSERT INTO audit_log (user_id, user_email, action, entity_type, entity_id, details, ip_address)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [req.user.id, req.user.email, action, entityType, entityId || null, JSON.stringify(details), req.ip],
    })
  } catch (err) {
    console.error('Audit log error:', err.message)
  }
}

// Get current user profile
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const { rows } = await db.execute({
      sql: 'SELECT id, email, name, role, created_at FROM users WHERE id = ?',
      args: [req.user.id],
    })
    if (rows.length === 0) return res.status(404).json({ error: 'Notandi fannst ekki' })
    res.json(rows[0])
  } catch (err) {
    console.error('Fetch me error:', err)
    res.status(500).json({ error: 'Villa' })
  }
})

// Update own password
app.put('/api/auth/password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Lykilorð verður að vera a.m.k. 6 stafir' })
  }
  try {
    const { rows } = await db.execute({
      sql: 'SELECT password_hash FROM users WHERE id = ?',
      args: [req.user.id],
    })
    if (rows.length === 0) return res.status(404).json({ error: 'Notandi fannst ekki' })
    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash)
    if (!valid) return res.status(401).json({ error: 'Rangt núverandi lykilorð' })
    const hash = await bcrypt.hash(newPassword, 10)
    await db.execute({
      sql: 'UPDATE users SET password_hash = ? WHERE id = ?',
      args: [hash, req.user.id],
    })
    res.json({ ok: true })
  } catch (err) {
    console.error('Update password error:', err)
    res.status(500).json({ error: 'Villa við að uppfæra lykilorð' })
  }
})

// ══════════════════════════════════════════
// Users (admin only)
// ══════════════════════════════════════════

app.get('/api/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const { rows } = await db.execute('SELECT id, email, name, role, created_at FROM users ORDER BY created_at')
    res.json(rows)
  } catch (err) {
    console.error('Fetch users error:', err)
    res.status(500).json({ error: 'Villa við að sækja notendur' })
  }
})

app.post('/api/users', authenticate, requireAdmin, async (req, res) => {
  const { email, name, password, role } = req.body
  if (!email || !name || !password) {
    return res.status(400).json({ error: 'Vantar netfang, nafn og lykilorð' })
  }
  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ error: 'Ógilt hlutverk' })
  }
  try {
    const hash = await bcrypt.hash(password, 10)
    const { rows } = await db.execute({
      sql: `INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?) RETURNING id, email, name, role, created_at`,
      args: [email, hash, name, role || 'user'],
    })
    await logAudit(req, 'create', 'user', rows[0].id, { email, name, role })
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Netfang er nú þegar skráð' })
    }
    console.error('Create user error:', err)
    res.status(500).json({ error: 'Villa við að búa til notanda' })
  }
})

app.put('/api/users/:id', authenticate, requireAdmin, async (req, res) => {
  const { name, role, password } = req.body
  try {
    const sets = []
    const vals = []
    if (name !== undefined) { sets.push('name = ?'); vals.push(name) }
    if (role !== undefined && ['admin', 'user'].includes(role)) { sets.push('role = ?'); vals.push(role) }
    if (password) {
      const hash = await bcrypt.hash(password, 10)
      sets.push('password_hash = ?'); vals.push(hash)
    }
    if (sets.length === 0) return res.status(400).json({ error: 'Ekkert til að uppfæra' })
    vals.push(req.params.id)
    const { rows } = await db.execute({
      sql: `UPDATE users SET ${sets.join(', ')} WHERE id = ? RETURNING id, email, name, role, created_at`,
      args: vals,
    })
    if (rows.length === 0) return res.status(404).json({ error: 'Notandi fannst ekki' })
    await logAudit(req, 'update', 'user', req.params.id, { name, role })
    res.json(rows[0])
  } catch (err) {
    console.error('Update user error:', err)
    res.status(500).json({ error: 'Villa við að uppfæra notanda' })
  }
})

app.delete('/api/users/:id', authenticate, requireAdmin, async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'Þú getur ekki eytt sjálfum þér' })
  }
  try {
    const result = await db.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [req.params.id] })
    if (result.rowsAffected === 0) return res.status(404).json({ error: 'Notandi fannst ekki' })
    await logAudit(req, 'delete', 'user', req.params.id)
    res.json({ ok: true })
  } catch (err) {
    console.error('Delete user error:', err)
    res.status(500).json({ error: 'Villa við að eyða notanda' })
  }
})

// Update product (admin)
app.put('/api/products/:id', authenticate, requireAdmin, async (req, res) => {
  const { description, rates, sale_price, weight, active, category, rental_no, sale_no, image_url } = req.body
  try {
    const sets = []
    const vals = []
    if (description !== undefined) { sets.push('description = ?'); vals.push(description) }
    if (rates !== undefined) { sets.push('rates = ?'); vals.push(JSON.stringify(rates)) }
    if (sale_price !== undefined) { sets.push('sale_price = ?'); vals.push(sale_price) }
    if (weight !== undefined) { sets.push('weight = ?'); vals.push(weight) }
    if (active !== undefined) { sets.push('active = ?'); vals.push(active ? 1 : 0) }
    if (category !== undefined) { sets.push('category = ?'); vals.push(category) }
    if (rental_no !== undefined) { sets.push('rental_no = ?'); vals.push(rental_no) }
    if (sale_no !== undefined) { sets.push('sale_no = ?'); vals.push(sale_no) }
    if (image_url !== undefined) { sets.push('image_url = ?'); vals.push(image_url) }
    if (sets.length === 0) return res.status(400).json({ error: 'Ekkert til að uppfæra' })
    vals.push(req.params.id)
    const { rows } = await db.execute({
      sql: `UPDATE products SET ${sets.join(', ')} WHERE id = ? RETURNING *`,
      args: vals,
    })
    if (rows.length === 0) return res.status(404).json({ error: 'Vara fannst ekki' })
    await logAudit(req, 'update', 'product', req.params.id, { description })
    res.json(rows[0])
  } catch (err) {
    console.error('Update product error:', err)
    res.status(500).json({ error: 'Villa við að uppfæra vöru' })
  }
})

app.delete('/api/products/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [req.params.id] })
    if (result.rowsAffected === 0) return res.status(404).json({ error: 'Vara fannst ekki' })
    await logAudit(req, 'delete', 'product', req.params.id)
    res.json({ ok: true })
  } catch (err) {
    console.error('Delete product error:', err)
    res.status(500).json({ error: 'Villa við að eyða vöru' })
  }
})

// ══════════════════════════════════════════
// Projects
// ══════════════════════════════════════════

app.get('/api/projects', authenticate, async (req, res) => {
  try {
    const { rows } = await db.execute({
      sql: 'SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC',
      args: [req.user.id],
    })
    res.json(rows)
  } catch (err) {
    console.error('Fetch projects error:', err)
    res.status(500).json({ error: 'Villa við að sækja verkefni' })
  }
})

app.get('/api/projects/:id', authenticate, async (req, res) => {
  try {
    const { rows } = await db.execute({
      sql: 'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      args: [req.params.id, req.user.id],
    })
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
    const { rows } = await db.execute({
      sql: `INSERT INTO projects (user_id, name, type, client, data, line_items)
            VALUES (?, ?, ?, ?, ?, ?) RETURNING *`,
      args: [req.user.id, name, type, JSON.stringify(client || {}), JSON.stringify(data || {}), JSON.stringify(line_items || [])],
    })
    await logAudit(req, 'create', 'project', rows[0].id, { name, type })
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
    if (name !== undefined) { sets.push('name = ?'); vals.push(name) }
    if (client !== undefined) { sets.push('client = ?'); vals.push(JSON.stringify(client)) }
    if (data !== undefined) { sets.push('data = ?'); vals.push(JSON.stringify(data)) }
    if (line_items !== undefined) { sets.push('line_items = ?'); vals.push(JSON.stringify(line_items)) }
    if (sets.length === 0) return res.status(400).json({ error: 'Ekkert til að uppfæra' })
    sets.push("updated_at = datetime('now')")
    vals.push(req.params.id, req.user.id)
    const { rows } = await db.execute({
      sql: `UPDATE projects SET ${sets.join(', ')} WHERE id = ? AND user_id = ? RETURNING *`,
      args: vals,
    })
    if (rows.length === 0) return res.status(404).json({ error: 'Verkefni fannst ekki' })
    await logAudit(req, 'update', 'project', req.params.id, { name })
    res.json(rows[0])
  } catch (err) {
    console.error('Update project error:', err)
    res.status(500).json({ error: 'Villa við að uppfæra verkefni' })
  }
})

app.delete('/api/projects/:id', authenticate, async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'DELETE FROM projects WHERE id = ? AND user_id = ?',
      args: [req.params.id, req.user.id],
    })
    if (result.rowsAffected === 0) return res.status(404).json({ error: 'Verkefni fannst ekki' })
    await logAudit(req, 'delete', 'project', req.params.id)
    res.json({ ok: true })
  } catch (err) {
    console.error('Delete project error:', err)
    res.status(500).json({ error: 'Villa við að eyða verkefni' })
  }
})

// ══════════════════════════════════════════
// Project Sharing (Client Portal)
// ══════════════════════════════════════════

const crypto = require('crypto')

// Create or get share link for a project
app.post('/api/projects/:id/share', authenticate, async (req, res) => {
  try {
    // Verify project belongs to user
    const { rows: projects } = await db.execute({
      sql: 'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      args: [req.params.id, req.user.id],
    })
    if (projects.length === 0) return res.status(404).json({ error: 'Verkefni fannst ekki' })

    // Check if share already exists
    const { rows: existing } = await db.execute({
      sql: 'SELECT * FROM project_shares WHERE project_id = ?',
      args: [req.params.id],
    })
    if (existing.length > 0) {
      return res.json({ token: existing[0].token, created_at: existing[0].created_at })
    }

    // Create new share token
    const token = crypto.randomBytes(32).toString('hex')
    const { rows } = await db.execute({
      sql: 'INSERT INTO project_shares (project_id, token, created_by) VALUES (?, ?, ?) RETURNING *',
      args: [req.params.id, token, req.user.id],
    })
    await logAudit(req, 'share', 'project', req.params.id, { token })
    res.status(201).json({ token: rows[0].token, created_at: rows[0].created_at })
  } catch (err) {
    console.error('Share project error:', err)
    res.status(500).json({ error: 'Villa við að deila verkefni' })
  }
})

// Delete share link for a project
app.delete('/api/projects/:id/share', authenticate, async (req, res) => {
  try {
    // Verify project belongs to user
    const { rows: projects } = await db.execute({
      sql: 'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      args: [req.params.id, req.user.id],
    })
    if (projects.length === 0) return res.status(404).json({ error: 'Verkefni fannst ekki' })

    await db.execute({
      sql: 'DELETE FROM project_shares WHERE project_id = ?',
      args: [req.params.id],
    })
    await logAudit(req, 'unshare', 'project', req.params.id)
    res.json({ ok: true })
  } catch (err) {
    console.error('Unshare project error:', err)
    res.status(500).json({ error: 'Villa við að afturkalla deilingu' })
  }
})

// Get share status for a project
app.get('/api/projects/:id/share', authenticate, async (req, res) => {
  try {
    const { rows } = await db.execute({
      sql: `SELECT ps.* FROM project_shares ps
            JOIN projects p ON p.id = ps.project_id
            WHERE ps.project_id = ? AND p.user_id = ?`,
      args: [req.params.id, req.user.id],
    })
    if (rows.length === 0) return res.json({ shared: false })
    res.json({ shared: true, token: rows[0].token, created_at: rows[0].created_at })
  } catch (err) {
    console.error('Get share status error:', err)
    res.status(500).json({ error: 'Villa' })
  }
})

// Public: View shared project (no authentication required)
app.get('/api/shared/:token', async (req, res) => {
  try {
    const { rows } = await db.execute({
      sql: `SELECT p.name, p.type, p.client, p.data, p.line_items, p.created_at, p.updated_at,
                   u.name as owner_name
            FROM project_shares ps
            JOIN projects p ON p.id = ps.project_id
            JOIN users u ON u.id = p.user_id
            WHERE ps.token = ?`,
      args: [req.params.token],
    })
    if (rows.length === 0) return res.status(404).json({ error: 'Deilt verkefni fannst ekki eða hlekkur útrunninn' })
    res.json(rows[0])
  } catch (err) {
    console.error('Shared project fetch error:', err)
    res.status(500).json({ error: 'Villa við að sækja deilt verkefni' })
  }
})

// ══════════════════════════════════════════
// Templates
// ══════════════════════════════════════════

app.get('/api/templates', authenticate, async (req, res) => {
  try {
    let sql = 'SELECT * FROM templates WHERE (user_id = ? OR is_public = 1)'
    const vals = [req.user.id]
    if (req.query.type) {
      sql += ' AND type = ?'
      vals.push(req.query.type)
    }
    sql += ' ORDER BY name'
    const { rows } = await db.execute({ sql, args: vals })
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
    const { rows } = await db.execute({
      sql: `INSERT INTO templates (user_id, type, name, description, config, is_public)
            VALUES (?, ?, ?, ?, ?, ?) RETURNING *`,
      args: [req.user.id, type, name, description || '', JSON.stringify(config || {}), is_public ? 1 : 0],
    })
    await logAudit(req, 'create', 'template', rows[0].id, { name, type })
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('Create template error:', err)
    res.status(500).json({ error: 'Villa við að búa til sniðmát' })
  }
})

app.put('/api/templates/:id', authenticate, async (req, res) => {
  const { name, description, config, is_public } = req.body
  if (!name) {
    return res.status(400).json({ error: 'Vantar heiti' })
  }
  try {
    const { rows } = await db.execute({
      sql: `UPDATE templates SET name = ?, description = ?, config = ?, is_public = ?
            WHERE id = ? AND user_id = ? RETURNING *`,
      args: [name, description || '', JSON.stringify(config || {}), is_public ? 1 : 0, req.params.id, req.user.id],
    })
    if (rows.length === 0) return res.status(404).json({ error: 'Sniðmát fannst ekki' })
    await logAudit(req, 'update', 'template', req.params.id, { name })
    res.json(rows[0])
  } catch (err) {
    console.error('Update template error:', err)
    res.status(500).json({ error: 'Villa við að uppfæra sniðmát' })
  }
})

app.delete('/api/templates/:id', authenticate, async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'DELETE FROM templates WHERE id = ? AND user_id = ?',
      args: [req.params.id, req.user.id],
    })
    if (result.rowsAffected === 0) return res.status(404).json({ error: 'Sniðmát fannst ekki' })
    await logAudit(req, 'delete', 'template', req.params.id)
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
    let sql = 'SELECT * FROM products WHERE active = 1'
    const vals = []
    if (req.query.calculator_type) {
      sql += ' AND calculator_type = ?'
      vals.push(req.query.calculator_type)
    }
    sql += ' ORDER BY rental_no'
    const { rows } = await db.execute({ sql, args: vals })
    res.json(rows)
  } catch (err) {
    console.error('Fetch products error:', err)
    res.status(500).json({ error: 'Villa við að sækja vörur' })
  }
})

app.post('/api/products', authenticate, async (req, res) => {
  const { calculator_type, rental_no, sale_no, description, category, rates, sale_price, weight, image_url } = req.body
  if (!calculator_type || !rental_no || !description) {
    return res.status(400).json({ error: 'Vantar tegund, vörunúmer og lýsingu' })
  }
  try {
    const { rows } = await db.execute({
      sql: `INSERT INTO products (calculator_type, rental_no, sale_no, description, category, rates, sale_price, weight, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (rental_no) DO UPDATE SET
              calculator_type = excluded.calculator_type,
              sale_no = excluded.sale_no,
              description = excluded.description,
              category = excluded.category,
              rates = excluded.rates,
              sale_price = excluded.sale_price,
              weight = excluded.weight,
              image_url = excluded.image_url
            RETURNING *`,
      args: [calculator_type, rental_no, sale_no || '', description, category || '', JSON.stringify(rates || {}), sale_price || 0, weight || 0, image_url || ''],
    })
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('Upsert product error:', err)
    res.status(500).json({ error: 'Villa við að vista vöru' })
  }
})

// ══════════════════════════════════════════
// AI Chat (Claude Sonnet 4)
// ══════════════════════════════════════════

const SYSTEM_PROMPT = `Þú ert LániCAD AI aðstoðarmaður — sérfræðingur í tækjaleigu og sölu á byggingartækjum hjá BYKO Leiga á Íslandi.

## Þú getur hjálpað með:
- Val á réttum tækjum (girðingar, vinnupallar, steypumót, hjólapallar, loftastoðir)
- Leiguverðútreikningum og tilboðum
- Tæknilegar upplýsingar og leiðbeiningar
- Ráðgjöf um hvaða búnað viðskiptavinur þarfnast

## Gjaldmiðill: ISK — notaðu punkt sem þúsundaskil og kommu sem aukastafi: t.d. 1.234.567 kr

## Vöruflokkar og verð:

### 1. GIRÐINGAR (Mobile Fences) — Lágmarksleigu: 10 dagar
Leiguverð er í 12 tímabilum (30 dagar hvert), lækkandi:
- Girðing 3500×2000mm (1.7mm): [120, 60, 30, 15, 15, ...] kr/dag, sala: 18.500 kr
- Girðing 3500×2000mm (1.1mm): [100, 50, 25, 13, 13, ...] kr/dag, sala: 13.500 kr
- Girðing 3500×1200mm (1.1mm): [80, 40, 20, 10, 10, ...] kr/dag, sala: 10.500 kr
- Biðröðgirðing 2500mm: [90, 45, 23, 12, 12, ...] kr/dag, sala: 12.000 kr
- Plastgirðing 2100mm: [50, 25, 13, 7, 7, ...] kr/dag, sala: 5.500 kr
- Steinn (steinsteypa): [30, 15, 8, 4, ...] kr/dag, sala: 4.500 kr
- Steinn (PVC): [20, 10, 5, 3, ...] kr/dag, sala: 3.000 kr
- Klemmur: [5, 3, 2, 1, ...] kr/dag, sala: 900 kr
- Gönguhliðar: [100, 50, 25, 13, ...] kr/dag, sala: 18.000 kr
- Hjól f/hliðar: [30, 15, 8, 4, ...] kr/dag, sala: 5.000 kr
Formúla: 12 tímabil af 30 dögum með lækkandi verði.

### 2. VINNUPALLAR (Facade Scaffolding) — Layher Allround kerfi
Leiguverð á dag × fjöldi daga × magn:
- Rammar 2,0m: 19 kr/dag, 18,6 kg, sala: 23.895 kr
- Rammar 0,7m: 15 kr/dag, 7,52 kg, sala: 12.867 kr
- Gólfborð 1,8m: 12 kr/dag, 13,9 kg, sala: 15.995 kr
- Stigapallar 1,8m: 50 kr/dag, 17 kg, sala: 40.531 kr
- Stigar 2,0m: 17 kr/dag, 8 kg, sala: 12.026 kr
- Tvöföld handrið: 15 kr/dag, 8,8 kg, sala: 14.097 kr
- Veggfestingar 50cm: 3 kr/dag, sala: 3.695 kr
- Veggfestingar 100cm: 6 kr/dag, sala: 4.688 kr
- Klemmur: 3 kr/dag, sala: 1.695 kr
Gólfborð eru 1,8m á lengd. Veggfestingar á ca. 15 m² svæði.

### 3. STEYPUMÓT (Concrete Formwork) — 4 undirkerfi
Leiguverð: dagar < 7 → dagverð × dagar × magn; annars vikuverð × ceil(dagar/7) × magn

**Rasto kerfi (veggir):** Flekar 30-240cm × 300cm, dagverð 70-373 kr
**Takko kerfi (undirstöður):** Flekar 30-90cm × 120cm, dagverð 33-50 kr
**Manto kerfi (veggir/súlur):** Flekar 45-240cm × 60-330cm, dagverð 47-405 kr, horn, útvíkkanir
**Alufort (plötur):** Loftslagsmót 37,5-75cm, dagverð 117-282 kr

Almennt viðmið: ~170 vörur, hornaflekar, Mótafleki-panellar, klemmur, bindingar, krana krókar, boltaplötur.

### 4. HJÓLAPALLAR (Mobile Scaffolding) — 3 tegundir
- Mjór pallur (0,75m breidd): 2,5-10,5m hæð
- Breiður pallur (1,35m breidd): 2,5-10,5m hæð
- Quickly pallur: ein hæð

Verð eftir hæð (mjór/breiður):
- 2,5m: 4.717/5.443 kr á sólarhring
- 4,5m: 7.576/8.303 kr á sólarhring
- 6,5m: 10.571/11.298 kr á sólarhring
- 8,5m: 13.565/14.292 kr á sólarhring
- 10,5m: 16.647/17.374 kr á sólarhring

Formúla: 1 dagur = sólarhring. 2-6 dagar = sólarhring + aukadag × (dagar-1). 7+ = vika × heilar vikur + sólarhring × aukadagar.

### 5. LOFTASTOÐIR (Ceiling Props) — EN 1065 flokkar A-E
Leiguverð: dagar < 7 → dagverð × dagar × magn; annars vikuverð × ceil(dagar/7) × magn
- Villalta 070/120M (A): 0,7-1,2m, 16 kr/dag, 60 kr/viku, sala: 5.422 kr
- Villalta 100/180M (A): 1,0-1,8m, 18 kr/dag, 67 kr/viku, sala: 6.595 kr
- Villalta 200/350M (B-CD): 2,0-3,5m, 30 kr/dag, 112 kr/viku, sala: 13.895 kr
- Villalta 250/400M (CE): 2,5-4,0m, 35 kr/dag, 130 kr/viku, sala: 17.595 kr
- Villalta 301/500M (D-E): 3,01-5,0m, 50 kr/dag, 186 kr/viku, sala: 26.995 kr
- Villalta 301/550M (E): 3,01-5,5m, 70 kr/dag, 260 kr/viku, sala: 40.795 kr

HT-20 mótabitar: 2,45m-5,90m, 50-140 kr/dag, 186-520 kr/viku.
Aukahlutir: þrífótur, framlenging, rekkur, gafflar.

## Reglur:
- Svaraðu ALLTAF á íslensku
- Vertu nákvæmur með verð og tölur
- Ef þú ert ekki viss um verð, segðu frá og ráðleggðu viðskiptavin að hafa samband
- Ekki þykjast vita um vörur sem eru ekki í listanum
- Vertu vingjarnlegur og faglegur`

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Vantar skilaboð' })
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'AI þjónusta er ekki stillt' })
  }

  // Sanitize messages: only allow role user/assistant and text content
  const sanitized = messages
    .filter(m => ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
    .slice(-20) // limit conversation history
    .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }))

  if (sanitized.length === 0) {
    return res.status(400).json({ error: 'Engin gild skilaboð' })
  }

  try {
    const response = await getAnthropic().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: sanitized,
    })

    const text = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('')

    res.json({ reply: text })
  } catch (err) {
    console.error('Claude API error:', err.message)
    if (err.status === 401) {
      return res.status(503).json({ error: 'Ógildur API lykill' })
    }
    res.status(500).json({ error: 'Villa í AI þjónustu' })
  }
})

// ══════════════════════════════════════════
// Audit Log (admin only)
// ══════════════════════════════════════════

app.get('/api/audit-log', authenticate, requireAdmin, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 500)
  const offset = Math.max(parseInt(req.query.offset) || 0, 0)
  const action = req.query.action
  const entityType = req.query.entity_type

  try {
    let sql = 'SELECT * FROM audit_log'
    const conditions = []
    const vals = []

    if (action) {
      conditions.push('action = ?')
      vals.push(action)
    }
    if (entityType) {
      conditions.push('entity_type = ?')
      vals.push(entityType)
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    vals.push(limit, offset)

    const { rows } = await db.execute({ sql, args: vals })

    // Get total count for pagination
    let countSql = 'SELECT COUNT(*) as total FROM audit_log'
    const countVals = []
    if (conditions.length > 0) {
      const countConditions = []
      if (action) { countConditions.push('action = ?'); countVals.push(action) }
      if (entityType) { countConditions.push('entity_type = ?'); countVals.push(entityType) }
      countSql += ' WHERE ' + countConditions.join(' AND ')
    }
    const countResult = await db.execute({ sql: countSql, args: countVals })

    res.json({ entries: rows, total: Number(countResult.rows[0].total), limit, offset })
  } catch (err) {
    console.error('Audit log fetch error:', err)
    res.status(500).json({ error: 'Villa við að sækja aðgerðaskrá' })
  }
})

// ══════════════════════════════════════════
// Health check
// ══════════════════════════════════════════

app.get('/api/health', async (_req, res) => {
  try {
    await db.execute('SELECT 1')
    const result = await db.execute("SELECT COUNT(*) as pending FROM request_queue WHERE status = 'pending'")
    res.json({
      status: 'ok',
      db: 'connected',
      pendingQueue: Number(result.rows[0].pending),
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    })
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' })
  }
})

// ══════════════════════════════════════════
// Request Queue / Backlog System
// ══════════════════════════════════════════

// Queue a request for later processing
app.post('/api/queue', async (req, res) => {
  const { method, path, headers, body } = req.body
  if (!method || !path) {
    return res.status(400).json({ error: 'Vantar method og path' })
  }
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE']
  if (!allowedMethods.includes(method.toUpperCase())) {
    return res.status(400).json({ error: 'Ógild HTTP aðferð' })
  }
  // Prevent queuing to the queue endpoint itself
  if (path.startsWith('/api/queue')) {
    return res.status(400).json({ error: 'Ekki er hægt að biðraða í biðröð' })
  }
  try {
    const { rows } = await db.execute({
      sql: `INSERT INTO request_queue (method, path, headers, body, source_ip)
            VALUES (?, ?, ?, ?, ?) RETURNING id, status, created_at`,
      args: [method.toUpperCase(), path, JSON.stringify(headers || {}), JSON.stringify(body || {}), req.ip],
    })
    res.status(202).json({ queued: true, id: rows[0].id, created_at: rows[0].created_at })
  } catch (err) {
    console.error('Queue error:', err)
    res.status(500).json({ error: 'Villa við að setja í biðröð' })
  }
})

// Get queue status (admin)
app.get('/api/queue', authenticate, requireAdmin, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200)
  const status = req.query.status || 'all'
  try {
    let sql = 'SELECT * FROM request_queue'
    const vals = []
    if (status !== 'all') {
      sql += ' WHERE status = ?'
      vals.push(status)
    }
    sql += ' ORDER BY created_at DESC LIMIT ?'
    vals.push(limit)
    const { rows } = await db.execute({ sql, args: vals })
    res.json(rows)
  } catch (err) {
    console.error('Queue fetch error:', err)
    res.status(500).json({ error: 'Villa' })
  }
})

// Process pending queue items (admin trigger or startup)
app.post('/api/queue/process', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await processQueue()
    res.json(result)
  } catch (err) {
    console.error('Queue process error:', err)
    res.status(500).json({ error: 'Villa við að vinna úr biðröð' })
  }
})

async function processQueue() {
  const { rows: pending } = await db.execute(
    "SELECT * FROM request_queue WHERE status = 'pending' ORDER BY created_at ASC LIMIT 100"
  )
  if (pending.length === 0) return { processed: 0, message: 'Engin beiðni í biðröð' }

  let processed = 0
  let failed = 0

  for (const item of pending) {
    try {
      // Replay the request internally using the Express app
      const http = require('http')
      const result = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'localhost',
          port: PORT,
          path: item.path,
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
            ...(item.headers?.authorization ? { Authorization: item.headers.authorization } : {}),
          },
        }
        const req = http.request(options, (res) => {
          let data = ''
          res.on('data', chunk => data += chunk)
          res.on('end', () => {
            try {
              resolve({ code: res.statusCode, body: JSON.parse(data) })
            } catch {
              resolve({ code: res.statusCode, body: { raw: data } })
            }
          })
        })
        req.on('error', reject)
        if (['POST', 'PUT'].includes(item.method) && item.body) {
          req.write(JSON.stringify(item.body))
        }
        req.end()
      })

      await db.execute({
        sql: `UPDATE request_queue SET status = ?, processed_at = datetime('now'), response_code = ?, response_body = ?
              WHERE id = ?`,
        args: [result.code < 400 ? 'completed' : 'failed', result.code, JSON.stringify(result.body), item.id],
      })
      if (result.code < 400) processed++
      else failed++
    } catch (err) {
      console.error(`Queue item ${item.id} failed:`, err.message)
      await db.execute({
        sql: "UPDATE request_queue SET status = 'failed', processed_at = datetime('now'), response_body = ? WHERE id = ?",
        args: [JSON.stringify({ error: err.message }), item.id],
      })
      failed++
    }
  }

  return { processed, failed, total: pending.length }
}

// ── Global error handlers (prevent silent crashes) ──
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  // Give time to log, then exit (let process manager restart)
  setTimeout(() => process.exit(1), 1000)
})

// ── Start ──
const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`LániCAD API running on http://localhost:${PORT}`)
  console.log(`Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`)

  // Process any backlogged queue items on startup
  try {
    const result = await processQueue()
    if (result.processed > 0 || result.failed > 0) {
      console.log(`Queue processed on startup: ${result.processed} OK, ${result.failed} failed out of ${result.total}`)
    }
  } catch (err) {
    console.error('Queue startup processing failed:', err.message)
  }
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use.`)
    console.error('Another server instance may be running.')
    console.error(`  Fix: Stop the other process or set PORT=<other> in .env\n`)
    process.exit(1)
  } else {
    console.error('Server error:', err)
  }
})

// Graceful shutdown
function shutdown(signal) {
  console.log(`\n${signal} received — shutting down gracefully...`)
  server.close(() => {
    db.close()
    console.log('Database connection closed.')
    process.exit(0)
  })
  // Force-kill after 5s if graceful shutdown hangs
  setTimeout(() => process.exit(1), 5000)
}
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const { Pool } = require('pg')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Anthropic = require('@anthropic-ai/sdk')

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-to-a-random-secret'

// Allowed origins for CORS (add your tunnel URL here)
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:4173')
  .split(',').map(s => s.trim())

// ── Claude AI ──
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Database ──
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// ── Security Middleware ──
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.set('trust proxy', 1) // trust first proxy (cloudflared/ngrok)

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

// Root route — landing page for tunnel visitors
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
    await pool.query(
      `INSERT INTO audit_log (user_id, user_email, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [req.user.id, req.user.email, action, entityType, entityId || null, JSON.stringify(details), req.ip]
    )
  } catch (err) {
    console.error('Audit log error:', err.message)
  }
}

// Get current user profile
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    )
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
    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Notandi fannst ekki' })
    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash)
    if (!valid) return res.status(401).json({ error: 'Rangt núverandi lykilorð' })
    const hash = await bcrypt.hash(newPassword, 10)
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id])
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
    const { rows } = await pool.query(
      'SELECT id, email, name, role, created_at FROM users ORDER BY created_at'
    )
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
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, created_at`,
      [email, hash, name, role || 'user']
    )
    await logAudit(req, 'create', 'user', rows[0].id, { email, name, role })
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') {
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
    let i = 1
    if (name !== undefined) { sets.push(`name = $${i++}`); vals.push(name) }
    if (role !== undefined && ['admin', 'user'].includes(role)) { sets.push(`role = $${i++}`); vals.push(role) }
    if (password) {
      const hash = await bcrypt.hash(password, 10)
      sets.push(`password_hash = $${i++}`); vals.push(hash)
    }
    if (sets.length === 0) return res.status(400).json({ error: 'Ekkert til að uppfæra' })
    vals.push(req.params.id)
    const { rows } = await pool.query(
      `UPDATE users SET ${sets.join(', ')} WHERE id = $${i} RETURNING id, email, name, role, created_at`,
      vals
    )
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
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [req.params.id])
    if (rowCount === 0) return res.status(404).json({ error: 'Notandi fannst ekki' })
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
    let i = 1
    if (description !== undefined) { sets.push(`description = $${i++}`); vals.push(description) }
    if (rates !== undefined) { sets.push(`rates = $${i++}`); vals.push(JSON.stringify(rates)) }
    if (sale_price !== undefined) { sets.push(`sale_price = $${i++}`); vals.push(sale_price) }
    if (weight !== undefined) { sets.push(`weight = $${i++}`); vals.push(weight) }
    if (active !== undefined) { sets.push(`active = $${i++}`); vals.push(active) }
    if (category !== undefined) { sets.push(`category = $${i++}`); vals.push(category) }
    if (rental_no !== undefined) { sets.push(`rental_no = $${i++}`); vals.push(rental_no) }
    if (sale_no !== undefined) { sets.push(`sale_no = $${i++}`); vals.push(sale_no) }
    if (image_url !== undefined) { sets.push(`image_url = $${i++}`); vals.push(image_url) }
    if (sets.length === 0) return res.status(400).json({ error: 'Ekkert til að uppfæra' })
    vals.push(req.params.id)
    const { rows } = await pool.query(
      `UPDATE products SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
      vals
    )
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
    const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [req.params.id])
    if (rowCount === 0) return res.status(404).json({ error: 'Vara fannst ekki' })
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
    await logAudit(req, 'update', 'project', req.params.id, { name })
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
    await logAudit(req, 'delete', 'project', req.params.id)
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
    await logAudit(req, 'create', 'template', rows[0].id, { name, type })
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
  const { calculator_type, rental_no, sale_no, description, category, rates, sale_price, weight, image_url } = req.body
  if (!calculator_type || !rental_no || !description) {
    return res.status(400).json({ error: 'Vantar tegund, vörunúmer og lýsingu' })
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO products (calculator_type, rental_no, sale_no, description, category, rates, sale_price, weight, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (rental_no) DO UPDATE SET
         calculator_type = EXCLUDED.calculator_type,
         sale_no = EXCLUDED.sale_no,
         description = EXCLUDED.description,
         category = EXCLUDED.category,
         rates = EXCLUDED.rates,
         sale_price = EXCLUDED.sale_price,
         weight = EXCLUDED.weight,
         image_url = EXCLUDED.image_url
       RETURNING *`,
      [calculator_type, rental_no, sale_no || '', description, category || '', JSON.stringify(rates || {}), sale_price || 0, weight || 0, image_url || '']
    )
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
- Girðing 3500×2000mm (1.7kg/m): [120, 60, 30, 15, 15, ...] kr/dag, sala: 18.500 kr
- Girðing 3500×2000mm (1.1kg/m): [100, 50, 25, 13, 13, ...] kr/dag, sala: 13.500 kr
- Girðing 3500×1200mm (1.1kg/m): [80, 40, 20, 10, 10, ...] kr/dag, sala: 10.500 kr
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
    const response = await anthropic.messages.create({
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
    let query = 'SELECT * FROM audit_log'
    const conditions = []
    const vals = []
    let i = 1

    if (action) {
      conditions.push(`action = $${i++}`)
      vals.push(action)
    }
    if (entityType) {
      conditions.push(`entity_type = $${i++}`)
      vals.push(entityType)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ` ORDER BY created_at DESC LIMIT $${i++} OFFSET $${i++}`
    vals.push(limit, offset)

    const { rows } = await pool.query(query, vals)

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM audit_log'
    const countVals = []
    if (conditions.length > 0) {
      const countConditions = []
      let ci = 1
      if (action) { countConditions.push(`action = $${ci++}`); countVals.push(action) }
      if (entityType) { countConditions.push(`entity_type = $${ci++}`); countVals.push(entityType) }
      countQuery += ' WHERE ' + countConditions.join(' AND ')
    }
    const { rows: countRows } = await pool.query(countQuery, countVals)

    res.json({ entries: rows, total: parseInt(countRows[0].total), limit, offset })
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
    await pool.query('SELECT 1')
    const { rows } = await pool.query(
      "SELECT COUNT(*) as pending FROM request_queue WHERE status = 'pending'"
    )
    res.json({
      status: 'ok',
      db: 'connected',
      pendingQueue: parseInt(rows[0].pending),
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

// Queue a request for later processing (external clients use this when server might be offline)
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
    const { rows } = await pool.query(
      `INSERT INTO request_queue (method, path, headers, body, source_ip)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, status, created_at`,
      [method.toUpperCase(), path, JSON.stringify(headers || {}), JSON.stringify(body || {}), req.ip]
    )
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
    let query = 'SELECT * FROM request_queue'
    const vals = []
    if (status !== 'all') {
      query += ' WHERE status = $1'
      vals.push(status)
    }
    query += ' ORDER BY created_at DESC LIMIT $' + (vals.length + 1)
    vals.push(limit)
    const { rows } = await pool.query(query, vals)
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
  const { rows: pending } = await pool.query(
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

      await pool.query(
        `UPDATE request_queue SET status = $1, processed_at = now(), response_code = $2, response_body = $3
         WHERE id = $4`,
        [result.code < 400 ? 'completed' : 'failed', result.code, JSON.stringify(result.body), item.id]
      )
      if (result.code < 400) processed++
      else failed++
    } catch (err) {
      console.error(`Queue item ${item.id} failed:`, err.message)
      await pool.query(
        "UPDATE request_queue SET status = 'failed', processed_at = now(), response_body = $1 WHERE id = $2",
        [JSON.stringify({ error: err.message }), item.id]
      )
      failed++
    }
  }

  return { processed, failed, total: pending.length }
}

// ══════════════════════════════════════════
// Tunnel Info Endpoint
// ══════════════════════════════════════════

let tunnelUrl = null

app.get('/api/tunnel', authenticate, async (_req, res) => {
  res.json({
    tunnelUrl: tunnelUrl,
    active: !!tunnelUrl,
    localPort: PORT,
    hint: tunnelUrl
      ? 'Deila þessari slóð með öðrum til að tengjast'
      : 'Ræstu tunnel: npx cloudflared-tunnel tunnel --url http://localhost:3001',
  })
})

// Set tunnel URL (called by tunnel start script)
app.post('/api/tunnel', authenticate, requireAdmin, (req, res) => {
  const { url } = req.body
  if (url && typeof url === 'string' && url.startsWith('https://')) {
    tunnelUrl = url
    // Add tunnel URL to CORS allowed origins
    if (!ALLOWED_ORIGINS.includes(url)) {
      ALLOWED_ORIGINS.push(url)
    }
    console.log(`Tunnel URL set: ${url}`)
    res.json({ ok: true, tunnelUrl: url })
  } else {
    res.status(400).json({ error: 'Ógild tunnel slóð' })
  }
})

// ── Start ──
app.listen(PORT, '0.0.0.0', async () => {
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

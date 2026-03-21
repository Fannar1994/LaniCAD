require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Anthropic = require('@anthropic-ai/sdk')

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-to-a-random-secret'

// ── Claude AI ──
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

// Admin-only middleware
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Aðeins stjórnendur hafa aðgang' })
  }
  next()
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
    res.json({ ok: true })
  } catch (err) {
    console.error('Delete user error:', err)
    res.status(500).json({ error: 'Villa við að eyða notanda' })
  }
})

// Update product (admin)
app.put('/api/products/:id', authenticate, requireAdmin, async (req, res) => {
  const { description, rates, sale_price, weight, active, category, rental_no, sale_no } = req.body
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
    if (sets.length === 0) return res.status(400).json({ error: 'Ekkert til að uppfæra' })
    vals.push(req.params.id)
    const { rows } = await pool.query(
      `UPDATE products SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
      vals
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Vara fannst ekki' })
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

app.post('/api/chat', authenticate, async (req, res) => {
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

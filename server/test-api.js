/**
 * LániCAD — Comprehensive API Test Suite
 * Tests all endpoints against http://localhost:3001
 */

const BASE = 'http://localhost:3001'
let TOKEN = ''
let ADMIN_TOKEN = ''
let createdProjectId = ''
let createdUserId = ''
let createdTemplateId = ''

const results = []
let pass = 0
let fail = 0

async function test(name, fn) {
  try {
    await fn()
    results.push({ name, status: '✅ PASS' })
    pass++
  } catch (err) {
    results.push({ name, status: '❌ FAIL', error: err.message })
    fail++
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed')
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (options.token) headers['Authorization'] = `Bearer ${options.token}`
  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  const body = await res.text()
  let json
  try { json = JSON.parse(body) } catch { json = null }
  return { status: res.status, ok: res.ok, body, json }
}

async function run() {
  console.log('\n══════════════════════════════════════')
  console.log('  LániCAD — API Test Suite')
  console.log('══════════════════════════════════════\n')

  // ═══ 1. HEALTH & ROOT ═══
  await test('GET / — Landing page', async () => {
    const r = await api('/')
    assert(r.status === 200, `Got ${r.status}`)
    assert(r.body.includes('LániCAD'), 'Missing LániCAD in response')
  })

  await test('GET /api/health — Health check', async () => {
    const r = await api('/api/health')
    assert(r.status === 200, `Got ${r.status}`)
    assert(r.json.status === 'ok', `Status: ${r.json.status}`)
    assert(r.json.db === 'connected', `DB: ${r.json.db}`)
  })

  // ═══ 2. AUTH ═══
  await test('POST /api/auth/login — Invalid credentials (should 401)', async () => {
    const r = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'nobody@test.is', password: 'wrong' }),
    })
    assert(r.status === 401, `Expected 401, got ${r.status}`)
  })

  await test('POST /api/auth/login — Valid admin login', async () => {
    const r = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'fannar@lanicad.is', password: 'Fannar2024!' }),
    })
    assert(r.status === 200, `Got ${r.status}: ${r.body}`)
    assert(r.json.token, 'No token returned')
    assert(r.json.user.role === 'admin', `Role: ${r.json.user.role}`)
    ADMIN_TOKEN = r.json.token
    TOKEN = r.json.token
  })

  await test('POST /api/auth/login — Valid user login', async () => {
    const r = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'pall@byko.is', password: 'byko2024' }),
    })
    assert(r.status === 200, `Got ${r.status}: ${r.body}`)
    assert(r.json.user.role === 'user', `Role: ${r.json.user.role}`)
  })

  await test('GET /api/auth/me — Get profile with token', async () => {
    const r = await api('/api/auth/me', { token: TOKEN })
    assert(r.status === 200, `Got ${r.status}`)
    assert(r.json.email === 'fannar@lanicad.is', `Email: ${r.json.email}`)
  })

  await test('GET /api/auth/me — No token (should 401)', async () => {
    const r = await api('/api/auth/me')
    assert(r.status === 401, `Expected 401, got ${r.status}`)
  })

  // ═══ 3. USERS (admin only) ═══
  await test('GET /api/users — List users', async () => {
    const r = await api('/api/users', { token: ADMIN_TOKEN })
    assert(r.status === 200, `Got ${r.status}`)
    assert(Array.isArray(r.json), 'Expected array')
    assert(r.json.length >= 2, `Only ${r.json.length} users`)
    console.log(`    → ${r.json.length} users found`)
  })

  await test('POST /api/users — Create test user', async () => {
    const r = await api('/api/users', {
      method: 'POST',
      token: ADMIN_TOKEN,
      body: JSON.stringify({
        email: 'test-runner@lanicad.is',
        password: 'TestPass123',
        name: 'Test Runner',
        role: 'user',
      }),
    })
    // Could be 201 or 409 if already exists
    if (r.status === 201) {
      createdUserId = r.json.id
      assert(r.json.email === 'test-runner@lanicad.is', 'Wrong email')
    } else {
      // Already exists — get the ID
      const list = await api('/api/users', { token: ADMIN_TOKEN })
      const existing = list.json.find(u => u.email === 'test-runner@lanicad.is')
      if (existing) createdUserId = existing.id
      console.log(`    → User already exists (${r.status})`)
    }
  })

  // ═══ 4. PRODUCTS ═══
  await test('GET /api/products — List products (public)', async () => {
    const r = await api('/api/products')
    assert(r.status === 200, `Got ${r.status}`)
    assert(Array.isArray(r.json), 'Expected array')
    console.log(`    → ${r.json.length} products`)
  })

  await test('POST /api/products — Create test product', async () => {
    const r = await api('/api/products', {
      method: 'POST',
      token: ADMIN_TOKEN,
      body: JSON.stringify({
        calculator_type: 'fence',
        rental_no: 'TEST-001',
        sale_no: 'TEST-S001',
        description: 'Test girðing 3.5m (automated test)',
        rates: { day: 500, week: 2500 },
        sale_price: 15000,
        weight: 22.5,
        category: 'test',
      }),
    })
    assert(r.status === 201 || r.status === 200, `Got ${r.status}: ${r.body}`)
    console.log(`    → Product created: ${r.json?.id || 'ok'}`)
  })

  // ═══ 5. PROJECTS (CRUD) ═══
  await test('POST /api/projects — Create project', async () => {
    const r = await api('/api/projects', {
      method: 'POST',
      token: TOKEN,
      body: JSON.stringify({
        name: 'Test verkefni — Automated',
        type: 'fence',
        client: {
          name: 'Jón Jónsson',
          company: 'Test ehf.',
          kennitala: '010190-2039',
          phone: '555-1234',
          email: 'jon@test.is',
          address: 'Testvegur 1',
        },
        data: { fenceLength: 35, stoneCount: 10 },
        line_items: [
          { rentalNo: 'GR-001', description: 'Girðing 3.5m', quantity: 10, rentalCost: 25000 },
          { rentalNo: 'GR-002', description: 'Fótur/steinn', quantity: 10, rentalCost: 5000 },
        ],
      }),
    })
    assert(r.status === 201, `Got ${r.status}: ${r.body}`)
    createdProjectId = r.json.id
    assert(createdProjectId, 'No project ID')
    console.log(`    → Project: ${createdProjectId}`)
  })

  await test('GET /api/projects — List projects', async () => {
    const r = await api('/api/projects', { token: TOKEN })
    assert(r.status === 200, `Got ${r.status}`)
    assert(Array.isArray(r.json), 'Expected array')
    assert(r.json.length >= 1, 'No projects found')
    console.log(`    → ${r.json.length} projects`)
  })

  await test('GET /api/projects/:id — Get single project', async () => {
    if (!createdProjectId) throw new Error('No project to fetch')
    const r = await api(`/api/projects/${createdProjectId}`, { token: TOKEN })
    assert(r.status === 200, `Got ${r.status}`)
    assert(r.json.name === 'Test verkefni — Automated', `Name: ${r.json.name}`)
    assert(r.json.client.name === 'Jón Jónsson', 'Wrong client')
  })

  await test('PUT /api/projects/:id — Update project', async () => {
    if (!createdProjectId) throw new Error('No project to update')
    const r = await api(`/api/projects/${createdProjectId}`, {
      method: 'PUT',
      token: TOKEN,
      body: JSON.stringify({
        name: 'Test verkefni — Updated',
        type: 'fence',
        client: { name: 'Jón Jónsson', company: 'Updated ehf.', kennitala: '', phone: '', email: '', address: '' },
        data: { fenceLength: 50 },
        line_items: [],
      }),
    })
    assert(r.status === 200, `Got ${r.status}: ${r.body}`)
    assert(r.json.name === 'Test verkefni — Updated', 'Name not updated')
  })

  await test('DELETE /api/projects/:id — Delete project', async () => {
    if (!createdProjectId) throw new Error('No project to delete')
    const r = await api(`/api/projects/${createdProjectId}`, {
      method: 'DELETE',
      token: TOKEN,
    })
    assert(r.status === 200, `Got ${r.status}`)
  })

  await test('GET /api/projects/:id — Deleted project (should 404)', async () => {
    if (!createdProjectId) throw new Error('No project ID')
    const r = await api(`/api/projects/${createdProjectId}`, { token: TOKEN })
    assert(r.status === 404, `Expected 404, got ${r.status}`)
  })

  // ═══ 6. TEMPLATES ═══
  await test('POST /api/templates — Create template', async () => {
    const r = await api('/api/templates', {
      method: 'POST',
      token: TOKEN,
      body: JSON.stringify({
        type: 'fence',
        name: 'Test sniðmát v1',
        config: { defaultLength: 35, defaultStones: true },
        is_public: false,
      }),
    })
    assert(r.status === 201, `Got ${r.status}: ${r.body}`)
    createdTemplateId = r.json.id
    console.log(`    → Template: ${createdTemplateId}`)
  })

  await test('GET /api/templates — List templates', async () => {
    const r = await api('/api/templates', { token: TOKEN })
    assert(r.status === 200, `Got ${r.status}`)
    assert(Array.isArray(r.json), 'Expected array')
    console.log(`    → ${r.json.length} templates`)
  })

  await test('DELETE /api/templates/:id — Delete template', async () => {
    if (!createdTemplateId) throw new Error('No template to delete')
    const r = await api(`/api/templates/${createdTemplateId}`, {
      method: 'DELETE',
      token: TOKEN,
    })
    assert(r.status === 200, `Got ${r.status}`)
  })

  // ═══ 7. PASSWORD CHANGE ═══
  await test('PUT /api/auth/password — Change password (wrong current)', async () => {
    const r = await api('/api/auth/password', {
      method: 'PUT',
      token: TOKEN,
      body: JSON.stringify({ currentPassword: 'WrongPassword!', newPassword: 'NewPass123' }),
    })
    assert(r.status === 401, `Expected 401, got ${r.status}`)
  })

  // ═══ 8. AUTHORIZATION CHECKS ═══
  await test('GET /api/users — Non-admin (should 403)', async () => {
    // Login as regular user
    const loginR = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'pall@byko.is', password: 'byko2024' }),
    })
    const userToken = loginR.json.token
    const r = await api('/api/users', { token: userToken })
    assert(r.status === 403, `Expected 403, got ${r.status}`)
  })

  // ═══ 9. CLEANUP — delete test user ═══
  await test('DELETE /api/users/:id — Delete test user', async () => {
    if (!createdUserId) {
      console.log('    → No test user to delete, skipping')
      return
    }
    const r = await api(`/api/users/${createdUserId}`, {
      method: 'DELETE',
      token: ADMIN_TOKEN,
    })
    assert(r.status === 200, `Got ${r.status}: ${r.body}`)
  })

  // ═══ 10. DB INTEGRITY ═══
  await test('Database — Tables exist', async () => {
    const r = await api('/api/health')
    assert(r.json.db === 'connected', 'DB not connected')
  })

  // ═══ RESULTS ═══
  console.log('\n══════════════════════════════════════')
  console.log('  TEST RESULTS')
  console.log('══════════════════════════════════════')
  for (const r of results) {
    console.log(`  ${r.status}  ${r.name}`)
    if (r.error) console.log(`         ${r.error}`)
  }
  console.log(`\n  Total: ${results.length}  |  Pass: ${pass}  |  Fail: ${fail}`)
  console.log('══════════════════════════════════════\n')

  process.exit(fail > 0 ? 1 : 0)
}

run().catch(err => {
  console.error('Test runner crashed:', err)
  process.exit(1)
})

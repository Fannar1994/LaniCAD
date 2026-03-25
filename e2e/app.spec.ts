import { test, expect, type Page } from '@playwright/test'

/** Helper: log in with offline admin credentials */
async function login(page: Page) {
  await page.goto('/')
  await page.getByLabel('Netfang').fill('admin@lanicad.is')
  await page.getByLabel('Lykilorð').fill('admin123')
  await page.getByRole('button', { name: 'Innskrá' }).click()
  // Wait for navigation away from login page (dashboard loads)
  await expect(page.getByLabel('Netfang')).not.toBeVisible({ timeout: 15_000 })
}

// ───────────────────────── Auth ─────────────────────────

test.describe('Authentication', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByLabel('Netfang')).toBeVisible()
  })

  test('shows error for wrong credentials', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Netfang').fill('wrong@test.is')
    await page.getByLabel('Lykilorð').fill('wrongpass')
    await page.getByRole('button', { name: 'Innskrá' }).click()
    await expect(page.locator('text=Rangt netfang eða lykilorð')).toBeVisible({ timeout: 10_000 })
  })

  test('logs in with offline admin and reaches dashboard', async ({ page }) => {
    await login(page)
    // Should be on the dashboard (root)
    await expect(page).toHaveURL(/\/$/)
  })

  test('logs out and returns to login', async ({ page }) => {
    await login(page)
    // Open user dropdown, then click Útskrá
    await page.locator('button:has(svg.lucide-chevron-down)').click()
    await page.getByRole('button', { name: 'Útskrá' }).click()
    await expect(page.getByLabel('Netfang')).toBeVisible()
  })
})

// ───────────────────────── Navigation ─────────────────────────

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('dashboard loads with quick-link cards', async ({ page }) => {
    // Dashboard should show calculator links
    await expect(page.locator('a[href*="calculator"]').first()).toBeVisible()
  })

  test('can navigate to each calculator', async ({ page }) => {
    const calculators = ['fence', 'scaffolding', 'formwork', 'rolling', 'ceiling']
    for (const calc of calculators) {
      await page.goto(`calculator/${calc}`)
      // Each calculator page should have an export button section
      await expect(page.locator('button, [role="button"]').first()).toBeVisible({ timeout: 10_000 })
    }
  })

  test('settings page loads', async ({ page }) => {
    await page.goto('settings')
    await expect(page.locator('text=Almennt')).toBeVisible({ timeout: 10_000 })
  })

  test('projects page loads', async ({ page }) => {
    await page.goto('projects')
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 })
  })

  test('drawing page loads', async ({ page }) => {
    await page.goto('drawing')
    await expect(page.locator('canvas, svg').first()).toBeVisible({ timeout: 15_000 })
  })
})

// ───────────────────────── Fence Calculator ─────────────────────────

test.describe('Fence Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('calculator/fence')
    await page.waitForLoadState('networkidle')
  })

  test('displays fence type selector', async ({ page }) => {
    // Fence types are shown as clickable buttons (e.g. "Girðing 3,5×2m")
    await expect(page.locator('text=Tegund girðingar')).toBeVisible()
  })

  test('shows total length input', async ({ page }) => {
    const lengthInput = page.locator('input[type="number"]').first()
    await expect(lengthInput).toBeVisible()
  })

  test('calculates rental cost when inputs change', async ({ page }) => {
    // Fill in a total length
    const lengthInput = page.locator('input[type="number"]').first()
    await lengthInput.fill('200')
    // Should show formatted ISK amounts somewhere on the page
    await expect(page.locator('text=/\\d+\\.\\d+.*kr/i').first()).toBeVisible({ timeout: 5_000 })
  })

  test('PDF export button is present', async ({ page }) => {
    await expect(page.locator('button:has-text("PDF")')).toBeVisible()
  })

  test('Excel export button is present', async ({ page }) => {
    await expect(page.locator('button:has-text("Excel")')).toBeVisible()
  })
})

// ───────────────────────── Scaffolding Calculator ─────────────────────────

test.describe('Scaffolding Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('calculator/scaffolding')
    await page.waitForLoadState('networkidle')
  })

  test('loads with input controls', async ({ page }) => {
    await expect(page.locator('input[type="number"]').first()).toBeVisible()
  })

  test('shows export buttons', async ({ page }) => {
    await expect(page.locator('button:has-text("PDF")')).toBeVisible()
    await expect(page.locator('button:has-text("Excel")')).toBeVisible()
  })
})

// ───────────────────────── Formwork Calculator ─────────────────────────

test.describe('Formwork Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('calculator/formwork')
    await page.waitForLoadState('networkidle')
  })

  test('loads with mode selector', async ({ page }) => {
    // Formwork has tabs/buttons for different systems (Rasto, Manto, etc.)
    await expect(page.locator('button, [role="tab"]').first()).toBeVisible()
  })

  test('shows export buttons', async ({ page }) => {
    await expect(page.locator('button:has-text("PDF")')).toBeVisible()
  })
})

// ───────────────────────── Rolling Scaffold Calculator ─────────────────────────

test.describe('Rolling Scaffold Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('calculator/rolling')
    await page.waitForLoadState('networkidle')
  })

  test('loads with height options', async ({ page }) => {
    // Should have selectable heights or input
    await expect(page.locator('select, input[type="number"], [role="combobox"]').first()).toBeVisible()
  })

  test('shows export buttons', async ({ page }) => {
    await expect(page.locator('button:has-text("PDF")')).toBeVisible()
  })
})

// ───────────────────────── Ceiling Props Calculator ─────────────────────────

test.describe('Ceiling Props Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('calculator/ceiling')
    await page.waitForLoadState('networkidle')
  })

  test('loads with input controls', async ({ page }) => {
    await expect(page.locator('input[type="number"]').first()).toBeVisible()
  })

  test('shows export buttons', async ({ page }) => {
    await expect(page.locator('button:has-text("PDF")')).toBeVisible()
  })
})

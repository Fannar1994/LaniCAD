// ── Product Catalog Sync ──
// Syncs hardcoded local data files → PostgreSQL products table

import { FENCE_PRODUCTS } from '@/data/fence'
import { SCAFFOLD_ITEMS } from '@/data/scaffolding'
import {
  HM01, HM02, KM01, LM02,
  HM21, KM21, LM22, AH21,
  LM81, LM51, LM71,
} from '@/data/formwork'
import {
  NARROW_PRICING, WIDE_PRICING, QUICKLY_PRICING,
  NARROW_COMPONENTS, WIDE_COMPONENTS, QUICKLY_COMPONENTS,
} from '@/data/rolling-scaffold'
import { LOFTASTODIR, MOTABITAR, AUKAHLUTIR } from '@/data/ceiling-props'
import { upsertProduct, fetchProducts, type DbProduct } from '@/lib/db'
import type { CalculatorType } from '@/types'

interface SyncResult {
  uploaded: number
  skipped: number
  errors: string[]
}

/** Gather all local products into a flat array suitable for upserting */
function getLocalProducts(): Omit<DbProduct, 'id' | 'created_at' | 'updated_at'>[] {
  const products: Omit<DbProduct, 'id' | 'created_at' | 'updated_at'>[] = []

  // Fence products
  for (const p of Object.values(FENCE_PRODUCTS)) {
    const rateMap: Record<string, number> = {}
    p.rates.forEach((r, i) => { rateMap[`month_${i + 1}`] = r })
    products.push({
      calculator_type: 'fence' as CalculatorType,
      rental_no: p.rentalNo,
      sale_no: p.saleNo,
      description: p.description,
      category: 'Girðingar',
      rates: rateMap,
      sale_price: p.salePrice,
      weight: 0,
      image_url: '',
      active: true,
    })
  }

  // Scaffold items
  for (const s of SCAFFOLD_ITEMS) {
    products.push({
      calculator_type: 'scaffolding' as CalculatorType,
      rental_no: s.itemNo,
      sale_no: '',
      description: s.name,
      category: 'Vinnupallar',
      rates: { daily: s.dailyRate },
      sale_price: s.salePrice,
      weight: s.weight,
      image_url: '',
      active: true,
    })
  }

  // Formwork panels (Rasto, Takko, Manto, Alufort)
  const allPanels = [...HM01, ...HM02, ...KM01, ...LM02]
  for (const p of allPanels) {
    products.push({
      calculator_type: 'formwork' as CalculatorType,
      rental_no: p.id,
      sale_no: '',
      description: p.desc,
      category: 'Steypumót — Flekar',
      rates: { daily: p.dayRate, weekly: p.weekRate },
      sale_price: 0,
      weight: 0,
      image_url: '',
      active: true,
    })
  }

  // Formwork accessories
  const allAccessories = [...HM21, ...KM21, ...LM22, ...AH21]
  for (const a of allAccessories) {
    products.push({
      calculator_type: 'formwork' as CalculatorType,
      rental_no: a.id,
      sale_no: '',
      description: a.desc,
      category: `Steypumót — ${a.cat}`,
      rates: { daily: a.dayRate, weekly: a.weekRate },
      sale_price: 0,
      weight: 0,
      image_url: '',
      active: true,
    })
  }

  // Formwork ID frames
  for (const f of LM81) {
    products.push({
      calculator_type: 'formwork' as CalculatorType,
      rental_no: f.id,
      sale_no: '',
      description: f.desc,
      category: 'Steypumót — ID rammar',
      rates: { daily: f.dayRate, weekly: f.weekRate },
      sale_price: 0,
      weight: 0,
      image_url: '',
      active: true,
    })
  }

  // Formwork props
  for (const p of LM51) {
    products.push({
      calculator_type: 'formwork' as CalculatorType,
      rental_no: p.id,
      sale_no: '',
      description: p.desc,
      category: 'Steypumót — Stoðir',
      rates: { daily: p.dayRate, weekly: p.weekRate },
      sale_price: 0,
      weight: 0,
      image_url: '',
      active: true,
    })
  }

  // Formwork beams
  for (const b of LM71) {
    products.push({
      calculator_type: 'formwork' as CalculatorType,
      rental_no: b.id,
      sale_no: '',
      description: b.desc,
      category: 'Steypumót — Bitar',
      rates: { daily: b.dayRate, weekly: b.weekRate },
      sale_price: 0,
      weight: 0,
      image_url: '',
      active: true,
    })
  }

  // Rolling scaffold pricing entries
  const rollingPricingSets = [
    { pricing: NARROW_PRICING, prefix: 'Mjór' },
    { pricing: WIDE_PRICING, prefix: 'Breiður' },
  ]
  for (const { pricing, prefix } of rollingPricingSets) {
    for (const [height, rates] of Object.entries(pricing)) {
      products.push({
        calculator_type: 'mobile' as CalculatorType,
        rental_no: `HP-${prefix.toLowerCase()}-${height}m`,
        sale_no: '',
        description: `${prefix} hjóllapallur ${height}m`,
        category: 'Hjólapallar',
        rates: { '24h': rates['24h'], extra: rates.extra, week: rates.week },
        sale_price: 0,
        weight: 0,
        image_url: '',
        active: true,
      })
    }
  }

  // Quickly scaffold
  products.push({
    calculator_type: 'mobile' as CalculatorType,
    rental_no: 'HP-quickly-4.0m',
    sale_no: '',
    description: 'Quickly hjóllapallur 4.0m',
    category: 'Hjólapallar',
    rates: { '24h': QUICKLY_PRICING['24h'], extra: QUICKLY_PRICING.extra, week: QUICKLY_PRICING.week },
    sale_price: 0,
    weight: 0,
    image_url: '',
    active: true,
  })

  // Rolling scaffold components
  const allComponents = [...NARROW_COMPONENTS, ...WIDE_COMPONENTS, ...QUICKLY_COMPONENTS]
  const seenComponentNos = new Set<string>()
  for (const c of allComponents) {
    if (seenComponentNos.has(c.itemNo)) continue
    seenComponentNos.add(c.itemNo)
    products.push({
      calculator_type: 'mobile' as CalculatorType,
      rental_no: c.itemNo,
      sale_no: '',
      description: c.name,
      category: 'Hjólapallar — Hlutir',
      rates: { weekly: c.weekPrice },
      sale_price: 0,
      weight: 0,
      image_url: '',
      active: true,
    })
  }

  // Ceiling props (Loftastoðir)
  for (const p of LOFTASTODIR) {
    products.push({
      calculator_type: 'ceiling' as CalculatorType,
      rental_no: p.id,
      sale_no: p.articleNumber,
      description: p.name,
      category: `Loftastoðir — ${p.classLabel}`,
      rates: { daily: p.dayRate, weekly: p.weekRate },
      sale_price: p.salePrice,
      weight: p.weight_kg,
      image_url: '',
      active: true,
    })
  }

  // HT-20 Beams (Mótabitar)
  for (const b of MOTABITAR) {
    products.push({
      calculator_type: 'ceiling' as CalculatorType,
      rental_no: b.id,
      sale_no: b.articleNumber,
      description: b.name,
      category: 'Loftastoðir — Mótabitar',
      rates: { daily: b.dayRate, weekly: b.weekRate },
      sale_price: b.salePrice,
      weight: b.weight_kg,
      image_url: '',
      active: true,
    })
  }

  // Ceiling prop accessories (Aukahlutir)
  for (const a of AUKAHLUTIR) {
    products.push({
      calculator_type: 'ceiling' as CalculatorType,
      rental_no: a.id,
      sale_no: '',
      description: a.name,
      category: 'Loftastoðir — Aukahlutir',
      rates: { daily: a.dayRate, weekly: a.weekRate },
      sale_price: a.salePrice,
      weight: a.weight_kg,
      image_url: '',
      active: true,
    })
  }

  return products
}

/** Sync local product data to the PostgreSQL database */
export async function syncCatalogToDb(): Promise<SyncResult> {
  const local = getLocalProducts()
  const result: SyncResult = { uploaded: 0, skipped: 0, errors: [] }

  // Fetch existing to avoid duplicates by rental_no
  let existing: DbProduct[] = []
  try {
    existing = await fetchProducts()
  } catch {
    // If API is not available, every upsert will fail — that's fine, errors will be collected
  }
  const existingByRentalNo = new Set(existing.map(p => p.rental_no))

  for (const product of local) {
    if (existingByRentalNo.has(product.rental_no)) {
      result.skipped++
      continue
    }
    try {
      await upsertProduct(product)
      result.uploaded++
    } catch (err) {
      result.errors.push(`${product.rental_no}: ${err instanceof Error ? err.message : 'Villa'}`)
    }
  }

  return result
}

/** Get count of local products that could be synced */
export function getLocalProductCount(): number {
  return getLocalProducts().length
}

// ── Product Catalog Sync ──
// Syncs hardcoded local data files → PostgreSQL products table

import { FENCE_PRODUCTS } from '@/data/fence'
import { SCAFFOLD_ITEMS } from '@/data/scaffolding'
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

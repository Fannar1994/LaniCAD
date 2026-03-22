/**
 * LániCAD — Comprehensive Calculator Test Suite
 * Tests all 5 calculator modules: fence, scaffolding, formwork, rolling scaffold, ceiling props
 * Plus geometry, formatting, and date utilities
 */
import { describe, it, expect } from 'vitest'

// Rental formulas
import {
  calcStandardRental,
  calcFenceRental,
  calcRollingRental,
  calcScaffoldingRental,
} from '../rental'

// Geometry
import {
  calcFenceGeometry,
  calculateLevelsFromHeight,
  calculateFacadeMaterials,
  calculateRacks,
  calculateAccessoryGrids,
} from '../geometry'

// Formwork
import {
  packPanels,
  calculateModeA,
  calculateModeB,
  calculateModeC,
  calcFormworkTotal,
  calcFormworkItemCost,
} from '../formwork'

// Product data
import { FENCE_PRODUCTS, FENCE_TYPES } from '@/data/fence'
import { SCAFFOLD_ITEMS } from '@/data/scaffolding'
import { NARROW_PRICING, WIDE_PRICING, QUICKLY_PRICING, SUPPORT_LEGS_PRICING } from '@/data/rolling-scaffold'
import { LOFTASTODIR, MOTABITAR } from '@/data/ceiling-props'
import { HM01, TIE_BAR_OPTIONS } from '@/data/formwork'

// Formatting and utilities
import { formatKr, formatKennitala, daysBetween, formatDate, formatNumber } from '@/lib/format'


// ═══════════════════════════════════════════════════
// 1. STANDARD RENTAL (formwork, ceiling props, beams)
// ═══════════════════════════════════════════════════
describe('calcStandardRental', () => {
  it('calculates day rate for < 7 days', () => {
    // 5 days × 100 kr/day × 3 qty = 1500
    expect(calcStandardRental(100, 500, 5, 3)).toBe(1500)
  })

  it('uses day rate for exactly 1 day', () => {
    expect(calcStandardRental(50, 200, 1, 10)).toBe(500)
  })

  it('uses day rate for exactly 6 days', () => {
    // 6 × 16 × 10 = 960
    expect(calcStandardRental(16, 60, 6, 10)).toBe(960)
  })

  it('switches to week rate at exactly 7 days', () => {
    // ceil(7/7) = 1 week × 500 × 3 = 1500
    expect(calcStandardRental(100, 500, 7, 3)).toBe(1500)
  })

  it('handles partial weeks (10 days = ceil(10/7)=2 weeks)', () => {
    // 2 weeks × 500 × 3 = 3000
    expect(calcStandardRental(100, 500, 10, 3)).toBe(3000)
  })

  it('handles exactly 14 days (2 full weeks)', () => {
    // ceil(14/7) = 2 × 500 × 1 = 1000
    expect(calcStandardRental(100, 500, 14, 1)).toBe(1000)
  })

  it('handles 21 days (3 full weeks)', () => {
    // ceil(21/7) = 3 × 200 × 5 = 3000
    expect(calcStandardRental(50, 200, 21, 5)).toBe(3000)
  })

  it('handles zero quantity', () => {
    expect(calcStandardRental(100, 500, 14, 0)).toBe(0)
  })

  // Real product test: Loftastoðir 1,6–2,9M (Galv.) ceiling prop
  it('ceiling prop 1.6-2.9M Galv: 14 days × 10 qty', () => {
    const prop = LOFTASTODIR[3] // dayRate: 20, weekRate: 140
    // 14 days → ceil(14/7) = 2 weeks × 140 × 10 = 2800
    expect(calcStandardRental(prop.dayRate, prop.weekRate, 14, 10)).toBe(2800)
  })

  it('ceiling prop 1.6-2.9M Galv: 5 days × 10 qty', () => {
    const prop = LOFTASTODIR[3] // dayRate: 20
    // 5 × 20 × 10 = 1000
    expect(calcStandardRental(prop.dayRate, prop.weekRate, 5, 10)).toBe(1000)
  })
})


// ═══════════════════════════════════════════════════
// 2. FENCE RENTAL (12-tier monthly declining rates)
// ═══════════════════════════════════════════════════
describe('calcFenceRental', () => {
  const standardRates = FENCE_PRODUCTS['fence-3500x2000x1.1'].rates
  // rates = [100, 50, 25, 13, 13, 13, 13, 13, 13, 13, 13, 13]

  it('enforces minimum 10 rental days', () => {
    // 5 days requested → still uses 10 days
    // 10 days × rate[0]=100 × 1 qty = 1000
    expect(calcFenceRental(5, standardRates, 1)).toBe(1000)
  })

  it('exact minimum 10 days', () => {
    expect(calcFenceRental(10, standardRates, 1)).toBe(1000)
  })

  it('30 days = 1 full period at tier 1', () => {
    // 30 × 100 × 1 = 3000
    expect(calcFenceRental(30, standardRates, 1)).toBe(3000)
  })

  it('31 days = 30 at tier 1 + 1 at tier 2', () => {
    // 30 × 100 + 1 × 50 = 3050
    expect(calcFenceRental(31, standardRates, 1)).toBe(3050)
  })

  it('60 days = 30 at tier 1 + 30 at tier 2', () => {
    // 30 × 100 + 30 × 50 = 4500
    expect(calcFenceRental(60, standardRates, 1)).toBe(4500)
  })

  it('90 days = tiers 1-3', () => {
    // 30 × 100 + 30 × 50 + 30 × 25 = 5250
    expect(calcFenceRental(90, standardRates, 1)).toBe(5250)
  })

  it('120 days = tiers 1-4', () => {
    // 30×100 + 30×50 + 30×25 + 30×13 = 5640
    expect(calcFenceRental(120, standardRates, 1)).toBe(5640)
  })

  it('multiplies by quantity', () => {
    // 30 × 100 × 5 = 15000
    expect(calcFenceRental(30, standardRates, 5)).toBe(15000)
  })

  it('360 days = all 12 tiers', () => {
    // 30×100 + 30×50 + 30×25 + 9×30×13 = 3000+1500+750+3510 = 8760
    const expected = 30 * 100 + 30 * 50 + 30 * 25 + 9 * 30 * 13
    expect(calcFenceRental(360, standardRates, 1)).toBe(expected)
  })

  it('plastic fence: different rates', () => {
    const plasticRates = FENCE_PRODUCTS['plastic-fence'].rates
    // rates = [80, 40, 20, 10, 10, 10, 10, 10, 10, 10, 10, 10]
    // 60 days: 30×80 + 30×40 = 3600
    expect(calcFenceRental(60, plasticRates, 1)).toBe(3600)
  })

  it('heavy fence: 365 days × 10 panels', () => {
    const heavyRates = FENCE_PRODUCTS['fence-3500x2000x1.7'].rates
    // rates = [100, 50, 25, 13, 13, 13, 13, 13, 13, 13, 13, 13]
    // tiers: 30×100 + 30×50 + 30×25 + 9×30×13 = 3000+1500+750+3510 = 8760
    // But 365 days = 12 full periods (360) + 5 extra days (ignored - max 12 tiers)
    // So 360 days used, remaining 5 days lost
    const expected12Tiers = 30 * 100 + 30 * 50 + 30 * 25 + 9 * 30 * 13
    expect(calcFenceRental(365, heavyRates, 10)).toBe(expected12Tiers * 10)
  })
})


// ═══════════════════════════════════════════════════
// 3. ROLLING SCAFFOLD RENTAL (24h / extra / weekly)
// ═══════════════════════════════════════════════════
describe('calcRollingRental', () => {
  // Narrow 4.5m: { '24h': 7620, extra: 3810, week: 19051 }
  const narrow45 = NARROW_PRICING['4.5']

  it('1 day = 24h price', () => {
    expect(calcRollingRental(1, narrow45)).toBe(7620)
  })

  it('2 days = 24h + 1 extra', () => {
    // 7620 + 3810 = 11430
    expect(calcRollingRental(2, narrow45)).toBe(11430)
  })

  it('3 days = 24h + 2 extra', () => {
    // 7620 + 2 × 3810 = 15240
    expect(calcRollingRental(3, narrow45)).toBe(15240)
  })

  it('6 days = 24h + 5 extra', () => {
    // 7620 + 5 × 3810 = 26670
    expect(calcRollingRental(6, narrow45)).toBe(26670)
  })

  it('7 days = 1 week price', () => {
    // floor(7/7) = 1 week, 0 extra → 19051
    expect(calcRollingRental(7, narrow45)).toBe(19051)
  })

  it('8 days = 1 week + 1 extra day (24h rate)', () => {
    // 19051 + 7620 = 26671
    expect(calcRollingRental(8, narrow45)).toBe(26671)
  })

  it('14 days = 2 weeks', () => {
    // 2 × 19051 = 38102
    expect(calcRollingRental(14, narrow45)).toBe(38102)
  })

  it('10 days = 1 week + 3 extra days', () => {
    // 19051 + 3 × 7620 = 41911
    expect(calcRollingRental(10, narrow45)).toBe(41911)
  })

  it('wide 6.5m: 5 days', () => {
    const wide65 = WIDE_PRICING['6.5']
    // 12157 + 4 × 6079 = 36473
    expect(calcRollingRental(5, wide65)).toBe(36473)
  })

  it('quickly scaffold: 7 days', () => {
    // week: 10206
    expect(calcRollingRental(7, QUICKLY_PRICING)).toBe(10206)
  })

  it('support legs: 3 days', () => {
    // 453 + 2 × 227 = 907
    expect(calcRollingRental(3, SUPPORT_LEGS_PRICING)).toBe(907)
  })
})


// ═══════════════════════════════════════════════════
// 4. SCAFFOLDING RENTAL (daily rate × days × qty)
// ═══════════════════════════════════════════════════
describe('calcScaffoldingRental', () => {
  it('basic calculation', () => {
    // 19 kr/day × 30 days × 22 frames = 12540
    expect(calcScaffoldingRental(19, 30, 22)).toBe(12540)
  })

  it('2m frames: 60 days × 44 qty', () => {
    const frame2m = SCAFFOLD_ITEMS[0] // dailyRate: 19
    expect(calcScaffoldingRental(frame2m.dailyRate, 60, 44)).toBe(50160)
  })

  it('floor boards: 30 days × 48 qty', () => {
    const floorBoard = SCAFFOLD_ITEMS[3] // dailyRate: 12
    expect(calcScaffoldingRental(floorBoard.dailyRate, 30, 48)).toBe(17280)
  })

  it('zero days = 0', () => {
    expect(calcScaffoldingRental(19, 0, 22)).toBe(0)
  })

  it('zero qty = 0', () => {
    expect(calcScaffoldingRental(19, 30, 0)).toBe(0)
  })
})


// ═══════════════════════════════════════════════════
// 5. FENCE GEOMETRY
// ═══════════════════════════════════════════════════
describe('calcFenceGeometry', () => {
  it('100m with 3.5m panels', () => {
    const g = calcFenceGeometry(100, 3.5)
    // ceil(100/3.5) = ceil(28.57) = 29 panels
    expect(g.panels).toBe(29)
    expect(g.stones).toBe(30) // panels + 1
    expect(g.clamps).toBe(28) // panels - 1
  })

  it('exactly divisible: 35m / 3.5m', () => {
    const g = calcFenceGeometry(35, 3.5)
    expect(g.panels).toBe(10)
    expect(g.stones).toBe(11)
    expect(g.clamps).toBe(9)
  })

  it('small fence: 5m / 2.5m', () => {
    const g = calcFenceGeometry(5, 2.5)
    expect(g.panels).toBe(2)
    expect(g.stones).toBe(3)
    expect(g.clamps).toBe(1)
  })

  it('single panel: 2m / 3.5m', () => {
    const g = calcFenceGeometry(2, 3.5)
    expect(g.panels).toBe(1)
    expect(g.stones).toBe(2)
    expect(g.clamps).toBe(0) // max(0, 0) = 0
  })

  it('plastic fence: 50m / 2.1m', () => {
    const g = calcFenceGeometry(50, 2.1)
    // ceil(50/2.1) = ceil(23.81) = 24
    expect(g.panels).toBe(24)
    expect(g.stones).toBe(25)
    expect(g.clamps).toBe(23)
  })

  it('queue barrier: 25m / 2.5m', () => {
    const g = calcFenceGeometry(25, 2.5)
    expect(g.panels).toBe(10)
    expect(g.stones).toBe(11)
    expect(g.clamps).toBe(9)
  })
})


// ═══════════════════════════════════════════════════
// 6. SCAFFOLDING LEVELS FROM HEIGHT
// ═══════════════════════════════════════════════════
describe('calculateLevelsFromHeight', () => {
  it('returns valid structure', () => {
    const result = calculateLevelsFromHeight(8)
    expect(result).toHaveProperty('levels2m')
    expect(result).toHaveProperty('levels07m')
    expect(result).toHaveProperty('legType')
    expect(result).toHaveProperty('actualHeight')
    expect(result).toHaveProperty('legs50cm')
    expect(result).toHaveProperty('legs100cm')
    expect(['50cm', '100cm']).toContain(result.legType)
  })

  it('8m target: should use 3 × 2m + 2 × 0.7m levels', () => {
    const result = calculateLevelsFromHeight(8)
    // h = l2×2 + l07×0.7 + leg.actual (NO +2.0)
    // 3×2 + 2×0.7 + 0.69 = 8.09 (diff 0.09 + 0.02 pen = 0.11, better than 4×2+0+0.34=8.34 diff 0.34)
    expect(result.levels2m).toBe(3)
    expect(result.levels07m).toBe(2)
    expect(result.legType).toBe('100cm')
    expect(result.actualHeight).toBeCloseTo(8.09, 1)
  })

  it('4m target: optimizer finds optimal combo', () => {
    const result = calculateLevelsFromHeight(4)
    // 2×2m + 0×0.7m + 0.34 = 4.34 (diff 0.34)
    // 1×2m + 2×0.7m + 0.69 = 4.09 (diff 0.09 + 0.02 pen = 0.11)
    expect(result.levels2m).toBe(1)
    expect(result.levels07m).toBe(2)
    expect(result.legType).toBe('100cm')
    expect(result.actualHeight).toBeCloseTo(4.09, 1)
  })

  it('12m target: ~6 levels', () => {
    const result = calculateLevelsFromHeight(12)
    const expectedApprox = result.levels2m * 2 + result.levels07m * 0.7
    expect(expectedApprox).toBeGreaterThanOrEqual(10)
    expect(result.actualHeight).toBeGreaterThan(11)
    expect(result.actualHeight).toBeLessThan(13)
  })

  it('actual height formula is correct (no +2.0)', () => {
    const result = calculateLevelsFromHeight(10)
    const legActual = result.legType === '50cm' ? 0.34 : 0.69
    const computed = result.levels2m * 2 + result.levels07m * 0.7 + legActual
    expect(result.actualHeight).toBeCloseTo(computed, 5)
  })

  it('min height constraint: height >= target - 0.2', () => {
    const result = calculateLevelsFromHeight(6)
    expect(result.actualHeight).toBeGreaterThanOrEqual(5.8)
  })
})


// ═══════════════════════════════════════════════════
// 7. FACADE MATERIALS CALCULATION
// ═══════════════════════════════════════════════════
describe('calculateFacadeMaterials', () => {
  it('20m facade, 3 levels 2m, 0 levels 0.7m, 2 endcaps, first facade', () => {
    const mats = calculateFacadeMaterials(20, 3, 0, 2, true)
    // bays = ceil(20/1.8) = 12, framesPerLevel = bays + 1 = 13
    // pairedLevels = min(3, 0) = 0, onlyLevels2m = 3

    expect(mats['Rammar 2,0m']).toBe(13 * 3) // 39
    expect(mats['Rammar 0,7m']).toBe(0)
    expect(mats['Stigapallar 1,8m']).toBe(3) // isFirst: stairBoards = levels2m
    expect(mats['Stigar 2,7m']).toBe(0) // pairedLevels = 0
    expect(mats['Stigar 2,0m']).toBe(3) // onlyLevels2m = 3
    expect(mats['Gólfborð 1,8m']).toBe(3 * 2 * 12 - 3) // 72 - 3 = 69
    expect(mats['Tvöföld handrið']).toBe((3 + 1) * 12) // 48
    expect(mats['Handriðastoðir']).toBe(13 + 2) // bays+1 + endcaps
    expect(mats['Veggfestingar 50cm']).toBe(11) // all anchors go to 50cm
    expect(mats['Klemmur']).toBe(11) // same as anchors
    expect(mats['Endalokur']).toBe(2 * 3 * 2) // 12
    expect(mats['Splitti']).toBe((13 * 3 + 13 * 0) * 2) // 78
    expect(mats['LEGS_TOTAL']).toBe(13 * 2) // 26
  })

  it('second facade: no stairs', () => {
    const mats = calculateFacadeMaterials(20, 3, 0, 0, false)
    const bays = Math.ceil(20 / 1.8)

    expect(mats['Stigapallar 1,8m']).toBe(0)
    expect(mats['Stigar 2,0m']).toBe(0)
    expect(mats['Stigar 2,7m']).toBe(0)
    // No stair deduction
    expect(mats['Gólfborð 1,8m']).toBe(3 * 2 * bays)
  })

  it('paired levels: 2m + 0.7m → Stigar 2,7m', () => {
    // 3 levels 2m + 2 levels 0.7m → pairedLevels = 2, onlyLevels2m = 1
    const mats = calculateFacadeMaterials(20, 3, 2, 0, true)
    expect(mats['Stigar 2,7m']).toBe(2) // pairedLevels
    expect(mats['Stigar 2,0m']).toBe(1) // onlyLevels2m
  })

  it('1-level scaffold: no wall anchors', () => {
    const mats = calculateFacadeMaterials(10, 1, 0, 0, true)
    expect(mats['Veggfestingar 50cm']).toBe(0)
    expect(mats['Klemmur']).toBe(0)
  })

  it('multi-level scaffold: has wall anchors and klemmur', () => {
    const mats = calculateFacadeMaterials(20, 3, 0, 0, true)
    // wallHeight = 3*2 + 0*0.7 + 2.0 = 8.0
    // wallArea = 20 * 8 = 160
    // anchors = round(160/15) = round(10.67) = 11
    expect(mats['Veggfestingar 50cm']).toBe(11) // all anchors go to 50cm
    expect(mats['Klemmur']).toBe(11) // equal to anchors
  })

  it('with 0.7m levels', () => {
    const mats = calculateFacadeMaterials(10, 2, 1, 0, true)
    // bays = ceil(10/1.8) = 6, framesPerLevel = 7
    expect(mats['Rammar 2,0m']).toBe(7 * 2) // 14
    expect(mats['Rammar 0,7m']).toBe(7 * 1) // 7
    expect(mats['Splitti']).toBe((7 * 2 + 7 * 1) * 2) // 42
  })
})


// ═══════════════════════════════════════════════════
// 7b. RACK AND ACCESSORY GRID CALCULATIONS
// ═══════════════════════════════════════════════════
describe('calculateRacks', () => {
  it('calculates frame racks from 2m and 0.7m frames', () => {
    const combined: Record<string, number> = {
      'Rammar 2,0m': 39,
      'Rammar 0,7m': 7,
      'Gólfborð 1,8m': 69,
      'Stigapallar 1,8m': 3,
      'Tvöföld handrið': 48,
    }
    calculateRacks(combined)
    // frameSlots = 39*1 + 7*0.5 = 42.5 → ceil(42.5/50) = 1
    expect(combined['Rekkar fyrir ramma 50 stk.']).toBe(1)
    // boards = (69 + 3) / 40 = 1.8 → ceil = 2
    expect(combined['Rekkar fyrir gólf 40 stk.']).toBe(2)
    // handrails = 48/38 = 1.26 → ceil = 2
    expect(combined['Rekki f/tvöföld handrið 40 stk.']).toBe(2)
  })

  it('zero quantities produce zero racks', () => {
    const combined: Record<string, number> = {}
    calculateRacks(combined)
    expect(combined['Rekkar fyrir ramma 50 stk.']).toBe(0)
    expect(combined['Rekkar fyrir gólf 40 stk.']).toBe(0)
    expect(combined['Rekki f/tvöföld handrið 40 stk.']).toBe(0)
  })
})

describe('calculateAccessoryGrids', () => {
  it('calculates grids from small items', () => {
    const combined: Record<string, number> = {
      'Lappir 50cm': 26,
      'Lappir 100cm': 0,
      'Veggfestingar 50cm': 11,
      'Endalokur': 12,
      'Handriðastoðir': 15,
    }
    calculateAccessoryGrids(combined, true)
    // total = 26+0+11+0+12+0+15 = 64 → ceil(64/100) = 1, but max(1,1) = 1
    expect(combined['Fylgihlutagrind']).toBe(1)
  })

  it('no facades produces zero', () => {
    const combined: Record<string, number> = { 'Lappir 50cm': 26 }
    calculateAccessoryGrids(combined, false)
    expect(combined['Fylgihlutagrind']).toBe(0)
  })
})


// ═══════════════════════════════════════════════════
// 8. FORMWORK: Panel packing
// ═══════════════════════════════════════════════════
describe('packPanels (formwork)', () => {
  it('packs Rasto panels for a 12m wall', () => {
    const { used, gap } = packPanels(1200, HM01)
    const totalWidth = Array.from(used.entries()).reduce((sum, [id, count]) => {
      const p = HM01.find(x => x.id === id)
      return sum + (p ? p.w * count : 0)
    }, 0)
    // Should cover >= 1200cm with minimal gap
    expect(totalWidth).toBeGreaterThanOrEqual(1200 - 5) // allow small gap
    expect(gap).toBeLessThanOrEqual(5)
  })

  it('uses no corner or special panels', () => {
    const { used } = packPanels(500, HM01)
    for (const [id] of used) {
      const p = HM01.find(x => x.id === id)
      expect(p?.corner).toBeUndefined()
      expect(p?.special).toBeUndefined()
      expect(p?.mp).toBeFalsy()
    }
  })
})


// ═══════════════════════════════════════════════════
// 9. FORMWORK: Mode A (Rasto/Takko)
// ═══════════════════════════════════════════════════
describe('calculateModeA (Rasto/Takko)', () => {
  it('Rasto: 12m wall generates BoQ', () => {
    const result = calculateModeA(12, 'rasto', 0, 0, 0, TIE_BAR_OPTIONS[0].id)
    expect(result.modeLabel).toBe('RASTO (3 m)')
    expect(result.boq.length).toBeGreaterThan(0)
    // Should have panel items
    const panelItems = result.boq.filter(i => i.cat === 'Mótaflekar')
    expect(panelItems.length).toBeGreaterThan(0)
    // Panel quantities should be even (both sides)
    for (const item of panelItems) {
      expect(item.qty % 2).toBe(0)
    }
  })

  it('Takko: 12m wall generates BoQ', () => {
    const result = calculateModeA(12, 'takko', 0, 0, 0, TIE_BAR_OPTIONS[0].id)
    expect(result.modeLabel).toBe('TAKKO (1,2 m)')
    expect(result.boq.length).toBeGreaterThan(0)
  })

  it('Rasto with corners adds corner items', () => {
    const noCorners = calculateModeA(12, 'rasto', 0, 0, 0, TIE_BAR_OPTIONS[0].id)
    const withCorners = calculateModeA(12, 'rasto', 2, 2, 0, TIE_BAR_OPTIONS[0].id)
    expect(withCorners.boq.length).toBeGreaterThan(noCorners.boq.length)
    const cornerItems = withCorners.boq.filter(i => i.cat === 'Horn')
    expect(cornerItems.length).toBeGreaterThan(0)
  })

  it('open ends add end-stop items', () => {
    calculateModeA(12, 'rasto', 0, 0, 0, TIE_BAR_OPTIONS[0].id)
    const withEnds = calculateModeA(12, 'rasto', 0, 0, 2, TIE_BAR_OPTIONS[0].id)
    const endItems = withEnds.boq.filter(i => i.cat === 'Endar')
    expect(endItems.length).toBeGreaterThan(0)
  })

  it('all BoQ items have positive rates', () => {
    const result = calculateModeA(12, 'rasto', 1, 1, 1, TIE_BAR_OPTIONS[0].id)
    for (const item of result.boq) {
      expect(item.qty).toBeGreaterThan(0)
      expect(item.dayRate).toBeGreaterThanOrEqual(0)
      expect(item.weekRate).toBeGreaterThanOrEqual(0)
    }
  })
})


// ═══════════════════════════════════════════════════
// 10. FORMWORK: Mode B (Manto)
// ═══════════════════════════════════════════════════
describe('calculateModeB (Manto)', () => {
  it('300cm height: 12m wall generates BoQ', () => {
    const result = calculateModeB(12, 300, 0, 0, 0, TIE_BAR_OPTIONS[0].id)
    expect(result.modeLabel).toBe('MANTO (3.0 m)')
    expect(result.boq.length).toBeGreaterThan(0)
  })

  it('different heights produce different results', () => {
    const h120 = calculateModeB(12, 120, 0, 0, 0, TIE_BAR_OPTIONS[0].id)
    const h300 = calculateModeB(12, 300, 0, 0, 0, TIE_BAR_OPTIONS[0].id)
    // Labels differ
    expect(h120.modeLabel).toBe('MANTO (1.2 m)')
    expect(h300.modeLabel).toBe('MANTO (3.0 m)')
  })

  it('corners and ends add items', () => {
    const base = calculateModeB(12, 300, 0, 0, 0, TIE_BAR_OPTIONS[0].id)
    const full = calculateModeB(12, 300, 2, 2, 2, TIE_BAR_OPTIONS[0].id)
    expect(full.boq.length).toBeGreaterThan(base.boq.length)
  })
})


// ═══════════════════════════════════════════════════
// 11. FORMWORK: Mode C (Alufort Slab)
// ═══════════════════════════════════════════════════
describe('calculateModeC (Alufort Slab)', () => {
  it('6m × 5m × 2.8m slab generates panels + props + beams', () => {
    const result = calculateModeC(6, 5, 2.8, 0.2, 1.5, 1.5, false)
    expect(result.modeLabel).toBe('ALUFORT Loft')
    expect(result.boq.length).toBeGreaterThan(0)

    // Should have panels
    const panels = result.boq.filter(i => i.cat === 'Loftaflekar')
    expect(panels.length).toBeGreaterThan(0)

    // Should have props (not ID)
    const props = result.boq.filter(i => i.cat === 'Loftastoðir')
    expect(props.length).toBeGreaterThan(0)
  })

  it('with ID frames: uses ID-15 system', () => {
    const result = calculateModeC(6, 5, 2.8, 0.2, 1.5, 1.5, true)
    const idItems = result.boq.filter(i => i.cat === 'ID-Rammar' || i.cat === 'ID-Hlutir')
    expect(idItems.length).toBeGreaterThan(0)

    // Should NOT have regular props
    const regularProps = result.boq.filter(i => i.cat === 'Loftastoðir')
    expect(regularProps.length).toBe(0)
  })

  it('prop count matches grid', () => {
    const result = calculateModeC(6, 5, 2.8, 0.2, 1.5, 1.5, false)
    // propsL = floor(600/150) + 1 = 5
    // propsW = floor(500/150) + 1 = 4
    // total = 20
    const propItem = result.boq.find(i => i.cat === 'Loftastoðir')
    expect(propItem?.qty).toBe(20)
  })

  it('has beams, drop heads, and other accessories', () => {
    const result = calculateModeC(6, 5, 2.8, 0.2, 1.5, 1.5, false)
    const beams = result.boq.filter(i => i.cat === 'HT-20 Bitar')
    const dropHeads = result.boq.filter(i => i.cat === 'Hausar')
    expect(beams.length).toBeGreaterThan(0)
    expect(dropHeads.length).toBeGreaterThan(0)
  })
})


// ═══════════════════════════════════════════════════
// 12. FORMWORK: Total cost calculation
// ═══════════════════════════════════════════════════
describe('calcFormworkTotal / calcFormworkItemCost', () => {
  const sampleBoQ = [
    { id: 'A', desc: 'Panel A', qty: 10, dayRate: 50, weekRate: 200, cat: 'test' },
    { id: 'B', desc: 'Panel B', qty: 5, dayRate: 30, weekRate: 100, cat: 'test' },
  ]

  it('day rate for < 7 days', () => {
    // A: 50 × 5 × 10 = 2500, B: 30 × 5 × 5 = 750 → 3250
    expect(calcFormworkTotal(sampleBoQ, 5)).toBe(3250)
  })

  it('week rate for >= 7 days', () => {
    // A: 200 × 2 × 10 = 4000, B: 100 × 2 × 5 = 1000 → 5000
    expect(calcFormworkTotal(sampleBoQ, 14)).toBe(5000)
  })

  it('applies discount', () => {
    // 5000 × (1 - 10/100) = 4500
    expect(calcFormworkTotal(sampleBoQ, 14, 10)).toBe(4500)
  })

  it('100% discount = 0', () => {
    expect(calcFormworkTotal(sampleBoQ, 14, 100)).toBe(0)
  })

  it('single item cost', () => {
    const item = { id: 'A', desc: 'Panel A', qty: 10, dayRate: 50, weekRate: 200, cat: 'test' }
    // 5 days: 50 × 5 × 10 = 2500
    expect(calcFormworkItemCost(item, 5)).toBe(2500)
    // 14 days: 200 × 2 × 10 = 4000
    expect(calcFormworkItemCost(item, 14)).toBe(4000)
  })
})


// ═══════════════════════════════════════════════════
// 13. CEILING PROPS: Product data integrity
// ═══════════════════════════════════════════════════
describe('Ceiling props data', () => {
  it('all props have required fields', () => {
    for (const prop of LOFTASTODIR) {
      expect(prop.id).toBeTruthy()
      expect(prop.name).toBeTruthy()
      expect(prop.minHeight).toBeGreaterThan(0)
      expect(prop.maxHeight).toBeGreaterThan(prop.minHeight)
      expect(prop.dayRate).toBeGreaterThan(0)
      expect(prop.weekRate).toBeGreaterThan(prop.dayRate)
      expect(prop.salePrice).toBeGreaterThan(0)
    }
  })

  it('props cover range from 0.7m to 5.5m', () => {
    const minH = Math.min(...LOFTASTODIR.map(p => p.minHeight))
    const maxH = Math.max(...LOFTASTODIR.map(p => p.maxHeight))
    expect(minH).toBeLessThanOrEqual(0.7)
    expect(maxH).toBeGreaterThanOrEqual(5.0)
  })

  it('beams exist and have valid data', () => {
    expect(MOTABITAR.length).toBeGreaterThan(0)
    for (const beam of MOTABITAR) {
      expect(beam.length_m).toBeGreaterThan(0)
      expect(beam.dayRate).toBeGreaterThan(0)
    }
  })

  it('ceiling props rental calculation: 5 days, 20 props', () => {
    const prop = LOFTASTODIR[0] // 0.7-1.2M (Málað): day 16, week 112
    // 5 days × 16 × 20 = 1600
    expect(calcStandardRental(prop.dayRate, prop.weekRate, 5, 20)).toBe(1600)
  })

  it('ceiling props rental calculation: 14 days, 20 props', () => {
    const prop = LOFTASTODIR[0] // dayRate: 16, weekRate: 112
    // ceil(14/7) = 2 weeks × 112 × 20 = 4480
    expect(calcStandardRental(prop.dayRate, prop.weekRate, 14, 20)).toBe(4480)
  })
})


// ═══════════════════════════════════════════════════
// 14. PRODUCT DATA INTEGRITY
// ═══════════════════════════════════════════════════
describe('Product data integrity', () => {
  it('all fence products have 12 rate tiers', () => {
    for (const [, product] of Object.entries(FENCE_PRODUCTS)) {
      expect(product.rates).toHaveLength(12)
      for (const rate of product.rates) {
        expect(rate).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('fence rates are declining or constant', () => {
    for (const [, product] of Object.entries(FENCE_PRODUCTS)) {
      for (let i = 1; i < product.rates.length; i++) {
        expect(product.rates[i]).toBeLessThanOrEqual(product.rates[i - 1])
      }
    }
  })

  it('all fence types reference valid products', () => {
    for (const type of FENCE_TYPES) {
      expect(FENCE_PRODUCTS[type.productKey]).toBeDefined()
      expect(type.fenceLength).toBeGreaterThan(0)
    }
  })

  it('scaffold items have valid prices', () => {
    for (const item of SCAFFOLD_ITEMS) {
      expect(item.dailyRate).toBeGreaterThanOrEqual(0)
      expect(item.salePrice).toBeGreaterThanOrEqual(0)
      expect(item.name).toBeTruthy()
    }
  })

  it('rolling scaffold all heights have pricing', () => {
    const heights = ['2.5', '3.5', '4.5', '5.5', '6.5', '7.5', '8.5', '9.5', '10.5']
    for (const h of heights) {
      expect(NARROW_PRICING[h]).toBeDefined()
      expect(WIDE_PRICING[h]).toBeDefined()
      expect(NARROW_PRICING[h]['24h']).toBeGreaterThan(0)
      expect(WIDE_PRICING[h]['24h']).toBeGreaterThan(0)
      // Wide should cost more than narrow for same height
      expect(WIDE_PRICING[h]['24h']).toBeGreaterThan(NARROW_PRICING[h]['24h'])
    }
  })

  it('rolling scaffold pricing consistency: week ≈ 2.5× 24h', () => {
    for (const [, p] of Object.entries(NARROW_PRICING)) {
      // Week should be less than 7 × 24h (discount for weekly)
      expect(p.week).toBeLessThan(p['24h'] * 7)
      // But more than 24h
      expect(p.week).toBeGreaterThan(p['24h'])
    }
  })

  it('rolling scaffold: extra day ≈ 50% of 24h', () => {
    for (const [, p] of Object.entries(NARROW_PRICING)) {
      // Extra should be roughly half of 24h
      const ratio = p.extra / p['24h']
      expect(ratio).toBeGreaterThan(0.4)
      expect(ratio).toBeLessThan(0.6)
    }
  })
})


// ═══════════════════════════════════════════════════
// 15. FORMATTING UTILITIES
// ═══════════════════════════════════════════════════
describe('formatKr', () => {
  it('formats with dot thousands separator', () => {
    expect(formatKr(1234567)).toBe('1.234.567 kr')
  })

  it('rounds to nearest integer', () => {
    expect(formatKr(1234.56)).toBe('1.235 kr')
  })

  it('small number', () => {
    expect(formatKr(500)).toBe('500 kr')
  })

  it('zero', () => {
    expect(formatKr(0)).toBe('0 kr')
  })
})

describe('formatKennitala', () => {
  it('formats complete kennitala', () => {
    expect(formatKennitala('0101901234')).toBe('010190-1234')
  })

  it('partial input', () => {
    expect(formatKennitala('010190')).toBe('010190')
  })

  it('strips non-digit chars', () => {
    expect(formatKennitala('01-01-90-1234')).toBe('010190-1234')
  })

  it('truncates to 10 digits', () => {
    expect(formatKennitala('01019012345678')).toBe('010190-1234')
  })
})

describe('daysBetween', () => {
  it('same day = 1', () => {
    const d = new Date(2026, 0, 15)
    expect(daysBetween(d, d)).toBe(1)
  })

  it('two consecutive days = 2 (inclusive)', () => {
    const start = new Date(2026, 0, 15)
    const end = new Date(2026, 0, 16)
    expect(daysBetween(start, end)).toBe(2)
  })

  it('one week = 8 days (inclusive)', () => {
    const start = new Date(2026, 0, 1)
    const end = new Date(2026, 0, 8)
    expect(daysBetween(start, end)).toBe(8)
  })

  it('30 days span = 31 days (inclusive)', () => {
    const start = new Date(2026, 0, 1)
    const end = new Date(2026, 0, 31)
    expect(daysBetween(start, end)).toBe(31)
  })

  it('minimum is 1 day', () => {
    // Reversed dates could give negative, but min is 1
    const start = new Date(2026, 0, 15)
    const end = new Date(2026, 0, 14)
    expect(daysBetween(start, end)).toBe(1)
  })
})

describe('formatDate', () => {
  it('formats as DD.MM.YYYY', () => {
    expect(formatDate(new Date(2026, 2, 21))).toBe('21.03.2026')
  })

  it('pads single digits', () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe('05.01.2026')
  })
})

describe('formatNumber', () => {
  it('formats with dot separator', () => {
    expect(formatNumber(1234567)).toBe('1.234.567')
  })

  it('rounds', () => {
    expect(formatNumber(1234.9)).toBe('1.235')
  })
})


// ═══════════════════════════════════════════════════
// 16. END-TO-END SCENARIO TESTS
// ═══════════════════════════════════════════════════
describe('End-to-end scenarios', () => {
  it('Fence: 100m standard fence, 30 days rental', () => {
    const product = FENCE_PRODUCTS['fence-3500x2000x1.1']
    const geo = calcFenceGeometry(100, 3.5)
    const rentalCost = calcFenceRental(30, product.rates, geo.panels)

    // 29 panels, 30 stones, 28 clamps
    expect(geo.panels).toBe(29)

    // 30 days = 1 full period at tier 1 (rate: 100)
    // 30 × 100 × 29 = 87,000
    expect(rentalCost).toBe(87000)
    expect(formatKr(rentalCost)).toBe('87.000 kr')
  })

  it('Fence: 200m heavy fence, 90 days, with gate + stones', () => {
    const fenceProduct = FENCE_PRODUCTS['fence-3500x2000x1.7']
    const stoneProduct = FENCE_PRODUCTS['stone-concrete']
    const gateProduct = FENCE_PRODUCTS['walking-gate']

    const geo = calcFenceGeometry(200, 3.5)
    // ceil(200/3.5) = ceil(57.14) = 58 panels
    expect(geo.panels).toBe(58)
    expect(geo.stones).toBe(59)
    expect(geo.clamps).toBe(57)

    // Fence panels: 90 days = 30×100 + 30×50 + 30×25 = 5250 per panel
    const fenceRental = calcFenceRental(90, fenceProduct.rates, geo.panels)
    expect(fenceRental).toBe((30 * 100 + 30 * 50 + 30 * 25) * 58) // 304500

    // Stones: same tiers for 59 stones
    const stoneRental = calcFenceRental(90, stoneProduct.rates, geo.stones)
    const expectedStone = (30 * 20 + 30 * 10 + 30 * 5) * 59
    expect(stoneRental).toBe(expectedStone)

    // Gate: 1 gate
    const gateRental = calcFenceRental(90, gateProduct.rates, 1)
    expect(gateRental).toBe(30 * 100 + 30 * 50 + 30 * 25) // 5250
  })

  it('Scaffolding: 20m facade, 8m high, 30 days', () => {
    const levels = calculateLevelsFromHeight(8)
    const mats = calculateFacadeMaterials(20, levels.levels2m, levels.levels07m, 2, true)

    // Calculate total rental
    let totalCost = 0
    for (const [name, qty] of Object.entries(mats)) {
      if (name === 'LEGS_TOTAL') continue
      const scaffoldItem = SCAFFOLD_ITEMS.find(s => s.name === name)
      if (scaffoldItem && qty > 0) {
        totalCost += calcScaffoldingRental(scaffoldItem.dailyRate, 30, qty)
      }
    }

    expect(totalCost).toBeGreaterThan(0)
    // 20m facade, ~8m high, 30 days: ~71,520 kr is reasonable
    expect(totalCost).toBeGreaterThan(50000)
    expect(totalCost).toBeLessThan(200000)
  })

  it('Rolling scaffold: narrow 4.5m, 10 days with support legs', () => {
    const pricing = NARROW_PRICING['4.5']
    const scaffoldCost = calcRollingRental(10, pricing)
    const legsCost = calcRollingRental(10, SUPPORT_LEGS_PRICING)
    const total = scaffoldCost + legsCost

    // 10 days: 1 week + 3 extra
    // scaffold: 19051 + 3 × 7620 = 41911
    // legs: 1134 + 3 × 453 = 2493
    expect(scaffoldCost).toBe(41911)
    expect(legsCost).toBe(2493)
    expect(total).toBe(44404)
    expect(formatKr(total)).toBe('44.404 kr')
  })

  it('Ceiling props: 20 Galv 2.0-3.5M + 8 HT-20 beams, 21 days', () => {
    const prop = LOFTASTODIR[4] // 2,0–3,5M (Galv.): dayRate 20, weekRate 140
    const beam = MOTABITAR[0] // HT-20 2.45m: dayRate 17, weekRate 119

    const propCost = calcStandardRental(prop.dayRate, prop.weekRate, 21, 20)
    const beamCost = calcStandardRental(beam.dayRate, beam.weekRate, 21, 8)

    // 21 days = ceil(21/7) = 3 weeks
    // Props: 140 × 3 × 20 = 8400
    expect(propCost).toBe(8400)

    // Beams: 119 × 3 × 8 = 2856
    expect(beamCost).toBe(beam.weekRate * 3 * 8)

    const total = propCost + beamCost
    expect(total).toBeGreaterThan(0)
  })

  it('Formwork Rasto: 12m wall, 14 days, 0% discount', () => {
    const result = calculateModeA(12, 'rasto', 0, 0, 0, TIE_BAR_OPTIONS[0].id)
    const total = calcFormworkTotal(result.boq, 14, 0)

    expect(total).toBeGreaterThan(0)
    // Should be a reasonable cost for 12m of Rasto formwork
    expect(total).toBeGreaterThan(5000)
    expect(total).toBeLessThan(500000)
  })

  it('Formwork: discount reduces cost', () => {
    const result = calculateModeA(12, 'rasto', 0, 0, 0, TIE_BAR_OPTIONS[0].id)
    const full = calcFormworkTotal(result.boq, 14, 0)
    const discounted = calcFormworkTotal(result.boq, 14, 15)

    expect(discounted).toBeCloseTo(full * 0.85, 0)
    expect(discounted).toBeLessThan(full)
  })
})

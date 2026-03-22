/**
 * Mobile fence geometry calculations
 */
export function calcFenceGeometry(
  totalLength: number,
  fenceLength: number
): { panels: number; stones: number; clamps: number } {
  const panels = Math.ceil(totalLength / fenceLength)
  const stones = panels + 1
  const clamps = Math.max(0, panels - 1)
  return { panels, stones, clamps }
}

/**
 * Scaffolding: calculate optimal frame combo for target height
 * Returns { levels2m, levels07m, legs50cm, legs100cm, actualHeight }
 */
export function calculateLevelsFromHeight(targetHeight: number): {
  levels2m: number
  levels07m: number
  legs50cm: number
  legs100cm: number
  legType: '50cm' | '100cm'
  actualHeight: number
} {
  const legOptions: Array<{ nominal: number; actual: number }> = [
    { nominal: 0.5, actual: 0.34 },
    { nominal: 1.0, actual: 0.69 },
  ]

  let best: { levels2m: number; levels07m: number; legs50cm: number; legs100cm: number; legType: '50cm' | '100cm'; actualHeight: number; diff: number } = { levels2m: 1, levels07m: 0, legs50cm: 1, legs100cm: 0, legType: '50cm', actualHeight: 0, diff: Infinity }

  for (const leg of legOptions) {
    for (let l2 = 0; l2 <= Math.ceil(targetHeight / 2); l2++) {
      for (let l07 = 0; l07 <= 3; l07++) {
        if (l2 + l07 === 0) continue
        const h = l2 * 2 + l07 * 0.7 + leg.actual
        if (h < targetHeight - 0.2) continue
        const error = Math.abs(h - targetHeight)
        const complexity = l07 * 0.01
        const totalError = error + complexity
        if (totalError < best.diff) {
          best = {
            levels2m: l2,
            levels07m: l07,
            legs50cm: leg.nominal === 0.5 ? 1 : 0,
            legs100cm: leg.nominal === 1.0 ? 1 : 0,
            legType: leg.nominal === 0.5 ? '50cm' : '100cm',
            actualHeight: h,
            diff: totalError,
          }
        }
      }
    }
  }

  return { levels2m: best.levels2m, levels07m: best.levels07m, legs50cm: best.legs50cm, legs100cm: best.legs100cm, legType: best.legType, actualHeight: best.actualHeight }
}

/**
 * Scaffolding: calculate materials for one facade
 */
export function calculateFacadeMaterials(
  length: number,
  levels2m: number,
  levels07m: number,
  endcaps: number,
  isFirst: boolean
): Record<string, number> {
  const BOARD_LENGTH = 1.8
  const WALL_ANCHOR_AREA = 15

  const bays = Math.ceil(length / BOARD_LENGTH)
  const framesPerLevel = bays + 1
  const pairedLevels = Math.min(levels2m, levels07m)
  const onlyLevels2m = levels2m - pairedLevels

  const frames2m = framesPerLevel * levels2m
  const frames07m = framesPerLevel * levels07m
  const stairBoards = isFirst ? levels2m : 0
  const floorBoards = levels2m * 2 * bays - stairBoards

  const wallHeight = levels2m * 2 + levels07m * 0.7 + 2.0
  const wallArea = length * wallHeight
  const anchors50cm = levels2m <= 1 ? 0 : Math.round(wallArea / WALL_ANCHOR_AREA)

  const endClosures = endcaps * levels2m * 2
  const splitPins = (frames2m + frames07m) * 2
  const legsTotal = (bays + 1) * 2

  return {
    'Rammar 2,0m': frames2m,
    'Rammar 0,7m': frames07m,
    'Gólfborð 1,8m': floorBoards,
    'Stigapallar 1,8m': isFirst ? stairBoards : 0,
    'Stigar 2,7m': isFirst ? pairedLevels : 0,
    'Stigar 2,0m': isFirst ? onlyLevels2m : 0,
    'Tvöföld handrið 1,8m': (levels2m + 1) * bays,
    'Handriðastoðir': (bays + 1) + endcaps,
    'Veggfestingar 50cm': anchors50cm,
    'Endahandrið': endClosures,
    'Klemmur fastar': anchors50cm,
    'Splitti f/ramma': splitPins,
    'LEGS_TOTAL': legsTotal,
  }
}

/**
 * Scaffolding: calculate transport racks from combined materials
 */
export function calculateRacks(combined: Record<string, number>): void {
  const RACK_SLOTS = 50
  const SLOTS_PER_FRAME_2M = 1
  const SLOTS_PER_FRAME_07M = 0.5
  const BOARDS_PER_RACK = 40
  const HANDRAILS_PER_RACK = 38

  const slotsUsed = (combined['Rammar 2,0m'] || 0) * SLOTS_PER_FRAME_2M
                  + (combined['Rammar 0,7m'] || 0) * SLOTS_PER_FRAME_07M
  combined['Rekkar fyrir ramma'] = Math.ceil(slotsUsed / RACK_SLOTS)
  combined['Rekkar fyrir gólf'] = Math.ceil(
    ((combined['Gólfborð 1,8m'] || 0) + (combined['Stigapallar 1,8m'] || 0)) / BOARDS_PER_RACK
  )
  combined['Rekki f/tvöföld handrið'] = Math.ceil(
    (combined['Tvöföld handrið 1,8m'] || 0) / HANDRAILS_PER_RACK
  )
}

/**
 * Scaffolding: calculate accessory grids from combined small items
 */
export function calculateAccessoryGrids(combined: Record<string, number>, hasFacades: boolean): void {
  const SMALL_ITEMS_PER_GRID = 100
  const smallItemKeys = [
    'Lappir 50cm', 'Lappir 100cm',
    'Veggfestingar 50cm', 'Veggfestingar 80cm',
    'Endahandrið', 'Stálrör 1,2m', 'Handriðastoðir',
  ]
  const total = smallItemKeys.reduce((sum, key) => sum + (combined[key] || 0), 0)
  if (!hasFacades || total === 0) {
    combined['Fylgihlutagrind'] = 0
    return
  }
  combined['Fylgihlutagrind'] = Math.max(1, Math.ceil(total / SMALL_ITEMS_PER_GRID))
}

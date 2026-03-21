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
 * Returns { levels2m, levels07m, legType, actualHeight }
 */
export function calculateLevelsFromHeight(targetHeight: number): {
  levels2m: number
  levels07m: number
  legType: '50cm' | '100cm'
  actualHeight: number
} {
  const legOptions: Array<{ type: '50cm' | '100cm'; actual: number }> = [
    { type: '50cm', actual: 0.34 },
    { type: '100cm', actual: 0.69 },
  ]

  let best = { levels2m: 1, levels07m: 0, legType: '50cm' as const, actualHeight: 0, diff: Infinity }

  for (const leg of legOptions) {
    for (let l2 = 0; l2 <= 15; l2++) {
      for (let l07 = 0; l07 <= 5; l07++) {
        if (l2 + l07 === 0) continue
        const h = l2 * 2 + l07 * 0.7 + leg.actual + 2.0 // +2.0m for working platform to top
        const diff = Math.abs(h - targetHeight)
        const complexity = l07 * 0.1 // prefer fewer 0.7m levels
        if (diff + complexity < best.diff) {
          best = { levels2m: l2, levels07m: l07, legType: leg.type, actualHeight: h, diff: diff + complexity }
        }
      }
    }
  }

  return { levels2m: best.levels2m, levels07m: best.levels07m, legType: best.legType, actualHeight: best.actualHeight }
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

  const stairBoards = isFirst ? levels2m : 0
  const floorBoards = levels2m * 2 * bays - stairBoards

  const wallHeight = levels2m * 2 + levels07m * 0.7 + 2.0
  const wallArea = length * wallHeight
  const anchors = levels2m <= 1 ? 0 : Math.round(wallArea / WALL_ANCHOR_AREA)

  return {
    'Rammar 2,0m': framesPerLevel * levels2m,
    'Rammar 0,7m': framesPerLevel * levels07m,
    'Gólfborð 1,8m': floorBoards,
    'Stigapallar 1,8m': stairBoards,
    'Stigar 2,0m': isFirst ? levels2m : 0,
    'Tvöföld handrið': (levels2m + 1) * bays,
    'Handriðastoðir': (bays + 1) + endcaps,
    'Veggfestingar 50cm': Math.round(anchors / 2),
    'Veggfestingar 100cm': anchors - Math.round(anchors / 2),
    'Endalokur': endcaps * levels2m * 2,
    'Splitti': (framesPerLevel * levels2m + framesPerLevel * levels07m) * 2,
    'LEGS_TOTAL': (bays + 1) * 2,
  }
}

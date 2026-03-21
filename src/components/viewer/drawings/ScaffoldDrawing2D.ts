import makerjs from 'makerjs'

/**
 * Generate a 2D elevation/side view of facade scaffolding using Maker.js
 */
export function createScaffoldDrawing(params: {
  length: number     // meters
  levels2m: number
  levels07m: number
  legType: '50cm' | '100cm'
  endcaps: number
}): string {
  const { length, levels2m, levels07m, legType, endcaps } = params
  const scale = 50 // 1m = 50 units
  const BOARD_LENGTH = 1.8
  const bays = Math.ceil(length / BOARD_LENGTH)

  const legH = legType === '50cm' ? 0.34 : 0.69
  const totalHeight = levels2m * 2 + levels07m * 0.7 + legH + 2.0
  // tube radius in drawing units: 2.4 (48mm / 2 scaled)

  const model: makerjs.IModel = { models: {}, paths: {} }

  const totalW = bays * BOARD_LENGTH * scale
  const totalH = totalHeight * scale

  // Ground line
  model.paths!['ground'] = new makerjs.paths.Line([-10, 0], [totalW + 10, 0])

  // Draw vertical standards (uprights) at each bay position
  for (let b = 0; b <= bays; b++) {
    const x = b * BOARD_LENGTH * scale
    model.paths![`upright_${b}`] = new makerjs.paths.Line([x, 0], [x, totalH])
  }

  // Draw horizontal levels
  let y = legH * scale // start above leg
  const levelHeights: number[] = []

  // 2m levels
  for (let l = 0; l < levels2m; l++) {
    y += 2 * scale
    levelHeights.push(y)
    // Draw ledgers at this level
    for (let b = 0; b < bays; b++) {
      const x1 = b * BOARD_LENGTH * scale
      const x2 = (b + 1) * BOARD_LENGTH * scale
      // Bottom ledger
      model.paths![`ledger_2m_${l}_${b}`] = new makerjs.paths.Line([x1, y], [x2, y])
      // Platform boards (thick line just below ledger)
      model.paths![`board_2m_${l}_${b}`] = new makerjs.paths.Line([x1 + 2, y - 3], [x2 - 2, y - 3])
    }
  }

  // 0.7m levels
  for (let l = 0; l < levels07m; l++) {
    y += 0.7 * scale
    levelHeights.push(y)
    for (let b = 0; b < bays; b++) {
      const x1 = b * BOARD_LENGTH * scale
      const x2 = (b + 1) * BOARD_LENGTH * scale
      model.paths![`ledger_07m_${l}_${b}`] = new makerjs.paths.Line([x1, y], [x2, y])
      model.paths![`board_07m_${l}_${b}`] = new makerjs.paths.Line([x1 + 2, y - 2], [x2 - 2, y - 2])
    }
  }

  // Guardrails at top (+2m working platform)
  const topY = totalH
  const railY = topY
  for (let b = 0; b < bays; b++) {
    const x1 = b * BOARD_LENGTH * scale
    const x2 = (b + 1) * BOARD_LENGTH * scale
    // Top rail
    model.paths![`toprail_${b}`] = new makerjs.paths.Line([x1, railY], [x2, railY])
    // Mid rail
    model.paths![`midrail_${b}`] = new makerjs.paths.Line([x1, railY - scale * 0.5], [x2, railY - scale * 0.5])
  }

  // Draw diagonal braces (X pattern in each bay at each 2m level)
  for (let l = 0; l < levels2m && l < 2; l++) {
    const yBot = legH * scale + l * 2 * scale
    const yTop = yBot + 2 * scale
    for (let b = 0; b < bays; b += 2) {
      const x1 = b * BOARD_LENGTH * scale
      const x2 = (b + 1) * BOARD_LENGTH * scale
      model.paths![`brace_fwd_${l}_${b}`] = new makerjs.paths.Line([x1, yBot], [x2, yTop])
      model.paths![`brace_rev_${l}_${b}`] = new makerjs.paths.Line([x1, yTop], [x2, yBot])
    }
  }

  // Leg base plates (small squares at bottom)
  for (let b = 0; b <= bays; b++) {
    const x = b * BOARD_LENGTH * scale
    model.models![`base_${b}`] = {
      paths: {
        l: new makerjs.paths.Line([x - 5, 0], [x - 5, -3]),
        r: new makerjs.paths.Line([x + 5, 0], [x + 5, -3]),
        b: new makerjs.paths.Line([x - 5, -3], [x + 5, -3]),
      }
    }
  }

  // Endcap marks
  for (let e = 0; e < endcaps; e++) {
    const x = e === 0 ? 0 : totalW
    const dir = e === 0 ? -1 : 1
    for (let l = 0; l < levels2m; l++) {
      const yl = legH * scale + (l + 1) * 2 * scale
      model.paths![`endcap_${e}_${l}`] = new makerjs.paths.Line(
        [x, yl],
        [x + dir * 15, yl]
      )
    }
  }

  // Height dimension (right side)
  const dimX = totalW + 25
  model.paths!['hdim_line'] = new makerjs.paths.Line([dimX, 0], [dimX, totalH])
  model.paths!['hdim_top'] = new makerjs.paths.Line([dimX - 5, totalH], [dimX + 5, totalH])
  model.paths!['hdim_bot'] = new makerjs.paths.Line([dimX - 5, 0], [dimX + 5, 0])
  model.models!['hdim_text'] = makerjs.model.addCaption(
    {},
    `${totalHeight.toFixed(1)}m`,
    [dimX + 8, totalH / 2 - 10],
    [dimX + 8, totalH / 2 + 10]
  )

  // Width dimension (bottom)
  const dimY = -20
  model.paths!['wdim_line'] = new makerjs.paths.Line([0, dimY], [totalW, dimY])
  model.paths!['wdim_left'] = new makerjs.paths.Line([0, dimY - 5], [0, dimY + 5])
  model.paths!['wdim_right'] = new makerjs.paths.Line([totalW, dimY - 5], [totalW, dimY + 5])
  model.models!['wdim_text'] = makerjs.model.addCaption(
    {},
    `${length.toFixed(1)}m (${bays} fag)`,
    [10, dimY - 10],
    [totalW - 10, dimY - 10]
  )

  // Title
  model.models!['title'] = makerjs.model.addCaption(
    {},
    `Vinnupallur — ${length}m × ${totalHeight.toFixed(1)}m (${levels2m}×2m + ${levels07m}×0.7m)`,
    [0, totalH + 20],
    [totalW, totalH + 20]
  )

  return makerjs.exporter.toSVG(model, {
    stroke: '#404042',
    strokeWidth: '1.2',
    fill: 'none',
    fontSize: '11px',
    units: makerjs.unitType.Millimeter,
    svgAttrs: { style: 'background: white' },
  })
}

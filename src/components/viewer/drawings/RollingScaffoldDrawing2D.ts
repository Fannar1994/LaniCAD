import makerjs from 'makerjs'

/**
 * Generate a 2D front elevation of a rolling/mobile scaffold
 */
export function createRollingScaffoldDrawing(params: {
  height: number  // meters (platform height)
  width: 'narrow' | 'wide' // narrow=0.75m, wide=1.35m
}): string {
  const { height, width } = params
  const scale = 50
  const baseW = width === 'narrow' ? 0.75 : 1.35
  const platformH = height
  const totalH = platformH + 1.0 // +1m for guardrails

  const w = baseW * scale * 3 // Exaggerate width for visibility
  const h = totalH * scale

  const model: makerjs.IModel = { models: {}, paths: {} }

  // Wheels at bottom
  const wheelR = 8
  for (const x of [10, w - 10]) {
    model.paths![`wheel_l_${x}`] = new makerjs.paths.Circle([x, wheelR], wheelR)
    model.paths![`axle_${x}`] = new makerjs.paths.Line([x, wheelR], [x, wheelR + 5])
  }

  const baseY = wheelR * 2 + 5

  // Main vertical uprights
  model.paths!['left_upright'] = new makerjs.paths.Line([5, baseY], [5, h])
  model.paths!['right_upright'] = new makerjs.paths.Line([w - 5, baseY], [w - 5, h])

  // Horizontal braces every 2m
  const levels = Math.ceil(platformH / 2)
  for (let l = 0; l <= levels; l++) {
    const y = baseY + l * 2 * scale
    if (y > h) break
    model.paths![`horiz_${l}`] = new makerjs.paths.Line([5, y], [w - 5, y])
  }

  // Diagonal braces (alternating)
  for (let l = 0; l < levels; l++) {
    const y1 = baseY + l * 2 * scale
    const y2 = Math.min(baseY + (l + 1) * 2 * scale, h)
    if (l % 2 === 0) {
      model.paths![`diag_${l}`] = new makerjs.paths.Line([5, y1], [w - 5, y2])
    } else {
      model.paths![`diag_${l}`] = new makerjs.paths.Line([w - 5, y1], [5, y2])
    }
  }

  // Platform at working height
  const platY = baseY + platformH * scale
  model.paths!['platform_l'] = new makerjs.paths.Line([0, platY], [w, platY])
  model.paths!['platform_r'] = new makerjs.paths.Line([0, platY + 3], [w, platY + 3])

  // Guardrails
  const railY = platY + 1.0 * scale
  model.paths!['rail_top'] = new makerjs.paths.Line([5, railY], [w - 5, railY])
  model.paths!['rail_mid'] = new makerjs.paths.Line([5, platY + 0.5 * scale], [w - 5, platY + 0.5 * scale])

  // Height dimension
  const dimX = w + 15
  model.paths!['hdim'] = new makerjs.paths.Line([dimX, baseY], [dimX, platY])
  model.paths!['hdim_t'] = new makerjs.paths.Line([dimX - 4, platY], [dimX + 4, platY])
  model.paths!['hdim_b'] = new makerjs.paths.Line([dimX - 4, baseY], [dimX + 4, baseY])
  model.models!['hdim_text'] = makerjs.model.addCaption(
    {},
    `${platformH}m`,
    [dimX + 8, (baseY + platY) / 2 - 10],
    [dimX + 8, (baseY + platY) / 2 + 10]
  )

  // Width dimension
  model.paths!['wdim'] = new makerjs.paths.Line([0, -10], [w, -10])
  model.models!['wdim_text'] = makerjs.model.addCaption(
    {},
    `${baseW}m`,
    [5, -20],
    [w - 5, -20]
  )

  // Title
  model.models!['title'] = makerjs.model.addCaption(
    {},
    `Hjólapallur — ${width === 'narrow' ? 'Mjór' : 'Breiður'} ${platformH}m`,
    [0, h + 15],
    [w, h + 15]
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

import makerjs from 'makerjs'

/**
 * Generate a 2D top-down view of mobile fence layout using Maker.js
 */
export function createFenceDrawing(params: {
  panels: number
  panelWidth: number  // meters
  panelHeight: number // meters
  stones: number
  clamps: number
  includeGate?: boolean
}): string {
  const { panels, panelWidth, panelHeight, stones, includeGate } = params
  const scale = 100 // 1m = 100 units for fine detail
  const pw = panelWidth * scale
  const ph = panelHeight * scale * 0.15 // Top-down: depth is small
  const stoneSize = 20
  const totalWidth = panels * pw

  const model: makerjs.IModel = { models: {}, paths: {} }

  // Draw panels
  for (let i = 0; i < panels; i++) {
    const x = i * pw
    model.models![`panel_${i}`] = {
      paths: {
        bottom: new makerjs.paths.Line([x, 0], [x + pw, 0]),
        top: new makerjs.paths.Line([x, ph], [x + pw, ph]),
        left: new makerjs.paths.Line([x, 0], [x, ph]),
        right: new makerjs.paths.Line([x + pw, 0], [x + pw, ph]),
      },
    }
  }

  // Draw stones (circles at joints)
  for (let i = 0; i <= panels; i++) {
    if (i < stones) {
      const cx = i * pw
      const cy = ph / 2
      model.paths![`stone_${i}`] = new makerjs.paths.Circle([cx, cy], stoneSize / 2)
    }
  }

  // Draw clamps (small X marks between panels)
  for (let i = 1; i < panels; i++) {
    const cx = i * pw
    model.paths![`clamp_top_${i}`] = new makerjs.paths.Line([cx - 5, ph + 8], [cx + 5, ph + 18])
    model.paths![`clamp_bot_${i}`] = new makerjs.paths.Line([cx - 5, ph + 18], [cx + 5, ph + 8])
  }

  // Draw gate (if included) — replace last panel with gate symbol
  if (includeGate && panels > 1) {
    const gx = (panels - 1) * pw
    model.models![`gate`] = {
      paths: {
        arc: new makerjs.paths.Arc([gx, 0], pw * 0.8, 0, 90),
        hinge: new makerjs.paths.Line([gx, 0], [gx, ph]),
      },
    }
  }

  // Dimension line at bottom
  const dimY = -30
  model.paths!['dim_line'] = new makerjs.paths.Line([0, dimY], [totalWidth, dimY])
  model.paths!['dim_left'] = new makerjs.paths.Line([0, dimY - 5], [0, dimY + 5])
  model.paths!['dim_right'] = new makerjs.paths.Line([totalWidth, dimY - 5], [totalWidth, dimY + 5])

  // Panel dimension markers
  for (let i = 0; i < panels; i++) {
    const x1 = i * pw
    const x2 = (i + 1) * pw
    model.paths![`pdim_${i}`] = new makerjs.paths.Line([x1, dimY - 15], [x2, dimY - 15])
    model.paths![`pdim_l_${i}`] = new makerjs.paths.Line([x1, dimY - 18], [x1, dimY - 12])
    model.paths![`pdim_r_${i}`] = new makerjs.paths.Line([x2, dimY - 18], [x2, dimY - 12])
    // We can't add text in maker.js paths, so we use caption
    model.models![`pdim_text_${i}`] = makerjs.model.addCaption(
      {},
      `${panelWidth}m`,
      [x1 + 10, dimY - 25],
      [x2 - 10, dimY - 25]
    )
  }

  // Total length caption
  model.models!['total_dim'] = makerjs.model.addCaption(
    {},
    `${(panels * panelWidth).toFixed(1)}m`,
    [10, dimY - 5],
    [totalWidth - 10, dimY - 5]
  )

  // Title
  model.models!['title'] = makerjs.model.addCaption(
    {},
    `Girðing — ${panels} paneli × ${panelWidth}m`,
    [0, ph + 40],
    [totalWidth, ph + 40]
  )

  return makerjs.exporter.toSVG(model, {
    stroke: '#404042',
    strokeWidth: '1.5',
    fill: 'none',
    fontSize: '12px',
    units: makerjs.unitType.Millimeter,
    svgAttrs: { style: 'background: white' },
  })
}

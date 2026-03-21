import makerjs from 'makerjs'

/**
 * Generate a 2D section view of formwork (Rasto/Takko or Manto wall)
 */
export function createFormworkDrawing(params: {
  wallLength: number  // meters
  wallHeight: number  // meters (default 3m for Rasto, variable for Manto)
  system: 'Rasto' | 'Takko' | 'Manto'
}): string {
  const { wallLength, wallHeight, system } = params
  const scale = 40

  const w = wallLength * scale
  const h = wallHeight * scale

  const model: makerjs.IModel = { models: {}, paths: {} }

  // Wall outline (thick)
  model.models!['wall'] = {
    paths: {
      left: new makerjs.paths.Line([0, 0], [0, h]),
      right: new makerjs.paths.Line([w, 0], [w, h]),
      top: new makerjs.paths.Line([0, h], [w, h]),
      bottom: new makerjs.paths.Line([0, 0], [w, 0]),
    }
  }

  // Panel divisions based on system
  const panelWidths: number[] = []
  if (system === 'Rasto' || system === 'Takko') {
    // Rasto/Takko panels: 240, 120, 90, 60, 45, 30 cm
    const available = [240, 120, 90, 60, 45, 30]
    let remaining = wallLength * 100 // to cm
    while (remaining > 0) {
      const panel = available.find(p => p <= remaining + 1) || available[available.length - 1]
      panelWidths.push(panel)
      remaining -= panel
    }
  } else {
    // Manto panels: 240, 120, 90, 60, 50, 30 cm
    const available = [240, 120, 90, 60, 50, 30]
    let remaining = wallLength * 100
    while (remaining > 0) {
      const panel = available.find(p => p <= remaining + 1) || available[available.length - 1]
      panelWidths.push(panel)
      remaining -= panel
    }
  }

  // Draw panel divisions
  let x = 0
  for (let i = 0; i < panelWidths.length; i++) {
    const pw = (panelWidths[i] / 100) * scale
    x += pw
    if (i < panelWidths.length - 1) {
      model.paths![`div_${i}`] = new makerjs.paths.Line([x, 0], [x, h])
    }
    // Panel width label
    const midX = x - pw / 2
    model.models![`plbl_${i}`] = makerjs.model.addCaption(
      {},
      `${panelWidths[i]}`,
      [midX - 10, h / 2 - 5],
      [midX + 10, h / 2 + 5]
    )
  }

  // Tie bars (horizontal lines through wall at intervals)
  const tieSpacing = 60 * scale / 100 // every 60cm
  for (let ty = tieSpacing; ty < h - 10; ty += tieSpacing) {
    let tx = 0
    for (let i = 0; i < panelWidths.length; i++) {
      const pw = (panelWidths[i] / 100) * scale
      const midX = tx + pw / 2
      // Tie bar dot
      model.paths![`tie_${i}_${Math.round(ty)}`] = new makerjs.paths.Circle([midX, ty], 3)
      tx += pw
    }
  }

  // Props (at regular intervals, shown as triangles below)
  const propSpacing = 120 * scale / 100 // every 1.2m
  for (let px = propSpacing / 2; px < w; px += propSpacing) {
    model.paths![`prop_l_${Math.round(px)}`] = new makerjs.paths.Line([px, 0], [px - 8, -20])
    model.paths![`prop_r_${Math.round(px)}`] = new makerjs.paths.Line([px, 0], [px + 8, -20])
    model.paths![`prop_b_${Math.round(px)}`] = new makerjs.paths.Line([px - 8, -20], [px + 8, -20])
  }

  // Height dimension
  const dimX = w + 15
  model.paths!['hdim'] = new makerjs.paths.Line([dimX, 0], [dimX, h])
  model.paths!['hdim_t'] = new makerjs.paths.Line([dimX - 4, h], [dimX + 4, h])
  model.paths!['hdim_b'] = new makerjs.paths.Line([dimX - 4, 0], [dimX + 4, 0])
  model.models!['hdim_text'] = makerjs.model.addCaption(
    {},
    `${wallHeight}m`,
    [dimX + 8, h / 2 - 10],
    [dimX + 8, h / 2 + 10]
  )

  // Width dimension
  model.paths!['wdim'] = new makerjs.paths.Line([0, -30], [w, -30])
  model.paths!['wdim_l'] = new makerjs.paths.Line([0, -34], [0, -26])
  model.paths!['wdim_r'] = new makerjs.paths.Line([w, -34], [w, -26])
  model.models!['wdim_text'] = makerjs.model.addCaption(
    {},
    `${wallLength}m`,
    [5, -40],
    [w - 5, -40]
  )

  // Title
  model.models!['title'] = makerjs.model.addCaption(
    {},
    `Steypumót — ${system} ${wallLength}m × ${wallHeight}m`,
    [0, h + 15],
    [w, h + 15]
  )

  return makerjs.exporter.toSVG(model, {
    stroke: '#404042',
    strokeWidth: '1.2',
    fill: 'none',
    fontSize: '10px',
    units: makerjs.unitType.Millimeter,
    svgAttrs: { style: 'background: white' },
  })
}

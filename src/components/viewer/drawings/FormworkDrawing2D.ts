import makerjs from 'makerjs'

export type FormworkDrawingSystem = 'Rasto' | 'Takko' | 'Manto' | 'Alufort' | 'ID-15' | 'Robusto' | 'Column' | 'ST60'

/**
 * Generate a 2D section view of formwork (wall panels, slab, shoring, or column)
 */
export function createFormworkDrawing(params: {
  wallLength: number  // meters
  wallHeight: number  // meters
  system: FormworkDrawingSystem
}): string {
  const { wallLength, wallHeight, system } = params

  switch (system) {
    case 'ID-15':
    case 'ST60':
      return createShoringTowerDrawing(wallLength, wallHeight, system)
    case 'Alufort':
      return createSlabFormworkDrawing(wallLength, wallHeight)
    case 'Column':
      return createColumnFormworkDrawing(wallLength, wallHeight)
    default:
      return createWallFormworkDrawing(wallLength, wallHeight, system)
  }
}

/** Wall formwork: Rasto, Takko, Manto, Robusto */
function createWallFormworkDrawing(wallLength: number, wallHeight: number, system: string): string {
  const scale = 40
  const w = wallLength * scale
  const h = wallHeight * scale

  const model: makerjs.IModel = { models: {}, paths: {} }

  // Wall outline
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
  const available = system === 'Manto' ? [240, 120, 90, 60, 50, 30]
    : system === 'Robusto' ? [240, 120, 90, 72, 60, 45, 30]
    : [240, 120, 90, 60, 45, 30]
  let remaining = wallLength * 100
  while (remaining > 0) {
    const panel = available.find(p => p <= remaining + 1) || available[available.length - 1]
    panelWidths.push(panel)
    remaining -= panel
  }

  // Draw panel divisions + labels
  let x = 0
  for (let i = 0; i < panelWidths.length; i++) {
    const pw = (panelWidths[i] / 100) * scale
    x += pw
    if (i < panelWidths.length - 1) {
      model.paths![`div_${i}`] = new makerjs.paths.Line([x, 0], [x, h])
    }
    const midX = x - pw / 2
    model.models![`plbl_${i}`] = makerjs.model.addCaption({}, `${panelWidths[i]}`, [midX - 10, h / 2 - 5], [midX + 10, h / 2 + 5])
  }

  // Tie bars
  const tieSpacing = 60 * scale / 100
  for (let ty = tieSpacing; ty < h - 10; ty += tieSpacing) {
    let tx = 0
    for (let i = 0; i < panelWidths.length; i++) {
      const pw = (panelWidths[i] / 100) * scale
      const midX = tx + pw / 2
      model.paths![`tie_${i}_${Math.round(ty)}`] = new makerjs.paths.Circle([midX, ty], 3)
      tx += pw
    }
  }

  // Props
  const propSpacing = 120 * scale / 100
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
  model.models!['hdim_text'] = makerjs.model.addCaption({}, `${wallHeight}m`, [dimX + 8, h / 2 - 10], [dimX + 8, h / 2 + 10])

  // Width dimension
  model.paths!['wdim'] = new makerjs.paths.Line([0, -30], [w, -30])
  model.paths!['wdim_l'] = new makerjs.paths.Line([0, -34], [0, -26])
  model.paths!['wdim_r'] = new makerjs.paths.Line([w, -34], [w, -26])
  model.models!['wdim_text'] = makerjs.model.addCaption({}, `${wallLength}m`, [5, -40], [w - 5, -40])

  // Title
  model.models!['title'] = makerjs.model.addCaption({}, `Steypumót — ${system} ${wallLength}m × ${wallHeight}m`, [0, h + 15], [w, h + 15])

  // Scale bar (1m reference)
  const sby = -55
  const scaleLen = 1 * scale
  model.paths!['scale_line'] = new makerjs.paths.Line([0, sby], [scaleLen, sby])
  model.paths!['scale_l'] = new makerjs.paths.Line([0, sby - 4], [0, sby + 4])
  model.paths!['scale_r'] = new makerjs.paths.Line([scaleLen, sby - 4], [scaleLen, sby + 4])
  model.models!['scale_text'] = makerjs.model.addCaption({}, '1 m', [5, sby - 12], [scaleLen - 5, sby - 12])
  // LániCAD branding
  model.models!['brand'] = makerjs.model.addCaption({}, 'LániCAD  ·  BYKO Leiga', [w - 60, sby - 12], [w + 15, sby - 12])

  return makerjs.exporter.toSVG(model, {
    stroke: system === 'Robusto' ? '#6a3a1a' : '#404042',
    strokeWidth: '1.2', fill: 'none', fontSize: '10px',
    units: makerjs.unitType.Millimeter,
    svgAttrs: { style: 'background: white' },
  })
}

/** ID-15 / ST60 Shoring tower — elevation view with frames and diagonals */
function createShoringTowerDrawing(towerWidth: number, towerHeight: number, system: string): string {
  const scale = 40
  const frameW = towerWidth * scale
  const frameH = towerHeight * scale
  const bayH = (system === 'ST60' ? 1.5 : 2.0) * scale // bay height
  const bays = Math.max(1, Math.round(towerHeight / (system === 'ST60' ? 1.5 : 2.0)))

  const model: makerjs.IModel = { models: {}, paths: {} }

  // Vertical standards (legs)
  model.paths!['leg_l'] = new makerjs.paths.Line([0, 0], [0, frameH])
  model.paths!['leg_r'] = new makerjs.paths.Line([frameW, 0], [frameW, frameH])

  // Horizontal ledgers and X-braces per bay
  for (let b = 0; b <= bays; b++) {
    const y = Math.min(b * bayH, frameH)
    model.paths![`ledger_${b}`] = new makerjs.paths.Line([0, y], [frameW, y])
    // X-braces within bays
    if (b < bays) {
      const y1 = y
      const y2 = Math.min(y + bayH, frameH)
      model.paths![`brace_f_${b}`] = new makerjs.paths.Line([0, y1], [frameW, y2])
      model.paths![`brace_b_${b}`] = new makerjs.paths.Line([frameW, y1], [0, y2])
    }
  }

  // Base jacks (triangles at bottom)
  for (const bx of [0, frameW]) {
    model.paths![`jack_l_${bx}`] = new makerjs.paths.Line([bx, 0], [bx - 8, -15])
    model.paths![`jack_r_${bx}`] = new makerjs.paths.Line([bx, 0], [bx + 8, -15])
    model.paths![`jack_b_${bx}`] = new makerjs.paths.Line([bx - 8, -15], [bx + 8, -15])
  }

  // Head jacks at top (U-fork symbols)
  for (const bx of [0, frameW]) {
    model.paths![`head_l_${bx}`] = new makerjs.paths.Line([bx - 5, frameH], [bx - 5, frameH + 12])
    model.paths![`head_r_${bx}`] = new makerjs.paths.Line([bx + 5, frameH], [bx + 5, frameH + 12])
  }

  // Height dimension
  const dimX = frameW + 20
  model.paths!['hdim'] = new makerjs.paths.Line([dimX, 0], [dimX, frameH])
  model.paths!['hdim_t'] = new makerjs.paths.Line([dimX - 4, frameH], [dimX + 4, frameH])
  model.paths!['hdim_b'] = new makerjs.paths.Line([dimX - 4, 0], [dimX + 4, 0])
  model.models!['hdim_text'] = makerjs.model.addCaption({}, `${towerHeight}m`, [dimX + 8, frameH / 2 - 10], [dimX + 8, frameH / 2 + 10])

  // Width dimension
  model.paths!['wdim'] = new makerjs.paths.Line([0, -25], [frameW, -25])
  model.paths!['wdim_l'] = new makerjs.paths.Line([0, -29], [0, -21])
  model.paths!['wdim_r'] = new makerjs.paths.Line([frameW, -29], [frameW, -21])
  model.models!['wdim_text'] = makerjs.model.addCaption({}, `${towerWidth}m`, [5, -35], [frameW - 5, -35])

  // Title
  const sysName = system === 'ST60' ? 'ST 60 Stoðturn' : 'ID-15 Stoðturn'
  model.models!['title'] = makerjs.model.addCaption({}, `${sysName} — ${towerWidth}m × ${towerHeight}m`, [0, frameH + 25], [frameW, frameH + 25])

  // Scale bar (1m reference)
  const sby2 = -50
  const scaleLen2 = 1 * scale
  model.paths!['scale_line'] = new makerjs.paths.Line([0, sby2], [scaleLen2, sby2])
  model.paths!['scale_l'] = new makerjs.paths.Line([0, sby2 - 4], [0, sby2 + 4])
  model.paths!['scale_r'] = new makerjs.paths.Line([scaleLen2, sby2 - 4], [scaleLen2, sby2 + 4])
  model.models!['scale_text'] = makerjs.model.addCaption({}, '1 m', [5, sby2 - 12], [scaleLen2 - 5, sby2 - 12])
  // LániCAD branding
  model.models!['brand'] = makerjs.model.addCaption({}, 'LániCAD  ·  BYKO Leiga', [frameW - 60, sby2 - 12], [frameW + 15, sby2 - 12])

  return makerjs.exporter.toSVG(model, {
    stroke: system === 'ST60' ? '#2a6a2a' : '#2a4a8a',
    strokeWidth: '1.5', fill: 'none', fontSize: '10px',
    units: makerjs.unitType.Millimeter,
    svgAttrs: { style: 'background: white' },
  })
}

/** Alufort slab/ceiling formwork — horizontal view */
function createSlabFormworkDrawing(slabWidth: number, slabDepth: number): string {
  const scale = 40
  const w = slabWidth * scale
  const d = slabDepth * scale // depth shown as height in 2D

  const model: makerjs.IModel = { models: {}, paths: {} }

  // Slab deck outline
  model.models!['slab'] = {
    paths: {
      left: new makerjs.paths.Line([0, 0], [0, d]),
      right: new makerjs.paths.Line([w, 0], [w, d]),
      top: new makerjs.paths.Line([0, d], [w, d]),
      bottom: new makerjs.paths.Line([0, 0], [w, 0]),
    }
  }

  // Panel grid — 2.4m × 0.9m panels
  const panelW = 240 * scale / 100
  const panelD = 90 * scale / 100
  for (let px = panelW; px < w - 5; px += panelW) {
    model.paths![`pgrid_v_${Math.round(px)}`] = new makerjs.paths.Line([px, 0], [px, d])
  }
  for (let py = panelD; py < d - 5; py += panelD) {
    model.paths![`pgrid_h_${Math.round(py)}`] = new makerjs.paths.Line([0, py], [w, py])
  }

  // Drop heads (circles at grid intersections)
  for (let px = panelW; px < w; px += panelW) {
    for (let py = panelD; py < d; py += panelD) {
      model.paths![`dh_${Math.round(px)}_${Math.round(py)}`] = new makerjs.paths.Circle([px, py], 4)
    }
  }

  // Props below (shown as downward arrows)
  const propSp = 120 * scale / 100
  for (let px = propSp / 2; px < w; px += propSp) {
    model.paths![`prop_${Math.round(px)}`] = new makerjs.paths.Line([px, 0], [px, -20])
    model.paths![`prop_l_${Math.round(px)}`] = new makerjs.paths.Line([px, -20], [px - 5, -15])
    model.paths![`prop_r_${Math.round(px)}`] = new makerjs.paths.Line([px, -20], [px + 5, -15])
  }

  // Dimensions
  model.paths!['wdim'] = new makerjs.paths.Line([0, -35], [w, -35])
  model.paths!['wdim_l'] = new makerjs.paths.Line([0, -39], [0, -31])
  model.paths!['wdim_r'] = new makerjs.paths.Line([w, -39], [w, -31])
  model.models!['wdim_text'] = makerjs.model.addCaption({}, `${slabWidth}m`, [5, -45], [w - 5, -45])

  const dimX = w + 15
  model.paths!['hdim'] = new makerjs.paths.Line([dimX, 0], [dimX, d])
  model.paths!['hdim_t'] = new makerjs.paths.Line([dimX - 4, d], [dimX + 4, d])
  model.paths!['hdim_b'] = new makerjs.paths.Line([dimX - 4, 0], [dimX + 4, 0])
  model.models!['hdim_text'] = makerjs.model.addCaption({}, `${slabDepth}m`, [dimX + 8, d / 2 - 10], [dimX + 8, d / 2 + 10])

  model.models!['title'] = makerjs.model.addCaption({}, `Alufort Plötumót — ${slabWidth}m × ${slabDepth}m`, [0, d + 15], [w, d + 15])

  // Scale bar (1m reference)
  const sby3 = -60
  const scaleLen3 = 1 * scale
  model.paths!['scale_line'] = new makerjs.paths.Line([0, sby3], [scaleLen3, sby3])
  model.paths!['scale_l'] = new makerjs.paths.Line([0, sby3 - 4], [0, sby3 + 4])
  model.paths!['scale_r'] = new makerjs.paths.Line([scaleLen3, sby3 - 4], [scaleLen3, sby3 + 4])
  model.models!['scale_text'] = makerjs.model.addCaption({}, '1 m', [5, sby3 - 12], [scaleLen3 - 5, sby3 - 12])
  // LániCAD branding
  model.models!['brand'] = makerjs.model.addCaption({}, 'LániCAD  ·  BYKO Leiga', [w - 60, sby3 - 12], [w + 15, sby3 - 12])

  return makerjs.exporter.toSVG(model, {
    stroke: '#5a5a8a', strokeWidth: '1.2', fill: 'none', fontSize: '10px',
    units: makerjs.unitType.Millimeter,
    svgAttrs: { style: 'background: white' },
  })
}

/** Column formwork — plan view of column box */
function createColumnFormworkDrawing(columnSize: number, columnHeight: number): string {
  const scale = 60
  const s = columnSize * scale
  const model: makerjs.IModel = { models: {}, paths: {} }

  // Outer column box (4 panels)
  model.models!['box'] = {
    paths: {
      left: new makerjs.paths.Line([0, 0], [0, s]),
      right: new makerjs.paths.Line([s, 0], [s, s]),
      top: new makerjs.paths.Line([0, s], [s, s]),
      bottom: new makerjs.paths.Line([0, 0], [s, 0]),
    }
  }

  // Inner concrete section (smaller)
  const wall = 0.15 * scale // 15cm wall thickness
  model.models!['inner'] = {
    paths: {
      left: new makerjs.paths.Line([wall, wall], [wall, s - wall]),
      right: new makerjs.paths.Line([s - wall, wall], [s - wall, s - wall]),
      top: new makerjs.paths.Line([wall, s - wall], [s - wall, s - wall]),
      bottom: new makerjs.paths.Line([wall, wall], [s - wall, wall]),
    }
  }

  // Clamp bolts (4 corners outside)
  for (const [cx, cy] of [[-8, s / 2], [s + 8, s / 2], [s / 2, -8], [s / 2, s + 8]] as [number, number][]) {
    model.paths![`bolt_${cx}_${cy}`] = new makerjs.paths.Circle([cx, cy], 3)
  }

  // Dimensions
  model.paths!['wdim'] = new makerjs.paths.Line([0, -20], [s, -20])
  model.paths!['wdim_l'] = new makerjs.paths.Line([0, -24], [0, -16])
  model.paths!['wdim_r'] = new makerjs.paths.Line([s, -24], [s, -16])
  model.models!['wdim_text'] = makerjs.model.addCaption({}, `${columnSize}m`, [5, -30], [s - 5, -30])

  model.models!['title'] = makerjs.model.addCaption({}, `Súlumót — ${columnSize}m × ${columnSize}m × ${columnHeight}m hæð`, [-20, s + 20], [s + 20, s + 20])

  // Scale bar (1m reference)
  const sby4 = -45
  const scaleLen4 = 1 * scale
  model.paths!['scale_line'] = new makerjs.paths.Line([0, sby4], [scaleLen4, sby4])
  model.paths!['scale_l'] = new makerjs.paths.Line([0, sby4 - 4], [0, sby4 + 4])
  model.paths!['scale_r'] = new makerjs.paths.Line([scaleLen4, sby4 - 4], [scaleLen4, sby4 + 4])
  model.models!['scale_text'] = makerjs.model.addCaption({}, '1 m', [5, sby4 - 12], [scaleLen4 - 5, sby4 - 12])
  // LániCAD branding
  model.models!['brand'] = makerjs.model.addCaption({}, 'LániCAD  ·  BYKO Leiga', [s - 20, sby4 - 12], [s + 60, sby4 - 12])

  return makerjs.exporter.toSVG(model, {
    stroke: '#6a4a2a', strokeWidth: '1.5', fill: 'none', fontSize: '10px',
    units: makerjs.unitType.Millimeter,
    svgAttrs: { style: 'background: white' },
  })
}

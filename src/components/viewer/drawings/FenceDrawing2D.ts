import makerjs from 'makerjs'

export type FenceStyle = 'standard' | 'plastic' | 'queue' | 'warning'

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
  fenceStyle?: FenceStyle
}): string {
  const { panels, panelWidth, panelHeight, stones, includeGate, fenceStyle = 'standard' } = params
  const scale = 100 // 1m = 100 units for fine detail
  const pw = panelWidth * scale
  const ph = panelHeight * scale * 0.15 // Top-down: depth is small
  const stoneSize = 20
  const totalWidth = panels * pw

  const model: makerjs.IModel = { models: {}, paths: {} }

  // Style labels for title
  const styleLabels: Record<FenceStyle, string> = {
    standard: 'Stálgirðing',
    plastic: 'Plastgirðing',
    queue: 'Biðraðagirðing',
    warning: 'Viðvörunarskilti',
  }

  // Draw panels per type
  for (let i = 0; i < panels; i++) {
    const x = i * pw
    // All types get an outer rectangle
    model.models![`panel_${i}`] = {
      paths: {
        bottom: new makerjs.paths.Line([x, 0], [x + pw, 0]),
        top: new makerjs.paths.Line([x, ph], [x + pw, ph]),
        left: new makerjs.paths.Line([x, 0], [x, ph]),
        right: new makerjs.paths.Line([x + pw, 0], [x + pw, ph]),
      },
    }

    if (fenceStyle === 'standard') {
      // Wire mesh — horizontal lines inside
      const meshLines = 3
      for (let m = 1; m <= meshLines; m++) {
        const my = (ph / (meshLines + 1)) * m
        model.paths![`mesh_h_${i}_${m}`] = new makerjs.paths.Line([x + 5, my], [x + pw - 5, my])
      }
      // Vertical mesh lines
      const vLines = Math.floor(pw / 30)
      for (let v = 1; v < vLines; v++) {
        const vx = x + v * 30
        model.paths![`mesh_v_${i}_${v}`] = new makerjs.paths.Line([vx, 3], [vx, ph - 3])
      }
    } else if (fenceStyle === 'plastic') {
      // Solid fill — diagonal hatching to indicate solid plastic
      for (let d = 0; d < pw + ph; d += 15) {
        const x1 = x + Math.max(0, d - ph)
        const y1 = Math.min(d, ph)
        const x2 = x + Math.min(d, pw)
        const y2 = Math.max(0, d - pw)
        if (x1 <= x + pw && x2 >= x) {
          model.paths![`hatch_${i}_${d}`] = new makerjs.paths.Line([x1, y1], [x2, y2])
        }
      }
    } else if (fenceStyle === 'queue') {
      // Queue barrier — two horizontal rails with vertical posts
      const railY1 = ph * 0.35
      const railY2 = ph * 0.65
      model.paths![`qr1_${i}`] = new makerjs.paths.Line([x + 5, railY1], [x + pw - 5, railY1])
      model.paths![`qr2_${i}`] = new makerjs.paths.Line([x + 5, railY2], [x + pw - 5, railY2])
    } else if (fenceStyle === 'warning') {
      // Warning sign — X pattern inside
      model.paths![`warn_x1_${i}`] = new makerjs.paths.Line([x + 5, 5], [x + pw - 5, ph - 5])
      model.paths![`warn_x2_${i}`] = new makerjs.paths.Line([x + 5, ph - 5], [x + pw - 5, 5])
    }
  }

  // Stones / bases (not for warning signs)
  if (fenceStyle !== 'warning') {
    for (let i = 0; i <= panels; i++) {
      if (i < stones) {
        const cx = i * pw
        const cy = ph / 2
        if (fenceStyle === 'plastic' || fenceStyle === 'queue') {
          // Weighted base — small square
          const bs = stoneSize / 2
          model.paths![`base_t_${i}`] = new makerjs.paths.Line([cx - bs, cy - bs], [cx + bs, cy - bs])
          model.paths![`base_b_${i}`] = new makerjs.paths.Line([cx - bs, cy + bs], [cx + bs, cy + bs])
          model.paths![`base_l_${i}`] = new makerjs.paths.Line([cx - bs, cy - bs], [cx - bs, cy + bs])
          model.paths![`base_r_${i}`] = new makerjs.paths.Line([cx + bs, cy - bs], [cx + bs, cy + bs])
        } else {
          // Concrete stone — circle
          model.paths![`stone_${i}`] = new makerjs.paths.Circle([cx, cy], stoneSize / 2)
        }
      }
    }
  }

  // Draw clamps (small X marks between panels)
  if (fenceStyle === 'standard') {
    for (let i = 1; i < panels; i++) {
      const cx = i * pw
      model.paths![`clamp_top_${i}`] = new makerjs.paths.Line([cx - 5, ph + 8], [cx + 5, ph + 18])
      model.paths![`clamp_bot_${i}`] = new makerjs.paths.Line([cx - 5, ph + 18], [cx + 5, ph + 8])
    }
  }

  // Draw gate (if included) — replace last panel with gate symbol
  if (includeGate && panels > 1 && fenceStyle === 'standard') {
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
    `${styleLabels[fenceStyle]} — ${panels} × ${panelWidth}m (h: ${panelHeight}m)`,
    [0, ph + 40],
    [totalWidth, ph + 40]
  )

  return makerjs.exporter.toSVG(model, {
    stroke: fenceStyle === 'plastic' ? '#e07020' : fenceStyle === 'warning' ? '#cc0000' : '#404042',
    strokeWidth: '1.5',
    fill: 'none',
    fontSize: '12px',
    units: makerjs.unitType.Millimeter,
    svgAttrs: { style: 'background: white' },
  })
}

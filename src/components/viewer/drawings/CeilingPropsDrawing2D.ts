import makerjs from 'makerjs'

/**
 * Generate a 2D elevation view of ceiling props with HT-20 beams
 */
export function createCeilingPropsDrawing(params: {
  propCount: number
  propHeight: number  // meters
  beamCount: number
  roomWidth: number   // meters
}): string {
  const { propCount, propHeight, beamCount, roomWidth } = params
  const scale = 50

  const w = roomWidth * scale
  const h = propHeight * scale

  const model: makerjs.IModel = { models: {}, paths: {} }

  // Floor line
  model.paths!['floor'] = new makerjs.paths.Line([-10, 0], [w + 10, 0])

  // Ceiling line
  model.paths!['ceiling'] = new makerjs.paths.Line([-10, h], [w + 10, h])

  // Ceiling slab (hatched area above ceiling line)
  const slabH = 15
  model.paths!['slab_top'] = new makerjs.paths.Line([-10, h + slabH], [w + 10, h + slabH])
  // Hatch lines
  for (let hx = -10; hx < w + 20; hx += 12) {
    model.paths![`hatch_${hx}`] = new makerjs.paths.Line([hx, h], [hx + slabH, h + slabH])
  }

  // Props (vertical lines with adjustable section)
  const spacing = propCount > 1 ? w / (propCount - 1) : w / 2
  for (let i = 0; i < propCount; i++) {
    const x = propCount === 1 ? w / 2 : i * spacing
    // Main tube
    model.paths![`prop_${i}`] = new makerjs.paths.Line([x, 0], [x, h])
    // Inner tube (telescopic)
    model.paths![`inner_${i}`] = new makerjs.paths.Line([x - 2, h * 0.4], [x - 2, h])
    model.paths![`inner2_${i}`] = new makerjs.paths.Line([x + 2, h * 0.4], [x + 2, h])
    // Base plate
    model.paths![`base_l_${i}`] = new makerjs.paths.Line([x - 8, 0], [x + 8, 0])
    model.paths![`base_ll_${i}`] = new makerjs.paths.Line([x - 8, -3], [x - 8, 0])
    model.paths![`base_rr_${i}`] = new makerjs.paths.Line([x + 8, -3], [x + 8, 0])
    model.paths![`base_b_${i}`] = new makerjs.paths.Line([x - 8, -3], [x + 8, -3])
    // Head plate
    model.paths![`head_${i}`] = new makerjs.paths.Line([x - 6, h], [x + 6, h])
  }

  // Beams (horizontal rectangles just below ceiling)
  if (beamCount > 0) {
    const beamSpacing = w / (beamCount + 1)
    for (let i = 0; i < beamCount; i++) {
      const bx = (i + 1) * beamSpacing
      const beamW = 8
      const beamH = 20
      model.models![`beam_${i}`] = {
        paths: {
          l: new makerjs.paths.Line([bx - beamW / 2, h - beamH], [bx - beamW / 2, h]),
          r: new makerjs.paths.Line([bx + beamW / 2, h - beamH], [bx + beamW / 2, h]),
          b: new makerjs.paths.Line([bx - beamW / 2, h - beamH], [bx + beamW / 2, h - beamH]),
          t: new makerjs.paths.Line([bx - beamW / 2, h], [bx + beamW / 2, h]),
        }
      }
    }
  }

  // Height dimension
  const dimX = w + 20
  model.paths!['hdim'] = new makerjs.paths.Line([dimX, 0], [dimX, h])
  model.paths!['hdim_t'] = new makerjs.paths.Line([dimX - 4, h], [dimX + 4, h])
  model.paths!['hdim_b'] = new makerjs.paths.Line([dimX - 4, 0], [dimX + 4, 0])
  model.models!['hdim_text'] = makerjs.model.addCaption(
    {},
    `${propHeight}m`,
    [dimX + 8, h / 2 - 10],
    [dimX + 8, h / 2 + 10]
  )

  // Width dimension
  model.paths!['wdim'] = new makerjs.paths.Line([0, -15], [w, -15])
  model.paths!['wdim_l'] = new makerjs.paths.Line([0, -19], [0, -11])
  model.paths!['wdim_r'] = new makerjs.paths.Line([w, -19], [w, -11])
  model.models!['wdim_text'] = makerjs.model.addCaption(
    {},
    `${roomWidth}m`,
    [5, -25],
    [w - 5, -25]
  )

  // Title
  model.models!['title'] = makerjs.model.addCaption(
    {},
    `Loftastoðir — ${propCount} stoðir × ${propHeight}m + ${beamCount} bitar`,
    [0, h + slabH + 15],
    [w, h + slabH + 15]
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

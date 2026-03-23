import makerjs from 'makerjs'

/**
 * Generate a 2D elevation view of Protecto edge protection / guardrail system
 * Protecto: temporary edge protection for construction sites (roof edges, floor openings, etc.)
 */
export function createProtectoDrawing(params: {
  length: number     // meters — total guardrail run
  height: number     // meters — post height (typically 1.0-1.3m)
  postSpacing?: number // meters between posts (default 2.0m)
}): string {
  const { length, height, postSpacing = 2.0 } = params
  const scale = 50

  const w = length * scale
  const h = height * scale
  const posts = Math.max(2, Math.floor(length / postSpacing) + 1)
  const actualSpacing = length / (posts - 1)

  const model: makerjs.IModel = { models: {}, paths: {} }

  // Draw posts (vertical standards)
  for (let i = 0; i < posts; i++) {
    const px = i * actualSpacing * scale
    // Post vertical tube
    model.paths![`post_${i}`] = new makerjs.paths.Line([px, 0], [px, h])
    // Base clamp/bracket (rectangle at bottom)
    model.paths![`base_l_${i}`] = new makerjs.paths.Line([px - 6, 0], [px - 6, -8])
    model.paths![`base_r_${i}`] = new makerjs.paths.Line([px + 6, 0], [px + 6, -8])
    model.paths![`base_b_${i}`] = new makerjs.paths.Line([px - 6, -8], [px + 6, -8])
  }

  // Top rail (continuous)
  model.paths!['top_rail'] = new makerjs.paths.Line([0, h], [w, h])

  // Mid rail (at ~50% height)
  model.paths!['mid_rail'] = new makerjs.paths.Line([0, h * 0.5], [w, h * 0.5])

  // Toe board at bottom (10cm high plank)
  const toeH = 10 * scale / 100
  model.paths!['toe_top'] = new makerjs.paths.Line([0, toeH], [w, toeH])
  model.paths!['toe_bot'] = new makerjs.paths.Line([0, 0], [w, 0])

  // Mesh net between mid-rail and toe board (optional for some variants — show as diagonal lines)
  for (let i = 0; i < posts - 1; i++) {
    const x1 = i * actualSpacing * scale
    const x2 = (i + 1) * actualSpacing * scale
    // Safety net diagonal hatching
    for (let d = 0; d < 3; d++) {
      const fx = x1 + (x2 - x1) * ((d + 1) / 4)
      model.paths![`net_${i}_${d}`] = new makerjs.paths.Line([fx, toeH], [fx - 10, h * 0.5])
    }
  }

  // Height dimension
  const dimX = w + 15
  model.paths!['hdim'] = new makerjs.paths.Line([dimX, 0], [dimX, h])
  model.paths!['hdim_t'] = new makerjs.paths.Line([dimX - 4, h], [dimX + 4, h])
  model.paths!['hdim_b'] = new makerjs.paths.Line([dimX - 4, 0], [dimX + 4, 0])
  model.models!['hdim_text'] = makerjs.model.addCaption({}, `${height}m`, [dimX + 8, h / 2 - 10], [dimX + 8, h / 2 + 10])

  // Width dimension
  model.paths!['wdim'] = new makerjs.paths.Line([0, -18], [w, -18])
  model.paths!['wdim_l'] = new makerjs.paths.Line([0, -22], [0, -14])
  model.paths!['wdim_r'] = new makerjs.paths.Line([w, -22], [w, -14])
  model.models!['wdim_text'] = makerjs.model.addCaption({}, `${length}m`, [5, -28], [w - 5, -28])

  // Post spacing dimension (first bay)
  if (posts > 1) {
    const sp = actualSpacing * scale
    model.paths!['spdim'] = new makerjs.paths.Line([0, h + 10], [sp, h + 10])
    model.paths!['spdim_l'] = new makerjs.paths.Line([0, h + 6], [0, h + 14])
    model.paths!['spdim_r'] = new makerjs.paths.Line([sp, h + 6], [sp, h + 14])
    model.models!['spdim_text'] = makerjs.model.addCaption({}, `${actualSpacing.toFixed(1)}m`, [5, h + 18], [sp - 5, h + 18])
  }

  // Title
  model.models!['title'] = makerjs.model.addCaption(
    {},
    `Protecto Öryggisgrind — ${length}m × ${height}m`,
    [0, h + 30],
    [w, h + 30]
  )

  return makerjs.exporter.toSVG(model, {
    stroke: '#cc6600',
    strokeWidth: '1.5',
    fill: 'none',
    fontSize: '10px',
    units: makerjs.unitType.Millimeter,
    svgAttrs: { style: 'background: white' },
  })
}

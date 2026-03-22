// ── DXF Import Parser ──
// Parses AutoCAD DXF text files and converts entities to CadObject[]

import type { CadObject, CadGeometry, CadLayer, CadStyle } from '@/types/cad'
import { cadId } from '@/types/cad'

interface DxfEntity {
  type: string
  layer?: string
  color?: number
  pairs: Map<number, string[]>
}

/** Parse a DXF text file and return CadObjects + any new layers found */
export function importDxf(content: string): { objects: CadObject[]; layers: CadLayer[] } {
  const lines = content.split(/\r?\n/)
  const entities = parseEntities(lines)
  const layers = parseLayers(lines)
  const objects: CadObject[] = []

  for (const ent of entities) {
    const geo = entityToGeometry(ent)
    if (!geo) continue

    const layerId = ent.layer || 'annotation'
    const style = styleFromEntity(ent, layers)
    objects.push({
      id: cadId(),
      layerId,
      style,
      locked: false,
      geometry: geo,
    })
  }

  return { objects, layers }
}

function parseLayers(lines: string[]): CadLayer[] {
  const layers: CadLayer[] = []
  let inTables = false
  let inLayer = false
  let name = ''
  let color = '#2563eb'

  for (let i = 0; i < lines.length - 1; i += 2) {
    const code = parseInt(lines[i].trim())
    const value = lines[i + 1]?.trim() ?? ''

    if (code === 2 && value === 'TABLES') inTables = true
    if (code === 0 && value === 'ENDSEC') inTables = false

    if (inTables && code === 0 && value === 'LAYER') {
      inLayer = true
      name = ''
      color = '#2563eb'
    }

    if (inLayer) {
      if (code === 2) name = value
      if (code === 62) color = dxfColorToHex(parseInt(value))
      if (code === 0 && value !== 'LAYER' && name) {
        layers.push({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          color,
          visible: true,
          locked: false,
          lineWidth: 1,
        })
        inLayer = false
      }
    }
  }

  return layers
}

function parseEntities(lines: string[]): DxfEntity[] {
  const entities: DxfEntity[] = []
  let inEntities = false
  let current: DxfEntity | null = null

  for (let i = 0; i < lines.length - 1; i += 2) {
    const code = parseInt(lines[i].trim())
    const value = lines[i + 1]?.trim() ?? ''

    if (code === 2 && value === 'ENTITIES') { inEntities = true; continue }
    if (inEntities && code === 0 && value === 'ENDSEC') break

    if (inEntities && code === 0) {
      if (current) entities.push(current)
      current = { type: value, pairs: new Map() }
      continue
    }

    if (current) {
      if (code === 8) current.layer = value
      if (code === 62) current.color = parseInt(value)
      const existing = current.pairs.get(code)
      if (existing) existing.push(value)
      else current.pairs.set(code, [value])
    }
  }
  if (current) entities.push(current)

  return entities
}

function getNum(ent: DxfEntity, code: number, idx = 0): number {
  return parseFloat(ent.pairs.get(code)?.[idx] ?? '0') || 0
}

function entityToGeometry(ent: DxfEntity): CadGeometry | null {
  switch (ent.type) {
    case 'LINE':
      return {
        type: 'line',
        start: { x: getNum(ent, 10), y: -getNum(ent, 20) },
        end: { x: getNum(ent, 11), y: -getNum(ent, 21) },
      }

    case 'CIRCLE':
      return {
        type: 'circle',
        center: { x: getNum(ent, 10), y: -getNum(ent, 20) },
        radius: getNum(ent, 40),
      }

    case 'ARC':
      return {
        type: 'arc',
        center: { x: getNum(ent, 10), y: -getNum(ent, 20) },
        radius: getNum(ent, 40),
        startAngle: (getNum(ent, 50) * Math.PI) / 180,
        endAngle: (getNum(ent, 51) * Math.PI) / 180,
      }

    case 'TEXT':
    case 'MTEXT':
      return {
        type: 'text',
        position: { x: getNum(ent, 10), y: -getNum(ent, 20) },
        content: ent.pairs.get(1)?.[0] ?? '',
        fontSize: getNum(ent, 40) || 12,
        rotation: getNum(ent, 50),
      }

    case 'LWPOLYLINE':
    case 'POLYLINE': {
      const xs = ent.pairs.get(10) ?? []
      const ys = ent.pairs.get(20) ?? []
      if (xs.length < 2) return null
      const points = xs.map((x, i) => ({
        x: parseFloat(x),
        y: -(parseFloat(ys[i] ?? '0')),
      }))
      const closed = (parseInt(ent.pairs.get(70)?.[0] ?? '0') & 1) === 1
      return { type: 'polyline', points, closed }
    }

    case 'INSERT':
    case 'SPLINE': {
      // Import SPLINE as polyline using control points
      const xs = ent.pairs.get(10) ?? []
      const ys = ent.pairs.get(20) ?? []
      if (xs.length < 2) return null
      const points = xs.map((x, i) => ({
        x: parseFloat(x),
        y: -(parseFloat(ys[i] ?? '0')),
      }))
      const closed = (parseInt(ent.pairs.get(70)?.[0] ?? '0') & 1) === 1
      return { type: 'polyline', points, closed }
    }

    case 'ELLIPSE': {
      // DXF ELLIPSE: center (10,20), major axis endpoint relative (11,21), minor/major ratio (40)
      const cx = getNum(ent, 10), cy = -getNum(ent, 20)
      const majorDx = getNum(ent, 11), majorDy = -getNum(ent, 21)
      const ratio = getNum(ent, 40) || 0.5
      const majorLen = Math.sqrt(majorDx * majorDx + majorDy * majorDy)
      const minorLen = majorLen * ratio
      const rotation = Math.atan2(majorDy, majorDx) * 180 / Math.PI
      return {
        type: 'ellipse',
        center: { x: cx, y: cy },
        rx: majorLen,
        ry: minorLen,
        rotation,
      }
    }

    case 'DIMENSION': {
      // Import dimension as a simple line dimension
      // DXF dimensions have definition points at code 13/23 and 14/24
      const sx = getNum(ent, 13), sy = -getNum(ent, 23)
      const ex = getNum(ent, 14), ey = -getNum(ent, 24)
      // Dimension line point (10,20)
      const dimX = getNum(ent, 10), dimY = -getNum(ent, 20)
      // Calculate offset from midpoint
      const mx = (sx + ex) / 2, my = (sy + ey) / 2
      const ddx = ex - sx, ddy = ey - sy
      const ln = Math.sqrt(ddx * ddx + ddy * ddy)
      let offset = 20
      if (ln > 0.1) {
        const nx = -ddy / ln, ny = ddx / ln
        offset = (dimX - mx) * nx + (dimY - my) * ny
      }
      return {
        type: 'dimension',
        start: { x: sx, y: sy },
        end: { x: ex, y: ey },
        offset: Math.abs(offset) < 1 ? 20 : offset,
      }
    }

    default:
      return null
  }
}

function styleFromEntity(ent: DxfEntity, layers: CadLayer[]): CadStyle {
  const layerDef = layers.find(l => l.name === ent.layer)
  const color = ent.color != null ? dxfColorToHex(ent.color) : layerDef?.color ?? '#2563eb'
  return {
    stroke: color,
    strokeWidth: layerDef?.lineWidth ?? 1,
    fill: 'none',
    opacity: 1,
  }
}

const DXF_COLORS: Record<number, string> = {
  1: '#ff0000', 2: '#ffff00', 3: '#00ff00', 4: '#00ffff',
  5: '#0000ff', 6: '#ff00ff', 7: '#ffffff', 8: '#808080',
  9: '#c0c0c0',
}

function dxfColorToHex(color: number): string {
  return DXF_COLORS[color] ?? '#2563eb'
}

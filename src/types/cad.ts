// ── CAD Types for LániCAD Drawing Engine ──

export interface Point2D {
  x: number
  y: number
}

export type CadToolType =
  | 'select'
  | 'pan'
  | 'line'
  | 'rect'
  | 'circle'
  | 'ellipse'
  | 'polygon'
  | 'arc'
  | 'polyline'
  | 'text'
  | 'dimension'
  | 'measure'
  | 'offset'

// ── Geometry (discriminated union) ──

export interface LineGeometry { type: 'line'; start: Point2D; end: Point2D }
export interface RectGeometry { type: 'rect'; origin: Point2D; width: number; height: number; rotation: number }
export interface CircleGeometry { type: 'circle'; center: Point2D; radius: number }
export interface ArcGeometry { type: 'arc'; center: Point2D; radius: number; startAngle: number; endAngle: number }
export interface PolylineGeometry { type: 'polyline'; points: Point2D[]; closed: boolean }
export interface TextGeometry { type: 'text'; position: Point2D; content: string; fontSize: number; rotation: number }
export interface DimensionGeometry { type: 'dimension'; start: Point2D; end: Point2D; offset: number }
export interface EllipseGeometry { type: 'ellipse'; center: Point2D; rx: number; ry: number; rotation: number }
export interface PolygonGeometry { type: 'polygon'; center: Point2D; radius: number; sides: number; rotation: number }
export interface ImageGeometry { type: 'image'; origin: Point2D; width: number; height: number; dataUrl: string }

export type CadGeometry =
  | LineGeometry | RectGeometry | CircleGeometry | ArcGeometry
  | PolylineGeometry | TextGeometry | DimensionGeometry
  | EllipseGeometry | PolygonGeometry | ImageGeometry

// ── Style, Object, Layer ──

export interface CadStyle {
  stroke: string
  strokeWidth: number
  fill: string
  opacity: number
  lineDash?: number[]
}

export interface CadObject {
  id: string
  layerId: string
  style: CadStyle
  locked: boolean
  geometry: CadGeometry
}

export interface CadLayer {
  id: string
  name: string
  color: string
  visible: boolean
  locked: boolean
  lineWidth: number
}

// ── Settings ──

export interface GridSettings {
  enabled: boolean
  size: number
  snap: boolean
}

export interface Viewport {
  x: number
  y: number
  w: number
  h: number
}

// ── Drawing Phase State Machine ──

export type DrawingPhase =
  | null
  | { tool: 'line'; start: Point2D }
  | { tool: 'rect'; start: Point2D }
  | { tool: 'circle'; center: Point2D }
  | { tool: 'ellipse'; center: Point2D; rx?: number }
  | { tool: 'polygon'; center: Point2D; sides: number }
  | { tool: 'arc'; center: Point2D; radius?: number; startAngle?: number }
  | { tool: 'polyline'; points: Point2D[] }
  | { tool: 'dimension'; start: Point2D; end?: Point2D }
  | { tool: 'measure'; start: Point2D }
  | { tool: 'offset'; sourceId?: string }
  | { tool: 'select-box'; start: Point2D }
  | { tool: 'moving'; startWorld: Point2D }
  | { tool: 'panning'; startScreenX: number; startScreenY: number; startVp: Viewport }
  | { tool: 'text-input'; position: Point2D }

// ── Snap ──

export interface SnapResult {
  point: Point2D
  type: 'grid' | 'endpoint' | 'midpoint' | 'center' | 'intersection' | 'nearest' | 'none'
}

// ── Defaults ──

export const DEFAULT_LAYERS: CadLayer[] = [
  { id: 'pdf-background', name: 'PDF bakgrunnur', color: '#94a3b8', visible: true, locked: true, lineWidth: 0 },
  { id: 'equipment', name: 'Búnaður', color: '#404042', visible: true, locked: true, lineWidth: 1 },
  { id: 'annotation', name: 'Athugasemdir', color: '#2563eb', visible: true, locked: false, lineWidth: 1 },
  { id: 'dimension', name: 'Mál', color: '#dc2626', visible: true, locked: false, lineWidth: 0.5 },
  { id: 'construction', name: 'Hjálparlínur', color: '#16a34a', visible: true, locked: false, lineWidth: 0.3 },
  { id: 'custom', name: 'Sérsniðið', color: '#9333ea', visible: true, locked: false, lineWidth: 1 },
]

let _cadIdCounter = 0
export function cadId(): string {
  return `cad_${Date.now()}_${++_cadIdCounter}`
}

export function defaultStyle(layer: CadLayer): CadStyle {
  return { stroke: layer.color, strokeWidth: layer.lineWidth, fill: 'none', opacity: 1 }
}

// ── Geometry Helpers ──

export function dist(a: Point2D, b: Point2D): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

export function distToSegment(p: Point2D, a: Point2D, b: Point2D): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return dist(p, a)
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq))
  return dist(p, { x: a.x + t * dx, y: a.y + t * dy })
}

export function getBoundingBox(obj: CadObject): { minX: number; minY: number; maxX: number; maxY: number } {
  const geo = obj.geometry
  switch (geo.type) {
    case 'line':
      return { minX: Math.min(geo.start.x, geo.end.x), minY: Math.min(geo.start.y, geo.end.y), maxX: Math.max(geo.start.x, geo.end.x), maxY: Math.max(geo.start.y, geo.end.y) }
    case 'rect':
      return { minX: geo.origin.x, minY: geo.origin.y, maxX: geo.origin.x + geo.width, maxY: geo.origin.y + geo.height }
    case 'circle':
      return { minX: geo.center.x - geo.radius, minY: geo.center.y - geo.radius, maxX: geo.center.x + geo.radius, maxY: geo.center.y + geo.radius }
    case 'arc':
      return { minX: geo.center.x - geo.radius, minY: geo.center.y - geo.radius, maxX: geo.center.x + geo.radius, maxY: geo.center.y + geo.radius }
    case 'polyline': {
      if (geo.points.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      for (const p of geo.points) {
        if (p.x < minX) minX = p.x; if (p.y < minY) minY = p.y
        if (p.x > maxX) maxX = p.x; if (p.y > maxY) maxY = p.y
      }
      return { minX, minY, maxX, maxY }
    }
    case 'text': {
      const w = geo.content.length * geo.fontSize * 0.6
      return { minX: geo.position.x, minY: geo.position.y - geo.fontSize, maxX: geo.position.x + w, maxY: geo.position.y + geo.fontSize * 0.2 }
    }
    case 'dimension': {
      const pad = Math.abs(geo.offset) + 20
      return { minX: Math.min(geo.start.x, geo.end.x) - pad, minY: Math.min(geo.start.y, geo.end.y) - pad, maxX: Math.max(geo.start.x, geo.end.x) + pad, maxY: Math.max(geo.start.y, geo.end.y) + pad }
    }
    case 'ellipse': {
      const r = Math.max(geo.rx, geo.ry)
      return { minX: geo.center.x - r, minY: geo.center.y - r, maxX: geo.center.x + r, maxY: geo.center.y + r }
    }
    case 'polygon': {
      const pts = polygonVertices(geo.center, geo.radius, geo.sides, geo.rotation)
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      for (const p of pts) { if (p.x < minX) minX = p.x; if (p.y < minY) minY = p.y; if (p.x > maxX) maxX = p.x; if (p.y > maxY) maxY = p.y }
      return { minX, minY, maxX, maxY }
    }
    case 'image':
      return { minX: geo.origin.x, minY: geo.origin.y, maxX: geo.origin.x + geo.width, maxY: geo.origin.y + geo.height }
  }
}

export function moveGeometry(geo: CadGeometry, dx: number, dy: number): CadGeometry {
  switch (geo.type) {
    case 'line':
      return { ...geo, start: { x: geo.start.x + dx, y: geo.start.y + dy }, end: { x: geo.end.x + dx, y: geo.end.y + dy } }
    case 'rect':
      return { ...geo, origin: { x: geo.origin.x + dx, y: geo.origin.y + dy } }
    case 'circle':
      return { ...geo, center: { x: geo.center.x + dx, y: geo.center.y + dy } }
    case 'arc':
      return { ...geo, center: { x: geo.center.x + dx, y: geo.center.y + dy } }
    case 'polyline':
      return { ...geo, points: geo.points.map(p => ({ x: p.x + dx, y: p.y + dy })) }
    case 'text':
      return { ...geo, position: { x: geo.position.x + dx, y: geo.position.y + dy } }
    case 'dimension':
      return { ...geo, start: { x: geo.start.x + dx, y: geo.start.y + dy }, end: { x: geo.end.x + dx, y: geo.end.y + dy } }
    case 'ellipse':
      return { ...geo, center: { x: geo.center.x + dx, y: geo.center.y + dy } }
    case 'polygon':
      return { ...geo, center: { x: geo.center.x + dx, y: geo.center.y + dy } }
    case 'image':
      return { ...geo, origin: { x: geo.origin.x + dx, y: geo.origin.y + dy } }
  }
}

/** Get vertices of a regular polygon */
export function polygonVertices(center: Point2D, radius: number, sides: number, rotation: number): Point2D[] {
  const pts: Point2D[] = []
  const rotRad = rotation * Math.PI / 180
  for (let i = 0; i < sides; i++) {
    const angle = rotRad + (2 * Math.PI * i) / sides - Math.PI / 2
    pts.push({ x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) })
  }
  return pts
}

/** Rotate geometry around a pivot point by angle in degrees */
export function rotateGeometry(geo: CadGeometry, pivot: Point2D, angleDeg: number): CadGeometry {
  const rad = angleDeg * Math.PI / 180
  const rotPt = (p: Point2D): Point2D => {
    const dx = p.x - pivot.x, dy = p.y - pivot.y
    return { x: pivot.x + dx * Math.cos(rad) - dy * Math.sin(rad), y: pivot.y + dx * Math.sin(rad) + dy * Math.cos(rad) }
  }
  switch (geo.type) {
    case 'line': return { ...geo, start: rotPt(geo.start), end: rotPt(geo.end) }
    case 'rect': {
      const c = { x: geo.origin.x + geo.width / 2, y: geo.origin.y + geo.height / 2 }
      const nc = rotPt(c)
      return { ...geo, origin: { x: nc.x - geo.width / 2, y: nc.y - geo.height / 2 }, rotation: (geo.rotation || 0) + angleDeg }
    }
    case 'circle': return { ...geo, center: rotPt(geo.center) }
    case 'ellipse': return { ...geo, center: rotPt(geo.center), rotation: (geo.rotation || 0) + angleDeg }
    case 'arc': return { ...geo, center: rotPt(geo.center), startAngle: geo.startAngle + angleDeg, endAngle: geo.endAngle + angleDeg }
    case 'polyline': return { ...geo, points: geo.points.map(rotPt) }
    case 'polygon': return { ...geo, center: rotPt(geo.center), rotation: (geo.rotation || 0) + angleDeg }
    case 'text': return { ...geo, position: rotPt(geo.position), rotation: (geo.rotation || 0) + angleDeg }
    case 'dimension': return { ...geo, start: rotPt(geo.start), end: rotPt(geo.end) }
    case 'image': {
      const c = { x: geo.origin.x + geo.width / 2, y: geo.origin.y + geo.height / 2 }
      const nc = rotPt(c)
      return { ...geo, origin: { x: nc.x - geo.width / 2, y: nc.y - geo.height / 2 } }
    }
  }
}

/** Scale geometry around a pivot point */
export function scaleGeometry(geo: CadGeometry, pivot: Point2D, factor: number): CadGeometry {
  const scalePt = (p: Point2D): Point2D => ({
    x: pivot.x + (p.x - pivot.x) * factor,
    y: pivot.y + (p.y - pivot.y) * factor,
  })
  switch (geo.type) {
    case 'line': return { ...geo, start: scalePt(geo.start), end: scalePt(geo.end) }
    case 'rect': return { ...geo, origin: scalePt(geo.origin), width: geo.width * factor, height: geo.height * factor }
    case 'circle': return { ...geo, center: scalePt(geo.center), radius: geo.radius * factor }
    case 'ellipse': return { ...geo, center: scalePt(geo.center), rx: geo.rx * factor, ry: geo.ry * factor }
    case 'arc': return { ...geo, center: scalePt(geo.center), radius: geo.radius * factor }
    case 'polyline': return { ...geo, points: geo.points.map(scalePt) }
    case 'polygon': return { ...geo, center: scalePt(geo.center), radius: geo.radius * factor }
    case 'text': return { ...geo, position: scalePt(geo.position), fontSize: geo.fontSize * factor }
    case 'dimension': return { ...geo, start: scalePt(geo.start), end: scalePt(geo.end), offset: geo.offset * factor }
    case 'image': return { ...geo, origin: scalePt(geo.origin), width: geo.width * factor, height: geo.height * factor }
  }
}

/** Mirror geometry across an axis through a point */
export function mirrorGeometry(geo: CadGeometry, axis: 'x' | 'y', pivot: Point2D): CadGeometry {
  const mirrorPt = (p: Point2D): Point2D =>
    axis === 'x' ? { x: p.x, y: 2 * pivot.y - p.y } : { x: 2 * pivot.x - p.x, y: p.y }
  switch (geo.type) {
    case 'line': return { ...geo, start: mirrorPt(geo.start), end: mirrorPt(geo.end) }
    case 'rect': {
      const np = mirrorPt({ x: geo.origin.x + (axis === 'y' ? geo.width : 0), y: geo.origin.y + (axis === 'x' ? geo.height : 0) })
      return { ...geo, origin: np }
    }
    case 'circle': return { ...geo, center: mirrorPt(geo.center) }
    case 'ellipse': return { ...geo, center: mirrorPt(geo.center) }
    case 'arc': {
      const nc = mirrorPt(geo.center)
      const flipAngle = (a: number) => axis === 'x' ? -a : (180 - a)
      return { ...geo, center: nc, startAngle: flipAngle(geo.endAngle), endAngle: flipAngle(geo.startAngle) }
    }
    case 'polyline': return { ...geo, points: geo.points.map(mirrorPt) }
    case 'polygon': return { ...geo, center: mirrorPt(geo.center) }
    case 'text': return { ...geo, position: mirrorPt(geo.position) }
    case 'dimension': return { ...geo, start: mirrorPt(geo.start), end: mirrorPt(geo.end), offset: axis === 'x' ? -geo.offset : geo.offset }
    case 'image': {
      const np = mirrorPt({ x: geo.origin.x + (axis === 'y' ? geo.width : 0), y: geo.origin.y + (axis === 'x' ? geo.height : 0) })
      return { ...geo, origin: np }
    }
  }
}

/** Create an offset copy of geometry */
export function offsetGeometry(geo: CadGeometry, distance: number): CadGeometry | null {
  switch (geo.type) {
    case 'line': {
      const dx = geo.end.x - geo.start.x, dy = geo.end.y - geo.start.y
      const len = Math.sqrt(dx * dx + dy * dy)
      if (len < 0.001) return null
      const nx = -dy / len * distance, ny = dx / len * distance
      return { ...geo, start: { x: geo.start.x + nx, y: geo.start.y + ny }, end: { x: geo.end.x + nx, y: geo.end.y + ny } }
    }
    case 'rect':
      return { ...geo, origin: { x: geo.origin.x - distance, y: geo.origin.y - distance }, width: geo.width + 2 * distance, height: geo.height + 2 * distance }
    case 'circle':
      return { ...geo, radius: Math.max(0.1, geo.radius + distance) }
    case 'ellipse':
      return { ...geo, rx: Math.max(0.1, geo.rx + distance), ry: Math.max(0.1, geo.ry + distance) }
    case 'arc':
      return { ...geo, radius: Math.max(0.1, geo.radius + distance) }
    case 'polygon':
      return { ...geo, radius: Math.max(0.1, geo.radius + distance) }
    default:
      return null
  }
}

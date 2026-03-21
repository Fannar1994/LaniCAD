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
  | 'arc'
  | 'polyline'
  | 'text'
  | 'dimension'
  | 'measure'

// ── Geometry (discriminated union) ──

export interface LineGeometry { type: 'line'; start: Point2D; end: Point2D }
export interface RectGeometry { type: 'rect'; origin: Point2D; width: number; height: number; rotation: number }
export interface CircleGeometry { type: 'circle'; center: Point2D; radius: number }
export interface ArcGeometry { type: 'arc'; center: Point2D; radius: number; startAngle: number; endAngle: number }
export interface PolylineGeometry { type: 'polyline'; points: Point2D[]; closed: boolean }
export interface TextGeometry { type: 'text'; position: Point2D; content: string; fontSize: number; rotation: number }
export interface DimensionGeometry { type: 'dimension'; start: Point2D; end: Point2D; offset: number }

export type CadGeometry =
  | LineGeometry | RectGeometry | CircleGeometry | ArcGeometry
  | PolylineGeometry | TextGeometry | DimensionGeometry

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
  | { tool: 'arc'; center: Point2D; radius?: number; startAngle?: number }
  | { tool: 'polyline'; points: Point2D[] }
  | { tool: 'dimension'; start: Point2D; end?: Point2D }
  | { tool: 'measure'; start: Point2D }
  | { tool: 'select-box'; start: Point2D }
  | { tool: 'moving'; startWorld: Point2D }
  | { tool: 'panning'; startScreenX: number; startScreenY: number; startVp: Viewport }
  | { tool: 'text-input'; position: Point2D }

// ── Snap ──

export interface SnapResult {
  point: Point2D
  type: 'grid' | 'endpoint' | 'midpoint' | 'center' | 'none'
}

// ── Defaults ──

export const DEFAULT_LAYERS: CadLayer[] = [
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
  }
}

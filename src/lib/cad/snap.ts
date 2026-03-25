import type { Point2D, CadObject, GridSettings, SnapResult } from '@/types/cad'
import { dist, polygonVertices } from '@/types/cad'

export function findSnap(
  cursor: Point2D,
  grid: GridSettings,
  objects: CadObject[],
  snapRadius: number
): SnapResult {
  let best: SnapResult = { point: cursor, type: 'none' }
  let minDist = snapRadius

  // Object snap points (higher priority)
  for (const obj of objects) {
    if (obj.locked) continue
    for (const sp of getSnapPoints(obj)) {
      const d = dist(cursor, sp.point)
      if (d < minDist) {
        minDist = d
        best = sp
      }
    }
  }

  // Intersection snap (highest priority when close)
  if (best.type === 'none' || best.type === 'grid') {
    const segments = getAllSegments(objects)
    for (let i = 0; i < segments.length; i++) {
      for (let j = i + 1; j < segments.length; j++) {
        const ix = lineLineIntersection(segments[i][0], segments[i][1], segments[j][0], segments[j][1])
        if (ix) {
          const d = dist(cursor, ix)
          if (d < minDist) {
            minDist = d
            best = { point: ix, type: 'intersection' }
          }
        }
      }
    }
  }

  if (best.type !== 'none') return best

  // Grid snap
  if (grid.snap && grid.enabled && grid.size > 0) {
    const snapped: Point2D = {
      x: Math.round(cursor.x / grid.size) * grid.size,
      y: Math.round(cursor.y / grid.size) * grid.size,
    }
    if (dist(cursor, snapped) < snapRadius) {
      return { point: snapped, type: 'grid' }
    }
  }

  return best
}

function getSnapPoints(obj: CadObject): SnapResult[] {
  const geo = obj.geometry
  const r: SnapResult[] = []

  switch (geo.type) {
    case 'line':
      r.push({ point: geo.start, type: 'endpoint' })
      r.push({ point: geo.end, type: 'endpoint' })
      r.push({ point: { x: (geo.start.x + geo.end.x) / 2, y: (geo.start.y + geo.end.y) / 2 }, type: 'midpoint' })
      break
    case 'rect':
      r.push({ point: geo.origin, type: 'endpoint' })
      r.push({ point: { x: geo.origin.x + geo.width, y: geo.origin.y }, type: 'endpoint' })
      r.push({ point: { x: geo.origin.x, y: geo.origin.y + geo.height }, type: 'endpoint' })
      r.push({ point: { x: geo.origin.x + geo.width, y: geo.origin.y + geo.height }, type: 'endpoint' })
      r.push({ point: { x: geo.origin.x + geo.width / 2, y: geo.origin.y + geo.height / 2 }, type: 'center' })
      break
    case 'circle':
      r.push({ point: geo.center, type: 'center' })
      // Quadrant points
      r.push({ point: { x: geo.center.x + geo.radius, y: geo.center.y }, type: 'endpoint' })
      r.push({ point: { x: geo.center.x - geo.radius, y: geo.center.y }, type: 'endpoint' })
      r.push({ point: { x: geo.center.x, y: geo.center.y + geo.radius }, type: 'endpoint' })
      r.push({ point: { x: geo.center.x, y: geo.center.y - geo.radius }, type: 'endpoint' })
      break
    case 'arc':
      r.push({ point: geo.center, type: 'center' })
      r.push({ point: { x: geo.center.x + geo.radius * Math.cos(geo.startAngle * Math.PI / 180), y: geo.center.y + geo.radius * Math.sin(geo.startAngle * Math.PI / 180) }, type: 'endpoint' })
      r.push({ point: { x: geo.center.x + geo.radius * Math.cos(geo.endAngle * Math.PI / 180), y: geo.center.y + geo.radius * Math.sin(geo.endAngle * Math.PI / 180) }, type: 'endpoint' })
      break
    case 'polyline':
      for (const p of geo.points) r.push({ point: p, type: 'endpoint' })
      for (let i = 1; i < geo.points.length; i++) {
        const a = geo.points[i - 1], b = geo.points[i]
        r.push({ point: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, type: 'midpoint' })
      }
      break
    case 'ellipse':
      r.push({ point: geo.center, type: 'center' })
      // Axis endpoints
      const rot = geo.rotation || 0
      const cosR = Math.cos(rot * Math.PI / 180), sinR = Math.sin(rot * Math.PI / 180)
      r.push({ point: { x: geo.center.x + geo.rx * cosR, y: geo.center.y + geo.rx * sinR }, type: 'endpoint' })
      r.push({ point: { x: geo.center.x - geo.rx * cosR, y: geo.center.y - geo.rx * sinR }, type: 'endpoint' })
      r.push({ point: { x: geo.center.x - geo.ry * sinR, y: geo.center.y + geo.ry * cosR }, type: 'endpoint' })
      r.push({ point: { x: geo.center.x + geo.ry * sinR, y: geo.center.y - geo.ry * cosR }, type: 'endpoint' })
      break
    case 'polygon': {
      r.push({ point: geo.center, type: 'center' })
      const verts = polygonVertices(geo.center, geo.radius, geo.sides, geo.rotation)
      for (const v of verts) r.push({ point: v, type: 'endpoint' })
      // Midpoints of edges
      for (let i = 0; i < verts.length; i++) {
        const a = verts[i], b = verts[(i + 1) % verts.length]
        r.push({ point: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, type: 'midpoint' })
      }
      break
    }
    case 'text':
      r.push({ point: geo.position, type: 'endpoint' })
      break
    case 'dimension':
      r.push({ point: geo.start, type: 'endpoint' })
      r.push({ point: geo.end, type: 'endpoint' })
      break
    case 'image':
      r.push({ point: geo.origin, type: 'endpoint' })
      r.push({ point: { x: geo.origin.x + geo.width, y: geo.origin.y }, type: 'endpoint' })
      r.push({ point: { x: geo.origin.x, y: geo.origin.y + geo.height }, type: 'endpoint' })
      r.push({ point: { x: geo.origin.x + geo.width, y: geo.origin.y + geo.height }, type: 'endpoint' })
      r.push({ point: { x: geo.origin.x + geo.width / 2, y: geo.origin.y + geo.height / 2 }, type: 'center' })
      break
  }
  return r
}

/** Extract all line segments from objects for intersection detection */
function getAllSegments(objects: CadObject[]): [Point2D, Point2D][] {
  const segs: [Point2D, Point2D][] = []
  for (const obj of objects) {
    if (obj.locked) continue
    const geo = obj.geometry
    switch (geo.type) {
      case 'line':
        segs.push([geo.start, geo.end])
        break
      case 'rect':
        const c = [
          geo.origin,
          { x: geo.origin.x + geo.width, y: geo.origin.y },
          { x: geo.origin.x + geo.width, y: geo.origin.y + geo.height },
          { x: geo.origin.x, y: geo.origin.y + geo.height },
        ]
        for (let i = 0; i < 4; i++) segs.push([c[i], c[(i + 1) % 4]])
        break
      case 'polyline':
        for (let i = 1; i < geo.points.length; i++) segs.push([geo.points[i - 1], geo.points[i]])
        if (geo.closed && geo.points.length > 2) segs.push([geo.points[geo.points.length - 1], geo.points[0]])
        break
      case 'polygon': {
        const verts = polygonVertices(geo.center, geo.radius, geo.sides, geo.rotation)
        for (let i = 0; i < verts.length; i++) segs.push([verts[i], verts[(i + 1) % verts.length]])
        break
      }
    }
  }
  return segs
}

/** Find intersection of two line segments, or null if they don't intersect */
function lineLineIntersection(a1: Point2D, a2: Point2D, b1: Point2D, b2: Point2D): Point2D | null {
  const dx1 = a2.x - a1.x, dy1 = a2.y - a1.y
  const dx2 = b2.x - b1.x, dy2 = b2.y - b1.y
  const denom = dx1 * dy2 - dy1 * dx2
  if (Math.abs(denom) < 1e-10) return null // parallel
  const t = ((b1.x - a1.x) * dy2 - (b1.y - a1.y) * dx2) / denom
  const u = ((b1.x - a1.x) * dy1 - (b1.y - a1.y) * dx1) / denom
  if (t < 0 || t > 1 || u < 0 || u > 1) return null // outside segments
  return { x: a1.x + t * dx1, y: a1.y + t * dy1 }
}

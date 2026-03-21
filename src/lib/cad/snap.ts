import type { Point2D, CadObject, GridSettings, SnapResult } from '@/types/cad'
import { dist } from '@/types/cad'

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
    case 'text':
      r.push({ point: geo.position, type: 'endpoint' })
      break
    case 'dimension':
      r.push({ point: geo.start, type: 'endpoint' })
      r.push({ point: geo.end, type: 'endpoint' })
      break
  }
  return r
}

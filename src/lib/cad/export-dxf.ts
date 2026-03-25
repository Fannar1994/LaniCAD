import type { CadObject, CadLayer } from '@/types/cad'

export function exportDxf(objects: CadObject[], layers: CadLayer[]): string {
  const lines: string[] = []
  const w = (s: string) => lines.push(s)

  // Header
  w('0'); w('SECTION'); w('2'); w('HEADER')
  w('9'); w('$ACADVER'); w('1'); w('AC1014')
  w('0'); w('ENDSEC')

  // Tables — Layers
  w('0'); w('SECTION'); w('2'); w('TABLES')
  w('0'); w('TABLE'); w('2'); w('LAYER')
  w('70'); w(String(layers.length))
  for (const layer of layers) {
    w('0'); w('LAYER')
    w('2'); w(layer.name)
    w('70'); w(layer.locked ? '4' : '0')
    w('62'); w(String(colorToDxf(layer.color)))
    w('6'); w('CONTINUOUS')
  }
  w('0'); w('ENDTAB')
  w('0'); w('ENDSEC')

  // Entities
  w('0'); w('SECTION'); w('2'); w('ENTITIES')
  for (const obj of objects) {
    const layerName = layers.find(l => l.id === obj.layerId)?.name || '0'
    const geo = obj.geometry
    switch (geo.type) {
      case 'line':
        w('0'); w('LINE'); w('8'); w(layerName)
        w('10'); w(String(geo.start.x))
        w('20'); w(String(-geo.start.y)) // Flip Y for DXF (Y-up)
        w('30'); w('0')
        w('11'); w(String(geo.end.x))
        w('21'); w(String(-geo.end.y))
        w('31'); w('0')
        break
      case 'rect': {
        const { origin: o, width: rw, height: rh, rotation: rot } = geo
        // If rotated, compute actual corner positions
        const corners = [
          { x: o.x, y: o.y },
          { x: o.x + rw, y: o.y },
          { x: o.x + rw, y: o.y + rh },
          { x: o.x, y: o.y + rh },
        ]
        let pts = corners
        if (rot) {
          const cx = o.x + rw / 2, cy = o.y + rh / 2
          const rad = rot * Math.PI / 180
          const cosA = Math.cos(rad), sinA = Math.sin(rad)
          pts = corners.map(p => ({
            x: cx + (p.x - cx) * cosA - (p.y - cy) * sinA,
            y: cy + (p.x - cx) * sinA + (p.y - cy) * cosA,
          }))
        }
        w('0'); w('LWPOLYLINE'); w('8'); w(layerName)
        w('70'); w('1'); w('90'); w('4')
        for (const p of pts) {
          w('10'); w(String(p.x)); w('20'); w(String(-p.y))
        }
        break
      }
      case 'circle':
        w('0'); w('CIRCLE'); w('8'); w(layerName)
        w('10'); w(String(geo.center.x))
        w('20'); w(String(-geo.center.y))
        w('30'); w('0')
        w('40'); w(String(geo.radius))
        break
      case 'arc':
        w('0'); w('ARC'); w('8'); w(layerName)
        w('10'); w(String(geo.center.x))
        w('20'); w(String(-geo.center.y))
        w('30'); w('0')
        w('40'); w(String(geo.radius))
        w('50'); w(String(-geo.endAngle))   // Flip angles for Y-axis flip
        w('51'); w(String(-geo.startAngle))
        break
      case 'polyline': {
        w('0'); w('LWPOLYLINE'); w('8'); w(layerName)
        w('70'); w(geo.closed ? '1' : '0')
        w('90'); w(String(geo.points.length))
        for (const p of geo.points) { w('10'); w(String(p.x)); w('20'); w(String(-p.y)) }
        break
      }
      case 'text':
        w('0'); w('TEXT'); w('8'); w(layerName)
        w('10'); w(String(geo.position.x))
        w('20'); w(String(-geo.position.y))
        w('30'); w('0')
        w('40'); w(String(geo.fontSize))
        w('1'); w(geo.content)
        if (geo.rotation !== 0) { w('50'); w(String(geo.rotation)) }
        break
      case 'dimension': {
        // Export as line + text label
        w('0'); w('LINE'); w('8'); w(layerName)
        w('10'); w(String(geo.start.x)); w('20'); w(String(-geo.start.y)); w('30'); w('0')
        w('11'); w(String(geo.end.x)); w('21'); w(String(-geo.end.y)); w('31'); w('0')
        const dx = geo.end.x - geo.start.x, dy = geo.end.y - geo.start.y
        const length = Math.sqrt(dx * dx + dy * dy)
        const mx = (geo.start.x + geo.end.x) / 2, my = (geo.start.y + geo.end.y) / 2
        w('0'); w('TEXT'); w('8'); w(layerName)
        w('10'); w(String(mx)); w('20'); w(String(-my + geo.offset)); w('30'); w('0')
        w('40'); w('10'); w('1'); w(length.toFixed(1))
        break
      }
      case 'ellipse': {
        // DXF ELLIPSE entity
        w('0'); w('ELLIPSE'); w('8'); w(layerName)
        // Center point
        w('10'); w(String(geo.center.x))
        w('20'); w(String(-geo.center.y))
        w('30'); w('0')
        // Endpoint of major axis (relative to center)
        const rot = (geo.rotation || 0) * Math.PI / 180
        const majorR = Math.max(geo.rx, geo.ry)
        const minorR = Math.min(geo.rx, geo.ry)
        const majAngle = geo.rx >= geo.ry ? rot : rot + Math.PI / 2
        w('11'); w(String(majorR * Math.cos(majAngle)))
        w('21'); w(String(-majorR * Math.sin(majAngle)))
        w('31'); w('0')
        // Ratio of minor to major axis
        w('40'); w(String(minorR / majorR))
        // Start/end parameters (full ellipse)
        w('41'); w('0')
        w('42'); w(String(Math.PI * 2))
        break
      }
      case 'polygon': {
        // Export as closed LWPOLYLINE
        const sides = geo.sides
        const pts: { x: number; y: number }[] = []
        for (let i = 0; i < sides; i++) {
          const angle = ((geo.rotation || 0) * Math.PI / 180) + (2 * Math.PI * i) / sides
          pts.push({
            x: geo.center.x + geo.radius * Math.cos(angle),
            y: geo.center.y + geo.radius * Math.sin(angle),
          })
        }
        w('0'); w('LWPOLYLINE'); w('8'); w(layerName)
        w('70'); w('1') // closed
        w('90'); w(String(sides))
        for (const p of pts) {
          w('10'); w(String(p.x))
          w('20'); w(String(-p.y))
        }
        break
      }
      case 'image':
        // Images cannot be exported to basic DXF — skip
        break
    }
  }
  w('0'); w('ENDSEC')
  w('0'); w('EOF')
  return lines.join('\n')
}

function colorToDxf(hex: string): number {
  const map: Record<string, number> = {
    '#404042': 8, '#2563eb': 5, '#dc2626': 1, '#16a34a': 3, '#9333ea': 6,
    '#000000': 7, '#ffffff': 7,
  }
  return map[hex.toLowerCase()] || 7
}

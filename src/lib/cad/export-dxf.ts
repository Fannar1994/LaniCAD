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
        const { origin: o, width: rw, height: rh } = geo
        w('0'); w('LWPOLYLINE'); w('8'); w(layerName)
        w('70'); w('1'); w('90'); w('4')
        w('10'); w(String(o.x)); w('20'); w(String(-o.y))
        w('10'); w(String(o.x + rw)); w('20'); w(String(-o.y))
        w('10'); w(String(o.x + rw)); w('20'); w(String(-(o.y + rh)))
        w('10'); w(String(o.x)); w('20'); w(String(-(o.y + rh)))
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

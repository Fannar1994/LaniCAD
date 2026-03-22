/**
 * LániCAD — DXF Export/Import Tests
 * Tests round-trip DXF export → import for all supported entity types
 */
import { describe, it, expect } from 'vitest'
import { exportDxf } from '../export-dxf'
import { importDxf } from '../import-dxf'
import type { CadObject, CadLayer } from '@/types/cad'

const testLayer: CadLayer = {
  id: 'test',
  name: 'TestLayer',
  color: '#2563eb',
  visible: true,
  locked: false,
  lineWidth: 1,
}

function makeObj(geometry: CadObject['geometry'], layerId = 'test'): CadObject {
  return {
    id: 'test-1',
    layerId,
    style: { stroke: '#2563eb', strokeWidth: 1, fill: 'none', opacity: 1 },
    locked: false,
    geometry,
  }
}

// ═══════════════════════════════════════════════════
// EXPORT TESTS
// ═══════════════════════════════════════════════════
describe('exportDxf', () => {
  it('produces valid DXF structure with HEADER, TABLES, ENTITIES, EOF', () => {
    const dxf = exportDxf([], [testLayer])
    expect(dxf).toContain('SECTION')
    expect(dxf).toContain('HEADER')
    expect(dxf).toContain('TABLES')
    expect(dxf).toContain('ENTITIES')
    expect(dxf).toContain('EOF')
  })

  it('exports layers in TABLES section', () => {
    const dxf = exportDxf([], [testLayer])
    expect(dxf).toContain('LAYER')
    expect(dxf).toContain('TestLayer')
    expect(dxf).toContain('CONTINUOUS')
  })

  it('exports LINE entity', () => {
    const obj = makeObj({ type: 'line', start: { x: 10, y: 20 }, end: { x: 30, y: 40 } })
    const dxf = exportDxf([obj], [testLayer])
    expect(dxf).toContain('LINE')
    expect(dxf).toContain('10')
    expect(dxf).toContain('30')
  })

  it('exports CIRCLE entity', () => {
    const obj = makeObj({ type: 'circle', center: { x: 50, y: 60 }, radius: 25 })
    const dxf = exportDxf([obj], [testLayer])
    expect(dxf).toContain('CIRCLE')
    expect(dxf).toContain('25')
  })

  it('exports ARC entity', () => {
    const obj = makeObj({
      type: 'arc',
      center: { x: 0, y: 0 },
      radius: 10,
      startAngle: 0,
      endAngle: Math.PI / 2,
    })
    const dxf = exportDxf([obj], [testLayer])
    expect(dxf).toContain('ARC')
  })

  it('exports LWPOLYLINE for rect', () => {
    const obj = makeObj({
      type: 'rect',
      origin: { x: 0, y: 0 },
      width: 100,
      height: 50,
      rotation: 0,
    })
    const dxf = exportDxf([obj], [testLayer])
    expect(dxf).toContain('LWPOLYLINE')
  })

  it('exports LWPOLYLINE for polyline', () => {
    const obj = makeObj({
      type: 'polyline',
      points: [{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 0 }],
      closed: true,
    })
    const dxf = exportDxf([obj], [testLayer])
    expect(dxf).toContain('LWPOLYLINE')
  })

  it('exports TEXT entity', () => {
    const obj = makeObj({
      type: 'text',
      position: { x: 5, y: 5 },
      content: 'Hello LániCAD',
      fontSize: 12,
      rotation: 0,
    })
    const dxf = exportDxf([obj], [testLayer])
    expect(dxf).toContain('TEXT')
    expect(dxf).toContain('Hello LániCAD')
  })

  it('exports empty entities section when no objects', () => {
    const dxf = exportDxf([], [testLayer])
    // Should have ENTITIES section followed by ENDSEC
    const entitiesIdx = dxf.indexOf('ENTITIES')
    const endsecIdx = dxf.indexOf('ENDSEC', entitiesIdx)
    expect(endsecIdx).toBeGreaterThan(entitiesIdx)
  })
})

// ═══════════════════════════════════════════════════
// IMPORT TESTS
// ═══════════════════════════════════════════════════
describe('importDxf', () => {
  it('parses LINE entities', () => {
    const dxf = [
      '0', 'SECTION', '2', 'ENTITIES',
      '0', 'LINE', '8', 'MyLayer',
      '10', '100', '20', '-200', '30', '0',
      '11', '300', '21', '-400', '31', '0',
      '0', 'ENDSEC',
      '0', 'EOF',
    ].join('\n')

    const { objects } = importDxf(dxf)
    expect(objects).toHaveLength(1)
    expect(objects[0].geometry.type).toBe('line')
    if (objects[0].geometry.type === 'line') {
      expect(objects[0].geometry.start.x).toBe(100)
      expect(objects[0].geometry.start.y).toBe(200) // Y-flip
      expect(objects[0].geometry.end.x).toBe(300)
      expect(objects[0].geometry.end.y).toBe(400)
    }
  })

  it('parses CIRCLE entities', () => {
    const dxf = [
      '0', 'SECTION', '2', 'ENTITIES',
      '0', 'CIRCLE', '8', '0',
      '10', '50', '20', '-60', '30', '0',
      '40', '25',
      '0', 'ENDSEC',
      '0', 'EOF',
    ].join('\n')

    const { objects } = importDxf(dxf)
    expect(objects).toHaveLength(1)
    expect(objects[0].geometry.type).toBe('circle')
    if (objects[0].geometry.type === 'circle') {
      expect(objects[0].geometry.center.x).toBe(50)
      expect(objects[0].geometry.center.y).toBe(60)
      expect(objects[0].geometry.radius).toBe(25)
    }
  })

  it('parses TEXT entities', () => {
    const dxf = [
      '0', 'SECTION', '2', 'ENTITIES',
      '0', 'TEXT', '8', '0',
      '10', '5', '20', '-10', '30', '0',
      '40', '12',
      '1', 'Halló heimur',
      '0', 'ENDSEC',
      '0', 'EOF',
    ].join('\n')

    const { objects } = importDxf(dxf)
    expect(objects).toHaveLength(1)
    expect(objects[0].geometry.type).toBe('text')
    if (objects[0].geometry.type === 'text') {
      expect(objects[0].geometry.content).toBe('Halló heimur')
      expect(objects[0].geometry.fontSize).toBe(12)
    }
  })

  it('parses LWPOLYLINE entities', () => {
    const dxf = [
      '0', 'SECTION', '2', 'ENTITIES',
      '0', 'LWPOLYLINE', '8', '0',
      '70', '1', '90', '3',
      '10', '0', '20', '0',
      '10', '100', '20', '0',
      '10', '100', '20', '-50',
      '0', 'ENDSEC',
      '0', 'EOF',
    ].join('\n')

    const { objects } = importDxf(dxf)
    expect(objects).toHaveLength(1)
    expect(objects[0].geometry.type).toBe('polyline')
    if (objects[0].geometry.type === 'polyline') {
      expect(objects[0].geometry.points).toHaveLength(3)
      expect(objects[0].geometry.closed).toBe(true)
    }
  })

  it('parses ARC entities', () => {
    const dxf = [
      '0', 'SECTION', '2', 'ENTITIES',
      '0', 'ARC', '8', '0',
      '10', '0', '20', '0', '30', '0',
      '40', '10',
      '50', '0', '51', '90',
      '0', 'ENDSEC',
      '0', 'EOF',
    ].join('\n')

    const { objects } = importDxf(dxf)
    expect(objects).toHaveLength(1)
    expect(objects[0].geometry.type).toBe('arc')
    if (objects[0].geometry.type === 'arc') {
      expect(objects[0].geometry.radius).toBe(10)
    }
  })

  it('parses layer definitions from TABLES section', () => {
    const dxf = [
      '0', 'SECTION', '2', 'TABLES',
      '0', 'TABLE', '2', 'LAYER', '70', '1',
      '0', 'LAYER',
      '2', 'Walls',
      '62', '1',
      '6', 'CONTINUOUS',
      '0', 'ENDTAB',
      '0', 'ENDSEC',
      '0', 'SECTION', '2', 'ENTITIES',
      '0', 'ENDSEC',
      '0', 'EOF',
    ].join('\n')

    const { layers } = importDxf(dxf)
    expect(layers).toHaveLength(1)
    expect(layers[0].name).toBe('Walls')
    expect(layers[0].color).toBe('#ff0000') // DXF color 1 = red
  })

  it('skips unsupported entity types', () => {
    const dxf = [
      '0', 'SECTION', '2', 'ENTITIES',
      '0', 'SPLINE', '8', '0',
      '10', '0', '20', '0',
      '0', 'INSERT', '8', '0',
      '10', '0', '20', '0',
      '0', 'ENDSEC',
      '0', 'EOF',
    ].join('\n')

    const { objects } = importDxf(dxf)
    expect(objects).toHaveLength(0)
  })

  it('handles empty DXF file', () => {
    const dxf = ['0', 'EOF'].join('\n')
    const { objects, layers } = importDxf(dxf)
    expect(objects).toHaveLength(0)
    expect(layers).toHaveLength(0)
  })
})

// ═══════════════════════════════════════════════════
// ROUND-TRIP TESTS
// ═══════════════════════════════════════════════════
describe('DXF round-trip (export → import)', () => {
  it('round-trips a LINE', () => {
    const orig = makeObj({ type: 'line', start: { x: 10, y: 20 }, end: { x: 30, y: 40 } })
    const dxf = exportDxf([orig], [testLayer])
    const { objects } = importDxf(dxf)

    expect(objects).toHaveLength(1)
    expect(objects[0].geometry.type).toBe('line')
    if (objects[0].geometry.type === 'line') {
      expect(objects[0].geometry.start.x).toBe(10)
      expect(objects[0].geometry.start.y).toBe(20)
      expect(objects[0].geometry.end.x).toBe(30)
      expect(objects[0].geometry.end.y).toBe(40)
    }
  })

  it('round-trips a CIRCLE', () => {
    const orig = makeObj({ type: 'circle', center: { x: 50, y: 60 }, radius: 25 })
    const dxf = exportDxf([orig], [testLayer])
    const { objects } = importDxf(dxf)

    expect(objects).toHaveLength(1)
    if (objects[0].geometry.type === 'circle') {
      expect(objects[0].geometry.center.x).toBe(50)
      expect(objects[0].geometry.center.y).toBe(60)
      expect(objects[0].geometry.radius).toBe(25)
    }
  })

  it('round-trips TEXT content', () => {
    const orig = makeObj({
      type: 'text',
      position: { x: 5, y: 5 },
      content: 'Test text',
      fontSize: 12,
      rotation: 0,
    })
    const dxf = exportDxf([orig], [testLayer])
    const { objects } = importDxf(dxf)

    expect(objects).toHaveLength(1)
    if (objects[0].geometry.type === 'text') {
      expect(objects[0].geometry.content).toBe('Test text')
    }
  })

  it('round-trips multiple objects', () => {
    const objs = [
      makeObj({ type: 'line', start: { x: 0, y: 0 }, end: { x: 100, y: 0 } }),
      makeObj({ type: 'circle', center: { x: 50, y: 50 }, radius: 10 }),
      makeObj({
        type: 'text',
        position: { x: 0, y: 0 },
        content: 'Label',
        fontSize: 10,
        rotation: 0,
      }),
    ]
    const dxf = exportDxf(objs, [testLayer])
    const { objects } = importDxf(dxf)

    expect(objects).toHaveLength(3)
    const types = objects.map(o => o.geometry.type)
    expect(types).toContain('line')
    expect(types).toContain('circle')
    expect(types).toContain('text')
  })
})

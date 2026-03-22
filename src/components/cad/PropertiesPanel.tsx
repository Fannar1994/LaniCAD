import { useState, useEffect } from 'react'
import type { CadStateReturn } from '@/hooks/useCadState'
import type { CadGeometry } from '@/types/cad'

export function PropertiesPanel({ cad }: { cad: CadStateReturn }) {
  if (cad.selectedIds.length === 0) {
    return (
      <div className="border-t px-3 py-3">
        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Eiginleikar</h3>
        <p className="text-xs text-gray-400 italic">Ekkert valið</p>
      </div>
    )
  }

  const obj = cad.objects.find(o => o.id === cad.selectedIds[0])
  if (!obj) return null

  const geo = obj.geometry

  const updateGeo = (patch: Partial<CadGeometry>) => {
    cad.updateObjectGeometry(obj.id, { ...geo, ...patch } as CadGeometry)
  }

  return (
    <div className="border-t px-3 py-3 space-y-3 max-h-[60vh] overflow-y-auto">
      <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Eiginleikar</h3>

      <div className="space-y-1.5 text-xs">
        <Row label="Tegund" value={typeLabel(geo.type)} />

        {/* Geometry-specific editable fields */}
        {geo.type === 'line' && (
          <>
            <CoordRow label="Frá" x={geo.start.x} y={geo.start.y}
              onChangeX={v => updateGeo({ start: { x: v, y: geo.start.y } })}
              onChangeY={v => updateGeo({ start: { x: geo.start.x, y: v } })} />
            <CoordRow label="Til" x={geo.end.x} y={geo.end.y}
              onChangeX={v => updateGeo({ end: { x: v, y: geo.end.y } })}
              onChangeY={v => updateGeo({ end: { x: geo.end.x, y: v } })} />
            <Row label="Lengd" value={Math.sqrt((geo.end.x - geo.start.x) ** 2 + (geo.end.y - geo.start.y) ** 2).toFixed(1)} />
          </>
        )}
        {geo.type === 'rect' && (
          <>
            <CoordRow label="Upphaf" x={geo.origin.x} y={geo.origin.y}
              onChangeX={v => updateGeo({ origin: { x: v, y: geo.origin.y } })}
              onChangeY={v => updateGeo({ origin: { x: geo.origin.x, y: v } })} />
            <NumRow label="Breidd" value={geo.width} onChange={v => updateGeo({ width: Math.max(1, v) })} />
            <NumRow label="Hæð" value={geo.height} onChange={v => updateGeo({ height: Math.max(1, v) })} />
            <NumRow label="Snúningur" value={geo.rotation} onChange={v => updateGeo({ rotation: v })} step={1} />
          </>
        )}
        {geo.type === 'circle' && (
          <>
            <CoordRow label="Miðja" x={geo.center.x} y={geo.center.y}
              onChangeX={v => updateGeo({ center: { x: v, y: geo.center.y } })}
              onChangeY={v => updateGeo({ center: { x: geo.center.x, y: v } })} />
            <NumRow label="Radíus" value={geo.radius} onChange={v => updateGeo({ radius: Math.max(1, v) })} />
          </>
        )}
        {geo.type === 'arc' && (
          <>
            <CoordRow label="Miðja" x={geo.center.x} y={geo.center.y}
              onChangeX={v => updateGeo({ center: { x: v, y: geo.center.y } })}
              onChangeY={v => updateGeo({ center: { x: geo.center.x, y: v } })} />
            <NumRow label="Radíus" value={geo.radius} onChange={v => updateGeo({ radius: Math.max(1, v) })} />
            <NumRow label="Byrjunarhorn" value={geo.startAngle} onChange={v => updateGeo({ startAngle: v })} step={1} />
            <NumRow label="Endahorn" value={geo.endAngle} onChange={v => updateGeo({ endAngle: v })} step={1} />
          </>
        )}
        {geo.type === 'polyline' && (
          <>
            <Row label="Punktar" value={String(geo.points.length)} />
            <Row label="Lokað" value={geo.closed ? 'Já' : 'Nei'} />
          </>
        )}
        {geo.type === 'text' && (
          <>
            <CoordRow label="Staða" x={geo.position.x} y={geo.position.y}
              onChangeX={v => updateGeo({ position: { x: v, y: geo.position.y } })}
              onChangeY={v => updateGeo({ position: { x: geo.position.x, y: v } })} />
            <TextRow label="Texti" value={geo.content} onChange={v => updateGeo({ content: v })} />
            <NumRow label="Leturstærð" value={geo.fontSize} onChange={v => updateGeo({ fontSize: Math.max(1, v) })} />
            <NumRow label="Snúningur" value={geo.rotation} onChange={v => updateGeo({ rotation: v })} step={1} />
          </>
        )}
        {geo.type === 'dimension' && (
          <>
            <CoordRow label="Frá" x={geo.start.x} y={geo.start.y}
              onChangeX={v => updateGeo({ start: { x: v, y: geo.start.y } })}
              onChangeY={v => updateGeo({ start: { x: geo.start.x, y: v } })} />
            <CoordRow label="Til" x={geo.end.x} y={geo.end.y}
              onChangeX={v => updateGeo({ end: { x: v, y: geo.end.y } })}
              onChangeY={v => updateGeo({ end: { x: geo.end.x, y: v } })} />
            <NumRow label="Offset" value={geo.offset} onChange={v => updateGeo({ offset: v })} />
          </>
        )}
        {geo.type === 'ellipse' && (
          <>
            <CoordRow label="Miðja" x={geo.center.x} y={geo.center.y}
              onChangeX={v => updateGeo({ center: { x: v, y: geo.center.y } })}
              onChangeY={v => updateGeo({ center: { x: geo.center.x, y: v } })} />
            <NumRow label="Rx" value={geo.rx} onChange={v => updateGeo({ rx: Math.max(1, v) })} />
            <NumRow label="Ry" value={geo.ry} onChange={v => updateGeo({ ry: Math.max(1, v) })} />
            <NumRow label="Snúningur" value={geo.rotation} onChange={v => updateGeo({ rotation: v })} step={1} />
          </>
        )}
        {geo.type === 'polygon' && (
          <>
            <CoordRow label="Miðja" x={geo.center.x} y={geo.center.y}
              onChangeX={v => updateGeo({ center: { x: v, y: geo.center.y } })}
              onChangeY={v => updateGeo({ center: { x: geo.center.x, y: v } })} />
            <NumRow label="Radíus" value={geo.radius} onChange={v => updateGeo({ radius: Math.max(1, v) })} />
            <NumRow label="Hliðar" value={geo.sides} onChange={v => updateGeo({ sides: Math.max(3, Math.min(24, Math.round(v))) })} step={1} />
            <NumRow label="Snúningur" value={geo.rotation} onChange={v => updateGeo({ rotation: v })} step={1} />
          </>
        )}
      </div>

      {/* Layer assignment */}
      <div>
        <label className="text-xs text-gray-500">Lag:</label>
        <select value={obj.layerId} onChange={e => cad.updateObjectLayer(obj.id, e.target.value)}
          className="w-full text-xs border rounded px-1 py-0.5 mt-0.5" title="Veldu lag">
          {cad.layers.filter(l => !l.locked).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>

      {/* Stroke color */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">Litur:</label>
        <input type="color" value={obj.style.stroke} onChange={e => cad.updateObjectStyle(obj.id, { stroke: e.target.value })} className="w-6 h-5" title="Litur línu" />
      </div>

      {/* Fill color */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">Fylling:</label>
        <input type="color" value={obj.style.fill === 'none' ? '#ffffff' : obj.style.fill}
          onChange={e => cad.updateObjectStyle(obj.id, { fill: e.target.value })} className="w-6 h-5" title="Fyllingarlitur" />
        <button onClick={() => cad.updateObjectStyle(obj.id, { fill: 'none' })}
          className={`text-xs px-1.5 py-0.5 rounded border ${obj.style.fill === 'none' ? 'bg-gray-200 border-gray-400' : 'border-gray-300 hover:bg-gray-100'}`}
          title="Engin fylling">
          ✕
        </button>
      </div>

      {/* Stroke width */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">Þykkt:</label>
        <input type="number" value={obj.style.strokeWidth} onChange={e => cad.updateObjectStyle(obj.id, { strokeWidth: Number(e.target.value) })}
          min={0.1} max={10} step={0.1} className="w-16 text-xs border rounded px-1 py-0.5" title="Þykkt línu" />
      </div>

      {/* Opacity */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">Gegns.:</label>
        <input type="range" min={0} max={1} step={0.05} value={obj.style.opacity}
          onChange={e => cad.updateObjectStyle(obj.id, { opacity: Number(e.target.value) })}
          className="flex-1 h-4" title="Gegnsæi" />
        <span className="text-xs text-gray-500 w-8">{Math.round(obj.style.opacity * 100)}%</span>
      </div>

      {cad.selectedIds.length > 1 && (
        <p className="text-xs text-gray-400">{cad.selectedIds.length} hlutir valdir</p>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium text-gray-700">{value}</span>
    </div>
  )
}

/** Editable X/Y coordinate row */
function CoordRow({ label, x, y, onChangeX, onChangeY }: { label: string; x: number; y: number; onChangeX: (v: number) => void; onChangeY: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-gray-500 w-12 shrink-0">{label}:</span>
      <NumInput value={x} onChange={onChangeX} label={`${label} X`} />
      <NumInput value={y} onChange={onChangeY} label={`${label} Y`} />
    </div>
  )
}

/** Editable number row */
function NumRow({ label, value, onChange, step = 0.1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-gray-500 w-20 shrink-0">{label}:</span>
      <NumInput value={value} onChange={onChange} label={label} step={step} />
    </div>
  )
}

/** Editable text row */
function TextRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [local, setLocal] = useState(value)
  useEffect(() => { setLocal(value) }, [value])
  return (
    <div className="flex items-center gap-1">
      <span className="text-gray-500 w-12 shrink-0">{label}:</span>
      <input type="text" value={local} onChange={e => setLocal(e.target.value)}
        onBlur={() => onChange(local)} onKeyDown={e => { if (e.key === 'Enter') onChange(local) }}
        className="flex-1 text-xs border rounded px-1 py-0.5" title={label} />
    </div>
  )
}

/** Number input with local state to avoid jitter */
function NumInput({ value, onChange, label, step = 0.1 }: { value: number; onChange: (v: number) => void; label: string; step?: number }) {
  const [local, setLocal] = useState(String(value.toFixed(1)))
  useEffect(() => { setLocal(String(value.toFixed(1))) }, [value])
  const commit = () => {
    const n = parseFloat(local)
    if (!isNaN(n)) onChange(n)
    else setLocal(String(value.toFixed(1)))
  }
  return (
    <input type="number" value={local} step={step}
      onChange={e => setLocal(e.target.value)}
      onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') commit() }}
      className="w-[4.5rem] text-xs border rounded px-1 py-0.5" title={label} />
  )
}

function typeLabel(type: string): string {
  const m: Record<string, string> = {
    line: 'Lína', rect: 'Rétthyrningur', circle: 'Hringur',
    arc: 'Bogi', polyline: 'Marglína', text: 'Texti', dimension: 'Mál',
    ellipse: 'Sporbaugur', polygon: 'Marghyrningur',
  }
  return m[type] || type
}

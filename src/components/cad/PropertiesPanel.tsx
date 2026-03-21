import type { CadStateReturn } from '@/hooks/useCadState'

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
  const layerName = cad.layers.find(l => l.id === obj.layerId)?.name || '-'

  return (
    <div className="border-t px-3 py-3 space-y-3">
      <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Eiginleikar</h3>

      <div className="space-y-1.5 text-xs">
        <Row label="Tegund" value={typeLabel(geo.type)} />
        <Row label="Lag" value={layerName} />

        {geo.type === 'line' && (
          <>
            <Row label="Frá" value={`${geo.start.x.toFixed(1)}, ${geo.start.y.toFixed(1)}`} />
            <Row label="Til" value={`${geo.end.x.toFixed(1)}, ${geo.end.y.toFixed(1)}`} />
            <Row label="Lengd" value={Math.sqrt((geo.end.x - geo.start.x) ** 2 + (geo.end.y - geo.start.y) ** 2).toFixed(1)} />
          </>
        )}
        {geo.type === 'rect' && (
          <>
            <Row label="Upphaf" value={`${geo.origin.x.toFixed(1)}, ${geo.origin.y.toFixed(1)}`} />
            <Row label="Breidd" value={geo.width.toFixed(1)} />
            <Row label="Hæð" value={geo.height.toFixed(1)} />
          </>
        )}
        {geo.type === 'circle' && (
          <>
            <Row label="Miðja" value={`${geo.center.x.toFixed(1)}, ${geo.center.y.toFixed(1)}`} />
            <Row label="Radíus" value={geo.radius.toFixed(1)} />
          </>
        )}
        {geo.type === 'polyline' && <Row label="Punktar" value={String(geo.points.length)} />}
        {geo.type === 'text' && <Row label="Texti" value={geo.content} />}
      </div>

      {/* Layer assignment */}
      <div>
        <label className="text-xs text-gray-500">Lag:</label>
        <select value={obj.layerId} onChange={e => cad.updateObjectLayer(obj.id, e.target.value)}
          className="w-full text-xs border rounded px-1 py-0.5 mt-0.5">
          {cad.layers.filter(l => !l.locked).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>

      {/* Color */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">Litur:</label>
        <input type="color" value={obj.style.stroke} onChange={e => cad.updateObjectStyle(obj.id, { stroke: e.target.value })} className="w-6 h-5" />
      </div>

      {/* Stroke width */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">Þykkt:</label>
        <input type="number" value={obj.style.strokeWidth} onChange={e => cad.updateObjectStyle(obj.id, { strokeWidth: Number(e.target.value) })}
          min={0.1} max={10} step={0.1} className="w-16 text-xs border rounded px-1 py-0.5" />
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

function typeLabel(type: string): string {
  const m: Record<string, string> = {
    line: 'Lína', rect: 'Rétthyrningur', circle: 'Hringur',
    arc: 'Bogi', polyline: 'Marglína', text: 'Texti', dimension: 'Mál',
  }
  return m[type] || type
}

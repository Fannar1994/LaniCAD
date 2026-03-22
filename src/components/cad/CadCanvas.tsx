import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import type { CadStateReturn } from '@/hooks/useCadState'
import type { Point2D, DrawingPhase, CadObject, CadToolType, CadStyle, DimensionGeometry } from '@/types/cad'
import { dist, distToSegment, getBoundingBox, polygonVertices } from '@/types/cad'
import { findSnap } from '@/lib/cad/snap'

interface CadCanvasProps {
  cad: CadStateReturn
  equipmentSvg: string
  onCursorChange?: (pos: Point2D) => void
  onStatusChange?: (msg: string) => void
}

export function CadCanvas({ cad, equipmentSvg, onCursorChange, onStatusChange }: CadCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const equipRef = useRef<SVGGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [containerSize, setContainerSize] = useState({ w: 1000, h: 700 })
  const [phase, setPhase] = useState<DrawingPhase>(null)
  const [cursor, setCursor] = useState<Point2D>({ x: 0, y: 0 })
  const [snapIndicator, setSnapIndicator] = useState<Point2D | null>(null)
  const [spaceHeld, setSpaceHeld] = useState(false)
  const [moveOffset, setMoveOffset] = useState<Point2D | null>(null)
  const [textInput, setTextInput] = useState('')

  const vp = cad.viewport
  const pixelScale = vp.w / containerSize.w

  // Refs for stable event handlers
  const cadRef = useRef(cad); cadRef.current = cad
  const phaseRef = useRef(phase); phaseRef.current = phase
  const containerSizeRef = useRef(containerSize); containerSizeRef.current = containerSize
  const onStatusRef = useRef(onStatusChange); onStatusRef.current = onStatusChange

  // ── Observe container size ──
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      if (width > 0 && height > 0) setContainerSize({ w: width, h: height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Sync viewport aspect ratio
  useEffect(() => {
    cad.setViewport(v => ({ ...v, h: v.w * (containerSize.h / containerSize.w) }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerSize])

  // Load equipment SVG into background group
  useEffect(() => {
    if (!equipRef.current || !equipmentSvg) return
    const match = equipmentSvg.match(/<svg[^>]*>([\s\S]*)<\/svg>/i)
    if (match) equipRef.current.innerHTML = match[1]
  }, [equipmentSvg])

  // Set initial viewport from equipment SVG viewBox
  useEffect(() => {
    if (!equipmentSvg) return
    const vbMatch = equipmentSvg.match(/viewBox="([^"]+)"/)
    if (vbMatch) {
      const parts = vbMatch[1].split(/[\s,]+/).map(Number)
      if (parts.length === 4) {
        const [vx, vy, vw, vh] = parts
        const pad = Math.max(vw, vh) * 0.05
        cad.setViewport({ x: vx - pad, y: vy - pad, w: vw + pad * 2, h: vh + pad * 2 })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipmentSvg])

  // ── Coordinate transforms ──
  const screenToWorld = useCallback((clientX: number, clientY: number): Point2D => {
    const el = svgRef.current
    if (!el) return { x: 0, y: 0 }
    const rect = el.getBoundingClientRect()
    return {
      x: vp.x + ((clientX - rect.left) / containerSize.w) * vp.w,
      y: vp.y + ((clientY - rect.top) / containerSize.h) * vp.h,
    }
  }, [vp, containerSize])

  const getSnappedPos = useCallback((clientX: number, clientY: number): Point2D => {
    const raw = screenToWorld(clientX, clientY)
    const snap = findSnap(raw, cad.grid, cad.objects, 10 * pixelScale)
    if (snap.type !== 'none') { setSnapIndicator(snap.point); return snap.point }
    setSnapIndicator(null)
    return raw
  }, [screenToWorld, cad.grid, cad.objects, pixelScale])

  // ── Mouse Wheel: Zoom (ref-based for passive:false) ──
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      const factor = e.deltaY > 0 ? 1.1 : 0.9
      const rect = el.getBoundingClientRect()
      const cs = containerSizeRef.current
      const v = cadRef.current.viewport
      const sx = (e.clientX - rect.left) / cs.w
      const sy = (e.clientY - rect.top) / cs.h
      const worldX = v.x + sx * v.w
      const worldY = v.y + sy * v.h
      const nw = v.w * factor, nh = v.h * factor
      cadRef.current.setViewport({ x: worldX - sx * nw, y: worldY - sy * nh, w: nw, h: nh })
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  // ── Hit test ──
  const hitTest = useCallback((pt: Point2D): CadObject | null => {
    const threshold = 5 * pixelScale
    for (let i = cad.objects.length - 1; i >= 0; i--) {
      const obj = cad.objects[i]
      const layer = cad.layers.find(l => l.id === obj.layerId)
      if (!layer?.visible || layer.locked) continue
      if (hitTestObject(obj, pt, threshold)) return obj
    }
    return null
  }, [cad.objects, cad.layers, pixelScale])

  // ── Mouse Down ──
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const world = getSnappedPos(e.clientX, e.clientY)

    // Middle button or space+left = pan
    if (e.button === 1 || (e.button === 0 && (spaceHeld || cad.activeTool === 'pan'))) {
      setPhase({ tool: 'panning', startScreenX: e.clientX, startScreenY: e.clientY, startVp: { ...cad.viewport } })
      return
    }
    if (e.button !== 0) return

    switch (cad.activeTool) {
      case 'select': {
        const hit = hitTest(world)
        if (hit) {
          if (!cad.selectedIds.includes(hit.id)) {
            cad.setSelectedIds(e.shiftKey ? [...cad.selectedIds, hit.id] : [hit.id])
          }
          setPhase({ tool: 'moving', startWorld: world })
        } else {
          if (!e.shiftKey) cad.setSelectedIds([])
          setPhase({ tool: 'select-box', start: world })
        }
        break
      }
      case 'line':
        if (!phase || phase.tool !== 'line') {
          setPhase({ tool: 'line', start: world })
          onStatusChange?.('Smelltu til að ljúka línu (Esc til að hætta)')
        } else {
          cad.addObject({ type: 'line', start: phase.start, end: world })
          setPhase({ tool: 'line', start: world })
          onStatusChange?.('Lína búin til — smelltu áfram eða Esc')
        }
        break
      case 'rect':
        if (!phase || phase.tool !== 'rect') {
          setPhase({ tool: 'rect', start: world })
          onStatusChange?.('Smelltu til að ljúka rétthyrningi')
        } else {
          const s = phase.start
          cad.addObject({ type: 'rect', origin: { x: Math.min(s.x, world.x), y: Math.min(s.y, world.y) }, width: Math.abs(world.x - s.x), height: Math.abs(world.y - s.y), rotation: 0 })
          setPhase(null)
          onStatusChange?.('Rétthyrningur búinn til')
        }
        break
      case 'circle':
        if (!phase || phase.tool !== 'circle') {
          setPhase({ tool: 'circle', center: world })
          onStatusChange?.('Smelltu til að setja radíus')
        } else {
          cad.addObject({ type: 'circle', center: phase.center, radius: dist(phase.center, world) })
          setPhase(null)
          onStatusChange?.('Hringur búinn til')
        }
        break
      case 'arc':
        if (!phase || phase.tool !== 'arc') {
          setPhase({ tool: 'arc', center: world })
          onStatusChange?.('Smelltu til að setja radíus')
        } else if (phase.radius == null) {
          const r = dist(phase.center, world)
          const angle = Math.atan2(world.y - phase.center.y, world.x - phase.center.x) * 180 / Math.PI
          setPhase({ ...phase, radius: r, startAngle: angle })
          onStatusChange?.('Smelltu til að ljúka boga')
        } else {
          const ea = Math.atan2(world.y - phase.center.y, world.x - phase.center.x) * 180 / Math.PI
          cad.addObject({ type: 'arc', center: phase.center, radius: phase.radius, startAngle: phase.startAngle!, endAngle: ea })
          setPhase(null)
          onStatusChange?.('Bogi búinn til')
        }
        break
      case 'polyline':
        if (!phase || phase.tool !== 'polyline') {
          setPhase({ tool: 'polyline', points: [world] })
          onStatusChange?.('Smelltu til að bæta við punktum (tvísmelltu til að ljúka)')
        } else {
          setPhase({ ...phase, points: [...phase.points, world] })
        }
        break
      case 'text':
        setPhase({ tool: 'text-input', position: world })
        onStatusChange?.('Sláðu inn texta og ýttu á Enter')
        break
      case 'dimension':
        if (!phase || phase.tool !== 'dimension') {
          setPhase({ tool: 'dimension', start: world })
          onStatusChange?.('Smelltu á endapunkt máls')
        } else if (!phase.end) {
          setPhase({ ...phase, end: world })
          onStatusChange?.('Smelltu til að setja offset')
        } else {
          const ds = phase.start, de = phase.end
          const ddx = de.x - ds.x, ddy = de.y - ds.y
          const ln = Math.sqrt(ddx * ddx + ddy * ddy)
          const offset = ln > 0.1 ? ((world.x - ds.x) * (-ddy / ln) + (world.y - ds.y) * (ddx / ln)) : 20
          cad.addObject({ type: 'dimension', start: ds, end: de, offset })
          setPhase(null)
          onStatusChange?.('Mál búið til')
        }
        break
      case 'measure':
        if (!phase || phase.tool !== 'measure') {
          setPhase({ tool: 'measure', start: world })
          onStatusChange?.('Smelltu á endapunkt til að mæla')
        } else {
          const d = dist(phase.start, world)
          // Create a persistent dimension annotation
          const ddx = world.x - phase.start.x, ddy = world.y - phase.start.y
          const ln = Math.sqrt(ddx * ddx + ddy * ddy)
          const offset = ln > 0 ? Math.max(15 * pixelScale, ln * 0.15) : 20
          cad.addObject({ type: 'dimension', start: phase.start, end: world, offset })
          onStatusChange?.(`Fjarlægð: ${d.toFixed(1)} einingar — mál vistað`)
          setPhase(null)
        }
        break
      case 'ellipse':
        if (!phase || phase.tool !== 'ellipse') {
          setPhase({ tool: 'ellipse', center: world })
          onStatusChange?.('Smelltu til að setja X-radíus')
        } else if (phase.rx == null) {
          const rx = Math.abs(world.x - phase.center.x)
          setPhase({ ...phase, rx })
          onStatusChange?.('Smelltu til að setja Y-radíus')
        } else {
          const ry = Math.abs(world.y - phase.center.y)
          cad.addObject({ type: 'ellipse', center: phase.center, rx: phase.rx, ry, rotation: 0 })
          setPhase(null)
          onStatusChange?.('Sporbaugur búinn til')
        }
        break
      case 'polygon':
        if (!phase || phase.tool !== 'polygon') {
          setPhase({ tool: 'polygon', center: world, sides: 6 })
          onStatusChange?.('Smelltu til að setja radíus (upp/niður til að breyta hliðum)')
        } else {
          const r = dist(phase.center, world)
          const rot = Math.atan2(world.y - phase.center.y, world.x - phase.center.x) * 180 / Math.PI + 90
          cad.addObject({ type: 'polygon', center: phase.center, radius: r, sides: phase.sides, rotation: rot })
          setPhase(null)
          onStatusChange?.(`Marghyrningur (${phase.sides} hliðar) búinn til`)
        }
        break
      case 'offset': {
        const hit = hitTest(world)
        if (hit && (!phase || phase.tool !== 'offset' || !phase.sourceId)) {
          cad.setSelectedIds([hit.id])
          onStatusChange?.('Smelltu til að setja offset-fjarlægð (fjarlægð frá hlut)')
          setPhase({ tool: 'offset', sourceId: hit.id })
        } else if (phase?.tool === 'offset' && phase.sourceId) {
          const source = cad.objects.find(o => o.id === phase.sourceId)
          if (source) {
            const bb = getBoundingBox(source)
            const cx = (bb.minX + bb.maxX) / 2, cy = (bb.minY + bb.maxY) / 2
            // Distance from cursor to object center determines offset magnitude
            // Direction from center to cursor determines offset direction (outward = positive)
            const distToCenter = dist({ x: cx, y: cy }, world)
            const halfDiag = dist({ x: cx, y: cy }, { x: bb.maxX, y: bb.maxY })
            const offsetDist = distToCenter - halfDiag
            cad.setSelectedIds([phase.sourceId])
            cad.offsetSelected(offsetDist > 0 ? Math.max(5, offsetDist) : Math.min(-5, offsetDist))
          }
          setPhase(null)
          onStatusChange?.('Offset búið til')
        }
        break
      }
    }
  }, [cad, phase, spaceHeld, getSnappedPos, hitTest, onStatusChange])

  // ── Mouse Move ──
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const world = getSnappedPos(e.clientX, e.clientY)
    setCursor(world)
    onCursorChange?.(world)

    if (phase?.tool === 'panning') {
      const dx = (e.clientX - phase.startScreenX) * pixelScale
      const dy = (e.clientY - phase.startScreenY) * pixelScale
      cad.setViewport({ ...phase.startVp, x: phase.startVp.x - dx, y: phase.startVp.y - dy })
    } else if (phase?.tool === 'moving' && cad.selectedIds.length > 0) {
      setMoveOffset({ x: world.x - phase.startWorld.x, y: world.y - phase.startWorld.y })
    }
  }, [phase, getSnappedPos, onCursorChange, cad, pixelScale])

  // ── Mouse Up ──
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (phase?.tool === 'panning') { setPhase(null); return }
    if (phase?.tool === 'moving') {
      if (moveOffset && (Math.abs(moveOffset.x) > 0.5 || Math.abs(moveOffset.y) > 0.5)) {
        cad.moveSelected(moveOffset.x, moveOffset.y)
      }
      setMoveOffset(null); setPhase(null); return
    }
    if (phase?.tool === 'select-box') {
      const world = screenToWorld(e.clientX, e.clientY)
      const s = phase.start
      const minX = Math.min(s.x, world.x), maxX = Math.max(s.x, world.x)
      const minY = Math.min(s.y, world.y), maxY = Math.max(s.y, world.y)
      const ids = cad.objects
        .filter(obj => { const l = cad.layers.find(la => la.id === obj.layerId); if (!l?.visible || l.locked) return false; const bb = getBoundingBox(obj); return bb.minX >= minX && bb.maxX <= maxX && bb.minY >= minY && bb.maxY <= maxY })
        .map(o => o.id)
      cad.setSelectedIds(ids)
      setPhase(null)
    }
  }, [phase, cad, moveOffset, screenToWorld])

  // ── Double Click (finish polyline) ──
  const handleDoubleClick = useCallback(() => {
    if (phase?.tool === 'polyline' && phase.points.length >= 2) {
      cad.addObject({ type: 'polyline', points: phase.points, closed: false })
      setPhase(null)
      onStatusChange?.('Marglína búin til')
    }
  }, [phase, cad, onStatusChange])

  // ── Keyboard (ref-based for stability) ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const c = cadRef.current
      const p = phaseRef.current
      if (e.key === ' ') { e.preventDefault(); setSpaceHeld(true) }
      if (e.key === 'Escape') { setPhase(null); setMoveOffset(null); c.setSelectedIds([]); onStatusRef.current?.('') }
      if (e.key === 'Delete' || e.key === 'Backspace') c.deleteSelected()
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); c.undo() }
      if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); c.redo() }
      if (e.ctrlKey && e.key === 'c') { e.preventDefault(); c.copySelected() }
      if (e.ctrlKey && e.key === 'v') { e.preventDefault(); c.pasteClipboard() }
      if (e.ctrlKey && e.key === 'd') { e.preventDefault(); c.duplicateSelected() }
      if (e.ctrlKey && e.key === 'r') { e.preventDefault(); c.rotateSelected(90) }
      if (e.ctrlKey && e.key === 'a') { e.preventDefault(); c.selectAll() }
      // Polygon sides adjustment
      if (p?.tool === 'polygon' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault()
        const delta = e.key === 'ArrowUp' ? 1 : -1
        const newSides = Math.max(3, Math.min(24, p.sides + delta))
        setPhase({ ...p, sides: newSides })
        onStatusRef.current?.(`Marghyrningur: ${newSides} hliðar`)
      }
      if (e.key.toLowerCase() === 'g' && !e.ctrlKey) c.setGrid((g: typeof c.grid) => ({ ...g, enabled: !g.enabled }))
      if (!e.ctrlKey && !e.altKey && !p) {
        const shortcuts: Record<string, CadToolType> = { v: 'select', p: 'pan', l: 'line', r: 'rect', c: 'circle', e: 'ellipse', n: 'polygon', a: 'arc', w: 'polyline', t: 'text', d: 'dimension', m: 'measure', o: 'offset' }
        const key = e.key.toLowerCase()
        if (key in shortcuts) c.setActiveTool(shortcuts[key])
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => { if (e.key === ' ') setSpaceHeld(false) }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp) }
  }, [])

  // ── Grid lines ──
  const gridLines = useMemo(() => {
    if (!cad.grid.enabled || cad.grid.size <= 0) return null
    const size = cad.grid.size
    const lines: React.ReactElement[] = []
    const startX = Math.floor(vp.x / size) * size
    const startY = Math.floor(vp.y / size) * size
    const sw = 0.5 * pixelScale
    for (let x = startX; x <= vp.x + vp.w; x += size)
      lines.push(<line key={`gx${x}`} x1={x} y1={vp.y} x2={x} y2={vp.y + vp.h} stroke="#e2e8f0" strokeWidth={sw} />)
    for (let y = startY; y <= vp.y + vp.h; y += size)
      lines.push(<line key={`gy${y}`} x1={vp.x} y1={y} x2={vp.x + vp.w} y2={y} stroke="#e2e8f0" strokeWidth={sw} />)
    return lines
  }, [cad.grid, vp, pixelScale])

  const crossSize = 15 * pixelScale
  const cursorStyle = useMemo(() => {
    if (phase?.tool === 'panning') return 'grabbing'
    if (spaceHeld || cad.activeTool === 'pan') return 'grab'
    return 'crosshair'
  }, [spaceHeld, cad.activeTool, phase])

  return (
    <div ref={containerRef} className="flex-1 bg-gray-100 overflow-hidden relative" style={{ cursor: cursorStyle }}>
      <svg
        ref={svgRef}
        viewBox={`${vp.x} ${vp.y} ${vp.w} ${vp.h}`}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onContextMenu={e => { e.preventDefault(); setPhase(null); onStatusChange?.('') }}
      >
        {/* Background */}
        <rect x={vp.x} y={vp.y} width={vp.w} height={vp.h} fill="white" />

        {/* Grid */}
        {gridLines}

        {/* Equipment SVG background */}
        <g ref={equipRef} opacity={cad.layers.find(l => l.id === 'equipment')?.visible ? 1 : 0} />

        {/* User objects by layer */}
        {cad.layers.filter(l => l.visible && l.id !== 'equipment').map(layer => (
          <g key={layer.id}>
            {cad.objects.filter(o => o.layerId === layer.id).map(obj => {
              const sel = cad.selectedIds.includes(obj.id)
              const isMoving = moveOffset && sel
              return (
                <g key={obj.id} transform={isMoving ? `translate(${moveOffset.x},${moveOffset.y})` : undefined}>
                  <CadObjectSvg object={obj} selected={sel} pixelScale={pixelScale} />
                </g>
              )
            })}
          </g>
        ))}

        {/* Drawing preview */}
        {phase && <DrawingPreview phase={phase} cursor={cursor} pixelScale={pixelScale} />}

        {/* Selection box */}
        {phase?.tool === 'select-box' && (
          <rect
            x={Math.min(phase.start.x, cursor.x)} y={Math.min(phase.start.y, cursor.y)}
            width={Math.abs(cursor.x - phase.start.x)} height={Math.abs(cursor.y - phase.start.y)}
            fill="rgba(37,99,235,0.08)" stroke="#2563eb" strokeWidth={pixelScale}
            strokeDasharray={`${4 * pixelScale} ${2 * pixelScale}`} pointerEvents="none"
          />
        )}

        {/* Selection handles */}
        {cad.selectedIds.map(id => {
          const obj = cad.objects.find(o => o.id === id)
          if (!obj) return null
          return <SelectionHandles key={`sel_${id}`} object={obj} pixelScale={pixelScale} moveOffset={cad.selectedIds.includes(id) ? moveOffset : null} />
        })}

        {/* Snap indicator */}
        {snapIndicator && (
          <g pointerEvents="none">
            <circle cx={snapIndicator.x} cy={snapIndicator.y} r={4 * pixelScale} fill="none" stroke="#f59e0b" strokeWidth={1.5 * pixelScale} />
            <circle cx={snapIndicator.x} cy={snapIndicator.y} r={1.5 * pixelScale} fill="#f59e0b" />
          </g>
        )}

        {/* Crosshair */}
        <g pointerEvents="none" opacity={0.5}>
          <line x1={cursor.x - crossSize} y1={cursor.y} x2={cursor.x + crossSize} y2={cursor.y} stroke="#666" strokeWidth={0.5 * pixelScale} strokeDasharray={`${2 * pixelScale} ${2 * pixelScale}`} />
          <line x1={cursor.x} y1={cursor.y - crossSize} x2={cursor.x} y2={cursor.y + crossSize} stroke="#666" strokeWidth={0.5 * pixelScale} strokeDasharray={`${2 * pixelScale} ${2 * pixelScale}`} />
        </g>

        {/* Text input */}
        {phase?.tool === 'text-input' && (
          <foreignObject x={phase.position.x} y={phase.position.y - 20 * pixelScale} width={200 * pixelScale} height={30 * pixelScale}>
            <input
              autoFocus value={textInput}
              title="Sláðu inn texta"
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && textInput.trim()) {
                  cad.addObject({ type: 'text', position: phase.position, content: textInput.trim(), fontSize: 12 * pixelScale, rotation: 0 })
                  setTextInput(''); setPhase(null); onStatusChange?.('Texti búinn til')
                }
                if (e.key === 'Escape') { setTextInput(''); setPhase(null) }
              }}
              className="w-full px-1 border border-blue-500 bg-white text-sm"
              style={{ fontSize: '12px' }}
              placeholder="Texti..."
            />
          </foreignObject>
        )}
      </svg>
    </div>
  )
}

// ── Object SVG Renderer ──
function CadObjectSvg({ object, selected, pixelScale }: { object: CadObject; selected: boolean; pixelScale: number }) {
  const { geometry: geo, style } = object
  const common: React.SVGAttributes<SVGElement> = {
    stroke: style.stroke,
    strokeWidth: style.strokeWidth + (selected ? 1 * pixelScale : 0),
    fill: style.fill || 'none',
    opacity: style.opacity,
    strokeDasharray: style.lineDash?.join(' ') || undefined,
  }

  switch (geo.type) {
    case 'line':
      return <line x1={geo.start.x} y1={geo.start.y} x2={geo.end.x} y2={geo.end.y} {...common} />
    case 'rect': {
      const cx = geo.origin.x + geo.width / 2, cy = geo.origin.y + geo.height / 2
      return <rect x={geo.origin.x} y={geo.origin.y} width={geo.width} height={geo.height}
        transform={geo.rotation ? `rotate(${geo.rotation} ${cx} ${cy})` : undefined} {...common} />
    }
    case 'circle':
      return <circle cx={geo.center.x} cy={geo.center.y} r={geo.radius} {...common} />
    case 'arc': {
      const sa = geo.startAngle * Math.PI / 180, ea = geo.endAngle * Math.PI / 180
      const x1 = geo.center.x + geo.radius * Math.cos(sa), y1 = geo.center.y + geo.radius * Math.sin(sa)
      const x2 = geo.center.x + geo.radius * Math.cos(ea), y2 = geo.center.y + geo.radius * Math.sin(ea)
      let sweep = ea - sa; if (sweep < 0) sweep += 2 * Math.PI
      return <path d={`M ${x1} ${y1} A ${geo.radius} ${geo.radius} 0 ${sweep > Math.PI ? 1 : 0} 1 ${x2} ${y2}`} {...common} />
    }
    case 'polyline': {
      const d = geo.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + (geo.closed ? ' Z' : '')
      return <path d={d} {...common} />
    }
    case 'text':
      return (
        <text x={geo.position.x} y={geo.position.y} fontSize={geo.fontSize} fill={style.stroke}
          fontFamily="Barlow, sans-serif" opacity={style.opacity}
          transform={geo.rotation ? `rotate(${geo.rotation} ${geo.position.x} ${geo.position.y})` : undefined}>
          {geo.content}
        </text>
      )
    case 'dimension':
      return <DimensionSvg geo={geo} style={style} pixelScale={pixelScale} />
    case 'ellipse':
      return (
        <ellipse cx={geo.center.x} cy={geo.center.y} rx={geo.rx} ry={geo.ry}
          transform={geo.rotation ? `rotate(${geo.rotation} ${geo.center.x} ${geo.center.y})` : undefined}
          {...common} />
      )
    case 'polygon': {
      const pts = polygonVertices(geo.center, geo.radius, geo.sides, geo.rotation)
      const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
      return <path d={d} {...common} />
    }
  }
}

// ── Dimension Renderer ──
function DimensionSvg({ geo, style, pixelScale }: { geo: DimensionGeometry; style: CadStyle; pixelScale: number }) {
  const { start, end, offset } = geo
  const dx = end.x - start.x, dy = end.y - start.y
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 0.1) return null
  const nx = -dy / len, ny = dx / len
  const ox = nx * offset, oy = ny * offset
  const sw = style.strokeWidth || 0.5 * pixelScale
  const arrowSize = 6 * pixelScale
  const angle = Math.atan2(dy, dx)

  return (
    <g stroke={style.stroke} fill={style.stroke} opacity={style.opacity}>
      <line x1={start.x} y1={start.y} x2={start.x + ox} y2={start.y + oy} strokeWidth={sw * 0.5} />
      <line x1={end.x} y1={end.y} x2={end.x + ox} y2={end.y + oy} strokeWidth={sw * 0.5} />
      <line x1={start.x + ox} y1={start.y + oy} x2={end.x + ox} y2={end.y + oy} strokeWidth={sw} />
      <polygon points={arrowHead({ x: start.x + ox, y: start.y + oy }, angle, arrowSize)} />
      <polygon points={arrowHead({ x: end.x + ox, y: end.y + oy }, angle + Math.PI, arrowSize)} />
      <text x={(start.x + end.x) / 2 + ox} y={(start.y + end.y) / 2 + oy - 3 * pixelScale}
        fontSize={10 * pixelScale} textAnchor="middle" fontFamily="Barlow, sans-serif">{len.toFixed(1)}</text>
    </g>
  )
}

function arrowHead(tip: Point2D, angle: number, size: number): string {
  const a1 = angle + Math.PI * 0.85, a2 = angle - Math.PI * 0.85
  return `${tip.x},${tip.y} ${tip.x + size * Math.cos(a1)},${tip.y + size * Math.sin(a1)} ${tip.x + size * Math.cos(a2)},${tip.y + size * Math.sin(a2)}`
}

// ── Drawing Preview ──
function DrawingPreview({ phase, cursor, pixelScale }: { phase: DrawingPhase; cursor: Point2D; pixelScale: number }) {
  if (!phase) return null
  const ps: React.SVGAttributes<SVGElement> = { stroke: '#2563eb', strokeWidth: 1 * pixelScale, fill: 'none', strokeDasharray: `${4 * pixelScale} ${2 * pixelScale}`, pointerEvents: 'none' }

  switch (phase.tool) {
    case 'line':
      return <line x1={phase.start.x} y1={phase.start.y} x2={cursor.x} y2={cursor.y} {...ps} />
    case 'rect':
      return <rect x={Math.min(phase.start.x, cursor.x)} y={Math.min(phase.start.y, cursor.y)} width={Math.abs(cursor.x - phase.start.x)} height={Math.abs(cursor.y - phase.start.y)} {...ps} />
    case 'circle':
      return <circle cx={phase.center.x} cy={phase.center.y} r={dist(phase.center, cursor)} {...ps} />
    case 'arc': {
      if (phase.radius == null) return <circle cx={phase.center.x} cy={phase.center.y} r={dist(phase.center, cursor)} {...ps} />
      const sa = phase.startAngle! * Math.PI / 180
      const ea = Math.atan2(cursor.y - phase.center.y, cursor.x - phase.center.x)
      const x1 = phase.center.x + phase.radius * Math.cos(sa), y1 = phase.center.y + phase.radius * Math.sin(sa)
      const x2 = phase.center.x + phase.radius * Math.cos(ea), y2 = phase.center.y + phase.radius * Math.sin(ea)
      let sweep = ea - sa; if (sweep < 0) sweep += 2 * Math.PI
      return <path d={`M ${x1} ${y1} A ${phase.radius} ${phase.radius} 0 ${sweep > Math.PI ? 1 : 0} 1 ${x2} ${y2}`} {...ps} />
    }
    case 'polyline': {
      if (phase.points.length === 0) return null
      const pts = [...phase.points, cursor]
      return <path d={pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} {...ps} />
    }
    case 'dimension':
      if (!phase.end) return <line x1={phase.start.x} y1={phase.start.y} x2={cursor.x} y2={cursor.y} {...ps} />
      return <line x1={phase.start.x} y1={phase.start.y} x2={phase.end.x} y2={phase.end.y} {...ps} />
    case 'measure':
      return (
        <g pointerEvents="none">
          <line x1={phase.start.x} y1={phase.start.y} x2={cursor.x} y2={cursor.y} stroke="#dc2626" strokeWidth={1 * pixelScale} strokeDasharray={`${3 * pixelScale} ${3 * pixelScale}`} />
          <text x={(phase.start.x + cursor.x) / 2} y={(phase.start.y + cursor.y) / 2 - 5 * pixelScale}
            fontSize={10 * pixelScale} fill="#dc2626" textAnchor="middle" fontFamily="Barlow, sans-serif">
            {dist(phase.start, cursor).toFixed(1)}
          </text>
        </g>
      )
    case 'ellipse': {
      if (phase.rx == null) {
        const rx = Math.abs(cursor.x - phase.center.x)
        return <ellipse cx={phase.center.x} cy={phase.center.y} rx={rx} ry={rx} {...ps} />
      }
      const ry = Math.abs(cursor.y - phase.center.y)
      return <ellipse cx={phase.center.x} cy={phase.center.y} rx={phase.rx} ry={ry} {...ps} />
    }
    case 'polygon': {
      const r = dist(phase.center, cursor)
      const rot = Math.atan2(cursor.y - phase.center.y, cursor.x - phase.center.x) * 180 / Math.PI + 90
      const pts = polygonVertices(phase.center, r, phase.sides, rot)
      const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
      return (
        <g pointerEvents="none">
          <path d={d} {...ps} />
          <text x={phase.center.x} y={phase.center.y - r - 5 * pixelScale}
            fontSize={9 * pixelScale} fill="#2563eb" textAnchor="middle" fontFamily="Barlow, sans-serif">
            {phase.sides} hliðar
          </text>
        </g>
      )
    }
    default:
      return null
  }
}

// ── Selection Handles ──
function SelectionHandles({ object, pixelScale, moveOffset }: { object: CadObject; pixelScale: number; moveOffset: Point2D | null }) {
  const bb = getBoundingBox(object)
  const size = 4 * pixelScale
  const tx = moveOffset?.x || 0, ty = moveOffset?.y || 0
  const handles = [
    { x: bb.minX + tx, y: bb.minY + ty }, { x: bb.maxX + tx, y: bb.minY + ty },
    { x: bb.minX + tx, y: bb.maxY + ty }, { x: bb.maxX + tx, y: bb.maxY + ty },
  ]
  return (
    <g pointerEvents="none">
      <rect x={bb.minX + tx} y={bb.minY + ty} width={bb.maxX - bb.minX} height={bb.maxY - bb.minY}
        fill="none" stroke="#2563eb" strokeWidth={0.5 * pixelScale} strokeDasharray={`${3 * pixelScale} ${2 * pixelScale}`} />
      {handles.map((h, i) => (
        <rect key={i} x={h.x - size / 2} y={h.y - size / 2} width={size} height={size}
          fill="white" stroke="#2563eb" strokeWidth={0.5 * pixelScale} />
      ))}
    </g>
  )
}

// ── Hit testing ──
function hitTestObject(obj: CadObject, pt: Point2D, threshold: number): boolean {
  const geo = obj.geometry
  switch (geo.type) {
    case 'line':
      return distToSegment(pt, geo.start, geo.end) < threshold
    case 'rect': {
      const { origin: o, width: w, height: h } = geo
      return distToSegment(pt, o, { x: o.x + w, y: o.y }) < threshold ||
        distToSegment(pt, { x: o.x + w, y: o.y }, { x: o.x + w, y: o.y + h }) < threshold ||
        distToSegment(pt, { x: o.x + w, y: o.y + h }, { x: o.x, y: o.y + h }) < threshold ||
        distToSegment(pt, { x: o.x, y: o.y + h }, o) < threshold
    }
    case 'circle':
      return Math.abs(dist(pt, geo.center) - geo.radius) < threshold
    case 'arc': {
      if (Math.abs(dist(pt, geo.center) - geo.radius) > threshold) return false
      let a = Math.atan2(pt.y - geo.center.y, pt.x - geo.center.x) * 180 / Math.PI
      let sa = geo.startAngle % 360, ea = geo.endAngle % 360
      if (sa < 0) sa += 360; if (ea < 0) ea += 360; if (a < 0) a += 360
      return sa <= ea ? (a >= sa && a <= ea) : (a >= sa || a <= ea)
    }
    case 'polyline':
      for (let i = 1; i < geo.points.length; i++) if (distToSegment(pt, geo.points[i - 1], geo.points[i]) < threshold) return true
      if (geo.closed && geo.points.length > 2 && distToSegment(pt, geo.points[geo.points.length - 1], geo.points[0]) < threshold) return true
      return false
    case 'text': {
      const w = geo.content.length * geo.fontSize * 0.6
      return pt.x >= geo.position.x && pt.x <= geo.position.x + w && pt.y >= geo.position.y - geo.fontSize && pt.y <= geo.position.y + geo.fontSize * 0.2
    }
    case 'dimension': {
      const { start: s, end: e, offset: off } = geo
      const ddx = e.x - s.x, ddy = e.y - s.y
      const ln = Math.sqrt(ddx * ddx + ddy * ddy)
      if (ln < 0.1) return false
      const nx = -ddy / ln, ny = ddx / ln
      return distToSegment(pt, { x: s.x + nx * off, y: s.y + ny * off }, { x: e.x + nx * off, y: e.y + ny * off }) < threshold
    }
    case 'ellipse': {
      // Approximate ellipse hit by checking normalized distance
      const dx = pt.x - geo.center.x, dy = pt.y - geo.center.y
      const norm = (dx * dx) / (geo.rx * geo.rx) + (dy * dy) / (geo.ry * geo.ry)
      return Math.abs(Math.sqrt(norm) - 1) < threshold / Math.min(geo.rx, geo.ry)
    }
    case 'polygon': {
      const pts = polygonVertices(geo.center, geo.radius, geo.sides, geo.rotation)
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length]
        if (distToSegment(pt, a, b) < threshold) return true
      }
      return false
    }
  }
}

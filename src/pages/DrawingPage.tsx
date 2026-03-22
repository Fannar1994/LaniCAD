import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useCadState } from '@/hooks/useCadState'
import { useScene3D } from '@/hooks/useScene3D'
import { useChatCad } from '@/contexts/ChatCadContext'
import { CadCanvas } from '@/components/cad/CadCanvas'
import { CadToolbar } from '@/components/cad/CadToolbar'
import { CadSideTools } from '@/components/cad/CadSideTools'
import { LayerPanel } from '@/components/cad/LayerPanel'
import { PropertiesPanel } from '@/components/cad/PropertiesPanel'
import { CommandBar } from '@/components/cad/CommandBar'
import { PdfImportDialog } from '@/components/cad/PdfImportDialog'
import { Scene3DCanvas } from '@/components/cad/Scene3DCanvas'
import { Scene3DToolbar } from '@/components/cad/Scene3DToolbar'
import { Scene3DObjectList } from '@/components/cad/Scene3DObjectList'
import { Viewer3D } from '@/components/viewer/Viewer3D'
import { createFenceDrawing } from '@/components/viewer/drawings/FenceDrawing2D'
import { createScaffoldDrawing } from '@/components/viewer/drawings/ScaffoldDrawing2D'
import { createRollingScaffoldDrawing } from '@/components/viewer/drawings/RollingScaffoldDrawing2D'
import { createFormworkDrawing } from '@/components/viewer/drawings/FormworkDrawing2D'
import { createCeilingPropsDrawing } from '@/components/viewer/drawings/CeilingPropsDrawing2D'
import { FenceModel3D } from '@/components/viewer/models/FenceModel3D'
import { ScaffoldModel3D } from '@/components/viewer/models/ScaffoldModel3D'
import { RollingScaffoldModel3D } from '@/components/viewer/models/RollingScaffoldModel3D'
import { FormworkModel3D } from '@/components/viewer/models/FormworkModel3D'
import { CeilingPropsModel3D } from '@/components/viewer/models/CeilingPropsModel3D'
import { exportDxf } from '@/lib/cad/export-dxf'
import { importDxf } from '@/lib/cad/import-dxf'
import type { Point2D } from '@/types/cad'
import { cadId } from '@/types/cad'

type EquipmentType = 'fence' | 'scaffold' | 'rolling' | 'formwork' | 'ceiling'
type ViewMode = 'cad' | '3d' | '3d-scene'

const equipmentOptions: { value: EquipmentType; label: string }[] = [
  { value: 'fence', label: 'Girðingar' },
  { value: 'scaffold', label: 'Vinnupallar' },
  { value: 'rolling', label: 'Hjólapallar' },
  { value: 'formwork', label: 'Steypumót' },
  { value: 'ceiling', label: 'Loftastoðir' },
]

export function DrawingPage() {
  const cad = useCadState()
  const scene3d = useScene3D()
  const [viewMode, setViewMode] = useState<ViewMode>('cad')
  const [cursorPos, setCursorPos] = useState<Point2D>({ x: 0, y: 0 })
  const [status, setStatus] = useState('')
  const [equipmentType, setEquipmentType] = useState<EquipmentType>('scaffold')
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false)
  const dxfInputRef = useRef<HTMLInputElement>(null)

  // Fence params
  const [fencePanels, setFencePanels] = useState(6)
  const [fencePanelWidth, setFencePanelWidth] = useState(3.5)
  const [fencePanelHeight, setFencePanelHeight] = useState(2.0)
  const [fenceIncludeGate, setFenceIncludeGate] = useState(false)

  // Scaffold params
  const [scaffoldLength, setScaffoldLength] = useState(10)
  const [scaffoldLevels2m, setScaffoldLevels2m] = useState(3)
  const [scaffoldLevels07m, setScaffoldLevels07m] = useState(0)
  const [scaffoldLegType, setScaffoldLegType] = useState<'50cm' | '100cm'>('50cm')

  // Rolling scaffold params
  const [rollingHeight, setRollingHeight] = useState(6)
  const [rollingWidth, setRollingWidth] = useState<'narrow' | 'wide'>('wide')

  // Formwork params
  const [formworkLength, setFormworkLength] = useState(6)
  const [formworkHeight, setFormworkHeight] = useState(3)
  const [formworkSystem, setFormworkSystem] = useState<'Rasto' | 'Takko' | 'Manto'>('Rasto')

  // Ceiling props params
  const [ceilingPropCount, setCeilingPropCount] = useState(4)
  const [ceilingPropHeight, setCeilingPropHeight] = useState(3)
  const [ceilingBeamCount, setCeilingBeamCount] = useState(3)
  const [ceilingRoomWidth, setCeilingRoomWidth] = useState(6)

  // Chat → CAD bridge: consume pending actions from AI chat
  const { pendingAction, clearPendingAction } = useChatCad()
  useEffect(() => {
    if (!pendingAction) return
    const { type, params } = pendingAction
    const n = (key: string, fallback: number) => (typeof params[key] === 'number' ? params[key] : fallback) as number
    const s = (key: string, fallback: string) => (typeof params[key] === 'string' ? params[key] : fallback) as string
    clearPendingAction()

    switch (type) {
      case 'place_fence':
        setEquipmentType('fence')
        if (params.panels) setFencePanels(n('panels', fencePanels))
        if (params.panelWidth) setFencePanelWidth(n('panelWidth', fencePanelWidth))
        if (params.panelHeight) setFencePanelHeight(n('panelHeight', fencePanelHeight))
        if (params.includeGate !== undefined) setFenceIncludeGate(!!params.includeGate)
        setStatus('AI: Girðing sett upp')
        break
      case 'place_scaffold':
        setEquipmentType('scaffold')
        if (params.length) setScaffoldLength(n('length', scaffoldLength))
        if (params.levels2m) setScaffoldLevels2m(n('levels2m', scaffoldLevels2m))
        if (params.levels07m) setScaffoldLevels07m(n('levels07m', scaffoldLevels07m))
        setStatus('AI: Vinnupallur settur upp')
        break
      case 'place_formwork':
        setEquipmentType('formwork')
        if (params.length) setFormworkLength(n('length', formworkLength))
        if (params.height) setFormworkHeight(n('height', formworkHeight))
        if (params.system) setFormworkSystem(s('system', formworkSystem) as 'Rasto' | 'Takko' | 'Manto')
        setStatus('AI: Steypumót sett upp')
        break
      case 'place_rolling':
        setEquipmentType('rolling')
        if (params.height) setRollingHeight(n('height', rollingHeight))
        if (params.width) setRollingWidth(s('width', rollingWidth) as 'narrow' | 'wide')
        setStatus('AI: Hjólapallur settur upp')
        break
      case 'place_ceiling':
        setEquipmentType('ceiling')
        if (params.propCount) setCeilingPropCount(n('propCount', ceilingPropCount))
        if (params.propHeight) setCeilingPropHeight(n('propHeight', ceilingPropHeight))
        if (params.beamCount) setCeilingBeamCount(n('beamCount', ceilingBeamCount))
        if (params.roomWidth) setCeilingRoomWidth(n('roomWidth', ceilingRoomWidth))
        setStatus('AI: Loftastoðir settar upp')
        break
      case 'draw_rect':
        cad.addObject({
          type: 'rect',
          origin: { x: n('x', 0), y: n('y', 0) },
          width: n('width', 10),
          height: n('height', 5),
          rotation: 0,
        })
        setStatus('AI: Rétthyrningur teiknaður')
        break
      case 'draw_circle':
        cad.addObject({
          type: 'circle',
          center: { x: n('cx', 0), y: n('cy', 0) },
          radius: n('radius', 3),
        })
        setStatus('AI: Hringur teiknaður')
        break
      case 'draw_line':
        cad.addObject({
          type: 'line',
          start: { x: 0, y: 0 },
          end: { x: n('length', 10), y: 0 },
        })
        setStatus('AI: Lína teiknuð')
        break
      case 'draw_text':
        cad.addObject({
          type: 'text',
          position: { x: 0, y: 0 },
          content: s('text', 'LániCAD'),
          fontSize: 14,
          rotation: 0,
        })
        setStatus('AI: Texti bættur við')
        break
    }
  }, [pendingAction, clearPendingAction, cad])

  const svgContent = useMemo(() => {
    switch (equipmentType) {
      case 'fence':
        return createFenceDrawing({ panels: fencePanels, panelWidth: fencePanelWidth, panelHeight: fencePanelHeight, stones: fencePanels + 1, clamps: fencePanels - 1, includeGate: fenceIncludeGate })
      case 'scaffold':
        return createScaffoldDrawing({ length: scaffoldLength, levels2m: scaffoldLevels2m, levels07m: scaffoldLevels07m, legType: scaffoldLegType, endcaps: 0 })
      case 'rolling':
        return createRollingScaffoldDrawing({ height: rollingHeight, width: rollingWidth })
      case 'formwork':
        return createFormworkDrawing({ wallLength: formworkLength, wallHeight: formworkHeight, system: formworkSystem })
      case 'ceiling':
        return createCeilingPropsDrawing({ propCount: ceilingPropCount, propHeight: ceilingPropHeight, beamCount: ceilingBeamCount, roomWidth: ceilingRoomWidth })
    }
  }, [
    equipmentType,
    fencePanels, fencePanelWidth, fencePanelHeight, fenceIncludeGate,
    scaffoldLength, scaffoldLevels2m, scaffoldLevels07m, scaffoldLegType,
    rollingHeight, rollingWidth,
    formworkLength, formworkHeight, formworkSystem,
    ceilingPropCount, ceilingPropHeight, ceilingBeamCount, ceilingRoomWidth,
  ])

  const model3D = useMemo(() => {
    switch (equipmentType) {
      case 'fence':
        return <FenceModel3D panels={fencePanels} panelWidth={fencePanelWidth} panelHeight={fencePanelHeight} includeGate={fenceIncludeGate} />
      case 'scaffold':
        return <ScaffoldModel3D length={scaffoldLength} levels2m={scaffoldLevels2m} levels07m={scaffoldLevels07m} legType={scaffoldLegType} />
      case 'rolling':
        return <RollingScaffoldModel3D height={rollingHeight} width={rollingWidth} />
      case 'formwork':
        return <FormworkModel3D wallLength={formworkLength} wallHeight={formworkHeight} system={formworkSystem} />
      case 'ceiling':
        return <CeilingPropsModel3D propCount={ceilingPropCount} propHeight={ceilingPropHeight} beamCount={ceilingBeamCount} roomWidth={ceilingRoomWidth} />
    }
  }, [
    equipmentType,
    fencePanels, fencePanelWidth, fencePanelHeight, fenceIncludeGate,
    scaffoldLength, scaffoldLevels2m, scaffoldLevels07m, scaffoldLegType,
    rollingHeight, rollingWidth,
    formworkLength, formworkHeight, formworkSystem,
    ceilingPropCount, ceilingPropHeight, ceilingBeamCount, ceilingRoomWidth,
  ])

  const cameraPosition: [number, number, number] = useMemo(() => {
    switch (equipmentType) {
      case 'fence': return [fencePanels * fencePanelWidth * 0.6, 4, 8]
      case 'scaffold': return [scaffoldLength * 0.6, scaffoldLevels2m * 2, scaffoldLength * 0.8]
      case 'rolling': return [4, rollingHeight * 0.7, 6]
      case 'formwork': return [formworkLength * 0.6, formworkHeight, formworkLength * 0.8]
      case 'ceiling': return [ceilingRoomWidth * 0.6, ceilingPropHeight, ceilingRoomWidth * 0.8]
    }
  }, [equipmentType, fencePanels, fencePanelWidth, scaffoldLength, scaffoldLevels2m, rollingHeight, formworkLength, formworkHeight, ceilingRoomWidth, ceilingPropHeight])

  // Import handlers
  const handleImportDxf = useCallback(() => { dxfInputRef.current?.click() }, [])
  const handleDxfFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const content = reader.result as string
      const { objects, layers } = importDxf(content)
      cad.importObjects(objects, layers)
      setStatus(`DXF innflutt: ${objects.length} hlutir`)
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [cad])
  const handleImportPdf = useCallback(() => { setPdfDialogOpen(true) }, [])
  const handlePdfImported = useCallback((result: { svgContent: string; width: number; height: number; ocrText: string }) => {
    // Add the PDF page as a rect with SVG background on the equipment layer
    cad.importObjects([{
      id: cadId(),
      layerId: 'equipment',
      style: { stroke: '#999', strokeWidth: 0.5, fill: 'none', opacity: 0.6 },
      locked: false,
      geometry: { type: 'rect', origin: { x: 0, y: 0 }, width: result.width, height: result.height, rotation: 0 },
    }], [])
    setStatus(`PDF innflutt (${Math.round(result.width)}×${Math.round(result.height)})${result.ocrText ? ' + OCR texti' : ''}`)
  }, [cad])

  // Export handlers
  const handleExportSvg = useCallback(() => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    downloadBlob(blob, 'lanicad-drawing.svg')
  }, [svgContent])

  const handleExportDxf = useCallback(() => {
    const dxf = exportDxf(cad.objects, cad.layers)
    downloadBlob(new Blob([dxf], { type: 'application/dxf' }), 'lanicad-drawing.dxf')
  }, [cad.objects, cad.layers])

  const handleExportPdf = useCallback(() => { window.print() }, [])

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Hidden DXF file input */}
      <input ref={dxfInputRef} type="file" accept=".dxf" onChange={handleDxfFileChange} className="hidden" title="Flytja inn DXF skrá" />
      {/* PDF import dialog */}
      <PdfImportDialog open={pdfDialogOpen} onClose={() => setPdfDialogOpen(false)} onImport={handlePdfImported} />
      {/* Top toolbar (CAD mode only) */}
      {viewMode === 'cad' && <CadToolbar cad={cad} onExportSvg={handleExportSvg} onExportDxf={handleExportDxf} onExportPdf={handleExportPdf} onImportDxf={handleImportDxf} onImportPdf={handleImportPdf} />}

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Drawing tools (only in CAD mode) */}
        {viewMode === 'cad' && <CadSideTools cad={cad} />}

        {/* Center: Canvas area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mode tabs */}
          <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 border-b">
            <button onClick={() => setViewMode('cad')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${viewMode === 'cad' ? 'bg-[#404042] text-white' : 'bg-white text-gray-600 hover:bg-gray-200'}`}>
              2D Teikning
            </button>
            <button onClick={() => setViewMode('3d-scene')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${viewMode === '3d-scene' ? 'bg-[#404042] text-white' : 'bg-white text-gray-600 hover:bg-gray-200'}`}>
              3D Verksvæði
            </button>
            <button onClick={() => setViewMode('3d')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${viewMode === '3d' ? 'bg-[#404042] text-white' : 'bg-white text-gray-600 hover:bg-gray-200'}`}>
              3D Forskoðun
            </button>
          </div>

          {/* 3D Scene toolbar (only in 3d-scene mode) */}
          {viewMode === '3d-scene' && <Scene3DToolbar scene={scene3d} />}

          {/* Canvas or 3D */}
          {viewMode === 'cad' ? (
            <CadCanvas cad={cad} equipmentSvg={svgContent} onCursorChange={setCursorPos} onStatusChange={setStatus} />
          ) : viewMode === '3d-scene' ? (
            <div className="flex-1 overflow-hidden">
              <Scene3DCanvas scene={scene3d} />
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <Viewer3D cameraPosition={cameraPosition} className="!h-full">{model3D}</Viewer3D>
            </div>
          )}

          {/* Command bar (CAD mode only) */}
          {viewMode === 'cad' && <CommandBar cad={cad} cursorPos={cursorPos} status={status} />}
        </div>

        {/* Right panel */}
        <div className="w-64 border-l bg-white overflow-y-auto">
          {viewMode === '3d-scene' ? (
            <>
              {/* 3D Scene object list */}
              <Scene3DObjectList scene={scene3d} />
              <div className="border-t" />
              {/* Equipment params for placing */}
              <div className="px-3 py-3 space-y-3">
                <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Búnaður til að setja</h3>
                <select value={scene3d.placeKind} onChange={e => scene3d.setPlaceKind(e.target.value as EquipmentType)}
                  title="Veldu tegund búnaðar"
                  className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-brand-accent focus:ring-1 focus:ring-brand-accent">
                  {equipmentOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </>
          ) : (
            <>
              {/* Equipment type selector */}
              <div className="px-3 py-3 space-y-3">
                <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Búnaður</h3>
            <select value={equipmentType} onChange={e => setEquipmentType(e.target.value as EquipmentType)}
              title="Veldu tegund búnaðar"
              className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-brand-accent focus:ring-1 focus:ring-brand-accent">
              {equipmentOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>

            {/* Dynamic params */}
            {equipmentType === 'fence' && (
              <div className="space-y-2">
                <NumField label="Fjöldi panela" value={fencePanels} onChange={setFencePanels} min={1} max={50} />
                <SelField label="Breidd" value={String(fencePanelWidth)} onChange={v => setFencePanelWidth(Number(v))} options={[['3.5', '3.5m'], ['2.5', '2.5m'], ['2.1', '2.1m']]} />
                <SelField label="Hæð" value={String(fencePanelHeight)} onChange={v => setFencePanelHeight(Number(v))} options={[['2.0', '2.0m'], ['1.8', '1.8m']]} />
                <ChkField label="Hlið" checked={fenceIncludeGate} onChange={setFenceIncludeGate} />
              </div>
            )}
            {equipmentType === 'scaffold' && (
              <div className="space-y-2">
                <NumField label="Lengd (m)" value={scaffoldLength} onChange={setScaffoldLength} min={1.8} max={100} step={1.8} />
                <NumField label="2m hæðir" value={scaffoldLevels2m} onChange={setScaffoldLevels2m} min={1} max={10} />
                <NumField label="0.7m hæðir" value={scaffoldLevels07m} onChange={setScaffoldLevels07m} min={0} max={5} />
                <SelField label="Fótar" value={scaffoldLegType} onChange={v => setScaffoldLegType(v as '50cm' | '100cm')} options={[['50cm', '50cm fótur'], ['100cm', '100cm fótur']]} />
              </div>
            )}
            {equipmentType === 'rolling' && (
              <div className="space-y-2">
                <NumField label="Hæð (m)" value={rollingHeight} onChange={setRollingHeight} min={2} max={14} />
                <SelField label="Breidd" value={rollingWidth} onChange={v => setRollingWidth(v as 'narrow' | 'wide')} options={[['narrow', 'Mjór (0.75m)'], ['wide', 'Breiður (1.35m)']]} />
              </div>
            )}
            {equipmentType === 'formwork' && (
              <div className="space-y-2">
                <NumField label="Vegglengd (m)" value={formworkLength} onChange={setFormworkLength} min={1} max={30} step={0.5} />
                <NumField label="Hæð (m)" value={formworkHeight} onChange={setFormworkHeight} min={1} max={6} step={0.5} />
                <SelField label="Kerfi" value={formworkSystem} onChange={v => setFormworkSystem(v as 'Rasto' | 'Takko' | 'Manto')} options={[['Rasto', 'Rasto'], ['Takko', 'Takko'], ['Manto', 'Manto']]} />
              </div>
            )}
            {equipmentType === 'ceiling' && (
              <div className="space-y-2">
                <NumField label="Fjöldi stoða" value={ceilingPropCount} onChange={setCeilingPropCount} min={1} max={20} />
                <NumField label="Hæð (m)" value={ceilingPropHeight} onChange={setCeilingPropHeight} min={1.5} max={5.5} step={0.1} />
                <NumField label="Bitar (HT-20)" value={ceilingBeamCount} onChange={setCeilingBeamCount} min={1} max={10} />
                <NumField label="Herbergisbreidd (m)" value={ceilingRoomWidth} onChange={setCeilingRoomWidth} min={2} max={15} step={0.5} />
              </div>
            )}
          </div>

          {/* Layers */}
          <LayerPanel cad={cad} />

          {/* Properties */}
          <PropertiesPanel cad={cad} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Compact form controls ── */

function NumField({ label, value, onChange, min, max, step = 1 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number
}) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-0.5">{label}</label>
      <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max} step={step}
        title={label}
        className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-brand-accent focus:ring-1 focus:ring-brand-accent" />
    </div>
  )
}

function SelField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: [string, string][]
}) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-0.5">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        title={label}
        className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-brand-accent focus:ring-1 focus:ring-brand-accent">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  )
}

function ChkField({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        className="rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
      {label}
    </label>
  )
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

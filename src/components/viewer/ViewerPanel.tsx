import { useState, useRef, useEffect } from 'react'
import { Viewer2D } from './Viewer2D'
import { Viewer3D } from './Viewer3D'
import { InteractiveCanvas2D } from './InteractiveCanvas2D'
import { Maximize, MousePointer, Hand, PlusCircle, Grid3X3, Undo2, Redo2, Trash2 } from 'lucide-react'
import type { Canvas2DState, CanvasObject } from '@/hooks/useCanvas2D'

type ViewMode = '2d' | '3d' | 'interactive'

interface ViewerPanelProps {
  svgContent: string
  model3D: React.ReactNode
  cameraPosition?: [number, number, number]
  onOpenInDrawing?: () => void
  /** Interactive canvas state (from useCanvas2D hook) */
  canvas?: Canvas2DState
  /** Type for click-to-place in interactive mode */
  placementType?: CanvasObject['type']
  /** Default properties for placed objects */
  placementDefaults?: Partial<CanvasObject>
}

const tabClass = (active: boolean) =>
  `px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
    active
      ? 'bg-[#404042] text-white'
      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
  }`

export function ViewerPanel({
  svgContent,
  model3D,
  cameraPosition,
  onOpenInDrawing,
  canvas,
  placementType,
  placementDefaults,
}: ViewerPanelProps) {
  const [mode, setMode] = useState<ViewMode>('2d')
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 600, height: 400 })

  // Measure container for interactive canvas sizing
  useEffect(() => {
    if (!containerRef.current || mode !== 'interactive') return
    const el = containerRef.current
    const ro = new ResizeObserver(([entry]) => {
      setContainerSize({
        width: Math.floor(entry.contentRect.width),
        height: Math.max(400, Math.floor(entry.contentRect.height)),
      })
    })
    ro.observe(el)
    setContainerSize({ width: el.clientWidth, height: Math.max(400, el.clientHeight) })
    return () => ro.disconnect()
  }, [mode])

  return (
    <div>
      <div className="flex gap-1 mb-3 flex-wrap">
        <button onClick={() => setMode('2d')} className={tabClass(mode === '2d')}>
          2D Teikning
        </button>
        <button onClick={() => setMode('3d')} className={tabClass(mode === '3d')}>
          3D Sýning
        </button>
        {canvas && (
          <button onClick={() => setMode('interactive')} className={tabClass(mode === 'interactive')}>
            Gagnvirkt
          </button>
        )}
        {onOpenInDrawing && (
          <button
            onClick={onOpenInDrawing}
            className="ml-auto flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-md bg-[#f5c800] text-[#404042] hover:bg-[#e0b700] transition-colors"
          >
            <Maximize size={14} />
            Opna í teikniborði
          </button>
        )}
      </div>

      {/* Interactive canvas toolbar */}
      {mode === 'interactive' && canvas && (
        <div className="flex gap-1 mb-2 items-center text-sm flex-wrap">
          <button
            onClick={() => canvas.setTool('select')}
            className={`p-1.5 rounded ${canvas.tool === 'select' ? 'bg-[#404042] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Velja (V)"
          >
            <MousePointer size={16} />
          </button>
          <button
            onClick={() => canvas.setTool('pan')}
            className={`p-1.5 rounded ${canvas.tool === 'pan' ? 'bg-[#404042] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Hliðra (H)"
          >
            <Hand size={16} />
          </button>
          <button
            onClick={() => canvas.setTool('place')}
            className={`p-1.5 rounded ${canvas.tool === 'place' ? 'bg-[#f5c800] text-[#404042]' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Setja (P)"
          >
            <PlusCircle size={16} />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button
            onClick={() => canvas.toggleSnap()}
            className={`p-1.5 rounded ${canvas.gridSnap ? 'bg-[#404042] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Hnit (G)"
          >
            <Grid3X3 size={16} />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button
            onClick={() => canvas.undo()}
            disabled={!canvas.canUndo}
            className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30"
            title="Afturkalla (Ctrl+Z)"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={() => canvas.redo()}
            disabled={!canvas.canRedo}
            className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30"
            title="Endurtaka (Ctrl+Y)"
          >
            <Redo2 size={16} />
          </button>
          <button
            onClick={() => { if (canvas.selectedId) canvas.removeObject(canvas.selectedId) }}
            disabled={!canvas.selectedId}
            className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 text-red-600"
            title="Eyða (Delete)"
          >
            <Trash2 size={16} />
          </button>
          <span className="ml-auto text-xs text-gray-400">
            {canvas.objects.length} hlutir · {Math.round(canvas.zoom * 100)}%
          </span>
        </div>
      )}

      {mode === '2d' && <Viewer2D svgContent={svgContent} />}
      {mode === '3d' && (
        <Viewer3D cameraPosition={cameraPosition}>
          {model3D}
        </Viewer3D>
      )}
      {mode === 'interactive' && canvas && (
        <div ref={containerRef} className="w-full border rounded-lg overflow-hidden bg-white" style={{ minHeight: 400 }}>
          <InteractiveCanvas2D
            canvas={canvas}
            width={containerSize.width}
            height={containerSize.height}
            placementType={placementType}
            placementDefaults={placementDefaults}
          />
        </div>
      )}
    </div>
  )
}

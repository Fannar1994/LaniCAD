import { useState } from 'react'
import { Viewer2D } from './Viewer2D'
import { Viewer3D } from './Viewer3D'
import { Maximize } from 'lucide-react'

type ViewMode = '2d' | '3d'

interface ViewerPanelProps {
  svgContent: string
  model3D: React.ReactNode
  cameraPosition?: [number, number, number]
  onOpenInDrawing?: () => void
}

export function ViewerPanel({ svgContent, model3D, cameraPosition, onOpenInDrawing }: ViewerPanelProps) {
  const [mode, setMode] = useState<ViewMode>('2d')

  return (
    <div>
      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setMode('2d')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            mode === '2d'
              ? 'bg-[#404042] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          2D Teikning
        </button>
        <button
          onClick={() => setMode('3d')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            mode === '3d'
              ? 'bg-[#404042] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          3D Sýning
        </button>
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

      {mode === '2d' ? (
        <Viewer2D svgContent={svgContent} />
      ) : (
        <Viewer3D cameraPosition={cameraPosition}>
          {model3D}
        </Viewer3D>
      )}
    </div>
  )
}

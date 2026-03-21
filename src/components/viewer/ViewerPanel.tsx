import { useState } from 'react'
import { Viewer2D } from './Viewer2D'
import { Viewer3D } from './Viewer3D'

type ViewMode = '2d' | '3d'

interface ViewerPanelProps {
  svgContent: string
  model3D: React.ReactNode
  cameraPosition?: [number, number, number]
}

export function ViewerPanel({ svgContent, model3D, cameraPosition }: ViewerPanelProps) {
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

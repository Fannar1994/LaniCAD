import { MousePointer2, Hand, Minus, Square, Circle, RotateCcw, PenLine, Type, Ruler, Maximize2 } from 'lucide-react'
import type { CadStateReturn } from '@/hooks/useCadState'
import type { CadToolType } from '@/types/cad'

const tools: { id: CadToolType; icon: React.ReactNode; label: string; shortcut: string }[] = [
  { id: 'select', icon: <MousePointer2 size={18} />, label: 'Velja', shortcut: 'V' },
  { id: 'pan', icon: <Hand size={18} />, label: 'Hliðra', shortcut: 'P' },
  { id: 'line', icon: <Minus size={18} />, label: 'Lína', shortcut: 'L' },
  { id: 'rect', icon: <Square size={18} />, label: 'Rétthyrningur', shortcut: 'R' },
  { id: 'circle', icon: <Circle size={18} />, label: 'Hringur', shortcut: 'C' },
  { id: 'arc', icon: <RotateCcw size={18} />, label: 'Bogi', shortcut: 'A' },
  { id: 'polyline', icon: <PenLine size={18} />, label: 'Marglína', shortcut: 'W' },
  { id: 'text', icon: <Type size={18} />, label: 'Texti', shortcut: 'T' },
  { id: 'dimension', icon: <Ruler size={18} />, label: 'Mál', shortcut: 'D' },
  { id: 'measure', icon: <Maximize2 size={18} />, label: 'Mæla', shortcut: 'M' },
]

export function CadSideTools({ cad }: { cad: CadStateReturn }) {
  return (
    <div className="w-10 bg-gray-50 border-r flex flex-col items-center py-2 gap-0.5">
      {tools.map(tool => (
        <button
          key={tool.id}
          onClick={() => cad.setActiveTool(tool.id)}
          title={`${tool.label} (${tool.shortcut})`}
          className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
            cad.activeTool === tool.id
              ? 'bg-[#f5c800] text-[#404042]'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  )
}

import { useState } from 'react'
import type { CadStateReturn } from '@/hooks/useCadState'
import type { Point2D, CadToolType } from '@/types/cad'

interface CommandBarProps {
  cad: CadStateReturn
  cursorPos: Point2D
  status: string
}

export function CommandBar({ cad, cursorPos, status }: CommandBarProps) {
  const [input, setInput] = useState('')

  const executeCommand = (cmd: string) => {
    const command = cmd.trim().toLowerCase().split(/\s+/)[0]
    const toolMap: Record<string, CadToolType> = {
      select: 'select', s: 'select', pan: 'pan', p: 'pan',
      line: 'line', l: 'line', rect: 'rect', r: 'rect', rectangle: 'rect',
      circle: 'circle', c: 'circle', arc: 'arc', a: 'arc',
      polyline: 'polyline', pl: 'polyline', pline: 'polyline',
      text: 'text', t: 'text', dimension: 'dimension', dim: 'dimension', d: 'dimension',
      measure: 'measure', m: 'measure', dist: 'measure',
    }
    if (command === 'undo') { cad.undo(); return }
    if (command === 'redo') { cad.redo(); return }
    if (command === 'delete' || command === 'erase') { cad.deleteSelected(); return }
    if (command === 'grid') { cad.setGrid(g => ({ ...g, enabled: !g.enabled })); return }
    if (command === 'snap') { cad.setGrid(g => ({ ...g, snap: !g.snap })); return }
    if (toolMap[command]) cad.setActiveTool(toolMap[command])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) { executeCommand(input); setInput('') }
  }

  const labels: Record<string, string> = {
    select: 'Velja', pan: 'Hliðra', line: 'Lína', rect: 'Rétthyrningur',
    circle: 'Hringur', arc: 'Bogi', polyline: 'Marglína', text: 'Texti',
    dimension: 'Mál', measure: 'Mæla',
  }

  return (
    <div className="flex items-center gap-3 px-3 py-1 bg-gray-800 text-white text-xs font-mono border-t border-gray-700">
      <span className="text-yellow-400 font-bold">{labels[cad.activeTool] || cad.activeTool}</span>
      <form onSubmit={handleSubmit} className="flex-1">
        <div className="flex items-center gap-1">
          <span className="text-gray-400">&gt;</span>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Skipun..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500" />
        </div>
      </form>
      {status && <span className="text-gray-400 truncate max-w-[300px]">{status}</span>}
      <div className="flex items-center gap-4 text-gray-300 ml-auto">
        <span>X: <strong className="text-white">{cursorPos.x.toFixed(1)}</strong></span>
        <span>Y: <strong className="text-white">{cursorPos.y.toFixed(1)}</strong></span>
      </div>
    </div>
  )
}

import { Undo2, Redo2, ZoomIn, ZoomOut, Maximize, Grid3X3, Crosshair, Download, FileImage, FileText, Upload, Copy, ClipboardPaste, RotateCw, FlipHorizontal2, FlipVertical2, Scaling } from 'lucide-react'
import type { CadStateReturn } from '@/hooks/useCadState'

interface CadToolbarProps {
  cad: CadStateReturn
  onExportSvg: () => void
  onExportDxf: () => void
  onExportPdf: () => void
  onImportDxf: () => void
  onImportPdf: () => void
}

export function CadToolbar({ cad, onExportSvg, onExportDxf, onExportPdf, onImportDxf, onImportPdf }: CadToolbarProps) {
  const zoomIn = () => cad.setViewport(v => ({ x: v.x + v.w * 0.1, y: v.y + v.h * 0.1, w: v.w * 0.8, h: v.h * 0.8 }))
  const zoomOut = () => cad.setViewport(v => ({ x: v.x - v.w * 0.125, y: v.y - v.h * 0.125, w: v.w * 1.25, h: v.h * 1.25 }))
  const zoomFit = () => cad.setViewport(v => ({ ...v, x: -100, y: -600, w: 1000, h: 700 }))
  const hasSel = cad.selectedIds.length > 0

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-[#404042] text-white border-b">
      <div className="flex items-center gap-0.5 mr-3">
        <ToolbarBtn icon={<Undo2 size={16} />} label="Afturkalla (Ctrl+Z)" onClick={cad.undo} disabled={!cad.canUndo} />
        <ToolbarBtn icon={<Redo2 size={16} />} label="Endurgera (Ctrl+Y)" onClick={cad.redo} disabled={!cad.canRedo} />
      </div>
      <div className="w-px h-5 bg-gray-500 mx-1" />
      <div className="flex items-center gap-0.5 mr-3">
        <ToolbarBtn icon={<Copy size={16} />} label="Afrita (Ctrl+C)" onClick={cad.copySelected} disabled={!hasSel} />
        <ToolbarBtn icon={<ClipboardPaste size={16} />} label="Líma (Ctrl+V)" onClick={cad.pasteClipboard} disabled={cad.clipboard.length === 0} />
      </div>
      <div className="w-px h-5 bg-gray-500 mx-1" />
      <div className="flex items-center gap-0.5 mr-3">
        <ToolbarBtn icon={<RotateCw size={16} />} label="Snúa 90° (Ctrl+R)" onClick={() => cad.rotateSelected(90)} disabled={!hasSel} />
        <ToolbarBtn icon={<Scaling size={16} />} label="Stækka 1.5x" onClick={() => cad.scaleSelected(1.5)} disabled={!hasSel} />
        <ToolbarBtn icon={<FlipHorizontal2 size={16} />} label="Speglun X" onClick={() => cad.mirrorSelected('y')} disabled={!hasSel} />
        <ToolbarBtn icon={<FlipVertical2 size={16} />} label="Speglun Y" onClick={() => cad.mirrorSelected('x')} disabled={!hasSel} />
      </div>
      <div className="w-px h-5 bg-gray-500 mx-1" />
      <div className="flex items-center gap-0.5 mr-3">
        <ToolbarBtn icon={<ZoomIn size={16} />} label="Zoom inn" onClick={zoomIn} />
        <ToolbarBtn icon={<ZoomOut size={16} />} label="Zoom út" onClick={zoomOut} />
        <ToolbarBtn icon={<Maximize size={16} />} label="Passa í glugga" onClick={zoomFit} />
      </div>
      <div className="w-px h-5 bg-gray-500 mx-1" />
      <div className="flex items-center gap-0.5 mr-3">
        <ToolbarToggle icon={<Grid3X3 size={16} />} label="Hnit (G)" active={cad.grid.enabled} onClick={() => cad.setGrid(g => ({ ...g, enabled: !g.enabled }))} />
        <ToolbarToggle icon={<Crosshair size={16} />} label="Snap" active={cad.grid.snap} onClick={() => cad.setGrid(g => ({ ...g, snap: !g.snap }))} />
        <select value={cad.grid.size} onChange={e => cad.setGrid(g => ({ ...g, size: Number(e.target.value) }))}
          className="bg-transparent text-white text-xs border border-gray-500 rounded px-1 py-0.5 h-7"
          title="Hnitstærð">
          <option value={10} className="text-black">10</option>
          <option value={25} className="text-black">25</option>
          <option value={50} className="text-black">50</option>
          <option value={100} className="text-black">100</option>
        </select>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-0.5 mr-3">
        <ToolbarBtn icon={<Upload size={16} />} label="Flytja inn DXF" onClick={onImportDxf} />
        <ToolbarBtn icon={<Upload size={16} />} label="Flytja inn PDF" onClick={onImportPdf} />
      </div>
      <div className="w-px h-5 bg-gray-500 mx-1" />
      <div className="flex items-center gap-0.5">
        <ToolbarBtn icon={<FileImage size={16} />} label="Flytja út SVG" onClick={onExportSvg} />
        <ToolbarBtn icon={<FileText size={16} />} label="Flytja út DXF" onClick={onExportDxf} />
        <ToolbarBtn icon={<Download size={16} />} label="Flytja út PDF" onClick={onExportPdf} />
      </div>
    </div>
  )
}

function ToolbarBtn({ icon, label, onClick, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} title={label}
      className={`p-1.5 rounded hover:bg-white/20 transition-colors ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}>
      {icon}
    </button>
  )
}

function ToolbarToggle({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} title={label}
      className={`p-1.5 rounded transition-colors ${active ? 'bg-[#f5c800] text-[#404042]' : 'hover:bg-white/20'}`}>
      {icon}
    </button>
  )
}

import { Eye, EyeOff, Lock, Unlock, Plus, Trash2, Pencil } from 'lucide-react'
import type { CadStateReturn } from '@/hooks/useCadState'
import { useState } from 'react'
import { DEFAULT_LAYERS } from '@/types/cad'

const defaultLayerIds = DEFAULT_LAYERS.map(l => l.id)

export function LayerPanel({ cad }: { cad: CadStateReturn }) {
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#ff6600')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleAdd = () => {
    if (newName.trim()) {
      cad.addLayer(newName.trim(), newColor)
      setNewName('')
      setShowAdd(false)
    }
  }

  const startRename = (layerId: string, currentName: string) => {
    setEditingId(layerId)
    setEditName(currentName)
  }

  const commitRename = () => {
    if (editingId && editName.trim()) {
      cad.renameLayer(editingId, editName.trim())
    }
    setEditingId(null)
  }

  return (
    <div className="border-t">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50">
        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Lög</h3>
        <button onClick={() => setShowAdd(!showAdd)} className="text-gray-500 hover:text-gray-700">
          <Plus size={14} />
        </button>
      </div>

      {showAdd && (
        <div className="px-3 py-2 bg-yellow-50 border-b space-y-2">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Heiti lags..."
            className="w-full text-xs px-2 py-1 border rounded" onKeyDown={e => e.key === 'Enter' && handleAdd()} />
          <div className="flex gap-2 items-center">
            <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="w-8 h-6" />
            <button onClick={handleAdd} className="text-xs px-2 py-0.5 bg-brand-dark text-white rounded">Bæta við</button>
          </div>
        </div>
      )}

      <div className="divide-y">
        {cad.layers.map(layer => {
          const isDefault = defaultLayerIds.includes(layer.id)
          const isEditing = editingId === layer.id

          return (
            <div
              key={layer.id}
              onClick={() => cad.setActiveLayerId(layer.id)}
              className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs ${
                cad.activeLayerId === layer.id ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: layer.color }} />

              {isEditing ? (
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditingId(null) }}
                  className="flex-1 text-xs px-1 py-0 border rounded"
                  autoFocus
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <span
                  className="flex-1 truncate"
                  onDoubleClick={e => { e.stopPropagation(); startRename(layer.id, layer.name) }}
                >
                  {layer.name}
                </span>
              )}

              {!isDefault && !isEditing && (
                <button onClick={e => { e.stopPropagation(); startRename(layer.id, layer.name) }}
                  className="text-gray-400 hover:text-blue-500" title="Endurnefna">
                  <Pencil size={11} />
                </button>
              )}

              <button onClick={e => { e.stopPropagation(); cad.toggleLayerVisibility(layer.id) }}
                className="text-gray-400 hover:text-gray-600">
                {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
              </button>
              <button onClick={e => { e.stopPropagation(); cad.toggleLayerLock(layer.id) }}
                className="text-gray-400 hover:text-gray-600">
                {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
              </button>

              {!isDefault && (
                <button onClick={e => { e.stopPropagation(); cad.deleteLayer(layer.id) }}
                  className="text-gray-400 hover:text-red-500" title="Eyða lagi">
                  <Trash2 size={11} />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

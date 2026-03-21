import { useState, useCallback } from 'react'
import type { CadObject, CadLayer, CadToolType, GridSettings, Viewport, CadGeometry } from '@/types/cad'
import { DEFAULT_LAYERS, cadId, defaultStyle, moveGeometry } from '@/types/cad'

const MAX_HISTORY = 50

export function useCadState() {
  const [objects, setObjectsRaw] = useState<CadObject[]>([])
  const [layers, setLayers] = useState<CadLayer[]>(DEFAULT_LAYERS)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [activeTool, setActiveTool] = useState<CadToolType>('select')
  const [activeLayerId, setActiveLayerId] = useState('annotation')
  const [grid, setGrid] = useState<GridSettings>({ enabled: true, size: 50, snap: true })
  const [viewport, setViewport] = useState<Viewport>({ x: -100, y: -600, w: 1000, h: 700 })

  // Undo / redo stacks
  const [past, setPast] = useState<CadObject[][]>([])
  const [future, setFuture] = useState<CadObject[][]>([])

  const setObjects = useCallback((updater: CadObject[] | ((prev: CadObject[]) => CadObject[])) => {
    setObjectsRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      setPast(p => [...p.slice(-MAX_HISTORY), prev])
      setFuture([])
      return next
    })
  }, [])

  const undo = useCallback(() => {
    setPast(p => {
      if (p.length === 0) return p
      const prev = p[p.length - 1]
      setObjectsRaw(curr => { setFuture(f => [curr, ...f]); return prev })
      return p.slice(0, -1)
    })
  }, [])

  const redo = useCallback(() => {
    setFuture(f => {
      if (f.length === 0) return f
      const next = f[0]
      setObjectsRaw(curr => { setPast(p => [...p, curr]); return next })
      return f.slice(1)
    })
  }, [])

  const canUndo = past.length > 0
  const canRedo = future.length > 0
  const activeLayer = layers.find(l => l.id === activeLayerId) || layers[1]

  const addObject = useCallback((geometry: CadGeometry) => {
    const layer = layers.find(l => l.id === activeLayerId) || layers[1]
    const obj: CadObject = {
      id: cadId(), layerId: activeLayerId, style: defaultStyle(layer), locked: false, geometry,
    }
    setObjects(prev => [...prev, obj])
    return obj.id
  }, [activeLayerId, layers, setObjects])

  const deleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return
    setObjects(prev => prev.filter(o => !selectedIds.includes(o.id)))
    setSelectedIds([])
  }, [selectedIds, setObjects])

  const moveSelected = useCallback((dx: number, dy: number) => {
    if (selectedIds.length === 0) return
    setObjects(prev => prev.map(obj =>
      selectedIds.includes(obj.id) ? { ...obj, geometry: moveGeometry(obj.geometry, dx, dy) } : obj
    ))
  }, [selectedIds, setObjects])

  const toggleLayerVisibility = useCallback((layerId: string) => {
    setLayers(prev => prev.map(l => l.id === layerId ? { ...l, visible: !l.visible } : l))
  }, [])

  const toggleLayerLock = useCallback((layerId: string) => {
    setLayers(prev => prev.map(l => l.id === layerId ? { ...l, locked: !l.locked } : l))
  }, [])

  const addLayer = useCallback((name: string, color: string) => {
    const id = cadId()
    setLayers(prev => [...prev, { id, name, color, visible: true, locked: false, lineWidth: 1 }])
    return id
  }, [])

  const updateObjectStyle = useCallback((objectId: string, style: Partial<CadObject['style']>) => {
    setObjects(prev => prev.map(obj =>
      obj.id === objectId ? { ...obj, style: { ...obj.style, ...style } } : obj
    ))
  }, [setObjects])

  const updateObjectLayer = useCallback((objectId: string, layerId: string) => {
    const layer = layers.find(l => l.id === layerId)
    if (!layer) return
    setObjects(prev => prev.map(obj =>
      obj.id === objectId ? { ...obj, layerId, style: { ...obj.style, stroke: layer.color, strokeWidth: layer.lineWidth } } : obj
    ))
  }, [layers, setObjects])

  return {
    objects, setObjects,
    layers, setLayers,
    selectedIds, setSelectedIds,
    activeTool, setActiveTool,
    activeLayerId, setActiveLayerId,
    activeLayer,
    grid, setGrid,
    viewport, setViewport,
    addObject, deleteSelected, moveSelected,
    undo, redo, canUndo, canRedo,
    toggleLayerVisibility, toggleLayerLock, addLayer,
    updateObjectStyle, updateObjectLayer,
  }
}

export type CadStateReturn = ReturnType<typeof useCadState>

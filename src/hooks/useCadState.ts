import { useState, useCallback } from 'react'
import type { CadObject, CadLayer, CadToolType, GridSettings, Viewport, CadGeometry } from '@/types/cad'
import { DEFAULT_LAYERS, cadId, defaultStyle, moveGeometry, rotateGeometry, scaleGeometry, mirrorGeometry, offsetGeometry, getBoundingBox } from '@/types/cad'

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

  // ── Clipboard ──
  const [clipboard, setClipboard] = useState<CadObject[]>([])

  const copySelected = useCallback(() => {
    const sel = objects.filter(o => selectedIds.includes(o.id))
    setClipboard(sel)
  }, [objects, selectedIds])

  const pasteClipboard = useCallback(() => {
    if (clipboard.length === 0) return
    const newObjs = clipboard.map(obj => ({
      ...obj,
      id: cadId(),
      geometry: moveGeometry(obj.geometry, 20, 20),
    }))
    setObjects(prev => [...prev, ...newObjs])
    setSelectedIds(newObjs.map(o => o.id))
  }, [clipboard, setObjects])

  const duplicateSelected = useCallback(() => {
    const sel = objects.filter(o => selectedIds.includes(o.id))
    if (sel.length === 0) return
    const newObjs = sel.map(obj => ({
      ...obj,
      id: cadId(),
      geometry: moveGeometry(obj.geometry, 20, 20),
    }))
    setObjects(prev => [...prev, ...newObjs])
    setSelectedIds(newObjs.map(o => o.id))
  }, [objects, selectedIds, setObjects])

  // ── Transforms ──

  const rotateSelected = useCallback((angleDeg: number) => {
    if (selectedIds.length === 0) return
    const sel = objects.filter(o => selectedIds.includes(o.id))
    // Rotate around centroid of all selected
    let cx = 0, cy = 0
    for (const obj of sel) {
      const bb = getBoundingBox(obj)
      cx += (bb.minX + bb.maxX) / 2; cy += (bb.minY + bb.maxY) / 2
    }
    cx /= sel.length; cy /= sel.length
    const pivot = { x: cx, y: cy }
    setObjects(prev => prev.map(obj =>
      selectedIds.includes(obj.id) ? { ...obj, geometry: rotateGeometry(obj.geometry, pivot, angleDeg) } : obj
    ))
  }, [selectedIds, objects, setObjects])

  const scaleSelected = useCallback((factor: number) => {
    if (selectedIds.length === 0) return
    const sel = objects.filter(o => selectedIds.includes(o.id))
    let cx = 0, cy = 0
    for (const obj of sel) {
      const bb = getBoundingBox(obj)
      cx += (bb.minX + bb.maxX) / 2; cy += (bb.minY + bb.maxY) / 2
    }
    cx /= sel.length; cy /= sel.length
    const pivot = { x: cx, y: cy }
    setObjects(prev => prev.map(obj =>
      selectedIds.includes(obj.id) ? { ...obj, geometry: scaleGeometry(obj.geometry, pivot, factor) } : obj
    ))
  }, [selectedIds, objects, setObjects])

  const mirrorSelected = useCallback((axis: 'x' | 'y') => {
    if (selectedIds.length === 0) return
    const sel = objects.filter(o => selectedIds.includes(o.id))
    let cx = 0, cy = 0
    for (const obj of sel) {
      const bb = getBoundingBox(obj)
      cx += (bb.minX + bb.maxX) / 2; cy += (bb.minY + bb.maxY) / 2
    }
    cx /= sel.length; cy /= sel.length
    const pivot = { x: cx, y: cy }
    setObjects(prev => prev.map(obj =>
      selectedIds.includes(obj.id) ? { ...obj, geometry: mirrorGeometry(obj.geometry, axis, pivot) } : obj
    ))
  }, [selectedIds, objects, setObjects])

  const offsetSelected = useCallback((distance: number) => {
    if (selectedIds.length === 0) return
    const sel = objects.filter(o => selectedIds.includes(o.id))
    const newObjs: CadObject[] = []
    for (const obj of sel) {
      const newGeo = offsetGeometry(obj.geometry, distance)
      if (newGeo) {
        newObjs.push({ ...obj, id: cadId(), geometry: newGeo })
      }
    }
    if (newObjs.length > 0) {
      setObjects(prev => [...prev, ...newObjs])
      setSelectedIds(newObjs.map(o => o.id))
    }
  }, [selectedIds, objects, setObjects])

  const selectAll = useCallback(() => {
    setSelectedIds(objects.filter(o => {
      const l = layers.find(la => la.id === o.layerId)
      return l?.visible && !l?.locked
    }).map(o => o.id))
  }, [objects, layers])

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

  const renameLayer = useCallback((layerId: string, name: string) => {
    setLayers(prev => prev.map(l => l.id === layerId ? { ...l, name } : l))
  }, [])

  const deleteLayer = useCallback((layerId: string) => {
    // Don't delete default layers
    if (['pdf-background', 'equipment', 'annotation', 'dimension', 'construction', 'custom'].includes(layerId)) return
    // Move objects from deleted layer to 'annotation'
    setObjects(prev => prev.map(obj => obj.layerId === layerId ? { ...obj, layerId: 'annotation' } : obj))
    setLayers(prev => prev.filter(l => l.id !== layerId))
    if (activeLayerId === layerId) setActiveLayerId('annotation')
  }, [activeLayerId, setObjects])

  const updateObjectGeometry = useCallback((objectId: string, geometry: CadGeometry) => {
    setObjects(prev => prev.map(obj =>
      obj.id === objectId ? { ...obj, geometry } : obj
    ))
  }, [setObjects])

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

  /** Bulk import objects + merge any new layers */
  const importObjects = useCallback((newObjects: CadObject[], newLayers: CadLayer[]) => {
    // Merge layers that don't already exist
    setLayers(prev => {
      const existingIds = new Set(prev.map(l => l.id))
      const toAdd = newLayers.filter(l => !existingIds.has(l.id))
      return toAdd.length > 0 ? [...prev, ...toAdd] : prev
    })
    setObjects(prev => [...prev, ...newObjects])
  }, [setObjects])

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
    copySelected, pasteClipboard, duplicateSelected,
    rotateSelected, scaleSelected, mirrorSelected, offsetSelected, selectAll,
    clipboard,
    undo, redo, canUndo, canRedo,
    toggleLayerVisibility, toggleLayerLock, addLayer, renameLayer, deleteLayer,
    updateObjectGeometry, updateObjectStyle, updateObjectLayer,
    importObjects,
  }
}

export type CadStateReturn = ReturnType<typeof useCadState>

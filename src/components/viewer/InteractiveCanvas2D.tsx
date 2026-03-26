/**
 * Interactive 2D canvas using React-Konva.
 * Renders equipment objects that can be dragged, selected, placed, and deleted.
 * Supports grid snap, zoom/pan, and keyboard shortcuts.
 */
import { useRef, useEffect, useCallback } from 'react'
import { Stage, Layer, Rect, Line, Group, Text, Circle } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type Konva from 'konva'
import { GRID, BRAND, CANVAS } from '@/lib/geometry-config'
import type { Canvas2DState, CanvasObject } from '@/hooks/useCanvas2D'

// Convert meters to canvas pixels
const SCALE = 80 // 1 meter = 80 pixels on canvas

interface InteractiveCanvas2DProps {
  canvas: Canvas2DState
  width: number
  height: number
  placementType?: CanvasObject['type']
  placementDefaults?: Partial<CanvasObject>
}

/** Renders a grid background */
function GridLayer({ width, height, zoom }: { width: number; height: number; zoom: number }) {
  const lines: React.JSX.Element[] = []
  const gridPx = GRID.snapIncrement * SCALE // grid cell in pixels
  const majorPx = gridPx * 10 // major grid every 1m

  // Only render visible grid lines based on zoom
  const step = zoom < 0.4 ? majorPx : gridPx
  const color = zoom < 0.4 ? CANVAS.gridMajorColor : CANVAS.gridColor
  const extent = Math.max(width, height) * 2

  for (let i = -extent; i <= extent; i += step) {
    lines.push(
      <Line key={`h${i}`} points={[-extent, i, extent, i]} stroke={color} strokeWidth={0.5 / zoom} listening={false} />,
      <Line key={`v${i}`} points={[i, -extent, i, extent]} stroke={color} strokeWidth={0.5 / zoom} listening={false} />,
    )
  }

  // Major grid lines (every meter)
  if (zoom >= 0.4) {
    for (let i = -extent; i <= extent; i += majorPx) {
      lines.push(
        <Line key={`mh${i}`} points={[-extent, i, extent, i]} stroke={CANVAS.gridMajorColor} strokeWidth={1 / zoom} listening={false} />,
        <Line key={`mv${i}`} points={[i, -extent, i, extent]} stroke={CANVAS.gridMajorColor} strokeWidth={1 / zoom} listening={false} />,
      )
    }
  }

  // Origin crosshair
  lines.push(
    <Line key="ox" points={[-20, 0, 20, 0]} stroke={BRAND.dark} strokeWidth={1.5 / zoom} listening={false} />,
    <Line key="oy" points={[0, -20, 0, 20]} stroke={BRAND.dark} strokeWidth={1.5 / zoom} listening={false} />,
  )

  return <>{lines}</>
}

/** Renders a single canvas object */
function CanvasItem({
  obj,
  isSelected,
  zoom,
  onSelect,
  onDragEnd,
}: {
  obj: CanvasObject
  isSelected: boolean
  zoom: number
  onSelect: (id: string) => void
  onDragEnd: (id: string, x: number, y: number) => void
}) {
  const px = obj.x * SCALE
  const py = obj.y * SCALE
  const pw = obj.width * SCALE
  const ph = obj.height * SCALE

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    const node = e.target
    onDragEnd(obj.id, node.x() / SCALE, node.y() / SCALE)
  }

  const fillColor = obj.color || '#888'
  const strokeColor = isSelected ? CANVAS.selectionColor : '#555'
  const strokeW = isSelected ? 2.5 / zoom : 1 / zoom
  const labelSize = Math.max(10 / zoom, 8)

  return (
    <Group
      x={px}
      y={py}
      rotation={obj.rotation}
      draggable={!obj.locked}
      onClick={() => onSelect(obj.id)}
      onTap={() => onSelect(obj.id)}
      onDragEnd={handleDragEnd}
    >
      <Rect
        width={pw}
        height={ph}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeW}
        cornerRadius={2}
        opacity={0.85}
      />
      {/* Label */}
      <Text
        text={obj.label}
        x={2}
        y={2}
        fontSize={labelSize}
        fill={BRAND.dark}
        width={pw - 4}
        ellipsis
      />
      {/* Selection handles (corners) */}
      {isSelected && (
        <>
          <Circle x={0} y={0} radius={CANVAS.handleSize / zoom} fill={CANVAS.selectionColor} />
          <Circle x={pw} y={0} radius={CANVAS.handleSize / zoom} fill={CANVAS.selectionColor} />
          <Circle x={0} y={ph} radius={CANVAS.handleSize / zoom} fill={CANVAS.selectionColor} />
          <Circle x={pw} y={ph} radius={CANVAS.handleSize / zoom} fill={CANVAS.selectionColor} />
        </>
      )}
      {/* Dimension label below */}
      {isSelected && (
        <Text
          text={`${obj.width.toFixed(1)}×${obj.height.toFixed(1)} m`}
          x={0}
          y={ph + 4}
          fontSize={labelSize * 0.85}
          fill={BRAND.dark}
        />
      )}
    </Group>
  )
}

export function InteractiveCanvas2D({ canvas, width, height, placementType, placementDefaults }: InteractiveCanvas2DProps) {
  const stageRef = useRef<Konva.Stage>(null)

  // Handle click to place new objects
  const handleStageClick = useCallback((e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (canvas.tool !== 'place' || !placementType) return

    // Only trigger on empty space clicks (not on existing objects)
    if (e.target !== e.currentTarget && e.target.parent?.parent !== null) {
      // Check if clicking on background
      const clickedOnEmpty = e.target.getClassName() === 'Stage' ||
                             (e.target.getClassName() === 'Rect' && !e.target.draggable()) ||
                             e.target.getClassName() === 'Line'
      if (!clickedOnEmpty) return
    }

    const stage = stageRef.current
    if (!stage) return

    const pointerPos = stage.getPointerPosition()
    if (!pointerPos) return

    // Convert screen coordinates to canvas coordinates
    const transform = stage.getAbsoluteTransform().copy().invert()
    const pos = transform.point(pointerPos)

    const x = canvas.snapToGrid(pos.x / SCALE)
    const y = canvas.snapToGrid(pos.y / SCALE)

    canvas.addObject({
      type: placementType,
      label: placementDefaults?.label || placementType,
      x,
      y,
      width: placementDefaults?.width || 0.3,
      height: placementDefaults?.height || 0.3,
      rotation: 0,
      color: placementDefaults?.color || '#888',
      ...placementDefaults,
    })
  }, [canvas, placementType, placementDefaults])

  // Deselect on empty space click
  const handleStageClickSelect = useCallback((e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (canvas.tool === 'place') {
      handleStageClick(e)
      return
    }
    // If clicked on stage background, deselect
    if (e.target === stageRef.current || e.target.getClassName() === 'Line') {
      canvas.selectObject(null)
    }
  }, [canvas, handleStageClick])

  // Zoom with mouse wheel
  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const stage = stageRef.current
    if (!stage) return

    const scaleBy = 1.08
    const oldScale = stage.scaleX()
    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const newScale = e.evt.deltaY > 0
      ? Math.max(CANVAS.minZoom, oldScale / scaleBy)
      : Math.min(CANVAS.maxZoom, oldScale * scaleBy)

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    }

    canvas.setZoom(newScale)
    canvas.setPan(
      pointer.x - mousePointTo.x * newScale,
      pointer.y - mousePointTo.y * newScale,
    )
  }, [canvas])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (canvas.selectedId) canvas.removeObject(canvas.selectedId)
      }
      if (e.key === 'Escape') {
        canvas.selectObject(null)
        canvas.setTool('select')
      }
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); canvas.undo() }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); canvas.redo() }
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault()
        if (canvas.selectedId) canvas.duplicateObject(canvas.selectedId)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [canvas])

  const handleDragEnd = useCallback((id: string, x: number, y: number) => {
    canvas.moveObject(id, x, y)
  }, [canvas])

  const handleSelect = useCallback((id: string) => {
    canvas.selectObject(id)
  }, [canvas])

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      scaleX={canvas.zoom}
      scaleY={canvas.zoom}
      x={canvas.panX}
      y={canvas.panY}
      draggable={canvas.tool === 'pan' || canvas.tool === 'select'}
      onClick={handleStageClickSelect}
      onTap={handleStageClickSelect}
      onWheel={handleWheel}
      onDragEnd={(e) => {
        if (e.target === stageRef.current) {
          canvas.setPan(e.target.x(), e.target.y())
        }
      }}
      style={{ cursor: canvas.tool === 'place' ? 'crosshair' : canvas.tool === 'pan' ? 'grab' : 'default' }}
    >
      <Layer>
        <GridLayer width={width} height={height} zoom={canvas.zoom} />
      </Layer>
      <Layer>
        {canvas.objects.map(obj => (
          <CanvasItem
            key={obj.id}
            obj={obj}
            isSelected={obj.id === canvas.selectedId}
            zoom={canvas.zoom}
            onSelect={handleSelect}
            onDragEnd={handleDragEnd}
          />
        ))}
      </Layer>
    </Stage>
  )
}

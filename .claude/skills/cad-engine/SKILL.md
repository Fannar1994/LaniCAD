---
name: cad-engine
description: 2D drawing (Maker.js + SVG) and 3D visualization (Three.js + React Three Fiber) patterns for LániCAD construction equipment rendering.
argument-hint: Which engine? (2d | 3d | maker | threejs | svg)
---

# CAD Engine Skill

## Overview

LániCAD uses two rendering engines:
- **2D**: Maker.js (Microsoft, MIT) for vector SVG drawings of equipment layouts
- **3D**: Three.js + React Three Fiber + @react-three/drei for interactive 3D visualization

## 2D Engine — Maker.js

### Library Info
- Package: `makerjs` (v0.18.1)
- Types: `@types/makerjs` (v0.17.3)
- License: MIT (Microsoft)
- Docs: https://maker.js.org/

### Basic Pattern
```ts
import makerjs from 'makerjs'

// Create a model (e.g., mobile fence panel layout)
const model: makerjs.IModel = {
  paths: {
    line1: new makerjs.paths.Line([0, 0], [350, 0]),
    line2: new makerjs.paths.Line([350, 0], [350, 200]),
  },
  models: {
    // Nested sub-models
  }
}

// Export to SVG
const svg = makerjs.exporter.toSVG(model, {
  stroke: '#404042',
  strokeWidth: '1',
  fill: 'none',
  units: makerjs.unitType.Centimeter,
})
```

### Mobile Fence Layout Use Case
```ts
function createFenceLayout(panels: number, panelWidth: number, height: number) {
  const model: makerjs.IModel = { models: {} }
  for (let i = 0; i < panels; i++) {
    model.models[`panel_${i}`] = {
      paths: {
        bottom: new makerjs.paths.Line([i * panelWidth, 0], [(i + 1) * panelWidth, 0]),
        top: new makerjs.paths.Line([i * panelWidth, height], [(i + 1) * panelWidth, height]),
        left: new makerjs.paths.Line([i * panelWidth, 0], [i * panelWidth, height]),
        right: new makerjs.paths.Line([(i + 1) * panelWidth, 0], [(i + 1) * panelWidth, height]),
      }
    }
  }
  return model
}
```

### SVG Rendering in React
```tsx
function Drawing2D({ svgContent }: { svgContent: string }) {
  return (
    <div
      className="border rounded bg-white p-4 overflow-auto"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  )
}
```

## 3D Engine — Three.js + React Three Fiber

### Libraries
- `three` (v0.172.0) — 3D rendering engine
- `@react-three/fiber` (v9.0.0) — React wrapper for Three.js
- `@react-three/drei` (v10.0.0) — Helpers (OrbitControls, Grid, Text, etc.)

### Basic 3D Scene Pattern
```tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Environment } from '@react-three/drei'

function Viewer3D() {
  return (
    <div className="h-[500px] border rounded bg-gray-50">
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <OrbitControls />
        <Grid infiniteGrid fadeDistance={50} />
        {/* Scene content */}
      </Canvas>
    </div>
  )
}
```

### Scaffolding 3D Model Pattern
```tsx
function ScaffoldFrame({ x, y, z, width, height }: FrameProps) {
  return (
    <group position={[x, y, z]}>
      {/* Vertical standards */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.024, 0.024, height, 8]} />
        <meshStandardMaterial color="#888" metalness={0.8} />
      </mesh>
      {/* Horizontal ledgers */}
      <mesh position={[width / 2, height, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.024, 0.024, width, 8]} />
        <meshStandardMaterial color="#888" metalness={0.8} />
      </mesh>
      {/* Platforms (yellow) */}
      <mesh position={[width / 2, height, 0]}>
        <boxGeometry args={[width, 0.04, 0.3]} />
        <meshStandardMaterial color="#f5c800" />
      </mesh>
    </group>
  )
}
```

## Viewer Component Structure

```
src/components/viewer/
├── Viewer2D.tsx    — SVG/Canvas 2D plan view (Maker.js output)
├── Viewer3D.tsx    — Three.js interactive 3D view
├── ViewerPanel.tsx — Tabbed container (2D | 3D toggle)
└── models/         — 3D model builders per equipment type
    ├── MobileFenceModel.tsx
    ├── ScaffoldModel.tsx
    ├── FormworkModel.tsx
    └── MobileScaffoldModel.tsx
```

## Key Dimensions (Real World → 3D Scale)

| Equipment | Real Size | 3D Scale |
|---|---|---|
| Mobile fence panel 3.5m | 350cm × 200cm | 3.5 × 2.0 units |
| Scaffold frame | 73cm × variable height | 0.73 × H units |
| Scaffold board | 180cm × 30cm | 1.8 × 0.3 units |
| Layher tube Ø48mm | 4.8cm diameter | 0.048 units |
| Ceiling prop | variable height, Ø60mm | H × 0.06 units |

## DXF/DWG Import (Planned)

- Future: Parse DXF files to extract room layouts
- Library candidates: `dxf-parser` (MIT), `three-dxf` (MIT)
- Use case: Import architect floor plans, overlay equipment placement

import { useRef, type ReactNode } from 'react'
import * as THREE from 'three'

interface FormworkModel3DProps {
  wallLength: number  // meters
  wallHeight: number  // meters
  system: 'Rasto' | 'Takko' | 'Manto'
}

const PANEL_THICKNESS = 0.12
const WALL_THICKNESS = 0.20  // concrete wall gap between panel faces
const PROP_COLOR = '#666'
const TIE_COLOR = '#333'

function Tube({ start, end, radius = 0.015, color = PROP_COLOR }: {
  start: [number, number, number]
  end: [number, number, number]
  radius?: number
  color?: string
}) {
  const dir = new THREE.Vector3(end[0] - start[0], end[1] - start[1], end[2] - start[2])
  const length = dir.length()
  if (length < 0.001) return null
  dir.normalize()
  const mid: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2,
  ]
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)

  return (
    <mesh position={mid} quaternion={quat}>
      <cylinderGeometry args={[radius, radius, length, 8]} />
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
    </mesh>
  )
}

/** Pack available panel widths (greedy largest-first) */
function packPanels(wallLength: number, system: string): number[] {
  const available = system === 'Manto'
    ? [240, 120, 90, 60, 50, 30]
    : [240, 120, 90, 60, 45, 30]

  const widths: number[] = []
  let remaining = wallLength * 100
  while (remaining > 0.5) {
    const pw = available.find(p => p <= remaining + 1) || available[available.length - 1]
    widths.push(pw)
    remaining -= pw
  }
  return widths
}

/** One side of formwork panels */
function PanelSide({ offsetX, panelWidths, wallHeight, panelColor, zCenter }: {
  offsetX: number
  panelWidths: number[]
  wallHeight: number
  panelColor: string
  zCenter: number
}) {
  const elements: ReactNode[] = []
  let x = offsetX
  panelWidths.forEach((pw, i) => {
    const panelW = pw / 100
    // Panel body
    elements.push(
      <mesh key={`p_${i}`} position={[x + panelW / 2, wallHeight / 2, zCenter]}>
        <boxGeometry args={[panelW - 0.008, wallHeight - 0.01, PANEL_THICKNESS]} />
        <meshStandardMaterial color={panelColor} roughness={0.7} />
      </mesh>
    )
    // Steel edge frame (vertical seam)
    elements.push(
      <mesh key={`pe_${i}`} position={[x, wallHeight / 2, zCenter]}>
        <boxGeometry args={[0.008, wallHeight, PANEL_THICKNESS + 0.01]} />
        <meshStandardMaterial color="#444" metalness={0.6} />
      </mesh>
    )
    // Horizontal stiffener ribs (2 per panel)
    for (const ry of [wallHeight * 0.33, wallHeight * 0.67]) {
      const ribZ = zCenter + (zCenter > 0 ? PANEL_THICKNESS / 2 + 0.015 : -PANEL_THICKNESS / 2 - 0.015)
      elements.push(
        <mesh key={`rib_${i}_${ry.toFixed(1)}`} position={[x + panelW / 2, ry, ribZ]}>
          <boxGeometry args={[panelW - 0.02, 0.05, 0.03]} />
          <meshStandardMaterial color="#555" metalness={0.5} />
        </mesh>
      )
    }
    x += panelW
  })
  // Last edge
  elements.push(
    <mesh key="pe_last" position={[x, wallHeight / 2, zCenter]}>
      <boxGeometry args={[0.008, wallHeight, PANEL_THICKNESS + 0.01]} />
      <meshStandardMaterial color="#444" metalness={0.6} />
    </mesh>
  )
  return <>{elements}</>
}

/** Push-pull prop (strut from panel face to ground) */
function PushPullProp({ x, wallHeight, zPanel, direction }: {
  x: number; wallHeight: number; zPanel: number; direction: 1 | -1
}) {
  const attachY = wallHeight * 0.65
  const footDist = wallHeight * 0.5
  const footZ = zPanel + direction * footDist
  const outerFace = zPanel + direction * (PANEL_THICKNESS / 2 + 0.02)

  return (
    <group>
      {/* Main prop tube */}
      <Tube start={[x, attachY, outerFace]} end={[x, 0.02, footZ]} radius={0.025} color={PROP_COLOR} />
      {/* Turnbuckle adjustment (mid-section thickening) */}
      <Tube
        start={[x, attachY * 0.55, (outerFace + footZ) / 2]}
        end={[x, attachY * 0.45, (outerFace + footZ) / 2 - direction * 0.05]}
        radius={0.03}
        color="#777"
      />
      {/* Wall attachment bracket */}
      <mesh position={[x, attachY, outerFace]}>
        <boxGeometry args={[0.08, 0.12, 0.04]} />
        <meshStandardMaterial color="#555" metalness={0.5} />
      </mesh>
      {/* Ground foot plate */}
      <mesh position={[x, 0.01, footZ]}>
        <boxGeometry args={[0.2, 0.02, 0.2]} />
        <meshStandardMaterial color="#555" metalness={0.4} />
      </mesh>
      {/* Ground anchor bolt */}
      <Tube start={[x, 0.02, footZ]} end={[x, -0.05, footZ]} radius={0.008} color="#333" />
    </group>
  )
}

export function FormworkModel3D({ wallLength, wallHeight, system }: FormworkModel3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const offsetX = -wallLength / 2
  const panelColor = system === 'Manto' ? '#4a6fa5' : '#c06030'
  const panelWidths = packPanels(wallLength, system)

  // Panel centers (z positions): front side negative Z, back side positive Z
  const halfGap = WALL_THICKNESS / 2 + PANEL_THICKNESS / 2
  const frontZ = -halfGap
  const backZ = halfGap

  // Tie rod spacing based on system
  const tieHSpacing = system === 'Manto' ? 0.50 : 0.60  // horizontal
  const tieVSpacing = system === 'Manto' ? 0.50 : 0.60  // vertical
  const propSpacing = 1.2

  return (
    <group ref={groupRef}>
      {/* ═══ FRONT PANEL SIDE (negative Z) ═══ */}
      <PanelSide
        offsetX={offsetX}
        panelWidths={panelWidths}
        wallHeight={wallHeight}
        panelColor={panelColor}
        zCenter={frontZ}
      />

      {/* ═══ BACK PANEL SIDE (positive Z) ═══ */}
      <PanelSide
        offsetX={offsetX}
        panelWidths={panelWidths}
        wallHeight={wallHeight}
        panelColor={panelColor}
        zCenter={backZ}
      />

      {/* ═══ TIE RODS through the wall ═══ */}
      {Array.from({ length: Math.ceil(wallLength / tieHSpacing) }, (_, i) => {
        const tx = offsetX + tieHSpacing * 0.5 + i * tieHSpacing
        if (tx > offsetX + wallLength - 0.1) return null
        return Array.from({ length: Math.floor(wallHeight / tieVSpacing) }, (_, j) => {
          const ty = tieVSpacing * 0.5 + j * tieVSpacing
          if (ty > wallHeight - 0.15) return null
          // Full tie rod from front face to back face
          const rodHalfLen = halfGap + PANEL_THICKNESS / 2 + 0.04
          return (
            <group key={`tie_${i}_${j}`}>
              <Tube
                start={[tx, ty, -rodHalfLen]}
                end={[tx, ty, rodHalfLen]}
                radius={0.008}
                color={TIE_COLOR}
              />
              {/* Cone spacer inside wall (ensures wall thickness) */}
              <mesh position={[tx, ty, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.02, 0.015, WALL_THICKNESS, 8]} />
                <meshStandardMaterial color="#888" />
              </mesh>
              {/* Wing nut on front */}
              <mesh position={[tx, ty, -rodHalfLen]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.02, 6]} />
                <meshStandardMaterial color="#444" metalness={0.7} />
              </mesh>
              {/* Wing nut on back */}
              <mesh position={[tx, ty, rodHalfLen]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.02, 6]} />
                <meshStandardMaterial color="#444" metalness={0.7} />
              </mesh>
            </group>
          )
        })
      })}

      {/* ═══ PUSH-PULL PROPS (both sides) ═══ */}
      {Array.from({ length: Math.ceil(wallLength / propSpacing) }, (_, i) => {
        const px = offsetX + 0.6 + i * propSpacing
        if (px > offsetX + wallLength - 0.1) return null
        return (
          <group key={`props_${i}`}>
            <PushPullProp x={px} wallHeight={wallHeight} zPanel={frontZ} direction={-1} />
            <PushPullProp x={px} wallHeight={wallHeight} zPanel={backZ} direction={1} />
          </group>
        )
      })}

      {/* ═══ CONCRETE WALL preview (transparent between panels) ═══ */}
      <mesh position={[0, wallHeight / 2, 0]}>
        <boxGeometry args={[wallLength, wallHeight, WALL_THICKNESS]} />
        <meshStandardMaterial color="#bbb" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>

      {/* ═══ GROUND ═══ */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[wallLength + 6, wallHeight + 4]} />
        <meshStandardMaterial color="#e0e0e0" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

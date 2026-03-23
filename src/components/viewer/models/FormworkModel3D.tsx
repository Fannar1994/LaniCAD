import { useRef, type ReactNode } from 'react'
import * as THREE from 'three'

export type FormworkSystem3D = 'Rasto' | 'Takko' | 'Manto' | 'Alufort' | 'ID-15' | 'Robusto' | 'Column' | 'ST60'

interface FormworkModel3DProps {
  wallLength: number  // meters
  wallHeight: number  // meters
  system: FormworkSystem3D
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
  switch (system) {
    case 'ID-15':
    case 'ST60':
      return <ShoringTowerModel3D towerWidth={wallLength} towerHeight={wallHeight} system={system} />
    case 'Alufort':
      return <SlabFormworkModel3D slabWidth={wallLength} slabDepth={wallHeight} />
    case 'Column':
      return <ColumnFormworkModel3D columnSize={wallLength} columnHeight={wallHeight} />
    default:
      return <WallFormworkModel3D wallLength={wallLength} wallHeight={wallHeight} system={system} />
  }
}

/** Wall formwork (Rasto/Takko/Manto/Robusto) */
function WallFormworkModel3D({ wallLength, wallHeight, system }: { wallLength: number; wallHeight: number; system: string }) {
  const groupRef = useRef<THREE.Group>(null)
  const offsetX = -wallLength / 2
  const panelColor = system === 'Manto' ? '#4a6fa5' : system === 'Robusto' ? '#8a5a2a' : '#c06030'
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

/** ID-15 / ST60 Shoring tower 3D model */
function ShoringTowerModel3D({ towerWidth, towerHeight, system }: { towerWidth: number; towerHeight: number; system: string }) {
  const groupRef = useRef<THREE.Group>(null)
  const bayH = system === 'ST60' ? 1.5 : 2.0
  const bays = Math.max(1, Math.round(towerHeight / bayH))
  const halfW = towerWidth / 2
  const depth = towerWidth * 0.8 // tower depth
  const halfD = depth / 2
  const tubeR = system === 'ST60' ? 0.02 : 0.025
  const color = system === 'ST60' ? '#4a8a4a' : '#4a6aaa'

  return (
    <group ref={groupRef}>
      {/* 4 vertical standards (legs) */}
      {([[-halfW, -halfD], [halfW, -halfD], [halfW, halfD], [-halfW, halfD]] as [number, number][]).map(([lx, lz], i) => (
        <Tube key={`leg_${i}`} start={[lx, 0, lz]} end={[lx, towerHeight, lz]} radius={tubeR} color={color} />
      ))}

      {/* Horizontal ledgers and X-braces per bay */}
      {Array.from({ length: bays + 1 }, (_, b) => {
        const y = Math.min(b * bayH, towerHeight)
        return (
          <group key={`bay_${b}`}>
            {/* Horizontal frame at each level */}
            <Tube start={[-halfW, y, -halfD]} end={[halfW, y, -halfD]} radius={tubeR * 0.7} color={color} />
            <Tube start={[-halfW, y, halfD]} end={[halfW, y, halfD]} radius={tubeR * 0.7} color={color} />
            <Tube start={[-halfW, y, -halfD]} end={[-halfW, y, halfD]} radius={tubeR * 0.7} color={color} />
            <Tube start={[halfW, y, -halfD]} end={[halfW, y, halfD]} radius={tubeR * 0.7} color={color} />
            {/* X-braces on front and back */}
            {b < bays && (
              <>
                <Tube start={[-halfW, y, -halfD]} end={[halfW, Math.min(y + bayH, towerHeight), -halfD]} radius={0.01} color="#888" />
                <Tube start={[halfW, y, -halfD]} end={[-halfW, Math.min(y + bayH, towerHeight), -halfD]} radius={0.01} color="#888" />
                <Tube start={[-halfW, y, halfD]} end={[halfW, Math.min(y + bayH, towerHeight), halfD]} radius={0.01} color="#888" />
              </>
            )}
          </group>
        )
      })}

      {/* Base jacks */}
      {([[-halfW, -halfD], [halfW, -halfD], [halfW, halfD], [-halfW, halfD]] as [number, number][]).map(([jx, jz], i) => (
        <group key={`jack_${i}`}>
          <Tube start={[jx, -0.3, jz]} end={[jx, 0, jz]} radius={0.015} color="#666" />
          <mesh position={[jx, -0.31, jz]}>
            <boxGeometry args={[0.15, 0.02, 0.15]} />
            <meshStandardMaterial color="#555" metalness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Head forks at top */}
      {([[-halfW, -halfD], [halfW, -halfD], [halfW, halfD], [-halfW, halfD]] as [number, number][]).map(([hx, hz], i) => (
        <group key={`head_${i}`}>
          <Tube start={[hx, towerHeight, hz]} end={[hx, towerHeight + 0.15, hz]} radius={0.012} color="#666" />
          <mesh position={[hx, towerHeight + 0.16, hz]}>
            <boxGeometry args={[0.08, 0.04, 0.04]} />
            <meshStandardMaterial color="#777" metalness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.32, 0]} receiveShadow>
        <planeGeometry args={[towerWidth + 3, depth + 3]} />
        <meshStandardMaterial color="#e0e0e0" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/** Alufort slab/ceiling formwork 3D model */
function SlabFormworkModel3D({ slabWidth, slabDepth }: { slabWidth: number; slabDepth: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const halfW = slabWidth / 2
  const halfD = slabDepth / 2
  const deckH = 0.05
  const propH = 2.5 // typical prop height below slab

  return (
    <group ref={groupRef}>
      {/* Slab deck panels */}
      <mesh position={[0, propH + deckH / 2, 0]}>
        <boxGeometry args={[slabWidth, deckH, slabDepth]} />
        <meshStandardMaterial color="#7a7aaa" roughness={0.6} />
      </mesh>

      {/* Primary beams (along width) */}
      {Array.from({ length: Math.ceil(slabDepth / 1.2) + 1 }, (_, i) => {
        const bz = -halfD + i * 1.2
        if (bz > halfD) return null
        return (
          <mesh key={`pb_${i}`} position={[0, propH - 0.03, bz]}>
            <boxGeometry args={[slabWidth, 0.06, 0.08]} />
            <meshStandardMaterial color="#aa8844" roughness={0.6} />
          </mesh>
        )
      })}

      {/* Props */}
      {Array.from({ length: Math.ceil(slabWidth / 1.5) }, (_, i) => {
        const px = -halfW + 0.5 + i * 1.5
        return Array.from({ length: Math.ceil(slabDepth / 1.5) }, (_, j) => {
          const pz = -halfD + 0.5 + j * 1.5
          if (px > halfW || pz > halfD) return null
          return (
            <group key={`prop_${i}_${j}`}>
              <Tube start={[px, 0, pz]} end={[px, propH - 0.06, pz]} radius={0.025} color="#888" />
              <mesh position={[px, -0.01, pz]}>
                <cylinderGeometry args={[0.06, 0.06, 0.02, 8]} />
                <meshStandardMaterial color="#666" />
              </mesh>
            </group>
          )
        })
      })}

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[slabWidth + 3, slabDepth + 3]} />
        <meshStandardMaterial color="#e0e0e0" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/** Column formwork 3D model */
function ColumnFormworkModel3D({ columnSize, columnHeight }: { columnSize: number; columnHeight: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const half = columnSize / 2
  const panelT = 0.08

  return (
    <group ref={groupRef}>
      {/* 4 panels forming column box */}
      {/* Front */}
      <mesh position={[0, columnHeight / 2, half + panelT / 2]}>
        <boxGeometry args={[columnSize + panelT * 2, columnHeight, panelT]} />
        <meshStandardMaterial color="#c06030" roughness={0.7} />
      </mesh>
      {/* Back */}
      <mesh position={[0, columnHeight / 2, -half - panelT / 2]}>
        <boxGeometry args={[columnSize + panelT * 2, columnHeight, panelT]} />
        <meshStandardMaterial color="#c06030" roughness={0.7} />
      </mesh>
      {/* Left */}
      <mesh position={[-half - panelT / 2, columnHeight / 2, 0]}>
        <boxGeometry args={[panelT, columnHeight, columnSize]} />
        <meshStandardMaterial color="#b05525" roughness={0.7} />
      </mesh>
      {/* Right */}
      <mesh position={[half + panelT / 2, columnHeight / 2, 0]}>
        <boxGeometry args={[panelT, columnHeight, columnSize]} />
        <meshStandardMaterial color="#b05525" roughness={0.7} />
      </mesh>

      {/* Horizontal clamp bands */}
      {Array.from({ length: Math.max(2, Math.floor(columnHeight / 0.6)) }, (_, i) => {
        const cy = 0.3 + i * 0.6
        if (cy > columnHeight - 0.2) return null
        const outer = half + panelT + 0.02
        return (
          <group key={`clamp_${i}`}>
            <Tube start={[-outer, cy, -outer]} end={[outer, cy, -outer]} radius={0.012} color="#555" />
            <Tube start={[outer, cy, -outer]} end={[outer, cy, outer]} radius={0.012} color="#555" />
            <Tube start={[outer, cy, outer]} end={[-outer, cy, outer]} radius={0.012} color="#555" />
            <Tube start={[-outer, cy, outer]} end={[-outer, cy, -outer]} radius={0.012} color="#555" />
          </group>
        )
      })}

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[columnSize + 3, columnSize + 3]} />
        <meshStandardMaterial color="#e0e0e0" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

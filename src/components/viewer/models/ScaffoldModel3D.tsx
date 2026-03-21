import { useRef, type ReactNode } from 'react'
import * as THREE from 'three'

interface ScaffoldModel3DProps {
  length: number    // meters
  levels2m: number
  levels07m: number
  legType: '50cm' | '100cm'
}

const TUBE_R = 0.024
const BOARD_L = 1.8
const BOARD_W = 0.3
const BOARD_T = 0.04
const TUBE_COLOR = '#888888'
const BOARD_COLOR = '#f5c800'
const BASE_COLOR = '#555555'

function Tube({ start, end, color = TUBE_COLOR }: {
  start: [number, number, number]
  end: [number, number, number]
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
      <cylinderGeometry args={[TUBE_R, TUBE_R, length, 8]} />
      <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
    </mesh>
  )
}

function Board({ position, width = BOARD_L }: {
  position: [number, number, number]
  width?: number
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[width, BOARD_T, BOARD_W]} />
      <meshStandardMaterial color={BOARD_COLOR} roughness={0.6} />
    </mesh>
  )
}

export function ScaffoldModel3D({ length, levels2m, levels07m, legType }: ScaffoldModel3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const bays = Math.ceil(length / BOARD_L)
  const legH = legType === '50cm' ? 0.34 : 0.69
  const totalH = levels2m * 2 + levels07m * 0.7 + legH + 2.0
  const offsetX = -(bays * BOARD_L) / 2

  const uprights: ReactNode[] = []
  const ledgers: ReactNode[] = []
  const boards: ReactNode[] = []
  const braces: ReactNode[] = []

  // Generate the scaffold structure
  for (let b = 0; b <= bays; b++) {
    const x = offsetX + b * BOARD_L

    // Front and back uprights
    for (const z of [0, -BOARD_W]) {
      uprights.push(
        <Tube
          key={`up_${b}_${z}`}
          start={[x, 0, z]}
          end={[x, totalH, z]}
        />
      )
    }

    // Base plate
    uprights.push(
      <mesh key={`base_${b}`} position={[x, -0.02, -BOARD_W / 2]}>
        <boxGeometry args={[0.15, 0.04, 0.15]} />
        <meshStandardMaterial color={BASE_COLOR} metalness={0.5} />
      </mesh>
    )
  }

  // Levels
  let y = legH
  const addLevel = (height: number, levelIdx: number) => {
    y += height
    // Cross ledgers at each bay
    for (let b = 0; b < bays; b++) {
      const x1 = offsetX + b * BOARD_L
      const x2 = offsetX + (b + 1) * BOARD_L

      // Front and back ledgers
      for (const z of [0, -BOARD_W]) {
        ledgers.push(
          <Tube key={`lg_${levelIdx}_${b}_${z}`} start={[x1, y, z]} end={[x2, y, z]} />
        )
      }

      // Transverse connector
      ledgers.push(
        <Tube key={`tr_${levelIdx}_${b}`} start={[x1, y, 0]} end={[x1, y, -BOARD_W]} />
      )

      // Floor board
      boards.push(
        <Board
          key={`bd_${levelIdx}_${b}`}
          position={[x1 + BOARD_L / 2, y + BOARD_T / 2, -BOARD_W / 2]}
        />
      )
    }

    // Last transverse
    ledgers.push(
      <Tube key={`tr_${levelIdx}_last`} start={[offsetX + bays * BOARD_L, y, 0]} end={[offsetX + bays * BOARD_L, y, -BOARD_W]} />
    )
  }

  for (let l = 0; l < levels2m; l++) addLevel(2, l)
  for (let l = 0; l < levels07m; l++) addLevel(0.7, levels2m + l)

  // Diagonal braces (only on front face, every other bay)
  for (let l = 0; l < Math.min(levels2m, 3); l++) {
    const yBot = legH + l * 2
    const yTop = yBot + 2
    for (let b = 0; b < bays; b += 2) {
      const x1 = offsetX + b * BOARD_L
      const x2 = offsetX + (b + 1) * BOARD_L
      braces.push(
        <Tube key={`br_${l}_${b}`} start={[x1, yBot, 0]} end={[x2, yTop, 0]} color="#aaa" />
      )
    }
  }

  // Guardrails at top
  const topY = totalH
  for (let b = 0; b < bays; b++) {
    const x1 = offsetX + b * BOARD_L
    const x2 = offsetX + (b + 1) * BOARD_L
    ledgers.push(
      <Tube key={`rail_${b}`} start={[x1, topY, 0]} end={[x2, topY, 0]} color="#cc0000" />
    )
    ledgers.push(
      <Tube key={`midrail_${b}`} start={[x1, topY - 0.5, 0]} end={[x2, topY - 0.5, 0]} color="#cc0000" />
    )
  }

  return (
    <group ref={groupRef}>
      {uprights}
      {ledgers}
      {boards}
      {braces}
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[bays * BOARD_L + 4, 6]} />
        <meshStandardMaterial color="#e0e0e0" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

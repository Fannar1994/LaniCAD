import { useRef, type ReactNode } from 'react'
import * as THREE from 'three'

interface ScaffoldModel3DProps {
  length: number    // meters
  levels2m: number
  levels07m: number
  legType: '50cm' | '100cm'
}

const TUBE_R = 0.024       // 48 mm standard tube
const THIN_R = 0.016       // thinner braces / rails
const BAY_L = 1.8          // Layher Allround bay length
const BAY_W = 0.73         // standard bay depth (0.73m)
const BOARD_T = 0.04       // deck board thickness
const TUBE_COLOR = '#777'
const BOARD_COLOR = '#f5c800'
const BASE_COLOR = '#555'
const RAIL_COLOR = '#cc0000'
const BRACE_COLOR = '#aaa'

function Tube({ start, end, radius = TUBE_R, color = TUBE_COLOR }: {
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
      <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
    </mesh>
  )
}

function Board({ position, width = BAY_L, depth = BAY_W }: {
  position: [number, number, number]
  width?: number
  depth?: number
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[width, BOARD_T, depth]} />
      <meshStandardMaterial color={BOARD_COLOR} roughness={0.6} />
    </mesh>
  )
}

export function ScaffoldModel3D({ length, levels2m, levels07m, legType }: ScaffoldModel3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const bays = Math.ceil(length / BAY_L)
  const legH = legType === '50cm' ? 0.34 : 0.69
  const totalH = levels2m * 2 + levels07m * 0.7 + legH + 2.0
  const offsetX = -(bays * BAY_L) / 2
  const offsetZ = -BAY_W / 2

  const elements: ReactNode[] = []
  let k = 0
  const key = () => `e${k++}`

  /* ── STANDARDS (4 uprights per bay junction) ── */
  for (let b = 0; b <= bays; b++) {
    const x = offsetX + b * BAY_L
    for (const z of [offsetZ, offsetZ + BAY_W]) {
      elements.push(
        <Tube key={key()} start={[x, 0, z]} end={[x, totalH, z]} />
      )
    }
    // Base plates
    for (const z of [offsetZ, offsetZ + BAY_W]) {
      elements.push(
        <mesh key={key()} position={[x, -0.02, z]}>
          <boxGeometry args={[0.15, 0.04, 0.15]} />
          <meshStandardMaterial color={BASE_COLOR} metalness={0.5} />
        </mesh>
      )
    }
  }

  /* ── LEVELS: ledgers + transversals + decks ── */
  let y = legH
  const addLevel = (height: number, _idx: number) => {
    y += height

    for (let b = 0; b < bays; b++) {
      const x1 = offsetX + b * BAY_L
      const x2 = offsetX + (b + 1) * BAY_L

      // Front & back longitudinal ledgers
      for (const z of [offsetZ, offsetZ + BAY_W]) {
        elements.push(
          <Tube key={key()} start={[x1, y, z]} end={[x2, y, z]} />
        )
      }

      // Transverse connectors at each standard
      elements.push(
        <Tube key={key()} start={[x1, y, offsetZ]} end={[x1, y, offsetZ + BAY_W]} />
      )

      // Deck board
      elements.push(
        <Board
          key={key()}
          position={[x1 + BAY_L / 2, y + BOARD_T / 2, offsetZ + BAY_W / 2]}
        />
      )
    }
    // Last transverse
    const xLast = offsetX + bays * BAY_L
    elements.push(
      <Tube key={key()} start={[xLast, y, offsetZ]} end={[xLast, y, offsetZ + BAY_W]} />
    )
  }

  for (let l = 0; l < levels2m; l++) addLevel(2, l)
  for (let l = 0; l < levels07m; l++) addLevel(0.7, levels2m + l)

  /* ── DIAGONAL BRACES (front face, X pattern, alternating) ── */
  let braceY = legH
  for (let l = 0; l < Math.min(levels2m + levels07m, 4); l++) {
    const h = l < levels2m ? 2 : 0.7
    const yBot = braceY
    const yTop = braceY + h
    for (let b = l % 2; b < bays; b += 2) {
      const x1 = offsetX + b * BAY_L
      const x2 = offsetX + (b + 1) * BAY_L
      elements.push(
        <Tube key={key()} start={[x1, yBot, offsetZ]} end={[x2, yTop, offsetZ]} radius={THIN_R} color={BRACE_COLOR} />
      )
      elements.push(
        <Tube key={key()} start={[x1, yTop, offsetZ]} end={[x2, yBot, offsetZ]} radius={THIN_R} color={BRACE_COLOR} />
      )
    }
    braceY += h
  }

  /* ── GUARDRAILS (all 4 sides at top) ── */
  const topRailY = totalH
  const midRailY = totalH - 0.5
  const toeY = y + 0.15  // just above last deck

  for (let b = 0; b < bays; b++) {
    const x1 = offsetX + b * BAY_L
    const x2 = offsetX + (b + 1) * BAY_L

    // Front face rails
    elements.push(<Tube key={key()} start={[x1, topRailY, offsetZ]} end={[x2, topRailY, offsetZ]} radius={THIN_R} color={RAIL_COLOR} />)
    elements.push(<Tube key={key()} start={[x1, midRailY, offsetZ]} end={[x2, midRailY, offsetZ]} radius={THIN_R} color={RAIL_COLOR} />)

    // Back face rails
    elements.push(<Tube key={key()} start={[x1, topRailY, offsetZ + BAY_W]} end={[x2, topRailY, offsetZ + BAY_W]} radius={THIN_R} color={RAIL_COLOR} />)
    elements.push(<Tube key={key()} start={[x1, midRailY, offsetZ + BAY_W]} end={[x2, midRailY, offsetZ + BAY_W]} radius={THIN_R} color={RAIL_COLOR} />)

    // Toeboard front
    elements.push(<Tube key={key()} start={[x1, toeY, offsetZ]} end={[x2, toeY, offsetZ]} radius={THIN_R} color={BOARD_COLOR} />)
  }

  // End rails (left & right sides)
  const xLeft = offsetX
  const xRight = offsetX + bays * BAY_L
  for (const x of [xLeft, xRight]) {
    elements.push(<Tube key={key()} start={[x, topRailY, offsetZ]} end={[x, topRailY, offsetZ + BAY_W]} radius={THIN_R} color={RAIL_COLOR} />)
    elements.push(<Tube key={key()} start={[x, midRailY, offsetZ]} end={[x, midRailY, offsetZ + BAY_W]} radius={THIN_R} color={RAIL_COLOR} />)
  }

  /* ── GROUND PLANE ── */
  const gpW = bays * BAY_L + 4
  const gpD = BAY_W + 4

  return (
    <group ref={groupRef}>
      {elements}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[gpW, gpD]} />
        <meshStandardMaterial color="#e0e0e0" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

import { useRef, type ReactNode } from 'react'
import * as THREE from 'three'

interface ScaffoldModel3DProps {
  length: number    // meters
  levels2m: number
  levels07m: number
  legType: '50cm' | '100cm'
}

const TUBE_R = 0.024       // 48.3mm OD Layher standard tube
const THIN_R = 0.016       // thinner braces / rails
const BAY_L = 1.8          // Bay length (matches BOARD_LENGTH_M from data)
const BAY_W = 0.73         // standard bay depth
const BOARD_T = 0.04       // deck board thickness
const TUBE_COLOR = '#777'
const BOARD_COLOR = '#f5c800'
const BASE_COLOR = '#555'
const RAIL_COLOR = '#cc0000'
const BRACE_COLOR = '#aaa'
const ROSETTE_COLOR = '#555'

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

/** Rosette node on a Layher Allround standard — the 8-hole connection disc */
function Rosette({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.06, 0.06, 0.012, 8]} />
      <meshStandardMaterial color={ROSETTE_COLOR} metalness={0.6} roughness={0.4} />
    </mesh>
  )
}

/** Wall tie anchor — triangle bracket clamped to standard, going into wall */
function WallTie({ position, wallZ }: { position: [number, number, number]; wallZ: number }) {
  return (
    <group>
      {/* Tie tube from scaffold to wall */}
      <Tube start={position} end={[position[0], position[1], wallZ]} radius={0.012} color="#666" />
      {/* Wall plate */}
      <mesh position={[position[0], position[1], wallZ]}>
        <boxGeometry args={[0.1, 0.1, 0.02]} />
        <meshStandardMaterial color="#777" metalness={0.5} />
      </mesh>
    </group>
  )
}

export function ScaffoldModel3D({ length, levels2m, levels07m, legType }: ScaffoldModel3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const bays = Math.ceil(length / BAY_L)
  const legH = legType === '50cm' ? 0.34 : 0.69
  const totalLevels = levels2m + levels07m
  const totalH = levels2m * 2 + levels07m * 0.7 + legH + 2.0
  const offsetX = -(bays * BAY_L) / 2
  const offsetZ = -BAY_W / 2
  const wallZ = offsetZ + BAY_W + 0.15 // wall face behind scaffold

  const elements: ReactNode[] = []
  let k = 0
  const key = () => `e${k++}`

  /* ── STANDARDS (verticals at each bay junction, front + back) ── */
  for (let b = 0; b <= bays; b++) {
    const x = offsetX + b * BAY_L
    for (const z of [offsetZ, offsetZ + BAY_W]) {
      elements.push(
        <Tube key={key()} start={[x, 0, z]} end={[x, totalH, z]} />
      )
    }

    /* Base plates with adjustable jack */
    for (const z of [offsetZ, offsetZ + BAY_W]) {
      // Base plate
      elements.push(
        <mesh key={key()} position={[x, -0.02, z]}>
          <boxGeometry args={[0.15, 0.04, 0.15]} />
          <meshStandardMaterial color={BASE_COLOR} metalness={0.5} />
        </mesh>
      )
      // Jack screw thread
      elements.push(
        <Tube key={key()} start={[x, -0.02, z]} end={[x, legH * 0.3, z]} radius={0.015} color="#666" />
      )
    }

    /* Rosette connection nodes every 0.5m on standards */
    const rosetteSpacing = 0.5
    for (const z of [offsetZ, offsetZ + BAY_W]) {
      const numRosettes = Math.floor(totalH / rosetteSpacing)
      for (let r = 1; r <= numRosettes; r++) {
        const ry = r * rosetteSpacing
        if (ry < legH || ry > totalH) continue
        elements.push(<Rosette key={key()} position={[x, ry, z]} />)
      }
    }
  }

  /* ── LEVELS: ledgers + transversals + decks ── */
  let y = legH
  const levelYPositions: number[] = []

  const addLevel = (height: number) => {
    y += height
    levelYPositions.push(y)

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

  for (let l = 0; l < levels2m; l++) addLevel(2)
  for (let l = 0; l < levels07m; l++) addLevel(0.7)

  /* ── DIAGONAL BRACES (front face, X pattern per bay) ── */
  let braceY = legH
  for (let l = 0; l < Math.min(totalLevels, 6); l++) {
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

  /* ── GUARDRAILS (all 4 sides at top level) ── */
  const topRailY = totalH
  const midRailY = totalH - 0.5
  const toeY = y + 0.07  // toeboard just above last deck

  for (let b = 0; b < bays; b++) {
    const x1 = offsetX + b * BAY_L
    const x2 = offsetX + (b + 1) * BAY_L

    // Front face — top, mid, toeboard
    elements.push(<Tube key={key()} start={[x1, topRailY, offsetZ]} end={[x2, topRailY, offsetZ]} radius={THIN_R} color={RAIL_COLOR} />)
    elements.push(<Tube key={key()} start={[x1, midRailY, offsetZ]} end={[x2, midRailY, offsetZ]} radius={THIN_R} color={RAIL_COLOR} />)
    elements.push(
      <mesh key={key()} position={[(x1 + x2) / 2, toeY, offsetZ]}>
        <boxGeometry args={[BAY_L, 0.15, 0.025]} />
        <meshStandardMaterial color={BOARD_COLOR} />
      </mesh>
    )

    // Back face — top, mid, toeboard
    elements.push(<Tube key={key()} start={[x1, topRailY, offsetZ + BAY_W]} end={[x2, topRailY, offsetZ + BAY_W]} radius={THIN_R} color={RAIL_COLOR} />)
    elements.push(<Tube key={key()} start={[x1, midRailY, offsetZ + BAY_W]} end={[x2, midRailY, offsetZ + BAY_W]} radius={THIN_R} color={RAIL_COLOR} />)
    elements.push(
      <mesh key={key()} position={[(x1 + x2) / 2, toeY, offsetZ + BAY_W]}>
        <boxGeometry args={[BAY_L, 0.15, 0.025]} />
        <meshStandardMaterial color={BOARD_COLOR} />
      </mesh>
    )
  }

  // End guardrails (left & right sides) — top, mid, toeboard
  const xLeft = offsetX
  const xRight = offsetX + bays * BAY_L
  for (const x of [xLeft, xRight]) {
    elements.push(<Tube key={key()} start={[x, topRailY, offsetZ]} end={[x, topRailY, offsetZ + BAY_W]} radius={THIN_R} color={RAIL_COLOR} />)
    elements.push(<Tube key={key()} start={[x, midRailY, offsetZ]} end={[x, midRailY, offsetZ + BAY_W]} radius={THIN_R} color={RAIL_COLOR} />)
    elements.push(
      <mesh key={key()} position={[x, toeY, offsetZ + BAY_W / 2]}>
        <boxGeometry args={[0.025, 0.15, BAY_W]} />
        <meshStandardMaterial color={BOARD_COLOR} />
      </mesh>
    )
  }

  /* ── WALL TIES (every other bay, every other level on back face) ── */
  for (let l = 0; l < levelYPositions.length; l += 2) {
    for (let b = (l / 2) % 2; b <= bays; b += 2) {
      const x = offsetX + b * BAY_L
      const tieY = levelYPositions[l]
      elements.push(
        <WallTie key={key()} position={[x, tieY, offsetZ + BAY_W]} wallZ={wallZ} />
      )
    }
  }

  /* ── WALL SURFACE (faint behind scaffold) ── */
  elements.push(
    <mesh key={key()} position={[0, totalH / 2, wallZ + 0.01]}>
      <planeGeometry args={[bays * BAY_L + 1, totalH + 0.5]} />
      <meshStandardMaterial color="#d0c8b8" transparent opacity={0.15} side={THREE.DoubleSide} />
    </mesh>
  )

  /* ── GROUND PLANE ── */
  const gpW = bays * BAY_L + 4
  const gpD = BAY_W + 4

  return (
    <group ref={groupRef}>
      {elements}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[gpW, gpD]} />
        <meshStandardMaterial color="#e0e0e0" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

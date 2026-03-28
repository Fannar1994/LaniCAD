import { useRef } from 'react'
import * as THREE from 'three'
import { ROLLING } from '@/lib/geometry-config'

interface RollingScaffoldModel3DProps {
  height: number  // platform height in meters
  width: 'narrow' | 'wide'
}

const TUBE_R = ROLLING.tubeRadius
const BRACE_R = ROLLING.braceRadius
const ALU_COLOR = '#c8cdd0'   // aluminium tube finish
const ALU_DARK = '#a0a6aa'    // darker aluminium for braces
const DECK_COLOR = '#c0b878'  // plywood deck
const GUARDRAIL_COLOR = '#cc2222'
const YELLOW = '#f5c800'

function Tube({ start, end, radius = TUBE_R, color = ALU_COLOR }: {
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
      <cylinderGeometry args={[radius, radius, length, 12]} />
      <meshStandardMaterial color={color} metalness={0.75} roughness={0.25} />
    </mesh>
  )
}

/** Swivel castor with fork, wheel, hub and brake */
function CastorWheel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Swivel housing (top plate that inserts into frame leg) */}
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.02, 12]} />
        <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Swivel stem */}
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.06, 8]} />
        <meshStandardMaterial color="#666" metalness={0.6} />
      </mesh>
      {/* Fork left leg */}
      <Tube start={[-0.025, 0.11, 0]} end={[-0.025, 0.04, 0]} radius={0.006} color="#555" />
      {/* Fork right leg */}
      <Tube start={[0.025, 0.11, 0]} end={[0.025, 0.04, 0]} radius={0.006} color="#555" />
      {/* Fork bridge */}
      <Tube start={[-0.025, 0.11, 0]} end={[0.025, 0.11, 0]} radius={0.006} color="#555" />
      {/* Wheel */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.065, 0.065, 0.03, 20]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
      </mesh>
      {/* Wheel hub */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.035, 10]} />
        <meshStandardMaterial color="#888" metalness={0.8} />
      </mesh>
      {/* Axle bolt */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.05, 6]} />
        <meshStandardMaterial color="#666" metalness={0.7} />
      </mesh>
      {/* Brake pedal */}
      <mesh position={[0.04, 0.09, 0]} rotation={[0, 0, Math.PI / 8]}>
        <boxGeometry args={[0.04, 0.008, 0.018]} />
        <meshStandardMaterial color="#cc0000" />
      </mesh>
    </group>
  )
}

/** Diagonal brace - single diagonal per bay (Frigerio style) */
function DiagonalBrace({
  x, y1, y2, len, flip = false,
}: {
  x: number; y1: number; y2: number; len: number; flip?: boolean
}) {
  const hl = len / 2
  const zStart = flip ? hl : -hl
  const zEnd = flip ? -hl : hl
  return (
    <Tube start={[x, y1, zStart]} end={[x, y2, zEnd]} radius={BRACE_R} color={ALU_DARK} />
  )
}

/** Stabiliser / outrigger arm */
function Stabiliser({ position, direction }: {
  position: [number, number, number]
  direction: [number, number]
}) {
  const len = 0.9
  const attachH = 0.5
  return (
    <group position={position}>
      {/* Inner tube */}
      <Tube start={[0, 0.17, 0]} end={[0, attachH, 0]} radius={0.014} color={ALU_DARK} />
      {/* Diagonal arm */}
      <Tube
        start={[0, attachH, 0]}
        end={[direction[0] * len, 0.02, direction[1] * len]}
        radius={0.014}
        color={ALU_DARK}
      />
      {/* Horizontal cross-brace */}
      <Tube
        start={[0, 0.25, 0]}
        end={[direction[0] * len * 0.5, 0.02, direction[1] * len * 0.5]}
        radius={BRACE_R}
        color={ALU_DARK}
      />
      {/* Base plate */}
      <mesh position={[direction[0] * len, 0.005, direction[1] * len]}>
        <boxGeometry args={[0.18, 0.012, 0.18]} />
        <meshStandardMaterial color="#666" metalness={0.5} />
      </mesh>
      {/* Adjustable screw jack */}
      <mesh position={[direction[0] * len, 0.04, direction[1] * len]}>
        <cylinderGeometry args={[0.01, 0.013, 0.06, 8]} />
        <meshStandardMaterial color="#888" metalness={0.6} />
      </mesh>
    </group>
  )
}

export function RollingScaffoldModel3D({ height, width }: RollingScaffoldModel3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const baseW = width === 'narrow' ? 0.75 : 1.35
  const baseL = 2.5
  const railH = 1.0
  const totalH = height + railH
  const frameH = 2.0
  const numFrames = Math.max(1, Math.ceil(height / frameH))
  const baseY = 0.18  // top of castors

  const hw = baseW / 2
  const hl = baseL / 2

  const corners: [number, number][] = [[-hw, -hl], [hw, -hl], [hw, hl], [-hw, hl]]
  const needStabilisers = height > 2.5

  // Level heights for horizontal ledgers
  const levels = Array.from({ length: numFrames + 1 }, (_, i) => baseY + i * frameH)
    .filter(y => y <= height + 0.05)

  // Intermediate platform levels (every 2m frame, skip first and top)
  const intermediateLevels = levels.slice(1).filter(y => y < height - 0.3)

  return (
    <group ref={groupRef}>
      {/* === CASTOR WHEELS (4 corners) === */}
      {corners.map(([x, z], i) => (
        <CastorWheel key={`wheel_${i}`} position={[x, 0, z]} />
      ))}

      {/* === FOUR CORNER UPRIGHTS (continuous from base to guardrail top) === */}
      {corners.map(([x, z], i) => (
        <Tube key={`vert_${i}`} start={[x, baseY, z]} end={[x, totalH, z]} />
      ))}

      {/* === HORIZONTAL LEDGERS at each level (all 4 sides) === */}
      {levels.map((y, l) => (
        <group key={`ledger_${l}`}>
          {/* Short sides */}
          <Tube start={[-hw, y, -hl]} end={[hw, y, -hl]} />
          <Tube start={[-hw, y, hl]} end={[hw, y, hl]} />
          {/* Long sides */}
          <Tube start={[-hw, y, -hl]} end={[-hw, y, hl]} />
          <Tube start={[hw, y, -hl]} end={[hw, y, hl]} />
        </group>
      ))}

      {/* === MID-HEIGHT HORIZONTALS on short sides (for H-frame rungs) === */}
      {Array.from({ length: numFrames }, (_, f) => {
        const y = baseY + f * frameH + frameH * 0.5
        if (y > height) return null
        return (
          <group key={`midrung_${f}`}>
            <Tube start={[-hw, y, -hl]} end={[hw, y, -hl]} radius={BRACE_R} />
            <Tube start={[-hw, y, hl]} end={[hw, y, hl]} radius={BRACE_R} />
          </group>
        )
      })}

      {/* === DIAGONAL BRACES on long sides (single diagonal, alternating per bay) === */}
      {Array.from({ length: numFrames }, (_, f) => {
        const y1 = baseY + f * frameH
        const y2 = Math.min(y1 + frameH, height + 0.05)
        const flip = f % 2 === 1
        return (
          <group key={`diag_${f}`}>
            <DiagonalBrace x={-hw} y1={y1} y2={y2} len={baseL} flip={flip} />
            <DiagonalBrace x={hw} y1={y1} y2={y2} len={baseL} flip={!flip} />
          </group>
        )
      })}

      {/* === DIAGONAL BRACES on short sides (one per bay) === */}
      {Array.from({ length: numFrames }, (_, f) => {
        const y1 = baseY + f * frameH
        const y2 = Math.min(y1 + frameH, height + 0.05)
        return (
          <group key={`sdiag_${f}`}>
            <Tube
              start={[f % 2 === 0 ? -hw : hw, y1, -hl]}
              end={[f % 2 === 0 ? hw : -hw, y2, -hl]}
              radius={BRACE_R}
              color={ALU_DARK}
            />
          </group>
        )
      })}

      {/* === INTEGRATED LADDER on +Z short side (Frigerio style) === */}
      {(() => {
        const ladderW = baseW * 0.4
        const rungSpacing = 0.28
        const rungCount = Math.floor(height / rungSpacing)
        return (
          <group>
            {/* Ladder side rails */}
            <Tube start={[-ladderW / 2, baseY, hl]} end={[-ladderW / 2, height, hl]} radius={0.012} color={ALU_DARK} />
            <Tube start={[ladderW / 2, baseY, hl]} end={[ladderW / 2, height, hl]} radius={0.012} color={ALU_DARK} />
            {/* Rungs */}
            {Array.from({ length: rungCount }, (_, i) => {
              const y = baseY + (i + 1) * rungSpacing
              if (y > height) return null
              return (
                <Tube
                  key={`rung_${i}`}
                  start={[-ladderW / 2, y, hl]}
                  end={[ladderW / 2, y, hl]}
                  radius={0.008}
                  color={ALU_DARK}
                />
              )
            })}
          </group>
        )
      })()}

      {/* === INTERMEDIATE PLATFORM DECKS (plywood planks) === */}
      {intermediateLevels.map((y, i) => {
        const plankCount = 5
        const plankW = (baseW - 0.02) / plankCount
        return (
          <group key={`ideck_${i}`}>
            {/* Individual planks */}
            {Array.from({ length: plankCount }, (_, p) => (
              <mesh key={`plank_${p}`} position={[-hw + 0.01 + plankW * (p + 0.5), y + 0.015, 0]}>
                <boxGeometry args={[plankW - 0.004, 0.03, baseL - 0.04]} />
                <meshStandardMaterial color={DECK_COLOR} roughness={0.7} />
              </mesh>
            ))}
            {/* Support cross-members under deck */}
            <Tube start={[-hw, y - 0.01, -hl * 0.7]} end={[hw, y - 0.01, -hl * 0.7]} radius={BRACE_R} color={ALU_DARK} />
            <Tube start={[-hw, y - 0.01, hl * 0.7]} end={[hw, y - 0.01, hl * 0.7]} radius={BRACE_R} color={ALU_DARK} />
          </group>
        )
      })}

      {/* === TOP PLATFORM (Frigerio planked deck with trapdoor) === */}
      <group>
        {/* Platform frame */}
        <Tube start={[-hw, height, -hl]} end={[hw, height, -hl]} radius={TUBE_R * 0.8} color={ALU_DARK} />
        <Tube start={[-hw, height, hl]} end={[hw, height, hl]} radius={TUBE_R * 0.8} color={ALU_DARK} />

        {/* Main planks */}
        {(() => {
          const plankCount = 7
          const plankW = (baseW - 0.02) / plankCount
          return Array.from({ length: plankCount }, (_, p) => (
            <mesh key={`toplank_${p}`} position={[-hw + 0.01 + plankW * (p + 0.5), height + 0.018, 0]}>
              <boxGeometry args={[plankW - 0.003, 0.035, baseL - 0.03]} />
              <meshStandardMaterial color={YELLOW} roughness={0.35} metalness={0.1} />
            </mesh>
          ))
        })()}

        {/* Trapdoor hatch (recessed, darker shade) */}
        <mesh position={[-hw * 0.3, height + 0.04, -hl * 0.2]}>
          <boxGeometry args={[baseW * 0.35, 0.004, 0.55]} />
          <meshStandardMaterial color="#d4a800" roughness={0.5} />
        </mesh>
        {/* Hatch handle */}
        <mesh position={[-hw * 0.3, height + 0.055, -hl * 0.2]}>
          <boxGeometry args={[0.08, 0.015, 0.015]} />
          <meshStandardMaterial color="#555" metalness={0.6} />
        </mesh>
      </group>

      {/* === GUARDRAILS (all 4 sides) === */}
      {/* Corner posts extend from platform to totalH */}
      {corners.map(([x, z], i) => (
        <Tube key={`gpost_${i}`} start={[x, height, z]} end={[x, totalH, z]} color={GUARDRAIL_COLOR} />
      ))}
      {/* Top rail */}
      <Tube start={[-hw, totalH, -hl]} end={[hw, totalH, -hl]} color={GUARDRAIL_COLOR} />
      <Tube start={[-hw, totalH, hl]} end={[hw, totalH, hl]} color={GUARDRAIL_COLOR} />
      <Tube start={[-hw, totalH, -hl]} end={[-hw, totalH, hl]} color={GUARDRAIL_COLOR} />
      <Tube start={[hw, totalH, -hl]} end={[hw, totalH, hl]} color={GUARDRAIL_COLOR} />
      {/* Mid rail */}
      {(() => {
        const midRailY = height + railH * 0.5
        return (
          <>
            <Tube start={[-hw, midRailY, -hl]} end={[hw, midRailY, -hl]} color={GUARDRAIL_COLOR} />
            <Tube start={[-hw, midRailY, hl]} end={[hw, midRailY, hl]} color={GUARDRAIL_COLOR} />
            <Tube start={[-hw, midRailY, -hl]} end={[-hw, midRailY, hl]} color={GUARDRAIL_COLOR} />
            <Tube start={[hw, midRailY, -hl]} end={[hw, midRailY, hl]} color={GUARDRAIL_COLOR} />
          </>
        )
      })()}
      {/* Toeboards (all 4 sides) */}
      {/* Short sides */}
      <mesh position={[0, height + 0.075, -hl]}>
        <boxGeometry args={[baseW, 0.15, 0.02]} />
        <meshStandardMaterial color={YELLOW} />
      </mesh>
      <mesh position={[0, height + 0.075, hl]}>
        <boxGeometry args={[baseW, 0.15, 0.02]} />
        <meshStandardMaterial color={YELLOW} />
      </mesh>
      {/* Long sides */}
      <mesh position={[-hw, height + 0.075, 0]}>
        <boxGeometry args={[0.02, 0.15, baseL]} />
        <meshStandardMaterial color={YELLOW} />
      </mesh>
      <mesh position={[hw, height + 0.075, 0]}>
        <boxGeometry args={[0.02, 0.15, baseL]} />
        <meshStandardMaterial color={YELLOW} />
      </mesh>

      {/* === STABILISERS / OUTRIGGERS (if height > 2.5m) === */}
      {needStabilisers && (
        <>
          <Stabiliser position={[-hw, 0, -hl]} direction={[-1, -1]} />
          <Stabiliser position={[hw, 0, -hl]} direction={[1, -1]} />
          <Stabiliser position={[-hw, 0, hl]} direction={[-1, 1]} />
          <Stabiliser position={[hw, 0, hl]} direction={[1, 1]} />
        </>
      )}

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#e0e0e0" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

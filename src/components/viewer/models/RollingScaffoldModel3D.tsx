import { useRef } from 'react'
import * as THREE from 'three'

interface RollingScaffoldModel3DProps {
  height: number  // platform height in meters
  width: 'narrow' | 'wide'
}

const TUBE_R = 0.024  // 48.3mm OD
const BRACE_R = 0.016 // thin brace tubes
const TUBE_COLOR = '#888'

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

function CastorWheel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Castor fork */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.1, 8]} />
        <meshStandardMaterial color="#555" metalness={0.6} />
      </mesh>
      {/* Wheel */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.035, 16]} />
        <meshStandardMaterial color="#222" roughness={0.95} />
      </mesh>
      {/* Wheel hub */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.04, 8]} />
        <meshStandardMaterial color="#666" metalness={0.7} />
      </mesh>
      {/* Brake lever */}
      <mesh position={[0.04, 0.08, 0]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.05, 0.012, 0.015]} />
        <meshStandardMaterial color="#cc0000" />
      </mesh>
    </group>
  )
}

function HFrame({ position, w, frameH }: {
  position: [number, number, number]
  w: number
  frameH: number
}) {
  const hw = w / 2
  return (
    <group position={position}>
      {/* Two verticals */}
      <Tube start={[-hw, 0, 0]} end={[-hw, frameH, 0]} />
      <Tube start={[hw, 0, 0]} end={[hw, frameH, 0]} />
      {/* Top horizontal */}
      <Tube start={[-hw, frameH, 0]} end={[hw, frameH, 0]} />
      {/* Mid horizontal */}
      <Tube start={[-hw, frameH * 0.5, 0]} end={[hw, frameH * 0.5, 0]} radius={BRACE_R} />
    </group>
  )
}

function Outrigger({ position, direction }: {
  position: [number, number, number]
  direction: [number, number]
}) {
  const len = 0.6
  return (
    <group position={position}>
      {/* Diagonal strut */}
      <Tube
        start={[0, 0.2, 0]}
        end={[direction[0] * len, 0.01, direction[1] * len]}
        radius={BRACE_R}
        color="#666"
      />
      {/* Foot plate */}
      <mesh position={[direction[0] * len, 0.005, direction[1] * len]}>
        <boxGeometry args={[0.12, 0.01, 0.12]} />
        <meshStandardMaterial color="#555" metalness={0.5} />
      </mesh>
    </group>
  )
}

export function RollingScaffoldModel3D({ height, width }: RollingScaffoldModel3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const baseW = width === 'narrow' ? 0.75 : 1.35
  const baseL = 2.5
  const railH = 1.0     // guardrail height above platform
  const totalH = height + railH
  const frameH = 2.0    // H-frame segment height
  const numFrames = Math.ceil(height / frameH)

  const hw = baseW / 2
  const hl = baseL / 2

  const corners: [number, number][] = [[-hw, -hl], [hw, -hl], [hw, hl], [-hw, hl]]
  const needOutriggers = height > 4.0

  return (
    <group ref={groupRef}>
      {/* === CASTOR WHEELS === */}
      {corners.map(([x, z], i) => (
        <CastorWheel key={`wheel_${i}`} position={[x, 0, z]} />
      ))}

      {/* === H-FRAMES on short sides, stacked === */}
      {Array.from({ length: numFrames }, (_, f) => {
        const y = 0.2 + f * frameH
        return (
          <group key={`hframes_${f}`}>
            <HFrame position={[0, y, -hl]} w={baseW} frameH={frameH} />
            <HFrame position={[0, y, hl]} w={baseW} frameH={frameH} />
          </group>
        )
      })}

      {/* === LONG-SIDE LEDGERS === */}
      {Array.from({ length: numFrames + 1 }, (_, l) => {
        const y = 0.2 + l * frameH
        if (y > totalH + 0.1) return null
        const clampedY = Math.min(y, height + 0.2)
        return (
          <group key={`ledger_${l}`}>
            <Tube start={[-hw, clampedY, -hl]} end={[-hw, clampedY, hl]} />
            <Tube start={[hw, clampedY, -hl]} end={[hw, clampedY, hl]} />
          </group>
        )
      })}

      {/* === DIAGONAL BRACES on long sides (X pattern) === */}
      {Array.from({ length: numFrames }, (_, f) => {
        const y1 = 0.2 + f * frameH
        const y2 = y1 + frameH
        return (
          <group key={`xbrace_${f}`}>
            {/* Left side X-brace */}
            <Tube start={[-hw, y1, -hl]} end={[-hw, y2, hl]} radius={BRACE_R} color="#aaa" />
            <Tube start={[-hw, y1, hl]} end={[-hw, y2, -hl]} radius={BRACE_R} color="#aaa" />
            {/* Right side X-brace */}
            <Tube start={[hw, y1, -hl]} end={[hw, y2, hl]} radius={BRACE_R} color="#aaa" />
            <Tube start={[hw, y1, hl]} end={[hw, y2, -hl]} radius={BRACE_R} color="#aaa" />
          </group>
        )
      })}

      {/* === PLATFORM with trapdoor === */}
      <group>
        {/* Main platform deck */}
        <mesh position={[0, height, 0]}>
          <boxGeometry args={[baseW + 0.06, 0.04, baseL + 0.06]} />
          <meshStandardMaterial color="#f5c800" roughness={0.4} />
        </mesh>
        {/* Trapdoor hatch outline */}
        <mesh position={[-hw / 3, height + 0.025, 0]}>
          <boxGeometry args={[baseW * 0.4, 0.005, 0.6]} />
          <meshStandardMaterial color="#d4a800" />
        </mesh>
      </group>

      {/* === GUARDRAILS (safety red) === */}
      {/* Top rail */}
      <Tube start={[-hw, totalH, -hl]} end={[hw, totalH, -hl]} color="#cc0000" />
      <Tube start={[-hw, totalH, hl]} end={[hw, totalH, hl]} color="#cc0000" />
      <Tube start={[-hw, totalH, -hl]} end={[-hw, totalH, hl]} color="#cc0000" />
      <Tube start={[hw, totalH, -hl]} end={[hw, totalH, hl]} color="#cc0000" />
      {/* Mid rail */}
      <Tube start={[-hw, height + 0.5, -hl]} end={[hw, height + 0.5, -hl]} color="#cc0000" />
      <Tube start={[-hw, height + 0.5, hl]} end={[hw, height + 0.5, hl]} color="#cc0000" />
      <Tube start={[-hw, height + 0.5, -hl]} end={[-hw, height + 0.5, hl]} color="#cc0000" />
      <Tube start={[hw, height + 0.5, -hl]} end={[hw, height + 0.5, hl]} color="#cc0000" />
      {/* Toeboard (yellow strip at deck level) */}
      {[[-hl, 0, -hw], [-hl, 0, hw], [0, -hl, -hw], [0, -hl, hw]].map((_unused, i) => {
        const isShort = i < 2
        const z = i % 2 === 0 ? -hl : hl
        const x = i < 2 ? 0 : (i === 2 ? -hw : hw)
        return (
          <mesh key={`toe_${i}`} position={isShort ? [0, height + 0.07, z] : [x, height + 0.07, 0]}>
            <boxGeometry args={isShort ? [baseW, 0.15, 0.02] : [0.02, 0.15, baseL]} />
            <meshStandardMaterial color="#f5c800" />
          </mesh>
        )
      })}

      {/* === OUTRIGGERS (if tall) === */}
      {needOutriggers && (
        <>
          <Outrigger position={[-hw, 0, -hl]} direction={[-1, -1]} />
          <Outrigger position={[hw, 0, -hl]} direction={[1, -1]} />
          <Outrigger position={[-hw, 0, hl]} direction={[-1, 1]} />
          <Outrigger position={[hw, 0, hl]} direction={[1, 1]} />
        </>
      )}

      {/* === INTERNAL LADDER === */}
      <group>
        {Array.from({ length: Math.floor(height / 0.3) }, (_, i) => (
          <Tube
            key={`rung_${i}`}
            start={[hw * 0.3, 0.3 + i * 0.3, hl - 0.05]}
            end={[hw * 0.3 + baseW * 0.25, 0.3 + i * 0.3, hl - 0.05]}
            radius={0.01}
            color="#999"
          />
        ))}
        {/* Ladder side rails */}
        <Tube start={[hw * 0.3, 0.2, hl - 0.05]} end={[hw * 0.3, height, hl - 0.05]} radius={0.012} color="#999" />
        <Tube start={[hw * 0.3 + baseW * 0.25, 0.2, hl - 0.05]} end={[hw * 0.3 + baseW * 0.25, height, hl - 0.05]} radius={0.012} color="#999" />
      </group>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#e0e0e0" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

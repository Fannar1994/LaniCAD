import { Component, Suspense } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'

// ── Error Boundary for WebGL / Three.js crashes ──
interface EBProps { children: ReactNode }
interface EBState { hasError: boolean; message: string }

class Viewer3DErrorBoundary extends Component<EBProps, EBState> {
  state: EBState = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('3D Viewer error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-[500px] items-center justify-center rounded-lg border bg-gray-50">
          <div className="text-center p-6">
            <p className="text-lg font-semibold text-gray-700">3D sýning ekki tiltæk</p>
            <p className="mt-1 text-sm text-gray-500">{this.state.message || 'Villa kom upp við að hlaða 3D sýningu.'}</p>
            <button
              onClick={() => this.setState({ hasError: false, message: '' })}
              className="mt-3 rounded-md bg-brand-dark px-4 py-2 text-sm text-white hover:bg-gray-700"
            >
              Reyna aftur
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

interface Viewer3DProps {
  children: ReactNode
  cameraPosition?: [number, number, number]
  className?: string
}

/**
 * Generic 3D viewer canvas with orbit controls, grid, and lighting
 */
export function Viewer3D({ children, cameraPosition = [8, 6, 8], className = '' }: Viewer3DProps) {
  return (
    <Viewer3DErrorBoundary>
    <div className={`h-[500px] border rounded-lg bg-gray-50 ${className}`}>
      <Canvas
        camera={{ position: cameraPosition, fov: 50 }}
        shadows
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 15, 10]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <directionalLight position={[-5, 5, -5]} intensity={0.3} />

          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            maxPolarAngle={Math.PI / 2.1}
            minDistance={2}
            maxDistance={50}
          />

          <Grid
            infiniteGrid
            fadeDistance={30}
            fadeStrength={3}
            cellSize={1}
            sectionSize={5}
            cellColor="#ddd"
            sectionColor="#bbb"
          />

          {children}
        </Suspense>
      </Canvas>
    </div>
    </Viewer3DErrorBoundary>
  )
}

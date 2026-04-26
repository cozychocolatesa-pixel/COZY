'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function Particles({ count = 500 }) {
  const mesh = useRef<THREE.Points>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const { viewport } = useThree()

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const speeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
      sizes[i] = Math.random() * 3 + 1
      speeds[i] = Math.random() * 0.5 + 0.2
    }

    return { positions, sizes, speeds }
  }, [count])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame((state) => {
    if (!mesh.current) return
    const positions = mesh.current.geometry.attributes.position.array as Float32Array
    const time = state.clock.elapsedTime

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const speed = particles.speeds[i]

      // Gentle floating motion
      positions[i3 + 1] += Math.sin(time * speed + i) * 0.002
      positions[i3] += Math.cos(time * speed * 0.5 + i) * 0.001

      // Mouse interaction - particles gently move away from cursor
      const dx = positions[i3] - mouse.current.x * viewport.width * 0.5
      const dy = positions[i3 + 1] - mouse.current.y * viewport.height * 0.5
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 3) {
        positions[i3] += dx * 0.002
        positions[i3 + 1] += dy * 0.002
      }

      // Wrap around
      if (positions[i3 + 1] > 10) positions[i3 + 1] = -10
      if (positions[i3 + 1] < -10) positions[i3 + 1] = 10
      if (positions[i3] > 10) positions[i3] = -10
      if (positions[i3] < -10) positions[i3] = 10
    }

    mesh.current.geometry.attributes.position.needsUpdate = true
    mesh.current.rotation.z = time * 0.02
  })

  const positionRef = useRef<THREE.BufferAttribute>(null)
  const sizeRef = useRef<THREE.BufferAttribute>(null)

  useEffect(() => {
    if (positionRef.current) {
      positionRef.current.array = particles.positions
      positionRef.current.needsUpdate = true
    }
    if (sizeRef.current) {
      sizeRef.current.array = particles.sizes
      sizeRef.current.needsUpdate = true
    }
  }, [particles])

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          ref={positionRef}
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          ref={sizeRef}
          attach="attributes-size"
          args={[particles.sizes, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          attribute float size;
          varying float vAlpha;
          void main() {
            vAlpha = size / 4.0;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (200.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying float vAlpha;
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            float alpha = smoothstep(0.5, 0.0, dist) * vAlpha * 0.6;
            gl_FragColor = vec4(0.831, 0.686, 0.216, alpha * 0.4);
          }
        `}
      />
    </points>
  )
}

export default function HeroParticles() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Particles count={300} />
      </Canvas>
    </div>
  )
}

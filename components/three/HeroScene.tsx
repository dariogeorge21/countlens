"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function FloatingGeometry() {
  const torusRef = useRef<THREE.Mesh>(null);
  const octaRef = useRef<THREE.Mesh>(null);
  const icosaRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (torusRef.current) {
      torusRef.current.rotation.x += delta * 0.2;
      torusRef.current.rotation.y += delta * 0.15;
    }
    if (octaRef.current) {
      octaRef.current.rotation.y -= delta * 0.25;
      octaRef.current.rotation.z += delta * 0.1;
    }
    if (icosaRef.current) {
      icosaRef.current.rotation.x += delta * 0.15;
      icosaRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <directionalLight position={[-10, -10, -5]} intensity={0.4} color="#6366f1" />

      {/* Floating Torus Ring */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={torusRef} position={[2.5, 0.5, -2]}>
          <torusGeometry args={[1.2, 0.25, 16, 48]} />
          <meshStandardMaterial
            color="#6366f1"
            roughness={0.2}
            metalness={0.8}
            wireframe={true}
          />
        </mesh>
      </Float>

      {/* Floating Octahedron */}
      <Float speed={1.8} rotationIntensity={0.6} floatIntensity={0.8}>
        <mesh ref={octaRef} position={[-2.8, -0.2, -1.5]}>
          <octahedronGeometry args={[1]} />
          <meshStandardMaterial
            color="#06b6d4"
            roughness={0.3}
            metalness={0.7}
            wireframe={true}
          />
        </mesh>
      </Float>

      {/* Center Floating Icosahedron */}
      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.5}>
        <mesh ref={icosaRef} position={[0, 1.2, -3]}>
          <icosahedronGeometry args={[0.8]} />
          <meshStandardMaterial
            color="#a855f7"
            roughness={0.25}
            metalness={0.8}
            wireframe={true}
          />
        </mesh>
      </Float>
    </>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-30">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <FloatingGeometry />
      </Canvas>
    </div>
  );
}

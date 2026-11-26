"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useTheme } from "next-themes";
import * as THREE from "three";

interface StructureProps {
  position: [number, number, number];
  rotationSpeed?: [number, number, number];
  scale?: number;
  geometry: "torus" | "octahedron" | "icosahedron" | "dodecahedron" | "ring";
  color: string;
  floatSpeed?: number;
  floatIntensity?: number;
  isDark: boolean;
}

function WireframeStructure({
  position,
  rotationSpeed = [0.1, 0.15, 0.05],
  scale = 1,
  geometry,
  color,
  floatSpeed = 1.5,
  floatIntensity = 0.8,
  isDark,
}: StructureProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += delta * rotationSpeed[0];
      groupRef.current.rotation.y += delta * rotationSpeed[1];
      groupRef.current.rotation.z += delta * rotationSpeed[2];
    }
  });

  const geom = useMemo(() => {
    switch (geometry) {
      case "torus":
        return new THREE.TorusGeometry(1.4, 0.42, 28, 56);
      case "ring":
        return new THREE.TorusGeometry(1.9, 0.22, 24, 64);
      case "octahedron":
        return new THREE.OctahedronGeometry(1.2, 0);
      case "icosahedron":
        return new THREE.IcosahedronGeometry(1.1, 1);
      case "dodecahedron":
        return new THREE.DodecahedronGeometry(1.1, 0);
      default:
        return new THREE.OctahedronGeometry(1, 0);
    }
  }, [geometry]);

  // Translucency settings tuned for bright mode vs dark mode
  const wireColor = isDark ? color : "#64748b";
  const wireOpacity = isDark ? 0.75 : 0.52;
  const glassColor = isDark ? color : "#e0e7ff";
  const glassOpacity = isDark ? 0.07 : 0.16;

  return (
    <Float
      speed={floatSpeed}
      rotationIntensity={0.6}
      floatIntensity={floatIntensity}
      position={position}
    >
      <group ref={groupRef} scale={scale}>
        {/* Layer 1: Inner Translucent Crystalline Facet Body */}
        <mesh geometry={geom}>
          <meshStandardMaterial
            color={glassColor}
            roughness={0.15}
            metalness={isDark ? 0.5 : 0.1}
            transparent={true}
            opacity={glassOpacity}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Layer 2: Outer Translucent Wireframe Mesh with Specular Sheen */}
        <mesh geometry={geom}>
          <meshStandardMaterial
            color={wireColor}
            roughness={0.12}
            metalness={0.9}
            wireframe={true}
            transparent={true}
            opacity={wireOpacity}
          />
        </mesh>
      </group>
    </Float>
  );
}

function SceneComposition({ isDark }: { isDark: boolean }) {
  const lightRef = useRef<THREE.PointLight>(null);

  // Parallax camera movement and specular cursor tracking
  useFrame(({ pointer, camera }, delta) => {
    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      pointer.x * 1.2,
      2.5,
      delta
    );
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      pointer.y * 0.9,
      2.5,
      delta
    );
    camera.lookAt(0, 0, 0);

    if (lightRef.current) {
      lightRef.current.position.x = pointer.x * 6;
      lightRef.current.position.y = pointer.y * 6;
    }
  });

  const structures: Omit<StructureProps, "isDark">[] = useMemo(
    () => [
      // Primary Hero Trio (Matching reference image with translucent depth)
      {
        position: [-4.2, 1.2, -1.5],
        geometry: "octahedron",
        color: "#94a3b8",
        scale: 1.35,
        rotationSpeed: [0.08, 0.14, 0.04],
        floatSpeed: 1.4,
      },
      {
        position: [-0.6, 2.6, -2.5],
        geometry: "icosahedron",
        color: "#a5b4fc",
        scale: 1.2,
        rotationSpeed: [0.12, 0.16, 0.08],
        floatSpeed: 1.8,
      },
      {
        position: [4.4, 1.4, -1.0],
        geometry: "torus",
        color: "#c7d2fe",
        scale: 1.25,
        rotationSpeed: [0.15, 0.22, 0.06],
        floatSpeed: 1.6,
      },

      // Midground & Lower Viewport Structures
      {
        position: [-5.0, -2.6, -3.0],
        geometry: "ring",
        color: "#818cf8",
        scale: 1.1,
        rotationSpeed: [0.1, -0.15, 0.06],
        floatSpeed: 1.3,
      },
      {
        position: [5.2, -2.2, -2.8],
        geometry: "octahedron",
        color: "#67e8f9",
        scale: 1.4,
        rotationSpeed: [-0.14, 0.18, 0.05],
        floatSpeed: 1.7,
      },
      {
        position: [0.8, -3.5, -4.0],
        geometry: "dodecahedron",
        color: "#c084fc",
        scale: 1.5,
        rotationSpeed: [0.09, -0.12, 0.1],
        floatSpeed: 1.2,
      },

      // Deep Space Ambient Floating Wireframes
      {
        position: [-2.2, -0.8, -5.5],
        geometry: "icosahedron",
        color: "#cbd5e1",
        scale: 1.6,
        rotationSpeed: [0.06, 0.09, 0.03],
        floatSpeed: 0.9,
      },
      {
        position: [2.5, 3.8, -5.0],
        geometry: "octahedron",
        color: "#a7f3d0",
        scale: 1.3,
        rotationSpeed: [-0.08, 0.11, 0.07],
        floatSpeed: 1.1,
      },
      {
        position: [-6.5, 0.2, -4.5],
        geometry: "torus",
        color: "#e2e8f0",
        scale: 1.0,
        rotationSpeed: [0.18, 0.12, 0.08],
        floatSpeed: 1.4,
      },
      {
        position: [6.8, 3.2, -4.2],
        geometry: "icosahedron",
        color: "#ddd6fe",
        scale: 1.1,
        rotationSpeed: [0.1, 0.14, -0.06],
        floatSpeed: 1.5,
      },
    ],
    []
  );

  return (
    <>
      <ambientLight intensity={isDark ? 0.7 : 0.95} />
      <directionalLight position={[10, 15, 10]} intensity={isDark ? 1.4 : 1.8} />
      <directionalLight
        position={[-10, -10, -5]}
        intensity={0.6}
        color={isDark ? "#818cf8" : "#93c5fd"}
      />
      <pointLight
        ref={lightRef}
        position={[0, 0, 4]}
        intensity={isDark ? 2.2 : 2.8}
        distance={18}
        color="#ffffff"
      />

      {structures.map((s, idx) => (
        <WireframeStructure key={idx} isDark={isDark} {...s} />
      ))}
    </>
  );
}

export default function HeroScene() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none opacity-85 dark:opacity-40 transition-opacity duration-500">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <SceneComposition isDark={isDark} />
      </Canvas>
    </div>
  );
}

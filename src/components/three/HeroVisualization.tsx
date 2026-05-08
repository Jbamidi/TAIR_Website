"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Tall rack row as visible structures */
function RackStructure({
  position,
  count,
}: {
  position: [number, number, number];
  count: number;
}) {
  const racks = useMemo(() => {
    const items: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      items.push([
        position[0],
        position[1] + 0.6,
        position[2] + i * 1.0 - (count * 0.5),
      ]);
    }
    return items;
  }, [position, count]);

  return (
    <>
      {racks.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Main rack body */}
          <mesh>
            <boxGeometry args={[0.4, 1.2, 0.7]} />
            <meshBasicMaterial color="#1A1A1E" transparent opacity={0.6} />
          </mesh>
          {/* Shelf lines */}
          <mesh position={[0, -0.3, 0]}>
            <boxGeometry args={[0.42, 0.02, 0.72]} />
            <meshBasicMaterial color="#2A2A2F" />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[0.42, 0.02, 0.72]} />
            <meshBasicMaterial color="#2A2A2F" />
          </mesh>
        </group>
      ))}
    </>
  );
}

/** Floor grid */
function FloorGrid() {
  const grid = useMemo(() => {
    const g = new THREE.GridHelper(14, 28, "#1F1F23", "#151517");
    g.position.y = -0.02;
    return g;
  }, []);
  return <primitive object={grid} />;
}

/** Scan points that pulse when activated */
function ScanPoints() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = 30;

  const positions = useMemo(() => {
    const pos: [number, number, number][] = [];
    const rows = [-3.5, -1.5, 0.5, 2.5, 4.5];
    for (let i = 0; i < count; i++) {
      const row = rows[Math.floor(Math.random() * rows.length)];
      pos.push([
        row + (Math.random() - 0.5) * 0.3,
        0.05 + Math.random() * 1.0,
        (Math.random() - 0.5) * 6,
      ]);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    positions.forEach((pos, i) => {
      dummy.position.set(pos[0], pos[1], pos[2]);
      const pulse = 0.6 + Math.sin(t * 2.5 + i * 0.8) * 0.4;
      const active = Math.sin(t * 0.5 + i * 0.3) > 0;
      dummy.scale.setScalar(active ? pulse : 0.01);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.06, 6, 6]} />
      <meshBasicMaterial color="#00D4FF" transparent opacity={0.7} />
    </instancedMesh>
  );
}

/** Animated drone with bright trail */
function Drone() {
  const droneRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const scanBeamRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(0);

  const waypoints: [number, number, number][] = useMemo(
    () => [
      [-3.5, 1.8, -3],
      [-3.5, 1.8, 3],
      [-1.5, 1.8, 3],
      [-1.5, 1.8, -3],
      [0.5, 1.8, -3],
      [0.5, 1.8, 3],
      [2.5, 1.8, 3],
      [2.5, 1.8, -3],
      [4.5, 1.8, -3],
      [4.5, 1.8, 3],
    ],
    []
  );

  useFrame((state, delta) => {
    progressRef.current += delta * 0.07;
    if (progressRef.current > waypoints.length - 1) progressRef.current = 0;

    const idx = Math.floor(progressRef.current);
    const t = progressRef.current - idx;
    const next = (idx + 1) % waypoints.length;

    const x = THREE.MathUtils.lerp(waypoints[idx][0], waypoints[next][0], t);
    const y = THREE.MathUtils.lerp(waypoints[idx][1], waypoints[next][1], t);
    const z = THREE.MathUtils.lerp(waypoints[idx][2], waypoints[next][2], t);

    if (droneRef.current) droneRef.current.position.set(x, y, z);
    if (glowRef.current) glowRef.current.position.set(x, y + 0.3, z);
    if (scanBeamRef.current) {
      scanBeamRef.current.position.set(x, y * 0.5, z);
      scanBeamRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.15;
    }
  });

  return (
    <>
      {/* Drone body */}
      <group ref={droneRef}>
        <mesh>
          <boxGeometry args={[0.3, 0.1, 0.3]} />
          <meshBasicMaterial color="#00D4FF" />
        </mesh>
        {/* Drone arms */}
        <mesh rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[0.5, 0.03, 0.06]} />
          <meshBasicMaterial color="#00D4FF" transparent opacity={0.7} />
        </mesh>
        <mesh rotation={[0, -Math.PI / 4, 0]}>
          <boxGeometry args={[0.5, 0.03, 0.06]} />
          <meshBasicMaterial color="#00D4FF" transparent opacity={0.7} />
        </mesh>
      </group>
      {/* Scan beam from drone to floor */}
      <mesh ref={scanBeamRef}>
        <cylinderGeometry args={[0.01, 0.15, 1.8, 8]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.15} />
      </mesh>
      {/* Bright glow */}
      <pointLight ref={glowRef} color="#00D4FF" intensity={4} distance={5} />
    </>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <FloorGrid />
      {/* 5 rows of racks with aisles between them */}
      <RackStructure position={[-3.5, 0, 0]} count={6} />
      <RackStructure position={[-1.5, 0, 0]} count={6} />
      <RackStructure position={[0.5, 0, 0]} count={6} />
      <RackStructure position={[2.5, 0, 0]} count={6} />
      <RackStructure position={[4.5, 0, 0]} count={6} />
      <ScanPoints />
      <Drone />
    </>
  );
}

export function HeroVisualization() {
  return (
    <div className="w-full h-[350px] md:h-[450px] lg:h-[550px] relative">
      <Canvas
        camera={{ position: [3, 5, 7], fov: 50, near: 0.1, far: 100 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <Scene />
      </Canvas>
      {/* Soft edge gradients */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-l from-background/30 via-transparent to-background/60" />
    </div>
  );
}

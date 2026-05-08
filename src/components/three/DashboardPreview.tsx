"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

/** Warehouse floor grid */
function Floor() {
  const grid = useMemo(() => {
    const g = new THREE.GridHelper(16, 32, "#1F1F23", "#1F1F23");
    g.position.y = -0.01;
    return g;
  }, []);
  // @ts-ignore
  return <primitive object={grid} />;
}

/** Low-poly pallet rack rows — thin tall rectangles in #1F1F23 */
function RackRow({
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
        position[1] + 0.5,
        position[2] + i * 1.1 - (count * 0.55),
      ]);
    }
    return items;
  }, [position, count]);

  return (
    <>
      {racks.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Main rack body — thin and tall */}
          <mesh>
            <boxGeometry args={[0.35, 1.0, 0.7]} />
            <meshStandardMaterial color="#1F1F23" roughness={0.9} />
          </mesh>
          {/* Shelf dividers for visual structure */}
          <mesh position={[0, -0.25, 0]}>
            <boxGeometry args={[0.37, 0.02, 0.72]} />
            <meshStandardMaterial color="#2A2A2F" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.37, 0.02, 0.72]} />
            <meshStandardMaterial color="#2A2A2F" roughness={0.8} />
          </mesh>
          {/* Vertical uprights */}
          <mesh position={[0, 0, -0.33]}>
            <boxGeometry args={[0.04, 1.02, 0.04]} />
            <meshStandardMaterial color="#2A2A2F" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0, 0.33]}>
            <boxGeometry args={[0.04, 1.02, 0.04]} />
            <meshStandardMaterial color="#2A2A2F" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/** Animated scanning drone with cyan trail flying between rack rows */
function ScanDrone({ onScanEvent }: { onScanEvent: (rack: string) => void }) {
  const droneRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const scanLineRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(0);
  const lastEventRef = useRef(0);

  // Serpentine path between the rack rows
  const waypoints: [number, number, number][] = useMemo(
    () => [
      [-4.5, 1.3, -4],
      [-4.5, 1.3, 4],
      [-2.25, 1.3, 4],
      [-2.25, 1.3, -4],
      [0, 1.3, -4],
      [0, 1.3, 4],
      [2.25, 1.3, 4],
      [2.25, 1.3, -4],
      [4.5, 1.3, -4],
      [4.5, 1.3, 4],
    ],
    []
  );

  const rackLabels = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"];

  useFrame((state, delta) => {
    progressRef.current += delta * 0.06;
    if (progressRef.current > waypoints.length - 1) {
      progressRef.current = 0;
    }

    const idx = Math.floor(progressRef.current);
    const t = progressRef.current - idx;
    const next = (idx + 1) % waypoints.length;

    const x = THREE.MathUtils.lerp(waypoints[idx][0], waypoints[next][0], t);
    const y = THREE.MathUtils.lerp(waypoints[idx][1], waypoints[next][1], t);
    const z = THREE.MathUtils.lerp(waypoints[idx][2], waypoints[next][2], t);

    if (droneRef.current) droneRef.current.position.set(x, y, z);
    if (glowRef.current) glowRef.current.position.set(x, y + 0.2, z);
    if (scanLineRef.current) {
      scanLineRef.current.position.set(x, 0.6, z);
      scanLineRef.current.scale.y = 0.6 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }

    // Trigger scan events periodically
    const now = state.clock.elapsedTime;
    if (now - lastEventRef.current > 1.8) {
      lastEventRef.current = now;
      const rackIdx = idx % rackLabels.length;
      const slot = Math.floor(Math.random() * 48) + 1;
      onScanEvent(`${rackLabels[rackIdx]}_${slot.toString().padStart(2, "0")}`);
    }
  });

  return (
    <>
      {/* Drone body */}
      <group ref={droneRef}>
        <mesh>
          <boxGeometry args={[0.25, 0.08, 0.25]} />
          <meshBasicMaterial color="#00D4FF" />
        </mesh>
        {/* Arms */}
        <mesh rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[0.4, 0.02, 0.04]} />
          <meshBasicMaterial color="#00D4FF" transparent opacity={0.7} />
        </mesh>
        <mesh rotation={[0, -Math.PI / 4, 0]}>
          <boxGeometry args={[0.4, 0.02, 0.04]} />
          <meshBasicMaterial color="#00D4FF" transparent opacity={0.7} />
        </mesh>
      </group>
      {/* Scan line down from drone */}
      <mesh ref={scanLineRef}>
        <cylinderGeometry args={[0.01, 0.08, 1.2, 8]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.2} />
      </mesh>
      <pointLight ref={glowRef} color="#00D4FF" intensity={3} distance={4} />
    </>
  );
}

/** Scan markers that appear on racks when scanned — glowing cyan dots */
function ScanMarkers() {
  const markersRef = useRef<THREE.InstancedMesh>(null);
  const count = 50;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Place markers on rack surfaces
  const positions = useMemo(() => {
    const pos: [number, number, number][] = [];
    const rowX = [-5.5, -3.25, -1, 1.25, 3.5, 5.75];
    for (let i = 0; i < count; i++) {
      const rx = rowX[Math.floor(Math.random() * rowX.length)];
      pos.push([
        rx + (Math.random() - 0.5) * 0.2,
        0.15 + Math.random() * 0.8,
        (Math.random() - 0.5) * 7,
      ]);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!markersRef.current) return;
    positions.forEach((pos, i) => {
      dummy.position.set(pos[0], pos[1], pos[2]);
      const pulse = 0.7 + Math.sin(state.clock.elapsedTime * 2 + i * 0.5) * 0.3;
      // Stagger activation so dots appear over time
      const active = Math.sin(state.clock.elapsedTime * 0.4 + i * 0.4) > -0.2;
      dummy.scale.setScalar(active ? pulse : 0.01);
      dummy.updateMatrix();
      markersRef.current!.setMatrixAt(i, dummy.matrix);
    });
    markersRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={markersRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.05, 6, 6]} />
      <meshBasicMaterial color="#00D4FF" transparent opacity={0.6} />
    </instancedMesh>
  );
}

function DashboardScene({ onScanEvent }: { onScanEvent: (rack: string) => void }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 3]} intensity={0.3} />
      <Floor />
      {/* 6 rows of pallet racks with aisles between them */}
      <RackRow position={[-5.5, 0, 0]} count={7} />
      <RackRow position={[-3.25, 0, 0]} count={7} />
      <RackRow position={[-1, 0, 0]} count={7} />
      <RackRow position={[1.25, 0, 0]} count={7} />
      <RackRow position={[3.5, 0, 0]} count={7} />
      <RackRow position={[5.75, 0, 0]} count={7} />
      <ScanMarkers />
      <ScanDrone onScanEvent={onScanEvent} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
        maxPolarAngle={Math.PI / 3}
        minPolarAngle={Math.PI / 5}
      />
    </>
  );
}

export function DashboardPreview({
  onScanEvent,
}: {
  onScanEvent: (rack: string) => void;
}) {
  return (
    <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden border border-border bg-surface">
      <Canvas
        camera={{ position: [8, 10, 8], fov: 40 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: "#0A0A0B" }}
      >
        <DashboardScene onScanEvent={onScanEvent} />
      </Canvas>
      {/* Overlay label */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-md px-3 py-1.5 border border-border">
        <span className="w-1.5 h-1.5 rounded-full bg-status-green animate-pulse" />
        <span className="font-mono text-xs text-muted">
          Live preview — sample data
        </span>
      </div>
    </div>
  );
}

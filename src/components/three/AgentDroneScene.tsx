"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Instances, Instance } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { useInView } from "react-intersection-observer";

/*
  Single-aisle mission (driven by phase 0→1 over ~20s):
  0.00–0.10  idle on dock
  0.10–0.20  liftoff
  0.20–0.30  fly to target aisle entrance
  0.30–0.55  scan aisle (one pass, left→right)
  0.55–0.70  fly back to dock (hovering height)
  0.70–0.85  landing
  0.85–1.00  idle on dock (cooldown)
*/

const AISLE_ROWS = [-3.5, -1.5, 0.5, 2.5];
const DOCK_POS = new THREE.Vector3(-5, 0, -4.5);

function GridFloor() {
  const grid = useMemo(() => {
    const g = new THREE.GridHelper(20, 40, "#1F1F23", "#131315");
    g.position.y = -0.01;
    return g;
  }, []);
  return <primitive object={grid} />;
}

function Racks() {
  const positions = useMemo(() => {
    const p: [number, number, number][] = [];
    for (const z of AISLE_ROWS) {
      for (let i = 0; i < 5; i++) {
        p.push([i * 1.4 - 2.8, 0.45, z]);
      }
    }
    return p;
  }, []);

  return (
    <Instances limit={20}>
      <boxGeometry args={[0.8, 0.9, 0.3]} />
      <meshBasicMaterial color="#1A1A1F" />
      {positions.map((pos, i) => (
        <Instance key={i} position={pos} />
      ))}
    </Instances>
  );
}

function ShelfDividers() {
  const positions = useMemo(() => {
    const p: { pos: [number, number, number] }[] = [];
    for (const z of AISLE_ROWS) {
      for (let i = 0; i < 5; i++) {
        const x = i * 1.4 - 2.8;
        p.push({ pos: [x, 0.2, z] });
        p.push({ pos: [x, 0.55, z] });
      }
    }
    return p;
  }, []);

  return (
    <>
      {positions.map((s, i) => (
        <mesh key={i} position={s.pos}>
          <boxGeometry args={[0.82, 0.02, 0.32]} />
          <meshBasicMaterial color="#2A2A2F" />
        </mesh>
      ))}
    </>
  );
}

function DockingStation({ phase }: { phase: number }) {
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    if (!glowRef.current) return;
    const docked = phase < 0.10 || phase > 0.82;
    glowRef.current.intensity = docked ? 2.5 : 0.5;
    glowRef.current.color.set(docked ? "#10B981" : "#2A2A2F");
  });

  return (
    <group position={[DOCK_POS.x, 0, DOCK_POS.z]}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.4, 0.45, 0.04, 16]} />
        <meshBasicMaterial color="#1A1A1F" />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.02, 16]} />
        <meshBasicMaterial color="#2A2A2F" />
      </mesh>
      <mesh position={[0, 0.07, 0]}>
        <ringGeometry args={[0.18, 0.22, 16]} />
        <meshBasicMaterial color="#10B981" transparent opacity={0.4} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <pointLight ref={glowRef} position={[0, 0.3, 0]} color="#10B981" intensity={2.5} distance={3} />
    </group>
  );
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function Drone({ phase, aisleZ }: { phase: number; aisleZ: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const rotorRefs = useRef<THREE.Mesh[]>([]);
  const scanRef = useRef<THREE.Mesh>(null);

  const arms = useMemo(() => [
    { pos: [0.18, 0, 0.18] as [number, number, number] },
    { pos: [-0.18, 0, 0.18] as [number, number, number] },
    { pos: [0.18, 0, -0.18] as [number, number, number] },
    { pos: [-0.18, 0, -0.18] as [number, number, number] },
  ], []);

  const aisleStart = useMemo(() => new THREE.Vector3(-3.5, 1.2, aisleZ), [aisleZ]);
  const aisleEnd = useMemo(() => new THREE.Vector3(3.5, 1.2, aisleZ), [aisleZ]);
  const dockHover = useMemo(() => new THREE.Vector3(DOCK_POS.x, 1.2, DOCK_POS.z), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const g = groupRef.current;
    const t = state.clock.elapsedTime;

    let pos: THREE.Vector3;
    let rotorSpeed = 0;
    let scanOpacity = 0;

    if (phase < 0.10) {
      pos = DOCK_POS.clone();
      pos.y = 0.15;
    } else if (phase < 0.20) {
      const e = smoothstep((phase - 0.10) / 0.10);
      pos = DOCK_POS.clone();
      pos.y = THREE.MathUtils.lerp(0.15, 1.2, e);
      rotorSpeed = THREE.MathUtils.lerp(0.05, 0.4, e);
    } else if (phase < 0.30) {
      const e = smoothstep((phase - 0.20) / 0.10);
      pos = new THREE.Vector3();
      pos.lerpVectors(dockHover, aisleStart, e);
      rotorSpeed = 0.4;
    } else if (phase < 0.55) {
      const scanT = (phase - 0.30) / 0.25;
      pos = new THREE.Vector3();
      pos.lerpVectors(aisleStart, aisleEnd, scanT);
      rotorSpeed = 0.4;
      scanOpacity = 0.12;
    } else if (phase < 0.70) {
      const e = smoothstep((phase - 0.55) / 0.15);
      pos = new THREE.Vector3();
      pos.lerpVectors(aisleEnd, dockHover, e);
      rotorSpeed = 0.4;
    } else if (phase < 0.85) {
      const e = smoothstep((phase - 0.70) / 0.15);
      pos = DOCK_POS.clone();
      pos.y = THREE.MathUtils.lerp(1.2, 0.15, e);
      rotorSpeed = THREE.MathUtils.lerp(0.4, 0, e);
    } else {
      pos = DOCK_POS.clone();
      pos.y = 0.15;
    }

    if (rotorSpeed > 0) {
      pos.y += Math.sin(t * 2) * 0.01;
    }

    g.position.copy(pos);

    rotorRefs.current.forEach((rotor) => {
      if (rotor) rotor.rotation.y += rotorSpeed;
    });

    if (scanRef.current) {
      scanRef.current.visible = scanOpacity > 0;
      (scanRef.current.material as THREE.MeshBasicMaterial).opacity = scanOpacity;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <boxGeometry args={[0.16, 0.04, 0.16]} />
        <meshBasicMaterial color="#00D4FF" toneMapped={false} />
      </mesh>
      {arms.map((arm, i) => (
        <group key={i} position={arm.pos}>
          <mesh rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.22, 0.02, 0.025]} />
            <meshBasicMaterial color="#0099BB" toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.015, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.025, 6]} />
            <meshBasicMaterial color="#00D4FF" toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.03, 0]} ref={(el) => { if (el) rotorRefs.current[i] = el; }}>
            <cylinderGeometry args={[0.07, 0.07, 0.005, 8]} />
            <meshBasicMaterial color="#00D4FF" transparent opacity={0.3} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh ref={scanRef} position={[0, -0.4, 0]}>
        <coneGeometry args={[0.25, 0.7, 8, 1, true]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.03, 0]}>
        <sphereGeometry args={[0.02, 6, 6]} />
        <meshBasicMaterial color="#00D4FF" toneMapped={false} />
      </mesh>
    </group>
  );
}

function ScanMarkers({ phase, aisleZ }: { phase: number; aisleZ: number }) {
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const positions = useMemo(() => {
    const p: [number, number, number][] = [];
    for (let i = 0; i < 5; i++) {
      p.push([i * 1.4 - 2.8, 0.95, aisleZ]);
    }
    return p;
  }, [aisleZ]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const scanning = phase >= 0.30 && phase < 0.55;
    const scanT = scanning ? (phase - 0.30) / 0.25 : 0;
    const revealCount = scanning
      ? Math.floor(scanT * positions.length)
      : phase >= 0.55 && phase < 0.85
        ? positions.length
        : 0;
    const t = state.clock.elapsedTime;

    positions.forEach((pos, i) => {
      dummy.position.set(pos[0], pos[1], pos[2]);
      if (i < revealCount) {
        const pulse = 0.6 + 0.4 * Math.sin(t * Math.PI + i * 0.8);
        dummy.scale.setScalar(pulse);
      } else {
        dummy.scale.setScalar(0.001);
      }
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 5]}>
      <sphereGeometry args={[0.06, 6, 6]} />
      <meshBasicMaterial color="#00D4FF" toneMapped={false} />
    </instancedMesh>
  );
}

function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom luminanceThreshold={0.7} luminanceSmoothing={0.03} intensity={0.6} mipmapBlur />
      <Vignette eskil={false} offset={0.3} darkness={0.6} />
    </EffectComposer>
  );
}

function Scene({ phase, aisleIndex }: { phase: number; aisleIndex: number }) {
  const aisleZ = AISLE_ROWS[aisleIndex % AISLE_ROWS.length];
  return (
    <>
      <ambientLight intensity={0.5} />
      <GridFloor />
      <Racks />
      <ShelfDividers />
      <DockingStation phase={phase} />
      <Drone phase={phase} aisleZ={aisleZ} />
      <ScanMarkers phase={phase} aisleZ={aisleZ} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.2}
        maxPolarAngle={Math.PI / 3}
        minPolarAngle={Math.PI / 5}
      />
      <Effects />
    </>
  );
}

interface AgentDroneSceneProps {
  phase: number;
  aisleIndex: number;
}

export function AgentDroneScene({ phase, aisleIndex }: AgentDroneSceneProps) {
  const { ref: inViewRef, inView } = useInView({ threshold: 0.01, triggerOnce: true });

  return (
    <div ref={inViewRef} className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden border border-border bg-surface">
      {inView && (
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [6, 8, 8], fov: 42, near: 0.1, far: 100 }}
          gl={{ alpha: false, antialias: false, powerPreference: "high-performance" }}
          style={{ background: "#0A0A0B" }}
        >
          <Scene phase={phase} aisleIndex={aisleIndex} />
        </Canvas>
      )}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-md px-3 py-1.5 border border-border">
        <span className="w-1.5 h-1.5 rounded-full bg-status-green animate-pulse" />
        <span className="font-mono text-xs text-muted">Agent mission — demo</span>
      </div>
    </div>
  );
}

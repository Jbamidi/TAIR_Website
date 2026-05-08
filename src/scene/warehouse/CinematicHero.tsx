"use client";

import { useRef, useMemo, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Instances, Instance } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { useInView } from "react-intersection-observer";

/* ── Simple Grid Floor (no custom shader — uses GridHelper for performance) ── */
function GridFloor() {
  const grid = useMemo(() => {
    const g = new THREE.GridHelper(40, 40, "#1F1F23", "#131315");
    g.position.y = -0.01;
    return g;
  }, []);
  // @ts-ignore
  return <primitive object={grid} />;
}

/* ── Instanced Racks — MeshBasicMaterial (no lighting calc) ── */
function Racks() {
  const positions = useMemo(() => {
    const p: [number, number, number][] = [];
    const rowZ = [-7.5, -4.5, -1.5, 1.5, 4.5, 7.5];
    for (const z of rowZ) {
      for (let i = 0; i < 8; i++) {
        p.push([i * 1.5 - 5.25, 0.45, z]);
      }
    }
    return p;
  }, []);

  return (
    <Instances limit={48}>
      <boxGeometry args={[0.9, 0.9, 0.35]} />
      <meshBasicMaterial color="#1A1A1F" />
      {positions.map((pos, i) => (
        <Instance key={i} position={pos} />
      ))}
    </Instances>
  );
}

/* ── Rack positions for scan detection ── */
const RACK_POSITIONS: [number, number, number][] = (() => {
  const p: [number, number, number][] = [];
  const rowZ = [-7.5, -4.5, -1.5, 1.5, 4.5, 7.5];
  for (const z of rowZ) {
    for (let i = 0; i < 8; i++) {
      p.push([i * 1.5 - 5.25, 0.95, z]);
    }
  }
  return p;
})();

/* ── Serpentine path ── */
const WAYPOINTS: THREE.Vector3[] = (() => {
  const rowZ = [-7.5, -4.5, -1.5, 1.5, 4.5, 7.5];
  const pts: THREE.Vector3[] = [];
  for (let r = 0; r < rowZ.length; r++) {
    if (r % 2 === 0) {
      pts.push(new THREE.Vector3(-6.5, 1.0, rowZ[r]));
      pts.push(new THREE.Vector3(6.5, 1.0, rowZ[r]));
    } else {
      pts.push(new THREE.Vector3(6.5, 1.0, rowZ[r]));
      pts.push(new THREE.Vector3(-6.5, 1.0, rowZ[r]));
    }
  }
  pts.push(pts[0].clone());
  return pts;
})();

const DRONE_CURVE = new THREE.CatmullRomCurve3(WAYPOINTS, true, "catmullrom", 0.3);

/* ── Drone — recognizable quadcopter from basic geometry ── */
function Drone({ onScan }: { onScan: (pos: [number, number, number]) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const rotorRefs = useRef<THREE.Mesh[]>([]);
  const speed = 1 / 25;
  const prevT = useRef(0);

  // Arm positions (4 diagonal arms)
  const arms = useMemo(() => [
    { pos: [0.18, 0, 0.18] as [number, number, number], rot: Math.PI / 4 },
    { pos: [-0.18, 0, 0.18] as [number, number, number], rot: -Math.PI / 4 },
    { pos: [0.18, 0, -0.18] as [number, number, number], rot: Math.PI / 4 },
    { pos: [-0.18, 0, -0.18] as [number, number, number], rot: -Math.PI / 4 },
  ], []);

  useFrame((state) => {
    const t = (state.clock.elapsedTime * speed) % 1;
    const pos = DRONE_CURVE.getPointAt(t);

    if (groupRef.current) {
      groupRef.current.position.copy(pos);

      // Face movement direction
      const lookT = (t + 0.001) % 1;
      const ahead = DRONE_CURVE.getPointAt(lookT);
      const dir = ahead.clone().sub(pos).normalize();
      const angle = Math.atan2(dir.x, dir.z);
      groupRef.current.rotation.y = angle;

      // Subtle hover bob
      groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 3) * 0.02;
    }

    // Spin rotors
    rotorRefs.current.forEach((rotor) => {
      if (rotor) rotor.rotation.y += 0.8;
    });

    for (const rp of RACK_POSITIONS) {
      const dx = pos.x - rp[0];
      const dz = pos.z - rp[2];
      if (dx * dx + dz * dz < 4) onScan(rp);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central body */}
      <mesh>
        <boxGeometry args={[0.16, 0.04, 0.16]} />
        <meshBasicMaterial color="#00D4FF" toneMapped={false} />
      </mesh>

      {/* 4 Arms + Rotors */}
      {arms.map((arm, i) => (
        <group key={i} position={arm.pos}>
          {/* Arm */}
          <mesh rotation={[0, arm.rot, 0]}>
            <boxGeometry args={[0.22, 0.02, 0.025]} />
            <meshBasicMaterial color="#0099BB" toneMapped={false} />
          </mesh>
          {/* Motor hub */}
          <mesh position={[0, 0.015, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.025, 6]} />
            <meshBasicMaterial color="#00D4FF" toneMapped={false} />
          </mesh>
          {/* Rotor disc (spinning) */}
          <mesh
            position={[0, 0.03, 0]}
            ref={(el) => { if (el) rotorRefs.current[i] = el; }}
          >
            <cylinderGeometry args={[0.07, 0.07, 0.005, 8]} />
            <meshBasicMaterial color="#00D4FF" transparent opacity={0.3} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Scan beam (cone of light pointing down) */}
      <mesh position={[0, -0.25, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.15, 0.5, 8, 1, true]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.08} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Small downward glow dot */}
      <mesh position={[0, -0.03, 0]}>
        <sphereGeometry args={[0.02, 6, 6]} />
        <meshBasicMaterial color="#00D4FF" toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ── Scan Markers — simple instanced dots ── */
function ScanMarkers({ scanned }: { scanned: Set<string> }) {
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const positions = useMemo(
    () => RACK_POSITIONS.filter((p) => scanned.has(p.join(","))),
    [scanned]
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    positions.forEach((pos, i) => {
      dummy.position.set(pos[0], pos[1], pos[2]);
      const pulse = 0.7 + 0.3 * Math.sin(t * Math.PI + i * 0.7);
      dummy.scale.setScalar(pulse);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.count = positions.length;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 48]}>
      <sphereGeometry args={[0.06, 6, 6]} />
      <meshBasicMaterial color="#00D4FF" toneMapped={false} />
    </instancedMesh>
  );
}

/* ── Camera Rig — Lissajous drift + scroll dolly ── */
function CameraRig({ scrollProgress }: { scrollProgress: number }) {
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const driftX = 0.3 * Math.sin(t * (2 * Math.PI / 30));
    const driftY = 0.3 * Math.cos(t * (2 * Math.PI / 30) * 1.5);
    const sp = Math.min(scrollProgress * 2, 1);
    const baseY = THREE.MathUtils.lerp(12, 6, sp);
    const baseZ = THREE.MathUtils.lerp(8, 3, sp);
    const lookY = THREE.MathUtils.lerp(0, -2, sp);

    state.camera.position.set(driftX, baseY + driftY, baseZ);
    state.camera.lookAt(0, lookY, 0);
  });

  return null;
}

/* ── Lightweight effects — bloom only, no ChromaticAberration ── */
function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom luminanceThreshold={0.7} luminanceSmoothing={0.03} intensity={0.6} mipmapBlur />
      <Vignette eskil={false} offset={0.3} darkness={0.6} />
    </EffectComposer>
  );
}

/* ── Scene ── */
function Scene({ scrollProgress }: { scrollProgress: number }) {
  const [scanned, setScanned] = useState<Set<string>>(new Set());

  const handleScan = useCallback((pos: [number, number, number]) => {
    const key = pos.join(",");
    setScanned((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <GridFloor />
      <Racks />
      <Drone onScan={handleScan} />
      <ScanMarkers scanned={scanned} />
      <CameraRig scrollProgress={scrollProgress} />
      <Effects />
    </>
  );
}

/* ── Exported Component ── */
export function CinematicHero({ scrollProgress = 0 }: { scrollProgress?: number }) {
  const { ref: inViewRef, inView } = useInView({ threshold: 0.05 });

  return (
    <div ref={inViewRef} className="w-full h-full absolute inset-0">
      {inView && (
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 12, 8], fov: 45, near: 0.1, far: 100 }}
          gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
          style={{ background: "transparent" }}
          aria-label="Interactive warehouse scan visualization"
        >
          <Scene scrollProgress={scrollProgress} />
        </Canvas>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useMemo, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Thermometer, ScanBarcode, Box, LayoutGrid } from "lucide-react";
import { MonoText } from "@/components/ui";
import { fadeInUp, staggerContainer, viewportOptions } from "@/lib/animations";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import type { LucideIcon } from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   Vision mode metadata
   ════════════════════════════════════════════════════════════════ */

interface VisionMode {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  quadrantLabel: string;
}

const VISION_MODES: VisionMode[] = [
  { id: "lidar", label: "3D LiDAR", icon: Box, description: "Point cloud builds a centimeter-accurate digital twin of the facility, mapping every rack and aisle in real time.", quadrantLabel: "LiDAR SLAM" },
  { id: "camera", label: "RGB Camera", icon: Camera, description: "High-res optical feed identifies LPNs, UPCs, text, lot codes, and expiration dates on every pallet.", quadrantLabel: "RGB 4K" },
  { id: "thermal", label: "Thermal", icon: Thermometer, description: "Infrared imaging detects temperature anomalies in cold chain storage, flagging spoilage risk before it spreads.", quadrantLabel: "Thermal IR" },
  { id: "barcode", label: "Barcode / RFID", icon: ScanBarcode, description: "Reads barcodes visually and RFID tags through packaging — no line-of-sight needed, even through shrink-wrap.", quadrantLabel: "RFID + Barcode" },
];

/* ════════════════════════════════════════════════════════════════
   Seeded PRNG — identical warehouse in every view
   ════════════════════════════════════════════════════════════════ */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ════════════════════════════════════════════════════════════════
   Point cloud data model (LiDAR, Thermal, RFID views)
   ════════════════════════════════════════════════════════════════ */

type PointKind = "floor" | "upright" | "beam" | "shelf" | "item" | "wall" | "ceiling" | "rfid_ring";

interface WPt {
  x: number; y: number; z: number;
  kind: PointKind; temp: number; tagged: boolean; hue: number;
}

const RACK_ROWS_Z = [-5.5, -3.3, -1.1, 1.1, 3.3, 5.5];
const BAY_CENTERS_X = [-7.5, -3.75, 0, 3.75, 7.5];
const SHELF_HEIGHTS = [0.06, 1.5, 3.0];
const RACK_H = 4.2, BAY_W = 2.8, RACK_D = 0.7;

function buildWarehouse(seed = 42): WPt[] {
  const rng = mulberry32(seed);
  const pts: WPt[] = [];
  const jit = (s: number) => (rng() - 0.5) * s;
  const push = (x: number, y: number, z: number, kind: PointKind, temp = 20, tagged = false, hue = 0) => {
    pts.push({ x, y, z, kind, temp, tagged, hue });
  };

  for (let i = 0; i < 3500; i++) push((rng() - 0.5) * 22, rng() * 0.04, (rng() - 0.5) * 15, "floor");

  for (const rz of RACK_ROWS_Z) {
    const coldZone = Math.abs(rz) > 4;
    const zoneTemp = coldZone ? -15 + rng() * 10 : 18 + rng() * 7;
    for (const bx of BAY_CENTERS_X) {
      const x0 = bx - BAY_W / 2, z0 = rz - RACK_D / 2;
      const bayTemp = zoneTemp + (rng() - 0.5) * 5, bayHue = rng();
      for (const ux of [0, BAY_W]) for (const uz of [0, RACK_D])
        for (let y = 0; y < RACK_H; y += 0.13) push(x0 + ux + jit(0.04), y, z0 + uz + jit(0.04), "upright", bayTemp, false, bayHue);
      for (let dx = 0; dx < BAY_W; dx += 0.15) {
        push(x0 + dx + jit(0.04), RACK_H + jit(0.03), z0 + jit(0.03), "beam", bayTemp, false, bayHue);
        push(x0 + dx + jit(0.04), RACK_H + jit(0.03), z0 + RACK_D + jit(0.03), "beam", bayTemp, false, bayHue);
      }
      for (const sy of SHELF_HEIGHTS) {
        for (let dx = 0; dx < BAY_W; dx += 0.28) for (let dz = 0; dz < RACK_D; dz += 0.28)
          push(x0 + dx + jit(0.08), sy + jit(0.02), z0 + dz + jit(0.08), "shelf", bayTemp, false, bayHue);
        if (rng() > 0.35) {
          const iw = 0.8 + rng() * 1.4, ih = 0.3 + rng() * 0.8;
          const ix = x0 + 0.15 + rng() * Math.max(0.1, BAY_W - iw - 0.3);
          const itemTemp = bayTemp + (rng() - 0.5) * 4, itemTagged = rng() > 0.28, itemHue = bayHue + (rng() - 0.5) * 0.15;
          const itemCx = ix + iw / 2;
          for (let dx = 0; dx < iw; dx += 0.22) for (let dy = 0; dy < ih; dy += 0.22) for (let dz = 0; dz < RACK_D * 0.7; dz += 0.22)
            push(ix + dx + jit(0.06), sy + 0.05 + dy, z0 + 0.08 + dz + jit(0.06), "item", itemTemp, itemTagged, itemHue);
          if (itemTagged) for (const rad of [0.5, 1.0, 1.5]) {
            const n = Math.floor(rad * 14);
            for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / n) push(itemCx + Math.cos(a) * rad, sy + 0.3, rz + Math.sin(a) * rad, "rfid_ring", 0, true, 0);
          }
        }
      }
    }
  }
  for (let i = 0; i < 400; i++) {
    const wy = rng() * 5.5, side = Math.floor(rng() * 4);
    if (side === 0) push(-11 + jit(0.06), wy, (rng() - 0.5) * 15, "wall");
    else if (side === 1) push(11 + jit(0.06), wy, (rng() - 0.5) * 15, "wall");
    else if (side === 2) push((rng() - 0.5) * 22, wy, -7.5 + jit(0.06), "wall");
    else push((rng() - 0.5) * 22, wy, 7.5 + jit(0.06), "wall");
  }
  for (const cz of [-6, -2, 2, 6]) for (let cx = -11; cx < 11; cx += 0.22) push(cx + jit(0.06), 5.3 + jit(0.1), cz + jit(0.12), "ceiling");
  for (const cx of [-8, -4, 0, 4, 8]) for (let cz = -7.5; cz < 7.5; cz += 0.25) push(cx + jit(0.06), 5.3 + jit(0.1), cz + jit(0.12), "ceiling");
  return pts;
}

/* ════════════════════════════════════════════════════════════════
   Color functions (point-cloud views only)
   ════════════════════════════════════════════════════════════════ */

type ColorFn = (p: WPt) => [number, number, number];
const _c = new THREE.Color();

const colorLidar: ColorFn = (p) => {
  if (p.kind === "rfid_ring") return [0.008, 0.008, 0.008];
  const t = Math.max(0, Math.min(1, p.y / 5.2));
  _c.setHSL((1 - t) * 0.667, 0.88, 0.38 + t * 0.18);
  return [_c.r, _c.g, _c.b];
};

const colorThermal: ColorFn = (p) => {
  if (p.kind === "rfid_ring") return [0.008, 0.008, 0.008];
  if (p.kind === "floor" || p.kind === "wall" || p.kind === "ceiling") return [0.04, 0.015, 0.07];
  if (p.kind === "upright" || p.kind === "beam" || p.kind === "shelf") { _c.setHSL(0.75, 0.25, 0.12); return [_c.r, _c.g, _c.b]; }
  const t = Math.max(0, Math.min(1, (p.temp + 20) / 50));
  _c.setHSL((1 - t) * 0.667, 0.92, 0.35 + t * 0.2);
  return [_c.r, _c.g, _c.b];
};

const colorRfid: ColorFn = (p) => {
  if (p.kind === "rfid_ring") return [0.06, 0.72, 0.50];
  if (p.kind === "floor") return [0.025, 0.04, 0.025];
  if (p.kind === "wall" || p.kind === "ceiling") return [0.05, 0.06, 0.05];
  if (p.kind === "upright" || p.kind === "beam" || p.kind === "shelf") return [0.09, 0.10, 0.09];
  if (p.kind === "item") return p.tagged ? [0.06, 0.72, 0.50] : [0.96, 0.62, 0.04];
  return [0.06, 0.06, 0.06];
};

/* ════════════════════════════════════════════════════════════════
   Three.js shared components
   ════════════════════════════════════════════════════════════════ */

function Points3D({ colorFn, progressRef }: { colorFn: ColorFn; progressRef: React.RefObject<number> }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const { geometry, count } = useMemo(() => {
    const pts = buildWarehouse(42);
    pts.sort((a, b) => (a.x * a.x + a.z * a.z) - (b.x * b.x + b.z * b.z));
    const n = pts.length;
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = pts[i].x; pos[i * 3 + 1] = pts[i].y; pos[i * 3 + 2] = pts[i].z;
      const [r, g, b] = colorFn(pts[i]); col[i * 3] = r; col[i * 3 + 1] = g; col[i * 3 + 2] = b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return { geometry: geo, count: n };
  }, [colorFn]);
  useFrame(() => { if (pointsRef.current) pointsRef.current.geometry.setDrawRange(0, Math.floor((progressRef.current ?? 0) * count)); });
  return <points ref={pointsRef} geometry={geometry}><pointsMaterial size={0.07} vertexColors sizeAttenuation transparent opacity={0.88} /></points>;
}

function SyncCamera({ interactive }: { interactive: boolean }) {
  useFrame(({ camera }) => {
    if (interactive) return;
    const angle = performance.now() / 1000 * 0.08;
    camera.position.set(Math.cos(angle) * 18, 11, Math.sin(angle) * 18);
    camera.lookAt(0, 1.8, 0);
  });
  return interactive ? (
    <OrbitControls autoRotate autoRotateSpeed={0.4} target={[0, 1.8, 0]} minDistance={8} maxDistance={30} minPolarAngle={0.3} maxPolarAngle={Math.PI / 2.3} />
  ) : null;
}

/* ════════════════════════════════════════════════════════════════
   Point-cloud scene wrapper (LiDAR / Thermal / RFID)
   ════════════════════════════════════════════════════════════════ */

function Scene3D({ colorFn, scanProgress, interactive, bgColor, sceneExtra, children }: {
  colorFn: ColorFn; scanProgress: number; interactive: boolean; bgColor: string;
  sceneExtra?: React.ReactNode; children: React.ReactNode;
}) {
  const progressRef = useRef(scanProgress);
  progressRef.current = scanProgress;
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: bgColor, pointerEvents: interactive ? "auto" : "none" }}>
      <Suspense fallback={<div className="w-full h-full" style={{ background: bgColor }} />}>
        <Canvas camera={{ position: [14, 11, 14], fov: 42, near: 0.1, far: 100 }} gl={{ antialias: false, alpha: false }} dpr={interactive ? [1, 2] : [0.5, 1]} style={{ background: bgColor }}>
          <fog attach="fog" args={[bgColor, 18, 40]} />
          <Points3D colorFn={colorFn} progressRef={progressRef} />
          {sceneExtra}
          <SyncCamera interactive={interactive} />
        </Canvas>
      </Suspense>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Thermal: floating temperature labels (Html in 3D space)
   ════════════════════════════════════════════════════════════════ */

const THERMAL_ZONES = [
  { pos: [-7.5, 5.5, -5.5] as [number, number, number], temp: -18.3, zone: "Cold Store A" },
  { pos: [3.75, 5.5, -5.5] as [number, number, number], temp: -12.1, zone: "Cold Store B" },
  { pos: [7.5, 5.5, -3.3] as [number, number, number], temp: -15.7, zone: "Freezer" },
  { pos: [-3.75, 5.0, -1.1] as [number, number, number], temp: 22.4, zone: "Ambient Bay" },
  { pos: [3.75, 5.0, 1.1] as [number, number, number], temp: 21.1, zone: "Standard" },
  { pos: [-7.5, 5.0, 3.3] as [number, number, number], temp: 24.8, zone: "Returns" },
  { pos: [0, 5.5, 5.5] as [number, number, number], temp: 3.2, zone: "Chiller" },
  { pos: [7.5, 5.5, 5.5] as [number, number, number], temp: -17.0, zone: "Cold Store C" },
];

function tempHue(t: number): number { return (1 - Math.max(0, Math.min(1, (t + 20) / 50))) * 240; }

function ThermalLabels({ progress }: { progress: number }) {
  return (
    <>
      {THERMAL_ZONES.map((l, i) => {
        if (progress < (i + 1) / (THERMAL_ZONES.length + 2)) return null;
        const hue = tempHue(l.temp);
        const color = `hsl(${hue}, 90%, 55%)`;
        const bg = `hsla(${hue}, 60%, 15%, 0.85)`;
        return (
          <Html key={i} position={l.pos} center zIndexRange={[10, 0]}>
            <div className="pointer-events-none select-none" style={{ whiteSpace: "nowrap" }}>
              {/* Connecting line down to the rack */}
              <div style={{ width: 1, height: 10, margin: "0 auto", background: `linear-gradient(to bottom, ${color}, transparent)` }} />
              <div style={{
                background: bg, borderRadius: 5, padding: "2px 6px",
                border: `1px solid hsla(${hue}, 80%, 40%, 0.5)`,
                backdropFilter: "blur(4px)",
                textAlign: "center",
              }}>
                <div style={{ color, fontSize: 11, fontWeight: "bold", fontFamily: "monospace", lineHeight: 1 }}>
                  {l.temp > 0 ? "+" : ""}{l.temp.toFixed(1)}°C
                </div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 7, fontFamily: "monospace", marginTop: 1, letterSpacing: 0.5 }}>
                  {l.zone.toUpperCase()}
                </div>
              </div>
            </div>
          </Html>
        );
      })}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   RFID: info popup cards with barcodes (Html in 3D space)
   ════════════════════════════════════════════════════════════════ */

const RFID_CARDS = [
  { pos: [-3.75, 4.0, -3.3] as [number, number, number], rack: "B-02", sku: "PHARMA-2104", qty: 14, lot: "L2026-0412", epc: "E280-1149-4F2A" },
  { pos: [3.75, 5.0, 1.1] as [number, number, number], rack: "D-04", sku: "FOOD-ORG-1120", qty: 31, lot: "L2026-0518", epc: "E280-9312-C8D4" },
  { pos: [-7.5, 3.0, 5.5] as [number, number, number], rack: "F-01", sku: "ELEC-BATT-512", qty: 22, lot: "L2025-1103", epc: "E280-5501-7D0E" },
  { pos: [7.5, 4.5, -5.5] as [number, number, number], rack: "A-05", sku: "COLD-CH-0891", qty: 8, lot: "L2026-0320", epc: "E280-0039-B91C" },
];

function RfidPopups({ progress }: { progress: number }) {
  const barWidths = useMemo(() =>
    RFID_CARDS.map(() => Array.from({ length: 50 }, (_, j) => j % 7 === 0 ? 2.4 : j % 3 === 0 ? 1.6 : j % 5 === 0 ? 1.1 : 0.7)), []);
  return (
    <>
      {RFID_CARDS.map((c, i) => {
        if (progress < 0.25 + i * 0.18) return null;
        return (
          <Html key={i} position={c.pos} center zIndexRange={[10, 0]}>
            <div className="pointer-events-none select-none" style={{ width: 120 }}>
              <div style={{ width: 1, height: 8, margin: "0 auto", background: "linear-gradient(to bottom, #10B981, transparent)" }} />
              <div style={{
                background: "rgba(0,0,0,0.88)", border: "1px solid rgba(16,185,129,0.3)",
                borderRadius: 6, padding: "4px 6px", backdropFilter: "blur(6px)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#10B981", fontSize: 9, fontWeight: "bold", fontFamily: "monospace" }}>{c.rack}</span>
                  <span style={{ color: "#10B981", fontSize: 6, fontFamily: "monospace", background: "rgba(16,185,129,0.15)", padding: "1px 4px", borderRadius: 3 }}>TAGGED</span>
                </div>
                <div style={{ color: "#e5e5e5", fontSize: 8, fontFamily: "monospace", marginTop: 2 }}>{c.sku}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                  <span style={{ color: "#888", fontSize: 7, fontFamily: "monospace" }}>QTY: {c.qty}</span>
                  <span style={{ color: "#888", fontSize: 7, fontFamily: "monospace" }}>LOT: {c.lot}</span>
                </div>
                <div style={{ color: "#555", fontSize: 6, fontFamily: "monospace", marginTop: 1 }}>EPC: {c.epc}</div>
                <svg viewBox="0 0 140 18" style={{ width: "100%", marginTop: 3 }}>
                  {barWidths[i].map((w, j) => <rect key={j} x={j * 2.8} y="0" width={w} height="18" fill="#10B981" opacity={0.8} />)}
                </svg>
              </div>
            </div>
          </Html>
        );
      })}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   RGB Camera: solid mesh-based warehouse (InstancedMesh)
   ════════════════════════════════════════════════════════════════ */

function CameraMeshScene({ progressRef }: { progressRef: React.RefObject<number> }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.75, metalness: 0.05 }), []);

  const { totalCount, matrices, colors } = useMemo(() => {
    const rng = mulberry32(42);
    const ms: THREE.Matrix4[] = [];
    const cs: THREE.Color[] = [];
    const ds: number[] = [];
    const tmpM = new THREE.Matrix4(), tmpP = new THREE.Vector3(), tmpQ = new THREE.Quaternion(), tmpS = new THREE.Vector3();

    function add(p: [number, number, number], s: [number, number, number], hex: string) {
      tmpP.set(...p); tmpS.set(...s); tmpM.compose(tmpP, tmpQ, tmpS);
      ms.push(tmpM.clone()); cs.push(new THREE.Color(hex)); ds.push(p[0] * p[0] + p[2] * p[2]);
    }

    add([0, -0.05, 0], [24, 0.1, 16], "#606068");

    for (const rz of RACK_ROWS_Z) {
      for (const bx of BAY_CENTERS_X) {
        const x0 = bx - BAY_W / 2, z0 = rz - RACK_D / 2;
        for (const ux of [0, BAY_W]) for (const uz of [0, RACK_D])
          add([x0 + ux, RACK_H / 2, z0 + uz], [0.06, RACK_H, 0.06], "#8a8585");
        add([bx, RACK_H, z0 + 0.02], [BAY_W, 0.05, 0.05], "#8a8585");
        add([bx, RACK_H, z0 + RACK_D - 0.02], [BAY_W, 0.05, 0.05], "#8a8585");
        for (const sy of SHELF_HEIGHTS) {
          add([bx, sy, rz], [BAY_W, 0.04, RACK_D], "#7a7878");
          if (rng() > 0.35) {
            const iw = 0.8 + rng() * 1.2, ih = 0.35 + rng() * 0.65, id = RACK_D * 0.6;
            const ix = x0 + 0.2 + rng() * Math.max(0.1, BAY_W - iw - 0.4);
            const type = rng();
            const hex = type < 0.35 ? "#b8946a" : type < 0.55 ? "#c4a57d" : type < 0.70 ? "#d4d4d4" : type < 0.82 ? "#6a8fa3" : type < 0.92 ? "#7a9a6a" : "#a06050";
            add([ix + iw / 2, sy + ih / 2 + 0.02, rz], [iw, ih, id], hex);
          }
        }
      }
    }

    const idx = Array.from({ length: ms.length }, (_, i) => i);
    idx.sort((a, b) => ds[a] - ds[b]);
    return { totalCount: ms.length, matrices: idx.map(i => ms[i]), colors: idx.map(i => cs[i]) };
  }, []);

  useEffect(() => {
    const m = meshRef.current; if (!m) return;
    for (let i = 0; i < totalCount; i++) { m.setMatrixAt(i, matrices[i]); m.setColorAt(i, colors[i]); }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.count = 0;
  }, [totalCount, matrices, colors]);

  useFrame(() => { if (meshRef.current) meshRef.current.count = Math.floor((progressRef.current ?? 0) * totalCount); });

  return <instancedMesh ref={meshRef} args={[geo, mat, totalCount]} />;
}

/* ════════════════════════════════════════════════════════════════
   Per-view wrappers
   ════════════════════════════════════════════════════════════════ */

const HUD = "absolute font-mono text-[10px] z-20 pointer-events-none";

function LidarView({ scanProgress, interactive = false }: { scanProgress: number; interactive?: boolean }) {
  const pts = Math.floor(scanProgress * 15000);
  return (
    <Scene3D colorFn={colorLidar} scanProgress={scanProgress} interactive={interactive} bgColor="#020204">
      <div className={`${HUD} top-3 left-3 text-accent/70`}><div>LiDAR SLAM</div><div className="text-muted mt-0.5">905nm · 300k pts/s · ±2cm</div></div>
      <div className={`${HUD} top-3 right-3 text-muted`}>{pts.toLocaleString()} pts</div>
      <div className={`${HUD} bottom-3 left-3 text-accent/50`}>Building digital twin…</div>
    </Scene3D>
  );
}

function CameraView({ scanProgress, interactive = false }: { scanProgress: number; interactive?: boolean }) {
  const progressRef = useRef(scanProgress);
  progressRef.current = scanProgress;
  const bays = Math.floor(scanProgress * 30);
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "#0a0c0e", pointerEvents: interactive ? "auto" : "none" }}>
      <Suspense fallback={<div className="w-full h-full" style={{ background: "#0a0c0e" }} />}>
        <Canvas camera={{ position: [14, 11, 14], fov: 42, near: 0.1, far: 100 }} gl={{ antialias: true, alpha: false }} dpr={interactive ? [1, 2] : [0.5, 1]} style={{ background: "#0a0c0e" }}>
          <fog attach="fog" args={["#0a0c0e", 22, 42]} />
          <ambientLight intensity={0.35} />
          <directionalLight position={[10, 14, 6]} intensity={0.8} />
          <directionalLight position={[-8, 8, -4]} intensity={0.25} color="#b0c4de" />
          <pointLight position={[0, 5, 0]} intensity={0.15} color="#ffe8c0" distance={20} />
          <CameraMeshScene progressRef={progressRef} />
          <SyncCamera interactive={interactive} />
        </Canvas>
      </Suspense>
      {/* Camera lens effects */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{ boxShadow: "inset 0 0 90px 20px rgba(0,0,0,0.45)" }} />
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-[0.06]" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="33.3" y1="0" x2="33.3" y2="100" stroke="white" strokeWidth="0.15" />
        <line x1="66.6" y1="0" x2="66.6" y2="100" stroke="white" strokeWidth="0.15" />
        <line x1="0" y1="33.3" x2="100" y2="33.3" stroke="white" strokeWidth="0.15" />
        <line x1="0" y1="66.6" x2="100" y2="66.6" stroke="white" strokeWidth="0.15" />
      </svg>
      <div className={`${HUD} top-3 left-3 text-accent/70`}><div>REC ● RGB 4K</div><div className="text-muted mt-0.5">ISO 800 · f/2.8 · 1/120s</div></div>
      <div className={`${HUD} top-3 right-3 text-muted`}>{bays}/30 bays</div>
      <div className={`${HUD} bottom-3 left-3 text-muted/50`}>ALT: 4.2m · HDG: 087°</div>
    </div>
  );
}

function ThermalView({ scanProgress, interactive = false }: { scanProgress: number; interactive?: boolean }) {
  const zones = Math.floor(scanProgress * 30);
  return (
    <Scene3D colorFn={colorThermal} scanProgress={scanProgress} interactive={interactive} bgColor="#06020A"
      sceneExtra={<ThermalLabels progress={scanProgress} />}
    >
      <div className={`${HUD} top-3 left-3 text-red-400/70`}><div>THERMAL IR</div><div className="text-muted mt-0.5">LWIR 8–14μm · ±0.3°C</div></div>
      <div className={`${HUD} top-3 right-3 text-muted`}>{zones}/30 zones</div>
      <div className={`${HUD} bottom-3 left-3 text-muted/50`}>ALT: 4.2m · AMB: 18.2°C</div>
    </Scene3D>
  );
}

function RfidView({ scanProgress, interactive = false }: { scanProgress: number; interactive?: boolean }) {
  const tags = Math.floor(scanProgress * 22);
  return (
    <Scene3D colorFn={colorRfid} scanProgress={scanProgress} interactive={interactive} bgColor="#020806"
      sceneExtra={<RfidPopups progress={scanProgress} />}
    >
      <div className={`${HUD} top-3 left-3 text-emerald-400/70`}><div>RFID + BARCODE</div><div className="text-muted mt-0.5">UHF 860–960 MHz · read-through</div></div>
      <div className={`${HUD} top-3 right-3 text-muted`}>{tags}/22 tags</div>
      <div className={`${HUD} bottom-3 left-3 text-muted/50`}>ALT: 4.2m · RSSI: −38 dBm</div>
    </Scene3D>
  );
}

/* ════════════════════════════════════════════════════════════════
   View router + Crosshair Split + Tab bar
   ════════════════════════════════════════════════════════════════ */

function renderView(index: number, scanProgress: number, interactive: boolean) {
  switch (index) {
    case 0: return <LidarView scanProgress={scanProgress} interactive={interactive} />;
    case 1: return <CameraView scanProgress={scanProgress} interactive={interactive} />;
    case 2: return <ThermalView scanProgress={scanProgress} interactive={interactive} />;
    case 3: return <RfidView scanProgress={scanProgress} interactive={interactive} />;
    default: return null;
  }
}

const QUADRANT_POS: Record<string, string>[] = [
  { top: "8px", left: "8px" },
  { top: "8px", right: "8px" },
  { bottom: "8px", left: "8px" },
  { bottom: "8px", right: "8px" },
];

function CrosshairSplit({ scanProgress }: { scanProgress: number }) {
  const [crossX, setCrossX] = useState(50);
  const [crossY, setCrossY] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCrossX(Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100)));
    setCrossY(Math.max(10, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100)));
  }, [dragging]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerUp = useCallback(() => setDragging(false), []);

  const clips = [
    `inset(0 ${100 - crossX}% ${100 - crossY}% 0)`,
    `inset(0 0 ${100 - crossY}% ${crossX}%)`,
    `inset(${crossY}% ${100 - crossX}% 0 0)`,
    `inset(${crossY}% 0 0 ${crossX}%)`,
  ];

  return (
    <div ref={containerRef} className="absolute inset-0" onPointerMove={handlePointerMove} style={{ cursor: dragging ? "grabbing" : "default" }}>
      {VISION_MODES.map((m, i) => (
        <div key={m.id} className="absolute inset-0" style={{ clipPath: clips[i], pointerEvents: "none" }}>
          {renderView(i, scanProgress, false)}
        </div>
      ))}
      {VISION_MODES.map((m, i) => (
        <div key={`lbl-${m.id}`} className="absolute z-30 pointer-events-none" style={QUADRANT_POS[i]}>
          <span className="bg-background/70 backdrop-blur-sm rounded px-1.5 py-0.5 font-mono text-[9px] text-accent/80 border border-accent/15">{m.quadrantLabel}</span>
        </div>
      ))}
      <div className="absolute top-0 bottom-0 w-px z-30 pointer-events-none" style={{ left: `${crossX}%`, background: "rgba(0,212,255,0.3)", boxShadow: "0 0 8px rgba(0,212,255,0.2)" }} />
      <div className="absolute left-0 right-0 h-px z-30 pointer-events-none" style={{ top: `${crossY}%`, background: "rgba(0,212,255,0.3)", boxShadow: "0 0 8px rgba(0,212,255,0.2)" }} />
      <div
        className="absolute z-40 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-accent/60 bg-background/50 backdrop-blur-sm"
        style={{ left: `${crossX}%`, top: `${crossY}%`, cursor: dragging ? "grabbing" : "grab", boxShadow: "0 0 12px rgba(0,212,255,0.4)" }}
        onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}
      >
        <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-accent" />
      </div>
    </div>
  );
}

function TabButton({ mode, active, onClick }: { mode: VisionMode; active: boolean; onClick: () => void }) {
  const Icon = mode.icon;
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
        active ? "bg-accent/10 border border-accent/30 text-accent" : "bg-surface border border-border text-muted hover:text-secondary hover:border-secondary/30"
      }`}
    >
      <Icon size={14} strokeWidth={1.5} />
      <span className="hidden sm:inline">{mode.label}</span>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════
   Main export
   ════════════════════════════════════════════════════════════════ */

export function DroneVision() {
  const [viewMode, setViewMode] = useState<"split" | "pov">("split");
  const [activePov, setActivePov] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const resetKey = viewMode === "pov" ? activePov : -1;

  useEffect(() => {
    startRef.current = null;
    const tick = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min(((ts - startRef.current) / 1000) / 6, 1);
      setScanProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [resetKey]);

  const handleTabClick = (i: number) => { setActivePov(i); setViewMode("pov"); };
  const activeMode = VISION_MODES[activePov];

  return (
    <section className="py-32 px-6">
      <motion.div className="max-w-6xl mx-auto" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportOptions}>
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <MonoText className="text-secondary text-xs uppercase tracking-widest">// drone pov</MonoText>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold text-foreground tracking-tight">Multi-sensor fusion</h2>
          <p className="mt-4 text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
            Four sensor modalities feed a single reconciliation engine. Drag the crosshair or click a sensor to explore.
          </p>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <button onClick={() => setViewMode("split")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                viewMode === "split" ? "bg-accent/10 border border-accent/30 text-accent" : "bg-surface border border-border text-muted hover:text-secondary hover:border-secondary/30"
              }`}
            >
              <LayoutGrid size={14} strokeWidth={1.5} />
              <span className="hidden sm:inline">Split</span>
            </button>
            {VISION_MODES.map((m, i) => (
              <TabButton key={m.id} mode={m} active={viewMode === "pov" && activePov === i} onClick={() => handleTabClick(i)} />
            ))}
          </div>
          <div className="relative w-full aspect-[5/3] max-h-[520px] rounded-xl overflow-hidden border border-border bg-[#08080C]">
            <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-accent/25 z-20 pointer-events-none" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-accent/25 z-20 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-accent/25 z-20 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-accent/25 z-20 pointer-events-none" />
            {viewMode === "split" ? (
              <CrosshairSplit scanProgress={scanProgress} />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={activeMode.id} className="absolute inset-0"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                >
                  {renderView(activePov, scanProgress, true)}
                </motion.div>
              </AnimatePresence>
            )}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-status-red animate-pulse" />
              <span className="font-mono text-[10px] text-muted">REC</span>
            </div>
          </div>
          <div className="mt-6 text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={viewMode === "split" ? "split" : activeMode.id}
                className="text-secondary text-sm leading-relaxed max-w-lg mx-auto"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
              >
                {viewMode === "split"
                  ? "Drag the crosshair to compare all four sensor feeds simultaneously across the same warehouse scene."
                  : activeMode.description}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

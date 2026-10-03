import React, { useEffect, useRef, useState } from 'react';
import { QuantumState } from '../quantum/quantumEngine';
import { RotateCcw } from 'lucide-react';

interface BlochSphereCanvasProps {
  state: QuantumState;
  showTrajectory?: boolean;
}

export interface TrajectoryPoint {
  x: number;
  y: number;
  z: number;
  phase: number;
  isKeyframe?: boolean;
}

/**
 * Calculates a continuous, subtle color shift based on the relative phase φ ∈ (-π, π].
 * - φ = 0 rad (e.g. |+⟩, in-phase): Luminous cyan-azure (hue ~195°)
 * - φ = +π/2 rad (e.g. |+i⟩): Electric indigo-violet (hue ~262°)
 * - φ = ±π rad (e.g. |−⟩, opposite phase): Radiant rose-magenta (hue ~330°)
 * - φ = -π/2 rad (e.g. |−i⟩): Vibrant spring emerald (hue ~130°)
 */
export function getPhaseColor(phase: number, alpha = 0.9): string {
  const deg = (phase * 180) / Math.PI; // -180 to 180
  const hue = (195 + deg * 0.75 + 360) % 360;
  return `hsla(${hue.toFixed(1)}, 92%, 64%, ${alpha})`;
}

export const BlochSphereCanvas: React.FC<BlochSphereCanvasProps> = ({
  state,
  showTrajectory = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotY, setRotY] = useState(0.65); // Horizontal rotation in radians
  const [rotX, setRotX] = useState(0.42); // Vertical rotation in radians
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // Persistent trajectory points across operations
  const trajectoryRef = useRef<TrajectoryPoint[]>([]);

  // Smooth movement animation state
  const currentVectorRef = useRef<TrajectoryPoint>({
    x: 0,
    y: 0,
    z: 1,
    phase: 0,
    isKeyframe: true,
  });

  const animStateRef = useRef<{
    isAnimating: boolean;
    startTime: number;
    duration: number;
    start: TrajectoryPoint;
    target: TrajectoryPoint;
  }>({
    isAnimating: false,
    startTime: 0,
    duration: 380, // ~380ms smooth sweep
    start: { x: 0, y: 0, z: 1, phase: 0 },
    target: { x: 0, y: 0, z: 1, phase: 0 },
  });

  const [, setRerenderTrigger] = useState(0);

  // Initialize or trigger smooth animated transition when QuantumState changes
  useEffect(() => {
    if (!state) return;
    const b = state.blochCoordinates;
    const targetPoint: TrajectoryPoint = {
      x: b.x,
      y: b.y,
      z: b.z,
      phase: state.relativePhase,
      isKeyframe: true,
    };

    if (trajectoryRef.current.length === 0) {
      // First state
      trajectoryRef.current.push(targetPoint);
      currentVectorRef.current = targetPoint;
      setRerenderTrigger((c) => c + 1);
      return;
    }

    const cur = currentVectorRef.current;
    // Check if target is different from current
    const dx = targetPoint.x - cur.x;
    const dy = targetPoint.y - cur.y;
    const dz = targetPoint.z - cur.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (dist > 0.015) {
      // Trigger smooth geodesic sweep
      animStateRef.current = {
        isAnimating: true,
        startTime: performance.now(),
        duration: Math.max(300, Math.min(500, dist * 250)),
        start: { ...cur },
        target: targetPoint,
      };
    } else {
      // Small shift or same state
      currentVectorRef.current = targetPoint;
    }
  }, [state]);

  const clearTrajectory = () => {
    trajectoryRef.current = [];
    if (state) {
      const b = state.blochCoordinates;
      const initial: TrajectoryPoint = {
        x: b.x,
        y: b.y,
        z: b.z,
        phase: state.relativePhase,
        isKeyframe: true,
      };
      trajectoryRef.current.push(initial);
      currentVectorRef.current = initial;
    }
    setRerenderTrigger((c) => c + 1);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = (timestamp: number) => {
      // 1. Process active geodesic motion along the Bloch sphere
      const anim = animStateRef.current;
      if (anim.isAnimating) {
        const elapsed = timestamp - anim.startTime;
        const progress = Math.min(1.0, elapsed / anim.duration);

        // Smooth cubic ease-in-out
        const t =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        // Spherical SLERP interpolation
        const vA = [anim.start.x, anim.start.y, anim.start.z];
        const vB = [anim.target.x, anim.target.y, anim.target.z];
        const dot = Math.max(-1, Math.min(1, vA[0] * vB[0] + vA[1] * vB[1] + vA[2] * vB[2]));
        const omega = Math.acos(dot);

        let ix = vB[0];
        let iy = vB[1];
        let iz = vB[2];

        if (omega > 0.001) {
          const sinOmega = Math.sin(omega);
          const s0 = Math.sin((1 - t) * omega) / sinOmega;
          const s1 = Math.sin(t * omega) / sinOmega;
          ix = s0 * vA[0] + s1 * vB[0];
          iy = s0 * vA[1] + s1 * vB[1];
          iz = s0 * vA[2] + s1 * vB[2];
        }

        const len = Math.sqrt(ix * ix + iy * iy + iz * iz) || 1;
        ix /= len;
        iy /= len;
        iz /= len;

        // Circular phase interpolation
        let dPhase = anim.target.phase - anim.start.phase;
        while (dPhase > Math.PI) dPhase -= 2 * Math.PI;
        while (dPhase <= -Math.PI) dPhase += 2 * Math.PI;
        const interpPhase = anim.start.phase + dPhase * t;

        const currentStep: TrajectoryPoint = {
          x: ix,
          y: iy,
          z: iz,
          phase: interpPhase,
          isKeyframe: progress >= 1.0,
        };

        currentVectorRef.current = currentStep;

        // Record persistent trajectory as the state sweeps
        const lastRecorded = trajectoryRef.current[trajectoryRef.current.length - 1];
        if (!lastRecorded) {
          trajectoryRef.current.push(currentStep);
        } else {
          const dStep = Math.hypot(
            currentStep.x - lastRecorded.x,
            currentStep.y - lastRecorded.y,
            currentStep.z - lastRecorded.z
          );
          if (dStep > 0.03 || progress >= 1.0) {
            trajectoryRef.current.push(currentStep);
          }
        }

        // Cap persistent trajectory history at 2,000 points
        if (trajectoryRef.current.length > 2000) {
          trajectoryRef.current.splice(0, trajectoryRef.current.length - 2000);
        }

        if (progress >= 1.0) {
          anim.isAnimating = false;
        }
      }

      // 2. Rendering the Bloch Sphere
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.36;

      ctx.clearRect(0, 0, width, height);

      // 3D Projection functions:
      // Quantum coordinates: x (|+>/|->), y (|+i>/|-i>), z (|0>/|1>)
      // In 3D graphics space:
      // X_3d = x, Y_3d = z (up), Z_3d = y
      const project = (qx: number, qy: number, qz: number) => {
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = qx * cosY + qy * sinY;
        const z1 = -qx * sinY + qy * cosY;

        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = qz * cosX - z1 * sinX;
        const z2 = qz * sinX + z1 * cosX;

        const dist = 3.2;
        const scale = radius / (dist + z2 * 0.3);
        return {
          px: cx + x1 * scale * dist,
          py: cy - y2 * scale * dist,
          depth: z2,
        };
      };

      // Outer sphere background glow
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius * 1.15);
      grad.addColorStop(0, 'rgba(30, 41, 59, 0.45)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Latitude & Longitude wireframe circles
      ctx.lineWidth = 1.2;

      // Equator (z = 0)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)'; // Sky blue
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2; a += 0.08) {
        const pt = project(Math.cos(a), Math.sin(a), 0);
        if (a === 0) ctx.moveTo(pt.px, pt.py);
        else ctx.lineTo(pt.px, pt.py);
      }
      ctx.closePath();
      ctx.stroke();

      // Prime Meridian (y = 0)
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2; a += 0.08) {
        const pt = project(Math.cos(a), 0, Math.sin(a));
        if (a === 0) ctx.moveTo(pt.px, pt.py);
        else ctx.lineTo(pt.px, pt.py);
      }
      ctx.closePath();
      ctx.stroke();

      // Meridian 90° (x = 0)
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2; a += 0.08) {
        const pt = project(0, Math.cos(a), Math.sin(a));
        if (a === 0) ctx.moveTo(pt.px, pt.py);
        else ctx.lineTo(pt.px, pt.py);
      }
      ctx.closePath();
      ctx.stroke();

      // Coordinate Axes
      const drawAxis = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, color: string, label: string) => {
        const p1 = project(x1, y1, z1);
        const p2 = project(x2, y2, z2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = color;
        ctx.font = 'bold 11px monospace';
        ctx.fillText(label, p2.px + 4, p2.py - 4);
      };

      drawAxis(0, 0, -1.2, 0, 0, 1.25, '#38bdf8', '+Z (|0⟩)');
      drawAxis(-1.2, 0, 0, 1.25, 0, 0, '#f43f5e', '+X (|+⟩)');
      drawAxis(0, -1.2, 0, 0, 1.25, 0, '#10b981', '+Y (|+i⟩)');

      // Cardinal Pole labels
      const pTop = project(0, 0, 1.0);
      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('|0⟩', pTop.px - 9, pTop.py - 8);

      const pBottom = project(0, 0, -1.0);
      ctx.fillStyle = '#fb923c';
      ctx.fillText('|1⟩', pBottom.px - 9, pBottom.py + 16);

      const pMinus = project(-1.0, 0, 0);
      ctx.fillStyle = '#f472b6';
      ctx.font = '10px sans-serif';
      ctx.fillText('|−⟩', pMinus.px - 14, pMinus.py);

      // 3. PERSISTENT TRAJECTORY TRAILS AS STATE MOVES (PHASE COLOR SHIFTS)
      if (showTrajectory && trajectoryRef.current.length > 1) {
        const pts = trajectoryRef.current;
        const total = pts.length;

        // Pass 1: Soft outer ambient halo
        for (let i = 0; i < total - 1; i++) {
          const ptA = pts[i];
          const ptB = pts[i + 1];
          const projA = project(ptA.x, ptA.y, ptA.z);
          const projB = project(ptB.x, ptB.y, ptB.z);

          // Subtle relative-phase color shifting along trajectory
          const colorHalo = getPhaseColor(ptB.phase, 0.28);
          ctx.strokeStyle = colorHalo;
          ctx.lineWidth = 5.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(projA.px, projA.py);
          ctx.lineTo(projB.px, projB.py);
          ctx.stroke();
        }

        // Pass 2: Crisp core trajectory ribbon
        for (let i = 0; i < total - 1; i++) {
          const ptA = pts[i];
          const ptB = pts[i + 1];
          const projA = project(ptA.x, ptA.y, ptA.z);
          const projB = project(ptB.x, ptB.y, ptB.z);

          const strokeColor = getPhaseColor(ptB.phase, 0.92);
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 2.4;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(projA.px, projA.py);
          ctx.lineTo(projB.px, projB.py);
          ctx.stroke();
        }

        // Pass 3: Gate milestone keyframe nodes
        for (let i = 0; i < total; i++) {
          if (pts[i].isKeyframe) {
            const kProj = project(pts[i].x, pts[i].y, pts[i].z);
            const nodeCol = getPhaseColor(pts[i].phase, 1.0);
            ctx.fillStyle = nodeCol;
            ctx.beginPath();
            ctx.arc(kProj.px, kProj.py, 3.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }
        }
      }

      // 4. Relative Phase Equatorial Indicator
      const curState = currentVectorRef.current;
      const curPhase = curState.phase;
      // Show equatorial indicator when in non-basis superposition
      const inSuperposition = Math.abs(curState.z) < 0.95;

      if (inSuperposition) {
        const cosP = Math.cos(curPhase);
        const sinP = Math.sin(curPhase);
        const phasePt = project(cosP, sinP, 0);

        const phaseCol = getPhaseColor(curPhase, 0.85);
        ctx.strokeStyle = phaseCol;
        ctx.lineWidth = 1.8;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        const centerPt = project(0, 0, 0);
        ctx.moveTo(centerPt.px, centerPt.py);
        ctx.lineTo(phasePt.px, phasePt.py);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = phaseCol;
        ctx.beginPath();
        ctx.arc(phasePt.px, phasePt.py, 4.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 10px monospace';
        ctx.fillText(`φ:${curPhase.toFixed(2)}`, phasePt.px + 6, phasePt.py - 3);
      }

      // 5. State Vector Arrow (Tip color matches dynamic relative-phase hue!)
      const center = project(0, 0, 0);
      const tip = project(curState.x, curState.y, curState.z);
      const vectorColor = getPhaseColor(curPhase, 1.0);

      // Vector Needle Line
      ctx.strokeStyle = vectorColor;
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.moveTo(center.px, center.py);
      ctx.lineTo(tip.px, tip.py);
      ctx.stroke();

      // Vector Tip Glow & Sphere
      ctx.fillStyle = vectorColor;
      ctx.beginPath();
      ctx.arc(tip.px, tip.py, 6.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Outer bounding rim
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [rotX, rotY, showTrajectory]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    setRotY((prev) => prev + dx * 0.012);
    setRotX((prev) => Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, prev + dy * 0.012)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const curPhase = state ? state.relativePhase : 0;
  const curPhaseColor = getPhaseColor(curPhase, 1.0);

  return (
    <div className="relative flex flex-col items-center select-none bg-slate-950/80 p-2.5 rounded-xl border border-slate-700/60 shadow-lg backdrop-blur">
      {/* Header with Title and Clear Trail Button */}
      <div className="flex items-center justify-between w-full px-2 py-1 text-xs text-slate-300 font-mono border-b border-slate-800 mb-1.5">
        <span className="flex items-center gap-1.5 font-bold text-sky-400">
          <span
            className="w-2.5 h-2.5 rounded-full shadow-sm transition-colors duration-300"
            style={{ backgroundColor: curPhaseColor }}
          />
          Bloch Sphere Visualizer
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">Drag to orbit</span>
          <button
            onClick={clearTrajectory}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1 text-[10px]"
            title="Clear persistent trajectory trails"
          >
            <RotateCcw className="w-3 h-3" />
            Clear
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={260}
        height={260}
        className="cursor-grab active:cursor-grabbing rounded-lg touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Telemetry and Phase Color Bar */}
      <div className="flex items-center justify-between w-full px-2 pt-1.5 text-[11px] font-mono text-slate-400 border-t border-slate-800/80 mt-1">
        <div className="flex gap-2">
          <span>X: {state?.blochCoordinates.x.toFixed(2)}</span>
          <span>Y: {state?.blochCoordinates.y.toFixed(2)}</span>
          <span className="text-sky-300 font-semibold">Z: {state?.blochCoordinates.z.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px]">
          <span className="text-slate-400">φ-trail:</span>
          <span className="font-semibold" style={{ color: curPhaseColor }}>
            {curPhase.toFixed(2)} rad
          </span>
        </div>
      </div>
    </div>
  );
};

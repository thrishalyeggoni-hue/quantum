import React, { useState } from 'react';
import {
  Gamepad2,
  Compass,
  Zap,
  RotateCcw,
  BookOpen,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'basics' | 'terminal' | 'gates' | 'reversibility'>('basics');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-10 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/40">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                HOW TO PLAY: QUANTUM ECHO
              </h2>
              <p className="text-xs text-slate-400">
                A beginner's guide to restoring the floating city of Aster
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Close Guide [Esc]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-2 gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('basics')}
            className={`pb-2 px-3 border-b-2 font-medium transition ${
              activeTab === 'basics'
                ? 'border-sky-400 text-sky-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Movement & Controls
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`pb-2 px-3 border-b-2 font-medium transition ${
              activeTab === 'terminal'
                ? 'border-sky-400 text-sky-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. The Quantum Terminal
          </button>
          <button
            onClick={() => setActiveTab('gates')}
            className={`pb-2 px-3 border-b-2 font-medium transition ${
              activeTab === 'gates'
                ? 'border-sky-400 text-sky-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Quantum Gates
          </button>
          <button
            onClick={() => setActiveTab('reversibility')}
            className={`pb-2 px-3 border-b-2 font-medium transition ${
              activeTab === 'reversibility'
                ? 'border-sky-400 text-sky-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            4. Inverses & Reversibility
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs font-sans text-slate-300 leading-relaxed">
          {activeTab === 'basics' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sky-200 font-mono text-sm mb-1">
                    Your Mission as Mira & Lumi
                  </h4>
                  <p>
                    The celestial city of Aster lost its power when the Auditor attempted premature quantum measurements. You control Mira, carrying the sentient Echo Lantern Lumi, traveling through 8 districts to restore the network.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Compass className="w-4 h-4" /> Movement
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-300">
                    <li><b className="text-white">W, A, S, D</b> or <b className="text-white">Arrows</b>: Walk</li>
                    <li><b className="text-white">Shift</b>: Sprint faster</li>
                    <li><b className="text-white">Space</b>: Jump</li>
                    <li><b className="text-white">Mouse Drag</b>: Orbit camera view in 3D</li>
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" /> Interfacing & Travel
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-300">
                    <li><b className="text-white">E</b>: Interface with nearby terminal</li>
                    <li><b className="text-white">Quick Travel</b>: Click any District tab at the top of your screen to teleport directly there!</li>
                    <li><b className="text-white">Esc</b>: Exit console back to 3D city</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'terminal' && (
            <div className="space-y-3 font-mono text-xs">
              <p className="font-sans text-slate-300">
                When you press <b className="text-sky-300">[E]</b> near a glowing terminal beacon, the Quantum Terminal opens:
              </p>

              <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="text-sky-300 font-bold">1. Current Qubit State |ψ⟩ = α|0⟩ + β|1⟩</div>
                <p className="font-sans text-slate-400 text-[11px]">
                  Displays the exact complex amplitudes α and β. Probabilities are given by Born's rule: P(0) = |α|² and P(1) = |β|².
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="text-emerald-300 font-bold">2. Applied Circuit History</div>
                <p className="font-sans text-slate-400 text-[11px]">
                  Shows the sequence of quantum operations in chronological order from left to right.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="text-pink-300 font-bold">3. 3D Bloch Sphere Visualizer</div>
                <p className="font-sans text-slate-400 text-[11px]">
                  Every pure qubit state corresponds to a point on the unit sphere. The state vector moves along the surface, drawing persistent trajectory ribbons whose color shifts subtly with the relative phase φ!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'gates' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-500/30">
                <span className="font-bold text-sky-300">Gate X (Bit Flip):</span>
                <span className="text-slate-300 font-sans block mt-1">
                  Flips |0⟩ to |1⟩, and |1⟩ to |0⟩. It is the quantum analogue of the classical NOT gate, rotating 180° around the X-axis of the Bloch sphere.
                </span>
              </div>

              <div className="p-3 rounded-lg bg-pink-950/40 border border-pink-500/30">
                <span className="font-bold text-pink-300">Gate Z (Phase Flip):</span>
                <span className="text-slate-300 font-sans block mt-1">
                  Leaves |0⟩ unchanged (Z|0⟩ = |0⟩) and maps |1⟩ to −|1⟩. On a lone basis state, the minus sign is an unobservable global phase factor. In superposition, however, Z rotates the relative phase by π radians, transforming |+⟩ into |−⟩!
                </span>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                <span className="font-bold text-emerald-300">Gate H (Hadamard):</span>
                <span className="text-slate-300 font-sans block mt-1">
                  Creates coherent superposition from basis states: H|0⟩ = |+⟩ = (|0⟩ + |1⟩)/√2 and H|1⟩ = |−⟩ = (|0⟩ − |1⟩)/√2. Measurement produces 50/50 odds, but coherence is fully preserved!
                </span>
              </div>
            </div>
          )}

          {activeTab === 'reversibility' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-lg bg-amber-950/40 border border-amber-500/30 space-y-1.5">
                <div className="text-amber-300 font-bold flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4" /> Unitary Reversibility
                </div>
                <p className="font-sans text-slate-300 text-[11px]">
                  All quantum gates are unitary (U†U = I) and preserve quantum information. Gates X, Z, and H are self-inverse (e.g. X·X = I).
                </p>
                <p className="font-sans text-slate-300 text-[11px]">
                  For a multi-gate sequence like H → Z → X, the inverse must be applied in reverse order: X → Z → H!
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-purple-950/40 border border-purple-500/30 space-y-1.5">
                <div className="text-purple-300 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Measurement vs. Reversibility
                </div>
                <p className="font-sans text-slate-300 text-[11px]">
                  In Chapter 7, you discover that measurement collapses the qubit state into |0⟩ or |1⟩ according to Born's rule. Measurement is irreversible; once collapsed, quantum undo is blocked, requiring fresh preparation to re-establish coherence.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <div className="text-slate-400 text-xs font-mono">
            Press <b className="text-sky-300">[H]</b> anytime to toggle this guide
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold shadow-lg transition active:scale-95"
          >
            <span>Begin Playing Aster</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

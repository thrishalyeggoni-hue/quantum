import React, { useState } from 'react';
import { GateType, QuantumSimulator } from '../quantum/quantumEngine';
import { sound } from '../audio/soundSynth';
import { BlochSphereCanvas } from './BlochSphereCanvas';
import {
  HelpCircle,
  RotateCcw,
  Undo2,
  BookOpen,
  X,
  Sparkles,
  Zap,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Flame,
} from 'lucide-react';

export interface ChapterDef {
  id: number;
  district: string;
  title: string;
  story: string;
  objective: string;
  targetName: string;
  allowedGates: GateType[];
  allowInverse: boolean;
  allowReset?: boolean;
  allowMeasurement: boolean;
  allowPreparation: boolean;
  hints: string[];
  successExplanation: string;
  journalEntry: string;
}

export const CHAPTER_DEFINITIONS: ChapterDef[] = [
  {
    id: 1,
    district: 'Arrival Harbor',
    title: 'What is a Qubit? Basis States',
    story:
      'Mira arrives at the floating docks of Aster to search for Dr. Ishan. She finds Lumi, a damaged drone, trapped behind a dead service gate. The lock requires computational basis states.',
    objective: 'Prepare basis state |1⟩ to activate the gate terminal, then inspect both basis states.',
    targetName: '|1⟩',
    allowedGates: ['X'],
    allowInverse: true,
    allowMeasurement: true,
    allowPreparation: true,
    hints: [
      'Basis state |0⟩ has 100% chance of measuring 0. Basis state |1⟩ has 100% chance of measuring 1.',
      'Use the preparation console or the X gate to change between basis states.',
      'The upper terminal requires basis state |1⟩: prepare |1⟩ or apply X to |0⟩.',
    ],
    successExplanation:
      'Qubits have two orthonormal basis states: |0⟩ and |1⟩. In pure basis states, computational measurement is completely deterministic.',
    journalEntry:
      "Dr. Ishan's Log #1: 'A qubit is not merely an on/off switch; it is a vector in a 2-dimensional complex Hilbert space. Basis states |0⟩ and |1⟩ form our coordinate frame.'",
  },
  {
    id: 2,
    district: 'Switchworks',
    title: 'The X Gate (Bit-Flip & Self-Inverse)',
    story:
      'The transport machinery of Switchworks is jammed. Lumi remembers that unitary operations can be retraced: applying X twice returns the exact starting state.',
    objective: 'Starting from |0⟩, use X to reach |1⟩, then verify that applying X a second time returns to |0⟩.',
    targetName: '|1⟩',
    allowedGates: ['X'],
    allowInverse: true,
    allowMeasurement: false,
    allowPreparation: false,
    hints: [
      'The Pauli-X gate acts as quantum NOT: X|0⟩ = |1⟩ and X|1⟩ = |0⟩.',
      'On the Bloch sphere, X is a 180° rotation around the X-axis.',
      'Because X · X = Identity, the X gate is its own inverse (self-inverse)!',
    ],
    successExplanation:
      'The Pauli-X gate swaps amplitudes α and β. Because X is unitary and Hermitian (X = X†), applying X twice returns the original state without any information loss.',
    journalEntry:
      "Dr. Ishan's Log #2: 'Unitary operations conserve information. The Switchworks routing elevators rely on the self-inverse symmetry of Pauli-X.'",
  },
  {
    id: 3,
    district: 'The Twin-Light Garden',
    title: 'Superposition & The Hadamard Gate',
    story:
      'The garden canals and twin light branches depend on equal superposition. A coherence relay requires the state |+⟩ = (|0⟩ + |1⟩)/√2.',
    objective: 'Transform |0⟩ into equal superposition |+⟩ using the Hadamard (H) gate.',
    targetName: '|+⟩',
    allowedGates: ['H'],
    allowInverse: true,
    allowMeasurement: true,
    allowPreparation: false,
    hints: [
      'The Hadamard (H) gate creates equal superposition: H|0⟩ = (|0⟩ + |1⟩)/√2.',
      'Notice the two light branches on your lantern: they represent complex probability amplitudes, not two separate classical lanterns.',
      'Applying H a second time returns H|+⟩ = |0⟩. Superposition is not classical ignorance!',
    ],
    successExplanation:
      'Hadamard creates superposition: amplitude 1/√2 gives measurement probability |1/√2|² = 50%. A second H returns to |0⟩.',
    journalEntry:
      "Dr. Ishan's Log #3: 'Superposition is not ignorance. It is not that the coin is secretly heads or tails; the coin is genuinely in flight until measured.'",
  },
  {
    id: 4,
    district: 'Phase Observatory',
    title: 'The Z Gate & Relative Phase',
    story:
      'The observatory beacon has correct 50/50 brightness but cannot pass through the interference lens because its relative phase is misaligned.',
    objective: 'From |0⟩, create |+⟩ with H, apply Z to reach |−⟩, then apply H to reach |1⟩ and restore the beacon.',
    targetName: '|1⟩',
    allowedGates: ['H', 'Z'],
    allowInverse: true,
    allowMeasurement: false,
    allowPreparation: false,
    hints: [
      'Pauli-Z acts as: Z|0⟩ = |0⟩ and Z|1⟩ = −|1⟩. It leaves probabilities at 50/50 but shifts relative phase from 0 to π radians (180°).',
      'When you apply Z to |+⟩, you create |−⟩ = (|0⟩ − |1⟩)/√2.',
      'Now apply H: H|−⟩ = |1⟩ through quantum interference! The full sequence is: H → Z → H.',
    ],
    successExplanation:
      'Relative phase dictates quantum interference. While |+⟩ and |−⟩ have identical 50/50 computational measurement odds, H|+⟩ = |0⟩ while H|−⟩ = |1⟩.',
    journalEntry:
      "Dr. Ishan's Log #4: 'Probabilities tell you where you might arrive; relative phase tells you how possibilities interfere along the way.'",
  },
  {
    id: 5,
    district: 'Echo Bridge',
    title: 'Gate Order & Non-Commutativity',
    story:
      'Two bridge relays require specific relative phases. Mira must realize that the order in which quantum gates are applied directly alters the resulting state.',
    objective: 'Reach |−⟩ from |0⟩ using gate order (X then H), observing that this differs from (H then X = |+⟩).',
    targetName: '|−⟩',
    allowedGates: ['X', 'H'],
    allowInverse: true,
    allowReset: true,
    allowMeasurement: false,
    allowPreparation: false,
    hints: [
      'X|0⟩ = |1⟩, then H|1⟩ = |−⟩ (relative phase π).',
      'If you apply H first, H|0⟩ = |+⟩, then X|+⟩ = |+⟩ (relative phase 0).',
      'Thus, X · H ≠ H · X! Quantum gates are non-commutative matrix operations.',
    ],
    successExplanation:
      'Matrix multiplication does not commute: XH|0⟩ = |−⟩ whereas HX|0⟩ = |+⟩. Both have 50/50 probabilities, but completely different relative phase!',
    journalEntry:
      "Dr. Ishan's Log #5: 'In the classical world, flipping a switch and tuning a dial might commute. In the quantum realm, the sequence of operations sculpts the wavefunction.'",
  },
  {
    id: 6,
    district: 'The Reversal Vault',
    title: 'Reversibility & True Inverse Sequences',
    story:
      "Mira reaches Dr. Ishan's encrypted archive vault. The lock recorded a forward transformation: H, then Z, then X. To unlock it, she must apply the inverse sequence.",
    objective: 'From the perturbed state (H → Z → X from |0⟩), apply the true inverse sequence (X → Z → H) to restore the archive key.',
    targetName: '|0⟩',
    allowedGates: ['X', 'Z', 'H'],
    allowInverse: true,
    allowMeasurement: false,
    allowPreparation: false,
    hints: [
      'For sequence U = U3 · U2 · U1, the inverse is U⁻¹ = U1⁻¹ · U2⁻¹ · U3⁻¹.',
      'Since X, Z, and H are each self-inverse, you must apply them in REVERSE chronological order: first X, then Z, then H!',
      'Use the Apply Last Inverse button or manually apply X → Z → H.',
    ],
    successExplanation:
      'Reversible quantum computation requires inverting both the gates and their chronological order: (A B C)⁻¹ = C⁻¹ B⁻¹ A⁻¹.',
    journalEntry:
      "Dr. Ishan's Log #6: 'Every coherent quantum gate can be run in reverse if the history is preserved. Unitary physics is fundamentally reversible.'",
  },
  {
    id: 7,
    district: 'Measurement Station',
    title: 'Measurement: The Limit of Reversal',
    story:
      "The Auditor's collapse sensors are forcibly measuring qubits in the computational basis, destroying superposition. Mira must observe why measurement cannot be inverted.",
    objective: 'Prepare |+⟩, trigger measurement, observe state collapse to |0⟩ or |1⟩, and observe that quantum undo is blocked across the measurement boundary.',
    targetName: 'Collapsed',
    allowedGates: ['H', 'X'],
    allowInverse: true,
    allowMeasurement: true,
    allowPreparation: true,
    hints: [
      'Prepare |+⟩ with H, then press Measure.',
      'The state collapses to |0⟩ or |1⟩ with probabilities |α|² and |β|² according to Born’s rule.',
      'Notice that Apply Last Inverse becomes disabled: you cannot invert across a measurement boundary!',
    ],
    successExplanation:
      'Measurement is non-unitary and irreversible. It projects the state onto an eigenbasis and erases phase. Recovery requires fresh preparation from known instructions.',
    journalEntry:
      "Dr. Ishan's Log #7: 'The Auditor sought perfect predictability, but measurement collapses the very coherence that gives Aster life. You cannot un-measure a qubit.'",
  },
  {
    id: 8,
    district: 'The Echo Core',
    title: 'Restoration of the Echo Core',
    story:
      'Mira reaches the central spire overlooking Aster. She must stabilize all 6 sectors of the Echo Core using the complete repertoire of quantum skills.',
    objective:
      'Complete the 6 stabilization stages: 1) Reach |1⟩ via X; 2) Reach |+⟩ via H; 3) Reach |−⟩ via H then Z; 4) Reach |1⟩ via H-Z-H (X disabled); 5) Reverse unitary sequence H-Z-X; 6) Cross measurement boundary using fresh preparation.',
    targetName: 'Stabilized Core',
    allowedGates: ['X', 'Z', 'H'],
    allowInverse: true,
    allowMeasurement: true,
    allowPreparation: true,
    hints: [
      'Stage 1: Apply X to flip |0⟩ to |1⟩.',
      'Stage 2: Apply H to create |+⟩.',
      'Stage 3: Apply H then Z to create |−⟩.',
      'Stage 4: Without X available, apply H → Z → H to reach |1⟩ via phase interference!',
      'Stage 5: To invert H → Z → X, apply the inverse sequence in reverse order: X, then Z, then H.',
      'Stage 6: The state is collapsed by measurement. Quantum undo is blocked. Click "Prepare a fresh |0⟩" or "Prepare a fresh |1⟩" to restore coherence!',
    ],
    successExplanation:
      'The Echo Core is fully stabilized! Through unitary evolution, phase interference, and deliberate state preparation, the floating city of Aster is saved.',
    journalEntry:
      "Dr. Ishan's Final Transmission: 'Mira, you did not simply reverse time; you rebuilt our world through understanding. Coherence is preserved.'",
  },
];

interface ConsoleUIProps {
  chapter: ChapterDef;
  simulator: QuantumSimulator;
  onGateApplied: (gate: GateType) => void;
  onInverseApplied: () => void;
  onReset: () => void;
  onPrepare: (toOne: boolean) => void;
  onMeasure: () => void;
  onRunTrials: (count: number) => void;
  onResetTrials?: () => void;
  trials: { count0: number; count1: number; history?: (0 | 1)[] };
  onClose: () => void;
  onAdvanceChapter: () => void;
  isSolved: boolean;
  coreStage: number;
}

export const ConsoleUI: React.FC<ConsoleUIProps> = ({
  chapter,
  simulator,
  onGateApplied,
  onInverseApplied,
  onReset,
  onPrepare,
  onMeasure,
  onRunTrials,
  onResetTrials,
  trials,
  onClose,
  onAdvanceChapter,
  isSolved,
  coreStage,
}) => {
  const [hintIndex, setHintIndex] = useState(0);
  const [showJournal, setShowJournal] = useState(false);

  const state = simulator.currentState;
  const p0 = state.prob0;
  const p1 = state.prob1;
  const phase = state.relativePhase;
  const phaseDeg = (phase * 180) / Math.PI;

  const totalTrials = trials.count0 + trials.count1;
  const empP0 = totalTrials > 0 ? trials.count0 / totalTrials : 0;
  const empP1 = totalTrials > 0 ? trials.count1 / totalTrials : 0;
  const deviation = totalTrials > 0 ? Math.abs(empP0 - p0) : 0;

  const canInverse = simulator.canApplyInverse();
  const nextInvGate = simulator.getLastInverseGate();

  const is5050 = Math.abs(p0 - 0.5) < 0.05 && Math.abs(p1 - 0.5) < 0.05;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col text-slate-100">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-10 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
              District {chapter.id} / 8
            </span>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                {chapter.district}
                <span className="text-slate-500 text-sm font-normal">—</span>
                <span className="text-slate-300 text-sm font-medium">{chapter.title}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowJournal(!showJournal)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 transition"
              title="Open Dr. Ishan's Archive"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Journal
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Exit Console [Esc]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Story, Objectives, Telemetry */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Story & Objective Box */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2.5">
              <div className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed italic">
                <span className="font-semibold not-italic text-sky-400 shrink-0">Lumi:</span>
                "{chapter.story}"
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-start gap-2">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs font-mono text-emerald-300">
                  <span className="font-bold text-white">Objective:</span> {chapter.objective}
                  {chapter.id === 8 && (
                    <div className="mt-1.5 p-2 rounded bg-amber-950/50 border border-amber-500/30 text-amber-300">
                      <div className="font-bold">Echo Core Active Stage: {coreStage} of 6</div>
                      <div className="text-[11px] text-amber-200 mt-0.5">
                        {coreStage === 1 && "Stage 1: Reach |1⟩ from |0⟩ using X"}
                        {coreStage === 2 && "Stage 2: Reach |+⟩ from |0⟩ using H"}
                        {coreStage === 3 && "Stage 3: Reach |−⟩ from |0⟩ using H then Z"}
                        {coreStage === 4 && "Stage 4: Reach |1⟩ via H → Z → H (Gate X is explicitly disabled!)"}
                        {coreStage === 5 && "Stage 5: True Inverse: State is HZX|0⟩. Undo with inverse sequence X → Z → H to reach |0⟩!"}
                        {coreStage === 6 && "Stage 6: Measurement Boundary: State is collapsed. Quantum undo is blocked. Click 'Prepare a fresh |0⟩' or 'Prepare a fresh |1⟩' to restore coherence!"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dirac Notation & Amplitudes Card */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="font-bold text-slate-200">Current Qubit State |ψ⟩</span>
                <span className="text-sky-400 font-semibold">Target: {chapter.targetName}</span>
              </div>

              <div className="px-4 py-3 rounded-lg bg-slate-900 border border-slate-700/60 text-center font-mono text-base tracking-wide text-sky-200 shadow-inner">
                {state.formatDirac()}
              </div>

              {/* Probabilities P(0) & P(1) */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span className="text-sky-400 font-semibold">|0⟩ Basis Probability: {(p0 * 100).toFixed(2)}%</span>
                  <span className="text-amber-400 font-semibold">|1⟩ Basis Probability: {(p1 * 100).toFixed(2)}%</span>
                </div>
                <div className="h-3.5 w-full bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-slate-700">
                  <div
                    className="h-full bg-sky-500 rounded-l-full transition-all duration-300"
                    style={{ width: `${p0 * 100}%` }}
                  />
                  <div
                    className="h-full bg-amber-500 rounded-r-full transition-all duration-300"
                    style={{ width: `${p1 * 100}%` }}
                  />
                </div>
              </div>

              {/* Complex Amplitudes Breakdown & Unit Norm Check */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <div>
                  <div className="text-slate-400">
                    α = <span className="text-sky-300 font-semibold">
                      {state.alpha.real.toFixed(3)}
                      {state.alpha.imag >= 0 ? ' + ' : ' − '}
                      {Math.abs(state.alpha.imag).toFixed(3)}i
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    |α|² = {(p0 * 100).toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">
                    β = <span className="text-amber-300 font-semibold">
                      {state.beta.real.toFixed(3)}
                      {state.beta.imag >= 0 ? ' + ' : ' − '}
                      {Math.abs(state.beta.imag).toFixed(3)}i
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    |β|² = {(p1 * 100).toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* State Verification Metrics */}
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 px-1 pt-0.5">
                <span>Unit Norm |α|²+|β|²: <b className="text-emerald-400 font-bold">{(p0 + p1).toFixed(4)}</b></span>
                <span>Bloch Purity: <b className="text-emerald-400 font-bold">1.000</b> (Pure Qubit)</span>
              </div>

              {/* Relative Phase Gauge */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Relative Phase φ = arg(β) − arg(α):</span>
                <span className="font-bold text-pink-400">
                  {phase.toFixed(2)} rad ({phaseDeg.toFixed(0)}°)
                </span>
              </div>

              {/* 50/50 Educational Comparison Alert */}
              {is5050 && (
                <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-[11px] font-mono leading-relaxed text-indigo-200 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">Same measurement probabilities, different relative phase!</span>
                    <div className="text-slate-300 mt-0.5">
                      {Math.abs(phase) < 0.2 ? (
                        <span>State is <b>|+⟩</b> (Phase 0 rad). Applying H will yield <b>|0⟩</b>.</span>
                      ) : (
                        <span>State is <b>|−⟩</b> (Phase π rad). Applying H will yield <b>|1⟩</b>!</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Circuit Sequence History */}
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col gap-2">
              <span className="text-xs font-mono font-semibold text-slate-400">
                Applied Circuit (Left to Right):
              </span>
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs text-sky-300 min-h-7">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">Initial |0⟩</span>
                {simulator.history.length === 0 && (
                  <span className="text-slate-500 text-[11px]">— No gates applied —</span>
                )}
                {simulator.history.map((step, idx) => (
                  <React.Fragment key={idx}>
                    <span className="text-slate-600">─►</span>
                    <span className="px-2.5 py-0.5 rounded font-bold bg-sky-950 border border-sky-500/50 text-sky-200">
                      Gate {step.gateName}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: 3D Bloch Sphere & Gate Controls */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Bloch Sphere Component */}
            <BlochSphereCanvas state={state} />

            {/* Gate Buttons & Reversibility Controls */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-3">
              <div className="text-xs font-mono font-semibold text-slate-300 flex items-center justify-between">
                <span>Unitary Gate Controls</span>
                <span className="text-[10px] text-slate-500">Reversible Operations</span>
              </div>

              {/* Core Gates */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onGateApplied('X')}
                  disabled={!chapter.allowedGates.includes('X') || (chapter.id === 8 && coreStage === 4)}
                  className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 font-mono text-xs font-bold text-sky-200 disabled:opacity-40 disabled:pointer-events-none transition active:scale-95 shadow"
                >
                  <span className="text-sm">Gate X</span>
                  <span className="text-[10px] font-normal text-sky-400">
                    {chapter.id === 8 && coreStage === 4 ? 'Disabled' : 'Bit Flip'}
                  </span>
                </button>

                <button
                  onClick={() => onGateApplied('Z')}
                  disabled={!chapter.allowedGates.includes('Z')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-pink-950/80 hover:bg-pink-900 border border-pink-500/40 font-mono text-xs font-bold text-pink-200 disabled:opacity-40 disabled:pointer-events-none transition active:scale-95 shadow"
                >
                  <span className="text-sm">Gate Z</span>
                  <span className="text-[10px] font-normal text-pink-400">Phase Flip</span>
                </button>

                <button
                  onClick={() => onGateApplied('H')}
                  disabled={!chapter.allowedGates.includes('H')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 font-mono text-xs font-bold text-emerald-200 disabled:opacity-40 disabled:pointer-events-none transition active:scale-95 shadow"
                >
                  <span className="text-sm">Gate H</span>
                  <span className="text-[10px] font-normal text-emerald-400">Hadamard</span>
                </button>
              </div>

              {/* Inverse & Reset Actions */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                <button
                  onClick={onInverseApplied}
                  disabled={!canInverse}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 font-mono text-xs font-semibold text-amber-200 disabled:opacity-30 disabled:pointer-events-none transition"
                  title="Applies the mathematical inverse of the last gate in reverse order"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Inverse {nextInvGate ? `(${nextInvGate})` : ''}</span>
                </button>

                <button
                  onClick={onReset}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 font-mono text-xs font-semibold text-slate-200 transition"
                  title="Reset puzzle to initial state [R]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset [R]</span>
                </button>
              </div>

              {/* State Preparation (Chapters with explicit prep or Ch8 Stage 6) */}
              {(chapter.allowPreparation || (chapter.id === 8 && coreStage === 6)) && (
                <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-800">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span className="font-semibold text-slate-300">State Preparation:</span>
                    <span className="text-slate-500 italic">Preparation is not an inverse gate</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onPrepare(false)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-xs font-mono font-medium text-slate-200 border border-slate-700 transition"
                    >
                      Prepare a fresh |0⟩
                    </button>
                    <button
                      onClick={() => onPrepare(true)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-xs font-mono font-medium text-slate-200 border border-slate-700 transition"
                    >
                      Prepare a fresh |1⟩
                    </button>
                  </div>
                </div>
              )}

              {/* Measurement Controls & Accurate Born-Rule Statistics */}
              {chapter.allowMeasurement && (
                <div className="pt-2 border-t border-slate-800 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
                      Measurement & Born Rule Statistics
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Total Shots: {totalTrials}
                    </span>
                  </div>

                  {/* Theoretical Born-Rule vs Observed Frequency Comparison */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Theoretical Born Rule
                      </div>
                      <div className="flex justify-between text-sky-300">
                        <span>P(|0⟩) = |α|²:</span>
                        <span className="font-bold">{(p0 * 100).toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between text-amber-300">
                        <span>P(|1⟩) = |β|²:</span>
                        <span className="font-bold">{(p1 * 100).toFixed(2)}%</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Empirical Frequencies ({totalTrials})
                      </div>
                      <div className="flex justify-between text-sky-300">
                        <span>N(0) = {trials.count0}:</span>
                        <span className="font-bold">
                          {totalTrials > 0 ? (empP0 * 100).toFixed(2) : '0.00'}%
                        </span>
                      </div>
                      <div className="flex justify-between text-amber-300">
                        <span>N(1) = {trials.count1}:</span>
                        <span className="font-bold">
                          {totalTrials > 0 ? (empP1 * 100).toFixed(2) : '0.00'}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dual Comparison Visual Bars */}
                  {totalTrials > 0 && (
                    <div className="space-y-1 text-[10px] font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Observed Sample Distribution</span>
                        <span className={deviation < 0.05 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                          Deviation: {(deviation * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                        <div
                          className="bg-sky-400 transition-all duration-300"
                          style={{ width: `${empP0 * 100}%` }}
                        />
                        <div
                          className="bg-amber-400 transition-all duration-300"
                          style={{ width: `${empP1 * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Recent Measurement Outcome Tape */}
                  {trials.history && trials.history.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-[10px] font-mono">
                      <span className="text-slate-500 shrink-0">Recent:</span>
                      <div className="flex gap-1">
                        {trials.history.slice(-20).map((shot, idx) => (
                          <span
                            key={idx}
                            className={`w-4 h-4 rounded flex items-center justify-center font-bold text-[9px] ${
                              shot === 0
                                ? 'bg-sky-950 text-sky-300 border border-sky-600/50'
                                : 'bg-amber-950 text-amber-300 border border-amber-600/50'
                            }`}
                          >
                            {shot}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons: Single Shot, +50, +200, +1000, Clear */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      onClick={onMeasure}
                      className="py-1.5 px-2 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-xs font-mono font-bold text-red-200 transition active:scale-95 shadow"
                      title="Single-shot computational basis measurement (collapses state)"
                    >
                      Single Shot
                    </button>
                    <button
                      onClick={() => onRunTrials(50)}
                      className="py-1.5 px-2 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-xs font-mono font-bold text-purple-200 transition active:scale-95 shadow"
                      title="Run 50 fresh state preparations from current state"
                    >
                      +50 Trials
                    </button>
                    <button
                      onClick={() => onRunTrials(200)}
                      className="py-1.5 px-2 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-xs font-mono font-bold text-purple-200 transition active:scale-95 shadow"
                      title="Run 200 fresh state preparations from current state"
                    >
                      +200 Trials
                    </button>
                    <button
                      onClick={() => onRunTrials(1000)}
                      className="py-1.5 px-2 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-xs font-mono font-bold text-indigo-200 transition active:scale-95 shadow"
                      title="Run 1,000 fresh state preparations to verify Law of Large Numbers convergence"
                    >
                      +1,000
                    </button>
                  </div>

                  {onResetTrials && totalTrials > 0 && (
                    <button
                      onClick={onResetTrials}
                      className="self-end text-[10px] font-mono text-slate-400 hover:text-slate-200 underline pt-0.5"
                    >
                      Reset Statistics Counts
                    </button>
                  )}

                  {simulator.isCollapsed && (
                    <div className="text-[10px] font-mono text-amber-300/90 italic">
                      ⚠ State collapsed! Unitary history cleared across measurement boundary.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progressive Hints Drawer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
            <HelpCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              <b>Hint {hintIndex + 1}/3:</b> {chapter.hints[hintIndex]}
            </span>
          </div>
          <button
            onClick={() => setHintIndex((prev) => (prev + 1) % 3)}
            className="px-3 py-1 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition shrink-0"
          >
            Next Hint ({hintIndex + 1}/3)
          </button>
        </div>

        {/* Solved Victory Banner */}
        {isSolved && (
          <div className="p-4 mx-6 my-3 rounded-xl bg-emerald-950/90 border border-emerald-500/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-emerald-200">CIRCUIT RESTORED</h4>
                <p className="text-xs text-emerald-300/90 leading-relaxed mt-0.5">
                  {chapter.successExplanation}
                </p>
              </div>
            </div>

            <button
              onClick={onAdvanceChapter}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-bold text-xs text-slate-950 transition active:scale-95 shadow-lg shrink-0"
            >
              <span>{chapter.id === 8 ? 'Complete Campaign' : 'Advance District'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Journal Dialog Modal */}
        {showJournal && (
          <div className="absolute inset-0 z-50 p-6 bg-slate-950/95 flex flex-col gap-4 rounded-2xl overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-sm">
                <BookOpen className="w-4 h-4" />
                <span>Dr. Ishan's Protected Archives</span>
              </div>
              <button
                onClick={() => setShowJournal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 font-serif text-sm text-slate-300 leading-relaxed max-w-3xl mx-auto py-2">
              {CHAPTER_DEFINITIONS.filter((c) => c.id <= chapter.id).map((c) => (
                <div key={c.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="font-mono text-xs font-bold text-amber-400/90 mb-1">
                    District {c.id}: {c.district}
                  </div>
                  <div className="italic text-slate-200">{c.journalEntry}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

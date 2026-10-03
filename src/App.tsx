/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { CityGameCanvas } from './components/CityGameCanvas';
import { ConsoleUI, CHAPTER_DEFINITIONS, ChapterDef } from './components/ConsoleUI';
import { BlochSphereCanvas } from './components/BlochSphereCanvas';
import { HowToPlayModal } from './components/HowToPlayModal';
import { QuantumSimulator, QuantumState, GateType } from './quantum/quantumEngine';
import { sound } from './audio/soundSynth';
import {
  Volume2,
  VolumeX,
  Compass,
  BookOpen,
  Sparkles,
  Trophy,
  RotateCcw,
  Maximize2,
  Layers,
  CheckCircle,
  HelpCircle,
  Info,
  BarChart3,
} from 'lucide-react';

export default function App() {
  const [activeChapterId, setActiveChapterId] = useState<number>(1);
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isGameCompleted, setIsGameCompleted] = useState<boolean>(false);
  const [showSandbox, setShowSandbox] = useState<boolean>(false);
  const [showTheoryGuide, setShowTheoryGuide] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [isCurrentPuzzleSolved, setIsCurrentPuzzleSolved] = useState<boolean>(false);
  const [coreStage, setCoreStage] = useState<number>(1);
  const [trials, setTrials] = useState<{ count0: number; count1: number; history: (0 | 1)[] }>({
    count0: 0,
    count1: 0,
    history: [],
  });

  // Persistent Quantum Simulator
  const simulatorRef = useRef<QuantumSimulator>(new QuantumSimulator(QuantumState.zero()));
  const [, setRenderTrigger] = useState(0);

  const activeChapter: ChapterDef =
    CHAPTER_DEFINITIONS.find((c) => c.id === activeChapterId) || CHAPTER_DEFINITIONS[0];

  // Initialize chapter setup
  const initChapter = (chapId: number) => {
    setActiveChapterId(chapId);
    setIsCurrentPuzzleSolved(false);
    setCoreStage(1);
    setTrials({ count0: 0, count1: 0, history: [] });

    const sim = simulatorRef.current;
    if (chapId === 6) {
      // Chapter 6 starts after forward sequence H -> Z -> X from |0⟩
      sim.prepare(QuantumState.zero());
      sim.applyGate('H');
      sim.applyGate('Z');
      sim.applyGate('X');
    } else {
      sim.prepare(QuantumState.zero());
    }
    setRenderTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    initChapter(1);

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsConsoleOpen(false);
        setShowSandbox(false);
        setShowTheoryGuide(false);
        setShowHowToPlay(false);
      }
      if (e.key.toLowerCase() === 'h' && !isConsoleOpen) {
        setShowHowToPlay((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Check puzzle target conditions whenever state changes
  const checkPuzzleSolved = () => {
    const sim = simulatorRef.current;
    const st = sim.currentState;
    let solved = false;

    switch (activeChapterId) {
      case 1:
        // Basis state |1⟩
        if (st.isEquivalentTo(QuantumState.one())) solved = true;
        break;

      case 2:
        // X gate flips |0⟩ to |1⟩
        if (st.isEquivalentTo(QuantumState.one())) solved = true;
        break;

      case 3:
        // Superposition |+⟩
        if (st.isEquivalentTo(QuantumState.plus())) solved = true;
        break;

      case 4:
        // HZH yields |1⟩
        if (st.isEquivalentTo(QuantumState.one())) solved = true;
        break;

      case 5:
        // X then H yields |−⟩
        if (st.isEquivalentTo(QuantumState.minus())) solved = true;
        break;

      case 6:
        // True inverse X-Z-H restores initial |0⟩
        if (st.isEquivalentTo(QuantumState.zero()) && sim.history.length === 0) solved = true;
        break;

      case 7:
        // Measurement collapse & trials
        if (sim.isCollapsed && trials.count0 + trials.count1 >= 5) solved = true;
        break;

      case 8:
        // Core multi-stage repair (All 6 stages from primary goal specification)
        // Stage 1: Reach |1⟩ from |0⟩ using X.
        // Stage 2: Reach |+⟩ from |0⟩ using H.
        // Stage 3: Reach |−⟩ from |0⟩ using H then Z.
        // Stage 4: Reach |1⟩ from |0⟩ using H then Z then H, with X unavailable.
        // Stage 5: Reverse a displayed unitary sequence (H -> Z -> X inverted with X -> Z -> H).
        // Stage 6: Identify measurement boundary and use fresh preparation rather than inverse gates.
        if (coreStage === 1 && st.isEquivalentTo(QuantumState.one())) {
          sound.playSuccess();
          setCoreStage(2);
          sim.prepare(QuantumState.zero());
        } else if (coreStage === 2 && st.isEquivalentTo(QuantumState.plus())) {
          sound.playSuccess();
          setCoreStage(3);
          sim.prepare(QuantumState.zero());
        } else if (coreStage === 3 && st.isEquivalentTo(QuantumState.minus())) {
          sound.playSuccess();
          setCoreStage(4);
          sim.prepare(QuantumState.zero());
        } else if (coreStage === 4 && st.isEquivalentTo(QuantumState.one())) {
          sound.playSuccess();
          setCoreStage(5);
          // Set up forward sequence H -> Z -> X to be inverted
          sim.prepare(QuantumState.zero());
          sim.applyGate('H');
          sim.applyGate('Z');
          sim.applyGate('X');
        } else if (coreStage === 5 && st.isEquivalentTo(QuantumState.zero()) && sim.history.length === 0) {
          sound.playSuccess();
          setCoreStage(6);
          // Create measurement collapse boundary
          sim.prepare(QuantumState.plus());
          sim.measure();
        } else if (coreStage === 6 && !sim.isCollapsed) {
          // Player used fresh preparation to restore coherent state!
          solved = true;
        }
        break;
    }

    if (solved && !isCurrentPuzzleSolved) {
      setIsCurrentPuzzleSolved(true);
      sound.playSuccess();
    }
  };

  const handleGateApplied = (gate: GateType) => {
    sound.playGate(gate === 'X' ? 440 : gate === 'Z' ? 554 : 659);
    simulatorRef.current.applyGate(gate);
    setRenderTrigger((prev) => prev + 1);
    checkPuzzleSolved();
  };

  const handleInverseApplied = () => {
    sound.playGate(392);
    simulatorRef.current.applyLastInverse();
    setRenderTrigger((prev) => prev + 1);
    checkPuzzleSolved();
  };

  const handleReset = () => {
    sound.playGate(330);
    initChapter(activeChapterId);
  };

  const handlePrepare = (toOne: boolean) => {
    sound.playGate(toOne ? 520 : 360);
    simulatorRef.current.prepare(toOne ? QuantumState.one() : QuantumState.zero());
    setRenderTrigger((prev) => prev + 1);
    checkPuzzleSolved();
  };

  const handleMeasure = () => {
    sound.playCollapse();
    const outcome = simulatorRef.current.measure();
    setTrials((prev) => ({
      count0: prev.count0 + (outcome === 0 ? 1 : 0),
      count1: prev.count1 + (outcome === 1 ? 1 : 0),
      history: [...(prev.history || []).slice(-39), outcome],
    }));
    setRenderTrigger((prev) => prev + 1);
    checkPuzzleSolved();
  };

  const handleRunTrials = (count: number) => {
    sound.playCollapse();
    let c0 = 0;
    let c1 = 0;
    const sim = simulatorRef.current;
    // Mathematically accurate Born Rule sampling from the user's CURRENT quantum state!
    const p0 = sim.currentState.prob0;
    const recent: (0 | 1)[] = [];

    for (let i = 0; i < count; i++) {
      const outcome: 0 | 1 = Math.random() < p0 ? 0 : 1;
      if (outcome === 0) c0++;
      else c1++;
      if (i >= count - 24) {
        recent.push(outcome);
      }
    }

    setTrials((prev) => ({
      count0: prev.count0 + c0,
      count1: prev.count1 + c1,
      history: [...(prev.history || []).slice(-(40 - recent.length)), ...recent],
    }));
    setRenderTrigger((prev) => prev + 1);
    checkPuzzleSolved();
  };

  const handleResetTrials = () => {
    setTrials({ count0: 0, count1: 0, history: [] });
  };

  const handleAdvanceChapter = () => {
    if (activeChapterId >= 8) {
      setIsConsoleOpen(false);
      setIsGameCompleted(true);
      sound.playSuccess();
    } else {
      initChapter(activeChapterId + 1);
      setIsConsoleOpen(false);
    }
  };

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-slate-950 text-slate-100 select-none">
      {/* Top Main Navigation Bar */}
      <header className="h-14 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-20 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-emerald-400 flex items-center justify-center font-bold text-white shadow-md shadow-sky-950">
            Ψ
          </div>
          <div>
            <h1 className="font-extrabold tracking-tight text-sm sm:text-base text-white flex items-center gap-2">
              QUANTUM ECHO
              <span className="text-slate-400 font-normal hidden md:inline">| The City That Forgot</span>
            </h1>
          </div>
        </div>

        {/* Center: District Navigator */}
        <div className="flex items-center gap-1 sm:gap-2">
          <select
            value={activeChapterId}
            onChange={(e) => initChapter(Number(e.target.value))}
            className="bg-slate-800 text-xs text-sky-300 font-mono py-1.5 px-3 rounded-lg border border-slate-700 outline-none cursor-pointer hover:bg-slate-750"
          >
            {CHAPTER_DEFINITIONS.map((c) => (
              <option key={c.id} value={c.id}>
                District {c.id}: {c.district}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsConsoleOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white shadow transition"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Open Terminal</span>
          </button>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHowToPlay(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900 text-xs font-bold transition shadow"
            title="How to Play & Controls Guide [H]"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>How to Play [H]</span>
          </button>

          <button
            onClick={() => setShowTheoryGuide(!showTheoryGuide)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Quantum Computing Theory Reference"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSandbox(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-900 text-xs font-medium transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Sandbox
          </button>

          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* 3D Interactive City Canvas & Player */}
      <div className="relative flex-1 min-h-0 w-full overflow-hidden">
        <CityGameCanvas
          quantumState={simulatorRef.current.currentState}
          activeChapter={activeChapterId}
          onEnterConsole={(chapId) => {
            initChapter(chapId);
            setIsConsoleOpen(true);
          }}
          isConsoleOpen={isConsoleOpen}
        />

        {/* Floating Mini HUD Widget on Bottom Right */}
        <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-3 pointer-events-none">
          <div className="pointer-events-auto scale-90 sm:scale-100 origin-top-right shadow-2xl">
            <BlochSphereCanvas state={simulatorRef.current.currentState} />
          </div>

          <div className="pointer-events-auto bg-slate-900/90 border border-slate-800 p-3 rounded-xl backdrop-blur font-mono text-xs flex flex-col gap-1 w-64 shadow-xl">
            <div className="flex justify-between text-slate-400">
              <span>Current District:</span>
              <span className="font-bold text-sky-400">{activeChapter.district}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Echo State |ψ⟩:</span>
              <span className="text-emerald-300 font-semibold truncate max-w-[120px]">
                {simulatorRef.current.currentState.formatDirac()}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Relative Phase:</span>
              <span className="text-pink-400 font-semibold">
                {simulatorRef.current.currentState.relativePhase.toFixed(2)} rad
              </span>
            </div>
          </div>
        </div>

        {/* Chapter Progress Indicators along bottom edge */}
        <div className="absolute bottom-3 right-4 z-10 hidden md:flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800/80 backdrop-blur">
          <span className="text-[11px] font-mono text-slate-400 mr-1.5">Progress:</span>
          {CHAPTER_DEFINITIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => initChapter(c.id)}
              className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs transition ${
                c.id === activeChapterId
                  ? 'bg-sky-500 font-bold text-slate-950 ring-2 ring-sky-300'
                  : c.id < activeChapterId
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-500'
              }`}
              title={`District ${c.id}: ${c.district}`}
            >
              {c.id}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Puzzle Console Modal */}
      {isConsoleOpen && (
        <ConsoleUI
          chapter={activeChapter}
          simulator={simulatorRef.current}
          onGateApplied={handleGateApplied}
          onInverseApplied={handleInverseApplied}
          onReset={handleReset}
          onPrepare={handlePrepare}
          onMeasure={handleMeasure}
          onRunTrials={handleRunTrials}
          onResetTrials={handleResetTrials}
          trials={trials}
          onClose={() => setIsConsoleOpen(false)}
          onAdvanceChapter={handleAdvanceChapter}
          isSolved={isCurrentPuzzleSolved}
          coreStage={coreStage}
        />
      )}

      {/* Free Sandbox Experimentation Mode */}
      {showSandbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold font-mono">
                <Sparkles className="w-5 h-5" />
                <span>Quantum Sandbox & Single-Qubit Laboratory</span>
              </div>
              <button
                onClick={() => setShowSandbox(false)}
                className="text-slate-400 hover:text-white px-2 py-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Freely prepare any state and apply any single-qubit unitary gate (including Pauli-Y, Phase S, and T gates). Test quantum reversibility and verify Born Rule measurement statistics on any state!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <div className="text-xs font-mono font-semibold text-slate-400">Available Unitary Gates</div>
                <div className="grid grid-cols-4 gap-2">
                  {(['X', 'Z', 'H', 'Y', 'S', 'Sdg', 'T', 'Tdg'] as GateType[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => handleGateApplied(g)}
                      className="py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 font-mono text-xs font-bold text-sky-200 transition"
                    >
                      {g}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleInverseApplied}
                    disabled={!simulatorRef.current.canApplyInverse()}
                    className="flex-1 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-xs font-mono text-amber-200 border border-amber-500/40 disabled:opacity-40"
                  >
                    Last Inverse
                  </button>
                  <button
                    onClick={() => handlePrepare(false)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200"
                  >
                    Prep |0⟩
                  </button>
                  <button
                    onClick={() => handlePrepare(true)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200"
                  >
                    Prep |1⟩
                  </button>
                </div>

                {/* State Card */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs space-y-1.5 text-slate-300">
                  <div className="text-center font-bold text-sky-200 text-sm py-1 bg-slate-900 rounded">
                    {simulatorRef.current.currentState.formatDirac()}
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-sky-400">P(|0⟩): {(simulatorRef.current.currentState.prob0 * 100).toFixed(2)}%</span>
                    <span className="text-amber-400">P(|1⟩): {(simulatorRef.current.currentState.prob1 * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-pink-400">
                    <span>Phase φ: {simulatorRef.current.currentState.relativePhase.toFixed(2)} rad</span>
                    <span>Norm: {(simulatorRef.current.currentState.prob0 + simulatorRef.current.currentState.prob1).toFixed(4)}</span>
                  </div>
                </div>
              </div>

              {/* Bloch Sphere in Sandbox */}
              <div className="flex flex-col items-center justify-center">
                <BlochSphereCanvas state={simulatorRef.current.currentState} />
              </div>
            </div>

            {/* Born Rule Verification in Sandbox */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
                  Born Rule Measurement Statistics
                </span>
                <span className="text-[10px] text-slate-400">
                  Total Shots: {trials.count0 + trials.count1}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-sky-300">
                  <span>|0⟩ Observed: {trials.count0}</span>
                  <span className="font-bold float-right">
                    {trials.count0 + trials.count1 > 0
                      ? ((trials.count0 / (trials.count0 + trials.count1)) * 100).toFixed(2)
                      : '0.00'}%
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-amber-300">
                  <span>|1⟩ Observed: {trials.count1}</span>
                  <span className="font-bold float-right">
                    {trials.count0 + trials.count1 > 0
                      ? ((trials.count1 / (trials.count0 + trials.count1)) * 100).toFixed(2)
                      : '0.00'}%
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleMeasure}
                  className="flex-1 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-xs font-bold text-red-200"
                >
                  Single Shot
                </button>
                <button
                  onClick={() => handleRunTrials(50)}
                  className="flex-1 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-xs font-bold text-purple-200"
                >
                  +50
                </button>
                <button
                  onClick={() => handleRunTrials(200)}
                  className="flex-1 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-xs font-bold text-purple-200"
                >
                  +200
                </button>
                <button
                  onClick={() => handleRunTrials(1000)}
                  className="flex-1 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-xs font-bold text-indigo-200"
                >
                  +1,000
                </button>
                <button
                  onClick={handleResetTrials}
                  disabled={trials.count0 + trials.count1 === 0}
                  className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs text-slate-300 disabled:opacity-40"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theory & Concept Guide Modal */}
      {showTheoryGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-sky-400 font-mono flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-400" />
                Quantum Computing Field Guide
              </h3>
              <button
                onClick={() => setShowTheoryGuide(false)}
                className="text-slate-400 hover:text-white px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans text-slate-300 leading-relaxed">
              <section className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                <h4 className="font-bold font-mono text-sky-300 mb-1">1. Qubit Basis States |0⟩ & |1⟩</h4>
                <p>
                  A classical bit is 0 or 1. A qubit is represented as a state vector |ψ⟩ = α|0⟩ + β|1⟩ in a 2-dimensional complex vector space. The complex amplitudes satisfy |α|² + |β|² = 1.
                </p>
              </section>

              <section className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                <h4 className="font-bold font-mono text-emerald-300 mb-1">2. Superposition & Hadamard (H)</h4>
                <p>
                  Applying H to |0⟩ yields |+⟩ = (|0⟩ + |1⟩)/√2. The qubit has amplitude 1/√2 for both states, yielding equal measurement odds (50/50). Superposition is not a random classical mixture; the state preserves relative phase.
                </p>
              </section>

              <section className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                <h4 className="font-bold font-mono text-pink-300 mb-1">3. Relative Phase & Pauli-Z</h4>
                <p>
                  The state |−⟩ = (|0⟩ − |1⟩)/√2 has identical 50/50 measurement probabilities to |+⟩, but a relative phase of π radians. Applying H to |+⟩ yields |0⟩, whereas applying H to |−⟩ yields |1⟩! Relative phase produces constructive and destructive interference.
                </p>
              </section>

              <section className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                <h4 className="font-bold font-mono text-amber-300 mb-1">4. Reversibility & Inverses</h4>
                <p>
                  Unitary operations preserve quantum information and can be inverted. For sequence U = C · B · A, the inverse is U⁻¹ = A⁻¹ · B⁻¹ · C⁻¹. Gates and sequence order must both be inverted.
                </p>
              </section>

              <section className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                <h4 className="font-bold font-mono text-purple-300 mb-1">5. Measurement vs. Unitary Gates</h4>
                <p>
                  Measurement is non-unitary and irreversible. It collapses the state into |0⟩ or |1⟩ according to Born's rule (|α|² and |β|²). An arbitrary pre-measurement state cannot be reconstructed from the measurement outcome alone.
                </p>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Victory Ending Screen */}
      {isGameCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-lg animate-in fade-in duration-500">
          <div className="max-w-xl text-center space-y-5 p-8 rounded-3xl bg-slate-900 border border-emerald-500/50 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <Trophy className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white font-mono">
              THE ECHO CORE IS STABILIZED
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed font-serif italic">
              "Mira, you understood what the Auditor could not: true harmony is not the eradication of uncertainty through premature measurement, but the deliberate cultivation of coherent possibilities."
            </p>
            <p className="text-xs font-mono text-amber-400">— Dr. Ishan's Final Recovered Transmission</p>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300 text-left space-y-1.5">
              <div className="text-emerald-400 font-bold mb-2">Mastered Principles:</div>
              <div>✓ Basis states |0⟩ and |1⟩ & complex amplitudes</div>
              <div>✓ Coherent superposition & Hadamard gate H</div>
              <div>✓ Relative phase, Pauli-Z, & interference</div>
              <div>✓ Gate order non-commutativity (XH ≠ HX)</div>
              <div>✓ Unitary reversibility & inverse sequences</div>
              <div>✓ Born-rule measurement collapse & state repreparation</div>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => {
                  setIsGameCompleted(false);
                  initChapter(1);
                }}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white transition"
              >
                Replay Campaign
              </button>
              <button
                onClick={() => {
                  setIsGameCompleted(false);
                  setShowSandbox(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition"
              >
                Explore Sandbox Lab
              </button>
            </div>
          </div>
        </div>
      )}
      {/* How to Play Guide Modal */}
      <HowToPlayModal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />
    </div>
  );
}

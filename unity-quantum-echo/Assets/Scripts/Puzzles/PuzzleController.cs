using System;
using UnityEngine;
using QuantumEcho.Quantum;

namespace QuantumEcho.Puzzles
{
    public class PuzzleController : MonoBehaviour
    {
        [Header("State")]
        [SerializeField] private int activeChapterIndex = 0;
        private QuantumSimulator simulator;
        private PuzzleData currentPuzzle;

        [Header("Echo Core Stages")]
        private int coreStage = 1;

        public event Action<PuzzleData> OnPuzzleLoaded;
        public event Action<QuantumState> OnStateUpdated;
        public event Action<string> OnHintShown;
        public event Action<string> OnPuzzleSolved;
        public event Action<int, int> OnTrialsUpdated; // trials0, trials1

        private int hintLevel = 0;
        private int trials0 = 0;
        private int trials1 = 0;

        public QuantumSimulator Simulator => simulator;
        public PuzzleData CurrentPuzzle => currentPuzzle;
        public int CoreStage => coreStage;
        public int ActiveChapterIndex => activeChapterIndex;

        private void Awake()
        {
            simulator = new QuantumSimulator(QuantumState.Zero);
            simulator.OnStateChanged += HandleStateChanged;
        }

        private void Start()
        {
            LoadChapter(1);
        }

        public void LoadChapter(int chapterId)
        {
            activeChapterIndex = chapterId;
            var chapters = ChapterRegistry.GetAllChapters();
            currentPuzzle = chapters.Find(c => c.chapterId == chapterId) ?? chapters[0];
            hintLevel = 0;
            coreStage = 1;
            trials0 = 0;
            trials1 = 0;

            // Set up initial state according to chapter requirements
            switch (chapterId)
            {
                case 6:
                    // In Chapter 6, initial state has already undergone H -> Z -> X from |0⟩
                    simulator.Prepare(QuantumState.Zero);
                    simulator.ApplyGate(GateType.H);
                    simulator.ApplyGate(GateType.Z);
                    simulator.ApplyGate(GateType.X);
                    break;
                default:
                    simulator.Prepare(QuantumState.Zero);
                    break;
            }

            OnPuzzleLoaded?.Invoke(currentPuzzle);
            OnStateUpdated?.Invoke(simulator.CurrentState);
        }

        public void ApplyGate(GateType gate)
        {
            if (currentPuzzle == null) return;
            simulator.ApplyGate(gate);
            CheckPuzzleConditions();
        }

        public void ApplyLastInverse()
        {
            if (!simulator.CanApplyInverse())
            {
                Debug.LogWarning("Cannot apply inverse across measurement collapse or empty history!");
                return;
            }
            simulator.ApplyLastInverse();
            CheckPuzzleConditions();
        }

        public void PrepareState(bool toOne)
        {
            simulator.Prepare(toOne ? QuantumState.One : QuantumState.Zero);
            CheckPuzzleConditions();
        }

        public void MeasureState()
        {
            int outcome = simulator.Measure();
            if (outcome == 0) trials0++; else trials1++;
            OnTrialsUpdated?.Invoke(trials0, trials1);
            CheckPuzzleConditions();
        }

        public void RunMultipleTrials(int count = 50)
        {
            for (int i = 0; i < count; i++)
            {
                // Each trial MUST reprepare fresh state!
                simulator.Prepare(QuantumState.Plus);
                int outcome = simulator.Measure();
                if (outcome == 0) trials0++; else trials1++;
            }
            OnTrialsUpdated?.Invoke(trials0, trials1);
            CheckPuzzleConditions();
        }

        public void ResetPuzzle()
        {
            LoadChapter(activeChapterIndex);
        }

        public void RequestHint()
        {
            if (currentPuzzle == null || currentPuzzle.hints.Length == 0) return;
            string hint = currentPuzzle.hints[Mathf.Clamp(hintLevel, 0, currentPuzzle.hints.Length - 1)];
            hintLevel = Mathf.Min(hintLevel + 1, currentPuzzle.hints.Length - 1);
            OnHintShown?.Invoke(hint);
        }

        private void HandleStateChanged(QuantumState state)
        {
            OnStateUpdated?.Invoke(state);
        }

        private void CheckPuzzleConditions()
        {
            if (currentPuzzle == null) return;
            var st = simulator.CurrentState;

            bool solved = false;

            switch (activeChapterIndex)
            {
                case 1:
                    // Requires basis state |1⟩
                    if (st.IsEquivalentTo(QuantumState.One)) solved = true;
                    break;

                case 2:
                    // Requires |1⟩
                    if (st.IsEquivalentTo(QuantumState.One)) solved = true;
                    break;

                case 3:
                    // Requires equal superposition |+⟩
                    if (st.IsEquivalentTo(QuantumState.Plus)) solved = true;
                    break;

                case 4:
                    // Requires |1⟩ formed via phase interference H-Z-H
                    if (st.IsEquivalentTo(QuantumState.One)) solved = true;
                    break;

                case 5:
                    // Requires |−⟩ formed via X then H
                    if (st.IsEquivalentTo(QuantumState.Minus)) solved = true;
                    break;

                case 6:
                    // Reversal vault: must return to |0⟩ by inverting H-Z-X with X-Z-H
                    if (st.IsEquivalentTo(QuantumState.Zero) && simulator.History.Count == 0) solved = true;
                    break;

                case 7:
                    // Measurement station: requires observing collapse and trials
                    if (simulator.IsCollapsed && (trials0 + trials1) >= 5) solved = true;
                    break;

                case 8:
                    // Core staged repair (All 6 stages from primary goal specification)
                    // 1. Reach |1⟩ from |0⟩ using X.
                    // 2. Reach |+⟩ from |0⟩ using H.
                    // 3. Reach |−⟩ from |0⟩ using H then Z.
                    // 4. Reach |1⟩ from |0⟩ using H then Z then H, with X unavailable.
                    // 5. Reverse a displayed unitary sequence.
                    // 6. Identify a measurement boundary and use fresh preparation rather than inverse gates.
                    if (coreStage == 1 && st.IsEquivalentTo(QuantumState.One))
                    {
                        coreStage = 2;
                        simulator.Prepare(QuantumState.Zero);
                    }
                    else if (coreStage == 2 && st.IsEquivalentTo(QuantumState.Plus))
                    {
                        coreStage = 3;
                        simulator.Prepare(QuantumState.Zero);
                    }
                    else if (coreStage == 3 && st.IsEquivalentTo(QuantumState.Minus))
                    {
                        coreStage = 4;
                        simulator.Prepare(QuantumState.Zero);
                    }
                    else if (coreStage == 4 && st.IsEquivalentTo(QuantumState.One))
                    {
                        coreStage = 5;
                        // Set up forward sequence H -> Z -> X to be inverted
                        simulator.Prepare(QuantumState.Zero);
                        simulator.ApplyGate(GateType.H);
                        simulator.ApplyGate(GateType.Z);
                        simulator.ApplyGate(GateType.X);
                    }
                    else if (coreStage == 5 && st.IsEquivalentTo(QuantumState.Zero) && simulator.History.Count == 0)
                    {
                        coreStage = 6;
                        // Create measurement collapse boundary
                        simulator.Prepare(QuantumState.Plus);
                        simulator.Measure();
                    }
                    else if (coreStage == 6 && !simulator.IsCollapsed)
                    {
                        // Coherence restored with fresh preparation
                        solved = true;
                    }
                    break;
            }

            if (solved)
            {
                OnPuzzleSolved?.Invoke(currentPuzzle.successExplanation);
            }
        }
    }
}

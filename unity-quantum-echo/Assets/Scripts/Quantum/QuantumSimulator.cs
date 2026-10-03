using System;

namespace QuantumEcho.Quantum
{
    /// <summary>
    /// Deterministic single-qubit simulator engine.
    /// Handles gate application, inverse application, Born-rule measurement, and trials accumulation.
    /// </summary>
    public class QuantumSimulator
    {
        private QuantumState initialState;
        private QuantumState currentState;
        private readonly GateHistory history = new GateHistory();
        private bool isCollapsedByMeasurement = false;
        private int? lastMeasurementOutcome = null;

        public event Action<QuantumState> OnStateChanged;
        public event Action<int> OnMeasurementOccurred;
        public event Action OnResetOccurred;

        public QuantumState CurrentState => currentState;
        public QuantumState InitialState => initialState;
        public GateHistory History => history;
        public bool IsCollapsed => isCollapsedByMeasurement;
        public int? LastMeasurement => lastMeasurementOutcome;

        public QuantumSimulator(QuantumState initial = null)
        {
            initialState = initial?.Clone() ?? QuantumState.Zero;
            currentState = initialState.Clone();
        }

        public void Prepare(QuantumState state)
        {
            initialState = state.Clone();
            currentState = state.Clone();
            history.Clear();
            isCollapsedByMeasurement = false;
            lastMeasurementOutcome = null;
            OnStateChanged?.Invoke(currentState);
            OnResetOccurred?.Invoke();
        }

        public QuantumState ApplyGate(GateType gateType)
        {
            var gate = QuantumGate.Get(gateType);
            var before = currentState.Clone();
            var after = gate.Apply(before);

            history.Add(new GateStep(gateType, before, after));
            currentState = after;

            OnStateChanged?.Invoke(currentState);
            return currentState;
        }

        public bool CanApplyInverse()
        {
            // Quantum lesson: cannot apply unitary inverse across irreversible measurement collapse!
            if (isCollapsedByMeasurement && history.Count == 0) return false;
            return history.Count > 0;
        }

        public GateType? GetLastInverseGate()
        {
            if (!CanApplyInverse()) return null;
            var step = history.Peek();
            if (step == null) return null;
            var gate = QuantumGate.Get(step.GateType);
            return gate.InverseType;
        }

        public QuantumState ApplyLastInverse()
        {
            var invType = GetLastInverseGate();
            if (!invType.HasValue) return null;

            history.Pop();
            var invGate = QuantumGate.Get(invType.Value);
            currentState = invGate.Apply(currentState);

            OnStateChanged?.Invoke(currentState);
            return currentState;
        }

        /// <summary>
        /// Measures the qubit in computational basis {|0⟩, |1⟩} using Born rule.
        /// Collapses state to |0⟩ with probability |α|² or |1⟩ with probability |β|².
        /// Note: Reversal is blocked across measurement boundary.
        /// </summary>
        public int Measure(double? fixedRandomValue = null)
        {
            double r = fixedRandomValue ?? new Random().NextDouble();
            double p0 = currentState.Prob0;

            int outcome = (r < p0) ? 0 : 1;
            lastMeasurementOutcome = outcome;
            isCollapsedByMeasurement = true;

            currentState = (outcome == 0) ? QuantumState.Zero : QuantumState.One;
            history.Clear(); // Measurement erases coherent unitary history

            OnMeasurementOccurred?.Invoke(outcome);
            OnStateChanged?.Invoke(currentState);
            return outcome;
        }

        public void Reset()
        {
            Prepare(initialState);
        }
    }
}

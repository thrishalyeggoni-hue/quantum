using System;
using System.Collections.Generic;

namespace QuantumEcho.Quantum
{
    [Serializable]
    public class GateStep
    {
        public GateType GateType { get; }
        public QuantumState StateBefore { get; }
        public QuantumState StateAfter { get; }
        public DateTime Timestamp { get; }

        public GateStep(GateType gateType, QuantumState before, QuantumState after)
        {
            GateType = gateType;
            StateBefore = before;
            StateAfter = after;
            Timestamp = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Tracks chronological unitary history for reversibility and visualization.
    /// </summary>
    public class GateHistory
    {
        private readonly List<GateStep> steps = new List<GateStep>();

        public IReadOnlyList<GateStep> Steps => steps;
        public int Count => steps.Count;

        public void Add(GateStep step)
        {
            steps.Add(step);
        }

        public GateStep Pop()
        {
            if (steps.Count == 0) return null;
            int lastIdx = steps.Count - 1;
            var item = steps[lastIdx];
            steps.RemoveAt(lastIdx);
            return item;
        }

        public GateStep Peek()
        {
            if (steps.Count == 0) return null;
            return steps[steps.Count - 1];
        }

        public void Clear()
        {
            steps.Clear();
        }

        public string FormatCircuit()
        {
            if (steps.Count == 0) return "Initial State";
            var names = new List<string>();
            foreach (var s in steps)
            {
                names.Add(s.GateType.ToString());
            }
            return string.Join(" ── ", names);
        }
    }
}

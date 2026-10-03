using System;
using UnityEngine;
using QuantumEcho.Quantum;

namespace QuantumEcho.Tests
{
    /// <summary>
    /// Comprehensive test runner verifying all 13 required mathematical principles
    /// of the quantum simulation engine.
    /// Can be executed from Unity menu or standalone.
    /// </summary>
    public static class QuantumSimulatorTests
    {
        public static bool RunAllTests()
        {
            int passed = 0;
            int total = 13;

            Debug.Log("<color=#70d4ff>=== Starting Quantum Echo Engine Mathematical Verification ===</color>");

            // Test 1: X twice returns initial state
            {
                var sim = new QuantumSimulator(QuantumState.Zero);
                sim.ApplyGate(GateType.X);
                bool ok1 = sim.CurrentState.IsEquivalentTo(QuantumState.One);
                sim.ApplyGate(GateType.X);
                bool ok2 = sim.CurrentState.IsEquivalentTo(QuantumState.Zero);
                if (ok1 && ok2) { passed++; Debug.Log("✓ Test 1 Passed: X twice returns initial state"); }
                else Debug.LogError("✗ Test 1 Failed: X twice");
            }

            // Test 2: Z twice returns initial state
            {
                var sim = new QuantumSimulator(QuantumState.Plus);
                sim.ApplyGate(GateType.Z);
                bool ok1 = sim.CurrentState.IsEquivalentTo(QuantumState.Minus);
                sim.ApplyGate(GateType.Z);
                bool ok2 = sim.CurrentState.IsEquivalentTo(QuantumState.Plus);
                if (ok1 && ok2) { passed++; Debug.Log("✓ Test 2 Passed: Z twice returns initial state"); }
                else Debug.LogError("✗ Test 2 Failed: Z twice");
            }

            // Test 3: H twice returns initial state
            {
                var sim = new QuantumSimulator(QuantumState.Zero);
                sim.ApplyGate(GateType.H);
                bool ok1 = sim.CurrentState.IsEquivalentTo(QuantumState.Plus);
                sim.ApplyGate(GateType.H);
                bool ok2 = sim.CurrentState.IsEquivalentTo(QuantumState.Zero);
                if (ok1 && ok2) { passed++; Debug.Log("✓ Test 3 Passed: H twice returns initial state"); }
                else Debug.LogError("✗ Test 3 Failed: H twice");
            }

            // Test 4: H|0> = |+>
            {
                var sim = new QuantumSimulator(QuantumState.Zero);
                sim.ApplyGate(GateType.H);
                bool ok = sim.CurrentState.IsEquivalentTo(QuantumState.Plus)
                    && Math.Abs(sim.CurrentState.Prob0 - 0.5) < 1e-6
                    && Math.Abs(sim.CurrentState.Prob1 - 0.5) < 1e-6
                    && Math.Abs(sim.CurrentState.RelativePhase) < 1e-6;
                if (ok) { passed++; Debug.Log("✓ Test 4 Passed: H|0> = |+> (50/50 probabilities, 0 relative phase)"); }
                else Debug.LogError("✗ Test 4 Failed: H|0> = |+>");
            }

            // Test 5: H|1> = |->
            {
                var sim = new QuantumSimulator(QuantumState.One);
                sim.ApplyGate(GateType.H);
                bool ok = sim.CurrentState.IsEquivalentTo(QuantumState.Minus)
                    && Math.Abs(sim.CurrentState.Prob0 - 0.5) < 1e-6
                    && Math.Abs(sim.CurrentState.Prob1 - 0.5) < 1e-6
                    && Math.Abs(Math.Abs(sim.CurrentState.RelativePhase) - Math.PI) < 1e-6;
                if (ok) { passed++; Debug.Log("✓ Test 5 Passed: H|1> = |-> (50/50 probabilities, π relative phase)"); }
                else Debug.LogError("✗ Test 5 Failed: H|1> = |->");
            }

            // Test 6: H, then Z, then H maps |0> to |1>
            {
                var sim = new QuantumSimulator(QuantumState.Zero);
                sim.ApplyGate(GateType.H);
                sim.ApplyGate(GateType.Z);
                sim.ApplyGate(GateType.H);
                bool ok = sim.CurrentState.IsEquivalentTo(QuantumState.One);
                if (ok) { passed++; Debug.Log("✓ Test 6 Passed: HZH maps |0> to |1> via interference"); }
                else Debug.LogError("✗ Test 6 Failed: HZH maps |0> to |1>");
            }

            // Test 7: X then H differs from H then X starting at |0>
            {
                var sim1 = new QuantumSimulator(QuantumState.Zero);
                sim1.ApplyGate(GateType.X);
                sim1.ApplyGate(GateType.H); // X then H gives |->

                var sim2 = new QuantumSimulator(QuantumState.Zero);
                sim2.ApplyGate(GateType.H);
                sim2.ApplyGate(GateType.X); // H then X gives |+>

                bool ok = !sim1.CurrentState.IsEquivalentTo(sim2.CurrentState)
                    && sim1.CurrentState.IsEquivalentTo(QuantumState.Minus)
                    && sim2.CurrentState.IsEquivalentTo(QuantumState.Plus);
                if (ok) { passed++; Debug.Log("✓ Test 7 Passed: Gate order matters (XH ≠ HX, |−⟩ vs |+⟩)"); }
                else Debug.LogError("✗ Test 7 Failed: Gate order");
            }

            // Test 8: Applying correct inverse sequence restores several normalized test states
            {
                QuantumState[] testStates = {
                    QuantumState.Zero,
                    QuantumState.One,
                    QuantumState.Plus,
                    QuantumState.Minus,
                    QuantumState.PlusI
                };

                bool allRestored = true;
                foreach (var st in testStates)
                {
                    var sim = new QuantumSimulator(st);
                    sim.ApplyGate(GateType.H);
                    sim.ApplyGate(GateType.Z);
                    sim.ApplyGate(GateType.X);

                    // Reversible undo: X, Z, H
                    sim.ApplyLastInverse(); // Undoes X
                    sim.ApplyLastInverse(); // Undoes Z
                    sim.ApplyLastInverse(); // Undoes H

                    if (!sim.CurrentState.IsEquivalentTo(st))
                    {
                        allRestored = false;
                        break;
                    }
                }

                if (allRestored) { passed++; Debug.Log("✓ Test 8 Passed: Inverse sequence (X, Z, H) restores arbitrary states"); }
                else Debug.LogError("✗ Test 8 Failed: Inverse sequence restoration");
            }

            // Test 9: Unit norm is preserved during gate sequences
            {
                var sim = new QuantumSimulator(QuantumState.Zero);
                GateType[] seq = { GateType.H, GateType.T, GateType.X, GateType.S, GateType.Z, GateType.H, GateType.Y };
                bool preserved = true;
                foreach (var g in seq)
                {
                    sim.ApplyGate(g);
                    if (Math.Abs(sim.CurrentState.Norm - 1.0) > 1e-6)
                    {
                        preserved = false;
                        break;
                    }
                }
                if (preserved) { passed++; Debug.Log("✓ Test 9 Passed: Unit norm preserved through unitary gate sequence"); }
                else Debug.LogError("✗ Test 9 Failed: Unit norm preservation");
            }

            // Test 10: Global-phase-equivalent states pass target checks
            {
                var stateA = QuantumState.One;
                var phaseFactor = ComplexNumber.FromPolar(1.0, 1.85); // e^(i * 1.85)
                var stateB = new QuantumState(ComplexNumber.Zero, ComplexNumber.One * phaseFactor);
                bool ok = stateA.IsEquivalentTo(stateB) && Math.Abs(stateA.FidelityWith(stateB) - 1.0) < 1e-6;
                if (ok) { passed++; Debug.Log("✓ Test 10 Passed: Gauge invariance under global phase factor F = 1.0"); }
                else Debug.LogError("✗ Test 10 Failed: Global phase equivalence");
            }

            // Test 11: Measurement collapses correctly
            {
                var sim0 = new QuantumSimulator(QuantumState.Plus);
                int outcome0 = sim0.Measure(0.2); // Outcome 0
                bool ok0 = (outcome0 == 0) && sim0.CurrentState.IsEquivalentTo(QuantumState.Zero) && !sim0.CanApplyInverse();

                var sim1 = new QuantumSimulator(QuantumState.Plus);
                int outcome1 = sim1.Measure(0.8); // Outcome 1
                bool ok1 = (outcome1 == 1) && sim1.CurrentState.IsEquivalentTo(QuantumState.One);

                if (ok0 && ok1) { passed++; Debug.Log("✓ Test 11 Passed: Measurement collapses correctly & blocks inverse"); }
                else Debug.LogError("✗ Test 11 Failed: Measurement collapse");
            }

            // Test 12: Measurement trials reprepare the state
            {
                int count0 = 0;
                int count1 = 0;
                int trials = 1000;
                var sim = new QuantumSimulator();
                for (int i = 0; i < trials; i++)
                {
                    sim.Prepare(QuantumState.Plus);
                    int outcome = sim.Measure();
                    if (outcome == 0) count0++; else count1++;
                }
                double ratio = (double)count0 / trials;
                bool ok = ratio > 0.42 && ratio < 0.58;
                if (ok) { passed++; Debug.Log($"✓ Test 12 Passed: 1000 fresh trials yielded {count0} |0⟩ and {count1} |1⟩ ({ratio * 100:F1}%)"); }
                else Debug.LogError($"✗ Test 12 Failed: Measurement trial distribution ({ratio})");
            }

            // Test 13: Bloch coordinates match known states
            {
                Vector3 b0 = QuantumState.Zero.BlochCoordinates;
                Vector3 b1 = QuantumState.One.BlochCoordinates;
                Vector3 bp = QuantumState.Plus.BlochCoordinates;
                Vector3 bm = QuantumState.Minus.BlochCoordinates;
                Vector3 bpi = QuantumState.PlusI.BlochCoordinates;
                Vector3 bmi = QuantumState.MinusI.BlochCoordinates;

                bool ok = Mathf.Abs(b0.z - 1f) < 1e-4 // |0⟩ is (0, 0, 1)
                    && Mathf.Abs(b1.z + 1f) < 1e-4     // |1⟩ is (0, 0, -1)
                    && Mathf.Abs(bp.x - 1f) < 1e-4     // |+⟩ is (1, 0, 0)
                    && Mathf.Abs(bm.x + 1f) < 1e-4     // |−⟩ is (-1, 0, 0)
                    && Mathf.Abs(bpi.y - 1f) < 1e-4    // |+i⟩ is (0, 1, 0)
                    && Mathf.Abs(bmi.y + 1f) < 1e-4;   // |−i⟩ is (0, -1, 0)

                if (ok) { passed++; Debug.Log("✓ Test 13 Passed: Bloch sphere coordinates match all 6 cardinal poles"); }
                else Debug.LogError("✗ Test 13 Failed: Bloch coordinates matching");
            }

            Debug.Log($"<color=#90ff90>=== QUANTUM ENGINE VERIFICATION RESULT: {passed}/{total} TESTS PASSED ===</color>");
            return passed == total;
        }
    }
}

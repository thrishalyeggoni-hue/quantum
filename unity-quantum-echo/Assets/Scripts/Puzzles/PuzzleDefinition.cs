using System;
using System.Collections.Generic;
using UnityEngine;
using QuantumEcho.Quantum;

namespace QuantumEcho.Puzzles
{
    [Serializable]
    public class PuzzleData
    {
        public int chapterId;
        public string districtName;
        public string puzzleTitle;
        [TextArea(2, 5)] public string storyBrief;
        [TextArea(2, 5)] public string objectiveText;
        public string targetStateName;
        public GateType[] allowedGates;
        public bool allowInverse = true;
        public bool allowReset = true;
        public bool allowMeasurement = false;
        public bool allowPreparation = false;
        public string[] hints = new string[3];
        [TextArea(2, 4)] public string successExplanation;
        [TextArea(2, 4)] public string journalEntry;
    }

    public static class ChapterRegistry
    {
        public static List<PuzzleData> GetAllChapters()
        {
            return new List<PuzzleData>
            {
                // Chapter 1: Arrival Harbor
                new PuzzleData
                {
                    chapterId = 1,
                    districtName = "Arrival Harbor",
                    puzzleTitle = "What is a Qubit? Basis States",
                    storyBrief = "Mira arrives at the floating docks of Aster to search for Dr. Ishan. She finds Lumi, a damaged drone, trapped behind a dead service gate. The lock requires computational basis states.",
                    objectiveText = "Prepare basis state |1⟩ to unlock the gate terminal, then inspect both basis states.",
                    targetStateName = "|1⟩",
                    allowedGates = new GateType[] { GateType.X },
                    allowInverse = true,
                    allowReset = true,
                    allowMeasurement = true,
                    allowPreparation = true,
                    hints = new string[]
                    {
                        "Basis state |0⟩ has 100% probability of measuring 0. Basis state |1⟩ has 100% probability of measuring 1.",
                        "Use the preparation console or the X gate to switch between the basis states.",
                        "The upper terminal demands |1⟩: prepare |1⟩ or apply X to |0⟩ to activate the circuit."
                    },
                    successExplanation = "Qubits have two orthonormal basis states: |0⟩ = [1, 0]ᵀ and |1⟩ = [0, 1]ᵀ. Measurement in this basis is completely deterministic for pure basis states.",
                    journalEntry = "Dr. Ishan's Log #1: 'A qubit is not merely an on/off switch; it is a vector in a two-dimensional Hilbert space. Its basis states |0⟩ and |1⟩ are the foundation of all that follows.'"
                },

                // Chapter 2: Switchworks
                new PuzzleData
                {
                    chapterId = 2,
                    districtName = "Switchworks",
                    puzzleTitle = "The X Gate (Bit-Flip)",
                    storyBrief = "The transport elevators of Switchworks are jammed with inverted polarities. Lumi remembers that unitary operations can be undone by reapplying them.",
                    objectiveText = "Starting from |0⟩, use the X gate to reach |1⟩, then test that applying X a second time returns to |0⟩.",
                    targetStateName = "|1⟩",
                    allowedGates = new GateType[] { GateType.X },
                    allowInverse = true,
                    allowReset = true,
                    allowMeasurement = false,
                    allowPreparation = false,
                    hints =
                    {
                        "The Pauli-X gate acts as quantum NOT: X|0⟩ = |1⟩ and X|1⟩ = |0⟩.",
                        "X is a 180° rotation around the X-axis of the Bloch sphere.",
                        "Because X · X = Identity, the X gate is its own inverse!"
                    },
                    successExplanation = "The Pauli-X gate maps α|0⟩ + β|1⟩ to β|0⟩ + α|1⟩. It is unitary and Hermitian (X = X†), meaning X is self-inverse: applying X twice returns the exact starting state.",
                    journalEntry = "Dr. Ishan's Log #2: 'Engineers designed the Switchworks around unitary evolutions. Because X is self-inverse, no information is lost when bits flip.'"
                },

                // Chapter 3: Twin-Light Garden
                new PuzzleData
                {
                    chapterId = 3,
                    districtName = "The Twin-Light Garden",
                    puzzleTitle = "Superposition and the Hadamard H Gate",
                    storyBrief = "The garden's water canals and twin light branches depend on equal superposition. A coherence relay checks for state |+⟩.",
                    objectiveText = "Transform |0⟩ into equal superposition |+⟩ = (|0⟩ + |1⟩)/√2 using the Hadamard (H) gate.",
                    targetStateName = "|+⟩",
                    allowedGates = new GateType[] { GateType.H },
                    allowInverse = true,
                    allowReset = true,
                    allowMeasurement = true,
                    allowPreparation = false,
                    hints =
                    {
                        "The Hadamard (H) gate creates an equal superposition: H|0⟩ = (|0⟩ + |1⟩)/√2.",
                        "Notice the two light branches on your lantern: they represent complex probability amplitudes, not two separate classical lanterns.",
                        "Measuring in the computational basis gives 50% chance for 0 and 50% for 1, but before measurement the state is in a genuine coherent superposition."
                    },
                    successExplanation = "H creates superposition: each basis state has amplitude 1/√2, giving measurement probability |1/√2|² = 1/2 (50%). Applying H again returns H|+⟩ = |0⟩.",
                    journalEntry = "Dr. Ishan's Log #3: 'Superposition is not ignorance. It is not that the coin is secretly heads or tails; the coin is genuinely in flight until measured.'"
                },

                // Chapter 4: Phase Observatory
                new PuzzleData
                {
                    chapterId = 4,
                    districtName = "Phase Observatory",
                    puzzleTitle = "The Z Gate and Relative Phase",
                    storyBrief = "The observatory's interference lens detects relative phase. The beacon has equal 50/50 probabilities but fails because its phase is misaligned.",
                    objectiveText = "From |0⟩, create |+⟩ with H, apply Z to reach |−⟩, then apply H to produce |1⟩ and light the beacon.",
                    targetStateName = "|1⟩",
                    allowedGates = new GateType[] { GateType.H, GateType.Z },
                    allowInverse = true,
                    allowReset = true,
                    allowMeasurement = false,
                    allowPreparation = false,
                    hints =
                    {
                        "Pauli-Z acts as: Z|0⟩ = |0⟩ and Z|1⟩ = −|1⟩. It leaves probabilities identical (50/50) but changes relative phase from 0 to π radians (180°).",
                        "When you apply Z to |+⟩, you create |−⟩ = (|0⟩ − |1⟩)/√2.",
                        "Now apply H: H|−⟩ = |1⟩ through constructive and destructive quantum interference! The sequence is: H → Z → H."
                    },
                    successExplanation = "Relative phase changes how amplitudes interfere. While |+⟩ and |−⟩ have identical 50/50 computational measurement odds, H|+⟩ = |0⟩ while H|−⟩ = |1⟩. Quantum algorithms exploit this interference!",
                    journalEntry = "Dr. Ishan's Log #4: 'Probabilities tell you where you might arrive; relative phase tells you how possibilities interfere along the way.'"
                },

                // Chapter 5: Echo Bridge
                new PuzzleData
                {
                    chapterId = 5,
                    districtName = "Echo Bridge",
                    puzzleTitle = "Gate Order and Non-Commutativity",
                    storyBrief = "Two bridge relays require specific relative phases. Mira must realize that the order in which quantum gates are applied directly alters the resulting state.",
                    objectiveText = "Reach |−⟩ from |0⟩ using gate order (X then H), observing that this differs from (H then X = |+⟩).",
                    targetStateName = "|−⟩",
                    allowedGates = new GateType[] { GateType.X, GateType.H },
                    allowInverse = true,
                    allowReset = true,
                    allowMeasurement = false,
                    allowPreparation = false,
                    hints =
                    {
                        "Notice: X|0⟩ = |1⟩, then H|1⟩ = |−⟩.",
                        "If you apply H first, H|0⟩ = |+⟩, then X|+⟩ = |+⟩ (since X swaps |0⟩ and |1⟩, keeping |+⟩ unchanged).",
                        "Thus, X · H ≠ H · X! Quantum gates are matrix multiplications and do not generally commute."
                    },
                    successExplanation = "Matrix multiplication is non-commutative. Starting from |0⟩, X then H yields |−⟩ (relative phase π), whereas H then X yields |+⟩ (relative phase 0). Gate order is crucial!",
                    journalEntry = "Dr. Ishan's Log #5: 'In the classical world, flipping a switch and tuning a dial might commute. In the quantum realm, the sequence of operations sculpts the wavefunction.'"
                },

                // Chapter 6: Reversal Vault
                new PuzzleData
                {
                    chapterId = 6,
                    districtName = "The Reversal Vault",
                    puzzleTitle = "Reversibility & Inverse Sequences",
                    storyBrief = "Mira reaches Dr. Ishan's encrypted archive vault. The lock recorded a forward transformation: H, then Z, then X. To unlock it, she must apply the inverse sequence.",
                    objectiveText = "From the perturbed state (H → Z → X from |0⟩), apply the true inverse sequence (X → Z → H) to restore the archive key.",
                    targetStateName = "|0⟩",
                    allowedGates = new GateType[] { GateType.X, GateType.Z, GateType.H },
                    allowInverse = true,
                    allowReset = true,
                    allowMeasurement = false,
                    allowPreparation = false,
                    hints =
                    {
                        "For a sequence of unitary operations U = U_n · ... · U_2 · U_1, the inverse is U⁻¹ = U_1⁻¹ · U_2⁻¹ · ... · U_n⁻¹.",
                        "Since X, Z, and H are self-inverse (X⁻¹=X, Z⁻¹=Z, H⁻¹=H), you must apply them in REVERSE order: first X, then Z, then H!",
                        "Use the 'Apply Last Inverse' feature or manually apply X, then Z, then H."
                    },
                    successExplanation = "Reversible computation requires reversing both the gates and their chronological order: (A B C)⁻¹ = C⁻¹ B⁻¹ A⁻¹. Repeating gates in original order does not invert the circuit!",
                    journalEntry = "Dr. Ishan's Log #6: 'Every coherent quantum gate can be run in reverse if the history is preserved. Unitary physics is fundamentally reversible.'"
                },

                // Chapter 7: Measurement Station
                new PuzzleData
                {
                    chapterId = 7,
                    districtName = "Measurement Station",
                    puzzleTitle = "Measurement: The Limit of Reversal",
                    storyBrief = "The Auditor's collapse sensors are forcibly measuring qubits in the computational basis, destroying superposition. Mira must witness why measurement cannot be inverted.",
                    objectiveText = "Prepare |+⟩, trigger measurement, observe state collapse to |0⟩ or |1⟩, and observe that quantum undo is blocked across the measurement boundary.",
                    targetStateName = "Collapsed",
                    allowedGates = new GateType[] { GateType.H, GateType.X },
                    allowInverse = true,
                    allowReset = true,
                    allowMeasurement = true,
                    allowPreparation = true,
                    hints =
                    {
                        "Prepare |+⟩ with H, then press 'Measure'.",
                        "The wavefunction collapses irreversibly to |0⟩ or |1⟩ according to Born's rule (|α|² and |β|²).",
                        "Notice that 'Apply Last Inverse' becomes unavailable! Knowing only the measurement outcome does not allow you to recover the pre-measurement superposition."
                    },
                    successExplanation = "Unlike unitary gates, projective measurement is non-unitary and irreversible. It projects the state onto an eigenbasis and discards relative phase information. Recovery requires fresh preparation from known instructions.",
                    journalEntry = "Dr. Ishan's Log #7: 'The Auditor sought perfect predictability, but measurement collapses the very coherence that gives Aster life. You cannot un-measure a qubit.'"
                },

                // Chapter 8: The Echo Core
                new PuzzleData
                {
                    chapterId = 8,
                    districtName = "The Echo Core",
                    puzzleTitle = "Restoration of the Echo Core",
                    storyBrief = "Mira arrives at the central tower overlooking Aster. She must repair all 5 primary stabilizer nodes of the Echo Core using the complete repertoire of quantum skills.",
                    objectiveText = "Synthesize all quantum principles: 1) Reach |1⟩; 2) Reach |+⟩; 3) Reach |−⟩; 4) Reach |1⟩ via H-Z-H without X; 5) Reverse unitary sequence; 6) Stabilize with fresh preparation.",
                    targetStateName = "Stabilized Core",
                    allowedGates = new GateType[] { GateType.X, GateType.Z, GateType.H },
                    allowInverse = true,
                    allowReset = true,
                    allowMeasurement = true,
                    allowPreparation = true,
                    hints =
                    {
                        "Stage 1: X flips |0⟩ to |1⟩.",
                        "Stage 2: H creates |+⟩ from |0⟩.",
                        "Stage 3: H then Z creates |−⟩.",
                        "Stage 4: Without X available, H → Z → H maps |0⟩ to |1⟩ through phase interference!"
                    },
                    successExplanation = "The Echo Core is fully stabilized! Through unitary evolution, phase control, and deliberate state preparation, the floating city of Aster is saved.",
                    journalEntry = "Dr. Ishan's Final Transmission: 'Mira, you did not simply reverse time; you rebuilt our world through understanding. Coherence is preserved.'"
                }
            };
        }
    }
}

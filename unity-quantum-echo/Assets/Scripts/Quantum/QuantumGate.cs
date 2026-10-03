using System;

namespace QuantumEcho.Quantum
{
    public enum GateType
    {
        I,
        X,
        Z,
        H,
        Y,
        S,
        Sdg,
        T,
        Tdg
    }

    /// <summary>
    /// Represents a single-qubit unitary quantum gate (2x2 complex matrix).
    /// </summary>
    public class QuantumGate
    {
        public GateType Type { get; }
        public ComplexNumber[,] Matrix { get; }
        public string Name => Type.ToString();
        public string Description { get; }
        public GateType InverseType { get; }

        public QuantumGate(GateType type, ComplexNumber[,] matrix, string description, GateType inverseType)
        {
            Type = type;
            Matrix = matrix;
            Description = description;
            InverseType = inverseType;
        }

        private static readonly double InvSqrt2 = 1.0 / Math.Sqrt(2.0);

        public static readonly QuantumGate Identity = new QuantumGate(
            GateType.I,
            new ComplexNumber[,]
            {
                { ComplexNumber.One, ComplexNumber.Zero },
                { ComplexNumber.Zero, ComplexNumber.One }
            },
            "Identity: leaves the state unchanged.",
            GateType.I
        );

        public static readonly QuantumGate X = new QuantumGate(
            GateType.X,
            new ComplexNumber[,]
            {
                { ComplexNumber.Zero, ComplexNumber.One },
                { ComplexNumber.One, ComplexNumber.Zero }
            },
            "Pauli-X (NOT gate): swaps basis states |0⟩ and |1⟩. 180° rotation around the Bloch X-axis.",
            GateType.X
        );

        public static readonly QuantumGate Z = new QuantumGate(
            GateType.Z,
            new ComplexNumber[,]
            {
                { ComplexNumber.One, ComplexNumber.Zero },
                { ComplexNumber.Zero, new ComplexNumber(-1.0, 0.0) }
            },
            "Pauli-Z (Phase flip): leaves |0⟩ unchanged, negates |1⟩. 180° rotation around the Bloch Z-axis.",
            GateType.Z
        );

        public static readonly QuantumGate H = new QuantumGate(
            GateType.H,
            new ComplexNumber[,]
            {
                { new ComplexNumber(InvSqrt2, 0.0), new ComplexNumber(InvSqrt2, 0.0) },
                { new ComplexNumber(InvSqrt2, 0.0), new ComplexNumber(-InvSqrt2, 0.0) }
            },
            "Hadamard (H): creates equal superposition. 180° rotation around the (X+Z)/√2 axis.",
            GateType.H
        );

        public static readonly QuantumGate Y = new QuantumGate(
            GateType.Y,
            new ComplexNumber[,]
            {
                { ComplexNumber.Zero, new ComplexNumber(0.0, -1.0) },
                { new ComplexNumber(0.0, 1.0), ComplexNumber.Zero }
            },
            "Pauli-Y: bit and phase flip. 180° rotation around Y-axis.",
            GateType.Y
        );

        public static readonly QuantumGate S = new QuantumGate(
            GateType.S,
            new ComplexNumber[,]
            {
                { ComplexNumber.One, ComplexNumber.Zero },
                { ComplexNumber.Zero, new ComplexNumber(0.0, 1.0) }
            },
            "Phase gate (√Z): adds 90° (π/2) relative phase to |1⟩.",
            GateType.Sdg
        );

        public static readonly QuantumGate Sdg = new QuantumGate(
            GateType.Sdg,
            new ComplexNumber[,]
            {
                { ComplexNumber.One, ComplexNumber.Zero },
                { ComplexNumber.Zero, new ComplexNumber(0.0, -1.0) }
            },
            "Inverse Phase gate (S†): subtracts 90° (π/2) relative phase from |1⟩.",
            GateType.S
        );

        public static readonly QuantumGate T = new QuantumGate(
            GateType.T,
            new ComplexNumber[,]
            {
                { ComplexNumber.One, ComplexNumber.Zero },
                { ComplexNumber.Zero, new ComplexNumber(InvSqrt2, InvSqrt2) }
            },
            "T gate (π/8): adds 45° (π/4) relative phase to |1⟩.",
            GateType.Tdg
        );

        public static readonly QuantumGate Tdg = new QuantumGate(
            GateType.Tdg,
            new ComplexNumber[,]
            {
                { ComplexNumber.One, ComplexNumber.Zero },
                { ComplexNumber.Zero, new ComplexNumber(InvSqrt2, -InvSqrt2) }
            },
            "Inverse T gate (T†): subtracts 45° (π/4) relative phase from |1⟩.",
            GateType.T
        );

        public static QuantumGate Get(GateType type)
        {
            return type switch
            {
                GateType.X => X,
                GateType.Z => Z,
                GateType.H => H,
                GateType.Y => Y,
                GateType.S => S,
                GateType.Sdg => Sdg,
                GateType.T => T,
                GateType.Tdg => Tdg,
                _ => Identity
            };
        }

        public QuantumState Apply(QuantumState state)
        {
            ComplexNumber newAlpha = (Matrix[0, 0] * state.Alpha) + (Matrix[0, 1] * state.Beta);
            ComplexNumber newBeta  = (Matrix[1, 0] * state.Alpha) + (Matrix[1, 1] * state.Beta);
            return new QuantumState(newAlpha, newBeta);
        }
    }
}

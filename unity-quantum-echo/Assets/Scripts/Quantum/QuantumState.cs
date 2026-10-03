using System;
using UnityEngine;

namespace QuantumEcho.Quantum
{
    /// <summary>
    /// Represents a pure single-qubit quantum state |ψ⟩ = α|0⟩ + β|1⟩.
    /// Double-precision complex amplitudes with normalization check and Bloch vector mapping.
    /// </summary>
    [Serializable]
    public class QuantumState
    {
        public static readonly double InvSqrt2 = 1.0 / Math.Sqrt(2.0);

        [SerializeField] private ComplexNumber alpha; // Amplitude for |0⟩
        [SerializeField] private ComplexNumber beta;  // Amplitude for |1⟩

        public ComplexNumber Alpha => alpha;
        public ComplexNumber Beta => beta;

        public QuantumState(ComplexNumber alpha, ComplexNumber beta)
        {
            this.alpha = alpha;
            this.beta = beta;
            Normalize();
        }

        public static QuantumState Zero => new QuantumState(ComplexNumber.One, ComplexNumber.Zero);
        public static QuantumState One => new QuantumState(ComplexNumber.Zero, ComplexNumber.One);
        
        public static QuantumState Plus => new QuantumState(
            new ComplexNumber(InvSqrt2, 0.0),
            new ComplexNumber(InvSqrt2, 0.0)
        );

        public static QuantumState Minus => new QuantumState(
            new ComplexNumber(InvSqrt2, 0.0),
            new ComplexNumber(-InvSqrt2, 0.0)
        );

        public static QuantumState PlusI => new QuantumState(
            new ComplexNumber(InvSqrt2, 0.0),
            new ComplexNumber(0.0, InvSqrt2)
        );

        public static QuantumState MinusI => new QuantumState(
            new ComplexNumber(InvSqrt2, 0.0),
            new ComplexNumber(0.0, -InvSqrt2)
        );

        public QuantumState Clone() => new QuantumState(alpha, beta);

        private void Normalize()
        {
            double normSq = alpha.SqrMagnitude + beta.SqrMagnitude;
            if (normSq > 1e-15 && Math.Abs(normSq - 1.0) > 1e-12)
            {
                double norm = Math.Sqrt(normSq);
                alpha = alpha / norm;
                beta = beta / norm;
            }
        }

        public double Norm => Math.Sqrt(alpha.SqrMagnitude + beta.SqrMagnitude);

        public double Prob0 => alpha.SqrMagnitude;
        public double Prob1 => beta.SqrMagnitude;

        /// <summary>
        /// Relative phase in radians: arg(beta) - arg(alpha).
        /// In range (-π, π].
        /// </summary>
        public double RelativePhase
        {
            get
            {
                if (Prob0 < 1e-9 || Prob1 < 1e-9) return 0.0;
                double diff = beta.Phase - alpha.Phase;
                while (diff > Math.PI) diff -= 2 * Math.PI;
                while (diff <= -Math.PI) diff += 2 * Math.PI;
                return diff;
            }
        }

        /// <summary>
        /// Bloch sphere Cartesian coordinates:
        /// x = 2 * Re(α* · β)
        /// y = 2 * Im(α* · β)
        /// z = |α|² - |β|²
        /// </summary>
        public Vector3 BlochCoordinates
        {
            get
            {
                ComplexNumber prod = alpha.Conjugate * beta;
                float x = (float)(2.0 * prod.Real);
                float y = (float)(2.0 * prod.Imag);
                float z = (float)(Prob0 - Prob1);
                return new Vector3(x, y, z);
            }
        }

        /// <summary>
        /// State fidelity F = |⟨target|this⟩|²
        /// Gauge-invariant: unaffected by global phase factor e^(iθ).
        /// </summary>
        public double FidelityWith(QuantumState target)
        {
            ComplexNumber inner = (target.Alpha.Conjugate * alpha) + (target.Beta.Conjugate * beta);
            return inner.SqrMagnitude;
        }

        /// <summary>
        /// Checks if this state is physically equivalent to target up to global phase.
        /// </summary>
        public bool IsEquivalentTo(QuantumState target, double tolerance = 1e-5)
        {
            return Math.Abs(1.0 - FidelityWith(target)) < tolerance;
        }

        public string FormatDirac()
        {
            return $"{alpha}|0⟩ + {beta}|1⟩";
        }
    }
}

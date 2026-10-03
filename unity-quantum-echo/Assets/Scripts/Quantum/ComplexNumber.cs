using System;

namespace QuantumEcho.Quantum
{
    /// <summary>
    /// Immutable double-precision complex number.
    /// Used for quantum state amplitudes and unitary matrix elements.
    /// </summary>
    [Serializable]
    public readonly struct ComplexNumber : IEquatable<ComplexNumber>
    {
        public double Real { get; }
        public double Imag { get; }

        public ComplexNumber(double real, double imag)
        {
            Real = real;
            Imag = imag;
        }

        public static ComplexNumber Zero => new ComplexNumber(0.0, 0.0);
        public static ComplexNumber One => new ComplexNumber(1.0, 0.0);
        public static ComplexNumber I => new ComplexNumber(0.0, 1.0);

        public static ComplexNumber FromPolar(double magnitude, double phaseRadians)
        {
            return new ComplexNumber(
                magnitude * Math.Cos(phaseRadians),
                magnitude * Math.Sin(phaseRadians)
            );
        }

        public double Magnitude => Math.Sqrt(Real * Real + Imag * Imag);
        public double SqrMagnitude => Real * Real + Imag * Imag;
        public double Phase => Math.Atan2(Imag, Real);

        public ComplexNumber Conjugate => new ComplexNumber(Real, -Imag);

        public static ComplexNumber operator +(ComplexNumber a, ComplexNumber b)
            => new ComplexNumber(a.Real + b.Real, a.Imag + b.Imag);

        public static ComplexNumber operator -(ComplexNumber a, ComplexNumber b)
            => new ComplexNumber(a.Real - b.Real, a.Imag - b.Imag);

        public static ComplexNumber operator -(ComplexNumber a)
            => new ComplexNumber(-a.Real, -a.Imag);

        public static ComplexNumber operator *(ComplexNumber a, ComplexNumber b)
            => new ComplexNumber(
                a.Real * b.Real - a.Imag * b.Imag,
                a.Real * b.Imag + a.Imag * b.Real
            );

        public static ComplexNumber operator *(ComplexNumber a, double scalar)
            => new ComplexNumber(a.Real * scalar, a.Imag * scalar);

        public static ComplexNumber operator *(double scalar, ComplexNumber a)
            => new ComplexNumber(a.Real * scalar, a.Imag * scalar);

        public static ComplexNumber operator /(ComplexNumber a, double scalar)
        {
            if (Math.Abs(scalar) < 1e-15) return Zero;
            return new ComplexNumber(a.Real / scalar, a.Imag / scalar);
        }

        public static ComplexNumber operator /(ComplexNumber a, ComplexNumber b)
        {
            double denom = b.Real * b.Real + b.Imag * b.Imag;
            if (denom < 1e-15) return Zero;
            return new ComplexNumber(
                (a.Real * b.Real + a.Imag * b.Imag) / denom,
                (a.Imag * b.Real - a.Real * b.Imag) / denom
            );
        }

        public bool Equals(ComplexNumber other)
            => Math.Abs(Real - other.Real) < 1e-9 && Math.Abs(Imag - other.Imag) < 1e-9;

        public override bool Equals(object obj)
            => obj is ComplexNumber other && Equals(other);

        public override int GetHashCode()
            => HashCode.Combine(Real, Imag);

        public static bool operator ==(ComplexNumber left, ComplexNumber right) => left.Equals(right);
        public static bool operator !=(ComplexNumber left, ComplexNumber right) => !left.Equals(right);

        public override string ToString()
        {
            if (Math.Abs(Imag) < 1e-4) return Real.ToString("F3");
            if (Math.Abs(Real) < 1e-4) return $"{Imag:F3}i";
            return $"({Real:F3} {(Imag >= 0 ? "+" : "-")} {Math.Abs(Imag):F3}i)";
        }
    }
}

/**
 * Quantum Echo - Quantum Computing Simulator
 * Deterministic single-qubit state-vector simulator using complex amplitudes and double precision.
 */

export interface Complex {
  real: number;
  imag: number;
}

export const ComplexMath = {
  create: (real = 0, imag = 0): Complex => ({ real, imag }),
  zero: (): Complex => ({ real: 0, imag: 0 }),
  one: (): Complex => ({ real: 1, imag: 0 }),
  i: (): Complex => ({ real: 0, imag: 1 }),

  add: (a: Complex, b: Complex): Complex => ({
    real: a.real + b.real,
    imag: a.imag + b.imag,
  }),

  sub: (a: Complex, b: Complex): Complex => ({
    real: a.real - b.real,
    imag: a.imag - b.imag,
  }),

  mul: (a: Complex, b: Complex): Complex => ({
    real: a.real * b.real - a.imag * b.imag,
    imag: a.real * b.imag + a.imag * b.real,
  }),

  scale: (a: Complex, s: number): Complex => ({
    real: a.real * s,
    imag: a.imag * s,
  }),

  div: (a: Complex, b: Complex): Complex => {
    const denom = b.real * b.real + b.imag * b.imag;
    if (denom === 0) return { real: 0, imag: 0 };
    return {
      real: (a.real * b.real + a.imag * b.imag) / denom,
      imag: (a.imag * b.real - a.real * b.imag) / denom,
    };
  },

  conjugate: (a: Complex): Complex => ({
    real: a.real,
    imag: -a.imag,
  }),

  sqrMagnitude: (a: Complex): number => a.real * a.real + a.imag * a.imag,

  magnitude: (a: Complex): number => Math.sqrt(a.real * a.real + a.imag * a.imag),

  phase: (a: Complex): number => Math.atan2(a.imag, a.real),
};

export type Matrix2x2 = [[Complex, Complex], [Complex, Complex]];

export const INV_SQRT2 = 1 / Math.SQRT2;

export interface BlochVector {
  x: number;
  y: number;
  z: number;
}

export class QuantumState {
  alpha: Complex; // Amplitude of |0>
  beta: Complex;  // Amplitude of |1>

  constructor(alpha: Complex, beta: Complex) {
    this.alpha = { ...alpha };
    this.beta = { ...beta };
    this.normalize();
  }

  static zero(): QuantumState {
    return new QuantumState(ComplexMath.one(), ComplexMath.zero());
  }

  static one(): QuantumState {
    return new QuantumState(ComplexMath.zero(), ComplexMath.one());
  }

  static plus(): QuantumState {
    return new QuantumState(
      ComplexMath.create(INV_SQRT2, 0),
      ComplexMath.create(INV_SQRT2, 0)
    );
  }

  static minus(): QuantumState {
    return new QuantumState(
      ComplexMath.create(INV_SQRT2, 0),
      ComplexMath.create(-INV_SQRT2, 0)
    );
  }

  static plusI(): QuantumState {
    return new QuantumState(
      ComplexMath.create(INV_SQRT2, 0),
      ComplexMath.create(0, INV_SQRT2)
    );
  }

  static minusI(): QuantumState {
    return new QuantumState(
      ComplexMath.create(INV_SQRT2, 0),
      ComplexMath.create(0, -INV_SQRT2)
    );
  }

  clone(): QuantumState {
    return new QuantumState(this.alpha, this.beta);
  }

  normalize(): void {
    const normSq = ComplexMath.sqrMagnitude(this.alpha) + ComplexMath.sqrMagnitude(this.beta);
    if (normSq > 0 && Math.abs(normSq - 1.0) > 1e-12) {
      const norm = Math.sqrt(normSq);
      this.alpha = ComplexMath.scale(this.alpha, 1 / norm);
      this.beta = ComplexMath.scale(this.beta, 1 / norm);
    }
  }

  get norm(): number {
    return Math.sqrt(ComplexMath.sqrMagnitude(this.alpha) + ComplexMath.sqrMagnitude(this.beta));
  }

  get prob0(): number {
    return ComplexMath.sqrMagnitude(this.alpha);
  }

  get prob1(): number {
    return ComplexMath.sqrMagnitude(this.beta);
  }

  /**
   * Relative phase φ = arg(beta) - arg(alpha) in radians (-π to π).
   * Meaningful when neither alpha nor beta is 0.
   */
  get relativePhase(): number {
    if (this.prob0 < 1e-9 || this.prob1 < 1e-9) {
      return 0;
    }
    const phaseAlpha = ComplexMath.phase(this.alpha);
    const phaseBeta = ComplexMath.phase(this.beta);
    let diff = phaseBeta - phaseAlpha;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff <= -Math.PI) diff += 2 * Math.PI;
    return diff;
  }

  /**
   * Bloch coordinates:
   * x = 2 * Re(conj(α) * β)
   * y = 2 * Im(conj(α) * β)
   * z = |α|² - |β|²
   */
  get blochCoordinates(): BlochVector {
    const conjAlpha = ComplexMath.conjugate(this.alpha);
    const prod = ComplexMath.mul(conjAlpha, this.beta);
    return {
      x: 2 * prod.real,
      y: 2 * prod.imag,
      z: this.prob0 - this.prob1,
    };
  }

  /**
   * Fidelity F = |<target|this>|^2
   * Gauge-invariant under global phase factor e^(iθ).
   */
  fidelityWith(target: QuantumState): number {
    const innerProd = ComplexMath.add(
      ComplexMath.mul(ComplexMath.conjugate(target.alpha), this.alpha),
      ComplexMath.mul(ComplexMath.conjugate(target.beta), this.beta)
    );
    return ComplexMath.sqrMagnitude(innerProd);
  }

  isEquivalentTo(target: QuantumState, tolerance = 1e-5): boolean {
    return Math.abs(1.0 - this.fidelityWith(target)) < tolerance;
  }

  formatDirac(): string {
    const isReal = (c: Complex) => Math.abs(c.imag) < 1e-4;
    const isPureImag = (c: Complex) => Math.abs(c.real) < 1e-4;

    const formatComponent = (c: Complex) => {
      if (isReal(c)) return c.real.toFixed(3);
      if (isPureImag(c)) return `${c.imag < 0 ? '-' : ''}${Math.abs(c.imag).toFixed(3)}i`;
      const sign = c.imag < 0 ? '-' : '+';
      return `(${c.real.toFixed(3)} ${sign} ${Math.abs(c.imag).toFixed(3)}i)`;
    };

    if (this.prob0 > 0.9999) return '|0⟩';
    if (this.prob1 > 0.9999) {
      if (isReal(this.beta) && this.beta.real < 0) return '−|1⟩';
      return '|1⟩';
    }

    const aStr = formatComponent(this.alpha);
    const bStr = formatComponent(this.beta);

    if (isReal(this.beta) && this.beta.real < 0) {
      return `${aStr}|0⟩ − ${Math.abs(this.beta.real).toFixed(3)}|1⟩`;
    }

    return `${aStr}|0⟩ + ${bStr}|1⟩`;
  }
}

export type GateType = 'I' | 'X' | 'Z' | 'H' | 'Y' | 'S' | 'Sdg' | 'T' | 'Tdg';

export class QuantumGate {
  readonly name: GateType;
  readonly matrix: Matrix2x2;
  readonly description: string;
  readonly inverseName: GateType;

  constructor(name: GateType, matrix: Matrix2x2, description: string, inverseName: GateType) {
    this.name = name;
    this.matrix = matrix;
    this.description = description;
    this.inverseName = inverseName;
  }

  static readonly I = new QuantumGate(
    'I',
    [
      [ComplexMath.one(), ComplexMath.zero()],
      [ComplexMath.zero(), ComplexMath.one()],
    ],
    'Identity: preserves state unchanged.',
    'I'
  );

  static readonly X = new QuantumGate(
    'X',
    [
      [ComplexMath.zero(), ComplexMath.one()],
      [ComplexMath.one(), ComplexMath.zero()],
    ],
    'Pauli-X (NOT): swaps amplitudes of |0⟩ and |1⟩. 180° rotation around X-axis.',
    'X'
  );

  static readonly Z = new QuantumGate(
    'Z',
    [
      [ComplexMath.one(), ComplexMath.zero()],
      [ComplexMath.zero(), ComplexMath.create(-1, 0)],
    ],
    'Pauli-Z (Phase-flip): leaves |0⟩ unchanged, negates |1⟩ amplitude. 180° rotation around Z-axis.',
    'Z'
  );

  static readonly H = new QuantumGate(
    'H',
    [
      [ComplexMath.create(INV_SQRT2, 0), ComplexMath.create(INV_SQRT2, 0)],
      [ComplexMath.create(INV_SQRT2, 0), ComplexMath.create(-INV_SQRT2, 0)],
    ],
    'Hadamard: creates superposition |+⟩ from |0⟩ and |−⟩ from |1⟩. 180° rotation around (X+Z)/√2 axis.',
    'H'
  );

  static readonly Y = new QuantumGate(
    'Y',
    [
      [ComplexMath.zero(), ComplexMath.create(0, -1)],
      [ComplexMath.create(0, 1), ComplexMath.zero()],
    ],
    'Pauli-Y: bit and phase flip combined. 180° rotation around Y-axis.',
    'Y'
  );

  static readonly S = new QuantumGate(
    'S',
    [
      [ComplexMath.one(), ComplexMath.zero()],
      [ComplexMath.zero(), ComplexMath.create(0, 1)],
    ],
    'Phase gate (√Z): adds 90° (π/2) relative phase to |1⟩.',
    'Sdg'
  );

  static readonly Sdg = new QuantumGate(
    'Sdg',
    [
      [ComplexMath.one(), ComplexMath.zero()],
      [ComplexMath.zero(), ComplexMath.create(0, -1)],
    ],
    'Inverse Phase gate (S†): subtracts 90° (π/2) relative phase from |1⟩.',
    'S'
  );

  static readonly T = new QuantumGate(
    'T',
    [
      [ComplexMath.one(), ComplexMath.zero()],
      [ComplexMath.zero(), ComplexMath.create(INV_SQRT2, INV_SQRT2)],
    ],
    'T gate (π/8): adds 45° (π/4) relative phase to |1⟩.',
    'Tdg'
  );

  static readonly Tdg = new QuantumGate(
    'Tdg',
    [
      [ComplexMath.one(), ComplexMath.zero()],
      [ComplexMath.zero(), ComplexMath.create(INV_SQRT2, -INV_SQRT2)],
    ],
    'Inverse T gate (T†): subtracts 45° (π/4) relative phase from |1⟩.',
    'T'
  );

  static getByName(name: GateType): QuantumGate {
    switch (name) {
      case 'X': return QuantumGate.X;
      case 'Z': return QuantumGate.Z;
      case 'H': return QuantumGate.H;
      case 'Y': return QuantumGate.Y;
      case 'S': return QuantumGate.S;
      case 'Sdg': return QuantumGate.Sdg;
      case 'T': return QuantumGate.T;
      case 'Tdg': return QuantumGate.Tdg;
      default: return QuantumGate.I;
    }
  }

  apply(state: QuantumState): QuantumState {
    const a0 = ComplexMath.add(
      ComplexMath.mul(this.matrix[0][0], state.alpha),
      ComplexMath.mul(this.matrix[0][1], state.beta)
    );
    const a1 = ComplexMath.add(
      ComplexMath.mul(this.matrix[1][0], state.alpha),
      ComplexMath.mul(this.matrix[1][1], state.beta)
    );
    return new QuantumState(a0, a1);
  }
}

export interface GateStep {
  gateName: GateType;
  stateBefore: QuantumState;
  stateAfter: QuantumState;
  timestamp: number;
}

export class QuantumSimulator {
  private _currentState: QuantumState;
  private _history: GateStep[] = [];
  private _initialState: QuantumState;
  private _isCollapsedByMeasurement = false;
  private _lastMeasurementOutcome: 0 | 1 | null = null;

  constructor(initialState: QuantumState = QuantumState.zero()) {
    this._initialState = initialState.clone();
    this._currentState = initialState.clone();
  }

  get currentState(): QuantumState {
    return this._currentState;
  }

  get history(): ReadonlyArray<GateStep> {
    return this._history;
  }

  get isCollapsed(): boolean {
    return this._isCollapsedByMeasurement;
  }

  get lastMeasurement(): 0 | 1 | null {
    return this._lastMeasurementOutcome;
  }

  prepare(state: QuantumState): void {
    this._initialState = state.clone();
    this._currentState = state.clone();
    this._history = [];
    this._isCollapsedByMeasurement = false;
    this._lastMeasurementOutcome = null;
  }

  applyGate(gateName: GateType): QuantumState {
    const gate = QuantumGate.getByName(gateName);
    const before = this._currentState.clone();
    const after = gate.apply(before);
    this._history.push({
      gateName,
      stateBefore: before,
      stateAfter: after,
      timestamp: Date.now(),
    });
    this._currentState = after;
    // Note: Applying a gate after measurement evolves the collapsed state unitarily
    return this._currentState;
  }

  canApplyInverse(): boolean {
    // Cannot apply quantum inverse across measurement boundary!
    if (this._isCollapsedByMeasurement && this._history.length === 0) {
      return false;
    }
    return this._history.length > 0;
  }

  getLastInverseGate(): GateType | null {
    if (!this.canApplyInverse()) return null;
    const lastStep = this._history[this._history.length - 1];
    const gate = QuantumGate.getByName(lastStep.gateName);
    return gate.inverseName;
  }

  applyLastInverse(): QuantumState | null {
    const invGateName = this.getLastInverseGate();
    if (!invGateName) return null;
    // Pop the last step from history and apply its mathematical inverse
    this._history.pop();
    const invGate = QuantumGate.getByName(invGateName);
    this._currentState = invGate.apply(this._currentState);
    return this._currentState;
  }

  /**
   * Computational basis measurement:
   * Collapses |ψ⟩ to |0⟩ with prob |α|² or |1⟩ with prob |β|².
   * Irreversible process: original superposition cannot be restored from outcome alone.
   */
  measure(randomValue = Math.random()): 0 | 1 {
    const p0 = this._currentState.prob0;
    const outcome: 0 | 1 = randomValue < p0 ? 0 : 1;
    this._lastMeasurementOutcome = outcome;
    this._isCollapsedByMeasurement = true;
    this._currentState = outcome === 0 ? QuantumState.zero() : QuantumState.one();
    // Clear unitary history across measurement boundary to enforce the quantum lesson
    this._history = [];
    return outcome;
  }

  reset(): void {
    this.prepare(this._initialState);
  }
}

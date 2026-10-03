import { QuantumSimulator, QuantumState, QuantumGate, ComplexMath } from './quantumEngine';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${msg}`);
  }
}

function runTests() {
  console.log('--- Starting Quantum Simulator Verification Tests ---');

  // Test 1: X twice returns initial state
  {
    const sim = new QuantumSimulator(QuantumState.zero());
    sim.applyGate('X');
    assert(sim.currentState.isEquivalentTo(QuantumState.one()), 'X|0> should be |1>');
    sim.applyGate('X');
    assert(sim.currentState.isEquivalentTo(QuantumState.zero()), 'X(X|0>) should be |0>');
    console.log('✓ Test 1 Passed: X twice returns initial state');
  }

  // Test 2: Z twice returns initial state
  {
    const sim = new QuantumSimulator(QuantumState.plus());
    sim.applyGate('Z');
    assert(sim.currentState.isEquivalentTo(QuantumState.minus()), 'Z|+> should be |->');
    sim.applyGate('Z');
    assert(sim.currentState.isEquivalentTo(QuantumState.plus()), 'Z(Z|+>) should be |+>');
    console.log('✓ Test 2 Passed: Z twice returns initial state');
  }

  // Test 3: H twice returns initial state
  {
    const sim = new QuantumSimulator(QuantumState.zero());
    sim.applyGate('H');
    assert(sim.currentState.isEquivalentTo(QuantumState.plus()), 'H|0> should be |+>');
    sim.applyGate('H');
    assert(sim.currentState.isEquivalentTo(QuantumState.zero()), 'H(H|0>) should be |0>');
    console.log('✓ Test 3 Passed: H twice returns initial state');
  }

  // Test 4: H|0> = |+>
  {
    const sim = new QuantumSimulator(QuantumState.zero());
    sim.applyGate('H');
    const plus = QuantumState.plus();
    assert(sim.currentState.isEquivalentTo(plus), 'H|0> must equal |+>');
    assert(Math.abs(sim.currentState.prob0 - 0.5) < 1e-6, 'P(0) must be 0.5');
    assert(Math.abs(sim.currentState.prob1 - 0.5) < 1e-6, 'P(1) must be 0.5');
    assert(Math.abs(sim.currentState.relativePhase) < 1e-6, 'Relative phase of |+> is 0');
    console.log('✓ Test 4 Passed: H|0> = |+> with 50/50 probabilities and 0 relative phase');
  }

  // Test 5: H|1> = |->
  {
    const sim = new QuantumSimulator(QuantumState.one());
    sim.applyGate('H');
    const minus = QuantumState.minus();
    assert(sim.currentState.isEquivalentTo(minus), 'H|1> must equal |->');
    assert(Math.abs(sim.currentState.prob0 - 0.5) < 1e-6, 'P(0) must be 0.5');
    assert(Math.abs(sim.currentState.prob1 - 0.5) < 1e-6, 'P(1) must be 0.5');
    assert(Math.abs(Math.abs(sim.currentState.relativePhase) - Math.PI) < 1e-6, 'Relative phase of |-> is π');
    console.log('✓ Test 5 Passed: H|1> = |-> with 50/50 probabilities and π relative phase');
  }

  // Test 6: H then Z then H maps |0> to |1>
  {
    const sim = new QuantumSimulator(QuantumState.zero());
    sim.applyGate('H'); // -> |+>
    sim.applyGate('Z'); // -> |->
    sim.applyGate('H'); // -> |1>
    assert(sim.currentState.isEquivalentTo(QuantumState.one()), 'HZH|0> must equal |1>');
    console.log('✓ Test 6 Passed: HZH maps |0> to |1>');
  }

  // Test 7: X then H differs from H then X starting at |0>
  {
    const sim1 = new QuantumSimulator(QuantumState.zero());
    sim1.applyGate('X');
    sim1.applyGate('H'); // X then H gives H|1> = |->

    const sim2 = new QuantumSimulator(QuantumState.zero());
    sim2.applyGate('H');
    sim2.applyGate('X'); // H then X gives X|+> = |+>

    assert(!sim1.currentState.isEquivalentTo(sim2.currentState), 'XH|0> must differ from HX|0>');
    assert(sim1.currentState.isEquivalentTo(QuantumState.minus()), 'XH|0> = |->');
    assert(sim2.currentState.isEquivalentTo(QuantumState.plus()), 'HX|0> = |+>');
    // Both have 50/50 probabilities
    assert(Math.abs(sim1.currentState.prob0 - 0.5) < 1e-6 && Math.abs(sim2.currentState.prob0 - 0.5) < 1e-6, 'Both have 50/50');
    // But different relative phase!
    assert(Math.abs(sim1.currentState.relativePhase - Math.PI) < 1e-6 || Math.abs(sim1.currentState.relativePhase + Math.PI) < 1e-6, 'XH phase is π');
    assert(Math.abs(sim2.currentState.relativePhase) < 1e-6, 'HX phase is 0');
    console.log('✓ Test 7 Passed: XH gives |-> while HX gives |+> (different relative phases, non-commuting)');
  }

  // Test 8: Applying correct inverse sequence restores several normalized test states
  {
    const testStates = [
      QuantumState.zero(),
      QuantumState.one(),
      QuantumState.plus(),
      QuantumState.minus(),
      QuantumState.plusI(),
    ];

    for (const st of testStates) {
      const sim = new QuantumSimulator(st);
      // Forward: H, then Z, then X
      sim.applyGate('H');
      sim.applyGate('Z');
      sim.applyGate('X');

      // Undo with mathematically computed inverses: X, then Z, then H
      assert(sim.getLastInverseGate() === 'X', 'First inverse should be X');
      sim.applyLastInverse();
      assert(sim.getLastInverseGate() === 'Z', 'Second inverse should be Z');
      sim.applyLastInverse();
      assert(sim.getLastInverseGate() === 'H', 'Third inverse should be H');
      sim.applyLastInverse();

      assert(sim.currentState.isEquivalentTo(st), 'Inverse sequence must restore initial state');
    }
    console.log('✓ Test 8 Passed: Correct inverse sequence (X, Z, H) restores state across multiple test vectors');
  }

  // Test 9: Unit norm is preserved during gate sequences
  {
    const sim = new QuantumSimulator(QuantumState.zero());
    const sequence: ('X' | 'Z' | 'H' | 'Y' | 'S' | 'T')[] = ['H', 'T', 'X', 'S', 'Z', 'H', 'Y', 'T'];
    for (const g of sequence) {
      sim.applyGate(g);
      assert(Math.abs(sim.currentState.norm - 1.0) < 1e-6, `Norm must be preserved after gate ${g}`);
    }
    console.log('✓ Test 9 Passed: Unit norm preserved through complex unitary gate sequence');
  }

  // Test 10: Global-phase-equivalent states pass target checks
  {
    const stateA = QuantumState.one();
    // Phase by e^(i * 2.1)
    const phaseFactor = ComplexMath.create(Math.cos(2.1), Math.sin(2.1));
    const stateB = new QuantumState(
      ComplexMath.zero(),
      ComplexMath.mul(ComplexMath.one(), phaseFactor)
    );
    assert(stateA.isEquivalentTo(stateB), 'Global phase factor e^(iθ) must yield fidelity 1.0');
    assert(Math.abs(stateA.fidelityWith(stateB) - 1.0) < 1e-6, 'Fidelity must equal 1.0');
    console.log('✓ Test 10 Passed: Gauge invariance under global phase factor confirmed');
  }

  // Test 11: Measurement collapses correctly
  {
    const sim = new QuantumSimulator(QuantumState.plus());
    const outcome0 = sim.measure(0.2); // Below 0.5 -> 0
    assert(outcome0 === 0, 'Outcome should be 0');
    assert(sim.currentState.isEquivalentTo(QuantumState.zero()), 'Collapsed state must be |0>');
    assert(sim.isCollapsed, 'Must be marked collapsed');
    assert(!sim.canApplyInverse(), 'Cannot invert across measurement boundary');

    const simB = new QuantumSimulator(QuantumState.plus());
    const outcome1 = simB.measure(0.8); // Above 0.5 -> 1
    assert(outcome1 === 1, 'Outcome should be 1');
    assert(simB.currentState.isEquivalentTo(QuantumState.one()), 'Collapsed state must be |1>');
    console.log('✓ Test 11 Passed: Measurement collapses correctly to |0> or |1>');
  }

  // Test 12: Measurement trials reprepare the state
  {
    let count0 = 0;
    let count1 = 0;
    const trials = 1000;
    const sim = new QuantumSimulator();
    for (let i = 0; i < trials; i++) {
      sim.prepare(QuantumState.plus());
      const outcome = sim.measure();
      if (outcome === 0) count0++;
      else count1++;
    }
    const ratio0 = count0 / trials;
    assert(ratio0 > 0.4 && ratio0 < 0.6, `Trials ratio ${ratio0} must be around 0.5`);
    console.log(`✓ Test 12 Passed: 1000 trials with fresh preparation yielded ${count0} zeros and ${count1} ones (${(ratio0 * 100).toFixed(1)}%)`);
  }

  // Test 13: Bloch coordinates match known states
  {
    // |0> -> (0, 0, 1)
    const b0 = QuantumState.zero().blochCoordinates;
    assert(Math.abs(b0.x) < 1e-6 && Math.abs(b0.y) < 1e-6 && Math.abs(b0.z - 1) < 1e-6, '|0> bloch (0, 0, 1)');

    // |1> -> (0, 0, -1)
    const b1 = QuantumState.one().blochCoordinates;
    assert(Math.abs(b1.x) < 1e-6 && Math.abs(b1.y) < 1e-6 && Math.abs(b1.z + 1) < 1e-6, '|1> bloch (0, 0, -1)');

    // |+> -> (1, 0, 0)
    const bp = QuantumState.plus().blochCoordinates;
    assert(Math.abs(bp.x - 1) < 1e-6 && Math.abs(bp.y) < 1e-6 && Math.abs(bp.z) < 1e-6, '|+> bloch (1, 0, 0)');

    // |-> -> (-1, 0, 0)
    const bm = QuantumState.minus().blochCoordinates;
    assert(Math.abs(bm.x + 1) < 1e-6 && Math.abs(bm.y) < 1e-6 && Math.abs(bm.z) < 1e-6, '|-> bloch (-1, 0, 0)');

    // |+i> -> (0, 1, 0)
    const bpi = QuantumState.plusI().blochCoordinates;
    assert(Math.abs(bpi.x) < 1e-6 && Math.abs(bpi.y - 1) < 1e-6 && Math.abs(bpi.z) < 1e-6, '|+i> bloch (0, 1, 0)');

    // |-i> -> (0, -1, 0)
    const bmi = QuantumState.minusI().blochCoordinates;
    assert(Math.abs(bmi.x) < 1e-6 && Math.abs(bmi.y + 1) < 1e-6 && Math.abs(bmi.z) < 1e-6, '|-i> bloch (0, -1, 0)');

    console.log('✓ Test 13 Passed: Bloch coordinates match all six cardinal poles exactly');
  }

  console.log('\n>>> ALL 13 QUANTUM MATHEMATICAL TESTS PASSED PERFECTLY! <<<');
}

runTests();

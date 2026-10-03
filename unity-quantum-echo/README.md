# QUANTUM ECHO: THE CITY THAT FORGOT

A playable, third-person story adventure exploring quantum computing fundamentals, set in the floating city of Aster.

---

## 🌌 Primary Educational Concepts Taught

1. **Qubit Basis States:** $|0\rangle$ and $|1\rangle$ as orthonormal vectors in a 2D complex Hilbert space.
2. **Superposition:** The state $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$ with complex amplitudes $\alpha, \beta \in \mathbb{C}$ and normalization $|\alpha|^2 + |\beta|^2 = 1$.
3. **Probability Amplitudes vs. Measurement Probabilities:** Amplitudes $\alpha, \beta$ are complex numbers; Born rule probabilities are $|\alpha|^2$ and $|\beta|^2$.
4. **Relative Phase:** The phase angle $\phi = \arg(\beta) - \arg(\alpha)$. Why $|+\rangle = \frac{|0\rangle+|1\rangle}{\sqrt{2}}$ and $|-\rangle = \frac{|0\rangle-|1\rangle}{\sqrt{2}}$ have identical 50/50 measurement probabilities, yet produce completely opposite results under interference.
5. **Unitary Gates ($X, Z, H$):**
   - **Pauli-X (NOT):** Swaps $|0\rangle \leftrightarrow |1\rangle$. $180^\circ$ rotation around Bloch $X$-axis.
   - **Pauli-Z (Phase-Flip):** $Z|0\rangle = |0\rangle$, $Z|1\rangle = -|1\rangle$. $180^\circ$ rotation around Bloch $Z$-axis.
   - **Hadamard ($H$):** Creates superposition from basis states. $180^\circ$ rotation around the $(X+Z)/\sqrt{2}$ axis.
6. **Gate Order (Non-Commutativity):** Starting from $|0\rangle$, $X$ then $H$ yields $|-\rangle$, while $H$ then $X$ yields $|+\rangle$.
7. **Reversibility and Inverses:** Unitary evolution is strictly reversible. For sequence $U = C \cdot B \cdot A$, the inverse is $U^\dagger = A^\dagger \cdot B^\dagger \cdot C^\dagger$.
8. **Bloch Sphere Coordinates:**
   - $x = 2\text{Re}(\alpha^* \beta)$
   - $y = 2\text{Im}(\alpha^* \beta)$
   - $z = |\alpha|^2 - |\beta|^2$
9. **Measurement vs. Unitary Gates:** Measurement collapses the wavefunction into $|0\rangle$ or $|1\rangle$ and erases relative phase. An arbitrary state cannot generally be reconstructed from its measurement outcome alone.

---

## 🏛️ Eight Districts and Chapters

1. **Arrival Harbor:** What is a Qubit? Inspecting basis states $|0\rangle$ and $|1\rangle$.
2. **Switchworks:** The $X$ Gate. Bit flips and the self-inverse property ($X \cdot X = I$).
3. **The Twin-Light Garden:** Superposition and the $H$ Gate ($H|0\rangle = |+\rangle$). Twin light branches represent complex amplitudes of one state.
4. **Phase Observatory:** The $Z$ Gate. Relative phase $\phi = \pi$ creates $|-\rangle$. Discovering phase interference via $HZH|0\rangle = |1\rangle$.
5. **Echo Bridge:** Gate Order. Showing that $X \cdot H \neq H \cdot X$ starting at $|0\rangle$.
6. **The Reversal Vault:** Inverses. Reversing Dr. Ishan's forward sequence $(H \to Z \to X)$ using the true inverse sequence $(X \to Z \to H)$.
7. **Measurement Station:** The Limit of Reversal. Born-rule collapse, blocking of quantum undo across measurement boundaries, and fresh trials accumulation.
8. **The Echo Core:** Final Multi-Stage Tower Stabilization and recovery of Dr. Ishan's protected archives.

---

## 🛠️ Unity Setup Instructions (Windows PC)

### Requirements
- Unity Editor (Unity 2021.3 LTS, 2022.3 LTS, 2023.x, or Unity 6).
- Standard Built-in Render Pipeline or Universal Render Pipeline (URP).

### Quick Start (Idempotent 1-Click Setup)
1. Open Unity Hub and click **Add project from disk**.
2. Select the `unity-quantum-echo` folder.
3. Open the project in Unity Editor.
4. In the top Unity menu bar, select:
   **`QuantumEcho -> Setup Complete Project & Scene`**
5. The automated script will:
   - Procedurally construct Aster City (platforms, landmarks, lighting, terminals, safety net).
   - Generate Mira's stylized character with procedural walking animation.
   - Configure the third-person follow camera and interaction systems.
   - Wire up the Quantum HUD, Bloch Sphere visualizer, audio synthesizer, and puzzle consoles.
   - Save the scene to `Assets/Scenes/QuantumEchoMain.unity` and register it in Build Settings.
6. Press the **Play** button in Unity!

### Running Tests
To run the automated quantum mathematics test suite:
- Select **`QuantumEcho -> Run Quantum Math Tests`** from the Unity menu.
- All 13 mathematical checks will execute in the console with color-coded verification output.

### Building Windows Standalone Player
- **Option A (Inside Unity):**
  Click **`QuantumEcho -> Build Windows Standalone x64`**. The executable is saved to `Builds/Windows/QuantumEcho.exe`.
- **Option B (PowerShell):**
  Open PowerShell in the project directory and run:
  ```powershell
  .\Build-Windows.ps1
  ```

---

## 🎮 Controls
- **W, A, S, D:** Move Mira through Aster.
- **Mouse:** Rotate third-person camera.
- **Left Shift:** Sprint.
- **Space:** Jump.
- **E:** Interact with Quantum Console terminals.
- **R:** Reset current puzzle to initial state.
- **Escape:** Pause menu or exit terminal mode.

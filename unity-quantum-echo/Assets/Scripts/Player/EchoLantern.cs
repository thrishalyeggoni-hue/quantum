using UnityEngine;
using QuantumEcho.Quantum;

namespace QuantumEcho.Player
{
    /// <summary>
    /// Visual representation of Mira's Echo Lantern.
    /// Modulates central orb and twin branch light orbs based on current quantum state:
    /// - |0⟩: upper branch active (100% blue)
    /// - |1⟩: lower branch active (100% amber)
    /// - Superposition |+⟩ / |−⟩: both branches glowing with equal intensity (50/50),
    ///   with relative phase indicated by physical branch orbit offset and core tint.
    /// </summary>
    public class EchoLantern : MonoBehaviour
    {
        [Header("Renderers")]
        [SerializeField] private MeshRenderer coreOrbRenderer;
        [SerializeField] private MeshRenderer branch0Renderer;
        [SerializeField] private MeshRenderer branch1Renderer;
        [SerializeField] private Transform phaseArrowIndicator;

        [Header("Colors")]
        [SerializeField] private Color color0 = new Color(0.2f, 0.7f, 1.0f);   // Cyan/Blue for |0⟩
        [SerializeField] private Color color1 = new Color(1.0f, 0.5f, 0.1f);   // Amber/Orange for |1⟩
        [SerializeField] private Color phasePlusColor = new Color(0.3f, 1.0f, 0.5f); // Emerald for 0 rad
        [SerializeField] private Color phaseMinusColor = new Color(0.9f, 0.2f, 0.8f); // Magenta for π rad

        private Material coreMat;
        private Material branch0Mat;
        private Material branch1Mat;

        private void Awake()
        {
            if (coreOrbRenderer != null) coreMat = coreOrbRenderer.material;
            if (branch0Renderer != null) branch0Mat = branch0Renderer.material;
            if (branch1Renderer != null) branch1Mat = branch1Renderer.material;
        }

        public void UpdateVisualization(QuantumState state)
        {
            if (state == null) return;

            float p0 = (float)state.Prob0;
            float p1 = (float)state.Prob1;
            float phase = (float)state.RelativePhase; // radians in (-π, π]

            // Modulate branch intensities
            if (branch0Mat != null)
            {
                Color c0 = color0 * Mathf.Clamp01(p0 * 2.0f);
                branch0Mat.SetColor("_EmissionColor", c0);
                branch0Renderer.transform.localScale = Vector3.one * (0.15f + p0 * 0.25f);
            }

            if (branch1Mat != null)
            {
                Color c1 = color1 * Mathf.Clamp01(p1 * 2.0f);
                branch1Mat.SetColor("_EmissionColor", c1);
                branch1Renderer.transform.localScale = Vector3.one * (0.15f + p1 * 0.25f);
            }

            // Phase coloring: interpolate between phasePlusColor (phase 0) and phaseMinusColor (phase π)
            float phaseNormalized = Mathf.Abs(phase) / Mathf.PI; // 0 to 1
            Color phaseColor = Color.Lerp(phasePlusColor, phaseMinusColor, phaseNormalized);

            if (coreMat != null)
            {
                Color blended = (color0 * p0 + color1 * p1 + phaseColor * 0.5f);
                coreMat.SetColor("_EmissionColor", blended * 1.5f);
            }

            // Phase indicator arrow orientation
            if (phaseArrowIndicator != null)
            {
                phaseArrowIndicator.localRotation = Quaternion.Euler(0f, 0f, phase * Mathf.Rad2Deg);
            }
        }
    }
}

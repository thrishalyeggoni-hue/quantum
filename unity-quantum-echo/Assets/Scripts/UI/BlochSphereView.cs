using System.Collections.Generic;
using UnityEngine;
using QuantumEcho.Quantum;

namespace QuantumEcho.UI
{
    /// <summary>
    /// Interactive 3D Bloch Sphere visualization.
    /// Draws the unit sphere wireframe, coordinate axes (X, Y, Z),
    /// basis state poles, current state vector arrow, and persistent trajectory path
    /// whose line color shifts subtly based on relative phase.
    /// </summary>
    public class BlochSphereView : MonoBehaviour
    {
        [Header("Settings")]
        [SerializeField] private float radius = 1.8f;
        [SerializeField] private bool showTrajectory = true;
        [SerializeField] private int maxTrajectoryPoints = 800;

        [Header("Colors")]
        [SerializeField] private Color sphereWireColor = new Color(0.4f, 0.6f, 0.8f, 0.35f);
        [SerializeField] private Color vectorColor = new Color(0.2f, 1.0f, 0.6f);

        private LineRenderer vectorLine;
        private LineRenderer trajectoryLine;
        private Transform arrowTip;
        private readonly List<Vector3> trajectoryPoints = new List<Vector3>();
        private readonly List<float> trajectoryPhases = new List<float>();
        private Vector3? lastPoint = null;

        private void Awake()
        {
            SetupLines();
        }

        private void SetupLines()
        {
            // Vector Arrow Line
            GameObject vObj = new GameObject("StateVectorLine");
            vObj.transform.SetParent(transform, false);
            vectorLine = vObj.AddComponent<LineRenderer>();
            vectorLine.positionCount = 2;
            vectorLine.startWidth = 0.06f;
            vectorLine.endWidth = 0.06f;
            vectorLine.material = CreateLineMaterial(vectorColor);

            // Arrow Tip Sphere
            GameObject tip = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            tip.name = "VectorTip";
            tip.transform.SetParent(transform, false);
            tip.transform.localScale = Vector3.one * 0.18f;
            tip.GetComponent<MeshRenderer>().material = CreateLineMaterial(vectorColor);
            Destroy(tip.GetComponent<Collider>());
            arrowTip = tip.transform;

            // Trajectory Line with vertex colors enabled
            GameObject tObj = new GameObject("TrajectoryLine");
            tObj.transform.SetParent(transform, false);
            trajectoryLine = tObj.AddComponent<LineRenderer>();
            trajectoryLine.positionCount = 0;
            trajectoryLine.startWidth = 0.045f;
            trajectoryLine.endWidth = 0.045f;
            trajectoryLine.material = CreateLineMaterial(Color.white);
        }

        public static Color GetPhaseColor(float phaseRadians, float alpha = 0.9f)
        {
            float deg = phaseRadians * Mathf.Rad2Deg; // -180 to 180
            float hue = Mathf.Repeat(195f + deg * 0.75f, 360f) / 360f;
            Color c = Color.HSVToRGB(hue, 0.85f, 0.95f);
            c.a = alpha;
            return c;
        }

        public void UpdateState(QuantumState state)
        {
            if (state == null) return;

            // Quantum Bloch coords mapped into Unity:
            // X_unity = x, Y_unity = z (|0> is top +Y, |1> is bottom -Y), Z_unity = y
            Vector3 b = state.BlochCoordinates;
            Vector3 endpoint = new Vector3(b.x, b.z, b.y) * radius;
            Vector3 worldPt = transform.position + endpoint;
            float curPhase = (float)state.RelativePhase;
            Color curPhaseCol = GetPhaseColor(curPhase, 1.0f);

            if (vectorLine != null)
            {
                vectorLine.SetPosition(0, transform.position);
                vectorLine.SetPosition(1, worldPt);
                vectorLine.startColor = curPhaseCol;
                vectorLine.endColor = curPhaseCol;
            }

            if (arrowTip != null)
            {
                arrowTip.position = worldPt;
                arrowTip.GetComponent<MeshRenderer>().material.color = curPhaseCol;
            }

            if (showTrajectory)
            {
                if (lastPoint.HasValue && Vector3.Distance(lastPoint.Value, worldPt) > 0.05f)
                {
                    // Interpolate geodesic arc on sphere
                    int steps = 12;
                    Vector3 vA = (lastPoint.Value - transform.position).normalized;
                    Vector3 vB = (worldPt - transform.position).normalized;
                    for (int i = 1; i <= steps; i++)
                    {
                        float t = (float)i / steps;
                        Vector3 interp = Vector3.Slerp(vA, vB, t) * radius + transform.position;
                        trajectoryPoints.Add(interp);
                        trajectoryPhases.Add(curPhase);
                    }
                }
                else
                {
                    trajectoryPoints.Add(worldPt);
                    trajectoryPhases.Add(curPhase);
                }

                lastPoint = worldPt;

                // Retain high persistent capacity
                if (trajectoryPoints.Count > maxTrajectoryPoints)
                {
                    trajectoryPoints.RemoveRange(0, trajectoryPoints.Count - maxTrajectoryPoints);
                    trajectoryPhases.RemoveRange(0, trajectoryPhases.Count - maxTrajectoryPoints);
                }

                if (trajectoryLine != null && trajectoryPoints.Count > 1)
                {
                    trajectoryLine.positionCount = trajectoryPoints.Count;
                    trajectoryLine.SetPositions(trajectoryPoints.ToArray());

                    // Apply color gradient shifting subtly based on relative phase
                    Gradient grad = new Gradient();
                    int count = trajectoryPoints.Count;
                    Color startCol = GetPhaseColor(trajectoryPhases[0], 0.6f);
                    Color endCol = GetPhaseColor(trajectoryPhases[count - 1], 1.0f);

                    grad.SetKeys(
                        new GradientColorKey[] {
                            new GradientColorKey(startCol, 0.0f),
                            new GradientColorKey(endCol, 1.0f)
                        },
                        new GradientAlphaKey[] {
                            new GradientAlphaKey(0.6f, 0.0f),
                            new GradientAlphaKey(0.95f, 1.0f)
                        }
                    );
                    trajectoryLine.colorGradient = grad;
                }
            }
        }

        public void ClearTrajectory()
        {
            trajectoryPoints.Clear();
            trajectoryPhases.Clear();
            lastPoint = null;
            if (trajectoryLine != null) trajectoryLine.positionCount = 0;
        }

        private void OnDrawGizmos()
        {
            // Wireframe Unit Sphere
            Gizmos.color = sphereWireColor;
            Gizmos.DrawWireSphere(transform.position, radius);

            // Coordinate Axes:
            // Z-axis (quantum |0> and |1>): Up/Down
            Gizmos.color = Color.blue;
            Gizmos.DrawLine(transform.position - Vector3.up * radius, transform.position + Vector3.up * radius);

            // X-axis (quantum |+> and |−>): Right/Left
            Gizmos.color = Color.red;
            Gizmos.DrawLine(transform.position - Vector3.right * radius, transform.position + Vector3.right * radius);

            // Y-axis (quantum |+i> and |−i>): Forward/Back
            Gizmos.color = Color.green;
            Gizmos.DrawLine(transform.position - Vector3.forward * radius, transform.position + Vector3.forward * radius);
        }

        private Material CreateLineMaterial(Color color)
        {
            Shader s = Shader.Find("Sprites/Default") ?? Shader.Find("Standard");
            return new Material(s) { color = color };
        }
    }
}

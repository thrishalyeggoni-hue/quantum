using UnityEngine;
using UnityEngine.UI;
using QuantumEcho.Quantum;
using QuantumEcho.Puzzles;

namespace QuantumEcho.UI
{
    /// <summary>
    /// Screen-space Canvas HUD for quantum puzzles, telemetry, and narrative logs.
    /// Works with standard Unity UI components or renders via OnGUI as robust fallback.
    /// </summary>
    public class QuantumHUD : MonoBehaviour
    {
        [Header("Controller Reference")]
        [SerializeField] private PuzzleController puzzleController;
        [SerializeField] private BlochSphereView blochView;

        [Header("Runtime State")]
        private PuzzleData currentPuzzle;
        private QuantumState currentState = QuantumState.Zero;
        private string activeHint = "";
        private string statusMessage = "";
        private bool showJournal = false;
        private bool isPaused = false;
        private int trials0 = 0;
        private int trials1 = 0;

        private void Start()
        {
            if (puzzleController != null)
            {
                puzzleController.OnPuzzleLoaded += HandlePuzzleLoaded;
                puzzleController.OnStateUpdated += HandleStateUpdated;
                puzzleController.OnHintShown += HandleHintShown;
                puzzleController.OnPuzzleSolved += HandlePuzzleSolved;
                puzzleController.OnTrialsUpdated += (t0, t1) => { trials0 = t0; trials1 = t1; };
            }
        }

        private void HandlePuzzleLoaded(PuzzleData puzzle)
        {
            currentPuzzle = puzzle;
            activeHint = "";
            statusMessage = $"District reached: {puzzle.districtName}";
            if (blochView != null) blochView.ClearTrajectory();
        }

        private void HandleStateUpdated(QuantumState state)
        {
            currentState = state;
            if (blochView != null) blochView.UpdateState(state);
        }

        private void HandleHintShown(string hint)
        {
            activeHint = hint;
        }

        private void HandlePuzzleSolved(string explanation)
        {
            statusMessage = $"SOLVED! {explanation}";
        }

        private void OnGUI()
        {
            // Responsive styling
            GUI.skin.box.fontSize = 13;
            GUI.skin.label.fontSize = 13;
            GUI.skin.button.fontSize = 13;

            // 1. Top Objective Banner
            DrawTopObjectiveBanner();

            // 2. Right Side: Quantum Telemetry & Bloch Coordinates
            DrawQuantumTelemetry();

            // 3. Bottom Center: Gate Action Toolbar
            DrawGateToolbar();

            // 4. Modals (Journal, Pause)
            if (showJournal) DrawJournalModal();
            if (isPaused) DrawPauseMenu();
        }

        private void DrawTopObjectiveBanner()
        {
            GUILayout.BeginArea(new Rect(20, 20, Screen.width - 40, 100), GUI.skin.box);
            GUILayout.BeginHorizontal();

            GUILayout.BeginVertical();
            string dist = currentPuzzle != null ? currentPuzzle.districtName : "Arrival Harbor";
            string title = currentPuzzle != null ? currentPuzzle.puzzleTitle : "Initializing...";
            GUILayout.Label($"<b><size=16>{dist} — {title}</size></b>");

            string obj = currentPuzzle != null ? currentPuzzle.objectiveText : "Follow the conduits.";
            GUILayout.Label($"<color=#70d4ff>Objective:</color> {obj}");
            GUILayout.EndVertical();

            GUILayout.FlexibleSpace();

            if (GUILayout.Button("Journal [J]", GUILayout.Width(100), GUILayout.Height(35)))
            {
                showJournal = !showJournal;
            }
            if (GUILayout.Button("Hint [H]", GUILayout.Width(90), GUILayout.Height(35)))
            {
                puzzleController?.RequestHint();
            }

            GUILayout.EndHorizontal();

            if (!string.IsNullOrEmpty(activeHint))
            {
                GUILayout.Label($"<color=#ffdf70><b>Hint:</b> {activeHint}</color>");
            }
            GUILayout.EndArea();
        }

        private void DrawQuantumTelemetry()
        {
            float panelWidth = 320;
            float panelHeight = 300;
            Rect panelRect = new Rect(Screen.width - panelWidth - 20, 130, panelWidth, panelHeight);

            GUILayout.BeginArea(panelRect, "Echo Lantern Telemetry", GUI.skin.box);

            if (currentState != null)
            {
                GUILayout.Space(15);
                GUILayout.Label($"<b>State Vector |ψ⟩:</b>\n{currentState.FormatDirac()}");

                GUILayout.Space(6);
                GUILayout.Label($"<b>Target State:</b> {currentPuzzle?.targetStateName ?? "|1⟩"}");

                GUILayout.Space(6);
                double p0 = currentState.Prob0;
                double p1 = currentState.Prob1;
                GUILayout.Label($"<b>Probabilities:</b> P(0) = {(p0 * 100):F1}%  |  P(1) = {(p1 * 100):F1}%");

                // ASCII Probability Bar
                int barLen = 20;
                int filled0 = Mathf.RoundToInt((float)p0 * barLen);
                string bar0 = new string('█', filled0) + new string('░', barLen - filled0);
                GUILayout.Label($"|0⟩ [{bar0}]");

                GUILayout.Space(6);
                double phaseRad = currentState.RelativePhase;
                double phaseDeg = phaseRad * Mathf.Rad2Deg;
                GUILayout.Label($"<b>Relative Phase φ:</b> {phaseRad:F2} rad ({phaseDeg:F0}°)");

                // Comparison note
                if (Mathf.Abs((float)p0 - 0.5f) < 0.05f && Mathf.Abs((float)p1 - 0.5f) < 0.05f)
                {
                    if (Mathf.Abs((float)phaseRad) < 0.1f)
                    {
                        GUILayout.Label("<color=#70ff90>State |+⟩: Phase 0 rad</color>");
                    }
                    else if (Mathf.Abs(Mathf.Abs((float)phaseRad) - Mathf.PI) < 0.1f)
                    {
                        GUILayout.Label("<color=#ff70e0>State |−⟩: Phase π rad (Opposite Phase!)</color>");
                    }
                }

                // Bloch coordinates
                Vector3 b = currentState.BlochCoordinates;
                GUILayout.Label($"<b>Bloch:</b> ({b.x:F2}, {b.y:F2}, {b.z:F2})");
            }

            if (!string.IsNullOrEmpty(statusMessage))
            {
                GUILayout.Space(4);
                GUILayout.Label($"<color=#90ff90>{statusMessage}</color>");
            }

            GUILayout.EndArea();
        }

        private void DrawGateToolbar()
        {
            float toolbarWidth = 720;
            float toolbarHeight = 90;
            Rect rect = new Rect((Screen.width - toolbarWidth) / 2f, Screen.height - toolbarHeight - 20, toolbarWidth, toolbarHeight);

            GUILayout.BeginArea(rect, GUI.skin.box);
            GUILayout.BeginHorizontal();

            // Circuit history readout
            string hist = puzzleController?.Simulator?.History?.FormatCircuit() ?? "Initial State";
            GUILayout.Label($"<b>Applied Circuit:</b>\n{hist}", GUILayout.Width(220));

            GUILayout.FlexibleSpace();

            // Gate buttons
            if (GUILayout.Button("Gate X\n(NOT)", GUILayout.Width(75), GUILayout.Height(50)))
            {
                puzzleController?.ApplyGate(GateType.X);
            }

            if (GUILayout.Button("Gate Z\n(Phase)", GUILayout.Width(75), GUILayout.Height(50)))
            {
                puzzleController?.ApplyGate(GateType.Z);
            }

            if (GUILayout.Button("Gate H\n(Hadamard)", GUILayout.Width(85), GUILayout.Height(50)))
            {
                puzzleController?.ApplyGate(GateType.H);
            }

            // Inverse action button
            bool canInv = puzzleController?.Simulator?.CanApplyInverse() ?? false;
            GUI.enabled = canInv;
            string invLabel = "Inverse\n" + (puzzleController?.Simulator?.GetLastInverseGate()?.ToString() ?? "None");
            if (GUILayout.Button(invLabel, GUILayout.Width(75), GUILayout.Height(50)))
            {
                puzzleController?.ApplyLastInverse();
            }
            GUI.enabled = true;

            // Reset
            if (GUILayout.Button("Reset [R]\n(Initial)", GUILayout.Width(75), GUILayout.Height(50)))
            {
                puzzleController?.ResetPuzzle();
            }

            // If measurement allowed
            if (currentPuzzle != null && currentPuzzle.allowMeasurement)
            {
                if (GUILayout.Button("Measure\n(Collapse)", GUILayout.Width(80), GUILayout.Height(50)))
                {
                    puzzleController?.MeasureState();
                }
                if (GUILayout.Button("50 Trials\n(Born)", GUILayout.Width(75), GUILayout.Height(50)))
                {
                    puzzleController?.RunMultipleTrials(50);
                }
            }

            GUILayout.EndHorizontal();
            GUILayout.EndArea();
        }

        private void DrawJournalModal()
        {
            Rect rect = new Rect((Screen.width - 550) / 2, (Screen.height - 400) / 2, 550, 400);
            GUILayout.BeginArea(rect, "Dr. Ishan's Protected Archives", GUI.skin.box);
            GUILayout.Space(20);

            var chapters = ChapterRegistry.GetAllChapters();
            foreach (var chap in chapters)
            {
                if (chap.chapterId <= (currentPuzzle?.chapterId ?? 1))
                {
                    GUILayout.Label($"<b>Chapter {chap.chapterId}: {chap.districtName}</b>");
                    GUILayout.Label(chap.journalEntry);
                    GUILayout.Space(6);
                }
            }

            GUILayout.FlexibleSpace();
            if (GUILayout.Button("Close Archive", GUILayout.Height(30)))
            {
                showJournal = false;
            }
            GUILayout.EndArea();
        }

        private void DrawPauseMenu()
        {
            Rect rect = new Rect((Screen.width - 300) / 2, (Screen.height - 250) / 2, 300, 250);
            GUILayout.BeginArea(rect, "Paused", GUI.skin.box);
            GUILayout.Space(25);

            if (GUILayout.Button("Resume", GUILayout.Height(35))) isPaused = false;
            if (GUILayout.Button("Restart Chapter", GUILayout.Height(35)))
            {
                puzzleController?.ResetPuzzle();
                isPaused = false;
            }
            if (GUILayout.Button("Close Game", GUILayout.Height(35)))
            {
                Application.Quit();
            }
            GUILayout.EndArea();
        }
    }
}

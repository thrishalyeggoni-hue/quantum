#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using QuantumEcho.Environment;
using QuantumEcho.Player;
using QuantumEcho.Puzzles;
using QuantumEcho.UI;
using QuantumEcho.Audio;
using QuantumEcho.Tests;

namespace QuantumEcho.Editor
{
    public static class EditorProjectSetup
    {
        private const string ScenePath = "Assets/Scenes/QuantumEchoMain.unity";

        [MenuItem("QuantumEcho/Run Quantum Math Tests")]
        public static void RunTests()
        {
            QuantumSimulatorTests.RunAllTests();
        }

        [MenuItem("QuantumEcho/Setup Complete Project & Scene")]
        public static void SetupCompleteProject()
        {
            Debug.Log("[QuantumEcho Setup] Starting automated scene and project configuration...");

            // Ensure directory exists
            if (!AssetDatabase.IsValidFolder("Assets/Scenes"))
            {
                AssetDatabase.CreateFolder("Assets", "Scenes");
            }

            // Create new scene
            Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            // 1. Lighting & Environment
            SetupLighting();

            // 2. World Builder & Generate Aster City
            GameObject worldObj = new GameObject("WorldRoot");
            WorldBuilder worldBuilder = worldObj.AddComponent<WorldBuilder>();
            worldBuilder.BuildWorld();

            // 3. Audio System
            GameObject audioObj = new GameObject("AudioManager");
            audioObj.AddComponent<AudioSource>();
            audioObj.AddComponent<ProceduralAudio>();

            // 4. Progression Manager
            GameObject progressionObj = new GameObject("ProgressionManager");
            ProgressionManager progression = progressionObj.AddComponent<ProgressionManager>();

            // 5. Player Character (Mira)
            GameObject playerObj = new GameObject("Player_Mira");
            playerObj.transform.position = new Vector3(0, 2.0f, -48f); // Arrival Harbor start
            playerObj.tag = "Player";

            var charController = playerObj.AddComponent<CharacterController>();
            charController.center = new Vector3(0, 0.9f, 0);
            charController.height = 1.8f;
            charController.radius = 0.35f;

            var tpController = playerObj.AddComponent<ThirdPersonController>();
            var procChar = playerObj.AddComponent<ProceduralCharacter>();

            // Echo Lantern object
            GameObject lanternObj = new GameObject("EchoLantern");
            lanternObj.transform.SetParent(procChar.LanternHolder ?? playerObj.transform, false);
            var lantern = lanternObj.AddComponent<EchoLantern>();

            // 6. Camera Rig
            GameObject camObj = new GameObject("Main Camera");
            camObj.tag = "MainCamera";
            camObj.transform.position = new Vector3(0, 4.0f, -54f);
            Camera cam = camObj.AddComponent<Camera>();
            cam.clearFlags = CameraClearFlags.Skybox;
            camObj.AddComponent<AudioListener>();
            var camController = camObj.AddComponent<CameraController>();
            camController.SetTarget(playerObj.transform);

            // 7. Interaction Controller
            var interactController = playerObj.AddComponent<InteractionController>();

            // 8. 3D Bloch Sphere View in scene
            GameObject blochObj = new GameObject("BlochSphereVisualizer");
            blochObj.transform.position = new Vector3(0, 2.5f, 6.0f); // Near Chapter 1 terminal
            var blochView = blochObj.AddComponent<BlochSphereView>();

            // 9. UI Canvas & QuantumHUD
            GameObject hudObj = new GameObject("QuantumHUD");
            var hud = hudObj.AddComponent<QuantumHUD>();

            // Find terminal 1 in world geometry to connect as initial console
            var terminal1 = GameObject.Find("PuzzleTerminal_Ch1");
            if (terminal1 != null)
            {
                var pController = terminal1.GetComponent<PuzzleController>();
                // Link via reflection or serialized property
                var pField = typeof(QuantumHUD).GetField("puzzleController", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
                pField?.SetValue(hud, pController);

                var bField = typeof(QuantumHUD).GetField("blochView", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
                bField?.SetValue(hud, blochView);
            }

            // Save Scene
            EditorSceneManager.SaveScene(scene, ScenePath);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            // Register in Build Settings
            var buildScenes = new EditorBuildSettingsScene[]
            {
                new EditorBuildSettingsScene(ScenePath, true)
            };
            EditorBuildSettings.scenes = buildScenes;

            Debug.Log($"<color=#90ff90>[QuantumEcho Setup] Complete! Scene saved to {ScenePath} and registered in Build Settings.</color>");
            EditorUtility.DisplayDialog("Quantum Echo Setup", "Complete Aster City scene has been generated and configured successfully! Press Play to start.", "OK");
        }

        private static void SetupLighting()
        {
            GameObject lightObj = new GameObject("Directional Light");
            Light light = lightObj.AddComponent<Light>();
            light.type = LightType.Directional;
            light.color = new Color(0.95f, 0.92f, 0.85f);
            light.intensity = 1.15f;
            lightObj.transform.rotation = Quaternion.Euler(48f, -32f, 0);

            RenderSettings.ambientLight = new Color(0.25f, 0.3f, 0.4f);
        }
    }
}
#endif

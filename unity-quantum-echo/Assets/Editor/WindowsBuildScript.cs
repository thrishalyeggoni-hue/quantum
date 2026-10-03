#if UNITY_EDITOR
using System;
using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace QuantumEcho.Editor
{
    public static class WindowsBuildScript
    {
        private const string BuildDirectory = "Builds/Windows";
        private const string ExecutableName = "QuantumEcho.exe";

        [MenuItem("QuantumEcho/Build Windows Standalone x64")]
        public static void PerformWindowsBuild()
        {
            Debug.Log("[WindowsBuild] Initiating Windows standalone x64 build...");

            // First ensure project setup is run
            EditorProjectSetup.SetupCompleteProject();

            // Run verification test suite before building
            bool testsPassed = Tests.QuantumSimulatorTests.RunAllTests();
            if (!testsPassed)
            {
                Debug.LogError("[WindowsBuild] Cannot proceed: Quantum engine unit tests failed!");
                return;
            }

            if (!Directory.Exists(BuildDirectory))
            {
                Directory.CreateDirectory(BuildDirectory);
            }

            string fullExePath = Path.Combine(BuildDirectory, ExecutableName);

            string[] scenes = new string[] { "Assets/Scenes/QuantumEchoMain.unity" };

            BuildPlayerOptions buildPlayerOptions = new BuildPlayerOptions
            {
                scenes = scenes,
                locationPathName = fullExePath,
                target = BuildTarget.StandaloneWindows64,
                options = BuildOptions.None
            };

            Debug.Log($"[WindowsBuild] Compiling player to: {fullExePath}");
            BuildReport report = BuildPipeline.BuildPlayer(buildPlayerOptions);
            BuildSummary summary = report.summary;

            if (summary.result == BuildResult.Succeeded)
            {
                Debug.Log($"<color=#90ff90>[WindowsBuild] Build succeeded! Size: {summary.totalSize / 1024 / 1024} MB. Output: {fullExePath}</color>");
            }
            else if (summary.result == BuildResult.Failed)
            {
                Debug.LogError($"[WindowsBuild] Build failed with {summary.totalErrors} errors.");
            }
        }
    }
}
#endif

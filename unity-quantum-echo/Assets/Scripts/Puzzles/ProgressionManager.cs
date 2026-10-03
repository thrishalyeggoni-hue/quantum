using System;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace QuantumEcho.Puzzles
{
    [Serializable]
    public class SaveData
    {
        public int highestCompletedChapter = 0;
        public int currentChapter = 1;
        public List<int> unlockedShortcuts = new List<int>();
        public List<string> discoveredLogs = new List<string>();
        public float masterVolume = 1.0f;
    }

    public static class SaveSystem
    {
        private static string SavePath => Path.Combine(Application.persistentDataPath, "quantumecho_save.json");

        public static void Save(SaveData data)
        {
            try
            {
                string json = JsonUtility.ToJson(data, true);
                File.WriteAllText(SavePath, json);
            }
            catch (Exception ex)
            {
                Debug.LogError($"[SaveSystem] Error saving: {ex.Message}");
            }
        }

        public static SaveData Load()
        {
            try
            {
                if (File.Exists(SavePath))
                {
                    string json = File.ReadAllText(SavePath);
                    return JsonUtility.FromJson<SaveData>(json);
                }
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[SaveSystem] Error loading save, resetting to default: {ex.Message}");
            }
            return new SaveData();
        }
    }

    public class ProgressionManager : MonoBehaviour
    {
        public static ProgressionManager Instance { get; private set; }

        [SerializeField] private PuzzleController puzzleController;
        private SaveData currentSave;

        public event Action<int> OnChapterUnlocked;
        public event Action OnGameCompleted;

        public SaveData Save => currentSave;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            currentSave = SaveSystem.Load();
        }

        private void Start()
        {
            if (puzzleController != null)
            {
                puzzleController.OnPuzzleSolved += HandlePuzzleSolved;
            }
        }

        private void HandlePuzzleSolved(string successText)
        {
            int solvedChap = puzzleController.ActiveChapterIndex;
            if (solvedChap > currentSave.highestCompletedChapter)
            {
                currentSave.highestCompletedChapter = solvedChap;
                if (!currentSave.unlockedShortcuts.Contains(solvedChap))
                {
                    currentSave.unlockedShortcuts.Add(solvedChap);
                }
                SaveSystem.Save(currentSave);
            }

            if (solvedChap >= 8)
            {
                OnGameCompleted?.Invoke();
            }
            else
            {
                OnChapterUnlocked?.Invoke(solvedChap + 1);
            }
        }

        public void AdvanceToNextChapter()
        {
            int next = puzzleController.ActiveChapterIndex + 1;
            if (next <= 8)
            {
                puzzleController.LoadChapter(next);
            }
        }
    }
}

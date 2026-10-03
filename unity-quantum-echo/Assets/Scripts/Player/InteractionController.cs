using UnityEngine;
using QuantumEcho.Puzzles;

namespace QuantumEcho.Player
{
    public class InteractionController : MonoBehaviour
    {
        [Header("Detection")]
        [SerializeField] private float interactRange = 3.0f;
        [SerializeField] private LayerMask interactableLayers;

        [Header("References")]
        [SerializeField] private ThirdPersonController movementController;
        [SerializeField] private CameraController cameraController;
        [SerializeField] private GameObject puzzleConsoleCanvas;

        private bool isInConsoleMode = false;
        private PuzzleController nearbyConsole = null;

        public bool IsInConsoleMode => isInConsoleMode;
        public event System.Action<bool, string> OnInteractPromptChanged;

        private void Update()
        {
            // Escape to close console mode or pause
            if (Input.GetKeyDown(KeyCode.Escape))
            {
                if (isInConsoleMode)
                {
                    ExitConsoleMode();
                }
            }

            if (isInConsoleMode)
            {
                // In console mode, handle R key to reset puzzle
                if (Input.GetKeyDown(KeyCode.R) && nearbyConsole != null)
                {
                    nearbyConsole.ResetPuzzle();
                }
                return;
            }

            CheckForInteractables();

            if (nearbyConsole != null && Input.GetKeyDown(KeyCode.E))
            {
                EnterConsoleMode();
            }
        }

        private void CheckForInteractables()
        {
            Collider[] hits = Physics.OverlapSphere(transform.position, interactRange, interactableLayers);
            PuzzleController foundConsole = null;

            foreach (var hit in hits)
            {
                var console = hit.GetComponentInParent<PuzzleController>();
                if (console != null)
                {
                    foundConsole = console;
                    break;
                }
            }

            if (foundConsole != nearbyConsole)
            {
                nearbyConsole = foundConsole;
                if (nearbyConsole != null)
                {
                    OnInteractPromptChanged?.Invoke(true, "Press [E] to Interface with Quantum Terminal");
                }
                else
                {
                    OnInteractPromptChanged?.Invoke(false, string.Empty);
                }
            }
        }

        public void EnterConsoleMode()
        {
            isInConsoleMode = true;
            if (movementController != null) movementController.IsInputLocked = true;
            if (cameraController != null) cameraController.IsCursorLocked = false;
            if (puzzleConsoleCanvas != null) puzzleConsoleCanvas.SetActive(true);
            OnInteractPromptChanged?.Invoke(false, string.Empty);
        }

        public void ExitConsoleMode()
        {
            isInConsoleMode = false;
            if (movementController != null) movementController.IsInputLocked = false;
            if (cameraController != null) cameraController.IsCursorLocked = true;
            if (puzzleConsoleCanvas != null) puzzleConsoleCanvas.SetActive(false);
            if (nearbyConsole != null)
            {
                OnInteractPromptChanged?.Invoke(true, "Press [E] to Interface with Quantum Terminal");
            }
        }

        private void OnDrawGizmosSelected()
        {
            Gizmos.color = Color.cyan;
            Gizmos.DrawWireSphere(transform.position, interactRange);
        }
    }
}

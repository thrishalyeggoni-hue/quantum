using UnityEngine;

namespace QuantumEcho.Player
{
    public class CameraController : MonoBehaviour
    {
        [Header("Target")]
        [SerializeField] private Transform target;

        [Header("Distance & Angles")]
        [SerializeField] private float distance = 4.5f;
        [SerializeField] private float minDistance = 2.0f;
        [SerializeField] private float maxDistance = 8.0f;
        [SerializeField] private float mouseSensitivity = 2.5f;
        [SerializeField] private float minPitch = -20f;
        [SerializeField] private float maxPitch = 70f;
        [SerializeField] private Vector3 targetOffset = new Vector3(0, 1.4f, 0);

        [Header("Collision")]
        [SerializeField] private LayerMask collisionLayers;

        private float yaw = 0f;
        private float pitch = 20f;
        private bool isCursorLocked = true;

        public bool IsCursorLocked
        {
            get => isCursorLocked;
            set
            {
                isCursorLocked = value;
                Cursor.lockState = isCursorLocked ? CursorLockMode.Locked : CursorLockMode.None;
                Cursor.visible = !isCursorLocked;
            }
        }

        private void Start()
        {
            IsCursorLocked = true;
            if (target != null)
            {
                yaw = target.eulerAngles.y;
            }
        }

        private void LateUpdate()
        {
            if (target == null) return;

            if (isCursorLocked)
            {
                yaw += Input.GetAxis("Mouse X") * mouseSensitivity;
                pitch -= Input.GetAxis("Mouse Y") * mouseSensitivity;
                pitch = Mathf.Clamp(pitch, minPitch, maxPitch);

                float scroll = Input.GetAxis("Mouse ScrollWheel");
                distance = Mathf.Clamp(distance - scroll * 2.0f, minDistance, maxDistance);
            }

            Vector3 focusPoint = target.position + targetOffset;
            Quaternion rotation = Quaternion.Euler(pitch, yaw, 0f);
            Vector3 desiredPosition = focusPoint - (rotation * Vector3.forward * distance);

            // Raycast collision test to prevent clipping into walls
            if (Physics.Raycast(focusPoint, (desiredPosition - focusPoint).normalized, out RaycastHit hit, distance, collisionLayers))
            {
                desiredPosition = hit.point + hit.normal * 0.2f;
            }

            transform.position = desiredPosition;
            transform.LookAt(focusPoint);
        }

        public void SetTarget(Transform newTarget)
        {
            target = newTarget;
        }
    }
}

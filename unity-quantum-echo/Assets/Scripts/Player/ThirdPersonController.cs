using UnityEngine;

namespace QuantumEcho.Player
{
    [RequireComponent(typeof(CharacterController))]
    public class ThirdPersonController : MonoBehaviour
    {
        [Header("Movement")]
        [SerializeField] private float walkSpeed = 5.0f;
        [SerializeField] private float sprintSpeed = 8.5f;
        [SerializeField] private float turnSmoothTime = 0.1f;
        [SerializeField] private float gravity = -19.6f;
        [SerializeField] private float jumpHeight = 1.2f;

        [Header("Safety / Fall Recovery")]
        [SerializeField] private float fallThresholdY = -15.0f;
        private Vector3 lastSafeGroundedPosition;

        private CharacterController controller;
        private Transform cameraTransform;
        private float turnSmoothVelocity;
        private Vector3 velocity;
        private bool isGrounded;
        private bool isInputLocked = false;

        public bool IsInputLocked { get => isInputLocked; set => isInputLocked = value; }

        private void Awake()
        {
            controller = GetComponent<CharacterController>();
            if (Camera.main != null)
            {
                cameraTransform = Camera.main.transform;
            }
            lastSafeGroundedPosition = transform.position;
        }

        private void Update()
        {
            // Fall recovery check
            if (transform.position.y < fallThresholdY)
            {
                RecoverFromFall();
                return;
            }

            isGrounded = controller.isGrounded;
            if (isGrounded && velocity.y < 0)
            {
                velocity.y = -2.0f;
                // Update safe position if comfortably grounded
                lastSafeGroundedPosition = transform.position;
            }

            if (isInputLocked)
            {
                // Apply gravity even when interaction is locked
                velocity.y += gravity * Time.deltaTime;
                controller.Move(velocity * Time.deltaTime);
                return;
            }

            float horizontal = Input.GetAxisRaw("Horizontal");
            float vertical = Input.GetAxisRaw("Vertical");
            Vector3 direction = new Vector3(horizontal, 0f, vertical).normalized;

            bool isSprinting = Input.GetKey(KeyCode.LeftShift);
            float currentSpeed = isSprinting ? sprintSpeed : walkSpeed;

            if (direction.magnitude >= 0.1f)
            {
                float targetAngle = Mathf.Atan2(direction.x, direction.z) * Mathf.Rad2Deg;
                if (cameraTransform != null)
                {
                    targetAngle += cameraTransform.eulerAngles.y;
                }

                float angle = Mathf.SmoothDampAngle(transform.eulerAngles.y, targetAngle, ref turnSmoothVelocity, turnSmoothTime);
                transform.rotation = Quaternion.Euler(0f, angle, 0f);

                Vector3 moveDir = Quaternion.Euler(0f, targetAngle, 0f) * Vector3.forward;
                controller.Move(moveDir.normalized * (currentSpeed * Time.deltaTime));
            }

            if (Input.GetButtonDown("Jump") && isGrounded)
            {
                velocity.y = Mathf.Sqrt(jumpHeight * -2.0f * gravity);
            }

            velocity.y += gravity * Time.deltaTime;
            controller.Move(velocity * Time.deltaTime);
        }

        public void RecoverFromFall()
        {
            controller.enabled = false;
            transform.position = lastSafeGroundedPosition + Vector3.up * 0.5f;
            velocity = Vector3.zero;
            controller.enabled = true;
            Debug.Log("[Player] Recovered safely from fall to platform.");
        }
    }
}

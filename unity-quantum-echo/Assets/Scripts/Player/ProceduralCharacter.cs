using UnityEngine;

namespace QuantumEcho.Player
{
    /// <summary>
    /// Programmatically generates a stylized low-poly character model for Mira
    /// and performs procedural walking bob/sway animation without external asset dependencies.
    /// </summary>
    public class ProceduralCharacter : MonoBehaviour
    {
        private Transform bodyRoot;
        private Transform headTransform;
        private Transform leftLeg;
        private Transform rightLeg;
        private Transform lanternHolder;

        private CharacterController charController;
        private float walkCycle = 0f;

        public Transform LanternHolder => lanternHolder;

        private void Awake()
        {
            charController = GetComponent<CharacterController>();
            BuildCharacterMesh();
        }

        private void Update()
        {
            AnimateProcedurally();
        }

        private void BuildCharacterMesh()
        {
            bodyRoot = new GameObject("MiraModel").transform;
            bodyRoot.SetParent(transform, false);

            // Palette materials
            Material coatMat = CreateSimpleMaterial(new Color(0.12f, 0.22f, 0.35f), "MiraCoat"); // Deep Navy
            Material cloakMat = CreateSimpleMaterial(new Color(0.85f, 0.65f, 0.25f), "MiraScarf"); // Golden Ochre
            Material skinMat = CreateSimpleMaterial(new Color(0.92f, 0.78f, 0.68f), "MiraSkin");
            Material hairMat = CreateSimpleMaterial(new Color(0.25f, 0.15f, 0.10f), "MiraHair"); // Auburn
            Material bootMat = CreateSimpleMaterial(new Color(0.15f, 0.12f, 0.10f), "MiraBoots");

            // Pelvis / Lower Torso
            GameObject pelvis = GameObject.CreatePrimitive(PrimitiveType.Cube);
            pelvis.name = "Pelvis";
            pelvis.transform.SetParent(bodyRoot, false);
            pelvis.transform.localPosition = new Vector3(0, 0.85f, 0);
            pelvis.transform.localScale = new Vector3(0.4f, 0.35f, 0.25f);
            pelvis.GetComponent<MeshRenderer>().material = coatMat;
            Destroy(pelvis.GetComponent<Collider>());

            // Upper Torso / Coat
            GameObject torso = GameObject.CreatePrimitive(PrimitiveType.Cube);
            torso.name = "Torso";
            torso.transform.SetParent(bodyRoot, false);
            torso.transform.localPosition = new Vector3(0, 1.15f, 0);
            torso.transform.localScale = new Vector3(0.48f, 0.45f, 0.28f);
            torso.GetComponent<MeshRenderer>().material = coatMat;
            Destroy(torso.GetComponent<Collider>());

            // Scarf / Cloak Collar
            GameObject scarf = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            scarf.name = "Scarf";
            scarf.transform.SetParent(bodyRoot, false);
            scarf.transform.localPosition = new Vector3(0, 1.40f, 0);
            scarf.transform.localScale = new Vector3(0.38f, 0.08f, 0.38f);
            scarf.GetComponent<MeshRenderer>().material = cloakMat;
            Destroy(scarf.GetComponent<Collider>());

            // Head
            GameObject head = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            head.name = "Head";
            head.transform.SetParent(bodyRoot, false);
            head.transform.localPosition = new Vector3(0, 1.62f, 0);
            head.transform.localScale = new Vector3(0.32f, 0.35f, 0.32f);
            head.GetComponent<MeshRenderer>().material = skinMat;
            Destroy(head.GetComponent<Collider>());
            headTransform = head.transform;

            // Hair
            GameObject hair = GameObject.CreatePrimitive(PrimitiveType.Cube);
            hair.name = "Hair";
            hair.transform.SetParent(headTransform, false);
            hair.transform.localPosition = new Vector3(0, 0.08f, -0.05f);
            hair.transform.localScale = new Vector3(1.08f, 0.85f, 1.05f);
            hair.GetComponent<MeshRenderer>().material = hairMat;
            Destroy(hair.GetComponent<Collider>());

            // Backpack / Quantum Interface Unit
            GameObject pack = GameObject.CreatePrimitive(PrimitiveType.Cube);
            pack.name = "QuantumPack";
            pack.transform.SetParent(bodyRoot, false);
            pack.transform.localPosition = new Vector3(0, 1.15f, -0.22f);
            pack.transform.localScale = new Vector3(0.34f, 0.38f, 0.16f);
            pack.GetComponent<MeshRenderer>().material = cloakMat;
            Destroy(pack.GetComponent<Collider>());

            // Legs
            GameObject lLeg = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            lLeg.name = "LeftLeg";
            lLeg.transform.SetParent(bodyRoot, false);
            lLeg.transform.localPosition = new Vector3(-0.13f, 0.42f, 0);
            lLeg.transform.localScale = new Vector3(0.14f, 0.42f, 0.14f);
            lLeg.GetComponent<MeshRenderer>().material = bootMat;
            Destroy(lLeg.GetComponent<Collider>());
            leftLeg = lLeg.transform;

            GameObject rLeg = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            rLeg.name = "RightLeg";
            rLeg.transform.SetParent(bodyRoot, false);
            rLeg.transform.localPosition = new Vector3(0.13f, 0.42f, 0);
            rLeg.transform.localScale = new Vector3(0.14f, 0.42f, 0.14f);
            rLeg.GetComponent<MeshRenderer>().material = bootMat;
            Destroy(rLeg.GetComponent<Collider>());
            rightLeg = rLeg.transform;

            // Lantern Holder (at right hand/hip)
            lanternHolder = new GameObject("LanternHolder").transform;
            lanternHolder.SetParent(bodyRoot, false);
            lanternHolder.localPosition = new Vector3(0.38f, 0.85f, 0.15f);
        }

        private void AnimateProcedurally()
        {
            if (charController == null || bodyRoot == null) return;

            Vector3 horizVel = new Vector3(charController.velocity.x, 0, charController.velocity.z);
            float speed = horizVel.magnitude;

            if (speed > 0.1f)
            {
                walkCycle += Time.deltaTime * speed * 4.5f;

                // Leg swing
                float legAngle = Mathf.Sin(walkCycle) * 28.0f;
                if (leftLeg != null) leftLeg.localRotation = Quaternion.Euler(legAngle, 0, 0);
                if (rightLeg != null) rightLeg.localRotation = Quaternion.Euler(-legAngle, 0, 0);

                // Body vertical bounce & torso tilt
                float bounce = Mathf.Abs(Mathf.Sin(walkCycle * 2.0f)) * 0.06f;
                bodyRoot.localPosition = new Vector3(0, bounce, 0);

                float sway = Mathf.Cos(walkCycle) * 3.0f;
                bodyRoot.localRotation = Quaternion.Euler(0, 0, sway);
            }
            else
            {
                // Idle breathing
                walkCycle += Time.deltaTime * 1.5f;
                float breath = Mathf.Sin(walkCycle) * 0.02f;
                bodyRoot.localPosition = new Vector3(0, breath, 0);
                if (leftLeg != null) leftLeg.localRotation = Quaternion.identity;
                if (rightLeg != null) rightLeg.localRotation = Quaternion.identity;
                bodyRoot.localRotation = Quaternion.identity;
            }
        }

        private Material CreateSimpleMaterial(Color color, string name)
        {
            Shader shader = Shader.Find("Standard") ?? Shader.Find("Universal Render Pipeline/Lit");
            Material mat = new Material(shader) { name = name, color = color };
            return mat;
        }
    }
}

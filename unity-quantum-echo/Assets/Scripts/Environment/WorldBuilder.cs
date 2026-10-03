using UnityEngine;
using QuantumEcho.Puzzles;

namespace QuantumEcho.Environment
{
    /// <summary>
    /// Programmatically generates the connected floating city of Aster.
    /// Creates all 8 districts, walkways, central tower, puzzle terminals, lighting, and safety bounds.
    /// Idempotent: clears existing geometry before building.
    /// </summary>
    public class WorldBuilder : MonoBehaviour
    {
        [Header("Materials / Colors")]
        [SerializeField] private Material stoneworkMat;
        [SerializeField] private Material metalMat;
        [SerializeField] private Material glowingCyanMat;
        [SerializeField] private Material glowingAmberMat;
        [SerializeField] private Material glowingGreenMat;
        [SerializeField] private Material glowingMagentaMat;

        public void BuildWorld()
        {
            // Clear existing generated children
            for (int i = transform.childCount - 1; i >= 0; i--)
            {
                DestroyImmediate(transform.GetChild(i).gameObject);
            }

            InitMaterials();

            GameObject root = new GameObject("AsterCityGeometry");
            root.transform.SetParent(transform, false);

            // 1. Central Echo Core Tower (landmark visible across all districts)
            BuildCentralEchoTower(root.transform);

            // 2. District 1: Arrival Harbor (Z: -60 to -40, X: 0)
            BuildArrivalHarbor(root.transform, new Vector3(0, 0, -50));

            // 3. District 2: Switchworks (Z: -30 to -10, X: -35)
            BuildSwitchworks(root.transform, new Vector3(-35, 2, -20));

            // 4. District 3: Twin-Light Garden (Z: -30 to -10, X: 35)
            BuildTwinLightGarden(root.transform, new Vector3(35, 2, -20));

            // 5. District 4: Phase Observatory (Z: 0 to 20, X: -45)
            BuildPhaseObservatory(root.transform, new Vector3(-45, 5, 10));

            // 6. District 5: Echo Bridge (Z: 0 to 20, X: 0)
            BuildEchoBridge(root.transform, new Vector3(0, 4, 10));

            // 7. District 6: Reversal Vault (Z: 0 to 20, X: 45)
            BuildReversalVault(root.transform, new Vector3(45, 5, 10));

            // 8. District 7: Measurement Station (Z: 30 to 50, X: -20)
            BuildMeasurementStation(root.transform, new Vector3(-20, 7, 40));

            // 9. District 8: The Echo Core Plaza (Z: 30 to 60, X: 20)
            BuildEchoCorePlaza(root.transform, new Vector3(0, 10, 60));

            // 10. Connecting Walkways and Stairs
            BuildConnectingWalkways(root.transform);

            // 11. Abyss boundary and safety net collider
            BuildSafetyVolume(root.transform);

            Debug.Log("[WorldBuilder] Successfully generated the floating city of Aster with all 8 districts.");
        }

        private void InitMaterials()
        {
            Shader litShader = Shader.Find("Standard") ?? Shader.Find("Universal Render Pipeline/Lit");
            if (stoneworkMat == null)
            {
                stoneworkMat = new Material(litShader) { name = "AsterStone", color = new Color(0.72f, 0.75f, 0.80f) };
            }
            if (metalMat == null)
            {
                metalMat = new Material(litShader) { name = "AsterBrass", color = new Color(0.55f, 0.45f, 0.28f) };
            }
            if (glowingCyanMat == null)
            {
                glowingCyanMat = new Material(litShader) { name = "GlowCyan", color = new Color(0.2f, 0.8f, 1.0f) };
                glowingCyanMat.EnableKeyword("_EMISSION");
                glowingCyanMat.SetColor("_EmissionColor", new Color(0.2f, 0.8f, 1.0f) * 1.5f);
            }
            if (glowingAmberMat == null)
            {
                glowingAmberMat = new Material(litShader) { name = "GlowAmber", color = new Color(1.0f, 0.6f, 0.1f) };
                glowingAmberMat.EnableKeyword("_EMISSION");
                glowingAmberMat.SetColor("_EmissionColor", new Color(1.0f, 0.6f, 0.1f) * 1.5f);
            }
            if (glowingGreenMat == null)
            {
                glowingGreenMat = new Material(litShader) { name = "GlowGreen", color = new Color(0.3f, 1.0f, 0.4f) };
                glowingGreenMat.EnableKeyword("_EMISSION");
                glowingGreenMat.SetColor("_EmissionColor", new Color(0.3f, 1.0f, 0.4f) * 1.5f);
            }
            if (glowingMagentaMat == null)
            {
                glowingMagentaMat = new Material(litShader) { name = "GlowMagenta", color = new Color(1.0f, 0.2f, 0.8f) };
                glowingMagentaMat.EnableKeyword("_EMISSION");
                glowingMagentaMat.SetColor("_EmissionColor", new Color(1.0f, 0.2f, 0.8f) * 1.5f);
            }
        }

        private void BuildCentralEchoTower(Transform parent)
        {
            GameObject tower = new GameObject("EchoCoreTower_Landmark");
            tower.transform.SetParent(parent, false);
            tower.transform.position = new Vector3(0, 0, 70);

            // Spire base
            GameObject baseCol = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            baseCol.transform.SetParent(tower.transform, false);
            baseCol.transform.localPosition = new Vector3(0, 25, 0);
            baseCol.transform.localScale = new Vector3(12, 25, 12);
            baseCol.GetComponent<MeshRenderer>().material = stoneworkMat;

            // Spire middle glowing conduit
            GameObject conduit = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            conduit.transform.SetParent(tower.transform, false);
            conduit.transform.localPosition = new Vector3(0, 55, 0);
            conduit.transform.localScale = new Vector3(6, 18, 6);
            conduit.GetComponent<MeshRenderer>().material = glowingCyanMat;

            // Spire tip / floating core ring
            GameObject ring = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            ring.transform.SetParent(tower.transform, false);
            ring.transform.localPosition = new Vector3(0, 80, 0);
            ring.transform.localScale = new Vector3(8, 8, 8);
            ring.GetComponent<MeshRenderer>().material = glowingGreenMat;
        }

        private void BuildArrivalHarbor(Transform parent, Vector3 center)
        {
            GameObject dist = new GameObject("District1_ArrivalHarbor");
            dist.transform.SetParent(parent, false);
            dist.transform.position = center;

            // Dock platform
            CreatePlatform(dist.transform, Vector3.zero, new Vector3(20, 2, 26), stoneworkMat);

            // Pier pillars
            for (int i = -8; i <= 8; i += 4)
            {
                CreatePlatform(dist.transform, new Vector3(i, 1.2f, -12), new Vector3(0.6f, 1.2f, 0.6f), metalMat);
                CreatePlatform(dist.transform, new Vector3(i, 1.2f, 12), new Vector3(0.6f, 1.2f, 0.6f), metalMat);
            }

            // Service Gate (Locked until Chapter 1 solved)
            GameObject gateL = CreatePlatform(dist.transform, new Vector3(-4, 3, 12), new Vector3(1.5f, 4, 1.5f), metalMat);
            GameObject gateR = CreatePlatform(dist.transform, new Vector3(4, 3, 12), new Vector3(1.5f, 4, 1.5f), metalMat);
            GameObject barrier = CreatePlatform(dist.transform, new Vector3(0, 2.5f, 12), new Vector3(6.5f, 3, 0.4f), glowingAmberMat);
            barrier.name = "Chapter1_Barrier";

            // Terminal Console Pedestal
            CreatePuzzleTerminal(dist.transform, new Vector3(0, 1.0f, 6), 1);
        }

        private void BuildSwitchworks(Transform parent, Vector3 center)
        {
            GameObject dist = new GameObject("District2_Switchworks");
            dist.transform.SetParent(parent, false);
            dist.transform.position = center;

            CreatePlatform(dist.transform, Vector3.zero, new Vector3(24, 2, 24), stoneworkMat);

            // Industrial cogs / machinery pillars
            for (int x = -8; x <= 8; x += 16)
            {
                GameObject pillar = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                pillar.transform.SetParent(dist.transform, false);
                pillar.transform.localPosition = new Vector3(x, 4, 0);
                pillar.transform.localScale = new Vector3(3, 4, 3);
                pillar.GetComponent<MeshRenderer>().material = metalMat;
            }

            // Lift bridge barrier
            GameObject liftBarrier = CreatePlatform(dist.transform, new Vector3(0, 2.5f, 11), new Vector3(8, 3, 0.4f), glowingAmberMat);
            liftBarrier.name = "Chapter2_LiftBarrier";

            CreatePuzzleTerminal(dist.transform, new Vector3(0, 1.0f, 2), 2);
        }

        private void BuildTwinLightGarden(Transform parent, Vector3 center)
        {
            GameObject dist = new GameObject("District3_TwinLightGarden");
            dist.transform.SetParent(parent, false);
            dist.transform.position = center;

            CreatePlatform(dist.transform, Vector3.zero, new Vector3(26, 2, 26), stoneworkMat);

            // Twin light canals (Branch 0 and Branch 1)
            CreatePlatform(dist.transform, new Vector3(-5, 1.05f, 0), new Vector3(2, 0.1f, 20), glowingCyanMat);
            CreatePlatform(dist.transform, new Vector3(5, 1.05f, 0), new Vector3(2, 0.1f, 20), glowingAmberMat);

            // Coherence Relay Gate
            GameObject gardenRelay = CreatePlatform(dist.transform, new Vector3(0, 2.5f, 12), new Vector3(7, 3, 0.4f), glowingCyanMat);
            gardenRelay.name = "Chapter3_CoherenceBarrier";

            CreatePuzzleTerminal(dist.transform, new Vector3(0, 1.0f, -2), 3);
        }

        private void BuildPhaseObservatory(Transform parent, Vector3 center)
        {
            GameObject dist = new GameObject("District4_PhaseObservatory");
            dist.transform.SetParent(parent, false);
            dist.transform.position = center;

            // Circular observatory platform
            GameObject baseCyl = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            baseCyl.transform.SetParent(dist.transform, false);
            baseCyl.transform.localPosition = Vector3.zero;
            baseCyl.transform.localScale = new Vector3(26, 2, 26);
            baseCyl.GetComponent<MeshRenderer>().material = stoneworkMat;

            // Interference Lens Dome Wireframe
            GameObject dome = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            dome.transform.SetParent(dist.transform, false);
            dome.transform.localPosition = new Vector3(0, 6, 0);
            dome.transform.localScale = new Vector3(14, 10, 14);
            dome.GetComponent<MeshRenderer>().material = metalMat;

            // Phase Beacon at center
            GameObject beacon = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            beacon.transform.SetParent(dist.transform, false);
            beacon.transform.localPosition = new Vector3(0, 5, 0);
            beacon.transform.localScale = new Vector3(1.2f, 6, 1.2f);
            beacon.GetComponent<MeshRenderer>().material = glowingMagentaMat;
            beacon.name = "Chapter4_PhaseBeacon";

            CreatePuzzleTerminal(dist.transform, new Vector3(0, 1.0f, -6), 4);
        }

        private void BuildEchoBridge(Transform parent, Vector3 center)
        {
            GameObject dist = new GameObject("District5_EchoBridge");
            dist.transform.SetParent(parent, false);
            dist.transform.position = center;

            // Long bridge spans
            CreatePlatform(dist.transform, Vector3.zero, new Vector3(14, 2, 34), stoneworkMat);

            // Bridge archways
            for (int z = -12; z <= 12; z += 12)
            {
                CreatePlatform(dist.transform, new Vector3(-6, 3, z), new Vector3(1.2f, 4, 1.2f), metalMat);
                CreatePlatform(dist.transform, new Vector3(6, 3, z), new Vector3(1.2f, 4, 1.2f), metalMat);
                CreatePlatform(dist.transform, new Vector3(0, 5, z), new Vector3(13, 0.8f, 1.2f), stoneworkMat);
            }

            CreatePuzzleTerminal(dist.transform, new Vector3(0, 1.0f, 0), 5);
        }

        private void BuildReversalVault(Transform parent, Vector3 center)
        {
            GameObject dist = new GameObject("District6_ReversalVault");
            dist.transform.SetParent(parent, false);
            dist.transform.position = center;

            CreatePlatform(dist.transform, Vector3.zero, new Vector3(26, 2, 26), stoneworkMat);

            // Vault portal pillars and arch
            CreatePlatform(dist.transform, new Vector3(-6, 4, 10), new Vector3(2, 6, 2), stoneworkMat);
            CreatePlatform(dist.transform, new Vector3(6, 4, 10), new Vector3(2, 6, 2), stoneworkMat);
            CreatePlatform(dist.transform, new Vector3(0, 7.5f, 10), new Vector3(14, 1.5f, 2.5f), stoneworkMat);

            // Dr. Ishan's locked archive door
            GameObject vaultDoor = CreatePlatform(dist.transform, new Vector3(0, 3.5f, 10), new Vector3(10, 5.5f, 0.5f), metalMat);
            vaultDoor.name = "Chapter6_VaultDoor";

            CreatePuzzleTerminal(dist.transform, new Vector3(0, 1.0f, 2), 6);
        }

        private void BuildMeasurementStation(Transform parent, Vector3 center)
        {
            GameObject dist = new GameObject("District7_MeasurementStation");
            dist.transform.SetParent(parent, false);
            dist.transform.position = center;

            CreatePlatform(dist.transform, Vector3.zero, new Vector3(28, 2, 28), stoneworkMat);

            // Auditor collapse sensors
            for (int i = 0; i < 4; i++)
            {
                float angle = i * 90f * Mathf.Deg2Rad;
                Vector3 pos = new Vector3(Mathf.Cos(angle) * 8f, 2.5f, Mathf.Sin(angle) * 8f);
                GameObject sensor = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                sensor.transform.SetParent(dist.transform, false);
                sensor.transform.localPosition = pos;
                sensor.transform.localScale = new Vector3(1.2f, 3f, 1.2f);
                sensor.GetComponent<MeshRenderer>().material = glowingAmberMat;
            }

            CreatePuzzleTerminal(dist.transform, new Vector3(0, 1.0f, 0), 7);
        }

        private void BuildEchoCorePlaza(Transform parent, Vector3 center)
        {
            GameObject dist = new GameObject("District8_EchoCorePlaza");
            dist.transform.SetParent(parent, false);
            dist.transform.position = center;

            // Grand circular altar
            GameObject plazaCyl = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            plazaCyl.transform.SetParent(dist.transform, false);
            plazaCyl.transform.localPosition = Vector3.zero;
            plazaCyl.transform.localScale = new Vector3(32, 2, 32);
            plazaCyl.GetComponent<MeshRenderer>().material = stoneworkMat;

            // Final Master Terminal
            CreatePuzzleTerminal(dist.transform, new Vector3(0, 1.0f, -4), 8);
        }

        private void BuildConnectingWalkways(Transform parent)
        {
            GameObject paths = new GameObject("Walkways_And_Ramps");
            paths.transform.SetParent(parent, false);

            // Harbor to central hub
            CreatePlatform(paths.transform, new Vector3(0, 1, -30), new Vector3(8, 1.5f, 20), stoneworkMat);

            // Central hub to Switchworks (West ramp)
            CreatePlatform(paths.transform, new Vector3(-18, 1.5f, -20), new Vector3(18, 1.5f, 7), stoneworkMat);

            // Central hub to Garden (East ramp)
            CreatePlatform(paths.transform, new Vector3(18, 1.5f, -20), new Vector3(18, 1.5f, 7), stoneworkMat);

            // Switchworks to Observatory
            CreatePlatform(paths.transform, new Vector3(-40, 3.5f, -5), new Vector3(7, 1.5f, 20), stoneworkMat);

            // Central hub to Echo Bridge
            CreatePlatform(paths.transform, new Vector3(0, 3, -5), new Vector3(8, 1.5f, 16), stoneworkMat);

            // Garden to Reversal Vault
            CreatePlatform(paths.transform, new Vector3(40, 3.5f, -5), new Vector3(7, 1.5f, 20), stoneworkMat);

            // Bridge to Measurement Station
            CreatePlatform(paths.transform, new Vector3(-10, 5.5f, 28), new Vector3(16, 1.5f, 10), stoneworkMat);

            // Bridge to Echo Core Plaza
            CreatePlatform(paths.transform, new Vector3(0, 7.5f, 38), new Vector3(10, 2f, 24), stoneworkMat);
        }

        private void BuildSafetyVolume(Transform parent)
        {
            // Safety trigger volume underneath city to catch any fallen objects or player
            GameObject safetyObj = new GameObject("AbyssSafetyNet");
            safetyObj.transform.SetParent(parent, false);
            safetyObj.transform.position = new Vector3(0, -25, 0);

            BoxCollider col = safetyObj.AddComponent<BoxCollider>();
            col.size = new Vector3(400, 10, 400);
            col.isTrigger = true;
        }

        private GameObject CreatePlatform(Transform parent, Vector3 localPos, Vector3 scale, Material mat)
        {
            GameObject plat = GameObject.CreatePrimitive(PrimitiveType.Cube);
            plat.transform.SetParent(parent, false);
            plat.transform.localPosition = localPos;
            plat.transform.localScale = scale;
            plat.GetComponent<MeshRenderer>().material = mat;
            return plat;
        }

        private void CreatePuzzleTerminal(Transform parent, Vector3 localPos, int chapterId)
        {
            GameObject console = new GameObject($"PuzzleTerminal_Ch{chapterId}");
            console.transform.SetParent(parent, false);
            console.transform.localPosition = localPos;

            // Pedestal base
            GameObject basePlat = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            basePlat.transform.SetParent(console.transform, false);
            basePlat.transform.localPosition = new Vector3(0, 0.4f, 0);
            basePlat.transform.localScale = new Vector3(1.8f, 0.8f, 1.8f);
            basePlat.GetComponent<MeshRenderer>().material = metalMat;

            // Glowing terminal screen
            GameObject screen = GameObject.CreatePrimitive(PrimitiveType.Cube);
            screen.transform.SetParent(console.transform, false);
            screen.transform.localPosition = new Vector3(0, 1.1f, 0);
            screen.transform.localRotation = Quaternion.Euler(25f, 0, 0);
            screen.transform.localScale = new Vector3(1.2f, 0.7f, 0.15f);
            screen.GetComponent<MeshRenderer>().material = glowingCyanMat;

            // Trigger collider for player interaction
            BoxCollider trigger = console.AddComponent<BoxCollider>();
            trigger.size = new Vector3(4.0f, 3.0f, 4.0f);
            trigger.center = new Vector3(0, 1.0f, 0);
            trigger.isTrigger = true;

            // Attach PuzzleController component configured for this chapter
            var controller = console.AddComponent<PuzzleController>();
            // Configured to start at this chapter when interacted
        }
    }
}

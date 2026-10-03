import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { QuantumState } from '../quantum/quantumEngine';

interface CityGameCanvasProps {
  quantumState: QuantumState;
  activeChapter: number;
  onEnterConsole: (chapterId: number) => void;
  isConsoleOpen: boolean;
}

interface DistrictInfo {
  id: number;
  name: string;
  pos: THREE.Vector3;
}

interface PlatformAABB {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  topY: number;
}

export const CityGameCanvas: React.FC<CityGameCanvasProps> = ({
  quantumState,
  activeChapter,
  onEnterConsole,
  isConsoleOpen,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const promptRef = useRef<HTMLDivElement | null>(null);

  // References for game loop
  const playerPosRef = useRef(new THREE.Vector3(0, 1.0, -46));
  const playerVelocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const playerRotRef = useRef(0);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const isGroundedRef = useRef(true);
  const cameraAngleRef = useRef({ yaw: 0, pitch: 0.32, distance: 6.8 });
  const isMouseLookRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const walkCycleRef = useRef(0);

  // Platform collision registry for solid land physics
  const platformsRef = useRef<PlatformAABB[]>([]);

  // Terminal locations for districts 1-8
  const terminalsRef = useRef<DistrictInfo[]>([
    { id: 1, name: 'Arrival Harbor', pos: new THREE.Vector3(0, 1.0, -38) },
    { id: 2, name: 'Switchworks', pos: new THREE.Vector3(-35, 3.0, -18) },
    { id: 3, name: 'The Twin-Light Garden', pos: new THREE.Vector3(35, 3.0, -18) },
    { id: 4, name: 'Phase Observatory', pos: new THREE.Vector3(-45, 6.0, 10) },
    { id: 5, name: 'Echo Bridge', pos: new THREE.Vector3(0, 5.0, 10) },
    { id: 6, name: 'The Reversal Vault', pos: new THREE.Vector3(45, 6.0, 10) },
    { id: 7, name: 'Measurement Station', pos: new THREE.Vector3(-20, 8.0, 42) },
    { id: 8, name: 'The Echo Core', pos: new THREE.Vector3(0, 11.0, 56) },
  ]);

  const nearestTerminalRef = useRef<DistrictInfo | null>(null);

  // Keep live references to props to prevent re-instantiating the entire Three.js world
  const quantumStateRef = useRef(quantumState);
  quantumStateRef.current = quantumState;

  const isConsoleOpenRef = useRef(isConsoleOpen);
  isConsoleOpenRef.current = isConsoleOpen;

  const onEnterConsoleRef = useRef(onEnterConsole);
  onEnterConsoleRef.current = onEnterConsole;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.012);

    const initialWidth = container.clientWidth || window.innerWidth;
    const initialHeight = container.clientHeight || window.innerHeight - 56;

    const camera = new THREE.PerspectiveCamera(
      55,
      Math.max(0.1, initialWidth / Math.max(1, initialHeight)),
      0.1,
      500
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(initialWidth, initialHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 1b. Post-processing Bloom Pipeline (Ethereal Quantum Glow)
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(initialWidth, initialHeight),
      0.65,
      0.42,
      0.72
    );
    composer.addPass(bloomPass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0x405570, 1.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff1dc, 1.8);
    dirLight.position.set(40, 70, -20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // 3. Materials
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xb48b48, roughness: 0.4, metalness: 0.6 });
    const cyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.5,
      toneMapped: false,
    });
    const amberGlowMat = new THREE.MeshStandardMaterial({
      color: 0xfb923c,
      emissive: 0xea580c,
      emissiveIntensity: 1.5,
      toneMapped: false,
    });
    const greenGlowMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      emissive: 0x16a34a,
      emissiveIntensity: 1.5,
      toneMapped: false,
    });
    const magentaGlowMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      emissive: 0xdb2777,
      emissiveIntensity: 1.5,
      toneMapped: false,
    });

    // 4. Construct Aster Floating City Platforms & Land Registry
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    platformsRef.current = [];

    // Helper: Add Platform Box with collision
    const addPlatformBox = (x: number, y: number, z: number, w: number, h: number, d: number, mat: THREE.Material) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      mesh.position.set(x, y, z);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      cityGroup.add(mesh);

      // Register collision box: top surface is at y + h/2
      platformsRef.current.push({
        minX: x - w / 2 - 0.5,
        maxX: x + w / 2 + 0.5,
        minZ: z - d / 2 - 0.5,
        maxZ: z + d / 2 + 0.5,
        topY: y + h / 2,
      });

      return mesh;
    };

    // Helper: Add Platform Cylinder with collision
    const addPlatformCylinder = (x: number, y: number, z: number, radius: number, h: number, mat: THREE.Material) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, h, 32), mat);
      mesh.position.set(x, y, z);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      cityGroup.add(mesh);

      platformsRef.current.push({
        minX: x - radius - 0.5,
        maxX: x + radius + 0.5,
        minZ: z - radius - 0.5,
        maxZ: z + radius + 0.5,
        topY: y + h / 2,
      });

      return mesh;
    };

    // Floating Quantum Coherence Motes
    const moteGeo = new THREE.BufferGeometry();
    const moteCount = 280;
    const motePositions = new Float32Array(moteCount * 3);
    for (let i = 0; i < moteCount; i++) {
      motePositions[i * 3] = (Math.random() - 0.5) * 130;
      motePositions[i * 3 + 1] = Math.random() * 26 + 1;
      motePositions[i * 3 + 2] = (Math.random() - 0.5) * 150;
    }
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
    const moteMat = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 0.38,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const motes = new THREE.Points(moteGeo, moteMat);
    cityGroup.add(motes);

    // Central Landmark: The Echo Core Tower Spire
    const towerSpire = new THREE.Mesh(new THREE.CylinderGeometry(4, 8, 70, 16), stoneMat);
    towerSpire.position.set(0, 35, 75);
    cityGroup.add(towerSpire);

    const towerRing = new THREE.Mesh(new THREE.TorusGeometry(12, 1.2, 12, 32), cyanGlowMat);
    towerRing.position.set(0, 65, 75);
    towerRing.rotation.x = Math.PI / 2;
    cityGroup.add(towerRing);

    // DISTRICT PLATFORMS WITH SOLID GROUND:
    // District 1: Arrival Harbor (top surface at y = 1.0)
    addPlatformBox(0, 0, -50, 26, 2, 32, stoneMat);
    addPlatformBox(-8, 2.5, -36, 1.5, 4, 1.5, brassMat);
    addPlatformBox(8, 2.5, -36, 1.5, 4, 1.5, brassMat);

    // Walkway from Harbor to Hub (top surface at y = 1.75)
    addPlatformBox(0, 0.75, -32, 10, 2, 16, stoneMat);

    // Central Hub Plaza (top surface at y = 2.5)
    addPlatformBox(0, 1.5, -20, 24, 2, 18, stoneMat);

    // District 2: Switchworks (top surface at y = 3.0)
    addPlatformBox(-35, 2, -20, 28, 2, 28, stoneMat);
    addPlatformBox(-18, 1.75, -20, 18, 2, 9, stoneMat); // Hub to Switchworks
    const cog = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 2, 12), brassMat);
    cog.position.set(-35, 4, -20);
    cityGroup.add(cog);

    // District 3: Twin-Light Garden (top surface at y = 3.0)
    addPlatformBox(35, 2, -20, 28, 2, 28, stoneMat);
    addPlatformBox(18, 1.75, -20, 18, 2, 9, stoneMat); // Hub to Garden
    addPlatformBox(30, 3.1, -20, 2.5, 0.2, 22, cyanGlowMat);
    addPlatformBox(40, 3.1, -20, 2.5, 0.2, 22, amberGlowMat);

    // District 4: Phase Observatory (top surface at y = 6.0)
    addPlatformCylinder(-45, 5, 10, 15, 2, stoneMat);
    addPlatformBox(-40, 3.5, -5, 9, 2, 18, stoneMat); // Switchworks to Observatory
    const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 8, 12), magentaGlowMat);
    beacon.position.set(-45, 10, 10);
    cityGroup.add(beacon);

    // District 5: Echo Bridge (top surface at y = 5.0)
    addPlatformBox(0, 4, 10, 16, 2, 38, stoneMat);
    addPlatformBox(0, 2.75, -5, 10, 2, 18, stoneMat); // Hub to Echo Bridge
    for (let z = -4; z <= 24; z += 14) {
      addPlatformBox(-7, 6.5, z, 1.2, 4, 1.2, brassMat);
      addPlatformBox(7, 6.5, z, 1.2, 4, 1.2, brassMat);
    }

    // District 6: Reversal Vault (top surface at y = 6.0)
    addPlatformBox(45, 5, 10, 28, 2, 28, stoneMat);
    addPlatformBox(40, 3.5, -5, 9, 2, 18, stoneMat); // Garden to Vault
    addPlatformBox(45, 8.5, 18, 12, 6, 1.5, brassMat); // Vault door

    // District 7: Measurement Station (top surface at y = 8.0)
    addPlatformBox(-20, 7, 42, 28, 2, 28, stoneMat);
    addPlatformBox(-12, 5.5, 28, 18, 2, 9, stoneMat); // Bridge to Measurement
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const sensor = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 4, 12), amberGlowMat);
      sensor.position.set(-20 + Math.cos(angle) * 9, 11, 42 + Math.sin(angle) * 9);
      cityGroup.add(sensor);
    }

    // District 8: Echo Core Plaza (top surface at y = 11.0)
    addPlatformCylinder(0, 10, 60, 18, 2, stoneMat);
    addPlatformBox(0, 7.5, 38, 12, 2, 22, stoneMat); // Bridge to Core Plaza

    // Terminal Consoles (Pedestal and Glowing Screen)
    terminalsRef.current.forEach((t) => {
      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.9, 12), brassMat);
      pedestal.position.set(t.pos.x, t.pos.y + 0.45, t.pos.z);
      cityGroup.add(pedestal);

      const screen = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.2), cyanGlowMat);
      screen.position.set(t.pos.x, t.pos.y + 1.1, t.pos.z);
      screen.rotation.x = 0.3;
      cityGroup.add(screen);

      // Terminal Beacon Light Pillar
      const beaconLight = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 5, 8),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55 })
      );
      beaconLight.position.set(t.pos.x, t.pos.y + 3.0, t.pos.z);
      cityGroup.add(beaconLight);
    });

    // 5. Stylized Character (Mira) & Echo Lantern
    // Mira is built so bottom of boots is EXACTLY at local y = 0.0!
    const playerGroup = new THREE.Group();
    scene.add(playerGroup);

    // Mira materials
    const coatMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.7 }); // Navy
    const scarfMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 }); // Golden
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.8 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const bootsMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });

    // Mira Model Hierarchy
    const miraBody = new THREE.Group();
    playerGroup.add(miraBody);

    // Contact shadow decal on the ground
    const shadowMesh = new THREE.Mesh(
      new THREE.RingGeometry(0.04, 0.42, 16),
      new THREE.MeshBasicMaterial({ color: 0x030712, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
    );
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.02;
    playerGroup.add(shadowMesh);

    // Legs (Cylinder height 0.5 centered at y = 0.25 -> Soles of boots at y = 0.0!)
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8), bootsMat);
    legL.position.set(-0.16, 0.25, 0);
    miraBody.add(legL);

    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8), bootsMat);
    legR.position.set(0.16, 0.25, 0);
    miraBody.add(legR);

    // Torso (Box height 0.62 centered at y = 0.76)
    const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.62, 0.32), coatMat);
    torsoMesh.position.y = 0.76;
    miraBody.add(torsoMesh);

    // Scarf (Cylinder height 0.14 centered at y = 1.1)
    const scarfMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.14, 12), scarfMat);
    scarfMesh.position.y = 1.1;
    miraBody.add(scarfMesh);

    // Head (Sphere radius 0.21 centered at y = 1.32)
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.21, 12, 12), skinMat);
    headMesh.position.y = 1.32;
    miraBody.add(headMesh);

    // Hair (Box height 0.3 centered at y = 1.42)
    const hairMesh = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.3, 0.46), hairMat);
    hairMesh.position.set(0, 1.42, -0.04);
    miraBody.add(hairMesh);

    // Echo Lantern
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(0.42, 0.8, 0.15);
    miraBody.add(lanternGroup);

    const lanternCoreMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 1.5 })
    );
    lanternGroup.add(lanternCoreMesh);

    // Branch 0 (|0⟩ cyan orb) and Branch 1 (|1⟩ amber orb)
    const branch0Mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 1.3 })
    );
    branch0Mesh.position.set(0, 0.22, 0);
    lanternGroup.add(branch0Mesh);

    const branch1Mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xfb923c, emissive: 0xfb923c, emissiveIntensity: 1.3 })
    );
    branch1Mesh.position.set(0, -0.22, 0);
    lanternGroup.add(branch1Mesh);

    // 6. Input Event Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'e') {
        if (nearestTerminalRef.current) {
          onEnterConsoleRef.current(nearestTerminalRef.current.id);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isMouseLookRef.current = true;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseLookRef.current) return;
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      cameraAngleRef.current.yaw -= dx * 0.006;
      cameraAngleRef.current.pitch = Math.max(
        0.1,
        Math.min(Math.PI / 2.5, cameraAngleRef.current.pitch + dy * 0.006)
      );
    };

    const handleMouseUp = () => {
      isMouseLookRef.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // 7. Animation Game Loop
    let animId: number;
    let lastTime = performance.now();

    const gameLoop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      if (!isConsoleOpenRef.current) {
        // Player Movement
        const speed = keysRef.current['shift'] ? 9.5 : 5.5;
        let moveX = 0;
        let moveZ = 0;

        if (keysRef.current['w'] || keysRef.current['arrowup']) moveZ += 1;
        if (keysRef.current['s'] || keysRef.current['arrowdown']) moveZ -= 1;
        if (keysRef.current['a'] || keysRef.current['arrowleft']) moveX -= 1;
        if (keysRef.current['d'] || keysRef.current['arrowright']) moveX += 1;

        if (moveX !== 0 || moveZ !== 0) {
          const moveLen = Math.sqrt(moveX * moveX + moveZ * moveZ);
          const normX = moveX / moveLen;
          const normZ = moveZ / moveLen;

          // Align movement with camera yaw
          const forward = new THREE.Vector3(
            Math.sin(cameraAngleRef.current.yaw),
            0,
            Math.cos(cameraAngleRef.current.yaw)
          );
          const right = new THREE.Vector3(
            Math.cos(cameraAngleRef.current.yaw),
            0,
            -Math.sin(cameraAngleRef.current.yaw)
          );

          const desiredMove = new THREE.Vector3()
            .addScaledVector(forward, normZ)
            .addScaledVector(right, normX)
            .multiplyScalar(speed * dt);

          playerPosRef.current.add(desiredMove);

          // Update Mira rotation to face movement direction
          playerRotRef.current = Math.atan2(desiredMove.x, desiredMove.z);

          // Procedural Walk Animation
          walkCycleRef.current += dt * speed * 3.5;
          legL.rotation.x = Math.sin(walkCycleRef.current) * 0.55;
          legR.rotation.x = -Math.sin(walkCycleRef.current) * 0.55;
          miraBody.position.y = Math.abs(Math.sin(walkCycleRef.current * 2)) * 0.06;
        } else {
          // Idle breathing
          walkCycleRef.current += dt * 1.5;
          legL.rotation.x = 0;
          legR.rotation.x = 0;
          miraBody.position.y = Math.sin(walkCycleRef.current) * 0.02;
        }

        // Jump & Gravity
        if (keysRef.current[' '] && isGroundedRef.current) {
          playerVelocityRef.current.y = 6.5;
          isGroundedRef.current = false;
        }

        playerVelocityRef.current.y -= 18.0 * dt;
        playerPosRef.current.y += playerVelocityRef.current.y * dt;

        // DYNAMIC PLATFORM COLLISION CHECK
        let highestGroundUnderPlayer = -999;
        const px = playerPosRef.current.x;
        const pz = playerPosRef.current.z;

        for (let i = 0; i < platformsRef.current.length; i++) {
          const p = platformsRef.current[i];
          if (px >= p.minX && px <= p.maxX && pz >= p.minZ && pz <= p.maxZ) {
            if (p.topY > highestGroundUnderPlayer) {
              highestGroundUnderPlayer = p.topY;
            }
          }
        }

        if (highestGroundUnderPlayer > -900) {
          // Player is over solid ground platform
          if (playerPosRef.current.y <= highestGroundUnderPlayer + 0.15) {
            playerPosRef.current.y = highestGroundUnderPlayer;
            playerVelocityRef.current.y = 0;
            isGroundedRef.current = true;
          }
        } else {
          // Player stepped off edge into the open sky
          isGroundedRef.current = false;
        }

        // Falling recovery: if fallen into deep cloud layer below, respawn safely on active district
        if (playerPosRef.current.y < -15) {
          const currentT =
            terminalsRef.current.find((t) => t.id === activeChapter) || terminalsRef.current[0];
          playerPosRef.current.set(currentT.pos.x, currentT.pos.y, currentT.pos.z - 4);
          playerVelocityRef.current.set(0, 0, 0);
          isGroundedRef.current = true;
        }
      }

      // Update Player Visual Transform
      playerGroup.position.copy(playerPosRef.current);
      playerGroup.rotation.y = playerRotRef.current;

      // Update Echo Lantern Visuals from Quantum State
      const currentQS = quantumStateRef.current;
      if (currentQS) {
        const p0 = currentQS.prob0;
        const p1 = currentQS.prob1;
        const phase = currentQS.relativePhase;

        // Modulate branches
        branch0Mesh.scale.setScalar(0.5 + p0 * 1.0);
        branch1Mesh.scale.setScalar(0.5 + p1 * 1.0);

        // Core emission tint combines probabilities and relative phase
        const coreMat = lanternCoreMesh.material as THREE.MeshStandardMaterial;
        if (Math.abs(phase) > 2.0) {
          coreMat.color.setHex(0xf472b6); // Magenta for opposite phase
          coreMat.emissive.setHex(0xdb2777);
        } else {
          coreMat.color.setHex(0x38bdf8); // Cyan for aligned phase
          coreMat.emissive.setHex(0x0284c7);
        }
      }

      // Smooth Third-Person Camera Follow
      const camYaw = cameraAngleRef.current.yaw;
      const camPitch = cameraAngleRef.current.pitch;
      const camDist = cameraAngleRef.current.distance;

      const camOffset = new THREE.Vector3(
        -Math.sin(camYaw) * Math.cos(camPitch) * camDist,
        Math.sin(camPitch) * camDist + 1.2,
        -Math.cos(camYaw) * Math.cos(camPitch) * camDist
      );

      camera.position.copy(playerPosRef.current).add(camOffset);
      camera.lookAt(
        playerPosRef.current.x,
        playerPosRef.current.y + 1.2,
        playerPosRef.current.z
      );

      // Check Proximity to Terminals
      let nearest: DistrictInfo | null = null;
      let minDistance = 5.0;

      terminalsRef.current.forEach((t) => {
        const dist = playerPosRef.current.distanceTo(t.pos);
        if (dist < minDistance) {
          minDistance = dist;
          nearest = t;
        }
      });

      nearestTerminalRef.current = nearest;
      if (promptRef.current) {
        const n = nearest as DistrictInfo | null;
        if (n && !isConsoleOpenRef.current) {
          promptRef.current.style.display = 'block';
          promptRef.current.innerText = `Press [E] to Interface with ${n.name} Terminal`;
        } else {
          promptRef.current.style.display = 'none';
        }
      }

      // Slowly drift floating quantum motes
      motes.rotation.y += dt * 0.035;

      // Render through ethereal post-processing bloom composer
      composer.render();
      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight - 56;
      if (w <= 0 || h <= 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloomPass.resolution.set(w, h);
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      composer.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Teleport to district when chapter changes externally
  useEffect(() => {
    const target = terminalsRef.current.find((t) => t.id === activeChapter);
    if (target) {
      playerPosRef.current.set(target.pos.x, target.pos.y, target.pos.z - 4);
      playerVelocityRef.current.set(0, 0, 0);
      isGroundedRef.current = true;
    }
  }, [activeChapter]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      <div ref={mountRef} className="w-full h-full cursor-crosshair" />

      {/* Floating Prompt on Proximity */}
      <div
        ref={promptRef}
        className="absolute bottom-28 left-1/2 -translate-x-1/2 hidden bg-sky-950/90 text-sky-200 border border-sky-400/60 px-5 py-2 rounded-full font-mono text-sm tracking-wide shadow-xl backdrop-blur animate-bounce pointer-events-none"
      >
        Press [E] to Interface with Terminal
      </div>

      {/* In-game Objective Banner */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/80 border border-sky-500/40 text-xs font-mono text-sky-200 shadow-xl backdrop-blur">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span>Walk to the glowing terminal ahead and press <b>[E]</b> to interface!</span>
        </div>
      </div>

      {/* Bottom Controls Legend */}
      <div className="absolute bottom-3 left-4 flex gap-4 text-xs font-mono text-slate-400 bg-slate-950/70 px-3 py-1.5 rounded-lg border border-slate-800/80 backdrop-blur pointer-events-none">
        <span><b>WASD</b>: Move</span>
        <span><b>Mouse Drag</b>: Orbit Camera</span>
        <span><b>Shift</b>: Sprint</span>
        <span><b>Space</b>: Jump</span>
        <span><b>E</b>: Interface</span>
      </div>
    </div>
  );
};

// =============================
// MAIN THREE.JS - SCÈNE
// =============================

import * as THREE from 'three';
import { createWorld } from './world.js';

/**
 * Initialise la scène Three.js
 * @returns {Object} { scene, camera, renderer, controls }
 */
export function initScene() {
  // 1. Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x7b9ec2); // Ciel bleu
  scene.fog = new THREE.Fog(0x7b9ec2, 10, 40); // Brouillard pour effet de profondeur

  // 2. Camera
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(15, 10, 15); // Position de départ isométrique
  camera.lookAt(0, 0, 0);

  // 3. Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 4. Controls (basés sur souris simple)
  setupCameraControls(camera, renderer.domElement);

  return { scene, camera, renderer };
}

/**
 * Configure la lumière
 * @param {THREE.Scene} scene
 */
export function setupLighting(scene) {
  // Lumière ambiante
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  // Lumière directionnelle (soleil)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 20, 10);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -20;
  directionalLight.shadow.camera.right = 20;
  directionalLight.shadow.camera.top = 20;
  directionalLight.shadow.camera.bottom = -20;
  scene.add(directionalLight);

  // Lumière de remplissage (contre-jour)
  const fillLight = new THREE.DirectionalLight(0x88ccff, 0.3);
  fillLight.position.set(-10, 10, -10);
  scene.add(fillLight);

  console.log('💡 Éclairage configuré');
}

/**
 * Ajoute le monde et le sol à la scène
 * @param {THREE.Scene} scene
 * @returns {THREE.Group}
 */
export function addWorld(scene) {
  // Créer le monde (map)
  const world = createWorld();
  scene.add(world);

  // Ajouter un sol de base
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshLambertMaterial({ color: 0x3d5c3d })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Herbe basse des 4 côtés
  const grass = new THREE.Mesh(
    new THREE.BoxGeometry(30, 0.1, 4),
    new THREE.MeshLambertMaterial({ color: 0x4a7a4a })
  );
  grass.position.set(0, 0.05, 14);
  grass.receiveShadow = true;
  scene.add(grass.copy().rotateY(-Math.PI / 2)); // Sud
  scene.add(grass.rotateY(Math.PI / 2)); // Nord
  scene.add(grass.rotateX(Math.PI / 2)); // Est
  scene.add(grass.rotateY(Math.PI).rotateX(-Math.PI / 2)); // Ouest

  console.log('🌍 Mondes ajouter à la scène');

  return world;
}

/**
 * Configure les contrôles de caméra basés sur souris
 * @param {THREE.PerspectiveCamera} camera
 * @param {HTMLCanvasElement} canvas
 */
function setupCameraControls(camera, canvas) {
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let theta = Math.PI / 4; // Azimutal
  let phi = Math.PI / 3; // Élévation
  let radius = 20; // Distance de la caméra

  // Convertir coordonnées sphériques en position cartésienne
  function updateCameraPosition() {
    camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
    camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.lookAt(0, 0, 0);
  }

  updateCameraPosition();

  // Event listeners
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    theta -= deltaX * 0.01;
    phi -= deltaY * 0.01;

    // Contraindre phi pour éviter l'inversion
    phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, phi));

    updateCameraPosition();
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  canvas.addEventListener('mouseup', () => {
    isDragging = false;
  });

  canvas.addEventListener('mouseleave', () => {
    isDragging = false;
  });

  // Zoom avec molette
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    radius += e.deltaY * 0.01;
    radius = Math.max(10, Math.min(50, radius));
    updateCameraPosition();
  }, { passive: false });

  // Reset avec double-clic
  canvas.addEventListener('dblclick', () => {
    theta = Math.PI / 4;
    phi = Math.PI / 3;
    radius = 20;
    updateCameraPosition();
  });

  console.log('🎮 Contrôles caméra activés (drag + zoom)');
}

/**
 * Boucle de rendu principale
 * @param {THREE.Scene} scene
 * @param {THREE.Camera} camera
 * @param {THREE.WebGLRenderer} renderer
 * @param {Function} animate
 */
export function animate(scene, camera, renderer, animate) {
  function loop() {
    requestAnimationFrame(loop);

    // Animation optionnelle (ex: rotation du monde)
    const world = scene.getObjectByName('monde');
    if (world) {
      world.rotation.y -= 0.0005;
    }

    animate();
    renderer.render(scene, camera);
  }

  loop();
}

/**
 * Gère le redimensionnement de la fenêtre
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.PerspectiveCamera} camera
 */
export function handleResize(renderer, camera) {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/**
 * Initialise et lance l'application Three.js
 */
export function start() {
  // Initialiser la scène
  const { scene, camera, renderer } = initScene();

  // Configurer l'éclairage
  setupLighting(scene);

  // Ajouter le monde
  const world = addWorld(scene);

  // Gérer le redimensionnement
  handleResize(renderer, camera);

  // Démarrer la boucle de rendu
  animate(scene, camera, renderer, () => {
    // Callback optionnel
  });

  console.log('🎮 Application Three.js démarrée');
}
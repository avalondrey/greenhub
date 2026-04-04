// =============================
// MODULE THREE.JS
// Exportations principales
// =============================

// Ancien système (faux 3D)
export { createWorld } from './world.js';
export { initScene, setupLighting, addWorld, animate, handleResize } from './main.js';
export { ThreeJsApp, startThreeJsApp } from './app.js';

// Nouveau système réaliste (V2)
export { RealisticApp, app, startRealisticApp } from './realistic/app.js';
export { RealisticWorld } from './realistic/realisticWorld.js';
export { gameState } from './realistic/stateManager.js';

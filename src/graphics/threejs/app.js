// =============================
// APPLICATION THREE.JS
// =============================

import { createWorld } from './world.js';
import { initScene, setupLighting, addWorld, animate, handleResize } from './main.js';

class ThreeJsApp {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.isAnimating = false;
  }

  /**
   * Initialise l'application
   */
  async init() {
    try {
      console.log('🎮 Initialisation de l\'application Three.js...');

      // 1. Initialiser la scène
      const { scene, camera, renderer } = initScene();
      this.scene = scene;
      this.camera = camera;
      this.renderer = renderer;

      // 2. Configurer l'éclairage
      setupLighting(scene);

      // 3. Ajouter le monde
      const world = addWorld(scene);

      // 4. Gérer le redimensionnement
      handleResize(renderer, camera);

      console.log('✅ Application initialisée avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur d\'initialisation:', error);
      return false;
    }
  }

  /**
   * Démarrage de l'animation
   */
  startAnimation() {
    if (this.isAnimating) return;

    console.log('🎬 Démarrage de la boucle d\'animation');

    const animateCallback = () => {
      // Animation optionnelle (ex: rotation du monde)
      if (this.scene) {
        const world = this.scene.getObjectByName('monde');
        if (world) {
          world.rotation.y -= 0.0005;
        }
      }

      requestAnimationFrame(animateCallback);
      this.renderer.render(this.scene, this.camera);
    };

    this.isAnimating = true;
    animateCallback();
  }

  /**
   * Gère les événements utilisateur
   */
  bindEvents() {
    const canvas = this.renderer.domElement;

    // Event listeners de contrôle
    canvas.addEventListener('mousedown', () => {
      // Code de début de drag
    });

    canvas.addEventListener('mouseup', () => {
      // Code de fin de drag
    });

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
    }, { passive: false });

    // Double-clic pour reset
    canvas.addEventListener('dblclick', () => {
      console.log('🔄 Réinitialisation de la caméra');
      // Reset de la caméra si besoin
    });

    console.log('🖱️ Événements utilisateur bindés');
  }

  /**
   * Ferme l'application
   */
  dispose() {
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    if (this.scene) {
      // Nettoyage de la scène
      this.scene.traverse((child) => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
      this.scene = null;
    }

    if (this.camera) {
      this.camera = null;
    }

    console.log('🛑 Application Three.js fermée');
  }
}

// Export pour l'usage direct ou pour l'import dans index.js
export { ThreeJsApp };

// Créer une instance par défaut
export const app = new ThreeJsApp();

/**
 * Démarrer l'application
 */
export function startThreeJsApp() {
  // Créer une nouvelle instance et l'initialiser
  const app = new ThreeJsApp();
  app.init().then((success) => {
    if (success) {
      app.bindEvents();
      app.startAnimation();
      return true;
    }
    return false;
  });
}
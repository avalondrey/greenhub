// ================================
// MONDE THREE.JS - FAUX 3D
// Dalle de terre avec effet de profondeur
// ================================

import * as THREE from 'three';

export const WORLD_WIDTH = 20;
export const WORLD_HEIGHT = 20;

// Couleurs pour les dalles de terre
const TILE_COLORS = {
  // Couleurs principales des dalles
  dirt: '#7a5030',
  dirtLight: '#8b6e48',
  dirtDark: '#6a4228',

  // Couleurs des faces latérales (pour effet 3D)
  dirtSideOffset: '#5a3820',  // Face intérieure (plus foncé)
  grass: '#5aab2a',
  grassDeep: '#4e9e22',
};

/**
 * Crée un groupe contenant une dalle de terre en faux-3D
 * @param {number} x - Position X
 * @param {number} z - Position Z
 * @param {number} level - Niveau de profondeur (0 à N)
 * @param {number} tileType - Type de dalle (0=normal, 1=superficie)
 * @returns {THREE.Group}
 */
export function createDirtTile(x, z, level = 0, tileType = 0) {
  const group = new THREE.Group();

  // Taille de la dalle
  const width = 1.0;
  const depth = 1.0;
  const height = level * 0.15; // Hauteur du niveau

  // 1. Haut de la dalle - Terre
  const dirtTopGeom = new THREE.BoxGeometry(width, 0.1, depth);
  const dirtTopMaterial = new THREE.MeshLambertMaterial({
    color: tileType === 1 ? TILE_COLORS.dirtLight : TILE_COLORS.dirt,
  });
  const dirtTop = new THREE.Mesh(dirtTopGeom, dirtTopMaterial);
  dirtTop.position.y = height / 2;
  group.add(dirtTop);

  // 2. Face latérale gauche (côté intérieur) + offset
  if (level > 0) {
    const sideWidth = THREE.MathUtils.lerp(width - 0.1, width, level / WORLD_HEIGHT);
    const sideHeight = THREE.MathUtils.lerp(0.1, height, level / WORLD_HEIGHT);
    const sideDepth = depth;

    const sideGeom = new THREE.BoxGeometry(sideWidth, sideHeight, sideDepth);
    const sideMaterial = new THREE.MeshLambertMaterial({
      color: TILE_COLORS.dirtSideOffset,
    });
    const side = new THREE.Mesh(sideGeom, sideMaterial);
    // Positionné avec décalage vertical vers l'arrière (plus foncé)
    const offsetY = THREE.MathUtils.lerp(height - 0.05, 0, level / WORLD_HEIGHT);
    side.position.set(-width / 2, offsetY, 0);
    group.add(side);
  }

  // 3. Face latérale droite (côté intérieur)
  if (level > 0) {
    const sideWidth = THREE.MathUtils.lerp(width - 0.1, width, level / WORLD_HEIGHT);
    const sideHeight = THREE.MathUtils.lerp(0.1, height, level / WORLD_HEIGHT);
    const sideDepth = depth;

    const sideGeom = new THREE.BoxGeometry(sideWidth, sideHeight, sideDepth);
    const sideMaterial = new THREE.MeshLambertMaterial({
      color: TILE_COLORS.dirtSideOffset,
    });
    const side = new THREE.Mesh(sideGeom, sideMaterial);
    const offsetY = THREE.MathUtils.lerp(height - 0.05, 0, level / WORLD_HEIGHT);
    side.position.set(width / 2, offsetY, 0);
    group.add(side);
  }

  // 4. Face avant (côté extérieur)
  if (level < WORLD_HEIGHT - 1) {
    const frontX = THREE.MathUtils.lerp(-width, -width + 0.1, level / WORLD_HEIGHT);
    const frontY = THREE.MathUtils.lerp(0.05, height, level / WORLD_HEIGHT);
    const frontZ = THREE.MathUtils.lerp(0, -0.05, level / WORLD_HEIGHT);

    const frontGeom = new THREE.PlaneGeometry(width * 0.8, depth * 0.8);
    const frontMaterial = new THREE.MeshLambertMaterial({
      color: TILE_COLORS.dirt,
      side: THREE.DoubleSide,
    });
    const front = new THREE.Mesh(frontGeom, frontMaterial);
    front.position.set(frontX, frontY, frontZ);
    front.rotation.x = -Math.PI / 2;
    group.add(front);
  }

  // Positionnement du groupe
  group.position.set(x, 0, z);
  group.rotation.x = Math.PI / 4; // Inclination pour vue isométrique

  return group;
}

/**
 * Crée un arbre en faux-3D à la postion (x, z, level)
 * @param {number} x - Position X
 * @param {number} z - Position Z
 * @param {number} level - Niveau de profondeur
 * @param {number} type - Type d'arbre (0=normal, 1=grand)
 * @returns {THREE.Group}
 */
export function createTree(x, z, level = 0, type = 0) {
  const group = new THREE.Group();

  // Types d'arbres
  const treeConfigs = {
    small: {
      trunkColor: '#8B4513',
      trunkHeight: 1.5,
      leafColor: '#5aab2a',
      leafScale: 1.2,
    },
    large: {
      trunkColor: '#8B4513',
      trunkHeight: 2.5,
      leafColor: '#4e9e22',
      leafScale: 2.0,
    },
  };

  const config = type === 1 ? treeConfigs.large : treeConfigs.small;

  // 1. Tronc de l'arbre
  const trunkGeom = new THREE.CylinderGeometry(
    0.15,
    0.2,
    config.trunkHeight,
    8
  );
  const trunkMat = new THREE.MeshLambertMaterial({ color: config.trunkColor });
  const trunk = new THREE.Mesh(trunkGeom, trunkMat);
  trunk.position.y = config.trunkHeight / 2 + 0.25;
  group.add(trunk);

  // 2. Feuillage de l'arbre
  // Cœur du feuillage
  const leavesGeom = new THREE.ConeGeometry(
    0.8 * config.leafScale,
    1.2 * config.leafScale,
    8
  );
  const leavesMat = new THREE.MeshLambertMaterial({ color: config.leafColor });
  const leaves = new THREE.Mesh(leavesGeom, leavesMat);
  leaves.position.y = config.trunkHeight * 0.7 + 0.35;
  group.add(leaves);

  // Couche supérieure
  const topLeavesGeom = new THREE.ConeGeometry(
    0.6 * config.leafScale,
    0.8 * config.leafScale,
    8
  );
  const topLeavesMat = new THREE.MeshLambertMaterial({ color: config.leafColor });
  const topLeaves = new THREE.Mesh(topLeavesGeom, topLeavesMat);
  topLeaves.position.y = config.trunkHeight * 1.4 + 0.35;
  group.add(topLeaves);

  // 3. Effet de bascule selon le niveau (effet perspective sur l'arbre)
  if (level > 0) {
    group.rotation.x = Math.PI / 4;
    group.rotation.y = Math.PI / 6 * level;
  } else {
    group.rotation.x = Math.PI / 4;
  }

  // Positionnement
  group.position.set(x, level * 0.01, z);

  return group;
}

/**
 * Crée toute la carte de monde
 * @returns {THREE.Group}
 */
export function createWorld() {
  const world = new THREE.Group();

  console.log('🎨 Création du monde en faux-3D...');

  // 1. Créer les dalles de terre avec effet 3D
  for (let x = 0; x < WORLD_WIDTH; x++) {
    for (let z = 0; z < WORLD_HEIGHT; z++) {
      // Type de tile aléatoire
      const tileType = Math.random() > 0.7 ? 1 : 0;

      // Créer la dalle
      const dirtTile = createDirtTile(x, z, 0, tileType);
      world.add(dirtTile);

      // Ajouter des arbres de manière aléatoire
      if (Math.random() > 0.8) {
        const treeType = Math.random() > 0.5 ? 1 : 0;
        const tree = createTree(x, z, 0, treeType);
        world.add(tree);
      }
    }
  }

  // 2. Ajouter des niveaux à différentes profondeurs
  for (let level = 1; level < 5; level++) {
    const levelGroup = new THREE.Group();
    levelGroup.name = `niveau-${level}`;

    for (let x = 0; x < WORLD_WIDTH; x++) {
      for (let z = 0; z < WORLD_HEIGHT; z++) {
        // Seulement certains endroits pour les niveaux
        if (Math.random() > 0.6) {
          const tileType = Math.random() > 0.7 ? 1 : 0;
          const dirtTile = createDirtTile(x, z, level, tileType);
          levelGroup.add(dirtTile);
        }

        // Arbres dans les niveaux
        if (Math.random() > 0.85) {
          const tree = createTree(x, z, level, Math.random() > 0.5 ? 1 : 0);
          levelGroup.add(tree);
        }
      }
    }

    world.add(levelGroup);
  }

  console.log(`✅ ${WORLD_WIDTH * WORLD_HEIGHT} dalles créées`);
  console.log(`🌲 ${WORLD_WIDTH * WORLD_HEIGHT * 0.1} arbres créés`);
  console.log(`🏔️  ${4} niveaux de profondeur`);

  return world;
}

/**
 * Configure l'environnement Three.js pour le faux 3D
 * @param {Object} renderer
 * @param {number} offsetX
 * @param {number} offsetZ
 */
export function setupFaux3D(renderer, offsetX = 0, offsetZ = 0) {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Paramètres faux-3D
  return {
    rotationX: Math.PI / 4, // Vue inclinée 45°
    rotationZ: Math.PI / 6, // Légère inclinaison
    offsetX,
    offsetZ,
  };
}
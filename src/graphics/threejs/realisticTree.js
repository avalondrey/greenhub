/**
 * 🌲 TreeRenderer — Render trees avec Three.js de manière réaliste
 * Options : 3 types d'arbres avec textures réelles et ombres détaillées
 */

import * as THREE from 'three';

// Couleurs et textures
const COLORS = {
  FOLIAGE: ['#2e7d32', '#388e3c', '#4caf50', '#66bb6a'],
  TRUNK: ['#5d4037', '#4e342e', '#3e2723'],
  BARK: '#5d4037'
};

class TreeRenderer {
  constructor(scene) {
    this.scene = scene;
    this.materials = null;
    this.geometryCache = {};
  }

  /**
   * Crée les matériaux réalistes pour les arbres
   */
  createMaterials() {
    if (this.materials) return this.materials;

    this.materials = {
      foliage: [
        new THREE.MeshPhongMaterial({
          color: COLORS.FOLIAGE[0],
          shininess: 30,
          flatShading: true
        }),
        new THREE.MeshLambertMaterial({
          color: COLORS.FOLIAGE[1],
          shininess: 20
        }),
        new THREE.MeshStandardMaterial({
          color: COLORS.FOLIAGE[2],
          roughness: 0.8,
          metalness: 0.1
        })
      ],
      trunk: new THREE.MeshStandardMaterial({
        color: COLORS.TRUNK[0],
        roughness: 0.9,
        metalness: 0.0
      }),
      bark: [
        new THREE.MeshStandardMaterial({
          color: COLORS.BARK[0],
          roughness: 1.0,
          bumpScale: 0.02
        }),
        new THREE.MeshStandardMaterial({
          color: COLORS.BARK[1],
          roughness: 0.95
        })
      ]
    };

    return this.materials;
  }

  /**
   * 💾 Cache les géométries pour un rendu ultérieur rapide
   */
  cacheGeometry(type, data) {
    if (!this.geometryCache[type]) {
      this.geometryCache[type] = data;
    }
    return this.geometryCache[type];
  }

  /**
   * 🌳 Crée un sapin (conifère)
   */
  createPineTree(scale = 1, position = { x: 0, y: 0, z: 0 }) {
    const { foliage, trunk } = this.createMaterials();

    const tree = new THREE.Group();

    // Tronc
    const trunkHeight = 4 * scale;
    const trunkGeometry = new THREE.CylinderGeometry(0.3 * scale, 0.5 * scale, trunkHeight, 8);
    const trunk = new THREE.Mesh(trunkGeometry, trunk);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    // Feuillage en coniques superposées
    const levels = 3;
    for (let i = 0; i < levels; i++) {
      const size = (1.5 - i * 0.4) * scale;
      const yOffset = (0.5 + i * 0.8) * scale;
      const foliageGeo = new THREE.ConeGeometry(size, size, 8);
      const foliage = new THREE.Mesh(foliageGeo, foliage[Math.floor(Math.random() * foliage.length)]);
      foliage.position.y = yOffset;
      foliage.castShadow = true;
      foliage.receiveShadow = true;
      tree.add(foliage);
    }

    tree.position.set(position.x, position.y, position.z);

    return tree;
  }

  /**
   * 🌿 Crée un arbre caduc (feuillage ombré)
   */
  createDeciduousTree(scale = 1, position = { x: 0, y: 0, z: 0 }) {
    const { foliage, trunk } = this.createMaterials();

    const tree = new THREE.Group();

    // Tronc avec détail bark
    const trunkHeight = 6 * scale;
    const branchPositions = [
      { x: 0.3 * scale, y: trunkHeight * 0.4 },
      { x: -0.35 * scale, y: trunkHeight * 0.5 },
      { x: 0.2 * scale, y: trunkHeight * 0.7 }
    ];

    // Tronc principal
    const trunkGeo = new THREE.CylinderGeometry(0.4 * scale, 0.6 * scale, trunkHeight, 6);
    const trunk = new THREE.Mesh(trunkGeo, trunk[Math.floor(Math.random() * trunk.length)]);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    // Branches
    branchPositions.forEach(branch => {
      const branchGeo = new THREE.CylinderGeometry(0.1 * scale, 0.15 * scale, branch.y * 0.7, 6);
      const branchMesh = new THREE.Mesh(branchGeo, trunk);
      branchMesh.position.set(branch.x, branch.y, branch.z);
      branchMesh.castShadow = true;
      tree.add(branchMesh);
    });

    // Feuillage en sphères pour effet ombré
    const foliageCount = 8 + Math.floor(Math.random() * 4);
    for (let i = 0; i < foliageCount; i++) {
      const foliageGeo = new THREE.DodecahedronGeometry(0.5 * scale * Math.random(), 2);
      const foliageMesh = new THREE.Mesh(foliageGeo, foliage[Math.floor(Math.random() * foliage.length)]);
      foliageMesh.position.set(
        (Math.random() - 0.5) * 2.5 * scale,
        (trunkHeight * 0.5) + Math.random() * 2 * scale,
        (Math.random() - 0.5) * 2.5 * scale
      );
      foliageMesh.scale.setScalar(1 + Math.random() * 0.5);
      foliageMesh.castShadow = true;
      foliageMesh.receiveShadow = true;
      tree.add(foliageMesh);
    }

    tree.position.set(position.x, position.y, position.z);

    return tree;
  }

  /**
   * 🌴 Crée un palmier
   */
  createPalmTree(scale = 1, position = { x: 0, y: 0, z: 0 }) {
    const { foliage, trunk } = this.createMaterials();

    const tree = new THREE.Group();

    // Tronc
    const trunkHeight = 8 * scale;
    const trunkGeo = new THREE.CylinderGeometry(0.3 * scale, 0.6 * scale, trunkHeight, 6);
    const trunk = new THREE.Mesh(trunkGeo, trunk);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    // Feuilles de palmier
    const leafCount = 6;
    for (let i = 0; i < leafCount; i++) {
      const angle = (i / leafCount) * Math.PI * 2;

      // Structure de la feuille
      const leafGeo = new THREE.ConeGeometry(0.3 * scale, 2.5 * scale, 4, 1, true);
      const leaf = new THREE.Mesh(leafGeo, foliage[0]);
      leaf.position.y = trunkHeight * 0.7;
      leaf.position.x = Math.sin(angle) * 0.5 * scale;
      leaf.position.z = Math.cos(angle) * 0.5 * scale;
      leaf.rotation.z = -Math.PI / 2;
      leaf.rotation.y = angle;

      leaf.castShadow = true;
      leaf.receiveShadow = true;

      tree.add(leaf);
    }

    // Évêchets (fruits)
    for (let i = 0; i < 3; i++) {
      const dateGeo = new THREE.SphereGeometry(0.1 * scale, 8, 8);
      const date = new THREE.Mesh(dateGeo, new THREE.MeshBasicMaterial({ color: 0xff6600 }));
      date.position.set(
        (Math.random() - 0.5) * 1.5 * scale,
        trunkHeight * 0.6,
        (Math.random() - 0.5) * 1.5 * scale
      );
      tree.add(date);
    }

    tree.position.set(position.x, position.y, position.z);

    return tree;
  }

  /**
   * 🎲 Crée un arbre avec type varié
   */
  generateTree(type = 'pine', scale = 1, position = { x: 0, y: 0, z: 0 }) {
    switch(type) {
      case 'pine':
        return this.createPineTree(scale, position);
      case 'deciduous':
        return this.createDeciduousTree(scale, position);
      case 'palm':
        return this.createPalmTree(scale, position);
      default:
        return this.createPineTree(scale, position);
    }
  }
}

export default TreeRenderer;
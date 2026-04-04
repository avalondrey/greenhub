// =============================================
// Ludus Terrae V2 - Grid Deck Helper
// Grille isométrique 3D cliquable (remplace le sol)
// =============================================

import * as THREE from 'three';

// ── GARDEN OBJECTS DATABASE (same as App.jsx GARDEN_OBJECTS_DB) ─────────────
const GARDEN_OBJECTS = {
  fruit_trees: [
    { id: 'apple_tree', name: 'Pommier', emoji: '🍎', type: 'fruit_tree', color: '#e74c3c', spanCells: 2, description: 'Pommier productif', production: '6-10 pommes/mois', width: 1, height: 1 },
    { id: 'pear_tree', name: 'Poirier', emoji: '🍐', type: 'fruit_tree', color: '#a8e6cf', spanCells: 2, description: 'Poirier doux', production: '5-8 poires/mois', width: 1, height: 1 },
    { id: 'cherry_tree', name: 'Cerisier', emoji: '🍒', type: 'fruit_tree', color: '#ff6b6b', spanCells: 2, description: 'Cerisier ornemental', production: '4-7 cerises/mois', width: 1, height: 1 },
    { id: 'orange_tree', name: 'Oranger', emoji: '🍊', type: 'fruit_tree', color: '#ffa502', spanCells: 2, description: 'Oranger Méditerranéen', production: '8-12 oranges/mois', width: 1, height: 1 },
    { id: 'lemon_tree', name: 'Citronnier', emoji: '🍋', type: 'fruit_tree', color: '#fff200', spanCells: 2, description: 'Citronnier parfumé', production: '5-9 citrons/mois', width: 1, height: 1 },
  ],
  trees: [
    { id: 'oak', name: 'Chêne', emoji: '🌳', type: 'tree', color: '#27ae60', spanCells: 2, description: 'Grand chêne majestic', width: 1, height: 1 },
    { id: 'maple', name: 'Érable', emoji: '🍁', type: 'tree', color: '#e67e22', spanCells: 2, description: 'Érable aux couleurs vives', width: 1, height: 1 },
    { id: 'pine', name: 'Sapin', emoji: '🌲', type: 'tree', color: '#2ecc71', spanCells: 2, description: 'Sapin persistant', width: 1, height: 1 },
    { id: 'birch', name: 'Bouleau', emoji: '🌴', type: 'tree', color: '#f1c40f', spanCells: 2, description: 'Bouleau élégant', width: 1, height: 1 },
  ],
  hedges: [
    { id: 'hedge_oak', name: 'Haie de Chêne', emoji: '🌿', type: 'hedge', color: '#2ecc71', spanCells: 1, description: 'Haie dense', width: 1, height: 1 },
    { id: 'hedge_yew', name: 'Haie de If', emoji: '🌲', type: 'hedge', color: '#27ae60', spanCells: 1, description: 'Haie taillée', width: 1, height: 1 },
  ],
  shrubs: [
    { id: 'hydrangea', name: 'Hortensia', emoji: '💐', type: 'shrub', color: '#9b59b6', spanCells: 1, description: 'Arbuste fleuri', width: 1, height: 1 },
    { id: 'rose_bush', name: 'Rosier', emoji: '🌹', type: 'shrub', color: '#e91e63', spanCells: 1, description: 'Rosier parfumé', width: 1, height: 1 },
    { id: 'lavender', name: 'Lavande', emoji: '💜', type: 'shrub', color: '#8e44ad', spanCells: 1, description: 'Lavande parfumée', width: 1, height: 1 },
  ],
  small_fruits: [
    { id: 'blueberry', name: 'Myrtillier', emoji: '🫐', type: 'small_fruit', color: '#6c5ce7', spanCells: 1, description: 'Buisson à petits fruits', width: 1, height: 1 },
    { id: 'raspberry', name: 'Framboisier', emoji: '🍓', type: 'small_fruit', color: '#e84393', spanCells: 1, description: 'Buisson productif', width: 1, height: 1 },
    { id: 'currant', name: 'Groseillier', emoji: '🔴', type: 'small_fruit', color: '#d63031', spanCells: 1, description: 'Groseilles rouges', width: 1, height: 1 },
  ],
  structures: [
    { id: 'shed_wood', name: 'Cabanon Bois', emoji: '🏠', type: 'structure', structureType: 'shed', color: '#8B4513', spanCells: 6, description: 'Cabanon en bois naturel', width: 2, height: 2 },
    { id: 'greenhouse_wood', name: 'Serre en Bois', emoji: '🪵', type: 'structure', structureType: 'wooden_greenhouse', color: '#A0522D', spanCells: 12, description: 'Serre en bois avec plan de travail', width: 3, height: 2, hasWorkbench: true },
    { id: 'compost', name: 'Compostier', emoji: '🟫', type: 'structure', structureType: 'compost', color: '#654321', spanCells: 2, description: 'Bac à compost', width: 1, height: 1 },
    { id: 'rain_barrel', name: 'Cuve de Récupération', emoji: '🪣', type: 'structure', structureType: 'barrel', color: '#708090', spanCells: 1, description: 'Récupération d\'eau de pluie', width: 1, height: 1 },
  ],
};

const GARDEN_GRID_COLS = 12;
const GARDEN_GRID_ROWS = 10;

// Taille d'une cellule en unités monde (100 / 12 ≈ 8.33)
const CELL_SIZE = 100 / GARDEN_GRID_COLS;
const TILE_H = CELL_SIZE; // hauteur = largeur (carré en vue du dessus)
const TILE_DEPTH = 0.5;   // épaisseur de la tuile (3D)

// Couleurs cel-shaded pour les tuiles
const TILE_COLORS = {
  top: [0x66BB6A, 0x4CAF50, 0x81C784],
  sideLeft: 0x5D4037,
  sideRight: 0x4E342E,
};

// Materials partagés (créés une fois)
let tileMaterials = null;

function getTileMaterials() {
  if (!tileMaterials) {
    tileMaterials = {
      top: new THREE.MeshLambertMaterial({ color: 0x66BB6A, side: THREE.FrontSide }),
      topHover: new THREE.MeshLambertMaterial({ color: 0x81C784, side: THREE.FrontSide }),
      topSelect: new THREE.MeshBasicMaterial({ color: 0x2ecc71, side: THREE.FrontSide }),
      topGhost: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, side: THREE.FrontSide }),
      sideLeft: new THREE.MeshLambertMaterial({ color: TILE_COLORS.sideLeft, side: THREE.FrontSide }),
      sideRight: new THREE.MeshLambertMaterial({ color: TILE_COLORS.sideRight, side: THREE.FrontSide }),
    };
  }
  return tileMaterials;
}

/**
 * Crée la géométrie d'une tuile isométrique 3D (diamant avec épaisseur)
 * Taille vue du dessus : CELL_SIZE x CELL_SIZE (carré)
 * En vue isométrique cela apparaît comme un diamant étiré
 */
function createTileGeometry() {
  const hw = CELL_SIZE / 2; // demi-largeur
  const hd = TILE_DEPTH / 2; // demi-épaisseur

  // Forme du diamand en 2D (top face z=0 plane)
  //   T (top vertex)
  //  / \
  // L---R (right vertex)
  //  \ /
  //   B (bottom vertex)

  const topY = 0;
  const botY = -TILE_DEPTH;

  // Vertices avec position + normal
  const positions = new Float32Array([
    // Top face (y = 0, regardant vers le haut = -Y normal pour FrontSide)
    0, topY, -hw,    // 0: top front (devant)
    hw, topY, 0,     // 1: right
    0, topY, hw,     // 2: bottom back (derrière)
    -hw, topY, 0,   // 3: left

    // Side left (du côté gauche de la tuile)
    -hw, topY, 0,   // 4: left top
    0, topY, -hw,   // 5: top front
    0, botY, -hw,   // 6: top front bottom
    -hw, botY, 0,   // 7: left bottom

    // Side right (du côté droit de la tuile)
    hw, topY, 0,    // 8: right top
    0, topY, hw,    // 9: bottom back
    0, botY, hw,    // 10: bottom back bottom
    hw, botY, 0,    // 11: right bottom
  ]);

  const normals = new Float32Array([
    // Top face - normal vers le haut (Y positif)
    0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
    // Side left - normal vers -X
    -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0,
    // Side right - normal vers +X
    1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
  ]);

  const indices = [
    // Top face (deux triangles)
    0, 1, 2,
    0, 2, 3,
    // Side left
    4, 5, 6,
    4, 6, 7,
    // Side right
    8, 9, 10,
    8, 10, 11,
  ];

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geo.setIndex(indices);
  return geo;
}

/**
 * Classe GridDeck — Grille isométrique 3D
 */
export class GridDeck {
  constructor(scene) {
    this.scene = scene;
    this.gridGroup = new THREE.Group();
    this.gridGroup.name = 'GridDeck';
    this.scene.add(this.gridGroup);

    this.cellMeshes = new Map(); // "row-col" -> { mesh, row, col }
    this.placedObjects = [];     // { uid, objectDef, row, col, group }
    this.objectPhotos = {};       // { uid: [{ id, data, date }] }

    this.hoveredCell = null;     // { row, col }
    this.selectedCell = null;    // { row, col }
    this.selectedPlacedObject = null;
    this.selectedObjectDef = null; // objet catégorie actuellement sélectionné

    this.ghostGroup = null;      // preview mesh quand on place un objet
    this.isVisible = true;

    // Rectangle tool state
    this.rectStart = null;        // { row, col } premier coin
    this.rectEnd = null;          // { row, col } second coin
    this.isRectMode = false;     // mode création rectangle
    this.rectPreviewCells = [];   // cellules en surbrillance pour le preview
    this.rectGroup = null;        // groupe pour le preview visuel

    // Matériaux
    this.mats = getTileMaterials();

    // Chargement photos
    this._loadPhotos();
  }

  // ─── GRID CREATION ──────────────────────────────────────────────────────────

  createGrid(cols = GARDEN_GRID_COLS, rows = GARDEN_GRID_ROWS, worldSize = 100) {
    this.cols = cols;
    this.rows = rows;
    this.worldSize = worldSize;

    // Origine de la grille (coin supérieur gauche en monde)
    this.originX = -worldSize / 2;
    this.originZ = -worldSize / 2;

    const tileGeo = createTileGeometry();

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const mesh = new THREE.Mesh(tileGeo, this.mats.top.clone());

        // Position monde du centre de la tuile
        // En isométrique, la tuile "diamond" a sa largeur visible = CELL_SIZE
        // Le centre de la tuile (c,r) en monde:
        //   x = originX + c * CELL_SIZE + CELL_SIZE/2
        //   z = originZ + r * CELL_SIZE + CELL_SIZE/2
        //   y = 0 (sol)
        mesh.position.set(
          this.originX + c * CELL_SIZE + CELL_SIZE / 2,
          TILE_DEPTH / 2,
          this.originZ + r * CELL_SIZE + CELL_SIZE / 2
        );

        mesh.userData.isGridCell = true;
        mesh.userData.row = r;
        mesh.userData.col = c;

        this.gridGroup.add(mesh);
        this.cellMeshes.set(`${r}-${c}`, { mesh, row: r, col: c });
      }
    }

    console.log(`📐 GridDeck: ${cols}x${rows} tuiles créées (${CELL_SIZE.toFixed(1)}u/tuile)`);
  }

  // ─── COORDINATE CONVERSION ──────────────────────────────────────────────────

  /**
   * Convertit row,col en position monde du centre de la cellule
   */
  cellToWorld(row, col) {
    return {
      x: this.originX + col * CELL_SIZE + CELL_SIZE / 2,
      y: 0,
      z: this.originZ + row * CELL_SIZE + CELL_SIZE / 2,
    };
  }

  /**
   * Convertit une position monde (x, z) en {row, col} ou null
   */
  worldToCell(x, z) {
    const col = Math.floor((x - this.originX) / CELL_SIZE);
    const row = Math.floor((z - this.originZ) / CELL_SIZE);
    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
      return { row, col };
    }
    return null;
  }

  getCellMeshes() {
    return Array.from(this.cellMeshes.values()).map(c => c.mesh);
  }

  getCellFromMesh(mesh) {
    const row = mesh.userData.row;
    const col = mesh.userData.col;
    return this.cellMeshes.get(`${row}-${col}`) ? { row, col } : null;
  }

  // ─── HIGHLIGHT / SELECTION ─────────────────────────────────────────────────

  _setCellMaterial(row, col, materialOrNull) {
    const cell = this.cellMeshes.get(`${row}-${col}`);
    if (cell) {
      cell.mesh.material = materialOrNull ? materialOrNull.clone() : this.mats.top.clone();
    }
  }

  highlightCell(row, col) {
    if (this.hoveredCell && (this.hoveredCell.row !== row || this.hoveredCell.col !== col)) {
      this._setCellMaterial(this.hoveredCell.row, this.hoveredCell.col, null);
    }
    this.hoveredCell = { row, col };
    this._setCellMaterial(row, col, this.mats.topHover);
  }

  clearHighlight() {
    if (this.hoveredCell) {
      this._setCellMaterial(this.hoveredCell.row, this.hoveredCell.col, null);
      this.hoveredCell = null;
    }
  }

  selectCell(row, col) {
    if (this.selectedCell) {
      this._setCellMaterial(this.selectedCell.row, this.selectedCell.col, null);
    }
    this.selectedCell = { row, col };
    this._setCellMaterial(row, col, this.mats.topSelect);
  }

  clearSelection() {
    if (this.selectedCell) {
      this._setCellMaterial(this.selectedCell.row, this.selectedCell.col, null);
      this.selectedCell = null;
    }
  }

  // ─── OBJECT PLACEMENT ──────────────────────────────────────────────────────

  placeObject(objectDef, row, col) {
    const existing = this.getObjectAt(row, col);
    if (existing) return null;

    const uid = `gd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const pos = this.cellToWorld(row, col);
    const group = this.createObjectMesh(objectDef);
    group.position.set(pos.x, 0, pos.z);
    group.userData.isPlacedObject = true;
    group.userData.uid = uid;

    this.scene.add(group);
    const placed = { uid, objectDef, row, col, group };
    this.placedObjects.push(placed);
    return placed;
  }

  removeObject(uid) {
    const idx = this.placedObjects.findIndex(o => o.uid === uid);
    if (idx === -1) return;
    const obj = this.placedObjects[idx];
    this.scene.remove(obj.group);
    // dispose geometries
    obj.group.traverse(child => {
      if (child.geometry) child.geometry.dispose();
    });
    this.placedObjects.splice(idx, 1);
    if (this.objectPhotos[uid]) {
      delete this.objectPhotos[uid];
      this._savePhotos();
    }
    // Save placed objects state
    try { localStorage.setItem('greenhub_grid_state', this.getState()); } catch(e) {}
  }

  getObjectAt(row, col) {
    return this.placedObjects.find(o => o.row === row && o.col === col) || null;
  }

  getPlacedObjects() {
    return this.placedObjects;
  }

  // ─── RECTANGLE TOOL ─────────────────────────────────────────────────────────

  /**
   * Active le mode création de rectangle
   */
  startRectMode() {
    this.isRectMode = true;
    this.rectStart = null;
    this.rectEnd = null;
    this._clearRectPreview();
    if (window.showNotification) {
      window.showNotification('📐 Rectangle: clic 1 = coin, clic 2 = opposé');
    }
  }

  /**
   * Gère le premier clic (coin du rectangle)
   */
  handleRectFirstClick(row, col) {
    this.rectStart = { row, col };
    this.rectEnd = { row, col };
    this._updateRectPreview();
  }

  /**
   * Gère le mouvement de la souris (preview)
   */
  updateRectHover(row, col) {
    if (!this.rectStart) return;
    this.rectEnd = { row, col };
    this._updateRectPreview();
  }

  /**
   * Gère le second clic (termine le rectangle)
   */
  finishRect(objectDef) {
    if (!this.rectStart || !this.rectEnd) return;

    const placed = this.createRect(objectDef, this.rectStart, this.rectEnd);
    this._clearRectPreview();
    this.rectStart = null;
    this.rectEnd = null;
    this.isRectMode = false;
    // Sauvegarder l'état
    try { localStorage.setItem('greenhub_grid_state', this.getState()); } catch(e) {}
    return placed;
  }

  /**
   * Annule le rectangle en cours
   */
  cancelRect() {
    this._clearRectPreview();
    this.rectStart = null;
    this.rectEnd = null;
    this.isRectMode = false;
  }

  /**
   * Crée un rectangle d'objets entre deux coins (inclusif)
   */
  createRect(objectDef, start, end) {
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);

    const placed = [];
    // Parcourir le périmètre du rectangle
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        // Seulement le périmètre (pas l'intérieur)
        const isEdge = r === minRow || r === maxRow || c === minCol || c === maxCol;
        if (!isEdge) continue;

        // Vérifier que la cellule est libre
        if (this.getObjectAt(r, c)) continue;

        // Vérifier les limites
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) continue;

        const p = this.placeObject(objectDef, r, c);
        if (p) placed.push(p);
      }
    }
    return placed;
  }

  _updateRectPreview() {
    if (!this.rectStart || !this.rectEnd) return;

    // Effacer l'ancien preview
    this._clearRectPreview();

    const minRow = Math.min(this.rectStart.row, this.rectEnd.row);
    const maxRow = Math.max(this.rectStart.row, this.rectEnd.row);
    const minCol = Math.min(this.rectStart.col, this.rectEnd.col);
    const maxCol = Math.max(this.rectStart.col, this.rectEnd.col);

    // Créer un groupe pour le preview
    this.rectGroup = new THREE.Group();
    this.rectPreviewCells = [];

    const previewMat = new THREE.MeshBasicMaterial({
      color: 0x2ecc71,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const isEdge = r === minRow || r === maxRow || c === minCol || c === maxCol;
        if (!isEdge) continue;
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) continue;

        const cell = this.cellMeshes.get(`${r}-${c}`);
        if (cell) {
          const preview = new THREE.Mesh(cell.mesh.geometry.clone(), previewMat.clone());
          preview.position.copy(cell.mesh.position);
          this.rectGroup.add(preview);
          this.rectPreviewCells.push({ r, c, mesh: preview });
        }
      }
    }

    this.scene.add(this.rectGroup);
  }

  _clearRectPreview() {
    if (this.rectGroup) {
      this.scene.remove(this.rectGroup);
      this.rectGroup.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.rectGroup = null;
    }
    this.rectPreviewCells = [];
  }

  // ─── OBJECT MESH FACTORY ────────────────────────────────────────────────────

  createObjectMesh(objectDef) {
    const group = new THREE.Group();
    const type = objectDef.type || objectDef.structureType || 'tree';

    switch (type) {
      case 'tree':
      case 'fruit_tree':
        this._buildTreeMesh(group, objectDef);
        break;
      case 'hedge':
        this._buildHedgeMesh(group, objectDef);
        break;
      case 'shrub':
        this._buildShrubMesh(group, objectDef);
        break;
      case 'small_fruit':
        this._buildSmallFruitMesh(group, objectDef);
        break;
      case 'structure':
        this._buildStructureMesh(group, objectDef);
        break;
      default:
        this._buildDefaultMesh(group, objectDef);
    }

    return group;
  }

  _buildTreeMesh(group, objectDef) {
    const isFruit = objectDef.type === 'fruit_tree';
    const trunkH = 2.5 + Math.random() * 1.5;
    const leafR = 1.8 + Math.random() * 1.2;

    // Tronc
    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.25, trunkH, 6);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x6D4C41 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = trunkH / 2;
    trunk.castShadow = true;
    group.add(trunk);

    // Cime cel-shaded: 3 spheres
    const leafColors = isFruit
      ? [0xE53935, 0xC62828, 0xFFCDD2]
      : [0x4a8c2a, 0x2d5a0f, 0x6ab04a];

    const offsets = [
      { x: 0, y: trunkH + leafR * 0.8, z: 0, r: leafR },
      { x: -leafR * 0.5, y: trunkH + leafR * 0.55, z: leafR * 0.3, r: leafR * 0.72 },
      { x: leafR * 0.4, y: trunkH + leafR * 0.4, z: -leafR * 0.2, r: leafR * 0.65 },
    ];

    offsets.forEach((o, i) => {
      const geo = new THREE.SphereGeometry(o.r, 6, 5);
      const mat = new THREE.MeshLambertMaterial({ color: leafColors[i % 3] });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(o.x, o.y, o.z);
      mesh.castShadow = true;
      group.add(mesh);
    });

    // Emoji sprite
    if (objectDef.emoji) {
      const canvas = document.createElement('canvas');
      canvas.width = 64; canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.font = '48px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(objectDef.emoji, 32, 32);
      const sprite = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: sprite, transparent: true });
      const spriteMesh = new THREE.Sprite(spriteMat);
      spriteMesh.scale.set(3, 3, 1);
      spriteMesh.position.y = trunkH + leafR * 1.6;
      group.add(spriteMesh);
    }
  }

  _buildHedgeMesh(group, objectDef) {
    const w = CELL_SIZE * 0.6;
    const h = 1.2 + Math.random() * 0.6;
    const geo = new THREE.BoxGeometry(w, h, w * 0.5);
    const mat = new THREE.MeshLambertMaterial({ color: 0x2E7D32 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = h / 2;
    mesh.castShadow = true;
    group.add(mesh);

    if (objectDef.emoji) {
      const canvas = this._emojiCanvas(objectDef.emoji);
      const spriteMat = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(2, 2, 1);
      sprite.position.y = h + 1;
      group.add(sprite);
    }
  }

  _buildShrubMesh(group, objectDef) {
    const r = 1.0 + Math.random() * 0.5;
    const geo = new THREE.SphereGeometry(r, 6, 5);
    const mat = new THREE.MeshLambertMaterial({ color: 0x388E3C });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = r;
    mesh.castShadow = true;
    group.add(mesh);

    if (objectDef.emoji) {
      const canvas = this._emojiCanvas(objectDef.emoji);
      const spriteMat = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(2, 2, 1);
      sprite.position.y = r * 2 + 0.5;
      group.add(sprite);
    }
  }

  _buildSmallFruitMesh(group, objectDef) {
    const r = 0.6 + Math.random() * 0.3;
    const geo = new THREE.SphereGeometry(r, 6, 5);
    const mat = new THREE.MeshLambertMaterial({ color: 0x7B1FA2 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = r + 0.5;
    mesh.castShadow = true;
    group.add(mesh);

    if (objectDef.emoji) {
      const canvas = this._emojiCanvas(objectDef.emoji);
      const spriteMat = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(1.5, 1.5, 1);
      sprite.position.y = r * 2 + 1;
      group.add(sprite);
    }
  }

  _buildStructureMesh(group, objectDef) {
    const w = CELL_SIZE * 0.7;
    const h = 3 + Math.random() * 1.5;

    // Corps principal
    const geo = new THREE.BoxGeometry(w, h, w * 0.7);
    const mat = new THREE.MeshLambertMaterial({ color: objectDef.color || 0x8B4513 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = h / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Porte
    const doorGeo = new THREE.BoxGeometry(w * 0.25, h * 0.5, 0.1);
    const doorMat = new THREE.MeshLambertMaterial({ color: 0x5D3A1A });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, h * 0.25, w * 0.35 + 0.05);
    group.add(door);

    if (objectDef.emoji) {
      const canvas = this._emojiCanvas(objectDef.emoji);
      const spriteMat = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(3, 3, 1);
      sprite.position.y = h + 1.5;
      group.add(sprite);
    }
  }

  _buildDefaultMesh(group, objectDef) {
    const geo = new THREE.CylinderGeometry(0.5, 0.6, 2, 8);
    const mat = new THREE.MeshLambertMaterial({ color: objectDef.color || 0x795548 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 1;
    mesh.castShadow = true;
    group.add(mesh);

    if (objectDef.emoji) {
      const canvas = this._emojiCanvas(objectDef.emoji);
      const spriteMat = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(2, 2, 1);
      sprite.position.y = 3;
      group.add(sprite);
    }
  }

  _emojiCanvas(emoji) {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 32, 32);
    return canvas;
  }

  // ─── GHOST PREVIEW ─────────────────────────────────────────────────────────

  showGhostPreview(objectDef, row, col) {
    this.clearGhostPreview();
    const pos = this.cellToWorld(row, col);
    this.ghostGroup = this.createObjectMesh(objectDef);
    this.ghostGroup.traverse(child => {
      if (child.material) {
        child.material = child.material.clone();
        child.material.transparent = true;
        child.material.opacity = 0.4;
      }
    });
    this.ghostGroup.position.set(pos.x, 0, pos.z);
    this.scene.add(this.ghostGroup);
  }

  clearGhostPreview() {
    if (this.ghostGroup) {
      this.scene.remove(this.ghostGroup);
      this.ghostGroup.traverse(child => {
        if (child.geometry) child.geometry.dispose();
      });
      this.ghostGroup = null;
    }
  }

  // ─── VISIBILITY ───────────────────────────────────────────────────────────

  setVisible(visible) {
    this.isVisible = visible;
    this.gridGroup.visible = visible;
    if (!visible) {
      this.clearGhostPreview();
      this.clearHighlight();
      this.clearSelection();
    }
  }

  // ─── PHOTOS ───────────────────────────────────────────────────────────────

  _loadPhotos() {
    try {
      const saved = localStorage.getItem('greenhub_grid_photos');
      if (saved) this.objectPhotos = JSON.parse(saved);
    } catch { this.objectPhotos = {}; }
  }

  _savePhotos() {
    localStorage.setItem('greenhub_grid_photos', JSON.stringify(this.objectPhotos));
  }

  addPhoto(uid, file) {
    const reader = new FileReader();
    reader.onload = () => {
      const photo = { id: Date.now(), data: reader.result, date: Date.now() };
      if (!this.objectPhotos[uid]) this.objectPhotos[uid] = [];
      this.objectPhotos[uid].push(photo);
      this._savePhotos();
    };
    reader.readAsDataURL(file);
  }

  removePhoto(uid, photoId) {
    if (this.objectPhotos[uid]) {
      this.objectPhotos[uid] = this.objectPhotos[uid].filter(p => p.id !== photoId);
      this._savePhotos();
    }
  }

  getPhotos(uid) {
    return this.objectPhotos[uid] || [];
  }

  // ─── STATE (localStorage) ──────────────────────────────────────────────────

  getState() {
    return JSON.stringify({
      placedObjects: this.placedObjects.map(o => ({
        uid: o.uid,
        objectDef: o.objectDef,
        row: o.row,
        col: o.col,
      })),
    });
  }

  loadState(json) {
    try {
      const data = JSON.parse(json);
      // Supprimer tous les objets actuels
      this.placedObjects.forEach(o => {
        this.scene.remove(o.group);
      });
      this.placedObjects = [];

      // Recréer les objets
      (data.placedObjects || []).forEach(o => {
        const placed = this.placeObject(o.objectDef, o.row, o.col);
        if (placed && o.uid) placed.uid = o.uid;
      });
    } catch (e) {
      console.error('GridDeck: failed to load state', e);
    }
  }

  // ─── UI PANEL ───────────────────────────────────────────────────────────────

  createUI(appRef) {
    this.appRef = appRef;
    this.removeUI();

    // ── Categories panel ──
    const categories = [
      { id: 'fruit_trees', label: '🍎 Fruitiers', items: GARDEN_OBJECTS.fruit_trees },
      { id: 'trees', label: '🌳 Arbres', items: GARDEN_OBJECTS.trees },
      { id: 'hedges', label: '🌲 Haies', items: GARDEN_OBJECTS.hedges },
      { id: 'shrubs', label: '🌿 Arbustes', items: GARDEN_OBJECTS.shrubs },
      { id: 'small_fruits', label: '🫐 Petits Fruits', items: GARDEN_OBJECTS.small_fruits },
      { id: 'structures', label: '🏠 Structures', items: GARDEN_OBJECTS.structures },
    ];

    let activeCat = 'fruit_trees';

    const panel = document.createElement('div');
    panel.id = 'grid-categories-panel';
    panel.style.cssText = `
      position: fixed; left: 16px; top: 80px; width: 230px;
      background: rgba(13,17,23,0.95); border: 1px solid rgba(46,204,113,0.35);
      border-radius: 12px; padding: 12px; z-index: 1000;
      font-family: 'DM Sans', sans-serif; max-height: 80vh; overflow-y: auto;
    `;

    const header = document.createElement('div');
    header.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;';

    const headerTitle = document.createElement('span');
    headerTitle.style.cssText = 'color:#2ecc71;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;';
    headerTitle.textContent = '🏡 Ajouter au Jardin';
    header.appendChild(headerTitle);

    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'background:none;border:none;color:rgba(255,255,255,0.5);font-size:18px;cursor:pointer;line-height:1;';
    closeBtn.textContent = '×';
    closeBtn.onclick = () => {
      if (this.appRef) {
        this.appRef.isGridDeckMode = false;
        this.appRef.gridDeck.setVisible(false);
        this.appRef.gridDeck.removeUI();
      }
    };
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // ── Rectangle tool button ──
    const rectBtn = document.createElement('button');
    rectBtn.id = 'grid-rect-btn';
    rectBtn.style.cssText = `
      width: 100%; padding: 8px 12px; margin-bottom: 10px;
      background: rgba(46,204,113,0.15); border: 1px solid rgba(46,204,113,0.4);
      border-radius: 8px; color: #2ecc71; font-size: 11px; font-weight: 600;
      cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
    `;
    rectBtn.innerHTML = '📐 <span>Rectangle (R)</span>';
    rectBtn.onclick = () => {
      this.startRectMode();
      rectBtn.style.background = 'rgba(46,204,113,0.3)';
      rectBtn.style.borderColor = '#2ecc71';
    };
    panel.appendChild(rectBtn);

    const catTabs = document.createElement('div');
    catTabs.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;';
    const catBtn = (id, label, active) => {
      const btn = document.createElement('button');
      btn.style.cssText = `padding:4px 8px;border-radius:6px;font-size:10px;cursor:pointer;
        background:${active ? 'rgba(46,204,113,0.2)' : 'rgba(255,255,255,0.04)'};
        border:1px solid ${active ? 'rgba(46,204,113,0.5)' : 'rgba(255,255,255,0.08)'};
        color:${active ? '#2ecc71' : 'rgba(255,255,255,0.5)'};font-weight:${active ? '600' : '400'};`;
      btn.textContent = label;
      return btn;
    };
    categories.forEach(cat => {
      const btn = catBtn(cat.id, cat.label, cat.id === activeCat);
      btn.onclick = () => {
        activeCat = cat.id;
        renderItems();
        [...catTabs.querySelectorAll('button')].forEach((b, i) => {
          b.style.background = categories[i].id === activeCat ? 'rgba(46,204,113,0.2)' : 'rgba(255,255,255,0.04)';
          b.style.borderColor = categories[i].id === activeCat ? 'rgba(46,204,113,0.5)' : 'rgba(255,255,255,0.08)';
          b.style.color = categories[i].id === activeCat ? '#2ecc71' : 'rgba(255,255,255,0.5)';
          b.style.fontWeight = categories[i].id === activeCat ? '600' : '400';
        });
      };
      catTabs.appendChild(btn);
    });
    panel.appendChild(catTabs);

    const itemsDiv = document.createElement('div');
    itemsDiv.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
    panel.appendChild(itemsDiv);

    const renderItems = () => {
      const items = categories.find(c => c.id === activeCat)?.items || [];
      itemsDiv.innerHTML = '';
      items.forEach(item => {
        const el = document.createElement('div');
        el.style.cssText = `padding:6px 10px;border-radius:8px;cursor:pointer;
          background:${item.color || '#4CAF50'}20;
          border:1.5px solid ${item.color || '#4CAF50'}50;
          display:flex;align-items:center;gap:4px;
          transition:all 0.15s;`;
        el.innerHTML = `<span style="font-size:16px;">${item.emoji || '🌳'}</span><span style="font-size:10px;color:#fff;">${item.name}</span>`;
        el.onclick = () => {
          if (this.appRef) this.appRef.selectedGardenObjectDef = item;
          // Highlight selected
          [...itemsDiv.querySelectorAll('div')].forEach(d => d.style.borderColor = (d === el ? '#2ecc71' : (item.color || '#4CAF50') + '50'));
          el.style.borderColor = '#2ecc71';
        };
        itemsDiv.appendChild(el);
      });
    };
    renderItems();

    document.body.appendChild(panel);
    this.uiPanel = panel;
  }

  removeUI() {
    this.cancelRect();
    const p = document.getElementById('grid-categories-panel');
    if (p) p.remove();
    const i = document.getElementById('grid-info-panel');
    if (i) i.remove();
    this.uiPanel = null;
  }

  showInfoPanel(placedObj, deckRef) {
    const existing = document.getElementById('grid-info-panel');
    if (existing) existing.remove();

    const obj = placedObj.objectDef;
    const uid = placedObj.uid;
    const photos = deckRef.getPhotos(uid);

    const panel = document.createElement('div');
    panel.id = 'grid-info-panel';
    panel.style.cssText = `
      position: fixed; right: 16px; bottom: 20px; width: 290px;
      background: rgba(13,17,23,0.95); border: 1px solid rgba(46,204,113,0.35);
      border-radius: 12px; padding: 14px; z-index: 1000;
      font-family: 'DM Sans', sans-serif;
    `;

    panel.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <span style="font-size:28px;">${obj.emoji || '🌳'}</span>
        <div>
          <div style="font-size:14px;font-weight:700;color:#fff;">${obj.name}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.5);">${obj.description || ''}</div>
          ${obj.production ? `<div style="font-size:10px;color:#2ecc71;margin-top:2px;">📦 ${obj.production}</div>` : ''}
        </div>
      </div>
      <div style="margin-bottom:10px;">
        <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:6px;display:flex;justify-content:space-between;">
          <span>📸 Photos (${photos.length})</span>
          <label style="cursor:pointer;padding:3px 8px;background:rgba(46,204,113,0.2);border-radius:4px;font-size:10px;color:#2ecc71;">
            + Ajouter
            <input type="file" accept="image/*" style="display:none;" id="grid-photo-input"
              onchange="window.__gridDeckAddPhoto && window.__gridDeckAddPhoto(this.files[0])" />
          </label>
        </div>
        <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;" id="grid-photos-row">
          ${photos.length === 0 ? '<div style="font-size:11px;color:rgba(255,255,255,0.3);font-style:italic;">Aucune photo</div>' : ''}
          ${photos.map(p => `
            <div style="position:relative;flex-shrink:0;">
              <img src="${p.data}" style="width:70px;height:70px;object-fit:cover;border-radius:8px;border:1px solid rgba(255,255,255,0.2);" />
              <button data-photo-id="${p.id}" class="grid-photo-del" style="
                position:absolute;top:-4px;right:-4px;width:18px;height:18px;border-radius:50%;
                background:#ef4444;color:#fff;border:none;font-size:10px;cursor:pointer;
                display:flex;align-items:center;justify-content:center;
              ">×</button>
            </div>
          `).join('')}
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <button id="grid-info-delete" style="flex:1;padding:8px 0;border-radius:8px;text-align:center;
          background:rgba(231,76,60,0.15);border:1px solid rgba(231,76,60,0.3);
          color:#e74c3c;font-size:12px;cursor:pointer;font-weight:600;">
          🗑️ Supprimer
        </button>
        <button id="grid-info-close" style="flex:1;padding:8px 0;border-radius:8px;text-align:center;
          background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
          color:rgba(255,255,255,0.6);font-size:12px;cursor:pointer;font-weight:600;">
          ✕ Fermer
        </button>
      </div>
    `;

    document.body.appendChild(panel);

    // Wire photo delete buttons
    panel.querySelectorAll('.grid-photo-del').forEach(btn => {
      btn.onclick = () => {
        deckRef.removePhoto(uid, parseInt(btn.dataset.photoId));
        this.showInfoPanel(placedObj, deckRef);
      };
    });

    document.getElementById('grid-info-delete').onclick = () => {
      deckRef.removeObject(uid);
      deckRef.clearSelection();
      panel.remove();
      deckRef.selectedPlacedObject = null;
      deckRef._saveState && deckRef._saveState();
    };

    document.getElementById('grid-info-close').onclick = () => {
      deckRef.clearSelection();
      deckRef.selectedPlacedObject = null;
      panel.remove();
    };

    // Photo add handler
    window.__gridDeckAddPhoto = (file) => {
      if (file) {
        deckRef.addPhoto(uid, file);
        this.showInfoPanel(placedObj, deckRef);
      }
    };
  }

  // ─── CLEANUP ──────────────────────────────────────────────────────────────

  destroy() {
    this.placedObjects.forEach(o => {
      this.scene.remove(o.group);
      o.group.traverse(child => {
        if (child.geometry) child.geometry.dispose();
      });
    });
    this.placedObjects = [];

    this.scene.remove(this.gridGroup);
    this.cellMeshes.clear();
    console.log('🧹 GridDeck détruit');
  }
}

// =============================================
// Ludus Terrae V2 - FineGridDeck
// Grille fine 10cm pour legumes/herbes
// 240x500 cellules = 120 000 cells
// Rendu via InstancedMesh pour performances
// =============================================

import * as THREE from 'three';

// ── Catalogue des légumes / plantes (accessible depuis le 2D planner) ─────
export const VEGETABLES_CATALOG = [
  // Légumes fruits
  { id: 'tomate', name: 'Tomate', emoji: '🍅', type: 'vegetable', color: '#e74c3c', spanCells: 1 },
  { id: 'carotte', name: 'Carotte', emoji: '🥕', type: 'vegetable', color: '#e67e22', spanCells: 1 },
  { id: 'salade', name: 'Salade', emoji: '🥬', type: 'vegetable', color: '#27ae60', spanCells: 1 },
  { id: 'radis', name: 'Radis', emoji: '🔴', type: 'vegetable', color: '#c0392b', spanCells: 1 },
  { id: 'ail', name: 'Ail', emoji: '🧄', type: 'vegetable', color: '#f5f5dc', spanCells: 1 },
  { id: 'fraise', name: 'Fraise', emoji: '🍓', type: 'vegetable', color: '#e74c3c', spanCells: 1 },
  { id: 'concombre', name: 'Concombre', emoji: '🥒', type: 'vegetable', color: '#27ae60', spanCells: 1 },
  { id: 'tomate-cerise', name: 'Tomate Cerise', emoji: '🍅', type: 'vegetable', color: '#e74c3c', spanCells: 1 },
  { id: 'oignon', name: 'Oignon', emoji: '🧅', type: 'vegetable', color: '#f39c12', spanCells: 1 },
  { id: 'poireau', name: 'Poireau', emoji: '🥬', type: 'vegetable', color: '#2ecc71', spanCells: 1 },
  { id: 'courgette', name: 'Courgette', emoji: '🥒', type: 'vegetable', color: '#27ae60', spanCells: 2 },
  { id: 'haricot', name: 'Haricot', emoji: '🫘', type: 'vegetable', color: '#27ae60', spanCells: 1 },
  { id: 'pois', name: 'Pois', emoji: '🟢', type: 'vegetable', color: '#27ae60', spanCells: 1 },
  { id: 'aubergine', name: 'Aubergine', emoji: '🍆', type: 'vegetable', color: '#8e44ad', spanCells: 1 },
  { id: 'poivron', name: 'Poivron', emoji: '🫑', type: 'vegetable', color: '#c0392b', spanCells: 1 },
  { id: 'patate', name: 'Pomme de terre', emoji: '🥔', type: 'vegetable', color: '#d68910', spanCells: 1 },
  // Aromatiques
  { id: 'basilic', name: 'Basilic', emoji: '🌿', type: 'vegetable', color: '#27ae60', spanCells: 1 },
  { id: 'thym', name: 'Thym', emoji: '🌿', type: 'vegetable', color: '#6b8e23', spanCells: 1 },
  { id: 'romarin', name: 'Romarin', emoji: '🌿', type: 'vegetable', color: '#6b8e23', spanCells: 1 },
  { id: 'ciboulette', name: 'Ciboulette', emoji: '🌿', type: 'vegetable', color: '#27ae60', spanCells: 1 },
  // Fleurs
  { id: 'oeillet-inde', name: 'Oeillet d\'Inde', emoji: '🌼', type: 'flower', color: '#f39c12', spanCells: 1 },
  { id: 'capucine', name: 'Capucine', emoji: '🌺', type: 'flower', color: '#e74c3c', spanCells: 1 },
  { id: 'souci', name: 'Souci', emoji: '🌻', type: 'flower', color: '#f39c12', spanCells: 1 },
  // Arbres fruitiers (petits)
  { id: 'pommier', name: 'Pommier', emoji: '🍎', type: 'fruit_tree', color: '#e74c3c', spanCells: 4, width: 2, height: 2 },
  { id: 'cerisier', name: 'Cerisier', emoji: '🍒', type: 'fruit_tree', color: '#c0392b', spanCells: 4, width: 2, height: 2 },
  { id: 'prunier', name: 'Prunier', emoji: '🫐', type: 'fruit_tree', color: '#8e44ad', spanCells: 4, width: 2, height: 2 },
  // Structures
  { id: 'serre_bois', name: 'Serre en bois', emoji: '🪵', type: 'structure', color: '#a0522d', spanCells: 16, width: 4, height: 3 },
  { id: 'cabanon', name: 'Cabanon', emoji: '🏠', type: 'structure', color: '#8B4513', spanCells: 9, width: 3, height: 2 },
  { id: 'compost', name: 'Compostier', emoji: '🟫', type: 'structure', color: '#654321', spanCells: 4, width: 2, height: 1 },
  { id: 'cuve_eau', name: 'Cuve de récupération', emoji: '🪣', type: 'structure', color: '#708090', spanCells: 2, width: 1, height: 1 },
  // Clôtures / bordures
  { id: 'bordure_bois', name: 'Bordure bois', emoji: '🪵', type: 'fence', color: '#8B4513', spanCells: 1 },
  { id: 'grillage', name: 'Grillage', emoji: '🔗', type: 'fence', color: '#708090', spanCells: 1 },
  { id: 'haie', name: 'Haie', emoji: '🌲', type: 'hedge', color: '#27ae60', spanCells: 1 },
  { id: 'muret', name: 'Muret', emoji: '🧱', type: 'fence', color: '#9CA3AF', spanCells: 1 },
  // Allées / Chemins
  { id: 'allee_gravier', name: 'Allée Gravier', emoji: '🪨', type: 'path', color: '#BDBDBD', spanCells: 1 },
];

// Catégories pour le UI
export const VEGETABLES_CATEGORIES = [
  { id: 'legumes',   label: '🥕 Légumes',    items: VEGETABLES_CATALOG.filter(i => i.type === 'vegetable') },
  { id: 'fleurs',    label: '🌸 Fleurs',      items: VEGETABLES_CATALOG.filter(i => i.type === 'flower') },
  { id: 'fruitiers', label: '🍎 Fruitiers',   items: VEGETABLES_CATALOG.filter(i => i.type === 'fruit_tree') },
  { id: 'structures',label: '🏠 Structures',  items: VEGETABLES_CATALOG.filter(i => i.type === 'structure') },
  { id: 'clotures',  label: '🔗 Clôtures',    items: VEGETABLES_CATALOG.filter(i => i.type === 'fence' || i.type === 'hedge') },
  { id: 'allees',    label: '🪨 Allées',      items: VEGETABLES_CATALOG.filter(i => i.type === 'path') },
];

// ── Dimensions du jardin 24m x 50m ──────────────────────────────────────
const REAL_WIDTH  = 24;   // 24 mètres de large
const REAL_DEPTH  = 50;   // 50 mètres de long
const CELL_SIZE   = 0.1;  // 10cm par cellule
const COLS        = Math.round(REAL_WIDTH / CELL_SIZE);  // 240
const ROWS        = Math.round(REAL_DEPTH / CELL_SIZE);   // 500

// Nombre max d'instances pour le highlight (évite de créer trop d'objets)
const MAX_HIGHLIGHT_INSTANCES = 500;
const MAX_SELECT_INSTANCES    = 2000;

// Modes de placement
const PLACEMENT_MODE_SINGLE  = 'single';
const PLACEMENT_MODE_RECT     = 'rect';
const PLACEMENT_MODE_LINE     = 'line';

// Espacements disponibles pour le mode ligne (en cellules = 10cm)
const LINE_SPACINGS = [
  { label: '10cm', value: 1 },
  { label: '20cm', value: 2 },
  { label: '30cm', value: 3 },
  { label: '50cm', value: 5 },
  { label: '1m',   value: 10 },
];

// ── Compagnonnage: voisins bons et mauvais ─────────────────────────────────
const COMPAGNONAGE = {
  tomate:   { good: ['basilic','carotte','persil','oeillet-inde'], bad: ['pommier','cerisier'] },
  carotte:  { good: ['tomate','oignon','poireau','salade','radis'], bad: ['persil'] },
  salade:   { good: ['carotte','radis','fraise','oignon'], bad: [] },
  radis:    { good: ['salade','carotte','pois','haricot'], bad: [] },
  oignon:   { good: ['carotte','salade','tomate','poireau'], bad: ['pois','haricot'] },
  ail:      { good: ['tomate','carotte','salade','fraise'], bad: ['pois','haricot','fève'] },
  pois:     { good: ['carotte','radis','navet','courgette'], bad: ['oignon','ail','poireau'] },
  haricot:  { good: ['carotte','courgette','pois','aubergine'], bad: ['oignon','ail','poireau'] },
  courgette:{ good: ['haricot','pois','radis','maïs'], bad: [] },
  aubergine:{ good: ['haricot','pois','thym','basilic'], bad: [] },
  basilic:  { good: ['tomate','aubergine','poivron'], bad: [] },
  thym:     { good: ['aubergine','tomate','poivron'], bad: [] },
  romarin:  { good: ['aubergine','courgette','carotte'], bad: [] },
  piment:   { good: ['basilic','tomate','carotte'], bad: [] },
  haricot2: { good: ['carotte','courgette'], bad: ['oignon'] },
  pommier:  { good: ['basilic','capucine'], bad: ['tomate','cerisier'] },
  fraise:   { good: ['salade','oignon','ail','thym'], bad: ['choux'] },
};

// Get companion info for a plant id
function getCompanionInfo(id) {
  const info = COMPAGNONAGE[id];
  if (!info) return null;
  return info;
}

// ── Textures clôture via Canvas (sync) ────────────────────────────────────
function createFenceCanvasTexture(type) {
  const W = 128, H = 128;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  if (type === 'grillage') {
    ctx.fillStyle = '#C8C8C8';
    ctx.fillRect(0, 0, W, H);
    const cell = 10;
    ctx.strokeStyle = '#9CA3AF';
    ctx.lineWidth = 1.2;
    for (let y = -cell; y <= H + cell; y += cell) {
      for (let x = -cell; x <= W + cell; x += cell) {
        ctx.beginPath();
        ctx.moveTo(x, y + cell / 2);
        ctx.lineTo(x + cell / 2, y);
        ctx.lineTo(x + cell, y + cell / 2);
        ctx.lineTo(x + cell / 2, y + cell);
        ctx.closePath();
        ctx.stroke();
      }
    }
  } else if (type === 'bordure_bois') {
    const ph = 16;
    for (let y = 0; y < H; y += ph) {
      ctx.fillStyle = y % (ph * 2) === 0 ? '#8B5A2B' : '#A0522D';
      ctx.fillRect(0, y, W, ph);
      ctx.strokeStyle = '#6B4226';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.strokeStyle = '#5A3A1A';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, W, H);
  } else if (type === 'haie') {
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#2E8B2E';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * W, y = Math.random() * H;
      const r = 2 + Math.random() * 4;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#1E6B1E';
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * W, y = Math.random() * H;
      const r = 1 + Math.random() * 2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'muret') {
    const bH = 16, bW = 24;
    ctx.fillStyle = '#9CA3AF';
    ctx.fillRect(0, 0, W, H);
    for (let row = 0; row < H / bH; row++) {
      const offset = row % 2 === 0 ? 0 : bW / 2;
      for (let col = -1; col < W / bW + 1; col++) {
        const bx = col * bW + offset;
        const by = row * bH;
        ctx.fillStyle = (row + col) % 2 === 0 ? '#B8B8B8' : '#A8A8A8';
        ctx.fillRect(bx, by, bW - 1, bH - 1);
        ctx.strokeStyle = '#707070';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(bx, by, bW - 1, bH - 1);
      }
    }
  } else {
    ctx.fillStyle = '#888';
    ctx.fillRect(0, 0, W, H);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Cache de textures clôture
const _fenceTexCache = {};
function getFenceTexture(type) {
  if (!_fenceTexCache[type]) {
    _fenceTexCache[type] = createFenceCanvasTexture(type);
    _fenceTexCache[type].repeat.set(2, 1);
  }
  return _fenceTexCache[type];
}

// ── Géométrie d'une tuile fine (losange isométrique 3D) ──────────────────
function createFineTileGeometry() {
  const hw = CELL_SIZE / 2;
  const hd = CELL_SIZE / 2; // même taille en profondeur
  const thickness = 0.05;   // 5cm d'épaisseur

  // Losange en vue du dessus (diamant)
  //    T(0, 0, -hw)
  //   / \
  //  /   \
  // L     R
  //  \   /
  //   \ /
  //    B(0, 0, hw)

  const positions = new Float32Array([
    // Top face (y = 0, normal vers le haut)
    0,        0,        -hw,
    hw,      0,        0,
    0,        0,        hw,
    -hw,     0,        0,

    // Side left (-X)
    -hw,     0,        0,
    0,        0,        -hw,
    0,        -thickness, -hw,
    -hw,     -thickness, 0,

    // Side right (+X)
    hw,      0,        0,
    0,        0,        hw,
    0,        -thickness, hw,
    hw,      -thickness, 0,
  ]);

  const normals = new Float32Array([
    // Top
    0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
    // Side left
    -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0,
    // Side right
    1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
  ]);

  const indices = [
    // Top (2 triangles)
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

// ── Placement highlight material (transparent, bright green) ──────────────
const HIGHLIGHT_COLOR = new THREE.Color(0x2ecc71);
const SELECT_COLOR    = new THREE.Color(0xff6b6b);
const RECT_COLOR     = new THREE.Color(0x7ed957);

// ─────────────────────────────────────────────────────────────────────────────
export class FineGridDeck {
  /**
   * @param {THREE.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'FineGridDeck';
    this.scene.add(this.group);

    // Grid logique : "row-col" → { uid, objectDef, row, col }
    this.placedObjects = [];

    // Photo tracking
    this.objectPhotos = {};

    // Undo stack (last batch of placed objects)
    this._lastPlacedBatch = [];  // [{uid, objectDef}]

    // État sélection / hover
    this.hoveredCells  = new Set();   // Set of "row-col"
    this.selectedCells  = new Set();   // Set of "row-col"
    this.selectedPlacedObject = null;

    // Objet catégorie sélectionné pour placement
    this.selectedObjectDef = null;

    // Ghost preview
    this.ghostGroup = null;

    // Rectangle tool
    this.isRectMode       = false;
    this.rectStart        = null;
    this.rectEnd          = null;
    this.rectPreviewCells = new Set();

    // Line tool
    this.isLineMode        = false;
    this.lineStart         = null;
    this.lineEnd           = null;
    this.lineSpacing       = 5;  // 50cm par défaut (5 cellules × 10cm)
    this.linePreviewCells  = new Set();

    // Placement mode: 'single' | 'rect' | 'line'
    this.placementMode = PLACEMENT_MODE_SINGLE;

    // Vue / caméra
    this.isVisible = false;
    this.camera   = null;

    // Hauteur de clôture (par défaut 1.5m pour le grillage périmétrique)
    this._fenceHeightOverride = null;

    // ── InstancedMeshes pour highlight/select ──────────────────────────
    this._tileGeo = createFineTileGeometry();

    // Highlight InstancedMesh (verts, max 500)
    this._highlightMat = new THREE.MeshBasicMaterial({
      color: HIGHLIGHT_COLOR,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    this._highlightMesh = new THREE.InstancedMesh(
      this._tileGeo,
      this._highlightMat,
      MAX_HIGHLIGHT_INSTANCES
    );
    this._highlightMesh.count = 0;
    this._highlightMesh.frustumCulled = false;
    this._highlightMesh.visible = false;
    this.group.add(this._highlightMesh);

    // Select InstancedMesh (rouge, max 2000 pour rectangle)
    this._selectMat = new THREE.MeshBasicMaterial({
      color: SELECT_COLOR,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    this._selectMesh = new THREE.InstancedMesh(
      this._tileGeo,
      this._selectMat,
      MAX_SELECT_INSTANCES
    );
    this._selectMesh.count = 0;
    this._selectMesh.frustumCulled = false;
    this._selectMesh.visible = false;
    this.group.add(this._selectMesh);

    // Rectangle preview InstancedMesh
    this._rectMat = new THREE.MeshBasicMaterial({
      color: RECT_COLOR,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    this._rectMesh = new THREE.InstancedMesh(
      this._tileGeo,
      this._rectMat,
      MAX_SELECT_INSTANCES
    );
    this._rectMesh.count = 0;
    this._rectMesh.frustumCulled = false;
    this._rectMesh.visible = false;
    this.group.add(this._rectMesh);

    // Line preview mesh (cyan)
    this._lineMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    this._lineMesh = new THREE.InstancedMesh(
      this._tileGeo,
      this._lineMat,
      MAX_SELECT_INSTANCES
    );
    this._lineMesh.count = 0;
    this._lineMesh.frustumCulled = false;
    this._lineMesh.visible = false;
    this.group.add(this._lineMesh);

    // ── Couche invisible pour raycasting (détection de cellule) ──────────
    // On crée UN seul plan invisible couvrant tout le jardin
    this._raycastPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(REAL_WIDTH, REAL_DEPTH),
      new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
    );
    this._raycastPlane.rotation.x = -Math.PI / 2;
    this._raycastPlane.position.y  = 0.01;
    this._raycastPlane.userData.isFineGridCell = true;
    this._raycastPlane.userData.COLS = COLS;
    this._raycastPlane.userData.ROWS = ROWS;
    this.group.add(this._raycastPlane);

    // ── Origine monde (coin supérieur-gauche) ─────────────────────────────
    this.originX = -REAL_WIDTH  / 2;  // -12
    this.originZ = -REAL_DEPTH  / 2;   // -25

    // Chargement photos
    this._loadPhotos();

    console.log(
      `📐 FineGridDeck: ${COLS}x${ROWS} = ${COLS * ROWS} cellules ` +
      `(${CELL_SIZE}m = ${CELL_SIZE * 100}cm/cellule) ` +
      `sur ${REAL_WIDTH}x${REAL_DEPTH}m`
    );
  }

  // ── Coordonnées ─────────────────────────────────────────────────────────

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
   * Convertit position monde (x,z) en {row,col} ou null
   */
  worldToCell(x, z) {
    const col = Math.floor((x - this.originX) / CELL_SIZE);
    const row = Math.floor((z - this.originZ) / CELL_SIZE);
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      return { row, col };
    }
    return null;
  }

  /**
   * Retourne l'unique plan de raycasting
   */
  getRaycastPlane() {
    return this._raycastPlane;
  }

  // ── Rendu highlight / select via InstancedMesh ───────────────────────────

  _updateHighlightMesh() {
    const cells = Array.from(this.hoveredCells);
    const count = Math.min(cells.length, MAX_HIGHLIGHT_INSTANCES);
    this._highlightMesh.count = count;

    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const { row, col } = this._parseRC(cells[i]);
      const pos = this.cellToWorld(row, col);
      dummy.position.set(pos.x, CELL_SIZE / 2, pos.z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      this._highlightMesh.setMatrixAt(i, dummy.matrix);
    }
    this._highlightMesh.instanceMatrix.needsUpdate = true;
    this._highlightMesh.visible = count > 0;
  }

  _updateSelectMesh() {
    const cells = Array.from(this.selectedCells);
    const count = Math.min(cells.length, MAX_SELECT_INSTANCES);
    this._selectMesh.count = count;

    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const { row, col } = this._parseRC(cells[i]);
      const pos = this.cellToWorld(row, col);
      dummy.position.set(pos.x, CELL_SIZE / 2, pos.z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      this._selectMesh.setMatrixAt(i, dummy.matrix);
    }
    this._selectMesh.instanceMatrix.needsUpdate = true;
    this._selectMesh.visible = count > 0;
  }

  _updateRectMesh() {
    const cells = Array.from(this.rectPreviewCells);
    const count = Math.min(cells.length, MAX_SELECT_INSTANCES);
    this._rectMesh.count = count;

    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const { row, col } = this._parseRC(cells[i]);
      const pos = this.cellToWorld(row, col);
      dummy.position.set(pos.x, CELL_SIZE / 2, pos.z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      this._rectMesh.setMatrixAt(i, dummy.matrix);
    }
    this._rectMesh.instanceMatrix.needsUpdate = true;
    this._rectMesh.visible = count > 0;
  }

  _updateLineMesh() {
    const cells = Array.from(this.linePreviewCells);
    const count = Math.min(cells.length, MAX_SELECT_INSTANCES);
    this._lineMesh.count = count;

    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const { row, col } = this._parseRC(cells[i]);
      const pos = this.cellToWorld(row, col);
      dummy.position.set(pos.x, CELL_SIZE / 2, pos.z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      this._lineMesh.setMatrixAt(i, dummy.matrix);
    }
    this._lineMesh.instanceMatrix.needsUpdate = true;
    this._lineMesh.visible = count > 0;
  }

  _parseRC(key) {
    const [r, c] = key.split('-').map(Number);
    return { row: r, col: c };
  }

  _updatePreviewInfo() {
    const info = document.getElementById('fine-preview-info');
    if (!info) return;
    if (this.isRectMode && this.rectStart) {
      const count = this.rectPreviewCells.size;
      const objName = this.selectedObjectDef ? this.selectedObjectDef.name : '';
      const label = objName ? `${objName}: ` : '';
      info.style.display = 'block';
      info.style.borderColor = 'rgba(46,204,113,0.4)';
      info.innerHTML = `📐 Rectangle: <b>${label}${count} cases</b><br/><span style="opacity:0.5">Clic 2 pour confirmer</span>`;
    } else if (this.isLineMode && this.lineStart) {
      const count = this.linePreviewCells.size;
      const spacing = this.lineSpacing * 10;
      const objName = this.selectedObjectDef ? this.selectedObjectDef.name : '';
      const label = objName ? `${objName}: ` : '';
      // Distance approximative
      const dr = (this.lineEnd.row - this.lineStart.row) * CELL_SIZE;
      const dc = (this.lineEnd.col - this.lineStart.col) * CELL_SIZE;
      const dist = Math.sqrt(dr*dr + dc*dc).toFixed(1);
      info.style.display = 'block';
      info.style.borderColor = 'rgba(0,212,255,0.5)';
      info.innerHTML = `📏 Ligne: <b>${label}${count} plants</b><br/><span style="opacity:0.6">↔ ${spacing}cm · ~${dist}m · Clic 2 pour confirmer</span>`;
    } else {
      info.style.display = 'none';
    }
  }

  // ── Highlight ───────────────────────────────────────────────────────────

  highlightCell(row, col) {
    const key = `${row}-${col}`;
    this.hoveredCells.add(key);
    this._updateHighlightMesh();
  }

  clearHighlight() {
    this.hoveredCells.clear();
    this._updateHighlightMesh();
  }

  // ── Sélection cellule ─────────────────────────────────────────────────

  selectCell(row, col) {
    this.selectedCells.clear();
    this.selectedCells.add(`${row}-${col}`);
    this._updateSelectMesh();
  }

  selectCells(cellsArray) {
    this.selectedCells.clear();
    cellsArray.forEach(([r, c]) => this.selectedCells.add(`${r}-${c}`));
    this._updateSelectMesh();
  }

  clearSelection() {
    this.selectedCells.clear();
    this._updateSelectMesh();
  }

  // ── Hover via raycasting (appelé depuis mousemove) ─────────────────────

  /**
   * Gère le mousemove : met à jour la cellule survolée
   * @param {THREE.Vector2} ndcMouse  — position souris normalisée (-1..1)
   */
  handleHover(ndcMouse) {
    if (!this.camera || !this.isVisible) return null;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndcMouse, this.camera);
    const intersects = raycaster.intersectObject(this._raycastPlane, false);

    if (intersects.length === 0) {
      this.clearHighlight();
      const coordEl = document.getElementById('fine-coord-display');
      if (coordEl) coordEl.textContent = '📍 survolez la grille';
      return null;
    }

    const pt = intersects[0].point;
    const cell = this.worldToCell(pt.x, pt.z);
    if (!cell) {
      this.clearHighlight();
      const coordEl = document.getElementById('fine-coord-display');
      if (coordEl) coordEl.textContent = '📍 survolez la grille';
      return null;
    }

    // Highlight large zone autour si un objet est sélectionné (ghost preview)
    this.clearHighlight();
    if (this.selectedObjectDef) {
      const span = this.selectedObjectDef.spanCells || 1;
      for (let dr = 0; dr < span; dr++) {
        for (let dc = 0; dc < span; dc++) {
          this.highlightCell(cell.row + dr, cell.col + dc);
        }
      }
      this.showGhostPreview(this.selectedObjectDef, cell.row, cell.col);
    } else {
      this.highlightCell(cell.row, cell.col);
      this.clearGhostPreview();
    }

    // Rectangle preview update
    if (this.isRectMode && this.rectEnd) {
      this._updateRectFromHover(cell.row, cell.col);
    }

    // Line preview update
    if (this.isLineMode && this.lineEnd) {
      this._updateLineFromHover(cell.row, cell.col);
    }

    // Update coordinate display
    this._updateCoordDisplay(cell.row, cell.col);

    return cell;
  }

  _updateCoordDisplay(row, col) {
    const coordEl = document.getElementById('fine-coord-display');
    if (!coordEl) return;
    const x = (col * CELL_SIZE).toFixed(1);
    const y = (row * CELL_SIZE).toFixed(1);
    coordEl.textContent = `📍 Col ${col} · Row ${row} · (${x}m × ${y}m)`;
  }

  // ── Placement d'objet ─────────────────────────────────────────────────

  /**
   * Place un objet à la position (row, col)
   * @returns {object|null} placed object ou null si occupée
   */
  placeObject(objectDef, row, col) {
    const span = objectDef.spanCells || 1;
    const occupiedCells = [];

    for (let dr = 0; dr < span; dr++) {
      for (let dc = 0; dc < span; dc++) {
        const r = row + dr;
        const c = col + dc;
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null;
        if (this.getObjectAt(r, c)) return null;
        occupiedCells.push(`${r}-${c}`);
      }
    }

    const uid = `fgd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const pos = this.cellToWorld(row, col);
    const group = this._createObjectMesh(objectDef, span);
    group.position.set(pos.x, 0, pos.z);
    group.userData.isFineGridObject = true;
    group.userData.uid = uid;

    this.scene.add(group);
    const placed = { uid, objectDef, row, col, span, group, occupiedCells };
    this.placedObjects.push(placed);

    // Tracker les cellules occupées
    occupiedCells.forEach(key => {
      const [r, c] = key.split('-').map(Number);
      this._cellMap = this._cellMap || new Map();
      this._cellMap.set(key, uid);
    });

    // Skip autosave during batch load (transferGardenPlan uses loadPlanObjects instead)
    if (!this._batchLoading) {
      this._saveState();
    }
    return placed;
  }

  _createObjectMesh(objectDef, span) {
    const group = new THREE.Group();
    const type = objectDef.type || objectDef.structureType || 'vegetable';
    const size = CELL_SIZE * span;

    switch (type) {
      case 'tree':
      case 'fruit_tree':
        this._buildTree(group, objectDef, size);
        break;
      case 'structure':
        this._buildStructure(group, objectDef, size);
        break;
      case 'fence':
        this._buildFence(group, objectDef, size);
        break;
      case 'path':
        this._buildPath(group, objectDef, size);
        break;
      default:
        this._buildVegetable(group, objectDef, size);
    }

    return group;
  }

  _buildVegetable(group, def, size) {
    // Petite plante ou légume : capsule + feuille
    const h = 0.15 + Math.random() * 0.1;
    const stemGeo = new THREE.CylinderGeometry(0.01, 0.015, h, 5);
    const stemMat = new THREE.MeshLambertMaterial({ color: 0x4a7c2a });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = h / 2;
    group.add(stem);

    // Tige verticale
    if (def.emoji) {
      const canvas = this._emojiCanvas(def.emoji, 32);
      const spriteMat = new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(canvas),
        transparent: true,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(size * 0.8, size * 0.8, 1);
      sprite.position.y = h + size * 0.3;
      group.add(sprite);
    }
  }

  _buildTree(group, def, size) {
    const isFruit = def.type === 'fruit_tree';
    const trunkH  = Math.max(1.5, size * 0.8);
    const leafR   = Math.max(1.0, size * 0.5);

    const trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, trunkH, 6);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x6D4C41 });
    const trunk   = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = trunkH / 2;
    trunk.castShadow = true;
    group.add(trunk);

    const leafColors = isFruit
      ? [0xE53935, 0xC62828, 0xFFCDD2]
      : [0x4a8c2a, 0x2d5a0f, 0x6ab04a];

    const offsets = [
      { x: 0,            y: trunkH + leafR * 0.8,  z: 0,            r: leafR },
      { x: -leafR * 0.5, y: trunkH + leafR * 0.55, z: leafR * 0.3,  r: leafR * 0.72 },
      { x: leafR * 0.4,  y: trunkH + leafR * 0.4,  z: -leafR * 0.2, r: leafR * 0.65 },
    ];

    offsets.forEach((o, i) => {
      const geo = new THREE.SphereGeometry(o.r, 6, 5);
      const mat = new THREE.MeshLambertMaterial({ color: leafColors[i % 3] });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(o.x, o.y, o.z);
      mesh.castShadow = true;
      group.add(mesh);
    });

    if (def.emoji) {
      const canvas = this._emojiCanvas(def.emoji, 48);
      const spriteMat = new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(canvas),
        transparent: true,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(size * 0.6, size * 0.6, 1);
      sprite.position.y = trunkH + leafR * 1.6;
      group.add(sprite);
    }
  }

  _buildStructure(group, def, size) {
    const w  = size * 0.8;
    const h  = 1.5 + Math.random() * 1;
    const geo = new THREE.BoxGeometry(w, h, w * 0.7);
    const mat = new THREE.MeshLambertMaterial({ color: def.color || 0x8B4513 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = h / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    if (def.emoji) {
      const canvas = this._emojiCanvas(def.emoji, 48);
      const spriteMat = new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(canvas),
        transparent: true,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(size * 0.5, size * 0.5, 1);
      sprite.position.y = h + 0.5;
      group.add(sprite);
    }
  }

  // ── Allée / Chemin (gravier) ─────────────────────────────────────────────
  _buildPath(group, def, size) {
    const pathW = size * 0.9;
    const pathH = 0.05; // 5cm d'épaisseur
    const geo = new THREE.BoxGeometry(pathW, pathH, pathW);
    // Texture gravier procedurale
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#BDBDBD';
    ctx.fillRect(0, 0, 128, 128);
    // Petits cailloux
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      const r = 2 + Math.random() * 4;
      const gray = 160 + Math.random() * 60;
      ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    const mat = new THREE.MeshLambertMaterial({ map: tex });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = pathH / 2;
    mesh.receiveShadow = true;
    group.add(mesh);

    if (def.emoji) {
      const c = this._emojiCanvas(def.emoji, 32);
      const spriteMat = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(pathW * 0.4, pathW * 0.4, 1);
      sprite.position.y = pathH + 0.5;
      group.add(sprite);
    }
  }

  _buildFence(group, def, size) {
    // Déterminer le type de texture
    const fenceType = def.id || def.type || 'grillage';
    let texType = 'grillage';
    if (fenceType.includes('bordure') || fenceType.includes('wood')) texType = 'bordure_bois';
    else if (fenceType.includes('haie') || fenceType.includes('hedge')) texType = 'haie';
    else if (fenceType.includes('muret') || fenceType.includes('stone')) texType = 'muret';
    else texType = 'grillage';

    // Panneau de clôture avec texture
    const panelW = size * 0.9;
    const panelH = this._fenceHeightOverride ?? (0.8 + Math.random() * 0.4);
    const panelD = 0.05;

    const tex = getFenceTexture(texType);
    const geo = new THREE.BoxGeometry(panelW, panelH, panelD);
    const mat = new THREE.MeshLambertMaterial({ map: tex });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = panelH / 2;
    mesh.castShadow = true;
    group.add(mesh);

    // Poteaux
    const postGeo = new THREE.BoxGeometry(0.06, panelH * 1.2, 0.06);
    const postMat = new THREE.MeshLambertMaterial({ color: 0x5D3A1A });
    [-panelW / 2, panelW / 2].forEach(x => {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(x, panelH * 0.6, 0);
      post.castShadow = true;
      group.add(post);
    });

    // Badge emoji pour identifier le type
    if (def.emoji) {
      const canvas = this._emojiCanvas(def.emoji, 24);
      const spriteMat = new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(canvas),
        transparent: true,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(panelW * 0.3, panelW * 0.3, 1);
      sprite.position.y = panelH + 0.3;
      group.add(sprite);
    }
  }

  _emojiCanvas(emoji, size = 48) {
    const canvas = document.createElement('canvas');
    canvas.width  = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.font = `${size * 0.75}px sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, size / 2, size / 2);
    return canvas;
  }

  // ── Suppression ─────────────────────────────────────────────────────────

  removeObject(uid) {
    const idx = this.placedObjects.findIndex(o => o.uid === uid);
    if (idx === -1) return;
    const obj = this.placedObjects[idx];

    this.scene.remove(obj.group);
    obj.group.traverse(child => {
      if (child.geometry) child.geometry.dispose();
    });

    // Libérer les cellules
    if (this._cellMap) {
      obj.occupiedCells.forEach(key => this._cellMap.delete(key));
    }

    this.placedObjects.splice(idx, 1);
    if (this.objectPhotos[uid]) {
      delete this.objectPhotos[uid];
      this._savePhotos();
    }
    this._saveState();
  }

  getObjectAt(row, col) {
    const key = `${row}-${col}`;
    if (this._cellMap && this._cellMap.has(key)) {
      const uid = this._cellMap.get(key);
      return this.placedObjects.find(o => o.uid === uid) || null;
    }
    return null;
  }

  // ── Rectangle tool ─────────────────────────────────────────────────────

  startRectMode() {
    this.isRectMode = true;
    this.rectStart  = null;
    this.rectEnd    = null;
    this.rectPreviewCells.clear();
    this._updateRectMesh();
    if (window.showNotification) {
      window.showNotification('📐 Rectangle: clic 1 = coin, clic 2 = opposé');
    }
  }

  handleRectFirstClick(row, col) {
    this.rectStart = { row, col };
    this.rectEnd   = { row, col };
    this._updateRectPreview();
  }

  _updateRectFromHover(row, col) {
    this.rectEnd = { row, col };
    this._updateRectPreview();
  }

  _updateRectPreview() {
    if (!this.rectStart || !this.rectEnd) return;

    this.rectPreviewCells.clear();
    const minRow = Math.min(this.rectStart.row, this.rectEnd.row);
    const maxRow = Math.max(this.rectStart.row, this.rectEnd.row);
    const minCol = Math.min(this.rectStart.col, this.rectEnd.col);
    const maxCol = Math.max(this.rectStart.col, this.rectEnd.col);

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
          this.rectPreviewCells.add(`${r}-${c}`);
        }
      }
    }
    this._updateRectMesh();

    // Update button label with count
    const rectBtnEl = document.getElementById('fine-rect-btn');
    if (rectBtnEl) {
      const count = this.rectPreviewCells.size;
      rectBtnEl.innerHTML = `📐 Rectangle (R) — ${count} cases`;
    }

    // Update preview info bar
    this._updatePreviewInfo();
  }

  finishRect(objectDef) {
    if (!this.rectStart || !this.rectEnd) return null;

    const minRow = Math.min(this.rectStart.row, this.rectEnd.row);
    const maxRow = Math.max(this.rectStart.row, this.rectEnd.row);
    const minCol = Math.min(this.rectStart.col, this.rectEnd.col);
    const maxCol = Math.max(this.rectStart.col, this.rectEnd.col);

    const placed = [];
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        if (!this.getObjectAt(r, c)) {
          const p = this.placeObject(objectDef, r, c);
          if (p) placed.push(p);
        }
      }
    }

    this._clearRectPreview();
    this.rectStart = null;
    this.rectEnd   = null;
    this.isRectMode = false;
    const rectBtnEl = document.getElementById('fine-rect-btn');
    if (rectBtnEl) rectBtnEl.innerHTML = '📐 Rectangle (R)';
    const info = document.getElementById('fine-preview-info');
    if (info) info.style.display = 'none';
    if (placed.length > 0) this._lastPlacedBatch = placed.map(p => ({uid: p.uid, objectDef}));
    return placed;
  }

  cancelRect() {
    this._clearRectPreview();
    this.rectStart = null;
    this.rectEnd   = null;
    this.isRectMode = false;
    const rectBtnEl = document.getElementById('fine-rect-btn');
    if (rectBtnEl) rectBtnEl.innerHTML = '📐 Rectangle (R)';
    const info = document.getElementById('fine-preview-info');
    if (info) info.style.display = 'none';
  }

  _clearRectPreview() {
    this.rectPreviewCells.clear();
    this._rectMesh.count = 0;
    this._rectMesh.instanceMatrix.needsUpdate = true;
    this._rectMesh.visible = false;
  }

  // ── Line tool ────────────────────────────────────────────────────────────

  startLineMode() {
    this.isLineMode = true;
    this.placementMode = PLACEMENT_MODE_LINE;
    this.lineStart  = null;
    this.lineEnd   = null;
    this.linePreviewCells.clear();
    this._updateLineMesh();
    if (window.showNotification) {
      window.showNotification(`📏 Ligne: clic 1 = début, clic 2 = fin (espacement: ${this.lineSpacing * 10}cm)`);
    }
  }

  handleLineFirstClick(row, col) {
    this.lineStart = { row, col };
    this.lineEnd   = { row, col };
    this._updateLinePreview();
  }

  _updateLineFromHover(row, col) {
    this.lineEnd = { row, col };
    this._updateLinePreview();
  }

  _updateLinePreview() {
    if (!this.lineStart || !this.lineEnd) return;

    this.linePreviewCells.clear();
    const dr = this.lineEnd.row - this.lineStart.row;
    const dc = this.lineEnd.col - this.lineStart.col;
    const dist = Math.sqrt(dr * dr + dc * dc);
    if (dist < 0.5) {
      this.linePreviewCells.add(`${this.lineStart.row}-${this.lineStart.col}`);
      this._updateLineMesh();
      return;
    }

    // Interpoler les points de la ligne avec l'espacement
    const spacing = this.lineSpacing;
    const steps = Math.floor(dist / spacing);
    if (steps < 1) {
      this.linePreviewCells.add(`${this.lineStart.row}-${this.lineStart.col}`);
    } else {
      for (let s = 0; s <= steps; s++) {
        const t = s / (steps || 1);
        const r = Math.round(this.lineStart.row + dr * t);
        const c = Math.round(this.lineStart.col + dc * t);
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
          this.linePreviewCells.add(`${r}-${c}`);
        }
      }
    }
    this._updateLineMesh();

    // Update button label with count
    const lineBtnEl = document.getElementById('fine-line-btn');
    if (lineBtnEl) {
      const count = this.linePreviewCells.size;
      const spacing = this.lineSpacing * 10;
      lineBtnEl.innerHTML = `📏 Ligne (L) — ${count} × ${spacing}cm`;
    }

    // Update preview info bar
    this._updatePreviewInfo();
  }

  finishLine(objectDef) {
    if (!this.lineStart || !this.lineEnd) return null;

    const placed = [];
    const dr = this.lineEnd.row - this.lineStart.row;
    const dc = this.lineEnd.col - this.lineStart.col;
    const dist = Math.sqrt(dr * dr + dc * dc);

    if (dist < 0.5) {
      // Cas dégénéré: un seul point
      if (!this.getObjectAt(this.lineStart.row, this.lineStart.col)) {
        const p = this.placeObject(objectDef, this.lineStart.row, this.lineStart.col);
        if (p) placed.push(p);
      }
    } else {
      const spacing = this.lineSpacing;
      const steps = Math.floor(dist / spacing);
      for (let s = 0; s <= steps; s++) {
        const t = s / (steps || 1);
        const r = Math.round(this.lineStart.row + dr * t);
        const c = Math.round(this.lineStart.col + dc * t);
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
          if (!this.getObjectAt(r, c)) {
            const p = this.placeObject(objectDef, r, c);
            if (p) placed.push(p);
          }
        }
      }
    }

    this._clearLinePreview();
    this.lineStart = null;
    this.lineEnd   = null;
    this.isLineMode = false;
    this.placementMode = PLACEMENT_MODE_SINGLE;
    const lineBtnEl = document.getElementById('fine-line-btn');
    if (lineBtnEl) lineBtnEl.innerHTML = '📏 Ligne (L)';
    const info = document.getElementById('fine-preview-info');
    if (info) info.style.display = 'none';
    if (placed.length > 0) this._lastPlacedBatch = placed.map(p => ({uid: p.uid, objectDef}));
    return placed;
  }

  cancelLine() {
    this._clearLinePreview();
    this.lineStart = null;
    this.lineEnd   = null;
    this.isLineMode = false;
    this.placementMode = PLACEMENT_MODE_SINGLE;
    const lineBtnEl = document.getElementById('fine-line-btn');
    if (lineBtnEl) {
      lineBtnEl.innerHTML = '📏 Ligne (L)';
      lineBtnEl.style.background = 'rgba(0,212,255,0.12)';
      lineBtnEl.style.borderColor = 'rgba(0,212,255,0.35)';
    }
    const info = document.getElementById('fine-preview-info');
    if (info) info.style.display = 'none';
  }

  undoLastBatch() {
    if (!this._lastPlacedBatch || this._lastPlacedBatch.length === 0) return 0;
    let count = 0;
    for (const { uid } of this._lastPlacedBatch) {
      const obj = this.placedObjects.find(o => o.uid === uid);
      if (obj) {
        // Remove from cell map
        if (obj.occupiedCells) {
          obj.occupiedCells.forEach(key => this._cellMap.delete(key));
        }
        // Remove mesh
        if (obj.mesh) {
          this.scene.remove(obj.mesh);
          if (obj.mesh.geometry) obj.mesh.geometry.dispose();
          if (obj.mesh.material) {
            if (Array.isArray(obj.mesh.material)) obj.mesh.material.forEach(m => m.dispose());
            else obj.mesh.material.dispose();
          }
        }
        const idx = this.placedObjects.indexOf(obj);
        if (idx >= 0) this.placedObjects.splice(idx, 1);
        if (this.objectPhotos[uid]) {
          delete this.objectPhotos[uid];
        }
        count++;
      }
    }
    this._lastPlacedBatch = [];
    if (count > 0) this._saveState();
    return count;
  }

  _clearLinePreview() {
    this.linePreviewCells.clear();
    if (this._lineMesh) {
      this._lineMesh.count = 0;
      this._lineMesh.instanceMatrix.needsUpdate = true;
      this._lineMesh.visible = false;
    }
  }

  /**
   * Pose automatiquement les clôtures de délimitation du terrain
   * sur les 4 bords du jardin (24m × 50m)
   */
  delimitTerrain(fenceType = 'grillage') {
    // fenceType: 'grillage' | 'bordure_bois' | 'haie' | 'muret'
    this.clearAll();

    // Bordure par défaut pour le grillage (1 cellule de marge)
    const margin = 1;
    const topRow = margin;
    const bottomRow = ROWS - 1 - margin;
    const leftCol = margin;
    const rightCol = COLS - 1 - margin;

    // Trouver la définition de clôture
    const fenceDef = VEGETABLES.find(v => v.id === fenceType) || VEGETABLES.find(v => v.type === 'fence') || {
      id: fenceType,
      name: fenceType === 'grillage' ? 'Grillage' : fenceType === 'bordure_bois' ? 'Bordure bois' : fenceType === 'haie' ? 'Haie' : 'Muret',
      emoji: fenceType === 'grillage' ? '🔗' : fenceType === 'bordure_bois' ? '🪵' : fenceType === 'haie' ? '🌲' : '🧱',
      type: 'fence',
      color: fenceType === 'grillage' ? '#708090' : fenceType === 'bordure_bois' ? '#8B4513' : fenceType === 'haie' ? '#27ae60' : '#9CA3AF',
      spanCells: 1,
    };

    const placed = [];

    // Haut (row = topRow) — de leftCol à rightCol
    for (let col = leftCol; col <= rightCol; col++) {
      if (!this.getObjectAt(topRow, col)) {
        const p = this.placeObject(fenceDef, topRow, col);
        if (p) placed.push(p);
      }
    }

    // Bas (row = bottomRow) — de leftCol à rightCol
    for (let col = leftCol; col <= rightCol; col++) {
      if (!this.getObjectAt(bottomRow, col)) {
        const p = this.placeObject(fenceDef, bottomRow, col);
        if (p) placed.push(p);
      }
    }

    // Gauche (col = leftCol) — de topRow à bottomRow (sans les coins déjà posés)
    for (let row = topRow + 1; row <= bottomRow - 1; row++) {
      if (!this.getObjectAt(row, leftCol)) {
        const p = this.placeObject(fenceDef, row, leftCol);
        if (p) placed.push(p);
      }
    }

    // Droite (col = rightCol) — de topRow à bottomRow (sans les coins déjà posés)
    for (let row = topRow + 1; row <= bottomRow - 1; row++) {
      if (!this.getObjectAt(row, rightCol)) {
        const p = this.placeObject(fenceDef, row, rightCol);
        if (p) placed.push(p);
      }
    }

    this._lastPlacedBatch = placed.map(p => ({ uid: p.uid, objectDef: fenceDef }));

    const perimeter = (rightCol - leftCol + bottomRow - topRow) * 2;
    if (window.showNotification) {
      window.showNotification(`🏗️ Terrain délimité: ${placed.length} sections de ${fenceDef.name} posées`);
    }
    return placed;
  }

  setLineSpacing(spacing) {
    this.lineSpacing = spacing;
    if (this.isLineMode) {
      this._updateLinePreview();
      if (window.showNotification) {
        window.showNotification(`📏 Espacement ligne: ${spacing * 10}cm`);
      }
    }
  }

  // ── Hauteur clôture (pour le 2D planner) ─────────────────────────────────
  setFenceHeight(height) {
    this._fenceHeightOverride = height;
  }

  // ── Bulk load (sans autosave par objet, pour le 2D planner) ──────────────
  loadPlanObjects(planObjects, skipSave = true) {
    this.placedObjects.forEach(o => {
      this.scene.remove(o.group);
      o.group.traverse(child => { if (child.geometry) child.geometry.dispose(); });
    });
    this.placedObjects = [];
    this._cellMap = new Map();

    const placed = [];
    planObjects.forEach(o => {
      const def = VEGETABLES_CATALOG.find(v => v.id === o.id) || o.objectDef || o;
      if (!def) return;
      const p = this.placeObject(def, o.row, o.col);
      if (p) placed.push(p);
    });

    if (skipSave) {
      // Ne pas autosave pendant le chargement批量
      try {
        const data = {
          placedObjects: this.placedObjects.map(o2 => ({
            uid: o2.uid, objectDef: o2.objectDef, row: o2.row, col: o2.col, span: o2.span,
          })),
        };
        localStorage.setItem('greenhub_fine_grid_state', JSON.stringify(data));
      } catch (e) {}
    }
    return placed;
  }

  // ── Ghost preview ───────────────────────────────────────────────────────

  showGhostPreview(objectDef, row, col) {
    this.clearGhostPreview();
    const span = objectDef.spanCells || 1;
    const pos  = this.cellToWorld(row, col);
    this.ghostGroup = this._createObjectMesh(objectDef, span);
    this.ghostGroup.traverse(child => {
      if (child.material) {
        child.material = child.material.clone();
        child.material.transparent = true;
        child.material.opacity = 0.35;
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

  // ── Visibilité ─────────────────────────────────────────────────────────

  setVisible(visible) {
    this.isVisible = visible;
    this.group.visible = visible;
    if (!visible) {
      this.clearHighlight();
      this.clearSelection();
      this.clearGhostPreview();
    }
  }

  // ── Photos ─────────────────────────────────────────────────────────────

  _loadPhotos() {
    try {
      const saved = localStorage.getItem('greenhub_fine_grid_photos');
      if (saved) this.objectPhotos = JSON.parse(saved);
    } catch { this.objectPhotos = {}; }
  }

  _savePhotos() {
    localStorage.setItem('greenhub_fine_grid_photos', JSON.stringify(this.objectPhotos));
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

  getPhotos(uid) {
    return this.objectPhotos[uid] || [];
  }

  // ── State (localStorage) ────────────────────────────────────────────────

  _saveState() {
    try {
      const data = {
        placedObjects: this.placedObjects.map(o => ({
          uid:       o.uid,
          objectDef: o.objectDef,
          row:       o.row,
          col:       o.col,
          span:      o.span,
        })),
      };
      localStorage.setItem('greenhub_fine_grid_state', JSON.stringify(data));
    } catch (e) {
      console.warn('FineGridDeck: failed to save state', e);
    }
  }

  _loadState() {
    try {
      const saved = localStorage.getItem('greenhub_fine_grid_state');
      if (!saved) return;
      const data = JSON.parse(saved);
      // Supprimer les objets actuels
      this.placedObjects.forEach(o => {
        this.scene.remove(o.group);
      });
      this.placedObjects = [];
      this._cellMap = new Map();

      // Recréer les objets
      (data.placedObjects || []).forEach(o => {
        const placed = this.placeObject(o.objectDef, o.row, o.col);
        if (placed && o.uid) placed.uid = o.uid;
      });
    } catch (e) {
      console.error('FineGridDeck: failed to load state', e);
    }
  }

  // ── Export / Import ────────────────────────────────────────────────────

  exportState() {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      dimensions: { width: REAL_WIDTH, depth: REAL_DEPTH, cellSize: CELL_SIZE, cols: COLS, rows: ROWS },
      placedObjects: this.placedObjects.map(o => ({
        id: o.objectDef.id,
        name: o.objectDef.name,
        emoji: o.objectDef.emoji,
        row: o.row,
        col: o.col,
        uid: o.uid,
      })),
    };
    return JSON.stringify(data, null, 2);
  }

  downloadState() {
    const json = this.exportState();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `greenhub-jardin-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (window.showNotification) window.showNotification('💾 Plan exporté !');
  }

  importState() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!data.placedObjects) throw new Error('Invalid format');
          // Clear current
          this.clearAll();
          // Place objects
          data.placedObjects.forEach(o => {
            const veg = VEGETABLES.find(v => v.id === o.id);
            if (veg) {
              const placed = this.placeObject(veg, o.row, o.col);
              if (placed && o.uid) placed.uid = o.uid;
            }
          });
          this._saveState();
          if (window.showNotification) window.showNotification(`📂 ${data.placedObjects.length} objets importés !`);
        } catch (err) {
          if (window.showNotification) window.showNotification('❌ Import échoué: fichier invalide');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  // ── UI Panel ──────────────────────────────────────────────────────────

  createUI(appRef) {
    this.appRef = appRef;
    this.removeUI();

    // Catalogue des légumes et objets pour la grille fine (utilise le catalogue exporté)
    const VEGETABLES = VEGETABLES_CATALOG;
    const categories = VEGETABLES_CATEGORIES;

    let activeCat = 'legumes';

    const panel = document.createElement('div');
    panel.id = 'fine-grid-panel';
    panel.style.cssText = `
      position: fixed; left: 16px; top: 80px; width: 240px;
      background: rgba(13,17,23,0.97); border: 1px solid rgba(46,204,113,0.4);
      border-radius: 12px; padding: 12px; z-index: 1000;
      font-family: 'DM Sans', sans-serif; max-height: 80vh; overflow-y: auto;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;';
    const headerTitle = document.createElement('span');
    headerTitle.style.cssText = 'color:#2ecc71;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;';
    headerTitle.textContent = '🥕 Grille Fine 10cm';
    header.appendChild(headerTitle);

    const dimLabel = document.createElement('span');
    dimLabel.style.cssText = 'color:rgba(255,255,255,0.3);font-size:9px;';
    dimLabel.textContent = '24m × 50m';
    header.appendChild(dimLabel);

    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'background:none;border:none;color:rgba(255,255,255,0.5);font-size:18px;cursor:pointer;line-height:1;';
    closeBtn.textContent = '×';
    closeBtn.onclick = () => {
      if (this.appRef) {
        this.appRef.isFineGridDeckMode = false;
        this.appRef.fineGridDeck.setVisible(false);
        this.appRef.fineGridDeck.removeUI();
      }
    };
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Coordinate display
    const coordDisplay = document.createElement('div');
    coordDisplay.id = 'fine-coord-display';
    coordDisplay.style.cssText = `
      text-align:center; margin-bottom:10px; padding:4px 8px;
      background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);
      border-radius:6px; font-size:10px; color:rgba(255,255,255,0.5);
    `;
    coordDisplay.textContent = '📍 survolez la grille';
    panel.appendChild(coordDisplay);

    // Preview info bar (updated during rect/line drawing)
    const previewInfo = document.createElement('div');
    previewInfo.id = 'fine-preview-info';
    previewInfo.style.cssText = `
      display:none; margin-bottom:10px; padding:8px 10px;
      background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
      border-radius:8px; font-size:11px; color:rgba(255,255,255,0.7);
    `;
    panel.appendChild(previewInfo);

    // Rectangle tool
    const rectBtn = document.createElement('button');
    rectBtn.id = 'fine-rect-btn';
    rectBtn.style.cssText = `
      width:100%; padding:8px 12px; margin-bottom:10px;
      background:rgba(46,204,113,0.15); border:1px solid rgba(46,204,113,0.4);
      border-radius:8px; color:#2ecc71; font-size:11px; font-weight:600;
      cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;
    `;
    rectBtn.innerHTML = '📐 Rectangle (R)';
    rectBtn.onclick = () => {
      if (this.isRectMode) {
        this.cancelRect();
        rectBtn.style.background = 'rgba(46,204,113,0.15)';
        rectBtn.style.borderColor = 'rgba(46,204,113,0.4)';
      } else {
        if (this.isLineMode) this.cancelLine();
        this.startRectMode();
        rectBtn.style.background = 'rgba(46,204,113,0.3)';
        rectBtn.style.borderColor = '#2ecc71';
      }
    };
    panel.appendChild(rectBtn);

    // Line tool button
    const lineBtn = document.createElement('button');
    lineBtn.id = 'fine-line-btn';
    lineBtn.style.cssText = `
      width:100%; padding:8px 12px; margin-bottom:8px;
      background:rgba(0,212,255,0.12); border:1px solid rgba(0,212,255,0.35);
      border-radius:8px; color:#00d4ff; font-size:11px; font-weight:600;
      cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;
    `;
    lineBtn.innerHTML = '📏 Ligne (L)';
    lineBtn.onclick = () => {
      if (this.isLineMode) {
        this.cancelLine();
        lineBtn.style.background = 'rgba(0,212,255,0.12)';
        lineBtn.style.borderColor = 'rgba(0,212,255,0.35)';
      } else {
        if (this.isRectMode) this.cancelRect();
        this.startLineMode();
        lineBtn.style.background = 'rgba(0,212,255,0.25)';
        lineBtn.style.borderColor = '#00d4ff';
      }
    };
    panel.appendChild(lineBtn);

    // Line spacing selector
    const spacingDiv = document.createElement('div');
    spacingDiv.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;align-items:center;';
    const spacingLabel = document.createElement('span');
    spacingLabel.style.cssText = 'font-size:10px;color:rgba(255,255,255,0.5);margin-right:4px;flex-shrink:0;';
    spacingLabel.textContent = '↔ Espacement:';
    spacingDiv.appendChild(spacingLabel);
    LINE_SPACINGS.forEach(sp => {
      const spBtn = document.createElement('button');
      spBtn.style.cssText = `padding:3px 7px;border-radius:5px;font-size:10px;cursor:pointer;
        background:${sp.value === this.lineSpacing ? 'rgba(0,212,255,0.25)' : 'rgba(255,255,255,0.05)'};
        border:1px solid ${sp.value === this.lineSpacing ? 'rgba(0,212,255,0.6)' : 'rgba(255,255,255,0.1)'};
        color:${sp.value === this.lineSpacing ? '#00d4ff' : 'rgba(255,255,255,0.5)'};font-weight:${sp.value === this.lineSpacing ? '600' : '400'};`;
      spBtn.textContent = sp.label;
      spBtn.onclick = () => {
        this.setLineSpacing(sp.value);
        [...spacingDiv.querySelectorAll('button')].forEach(b => {
          const v = parseInt(b.getAttribute('data-spacing'));
          b.style.background = v === this.lineSpacing ? 'rgba(0,212,255,0.25)' : 'rgba(255,255,255,0.05)';
          b.style.borderColor = v === this.lineSpacing ? 'rgba(0,212,255,0.6)' : 'rgba(255,255,255,0.1)';
          b.style.color = v === this.lineSpacing ? '#00d4ff' : 'rgba(255,255,255,0.5)';
        });
      };
      spBtn.setAttribute('data-spacing', sp.value);
      spacingDiv.appendChild(spBtn);
    });
    panel.appendChild(spacingDiv);

    // Délimiter terrain buttons
    const delimDiv = document.createElement('div');
    delimDiv.style.cssText = 'display:flex;flex-direction:column;gap:4px;margin-bottom:10px;';
    const delimLabel = document.createElement('div');
    delimLabel.style.cssText = 'font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:2px;';
    delimLabel.textContent = '🏗️ Délimiter le terrain:';
    delimDiv.appendChild(delimLabel);
    const delimTypes = [
      { id: 'grillage', label: '🔗 Grillage', color: 'rgba(113,128,150,0.3)' },
      { id: 'bordure_bois', label: '🪵 Bois', color: 'rgba(139,90,43,0.3)' },
      { id: 'haie', label: '🌲 Haie', color: 'rgba(34,139,34,0.3)' },
      { id: 'muret', label: '🧱 Muret', color: 'rgba(156,163,175,0.3)' },
    ];
    const delimRow = document.createElement('div');
    delimRow.style.cssText = 'display:flex;gap:4px;';
    delimTypes.forEach(dt => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        flex:1; padding:5px 0; border-radius:6px; text-align:center;
        background:${dt.color}; border:1px solid rgba(255,255,255,0.1);
        color:rgba(255,255,255,0.8); font-size:10px; cursor:pointer; font-weight:600;
      `;
      btn.textContent = dt.label;
      btn.onclick = () => this.delimitTerrain(dt.id);
      delimRow.appendChild(btn);
    });
    delimDiv.appendChild(delimRow);
    panel.appendChild(delimDiv);

    // Companion info section
    const companionDiv = document.createElement('div');
    companionDiv.id = 'fine-companion-info';
    companionDiv.style.cssText = `
      display:none; margin-bottom:10px; padding:8px 10px;
      background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);
      border-radius:8px; font-size:10px;
    `;
    panel.appendChild(companionDiv);

    // Clear all button
    const clearBtn = document.createElement('button');
    clearBtn.style.cssText = `
      width:100%; padding:6px 12px; margin-bottom:10px;
      background:rgba(231,76,60,0.15); border:1px solid rgba(231,76,60,0.4);
      border-radius:8px; color:#e74c3c; font-size:10px; font-weight:600;
      cursor:pointer;
    `;
    clearBtn.textContent = '🗑️ Tout supprimer';
    clearBtn.onclick = () => {
      if (window.confirm('Supprimer tous les objets de la grille fine ?')) {
        this.clearAll();
        this.removeUI();
        if (this.appRef) this.appRef.isFineGridDeckMode = false;
      }
    };
    panel.appendChild(clearBtn);

    // Export / Import buttons
    const ioDiv = document.createElement('div');
    ioDiv.style.cssText = 'display:flex;gap:6px;margin-bottom:10px;';
    const expBtn = document.createElement('button');
    expBtn.style.cssText = `
      flex:1; padding:6px 0; border-radius:8px; text-align:center;
      background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3);
      color:#2ecc71; font-size:10px; cursor:pointer; font-weight:600;
    `;
    expBtn.textContent = '📤 Exporter';
    expBtn.onclick = () => this.downloadState();
    const impBtn = document.createElement('button');
    impBtn.style.cssText = `
      flex:1; padding:6px 0; border-radius:8px; text-align:center;
      background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.3);
      color:#60a5fa; font-size:10px; cursor:pointer; font-weight:600;
    `;
    impBtn.textContent = '📥 Importer';
    impBtn.onclick = () => this.importState();
    ioDiv.appendChild(expBtn);
    ioDiv.appendChild(impBtn);
    panel.appendChild(ioDiv);

    // Category tabs
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
        [...catTabs.querySelectorAll('button')].forEach((b, bi) => {
          const c = categories[bi];
          b.style.background = c.id === activeCat ? 'rgba(46,204,113,0.2)' : 'rgba(255,255,255,0.04)';
          b.style.borderColor = c.id === activeCat ? 'rgba(46,204,113,0.5)' : 'rgba(255,255,255,0.08)';
          b.style.color = c.id === activeCat ? '#2ecc71' : 'rgba(255,255,255,0.5)';
          b.style.fontWeight = c.id === activeCat ? '600' : '400';
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
        el.style.cssText = `padding:6px 8px;border-radius:8px;cursor:pointer;
          background:${item.color || '#4CAF50'}20;
          border:1.5px solid ${item.color || '#4CAF50'}50;
          display:flex;align-items:center;gap:4px;
          transition:all 0.15s;`;
        el.innerHTML = `<span style="font-size:16px;">${item.emoji || '🌱'}</span><span style="font-size:10px;color:#fff;">${item.name}</span>`;
        el.onclick = () => {
          if (this.appRef) this.appRef.selectedGardenObjectDef = item;
          [...itemsDiv.querySelectorAll('div')].forEach(d => d.style.borderColor = (d === el ? '#2ecc71' : (item.color || '#4CAF50') + '50'));
          el.style.borderColor = '#2ecc71';
          // Show companion info
          const compDiv = document.getElementById('fine-companion-info');
          if (compDiv) {
            const info = getCompanionInfo(item.id);
            if (info) {
              const goodNames = info.good.map(id => {
                const found = VEGETABLES.find(v => v.id === id);
                return found ? `${found.emoji} ${found.name}` : id;
              }).join(', ');
              const badNames = info.bad.map(id => {
                const found = VEGETABLES.find(v => v.id === id);
                return found ? `${found.emoji} ${found.name}` : id;
              }).join(', ');
              compDiv.style.display = 'block';
              compDiv.innerHTML = `
                <div style="margin-bottom:4px;color:#2ecc71;font-weight:600;">🌱 Compagnonnage</div>
                ${goodNames ? `<div style="color:#86efac;">✅ ${goodNames}</div>` : ''}
                ${badNames ? `<div style="color:#fca5a5;">❌ ${badNames}</div>` : ''}
              `;
            } else {
              compDiv.style.display = 'none';
            }
          }
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
    this.cancelLine();
    const p = document.getElementById('fine-grid-panel');
    if (p) p.remove();
    const i = document.getElementById('fine-info-panel');
    if (i) i.remove();
    this.uiPanel = null;
  }

  showInfoPanel(placedObj, deckRef) {
    const existing = document.getElementById('fine-info-panel');
    if (existing) existing.remove();

    const obj = placedObj.objectDef;
    const uid  = placedObj.uid;
    const photos = deckRef.getPhotos(uid);

    const panel = document.createElement('div');
    panel.id = 'fine-info-panel';
    panel.style.cssText = `
      position:fixed; right:16px; bottom:20px; width:280px;
      background:rgba(13,17,23,0.97); border:1px solid rgba(46,204,113,0.4);
      border-radius:12px; padding:14px; z-index:1000;
      font-family:'DM Sans',sans-serif;
    `;

    panel.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <span style="font-size:28px;">${obj.emoji || '🌱'}</span>
        <div>
          <div style="font-size:14px;font-weight:700;color:#fff;">${obj.name}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.5);">
            Rangée ${placedObj.row} × Colonne ${placedObj.col}
          </div>
        </div>
      </div>
      <div style="margin-bottom:10px;">
        <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:6px;display:flex;justify-content:space-between;">
          <span>📸 Photos (${photos.length})</span>
          <label style="cursor:pointer;padding:3px 8px;background:rgba(46,204,113,0.2);border-radius:4px;font-size:10px;color:#2ecc71;">
            + Ajouter
            <input type="file" accept="image/*" style="display:none;"
              onchange="window.__fineGridAddPhoto && window.__fineGridAddPhoto(this.files[0])" />
          </label>
        </div>
        <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;" id="fine-photos-row">
          ${photos.length === 0 ? '<div style="font-size:11px;color:rgba(255,255,255,0.3);font-style:italic;">Aucune photo</div>' : ''}
          ${photos.map(p => `
            <div style="position:relative;flex-shrink:0;">
              <img src="${p.data}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;border:1px solid rgba(255,255,255,0.2);" />
              <button data-photo-id="${p.id}" class="fine-photo-del" style="
                position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;
                background:#ef4444;color:#fff;border:none;font-size:10px;cursor:pointer;
                display:flex;align-items:center;justify-content:center;
              ">×</button>
            </div>
          `).join('')}
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <button id="fine-info-delete" style="flex:1;padding:8px 0;border-radius:8px;text-align:center;
          background:rgba(231,76,60,0.15);border:1px solid rgba(231,76,60,0.3);
          color:#e74c3c;font-size:12px;cursor:pointer;font-weight:600;">
          🗑️ Supprimer
        </button>
        <button id="fine-info-close" style="flex:1;padding:8px 0;border-radius:8px;text-align:center;
          background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
          color:rgba(255,255,255,0.6);font-size:12px;cursor:pointer;font-weight:600;">
          ✕ Fermer
        </button>
      </div>
    `;

    document.body.appendChild(panel);

    // Photo delete
    panel.querySelectorAll('.fine-photo-del').forEach(btn => {
      btn.onclick = () => {
        deckRef.removePhoto(uid, parseInt(btn.dataset.photoId));
        this.showInfoPanel(placedObj, deckRef);
      };
    });

    // Delete
    document.getElementById('fine-info-delete').onclick = () => {
      deckRef.removeObject(uid);
      deckRef.clearSelection();
      panel.remove();
      deckRef.selectedPlacedObject = null;
    };

    // Close
    document.getElementById('fine-info-close').onclick = () => {
      deckRef.clearSelection();
      deckRef.selectedPlacedObject = null;
      panel.remove();
    };

    // Photo add
    window.__fineGridAddPhoto = (file) => {
      if (file) {
        deckRef.addPhoto(uid, file);
        this.showInfoPanel(placedObj, deckRef);
      }
    };
  }

  // ── Camera ──────────────────────────────────────────────────────────────

  setCamera(camera) {
    this.camera = camera;
  }

  // ── Reset ──────────────────────────────────────────────────────────────

  clearAll() {
    [...this.placedObjects].forEach(obj => this.removeObject(obj.uid));
    this._cellMap = new Map();
    this.hoveredCells.clear();
    this.selectedCells.clear();
    this.rectPreviewCells.clear();
    this._updateHighlightMesh();
    this._updateSelectMesh();
    this._clearRectPreview();
    try { localStorage.removeItem('greenhub_fine_grid_state'); } catch {}
    try { localStorage.removeItem('greenhub_fine_grid_photos'); } catch {}
    this.objectPhotos = {};
    console.log('🗑️ FineGridDeck: tous les objets supprimés');
  }

  // ── Nettoyage ──────────────────────────────────────────────────────────

  destroy() {
    this.placedObjects.forEach(o => {
      this.scene.remove(o.group);
      o.group.traverse(child => { if (child.geometry) child.geometry.dispose(); });
    });
    this._tileGeo.dispose();
    this._highlightMat.dispose();
    this._selectMat.dispose();
    this._rectMat.dispose();
    this.scene.remove(this.group);
    this._cellMap = null;
    console.log('🧹 FineGridDeck détruit');
  }
}

// Export statiques pour consultation externe
FineGridDeck.COLS      = COLS;
FineGridDeck.ROWS      = ROWS;
FineGridDeck.CELL_SIZE = CELL_SIZE;
FineGridDeck.WIDTH     = REAL_WIDTH;
FineGridDeck.DEPTH     = REAL_DEPTH;

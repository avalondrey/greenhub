import Phaser from 'phaser';

// ── TILESET CONFIG ──────────────────────────────────────────────
const SRC_TILE_W = 268;       // each stage tile width in source image
const SRC_TILE_H = 180;       // each stage tile height in source image
const SRC_TITLE_H = 46;       // title bar height to skip
const TILESET_COLS = 5;       // 5 growth stages per row
const TILESET_ROWS = 4;       // 4 tomato varieties

// ── GREENHOUSE GRID CONFIG ──────────────────────────────────────
const GRID_COLS = 4;
const GRID_ROWS = 6;

// ── DISPLAY CONFIG ─────────────────────────────────────────────
const DISPLAY_TILE_W = 120;   // display size per tile
const DISPLAY_TILE_H = 80;    // display size per tile (isometric ratio ~1.5:1)

// ── TOMATO VARIETY MAPPING ──────────────────────────────────────
const TOMATO_VARIETY_MAP = {
  'tomate-coeur-de-boeuf': 0,
  'tomate-cerise': 1,
  'tomate-roma': 2,
  'tomate-ananas': 3,
  'tomate-noire-de-crimee': 0, // fallback to first variety
};

const VARIETY_NAMES = ['Coeur de Boeuf', 'Cerise', 'Roma', 'Ananas'];
const STAGE_NAMES = ['Graine', 'Germination', 'Levée', 'Croissance', 'Prête'];

export class GreenhouseScene extends Phaser.Scene {
  constructor() {
    super('GreenhouseScene');

    // Tile state: 2D array of { variety, stage } or null
    this.grid = [];

    // Display objects
    this.tileSprites = {};
    this.plantGroup = null;

    // Clean spritesheet
    this.spritesheetKey = 'tomato-spritesheet';
    this.tileTextures = []; // [variety][stage] = frame name

    // Callbacks
    this.onCellClickCallback = null;

    // Map data for TMX compatibility
    this.mapData = [];
  }

  preload() {
    this.load.image('tomato-raw', '/tileset/stades-serre/S01_tomates1.jpg');
  }

  create() {
    const { width, height } = this.scale;

    // ── STEP 1: Crop tileset into clean spritesheet ───────────────
    this.createCleanSpritesheet();

    // ── STEP 2: Initialize grid data ──────────────────────────────
    for (let r = 0; r < GRID_ROWS; r++) {
      this.grid[r] = [];
      this.mapData[r] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        this.grid[r][c] = null;
        this.mapData[r][c] = 0; // 0 = empty tile in TMX
      }
    }

    // ── STEP 3: Draw sky/ground background ────────────────────────
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xDDEEFF, 0xDDEEFF, 1);
    bg.fillRect(0, 0, width, height);
    bg.setDepth(-10);

    // Ground plane
    const ground = this.add.graphics();
    ground.fillStyle(0x5aab2a, 0.3);
    ground.fillRect(0, height * 0.3, width, height * 0.7);
    ground.setDepth(-5);

    // ── STEP 4: Create empty tile placeholders ─────────────────────
    this.plantGroup = this.add.group();

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const pos = this.isoToScreen(c, r);

        // Empty cell marker (dirt alveole)
        const emptyTile = this.add.ellipse(
          pos.x, pos.y, DISPLAY_TILE_W * 0.6, DISPLAY_TILE_H * 0.35,
          0x8b5e3c, 0.5
        );
        emptyTile.setStrokeStyle(1, 0x3d2010, 0.4);
        emptyTile.setDepth(r * GRID_COLS + c);
        emptyTile.setInteractive();

        // Hover effect
        emptyTile.on('pointerover', () => {
          emptyTile.setFillStyle(0x72d63a, 0.7);
          emptyTile.setStrokeStyle(2, 0xffffff, 0.8);
        });
        emptyTile.on('pointerout', () => {
          emptyTile.setFillStyle(0x8b5e3c, 0.5);
          emptyTile.setStrokeStyle(1, 0x3d2010, 0.4);
        });
        emptyTile.on('pointerdown', () => {
          if (this.onCellClickCallback) {
            this.onCellClickCallback(r * GRID_COLS + c);
          }
        });

        this.tileSprites[`${c}-${r}`] = { empty: emptyTile, plant: null };
      }
    }

    // ── STEP 5: TMX-compatible export method ──────────────────────
    this.registry.set('getMapData', () => this.mapData);
    this.registry.set('getTilesetInfo', () => ({
      name: 'tomato_stages',
      tileWidth: DISPLAY_TILE_W,
      tileHeight: DISPLAY_TILE_H,
      tileCount: TILESET_COLS * TILESET_ROWS,
      columns: TILESET_COLS,
      image: 'S01_tomates1.jpg',
      varieties: VARIETY_NAMES,
      stages: STAGE_NAMES,
    }));

    // ── STEP 6: Label ────────────────────────────────────────────
    this.add.text(width / 2, 16, '\u{1F3E1} MINI SERRE \u2014 MOTEUR TILEMAP', {
      fontSize: '13px',
      fontFamily: "'DM Sans', sans-serif",
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0).setDepth(100);

    this.add.text(width / 2, 34, 'TileSet: S01_tomates1.jpg \u00B7 20 tiles \u00B7 4\u00D76 grid', {
      fontSize: '10px',
      fontFamily: "'DM Sans', sans-serif",
      color: 'rgba(255,255,255,0.5)',
    }).setOrigin(0.5, 0).setDepth(100);

    // Logo
    this.add.text(width - 10, height - 10, 'GreenHub Engine v1.0', {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: 'rgba(255,255,255,0.2)',
    }).setOrigin(1, 1).setDepth(100);
  }

  createCleanSpritesheet() {
    const rawTexture = this.textures.get('tomato-raw');
    const rawImg = rawTexture.source[0].image;

    const canvas = document.createElement('canvas');
    canvas.width = SRC_TILE_W * TILESET_COLS;
    canvas.height = SRC_TILE_H * TILESET_ROWS;
    const ctx = canvas.getContext('2d');

    const srcColW = rawImg.width / TILESET_COLS;
    const srcRowH = (rawImg.height - SRC_TITLE_H) / TILESET_ROWS;

    this.tileTextures = [];

    for (let row = 0; row < TILESET_ROWS; row++) {
      this.tileTextures[row] = [];
      for (let col = 0; col < TILESET_COLS; col++) {
        const sx = Math.floor(col * srcColW);
        const sy = SRC_TITLE_H + Math.floor(row * srcRowH);
        const sw = Math.floor(srcColW);
        const sh = Math.floor(srcRowH);

        ctx.drawImage(rawImg, sx, sy, sw, sh, col * SRC_TILE_W, row * SRC_TILE_H, SRC_TILE_W, SRC_TILE_H);

        // Also add individual frames to the Phaser texture
        const frameName = `tile_${row}_${col}`;
        rawTexture.add(frameName, 0, sx, sy, sw, sh);
        this.tileTextures[row][col] = frameName;
      }
    }

    // Add clean spritesheet canvas as a texture
    this.textures.addCanvas(this.spritesheetKey, canvas);
  }

  isoToScreen(col, row) {
    const cx = this.scale.width / 2;
    const cy = 80; // top offset
    const tileW = DISPLAY_TILE_W;
    const tileH = DISPLAY_TILE_H;

    return {
      x: cx + (col - row) * (tileW / 2),
      y: cy + (col + row) * (tileH / 2),
    };
  }

  updateCell(col, row, varietyIdx, stageIdx) {
    const key = `${col}-${row}`;
    const entry = this.tileSprites[key];
    if (!entry) return;

    // Clear previous plant sprite
    if (entry.plant) {
      entry.plant.destroy();
      entry.plant = null;
    }

    // Hide empty cell marker
    entry.empty.setVisible(false);

    // Get the frame from our pre-defined textures
    const frameName = this.tileTextures[varietyIdx]?.[stageIdx];
    if (!frameName) return;

    const pos = this.isoToScreen(col, row);
    const plant = this.add.image(pos.x, pos.y - DISPLAY_TILE_H * 0.2, 'tomato-raw', frameName);
    plant.setDisplaySize(DISPLAY_TILE_W, DISPLAY_TILE_H);
    plant.setDepth(row * GRID_COLS + col + 0.5);
    plant.setInteractive();

    // Click on plant
    plant.on('pointerdown', () => {
      if (this.onCellClickCallback) {
        this.onCellClickCallback(row * GRID_COLS + col);
      }
    });

    entry.plant = plant;

    // Update TMX map data (tile index = variety * 5 + stage + 1)
    this.mapData[row][col] = varietyIdx * TILESET_COLS + stageIdx + 1;

    // Export updated TMX data
    this.exportTMX();
  }

  clearCell(col, row) {
    const key = `${col}-${row}`;
    const entry = this.tileSprites[key];
    if (!entry) return;

    if (entry.plant) {
      entry.plant.destroy();
      entry.plant = null;
    }
    entry.empty.setVisible(true);
    this.mapData[row][col] = 0;
    this.exportTMX();
  }

  exportTMX() {
    // Generate TMX-compatible CSV data
    const csvRows = this.mapData.map(row => row.join(','));
    const csvData = csvRows.join(',\n');
    this.registry.set('tmxData', csvData);
  }

  setOnCellClick(callback) {
    this.onCellClickCallback = callback;
  }
}

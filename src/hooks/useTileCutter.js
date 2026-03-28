// ── TILE CUTTER HOOK v3 ────────────────────────────────────────────
// Découpe S01_tomates1.jpg en tuiles propres SANS labels texte
//
// v3 fixes:
//   - Module-level cache: tiles survive component remounts
//   - Proper stage clamping (GROWTH_STAGES=6, tileset cols=5)
//   - Batched state updates (no per-tile re-render)
//   - Better crop zone for cleaner sprites

import { useState, useEffect, useCallback, useRef } from 'react';

const TILESET_URL = '/tileset/stades-serre/S01_tomates1.jpg';
const IMG_W = 1344;
const IMG_H = 768;
const TITLE_H = 50;           // zone titre "GREENHUB SERRE - TOMATES 1/2" à sauter
const ROWS = 4;
const COLS = 5;
const TILE_W = IMG_W / COLS;              // ~268.8
const TILE_H = (IMG_H - TITLE_H) / ROWS;  // ~179.5

// ── Crop intelligent : ne garde que le haut de chaque tuile (le sprite plante) ──
const CROP_TOP_PAD = 4;
const CROP_SIDE_PAD = 12;
const CROP_BOTTOM_CUT = 0.35; // coupe 35% du bas (labels texte)
const CROP_ASPECT = 0.78;     // ratio largeur/hauteur du sprite final

export const VARIETY_NAMES = ['Coeur de Boeuf', 'Cerise', 'Roma', 'Ananas'];
export const STAGE_NAMES = ['Graine', 'Germination', 'Levée', 'Croissance', 'Prête'];

export const TOMATO_TILE_MAP = {
  'tomate-coeur-de-boeuf': 0,
  'tomate-cerise': 1,
  'tomate-roma': 2,
  'tomate-ananas': 3,
  'tomate-noire-de-crimee': 0,
};

export const MAX_TILE_STAGE = COLS - 1; // 4 (tileset has 5 columns: 0-4)

// ── Module-level cache: survives component unmount/remount ──
let _cache = null;       // { tiles: {}, loaded: boolean }
let _loading = false;    // prevent double-load
let _listeners = [];     // hooks waiting for load

function _notifyListeners() {
  _listeners.forEach(fn => fn(_cache));
  _listeners = [];
}

function _loadTiles() {
  if (_cache) return;           // already loaded
  if (_loading) return;         // loading in progress
  _loading = true;

  const img = new Image();
  img.crossOrigin = 'anonymous';

  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const cutTiles = {};

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const srcX = col * TILE_W + CROP_SIDE_PAD;
        const srcY = TITLE_H + row * TILE_H + CROP_TOP_PAD;
        const srcW = TILE_W - CROP_SIDE_PAD * 2;
        const srcH = (TILE_H - CROP_TOP_PAD) * (1 - CROP_BOTTOM_CUT);
        const outW = Math.round(srcW);
        const outH = Math.round(outW * CROP_ASPECT);

        canvas.width = outW;
        canvas.height = outH;
        ctx.clearRect(0, 0, outW, outH);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outW, outH);
        cutTiles[`${row}-${col}`] = canvas.toDataURL('image/png');
      }
    }

    _cache = { tiles: cutTiles, loaded: true };
    _loading = false;
    _notifyListeners();
  };

  img.onerror = () => {
    console.warn('[TileCutter] Impossible de charger', TILESET_URL);
    _cache = { tiles: {}, loaded: true };
    _loading = false;
    _notifyListeners();
  };

  img.src = TILESET_URL;
}

export function getTileGID(varietyIdx, stageIdx) {
  return varietyIdx * COLS + stageIdx + 1;
}

export function getTileProperties(gid) {
  const idx = gid - 1;
  const row = Math.floor(idx / COLS);
  const col = idx % COLS;
  return {
    id: gid,
    variety: VARIETY_NAMES[row] || 'Unknown',
    stage: STAGE_NAMES[col] || 'Unknown',
    varietyIdx: row,
    stageIdx: col,
  };
}

export default function useTileCutter() {
  const [tiles, setTiles] = useState(_cache?.tiles || {});
  const [loaded, setLoaded] = useState(_cache?.loaded || false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    if (_cache?.loaded) {
      // Already cached — use it immediately
      setTiles(_cache.tiles);
      setLoaded(true);
      return;
    }

    // Subscribe for load completion
    _listeners.push((data) => {
      setTiles(data.tiles);
      setLoaded(data.loaded);
    });

    _loadTiles();
  }, []);

  const getTile = useCallback((varietyIdx, stageIdx) => {
    return tiles[`${varietyIdx}-${stageIdx}`] || null;
  }, [tiles]);

  const getTileForPlant = useCallback((plantId, stageIdx) => {
    const varietyIdx = TOMATO_TILE_MAP[plantId];
    if (varietyIdx === undefined) return null;
    // Clamp stageIdx to valid tile range (0-4)
    const safeStage = Math.min(Math.max(stageIdx, 0), MAX_TILE_STAGE);
    return tiles[`${varietyIdx}-${safeStage}`] || null;
  }, [tiles]);

  return {
    tiles,
    loaded,
    progress: 1,
    getTile,
    getTileForPlant,
    isTomato: (plantId) => plantId in TOMATO_TILE_MAP,
    tileW: Math.round(TILE_W - CROP_SIDE_PAD * 2),
    tileH: Math.round((TILE_W - CROP_SIDE_PAD * 2) * CROP_ASPECT),
    totalCount: ROWS * COLS,
  };
}

// ── TILE ENGINE HOOK v3 ──────────────────────────────────────────────
// Moteur de rendu isométrique basé sur les tilesets pixel art
//
// Charge les 2 tilesets:
//   1. 01_terrain_tileset.jpg → bloc de terre isométrique (base vide)
//   2. S01_tomates1.jpg → sprites plantes (4 variétés × 5 stades)
//
// Génère:
//   - terrainTile: le bloc terrain seul (pour cellules vides)
//   - plantTiles["row-col"]: bloc terrain + sprite plante fusionnés
//   - Dimensions pour positionnement dans la grille
//
// Le moteur gère ses propres 5 stades (colonne 0→4 du tileset),
// indépendant de GROWTH_STAGES (6 stades SVG fallback).

import { useState, useEffect, useCallback, useRef } from 'react';

const TERRAIN_URL = '/tileset/01_terrain_tileset.jpg';
const PLANT_URL = '/tileset/stades-serre/S01_tomates1.jpg';

// ── Terrain tileset layout ──
const TERRAIN = { x: 356, y: 116, w: 295, h: 279 };
const T_BG = { r: 24, g: 31, b: 57 };

// ── Plant tileset layout ──
const P_W = 1344, P_H = 768, P_TITLE = 50;
const P_ROWS = 4, P_COLS = 5;
const P_TW = P_W / P_COLS;
const P_TH = (P_H - P_TITLE) / P_ROWS;
const P_BG = { r: 26, g: 22, b: 39 };

const BG_DIST = 50;
const BG_FEATHER = 25;

export const TOMATO_TILE_MAP = {
  'tomate-coeur-de-boeuf': 0,
  'tomate-cerise': 1,
  'tomate-roma': 2,
  'tomate-ananas': 3,
  'tomate-noire-de-crimee': 0,
};
export const TILESET_STAGE_COUNT = P_COLS; // 5

// ── Helpers ──
function killBg(ctx, w, h, bg) {
  const id = ctx.getImageData(0, 0, w, h);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const dist = Math.sqrt((d[i]-bg.r)**2 + (d[i+1]-bg.g)**2 + (d[i+2]-bg.b)**2);
    if (dist < BG_DIST) d[i+3] = 0;
    else if (dist < BG_DIST + BG_FEATHER) d[i+3] = Math.round(d[i+3] * ((dist - BG_DIST) / BG_FEATHER));
  }
  ctx.putImageData(id, 0, 0);
}

// ── Module cache ──
let _cache = null;
let _loading = false;
let _subs = [];
function _emit() { _subs.forEach(fn => fn(_cache)); _subs = []; }

function _build() {
  if (_cache || _loading) return;
  _loading = true;
  let tImg, pImg, tOk = false, pOk = false;

  function tryAssemble() {
    if (!tOk || !pOk) return;
    const tiles = {};

    // 1) Extraire bloc terrain avec fond supprimé
    const tCvs = document.createElement('canvas');
    const tCtx = tCvs.getContext('2d');
    tCvs.width = TERRAIN.w; tCvs.height = TERRAIN.h;
    tCtx.imageSmoothingEnabled = false;
    tCtx.drawImage(tImg, TERRAIN.x, TERRAIN.y, TERRAIN.w, TERRAIN.h, 0, 0, TERRAIN.w, TERRAIN.h);
    killBg(tCtx, TERRAIN.w, TERRAIN.h, T_BG);

    // Trouver la bbox utile (sans le fond transparent)
    const td = tCtx.getImageData(0, 0, TERRAIN.w, TERRAIN.h).data;
    let x0 = TERRAIN.w, x1 = 0, y0 = TERRAIN.h, y1 = 0;
    for (let py = 0; py < TERRAIN.h; py++)
      for (let px = 0; px < TERRAIN.w; px++)
        if (td[(py * TERRAIN.w + px) * 4 + 3] > 0) {
          if (px < x0) x0 = px; if (px > x1) x1 = px;
          if (py < y0) y0 = py; if (py > y1) y1 = py;
        }
    const bw = x1 - x0 + 1, bh = y1 - y0 + 1;

    // Terrain recadré
    const tClean = document.createElement('canvas');
    const tCleanCtx = tClean.getContext('2d');
    tClean.width = bw; tClean.height = bh;
    tCleanCtx.imageSmoothingEnabled = false;
    tCleanCtx.drawImage(tCvs, x0, y0, bw, bh, 0, 0, bw, bh);
    const terrainTile = tClean.toDataURL('image/png');

    // Position du diamond top dans le bloc terrain (ratio)
    const diamondTopRatio = (y0 === 0) ? 0.32 : y0 / TERRAIN.h;

    // 2) Pour chaque sprite plante, fusionner sur le terrain
    for (let row = 0; row < P_ROWS; row++) {
      for (let col = 0; col < P_COLS; col++) {
        // Extraire sprite
        const sCvs = document.createElement('canvas');
        const sCtx = sCvs.getContext('2d');
        const sw = Math.round(P_TW - 20), sh = Math.round((P_TH - 4) * 0.62);
        sCvs.width = sw; sCvs.height = sh;
        sCtx.imageSmoothingEnabled = false;
        sCtx.drawImage(pImg, col * P_TW + 10, P_TITLE + row * P_TH + 4, P_TW - 20, (P_TH - 4) * 0.62, 0, 0, sw, sh);
        killBg(sCtx, sw, sh, P_BG);

        // Taille du sprite à l'échelle du terrain
        const scale = 0.4 + col * 0.19; // 0.4 → 1.16
        const drawW = bw * (0.45 + scale * 0.35);
        const drawH = drawW * 0.85;

        // Zone sprite au-dessus du terrain
        const spriteH = Math.round(drawH * (col === 0 ? 0.5 : 0.75) + 8);
        const fW = bw, fH = spriteH + bh;

        const fCvs = document.createElement('canvas');
        const fCtx = fCvs.getContext('2d');
        fCvs.width = fW; fCvs.height = fH;
        fCtx.imageSmoothingEnabled = false;

        // Terrain en bas
        fCtx.drawImage(tClean, 0, 0, bw, bh, 0, spriteH, bw, bh);

        // Sprite centré au-dessus
        const sprX = (fW - drawW) / 2;
        const sprY = col === 0
          ? spriteH + bh * diamondTopRatio - drawH * 0.3
          : spriteH + bh * diamondTopRatio - drawH * 0.8;

        // Ombre
        if (col > 0) {
          fCtx.fillStyle = 'rgba(0,0,0,0.15)';
          fCtx.beginPath();
          fCtx.ellipse(fW/2, spriteH + bh * diamondTopRatio + 2, drawW * 0.22, drawW * 0.04, 0, 0, Math.PI*2);
          fCtx.fill();
        }

        fCtx.drawImage(sCvs, 0, 0, sw, sh, sprX, sprY, drawW, drawH);

        // Barre de progression
        if (col > 0) {
          fCtx.fillStyle = 'rgba(0,0,0,0.3)';
          fCtx.fillRect(fW * 0.7, spriteH + bh - bh * 0.15, 12, 2);
          fCtx.fillStyle = ['#4a9e20','#2e7d32','#388e3c','#43a047'][Math.min(col-1,3)];
          fCtx.fillRect(fW * 0.7, spriteH + bh - bh * 0.15, 12 * col / P_COLS, 2);
        }

        tiles[`${row}-${col}`] = fCvs.toDataURL('image/png');
      }
    }

    _cache = {
      tiles,
      terrainTile,
      loaded: true,
      // Dimensions du bloc terrain recadré
      blockW: bw,
      blockH: bh,
      diamondTopRatio,
      // Taille max d'une tuile fusionnée (pour calcul du viewport)
      maxSpriteH: Math.round(bw * 0.85 * 0.75 + 8 + bh * 0.32 + bh),
    };
    _loading = false;
    _emit();
  }

  const loadImg = (url, onDone) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => onDone(img);
    img.onerror = () => {
      console.warn('[TileEngine] Load failed:', url);
      if (!_cache) { _cache = { tiles: {}, loaded: true }; _loading = false; _emit(); }
    };
    img.src = url;
  };

  loadImg(TERRAIN_URL, img => { tImg = img; tOk = true; tryAssemble(); });
  loadImg(PLANT_URL, img => { pImg = img; pOk = true; tryAssemble(); });
}

export default function useTileEngine() {
  const [state, setState] = useState(_cache || { tiles: {}, loaded: false });
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    if (_cache?.loaded) { setState(_cache); return; }
    _subs.push(d => setState(d));
    _build();
  }, []);

  const getPlantTile = useCallback((plantId, stageIdx) => {
    const vi = TOMATO_TILE_MAP[plantId];
    if (vi === undefined) return null;
    const si = Math.min(Math.max(stageIdx, 0), P_COLS - 1);
    return state.tiles?.[`${vi}-${si}`] || null;
  }, [state.tiles]);

  const isTomato = useCallback((plantId) => plantId in TOMATO_TILE_MAP, []);

  return {
    ...state,
    getPlantTile,
    isTomato,
    ready: state.loaded && !!state.terrainTile,
  };
}

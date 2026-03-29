// ── TILE ENGINE HOOK v5 ──────────────────────────────────────────────
// Moteur de rendu isométrique basé sur les tilesets pixel art
//
// Charge les 2 tilesets:
//   1. 01_terrain_tileset.jpg → bloc de terre isométrique (base vide)
//   2. S01_tomates1.jpg → sprites plantes (4 variétés × 5 stades)
//
// Génère:
//   - terrainTile: le bloc terrain seul (pour cellules vides)
//   - plantTiles["row-col"]: bloc terrain + sprite plante fusionnés
//
// Améliorations v5:
//   - Bordure de bleed (dépassement) pour découpage propre anti-aliasing
//   - Fond transparent avec alpha graduel pour bords lisses
//   - Outline sombre autour des plantes pour coupe visuelle nette
//   - Recadrage automatique avec marge de bleed

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

// ── Seuil de detection fond (plus tolerant pour antialiasing) ──
const BG_DIST = 55;     // distance max pour supprimmer fond
const BG_FEATHER = 30;   // degrader en bord de fond

// ── Marge de bleed pour extraction propre ──
const BLEED = 4;         // pixels de depassement pour eviter coupe brutale
const OUTLINE_WIDTH = 2; // epaisseur du contour sombre
const OUTLINE_COLOR = { r: 5, g: 15, b: 5 };

export const TOMATO_TILE_MAP = {
  'tomate-coeur-de-boeuf': 0,
  'tomate-cerise': 1,
  'tomate-roma': 2,
  'tomate-ananas': 3,
  'tomate-noire-de-crimee': 0,
};
export const TILESET_STAGE_COUNT = P_COLS; // 5

// ──────────────────────────────────────────────────────────────────────
// Extrait un sprite du tileset avec bordure de bleed + fond transparent
// Rend un canvas avec zone transparente autour du sprite utile
// ──────────────────────────────────────────────────────────────────────
function extractSprite(srcImg, srcX, srcY, srcW, srcH, bg, bleed = BLEED) {
  // Extraire avec marge de bleed
  const margin = bleed;
  const canvas = document.createElement('canvas');
  canvas.width = srcW + margin * 2;
  canvas.height = srcH + margin * 2;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Dessiner avec bleed (depassement)
  ctx.drawImage(srcImg, srcX - margin, srcY - margin, srcW + margin * 2, srcH + margin * 2,
                0, 0, srcW + margin * 2, srcH + margin * 2);

  // Supprimer fond avec degrade alpha
  killBg(ctx, canvas.width, canvas.height, bg);

  return canvas;
}

// ──────────────────────────────────────────────────────────────────────
// Supprime le fond avec alpha graduel pour bords lisses (pas de crenelage)
// ──────────────────────────────────────────────────────────────────────
function killBg(ctx, w, h, bg) {
  const id = ctx.getImageData(0, 0, w, h);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const dist = Math.sqrt((d[i] - bg.r) ** 2 + (d[i + 1] - bg.g) ** 2 + (d[i + 2] - bg.b) ** 2);
    if (dist < BG_DIST) {
      d[i + 3] = 0; // transparent
    } else if (dist < BG_DIST + BG_FEATHER) {
      // Degrade lineaire vers transparent pour evitrer crenelage
      const t = (dist - BG_DIST) / BG_FEATHER;
      d[i + 3] = Math.round(d[i + 3] * t);
    }
  }
  ctx.putImageData(id, 0, 0);
}

// ──────────────────────────────────────────────────────────────────────
// Calcule la bounding box du sprite (sans pixels entierement transparents)
// Retourne { x, y, w, h } relatif au canvas source
// ──────────────────────────────────────────────────────────────────────
function getSpriteBBox(ctx, w, h) {
  const d = ctx.getImageData(0, 0, w, h).data;
  let x0 = w, x1 = 0, y0 = h, y1 = 0;
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      if (d[(py * w + px) * 4 + 3] > 5) {
        if (px < x0) x0 = px;
        if (px > x1) x1 = px;
        if (py < y0) y0 = py;
        if (py > y1) y1 = py;
      }
    }
  }
  if (x0 > x1) return null; // sprite vide
  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

// ──────────────────────────────────────────────────────────────────────
// Dessine un outline sombre autour du sprite (en dernier calque, sous le sprite)
// but: donner une coupe visuelle nette entre la plante et le fond
// ──────────────────────────────────────────────────────────────────────
function drawOutline(ctx, spriteBbox, ox, oy, outlineW, outlineC) {
  if (!spriteBbox) return;

  const { x: bx, y: by, w: bw, h: bh } = spriteBbox;

  // Parcourir uniquement la bbox du sprite (optimise)
  for (let sy = 0; sy < bh; sy++) {
    for (let sx = 0; sx < bw; sx++) {
      const px = bx + sx, py = by + sy;
      const i = (py * ctx.canvas.width + px) * 4;

      // Si pixel opaque (partie du sprite)
      if (i >= 0 && i < ctx.canvas.width * ctx.canvas.height * 4 && ctx.getImageData(px, py, 1, 1).data[3] > 40) {
        // Verifier si c'est un pixel de bord (voisin transparent)
        const isEdge = (
          px === bx || px === bx + bw - 1 || py === by || py === by + bh - 1 ||
          (px > 0 && ctx.getImageData(px - 1, py, 1, 1).data[3] < 40) ||
          (px < ctx.canvas.width - 1 && ctx.getImageData(px + 1, py, 1, 1).data[3] < 40) ||
          (py > 0 && ctx.getImageData(px, py - 1, 1, 1).data[3] < 40) ||
          (py < ctx.canvas.height - 1 && ctx.getImageData(px, py + 1, 1, 1).data[3] < 40)
        );

        if (isEdge) {
          // Dessiner le contour sombre autour du pixel de bord
          for (let lx = -outlineW; lx <= outlineW; lx++) {
            for (let ly = -outlineW; ly <= outlineW; ly++) {
              if (lx === 0 && ly === 0) continue;
              const destX = ox + px;
              const destY = oy + py;
              if (destX >= 0 && destX < ctx.canvas.width && destY >= 0 && destY < ctx.canvas.height) {
                const di = (destY * ctx.canvas.width + destX) * 4;
                if (di >= 0 && di < ctx.canvas.width * ctx.canvas.height * 4) {
                  const existing = ctx.getImageData(destX, destY, 1, 1).data;
                  if (existing[3] < 20) { // uniquement si transparent
                    ctx.fillStyle = `rgba(${outlineC.r},${outlineC.g},${outlineC.b},0.75)`;
                    ctx.fillRect(destX, destY, 1, 1);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
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

    // ── 1) Extraire bloc terrain avec bleed + fond transparent ──
    const tSprite = extractSprite(tImg, TERRAIN.x, TERRAIN.y, TERRAIN.w, TERRAIN.h, T_BG, BLEED);
    const tCtx = tSprite.getContext('2d');
    const bbox = getSpriteBBox(tCtx, tSprite.width, tSprite.height);
    if (!bbox) {
      console.warn('[TileEngine] Terrain sprite vide');
      _cache = { tiles: {}, loaded: true };
      _loading = false;
      _emit();
      return;
    }

    // Dimensions terrain recadré (avec marge de bleed)
    const bw = bbox.w, bh = bbox.h;

    // Canvas terrain propre avec juste le sprite utile
    const tClean = document.createElement('canvas');
    const tCleanCtx = tClean.getContext('2d');
    tClean.width = bw + OUTLINE_WIDTH * 2;
    tClean.height = bh + OUTLINE_WIDTH * 2;
    tCleanCtx.imageSmoothingEnabled = false;

    // Dessiner outline terrain d'abord
    drawOutline(tCtx, bbox, OUTLINE_WIDTH, OUTLINE_WIDTH, OUTLINE_WIDTH, OUTLINE_COLOR);

    // Terrain propre
    tCleanCtx.drawImage(tSprite, bbox.x, bbox.y, bbox.w, bbox.h,
                        OUTLINE_WIDTH, OUTLINE_WIDTH, bbox.w, bbox.h);

    const terrainTile = tClean.toDataURL('image/png');

    // Ratio de la pointe du diamond par rapport à la hauteur totale du bloc terrain
    // Le diamond top est en haut du bloc utile
    const diamondTopRatio = bbox.y / tSprite.height;

    // ── 2) Pour chaque sprite plante, fusionner sur le terrain ──
    for (let row = 0; row < P_ROWS; row++) {
      for (let col = 0; col < P_COLS; col++) {
        // Extraire sprite plante avec bleed
        const sSprite = extractSprite(
          pImg,
          col * P_TW + 10,
          P_TITLE + row * P_TH + 4,
          P_TW - 20,
          (P_TH - 4),
          P_BG,
          BLEED
        );
        const sCtx = sSprite.getContext('2d');
        const sBbox = getSpriteBBox(sCtx, sSprite.width, sSprite.height);

        // Taille du sprite à l'échelle du terrain
        const scale = 0.4 + col * 0.19; // 0.4 → 1.16
        const drawW = bw * (0.45 + scale * 0.35);
        const drawH = drawW * 0.85;

        // Zone sprite au-dessus du terrain (selon stade)
        const spriteH = Math.round(drawH * (col === 0 ? 0.5 : 0.75) + 8);
        const fW = bw + OUTLINE_WIDTH * 2;
        const fH = spriteH + bh + OUTLINE_WIDTH * 2;

        const fCvs = document.createElement('canvas');
        const fCtx = fCvs.getContext('2d');
        fCvs.width = fW; fCvs.height = fH;
        fCtx.imageSmoothingEnabled = false;

        // Position terrain en bas
        const terrainOffsetX = OUTLINE_WIDTH;
        const terrainOffsetY = spriteH + OUTLINE_WIDTH;

        // Terrain en bas
        fCtx.drawImage(tClean, terrainOffsetX, terrainOffsetY, bw, bh);

        // Position et taille du sprite dessiné
        const sprDrawW = drawW + OUTLINE_WIDTH * 2;
        const sprDrawH = drawH + OUTLINE_WIDTH * 2;
        const sprX = terrainOffsetX + (bw - sprDrawW) / 2;
        const sprY = col === 0
          ? terrainOffsetY + bh * diamondTopRatio - drawH * 0.3 - OUTLINE_WIDTH
          : terrainOffsetY + bh * diamondTopRatio - drawH * 0.8 - OUTLINE_WIDTH;

        // Ombre sous la plante (stade 1+)
        if (col > 0 && sBbox) {
          fCtx.fillStyle = 'rgba(0,0,0,0.15)';
          fCtx.beginPath();
          fCtx.ellipse(
            terrainOffsetX + bw / 2,
            terrainOffsetY + bh * diamondTopRatio + 2,
            drawW * 0.22,
            drawW * 0.04,
            0, 0, Math.PI * 2
          );
          fCtx.fill();
        }

        // Dessiner outline sombre autour du sprite (derniere couche sous le sprite)
        if (sBbox) {
          drawOutline(sCtx, sBbox, sprX + OUTLINE_WIDTH, sprY + OUTLINE_WIDTH, OUTLINE_WIDTH, OUTLINE_COLOR);
        }

        // Dessiner le sprite plante
        fCtx.drawImage(sSprite, sprX + OUTLINE_WIDTH, sprY + OUTLINE_WIDTH, drawW, drawH);

        // Barre de progression (stade 1+)
        if (col > 0) {
          const barX = terrainOffsetX + bw * 0.7;
          const barY = terrainOffsetY + bh - bh * 0.15;
          fCtx.fillStyle = 'rgba(0,0,0,0.3)';
          fCtx.fillRect(barX, barY, 12, 2);
          fCtx.fillStyle = ['#4a9e20', '#2e7d32', '#388e3c', '#43a047'][Math.min(col - 1, 3)];
          fCtx.fillRect(barX, barY, 12 * col / P_COLS, 2);
        }

        tiles[`${row}-${col}`] = fCvs.toDataURL('image/png');
      }
    }

    _cache = {
      tiles,
      terrainTile,
      loaded: true,
      blockW: bw,
      blockH: bh,
      diamondTopRatio,
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

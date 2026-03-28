// ── TILE FUSION HOOK v2 ──────────────────────────────────────────────
// Fusionne le vrai bloc de terre isométrique (01_terrain_tileset.jpg)
// avec le sprite plante (S01_tomates1.jpg) en une seule image PNG
//
// Pipeline :
// 1. Charge 01_terrain_tileset.jpg → extrait le bloc isométrique pixel art
// 2. Charge S01_tomates1.jpg → extrait le sprite plante, supprime le fond JPEG
// 3. Fusionne : bloc de terre (base) + sprite (overlay) = tuile composite
// 4. Cache module-level → survit aux remounts

import { useState, useEffect, useCallback, useRef } from 'react';

// ── URLs ──
const TERRAIN_URL = '/tileset/01_terrain_tileset.jpg';
const PLANT_URL = '/tileset/stades-serre/S01_tomates1.jpg';

// ── Terrain tileset : bloc isométrique (01_terrain_tileset.jpg) ──
// Layout: 1344×768, bg=(24,31,57)
// 4 blocs isométriques dans la section y=116-396
// On utilise le bloc 1 (x=356-651) — le plus propre et standard
const TERRAIN_BLOCK = { x: 356, y: 116, w: 295, h: 279 };
// Fond du terrain à supprimer
const T_BG_R = 24, T_BG_G = 31, T_BG_B = 57;

// ── Plant tileset : S01_tomates1.jpg ──
const P_IMG_W = 1344;
const P_IMG_H = 768;
const P_TITLE_H = 50;
const P_ROWS = 4;
const P_COLS = 5;
const P_TILE_W = P_IMG_W / P_COLS;
const P_TILE_H = (P_IMG_H - P_TITLE_H) / P_ROWS;
// Fond du plant tileset
const P_BG_R = 26, P_BG_G = 22, P_BG_B = 39;

// ── Seuillage couleur pour suppression du fond ──
const BG_THRESHOLD = 50;
const BG_FEATHER = 25;

// ── Dimensions du bloc SVG dans App.jsx ──
const TW = 64;
const TH = 32;
const TD = 22;

// ── Carte variétés tomates ──
export const TOMATO_TILE_MAP = {
  'tomate-coeur-de-boeuf': 0,
  'tomate-cerise': 1,
  'tomate-roma': 2,
  'tomate-ananas': 3,
  'tomate-noire-de-crimee': 0,
};

const MAX_TILE_STAGE = P_COLS - 1; // 4

// Échelle visuelle pour chaque stade (0→4)
const STAGE_SCALES = [0.4, 0.55, 0.75, 0.95, 1.15];

// ── Suppression du fond par seuillage couleur ──
function removeBackground(ctx, w, h, bgR, bgG, bgB) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
    if (dist < BG_THRESHOLD) {
      data[i + 3] = 0;
    } else if (dist < BG_THRESHOLD + BG_FEATHER) {
      const t = (dist - BG_THRESHOLD) / BG_FEATHER;
      data[i + 3] = Math.round(data[i + 3] * t);
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

// ── Cache module-level ──
let _cache = null;
let _loading = false;
let _listeners = [];

function _notify() {
  _listeners.forEach(fn => fn(_cache));
  _listeners = [];
}

function _loadFusedTiles() {
  if (_cache || _loading) return;
  _loading = true;

  // Charger les 2 images en parallèle
  let terrainLoaded = false;
  let plantLoaded = false;
  let terrainImg, plantImg;

  function tryBuild() {
    if (!terrainLoaded || !plantLoaded) return;

    const tiles = {};

    // ─ Étape 1 : extraire le bloc terrain avec fond transparent ─
    const terrainCanvas = document.createElement('canvas');
    const terrainCtx = terrainCanvas.getContext('2d');
    terrainCanvas.width = TERRAIN_BLOCK.w;
    terrainCanvas.height = TERRAIN_BLOCK.h;
    terrainCtx.imageSmoothingEnabled = false;
    terrainCtx.drawImage(
      terrainImg,
      TERRAIN_BLOCK.x, TERRAIN_BLOCK.y,
      TERRAIN_BLOCK.w, TERRAIN_BLOCK.h,
      0, 0, TERRAIN_BLOCK.w, TERRAIN_BLOCK.h
    );
    // Supprimer le fond du bloc terrain
    removeBackground(terrainCtx, TERRAIN_BLOCK.w, TERRAIN_BLOCK.h, T_BG_R, T_BG_G, T_BG_B);

    // Trouver les limites utiles du bloc (bbox non-transparent)
    const terrainData = terrainCtx.getImageData(0, 0, TERRAIN_BLOCK.w, TERRAIN_BLOCK.h);
    const td = terrainData.data;
    let minX = TERRAIN_BLOCK.w, maxX = 0, minY = TERRAIN_BLOCK.h, maxY = 0;
    for (let py = 0; py < TERRAIN_BLOCK.h; py++) {
      for (let px = 0; px < TERRAIN_BLOCK.w; px++) {
        if (td[(py * TERRAIN_BLOCK.w + px) * 4 + 3] > 0) {
          if (px < minX) minX = px;
          if (px > maxX) maxX = px;
          if (py < minY) minY = py;
          if (py > maxY) maxY = py;
        }
      }
    }
    const tbW = maxX - minX + 1;
    const tbH = maxY - minY + 1;

    // Recadrer le bloc terrain sur sa bbox utile
    const terrainClean = document.createElement('canvas');
    const terrainCleanCtx = terrainClean.getContext('2d');
    terrainClean.width = tbW;
    terrainClean.height = tbH;
    terrainCleanCtx.imageSmoothingEnabled = false;
    terrainCleanCtx.drawImage(terrainCanvas, minX, minY, tbW, tbH, 0, 0, tbW, tbH);

    // Le bloc terrain fait tbW × tbH (≈290×270)
    // La face top du diamond commence à environ 35% depuis le haut
    // et le bloc a une profondeur (sides) d'environ 30% en bas
    const topFaceY = Math.round(tbH * 0.32); // où commence la face supérieure du diamond
    const depthH = Math.round(tbH * 0.28);   // hauteur des faces latérales (dirt)

    // ─ Étape 2 : fusionner chaque sprite plante sur le bloc terrain ─
    for (let row = 0; row < P_ROWS; row++) {
      for (let col = 0; col < P_COLS; col++) {
        const stageKey = `${row}-${col}`;

        // Extraire le sprite plante
        const srcX = col * P_TILE_W + 10;
        const srcY = P_TITLE_H + row * P_TILE_H + 4;
        const srcW = P_TILE_W - 20;
        const srcH = (P_TILE_H - 4) * 0.62;

        const sprCanvas = document.createElement('canvas');
        const sprCtx = sprCanvas.getContext('2d');
        const sprW = Math.round(srcW);
        const sprH = Math.round(srcH);
        sprCanvas.width = sprW;
        sprCanvas.height = sprH;
        sprCtx.imageSmoothingEnabled = false;
        sprCtx.drawImage(plantImg, srcX, srcY, srcW, srcH, 0, 0, sprW, sprH);
        removeBackground(sprCtx, sprW, sprH, P_BG_R, P_BG_G, P_BG_B);

        // ─ Taille du sprite adaptée au bloc ─
        const scale = STAGE_SCALES[col] || 1;
        const baseSprSize = tbW * 0.55;
        const drawW = baseSprSize * (0.5 + scale * 0.5);
        const drawH = drawW * 0.9;

        // ─ Canvas fusionné ─
        // Le bloc terrain prend toute la largeur
        // Le sprite est au-dessus de la face top
        const spriteArea = Math.round(drawH * 0.7 + (col === 0 ? drawH * 0.15 : drawH * 0.5));
        const fusedW = tbW;
        const fusedH = spriteArea + tbH;

        const fusedCanvas = document.createElement('canvas');
        const fusedCtx = fusedCanvas.getContext('2d');
        fusedCanvas.width = fusedW;
        fusedCanvas.height = fusedH;
        fusedCtx.clearRect(0, 0, fusedW, fusedH);
        fusedCtx.imageSmoothingEnabled = false;

        // Dessiner le bloc terrain en bas
        fusedCtx.drawImage(terrainClean, 0, 0, tbW, tbH, 0, spriteArea, tbW, tbH);

        // Position du sprite : centré, au-dessus de la face top du diamond
        const spriteX = (fusedW - drawW) / 2;
        const isInDirt = col === 0;
        const spriteY = isInDirt
          ? spriteArea + topFaceY - drawH * 0.35
          : spriteArea + topFaceY - drawH * 0.85;

        // Ombre douce sous le sprite
        if (!isInDirt) {
          fusedCtx.fillStyle = 'rgba(0,0,0,0.15)';
          fusedCtx.beginPath();
          const shRx = drawW * 0.25 + scale * 3;
          const shRy = shRx * 0.2;
          fusedCtx.ellipse(fusedW / 2, spriteArea + topFaceY + 3, shRx, shRy, 0, 0, Math.PI * 2);
          fusedCtx.fill();
        }

        // Sprite
        fusedCtx.drawImage(sprCanvas, 0, 0, sprW, sprH, spriteX, spriteY, drawW, drawH);

        // Barre de progression (sur le bord droit du dirt)
        if (col > 0) {
          const barX = fusedW * 0.7;
          const barY = spriteArea + tbH - depthH * 0.5;
          fusedCtx.fillStyle = 'rgba(0,0,0,0.3)';
          fusedCtx.fillRect(barX, barY, 14, 2);
          const prog = col / P_COLS;
          fusedCtx.fillStyle = ['#4a9e20','#2e7d32','#388e3c','#43a047'][Math.min(col, 3)];
          fusedCtx.fillRect(barX, barY, 14 * prog, 2);
        }

        tiles[stageKey] = fusedCanvas.toDataURL('image/png');
      }
    }

    _cache = { tiles, loaded: true, terrainW: tbW, terrainH: tbH, spriteArea };
    _loading = false;
    _notify();
  }

  // Charger terrain
  const terrainImgEl = new Image();
  terrainImgEl.crossOrigin = 'anonymous';
  terrainImgEl.onload = () => {
    terrainImg = terrainImgEl;
    terrainLoaded = true;
    tryBuild();
  };
  terrainImgEl.onerror = () => {
    console.warn('[TileFusion] Impossible de charger le terrain:', TERRAIN_URL);
    _cache = { tiles: {}, loaded: true };
    _loading = false;
    _notify();
  };
  terrainImgEl.src = TERRAIN_URL;

  // Charger plantes
  const plantImgEl = new Image();
  plantImgEl.crossOrigin = 'anonymous';
  plantImgEl.onload = () => {
    plantImg = plantImgEl;
    plantLoaded = true;
    tryBuild();
  };
  plantImgEl.onerror = () => {
    console.warn('[TileFusion] Impossible de charger les plantes:', PLANT_URL);
    _cache = { tiles: {}, loaded: true };
    _loading = false;
    _notify();
  };
  plantImgEl.src = PLANT_URL;
}

export default function useTileFusion() {
  const [tiles, setTiles] = useState(_cache?.tiles || {});
  const [loaded, setLoaded] = useState(_cache?.loaded || false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    if (_cache?.loaded) {
      setTiles(_cache.tiles);
      setLoaded(true);
      return;
    }

    _listeners.push((data) => {
      setTiles(data.tiles);
      setLoaded(data.loaded);
    });

    _loadFusedTiles();
  }, []);

  const getTileForPlant = useCallback((plantId, stageIdx) => {
    const varietyIdx = TOMATO_TILE_MAP[plantId];
    if (varietyIdx === undefined) return null;
    const safeStage = Math.min(Math.max(stageIdx, 0), MAX_TILE_STAGE);
    return tiles[`${varietyIdx}-${safeStage}`] || null;
  }, [tiles]);

  return {
    tiles,
    loaded,
    getTileForPlant,
    isTomato: (plantId) => plantId in TOMATO_TILE_MAP,
    terrainW: _cache?.terrainW || 290,
    terrainH: _cache?.terrainH || 270,
    spriteArea: _cache?.spriteArea || 45,
  };
}

// ── TILE FUSION HOOK ─────────────────────────────────────────────────
// Fusionne le bloc de terre isométrique + sprite plante en une seule image PNG
//
// Problème résolu : les sprites JPEG ont un fond sombre opaque (RGB ~26,22,39)
// qui couvre le bloc SVG en dessous. La fusion résout ça en :
// 1. Dessinant le bloc de terre en Canvas (mêmes couleurs que le SVG)
// 2. Extrayant le sprite et supprimant le fond via seuillage couleur
// 3. Compositant le sprite transparent sur le bloc de terre
// 4. Exportant une seule image PNG composite
//
// Résultat : une <image> SVG unique remplace tous les polygons + overlay

import { useState, useEffect, useCallback, useRef } from 'react';

const TILESET_URL = '/tileset/stades-serre/S01_tomates1.jpg';
const IMG_W = 1344;
const IMG_H = 768;
const TITLE_H = 50;
const ROWS = 4;
const COLS = 5;
const TILE_W = IMG_W / COLS;              // ~268.8
const TILE_H = (IMG_H - TITLE_H) / ROWS;  // ~179.5

// Dimensions du bloc isométrique (doit matcher App.jsx)
const TW = 64;
const TH = 32;
const TD = 22;

// Couleur de fond du tileset à supprimer (violet sombre)
const BG_R = 26, BG_G = 22, BG_B = 39;
const BG_THRESHOLD = 48;
const BG_FEATHER = 20;

// Carte des variétés de tomates → index de ligne dans le tileset
export const TOMATO_TILE_MAP = {
  'tomate-coeur-de-boeuf': 0,
  'tomate-cerise': 1,
  'tomate-roma': 2,
  'tomate-ananas': 3,
  'tomate-noire-de-crimee': 0,
};

const MAX_TILE_STAGE = COLS - 1; // 4

// Échelle visuelle pour chaque stade (0→4)
const STAGE_SCALES = [0.4, 0.6, 0.8, 1.0, 1.2];

// Dimensions de la tuile fusionnée
const SPRITE_AREA = 38;                // hauteur max du sprite au-dessus du dirt
const FUSED_W = TW + 16;              // 80px — un peu de marge latérale
const FUSED_H = SPRITE_AREA + TH + TD; // 94px — sprite + dirt complet

// ── Couleurs du bloc de terre (copiées des patterns SVG) ──
const C = {
  dirtLeft:   '#8b5e3c',
  dirtRight:  '#6a4830',
  grassTop:   '#5aab2a',
  grassLight: '#62b830',
  grassDark:  '#4e9e22',
  grassEdge1: '#4a9e20',
  grassEdge2: '#3d8a18',
  soilSow:    '#7a5030',
  soilGerm:   '#8b5e3c',
  outline:    '#2d6e10',
  dirtLine:   '#3d2010',
};

// Couleur de lueur par stade
const GLOW = ['#8b5e3c', '#4a9e20', '#2e7d32', '#388e3c', '#43a047'];

// ── Dessin du bloc isométrique en Canvas ──
function drawIsoBlock(ctx, ox, oy, stageCol) {
  const hw = TW / 2;
  const hh = TH / 2;

  // ─ Face droite (plus sombre) ─
  ctx.beginPath();
  ctx.moveTo(ox, oy + TH);
  ctx.lineTo(ox + hw, oy + hh);
  ctx.lineTo(ox + hw, oy + hh + TD);
  ctx.lineTo(ox, oy + TH + TD);
  ctx.closePath();
  ctx.fillStyle = C.dirtRight;
  ctx.fill();
  // Texture
  ctx.fillStyle = 'rgba(90,60,36,0.3)';
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(ox + 2 + i * 6, oy + TH + 3 + (i % 3) * 5, 3, 1.5);
  }
  ctx.strokeStyle = C.dirtLine;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.3;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // ─ Face gauche (plus claire) ─
  ctx.beginPath();
  ctx.moveTo(ox - hw, oy + hh);
  ctx.lineTo(ox, oy + TH);
  ctx.lineTo(ox, oy + TH + TD);
  ctx.lineTo(ox - hw, oy + hh + TD);
  ctx.closePath();
  ctx.fillStyle = C.dirtLeft;
  ctx.fill();
  // Texture
  ctx.fillStyle = 'rgba(158,110,72,0.3)';
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(ox - hw + 3 + i * 5, oy + TH + 2 + (i % 3) * 6, 3, 1.5);
  }
  ctx.strokeStyle = C.dirtLine;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // ─ Bandes herbe sur les arêtes ─
  ctx.beginPath();
  ctx.moveTo(ox - hw, oy + hh);
  ctx.lineTo(ox, oy + TH);
  ctx.lineTo(ox, oy + TH + 5);
  ctx.lineTo(ox - hw, oy + hh + 5);
  ctx.closePath();
  ctx.fillStyle = C.grassEdge1;
  ctx.globalAlpha = 0.9;
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.beginPath();
  ctx.moveTo(ox, oy + TH);
  ctx.lineTo(ox + hw, oy + hh);
  ctx.lineTo(ox + hw, oy + hh + 5);
  ctx.lineTo(ox, oy + TH + 5);
  ctx.closePath();
  ctx.fillStyle = C.grassEdge2;
  ctx.globalAlpha = 0.9;
  ctx.fill();
  ctx.globalAlpha = 1;

  // ─ Créneaux herbe ─
  ctx.fillStyle = C.grassEdge2;
  for (let i = 0; i < 6; i++) {
    const t = i / 6;
    const bx = ox - hw + hw * t;
    const by = oy + hh + hh * t;
    if (i % 2 === 0) {
      ctx.fillRect(bx - 1, by - 1, 2.5, 4);
    }
    const bx2 = ox + hw * t * 0.5;
    const by2 = oy + TH - hh * t + hh;
    if (i % 2 === 1) {
      ctx.fillRect(bx2 - 1, by2 - 1, 2.5, 4);
    }
  }

  // ─ Face supérieure (diamond top) ─
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(ox + hw, oy + hh);
  ctx.lineTo(ox, oy + TH);
  ctx.lineTo(ox - hw, oy + hh);
  ctx.closePath();

  if (stageCol === 0) {
    // Terre avec sillons de semis
    ctx.fillStyle = C.soilSow;
    ctx.fill();
    ctx.strokeStyle = 'rgba(90,56,32,0.5)';
    ctx.lineWidth = 0.8;
    for (let s = 0; s < 3; s++) {
      const t = (s + 1) / 4;
      ctx.beginPath();
      ctx.moveTo(ox - hw * t, oy + hh * t);
      ctx.lineTo(ox + hw * t, oy + TH - hh * t);
      ctx.stroke();
    }
  } else if (stageCol === 1) {
    // Terre préparée (germination)
    ctx.fillStyle = C.soilGerm;
    ctx.fill();
  } else {
    // Herbe (stade 2+)
    ctx.fillStyle = C.grassTop;
    ctx.fill();
    ctx.fillStyle = C.grassDark;
    ctx.globalAlpha = 0.4;
    ctx.fill();
    ctx.globalAlpha = 1;
    // Taches claires
    ctx.fillStyle = C.grassLight;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(ox - 12, oy + 10, 5, 3);
    ctx.fillRect(ox + 6, oy + 7, 4, 2.5);
    ctx.fillRect(ox - 4, oy + 18, 3.5, 3);
    ctx.fillRect(ox + 10, oy + 16, 3, 2);
    ctx.globalAlpha = 1;
  }

  // Contour du top face
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(ox + hw, oy + hh);
  ctx.lineTo(ox, oy + TH);
  ctx.lineTo(ox - hw, oy + hh);
  ctx.closePath();
  ctx.strokeStyle = C.outline;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Cailloux décoratifs
  ctx.fillStyle = 'rgba(90,56,32,0.6)';
  ctx.beginPath();
  ctx.ellipse(ox - hw * 0.5, oy + TH + TD - 4, 2.5, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(74,48,24,0.5)';
  ctx.beginPath();
  ctx.ellipse(ox + hw * 0.3, oy + hh + TD - 3, 2, 1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lueur de croissance sur le top face
  if (stageCol > 0 && stageCol < GLOW.length) {
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + hw, oy + hh);
    ctx.lineTo(ox, oy + TH);
    ctx.lineTo(ox - hw, oy + hh);
    ctx.closePath();
    ctx.fillStyle = GLOW[stageCol];
    ctx.globalAlpha = 0.15 + stageCol * 0.08;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// ── Suppression du fond du sprite par seuillage couleur ──
function removeSpriteBackground(canvas, ctx) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const dist = Math.sqrt((r - BG_R) ** 2 + (g - BG_G) ** 2 + (b - BG_B) ** 2);
    if (dist < BG_THRESHOLD) {
      data[i + 3] = 0; // transparent
    } else if (dist < BG_THRESHOLD + BG_FEATHER) {
      // Adoucir les bords pour un blending plus doux
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

  const img = new Image();
  img.crossOrigin = 'anonymous';

  img.onload = () => {
    const tiles = {};

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        // ─ Zone source dans le tileset ─
        const srcX = col * TILE_W + 10;
        const srcY = TITLE_H + row * TILE_H + 4;
        const srcW = TILE_W - 20;
        const srcH = (TILE_H - 4) * 0.62; // on ne prend que le haut (le sprite, pas le label)

        // ─ Étape 1 : extraire le sprite et virer le fond ─
        const spriteCanvas = document.createElement('canvas');
        const spriteCtx = spriteCanvas.getContext('2d');
        const sprW = Math.round(srcW);
        const sprH = Math.round(srcH);
        spriteCanvas.width = sprW;
        spriteCanvas.height = sprH;
        spriteCtx.imageSmoothingEnabled = false;
        spriteCtx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, sprW, sprH);
        removeSpriteBackground(spriteCanvas, spriteCtx);

        // ─ Étape 2 : créer la tuile fusionnée ─
        const fusedCanvas = document.createElement('canvas');
        const fusedCtx = fusedCanvas.getContext('2d');
        fusedCanvas.width = FUSED_W;
        fusedCanvas.height = FUSED_H;
        // Fond transparent par défaut
        fusedCtx.clearRect(0, 0, FUSED_W, FUSED_H);

        // Dessiner le bloc de terre au centre-bas de la tuile
        const blockCx = FUSED_W / 2;
        const blockTopY = SPRITE_AREA;
        drawIsoBlock(fusedCtx, blockCx, blockTopY, col);

        // ─ Étape 3 : dessiner le sprite sur le bloc ─
        const scale = STAGE_SCALES[col] || 1;
        const drawW = TW * 0.48 + scale * 10;
        const drawH = drawW * 0.82;

        // Position : le sprite flotte au-dessus du bloc
        const isInDirt = col === 0;
        const spriteX = blockCx - drawW / 2;
        const spriteY = isInDirt
          ? blockTopY + TH * 0.1  // graine semi-enterrée
          : blockTopY - drawH + TH * 0.35; // flotte au-dessus

        // Ombre au sol
        if (!isInDirt) {
          fusedCtx.fillStyle = 'rgba(0,0,0,0.2)';
          fusedCtx.beginPath();
          const shRx = drawW * 0.28 + scale * 2;
          const shRy = shRx * 0.22;
          fusedCtx.ellipse(blockCx, blockTopY + 2, shRx, shRy, 0, 0, Math.PI * 2);
          fusedCtx.fill();
        }

        // Sprite avec fond transparent
        fusedCtx.imageSmoothingEnabled = false;
        fusedCtx.drawImage(spriteCanvas, 0, 0, sprW, sprH, spriteX, spriteY, drawW, drawH);

        // ─ Barre de progression sur le côté dirt ─
        if (col > 0 && col < COLS) {
          const barX = blockCx - 8;
          const barY = blockTopY + TH + TD - 7;
          fusedCtx.fillStyle = 'rgba(0,0,0,0.4)';
          fusedCtx.fillRect(barX, barY, 16, 2.5);
          fusedCtx.fillStyle = GLOW[col] || '#43a047';
          fusedCtx.fillRect(barX, barY, 16 * (col / COLS), 2.5);
        }

        // Badge PRÊTE pour le dernier stade
        if (col === COLS - 1) {
          const badgeX = blockCx - 13;
          const badgeY = spriteY - 2;
          // Badge PRÊTE
          if (fusedCtx.roundRect) {
            fusedCtx.beginPath();
            fusedCtx.roundRect(badgeX, badgeY, 26, 8, 2);
          } else {
            fusedCtx.beginPath();
            fusedCtx.rect(badgeX, badgeY, 26, 8);
          }
          fusedCtx.fillStyle = '#e63946';
          fusedCtx.fill();
          fusedCtx.strokeStyle = 'rgba(255,255,255,0.8)';
          fusedCtx.lineWidth = 0.5;
          fusedCtx.stroke();
          fusedCtx.fillStyle = '#fff';
          fusedCtx.font = 'bold 5px monospace';
          fusedCtx.textAlign = 'center';
          fusedCtx.fillText('PRÊTE!', blockCx, badgeY + 6);
        }

        tiles[`${row}-${col}`] = fusedCanvas.toDataURL('image/png');
      }
    }

    _cache = { tiles, loaded: true };
    _loading = false;
    _notify();
  };

  img.onerror = () => {
    console.warn('[TileFusion] Impossible de charger', TILESET_URL);
    _cache = { tiles: {}, loaded: true };
    _loading = false;
    _notify();
  };

  img.src = TILESET_URL;
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
    fusedW: FUSED_W,
    fusedH: FUSED_H,
    spriteArea: SPRITE_AREA,
  };
}

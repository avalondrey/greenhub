// ── TILE CUTTER HOOK v2 ────────────────────────────────────────────
// Découpe S01_tomates1.jpg en tuiles propres SANS labels texte
//
// Problème v1: les labels "TOMATE COEUR DE BOEUF" etc. traversaient dans le crop
// Fix v2: crop agressif sur la zone haute de chaque tuile (le sprite plante),
//          skip la zone basse (label texte), padding large sur les bords
//
// Architecture: TileSet → TileMap Engine
//   - TileSet  : spritesheet source (S01_tomates1.jpg)
//   - Tile cutter : découpe en tuiles individuelles (20 tiles)
//   - Cache : Map<tileKey, dataURL> pour rendu instantané

import { useState, useEffect, useCallback } from 'react';

const TILESET_URL = '/tileset/stades-serre/S01_tomates1.jpg';
const IMG_W = 1344;
const IMG_H = 768;
const TITLE_H = 50;           // zone titre "GREENHUB SERRE - TOMATES 1/2" à sauter
const ROWS = 4;
const COLS = 5;
const TILE_W = IMG_W / COLS;              // ~268.8
const TILE_H = (IMG_H - TITLE_H) / ROWS;  // ~179.5

// ── Crop intelligent : ne garde que le haut de chaque tuile (le sprite plante) ──
// Le label texte est en bas de chaque tuile → on ne prend que les ~65% du haut
const CROP_TOP_PAD = 6;     // petit padding en haut
const CROP_SIDE_PAD = 18;   // padding latéral pour virer les bordures
const CROP_BOTTOM_CUT = 0.38; // on coupe 38% du bas (là où sont les labels)
const CROP_ASPECT = 0.75;   // ratio largeur/hauteur du sprite final

export const VARIETY_NAMES = ['Coeur de Boeuf', 'Cerise', 'Roma', 'Ananas'];
export const STAGE_NAMES = ['Graine', 'Germination', 'Levée', 'Croissance', 'Prête'];

export const TOMATO_TILE_MAP = {
  'tomate-coeur-de-boeuf': 0,
  'tomate-cerise': 1,
  'tomate-roma': 2,
  'tomate-ananas': 3,
  'tomate-noire-de-crimee': 0,
};

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

export function exportToTMX(gridData) {
  const csvData = gridData.map(row => row.join(',')).join(',\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.5" tiledversion="1.10" orientation="isometric"
     width="4" height="6" tilewidth="128" tileheight="64" infinite="0">
  <tileset firstgid="1" name="tomato_stages" tilewidth="128" tileheight="64" tilecount="${ROWS * COLS}" columns="${COLS}">
    <image source="S01_tomates1.jpg" trans="0d1117" width="${IMG_W}" height="${IMG_H}"/>
  </tileset>
  <layer name="Ground" width="4" height="6">
    <data encoding="csv">
${csvData}
    </data>
  </layer>
</map>`;
}

export default function useTileCutter() {
  const [tiles, setTiles] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const cutTiles = {};
      let done = 0;
      const total = ROWS * COLS;

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          // Zone source dans l'image complète
          const srcX = col * TILE_W + CROP_SIDE_PAD;
          const srcY = TITLE_H + row * TILE_H + CROP_TOP_PAD;
          const srcW = TILE_W - CROP_SIDE_PAD * 2;
          const srcH = (TILE_H - CROP_TOP_PAD) * (1 - CROP_BOTTOM_CUT);

          // Canvas de sortie : carré pixel art propre
          const outW = Math.round(srcW);
          const outH = Math.round(outW * CROP_ASPECT);

          canvas.width = outW;
          canvas.height = outH;

          // Fond transparent
          ctx.clearRect(0, 0, outW, outH);

          // Activer le rendu pixel art net (désactiver l'anti-aliasing)
          ctx.imageSmoothingEnabled = false;

          // Dessiner le sprite découpé
          ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outW, outH);

          // Stocker en dataURL PNG (transparent)
          cutTiles[`${row}-${col}`] = canvas.toDataURL('image/png');
          done++;
          setProgress(done / total);
        }
      }

      setTiles(cutTiles);
      setLoaded(true);
    };
    img.onerror = () => {
      console.warn('[TileCutter] Impossible de charger', TILESET_URL);
      setLoaded(true);
    };
    img.src = TILESET_URL;

    return () => { img.onload = null; };
  }, []);

  const getTile = useCallback((varietyIdx, stageIdx) => {
    return tiles[`${varietyIdx}-${stageIdx}`] || null;
  }, [tiles]);

  const getTileForPlant = useCallback((plantId, stageIdx) => {
    const varietyIdx = TOMATO_TILE_MAP[plantId];
    if (varietyIdx === undefined) return null;
    return tiles[`${varietyIdx}-${stageIdx}`] || null;
  }, [tiles]);

  return {
    tiles,
    loaded,
    progress,
    getTile,
    getTileForPlant,
    isTomato: (plantId) => plantId in TOMATO_TILE_MAP,
    tileW: Math.round(TILE_W - CROP_SIDE_PAD * 2),
    tileH: Math.round((TILE_W - CROP_SIDE_PAD * 2) * CROP_ASPECT),
    totalCount: ROWS * COLS,
  };
}

// ── TILE CUTTER HOOK ──────────────────────────────────────────────
// Charge S01_tomates1.jpg, découpe les 20 tuiles (4 variétés × 5 stades)
// dans un Canvas caché, les stocke comme dataURL pour rendu SVG <image>
//
// Architecture: TileSet → TileMap Engine
//   - TileSet  : spritesheet source (S01_tomates1.jpg)
//   - Tile cutter : découpe en tuiles individuelles (20 tiles)
//   - Cache : Map<tileKey, dataURL> pour rendu instantané
//   - Utilisé par IsoTerrainBlock.renderPlant() en overlay des blocs terre

import { useState, useEffect, useRef, useCallback } from 'react';

const TILESET_URL = '/tileset/stades-serre/S01_tomates1.jpg';
const IMG_W = 1344;
const IMG_H = 768;
const TITLE_H = 46;       // zone titre à sauter
const ROWS = 4;            // 4 variétés de tomates
const COLS = 5;            // 5 stades de croissance
const TILE_W = IMG_W / COLS;           // ~269px par tuile
const TILE_H = (IMG_H - TITLE_H) / ROWS; // ~180px par tuile
const PAD = 8;              // padding interne pour virer les bordures de label

// ── Noms des tuiles pour le TileMap ──────────────────────────────
export const TILE_NAMES = [
  ['Coeur de Boeuf - Graine',     'Coeur de Boeuf - Germination', 'Coeur de Boeuf - Levée',     'Coeur de Boeuf - Croissance', 'Coeur de Boeuf - Prête'],
  ['Cerise - Graine',            'Cerise - Germination',         'Cerise - Levée',             'Cerise - Croissance',         'Cerise - Prête'],
  ['Roma - Graine',              'Roma - Germination',           'Roma - Levée',               'Roma - Croissance',           'Roma - Prête'],
  ['Ananas - Graine',            'Ananas - Germination',         'Ananas - Levée',             'Ananas - Croissance',         'Ananas - Prête'],
];

export const VARIETY_NAMES = ['Coeur de Boeuf', 'Cerise', 'Roma', 'Ananas'];
export const STAGE_NAMES = ['Graine', 'Germination', 'Levée', 'Croissance', 'Prête'];

// ── Map plantId → [varietyIndex, ...] ───────────────────────────
export const TOMATO_TILE_MAP = {
  'tomate-coeur-de-boeuf': 0,
  'tomate-cerise': 1,
  'tomate-roma': 2,
  'tomate-ananas': 3,
  'tomate-noire-de-crimee': 0, // fallback
};

// ── TileMap export data (format TMX-compatible) ──────────────────
// Chaque tuile a un GID (global ID) = row * COLS + col + 1
export function getTileGID(varietyIdx, stageIdx) {
  return varietyIdx * COLS + stageIdx + 1;
}

export function getTileProperties(gid) {
  const idx = gid - 1;
  const row = Math.floor(idx / COLS);
  const col = idx % COLS;
  return {
    id: gid,
    name: TILE_NAMES[row]?.[col] || `Tile ${gid}`,
    variety: VARIETY_NAMES[row] || 'Unknown',
    stage: STAGE_NAMES[col] || 'Unknown',
    varietyIdx: row,
    stageIdx: col,
  };
}

// ── TMX export (format Tiled) ────────────────────────────────────
export function exportToTMX(gridData) {
  const csvData = gridData.map(row => row.join(',')).join(',\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.5" tiledversion="1.10" orientation="isometric"
     width="4" height="6" tilewidth="${Math.round(TILE_W)}" tileheight="${Math.round(TILE_H)}" infinite="0">
  <tileset firstgid="1" name="tomato_stages" tilewidth="${Math.round(TILE_W)}" tileheight="${Math.round(TILE_H)}" tilecount="${ROWS * COLS}" columns="${COLS}">
    <image source="S01_tomates1.jpg" trans="0d1117" width="${IMG_W}" height="${IMG_H}"/>
    ${TILE_NAMES.flat().map((name, i) => `<tile id="${i+1}"><properties><property name="name" value="${name}"/></properties></tile>`).join('\n    ')}
  </tileset>
  <layer name="Ground" width="4" height="6">
    <data encoding="csv">
${csvData}
    </data>
  </layer>
</map>`;
}

// ── HOOK PRINCIPAL ──────────────────────────────────────────────
export default function useTileCutter() {
  const [tiles, setTiles] = useState({});      // { "0-1": dataURL, ... }
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);  // 0-1 loading progress
  const canvasRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const cutW = Math.round(TILE_W - PAD * 2);
      const cutH = Math.round(TILE_H - PAD * 2);
      canvas.width = cutW;
      canvas.height = cutH;
      const ctx = canvas.getContext('2d');

      const cutTiles = {};
      let done = 0;
      const total = ROWS * COLS;

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          // Coordonnées source dans l'image (avec padding pour virer les labels)
          const sx = Math.round(col * TILE_W + PAD);
          const sy = Math.round(TITLE_H + row * TILE_H + PAD);
          const sw = cutW;
          const sh = cutH;

          // Dessiner la tuile découpée
          ctx.clearRect(0, 0, cutW, cutH);
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cutW, cutH);

          // Stocker en dataURL
          cutTiles[`${row}-${col}`] = canvas.toDataURL('image/png');
          done++;
          setProgress(done / total);
        }
      }

      setTiles(cutTiles);
      setLoaded(true);
      canvasRef.current = canvas;
    };
    img.onerror = () => {
      console.warn('[TileCutter] Impossible de charger', TILESET_URL);
      setLoaded(true); // fallback to emoji
    };
    img.src = TILESET_URL;

    return () => { img.onload = null; };
  }, []);

  // Récupérer une tuile par varietyIndex + stageIndex
  const getTile = useCallback((varietyIdx, stageIdx) => {
    return tiles[`${varietyIdx}-${stageIdx}`] || null;
  }, [tiles]);

  // Récupérer par plantId + stageIdx
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
    tileW: Math.round(TILE_W - PAD * 2),
    tileH: Math.round(TILE_H - PAD * 2),
    totalCount: ROWS * COLS,
  };
}

// ── TILE RENDERER v2 — Canvas 2D Isometric Engine ─────────────────────────
// Dessine les sprites directement depuis les tilesets (pas de pré-cropping).
// Comme un vrai moteur de jeu : ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
//
// Avantages :
//   - Pas de getImageData → pas de problème CORS/tainted canvas
//   - Pas de cache de sprites → toujours à jour
//   - imageSmoothingEnabled = false → pixels nets
//   - Painter's algorithm pour la profondeur
//   - Supporte TOUS les tilesets (10 fichiers, 35 plantes)

import { useState, useEffect, useRef, useCallback } from 'react';
import { PLANTS_DB } from '../db/plants.js';

// ─── GRID CONSTANTS ──────────────────────────────────────────────────────────
export const GRID_COLS = 4;
export const GRID_ROWS = 6;
const TILE_W = 100;   // isometric diamond width
const TILE_H = 50;    // diamond height (top face)
const TILE_D = 18;    // side face depth (réduit pour blocs plus fins)

// ─── TILESET CONFIG ──────────────────────────────────────────────────────────
// Fichiers miniserre pré-découpés avec fond transparent
const TILESET_BASE = '/tileset/miniserre/';
const PT_ROWS = 4, PT_COLS = 5;
// Dimensions par cellule (1000x800 / 5 cols = 200 de large)
// Ces valeurs sont ignorées pour les PNG car on utilise la taille réelle de l'image
const CELL_W = 200, CELL_H = 200;

// ─── UNIFIED TILE MAP (all plants → miniserre PNG file + row) ─────────────────────
const TILE_MAP = {
  // tomates.png — rows 0-3
  'tomate-coeur-de-boeuf':    { file: 'tomates.png', row: 0 },
  'tomate-cerise':            { file: 'tomates.png', row: 1 },
  'tomate-roma':              { file: 'tomates.png', row: 2 },
  'tomate-ananas':            { file: 'tomates.png', row: 3 },
  // solanacees.png — rows 0-3
  'tomate-noire-de-crimee':   { file: 'solanacees.png', row: 0 },
  'poivron-ogea':             { file: 'solanacees.png', row: 1 },
  'aubergine-beaute':         { file: 'solanacees.png', row: 2 },
  'concombre-libanais':       { file: 'solanacees.png', row: 3 },
  // courgettes.png — rows 0-3
  'courgette-noire':          { file: 'courgettes.png', row: 0 },
  'courgette-jaune':          { file: 'courgettes.png', row: 1 },
  'melon-cantaloup':          { file: 'courgettes.png', row: 2 },
  'mais-doux':                { file: 'courgettes.png', row: 3 },
  // haricots.png — rows 0-3
  'haricot-vert':             { file: 'haricots.png', row: 0 },
  'haricot-beurre':           { file: 'haricots.png', row: 1 },
  'poireau-bleu':             { file: 'haricots.png', row: 2 },
  'oignon-jaune':             { file: 'haricots.png', row: 3 },
  // ail.png — rows 0-3
  'ail-rose':                 { file: 'ail.png', row: 0 },
  'carotte-nantaise':         { file: 'ail.png', row: 1 },
  'carotte-colorée':          { file: 'ail.png', row: 2 },
  'radis-cherry-belle':       { file: 'ail.png', row: 3 },
  // racines.png — rows 0-3
  'betterave-ronde':          { file: 'racines.png', row: 0 },
  'patate-douce':             { file: 'racines.png', row: 1 },
  'celeri-branche':           { file: 'racines.png', row: 2 },
  'epinard-monstrueux':       { file: 'racines.png', row: 3 },
  // salades.png — rows 0-3
  'laitue-batavia':           { file: 'salades.png', row: 0 },
  'laitue-romaine':           { file: 'salades.png', row: 1 },
  'mesclun':                  { file: 'salades.png', row: 2 },
  'chou-bleu':                { file: 'salades.png', row: 3 },
  // brocoli.png — rows 0-3
  'brocoli':                  { file: 'brocoli.png', row: 0 },
  'fraise-gariguette':        { file: 'brocoli.png', row: 1 },
  'fraise-mara-des-bois':     { file: 'brocoli.png', row: 2 },
  'basilic-grand-vert':       { file: 'brocoli.png', row: 3 },
  // herbes1.png — rows 0-3
  'basilic-thaï':             { file: 'herbes1.png', row: 0 },
  'persilCommun':             { file: 'herbes1.png', row: 1 },
  'ciboulette':               { file: 'herbes1.png', row: 2 },
  'menthe':                   { file: 'herbes1.png', row: 3 },
  // herbes2.png — rows 0-3
  'thym':                     { file: 'herbes2.png', row: 0 },
  'romarin':                  { file: 'herbes2.png', row: 1 },
  'origan':                   { file: 'herbes2.png', row: 2 },
};

// ─── STAGE VISUAL CONFIG ────────────────────────────────────────────────────
const STAGE_SCALES = [0.4, 0.72, 0.75, 0.95, 1.15];

// ─── SIMPLE SEEDED RANDOM (pour variantes de texture par cellule) ───────────
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ─── IMAGE LOADER (just HTMLImageElement, no canvas processing) ─────────────
const imageCache = new Map();
const loadingPromises = new Map();

function loadImage(url) {
  if (imageCache.has(url)) return Promise.resolve(imageCache.get(url));
  if (loadingPromises.has(url)) return loadingPromises.get(url);

  const p = new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { imageCache.set(url, img); loadingPromises.delete(url); resolve(img); };
    img.onerror = () => {
      // Retry without CORS (for local dev without proper headers)
      loadingPromises.delete(url);
      const img2 = new Image();
      img2.onload = () => { imageCache.set(url, img2); resolve(img2); };
      img2.onerror = () => { console.warn('[TileRenderer] Failed:', url); reject(url); };
      img2.src = url;
    };
    img.src = url;
  });
  loadingPromises.set(url, p);
  return p;
}

// ─── SPRITE PRE-PROCESSING (offscreen canvas, bg removed) ──────────────────
// On crée des petits canvas pré-traités avec le fond sombre retiré
const spriteCache = {}; // "file-row-col" → canvas

// Amélioration : detection plus intelligente du fond
// On cherche la couleur de fond dominante (coin sup gauche souvent)
function detectBgColor(cvs) {
  const ctx = cvs.getContext('2d');
  const w = cvs.width, h = cvs.height;
  const id = ctx.getImageData(0, 0, w, h);
  const d = id.data;
  // Echantillonne les 4 coins + centre pour trouver le fond
  const samples = [];
  const points = [
    [2, 2], [w-3, 2], [2, h-3], [w-3, h-3],
    [Math.floor(w/2), Math.floor(h/2)]
  ];
  for (const [px, py] of points) {
    const i = (py * w + px) * 4;
    samples.push([d[i], d[i+1], d[i+2]]);
  }
  // Prend la couleur la plus fréquente (le fond)
  const avgR = samples.reduce((s, c) => s + c[0], 0) / samples.length;
  const avgG = samples.reduce((s, c) => s + c[1], 0) / samples.length;
  const avgB = samples.reduce((s, c) => s + c[2], 0) / samples.length;
  return { r: avgR, g: avgG, b: avgB };
}

function removeBg(cvs) {
  try {
    const ctx = cvs.getContext('2d');
    const w = cvs.width, h = cvs.height;
    const id = ctx.getImageData(0, 0, w, h);
    const d = id.data;
    // Detection auto du fond
    const bg = detectBgColor(cvs);
    const bgR = bg.r, bgG = bg.g, bgB = bg.b;
    // Tolerance adaptative selon la luminance du fond
    const bgLum = (bgR + bgG + bgB) / 3;
    const threshold = bgLum < 50 ? 45 : bgLum > 200 ? 35 : 55;
    const featherRange = 25;

    for (let i = 0; i < d.length; i += 4) {
      const dist = Math.sqrt(
        (d[i] - bgR) ** 2 +
        (d[i + 1] - bgG) ** 2 +
        (d[i + 2] - bgB) ** 2
      );
      if (dist < threshold) {
        d[i + 3] = 0; // fully transparent
      } else if (dist < threshold + featherRange) {
        // Smooth edge transition
        const alpha = Math.min(255, (dist - threshold) / featherRange * 255);
        d[i + 3] = Math.round(alpha);
      }
      // Boost alpha for semi-transparent pixels that are clearly content
      if (d[i + 3] > 50 && dist > threshold + featherRange) {
        d[i + 3] = Math.min(255, d[i + 3] * 1.2);
      }
    }
    ctx.putImageData(id, 0, 0);
  } catch (e) {
    // Canvas may be tainted (cross-origin) — continue without bg removal
    console.warn('[TileRenderer] bg removal skipped (tainted canvas):', e.message);
  }
}

async function prebuildSprites(file) {
  const img = await loadImage(TILESET_BASE + file);
  // Chaque fichier miniserre est une grille 5 cols × 4 rows
  // La taille de chaque cellule = taille totale / 5
  const tileW = Math.round(img.naturalWidth / PT_COLS);
  const tileH = Math.round(img.naturalHeight / PT_ROWS);

  for (let row = 0; row < PT_ROWS; row++) {
    for (let col = 0; col < PT_COLS; col++) {
      const key = `${file}-${row}-${col}`;
      if (spriteCache[key]) continue;

      const cvs = document.createElement('canvas');
      cvs.width = tileW;
      cvs.height = tileH;
      const ctx = cvs.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      const sx = col * tileW;
      const sy = row * tileH;

      ctx.drawImage(img, sx, sy, tileW, tileH, 0, 0, tileW, tileH);
      // Pas de removeBg — les PNG miniserre ont déjà fond transparent
      spriteCache[key] = { canvas: cvs, bgRemoved: true };
    }
  }
}

// ─── ISO MATH ────────────────────────────────────────────────────────────────
function isoToScreen(c, r) {
  return {
    x: (c - r) * (TILE_W / 2),
    y: (c + r) * (TILE_H / 2),
  };
}

function screenToCell(px, py, ox, oy) {
  const rx = px - ox;
  const ry = py - oy;
  const fc = (rx / (TILE_W / 2) + ry / (TILE_H / 2)) / 2;
  const fr = (ry / (TILE_H / 2) - rx / (TILE_W / 2)) / 2;
  const cc = Math.floor(fc), cr = Math.floor(fr);
  let best = null, bestDist = Infinity;
  for (let dr = 0; dr <= 1; dr++) {
    for (let dc = 0; dc <= 1; dc++) {
      const tr = cr + dr, tc = cc + dc;
      if (tr < 0 || tr >= GRID_ROWS || tc < 0 || tc >= GRID_COLS) continue;
      const pos = isoToScreen(tc, tr);
      const cx = pos.x + TILE_W / 2;
      const cy = pos.y + TILE_H / 2;
      const dx = Math.abs(rx - cx) / (TILE_W / 2);
      const dy = Math.abs(ry - cy) / (TILE_H / 2);
      if (dx + dy <= 1.2) {
        const dist = dx + dy;
        if (dist < bestDist) { bestDist = dist; best = tr * GRID_COLS + tc; }
      }
    }
  }
  return best;
}

// ─── GRID LAYOUT ────────────────────────────────────────────────────────────
function calcGridLayout() {
  const allPos = [];
  for (let r = 0; r < GRID_ROWS; r++)
    for (let c = 0; c < GRID_COLS; c++)
      allPos.push(isoToScreen(c, r));

  const minX = Math.min(...allPos.map(p => p.x));
  const maxX = Math.max(...allPos.map(p => p.x));
  const minY = Math.min(...allPos.map(p => p.y));
  const maxY = Math.max(...allPos.map(p => p.y)) + TILE_H + TILE_D;

  // Add space for tall plants (stage 4 = biggest)
  const plantHeadroom = 110;

  const padX = 40, padTop = 80 + plantHeadroom, padBot = 30;
  return {
    canvasW: maxX - minX + padX * 2,
    canvasH: maxY - minY + padTop + padBot,
    ox: -minX + padX,
    oy: -minY + padTop,
  };
}

// ─── DRAWING: BACKGROUND ────────────────────────────────────────────────────

function drawSky(ctx, w, h) {
  // Dégradé de ciel plus dynamique
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#1a3a5c');    // haut: bleu profond
  grad.addColorStop(0.3, '#2a5a8c');  // milieu-haut: bleu ciel
  grad.addColorStop(0.6, '#3a7a9c');  // milieu: bleu-vert
  grad.addColorStop(0.85, '#1a5a3c'); // bas: vert foncé
  grad.addColorStop(1, '#0d2a1a');    // very bottom: vert nuit
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawClouds(ctx, w, h) {
  // Nuages plus visibles et stylisés
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  const cloudData = [
    [0.05, 0.06, 0.09, 0.03],
    [0.20, 0.10, 0.06, 0.025],
    [0.38, 0.04, 0.07, 0.022],
    [0.56, 0.08, 0.05, 0.02],
    [0.70, 0.05, 0.06, 0.023],
    [0.85, 0.09, 0.05, 0.018],
  ];
  cloudData.forEach(([xf, yf, wf, hf]) => {
    const cx2 = w * xf, cy2 = 16 + h * yf, cw = w * wf, ch = h * hf;
    // Nuage principal
    ctx.beginPath(); ctx.roundRect(cx2, cy2, cw, ch, 6); ctx.fill();
    // Bosse au-dessus
    ctx.beginPath(); ctx.roundRect(cx2 + cw * 0.2, cy2 - ch * 0.5, cw * 0.6, ch * 0.7, 4); ctx.fill();
  });
}

function drawGroundShadow(ctx, w, h) {
  // Ombre portée de la serre sur le sol
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(w / 2, h - 18, w * 0.38, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Deuxième ombre plus douce
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  ctx.beginPath();
  ctx.ellipse(w / 2, h - 14, w * 0.42, 16, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ─── DRAWING: DIRT BLOCK ────────────────────────────────────────────────────

function drawDirtBlock(ctx, x, y, opts = {}) {
  const { selected, isMoving, stageIdx = -1, stageTint, cellSeed = 42 } = opts;
  const hw = TILE_W / 2, hh = TILE_H / 2;
  const cx = x + hw;
  const rand = seededRandom(cellSeed);

  // Bleeding : on étend le losange de 2px pour éliminer les lignes vides
  const BL = 2;

  // ── Top face (diamond + bleeding) ──
  ctx.beginPath();
  ctx.moveTo(cx, y - BL);
  ctx.lineTo(x + TILE_W + BL, y + hh);
  ctx.lineTo(cx, y + TILE_H + BL);
  ctx.lineTo(x - BL, y + hh);
  ctx.closePath();

  // Texture based on stage
  if (stageIdx === 0) {
    // Stade 0: terre avec sillons de semis
    ctx.fillStyle = '#7a5030';
    ctx.fill();
    // Sillons
    ctx.strokeStyle = '#5a3820';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 3; i++) {
      const yy = y + 12 + i * 10;
      ctx.beginPath();
      ctx.moveTo(x + 8, yy);
      ctx.lineTo(x + TILE_W - 8, yy);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else if (stageIdx === 1) {
    // Stade 1: terre préparée sans sillons (germination)
    ctx.fillStyle = '#8b5e3c';
    ctx.fill();
    // Petites mottes
    ctx.fillStyle = '#7a5030';
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x + 10 + i * 22 + Math.sin(i) * 5, y + 8 + Math.cos(i * 2) * 4, 8, 4);
    }
    ctx.globalAlpha = 1;
  } else {
    // Stade 2+: herbe normale
    const topGrad = ctx.createLinearGradient(x, y, x + TILE_W, y + TILE_H);
    if (selected) {
      topGrad.addColorStop(0, '#72d63a'); topGrad.addColorStop(0.5, '#6aaf2e'); topGrad.addColorStop(1, '#5ea028');
    } else {
      topGrad.addColorStop(0, '#5aab2a'); topGrad.addColorStop(0.5, '#4e9e22'); topGrad.addColorStop(1, '#448e1c');
    }
    ctx.fillStyle = topGrad;
    ctx.fill();

    // Grass texture — variantes aléatoires par cellule (anti-damier)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, y - BL); ctx.lineTo(x + TILE_W + BL, y + hh); ctx.lineTo(cx, y + TILE_H + BL); ctx.lineTo(x - BL, y + hh); ctx.closePath();
    ctx.clip();
    const grassColors = ['#4e9e22', '#3d8a18', '#62b830', '#55a825'];
    const grassCount = 6 + Math.floor(rand() * 5);
    for (let i = 0; i < grassCount; i++) {
      const gx = x + rand() * (TILE_W - 6) + 3;
      const gy = y + rand() * (TILE_H - 10) + 5;
      const gw = 2 + rand() * 2;
      const gh = 3 + rand() * 4;
      ctx.fillStyle = grassColors[Math.floor(rand() * grassColors.length)];
      ctx.fillRect(gx, gy, gw, gh);
    }
    // Brindille aléatoire
    if (rand() > 0.65) {
      const tx = x + 15 + rand() * (TILE_W - 30);
      const ty = y + 6 + rand() * 8;
      ctx.fillStyle = '#55a825';
      ctx.fillRect(tx, ty, 2, 6);
      ctx.fillRect(tx + 3, ty + 1, 1, 5);
    }
    // Petite fleur ou caillou décoratif
    if (rand() > 0.8) {
      const dx = x + 10 + rand() * (TILE_W - 20);
      const dy = y + 12 + rand() * (TILE_H - 18);
      if (rand() > 0.5) {
        ctx.fillStyle = rand() > 0.5 ? '#e8d44d' : '#f0e8a0';
        ctx.beginPath(); ctx.arc(dx, dy, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#4e9e22';
        ctx.fillRect(dx - 0.5, dy + 1.5, 1, 3);
      } else {
        ctx.fillStyle = '#8a7a6a';
        ctx.beginPath(); ctx.ellipse(dx, dy, 2, 1.2, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }

  // Stage tint overlay
  if (stageTint) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, y); ctx.lineTo(x + TILE_W, y + hh); ctx.lineTo(cx, y + TILE_H); ctx.lineTo(x, y + hh); ctx.closePath();
    ctx.fillStyle = stageTint;
    ctx.fill();
    ctx.restore();
  }

  // Top outline — plus fin et subtil
  ctx.beginPath();
  ctx.moveTo(cx, y); ctx.lineTo(x + TILE_W, y + hh); ctx.lineTo(cx, y + TILE_H); ctx.lineTo(x, y + hh); ctx.closePath();
  ctx.strokeStyle = selected ? '#ffffff' : '#1a4a0c';
  ctx.lineWidth = selected ? 1.5 : 0.6;
  ctx.globalAlpha = selected ? 0.85 : 0.30;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // ── Left face (éclairée — lumière vient du haut-gauche) ──
  ctx.beginPath();
  ctx.moveTo(x, y + hh); ctx.lineTo(cx, y + TILE_H); ctx.lineTo(cx, y + TILE_H + TILE_D); ctx.lineTo(x, y + hh + TILE_D); ctx.closePath();
  const lGrad = ctx.createLinearGradient(x, y + hh, x + hw, y + TILE_H + TILE_D);
  lGrad.addColorStop(0, '#7d5a3a'); lGrad.addColorStop(1, '#6b4a2e');
  ctx.fillStyle = lGrad; ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  for (let i = 0; i < 4; i++) ctx.fillRect(x + 5 + i * 10, y + TILE_H + 4 + Math.sin(i) * 3, 8, 2);
  ctx.strokeStyle = '#3d2818'; ctx.lineWidth = 0.6; ctx.globalAlpha = 0.25; ctx.stroke(); ctx.globalAlpha = 1;

  // ── Right face (dans l'ombre — plus sombre) ──
  ctx.beginPath();
  ctx.moveTo(cx, y + TILE_H); ctx.lineTo(x + TILE_W, y + hh); ctx.lineTo(x + TILE_W, y + hh + TILE_D); ctx.lineTo(cx, y + TILE_H + TILE_D); ctx.closePath();
  const rGrad = ctx.createLinearGradient(cx, y + TILE_H, x + TILE_W, y + hh + TILE_D);
  rGrad.addColorStop(0, '#5a3520'); rGrad.addColorStop(1, '#4a2a18');
  ctx.fillStyle = rGrad; ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  for (let i = 0; i < 4; i++) ctx.fillRect(cx + 5 + i * 10, y + TILE_H + 5 + Math.cos(i) * 2, 8, 2);
  ctx.strokeStyle = '#3a2010'; ctx.lineWidth = 0.6; ctx.globalAlpha = 0.2; ctx.stroke(); ctx.globalAlpha = 1;

  // Grass strip (only for stages 2+) — plus fin
  if (stageIdx >= 2 || stageIdx === -1) {
    ctx.fillStyle = '#4a9e20'; ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.moveTo(x, y + hh); ctx.lineTo(cx, y + TILE_H); ctx.lineTo(cx, y + TILE_H + 3); ctx.lineTo(x, y + hh + 3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3d8a18';
    ctx.beginPath(); ctx.moveTo(cx, y + TILE_H); ctx.lineTo(x + TILE_W, y + hh); ctx.lineTo(x + TILE_W, y + hh + 3); ctx.lineTo(cx, y + TILE_H + 3); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Pebbles (only for stages 2+ and empty) — plus discrets
  if (stageIdx >= 2 || stageIdx === -1) {
    ctx.fillStyle = '#5a3820'; ctx.globalAlpha = 0.35;
    ctx.beginPath(); ctx.ellipse(cx - hw * 0.5, y + TILE_H + TILE_D - 3, 1.8, 1, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4a3018'; ctx.globalAlpha = 0.3;
    ctx.beginPath(); ctx.ellipse(cx + hw * 0.3, y + hh + TILE_D - 2, 1.5, 0.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Moving indicator
  if (isMoving) {
    ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(x + TILE_W, y + hh); ctx.lineTo(cx, y + TILE_H); ctx.lineTo(x, y + hh); ctx.closePath();
    ctx.fillStyle = 'rgba(46,204,113,0.2)'; ctx.fill();
    ctx.setLineDash([4, 2]); ctx.strokeStyle = '#2ecc71'; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
    ctx.font = '12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('📍', cx, y - 4);
  }
}

// ─── DRAWING: PLANT FROM TILESET ────────────────────────────────────────────
// Dessine le sprite depuis le spritesheet pré-traité
function drawPlantFromTileset(ctx, x, y, spriteCanvas, stageIdx, opts = {}) {
  if (!spriteCanvas) return;
  const { selected, isInDirt } = opts;
  const hw = TILE_W / 2;
  const cx = x + hw;

  const scale = STAGE_SCALES[stageIdx] || 0.5;
  const srcW = spriteCanvas.width;
  const srcH = spriteCanvas.height;

  // Taille d'affichage : proportionnelle au stade, limité pour éviter débordement
  const maxDrawW = TILE_W * 0.75;
  const drawW = Math.min(TILE_W * (0.5 + scale * 0.35), maxDrawW);
  const drawH = drawW * (srcH / srcW);

  // Position : ancre au BAS du sprite = surface du dirt
  // Le sprite "pousse" depuis la terre
  const dirtSurfaceY = y + TILE_H; // sommet de la face dirt (ou base du diamond)
  const anchorX = cx;
  const anchorY = dirtSurfaceY;

  // Ombre portée (sur la terre) — plus légère
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(anchorX, anchorY - 1, drawW * 0.25, drawW * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ancre du sprite = BAS de la plante
  // Stade 0 (graine): légèrement enfoncé dans la terre
  // Autres stades: sort de la surface du dirt
  const spriteBottom = isInDirt
    ? dirtSurfaceY + 2
    : stageIdx === 1
      ? dirtSurfaceY - 20  // levée: -20px
      : dirtSurfaceY + 30;
  const sprX = anchorX - drawW / 2;
  const sprY = spriteBottom - drawH;

  // Lueur sous la plante (stade avancé) — plus subtile
  if (stageIdx >= 2 && !isInDirt) {
    ctx.fillStyle = 'rgba(46,125,50,0.2)';
    ctx.beginPath();
    ctx.ellipse(anchorX, anchorY - 2, drawW * 0.18, drawW * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dessiner le sprite (ancre = bas du sprite)
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(spriteCanvas, sprX, sprY, drawW, drawH);

  // Indicateur graine (stade 0) - petit monticule
  if (isInDirt) {
    ctx.fillStyle = '#8b5e3c';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.ellipse(anchorX, dirtSurfaceY, drawW * 0.35, drawW * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Sélection
  if (selected) {
    ctx.beginPath();
    ctx.moveTo(cx, y); ctx.lineTo(x + TILE_W, y + TILE_H / 2);
    ctx.lineTo(cx, y + TILE_H); ctx.lineTo(x, y + TILE_H / 2); ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  }

  // Barre de progression
  if (stageIdx > 0) {
    const barW = 16, barH = 3;
    const barX = x + TILE_W - barW - 4, barY = y + TILE_H + TILE_D - 6;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 1); ctx.fill();
    ctx.fillStyle = ['#8b5e3c', '#4a9e20', '#2e7d32', '#388e3c', '#43a047'][Math.min(stageIdx, 4)] || '#4a9e20';
    ctx.beginPath(); ctx.roundRect(barX, barY, barW * ((stageIdx + 1) / PT_COLS), barH, 1); ctx.fill();
  }
}

// ─── DRAWING: EMOJI FALLBACK ────────────────────────────────────────────────
function drawEmoji(ctx, x, y, emoji, scale, opacity) {
  const hw = TILE_W / 2;
  const cx = x + hw;
  const baseY = y + TILE_H;
  const fontSize = Math.round(10 + scale * 14);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(cx, baseY + 1, fontSize * 0.4, fontSize * 0.12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, cx, baseY - fontSize * 0.6);
  ctx.restore();
}

// ─── EMPTY CELL MARKER ──────────────────────────────────────────────────────
function drawEmptyMarker(ctx, x, y) {
  const hw = TILE_W / 2;
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('·', x + hw, y + TILE_H + 2);
}

// ─── LOADING MANAGER ────────────────────────────────────────────────────────

let _buildPromise = null;
let _built = false;
let _loadCallbacks = [];

function notifyLoad() {
  _built = true;
  _loadCallbacks.forEach(cb => cb());
  _loadCallbacks = [];
}

async function loadAllTilesets() {
  if (_buildPromise) return _buildPromise;
  _buildPromise = (async () => {
    const files = new Set(Object.values(TILE_MAP).map(t => t.file));
    const results = await Promise.allSettled(
      [...files].map(f => prebuildSprites(f))
    );
    const failed = results.filter(r => r.status === 'rejected');
    if (failed.length > 0) {
      console.warn(`[TileRenderer] ${failed.length}/${files.size} tilesets failed to load`);
    }
    console.log(`[TileRenderer] Loaded ${Object.keys(spriteCache).length} sprites`);
    notifyLoad();
  })();
  return _buildPromise;
}

// ─── MAIN HOOK ──────────────────────────────────────────────────────────────

export default function useTileRenderer() {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(_built);
  const layoutRef = useRef(calcGridLayout());

  useEffect(() => {
    if (_built) { setReady(true); return; }
    _loadCallbacks.push(() => setReady(true));
    loadAllTilesets();
  }, []);

  const layout = layoutRef.current;

  const getSprite = useCallback((plantId, stageIdx) => {
    const info = TILE_MAP[plantId];
    if (!info) return null;
    const si = Math.min(Math.max(stageIdx, 0), PT_COLS - 1);
    const cached = spriteCache[`${info.file}-${info.row}-${si}`];
    if (!cached) return null;
    return cached.canvas || cached;
  }, []);

  const calcStage = useCallback((plantedDate, daysToMaturity) => {
    if (!plantedDate) return 0;
    const elapsed = (Date.now() - new Date(plantedDate).getTime()) / 86400000;
    const progress = Math.min(elapsed / (daysToMaturity || 60), 1);
    return Math.min(Math.floor(progress * PT_COLS), PT_COLS - 1);
  }, []);

  const getDbPlant = useCallback((plantId) => PLANTS_DB.find(p => p.id === plantId) || null, []);

  // ─── RENDER ──────────────────────────────────────────────────────────────
  const render = useCallback((canvas, serre, selectedIdx, movingIdx) => {
    if (!canvas || !_built) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const { canvasW, canvasH, ox, oy } = layout;

    canvas.width = Math.round(canvasW * dpr);
    canvas.height = Math.round(canvasH * dpr);
    canvas.style.width = canvasW + 'px';
    canvas.style.height = canvasH + 'px';
    canvas.style.maxWidth = '100%';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    // Background
    drawSky(ctx, canvasW, canvasH);
    drawClouds(ctx, canvasW, canvasH);
    drawGroundShadow(ctx, canvasW, canvasH);

    ctx.save();
    ctx.translate(ox, oy);

    const stageTints = [
      'rgba(139,94,60,0.25)', 'rgba(74,158,32,0.18)', 'rgba(46,125,50,0.28)',
      'rgba(46,125,50,0.40)', 'rgba(46,125,50,0.55)',
    ];

    // Painter's algorithm: back to front
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const idx = r * GRID_COLS + c;
        const { x, y } = isoToScreen(c, r);
        const alv = serre.alveoles[idx];
        const isSelected = selectedIdx === idx;
        const isMovingTile = movingIdx === idx;

        if (alv) {
          const dbPlant = getDbPlant(alv.plantId);
          const ad = serre.alveoleData?.[idx];
          const stageIdx = calcStage(ad?.plantedDate, dbPlant?.daysToMaturity);
          const isInDirt = stageIdx === 0;

          // 1. Dirt block with soil texture based on stage
          drawDirtBlock(ctx, x, y, {
            selected: isSelected,
            isMoving: isMovingTile,
            stageIdx,
            stageTint: stageTints[stageIdx] || null,
            cellSeed: idx * 137 + r * 31 + c * 53,
          });

          // 2. Plant sprite from tileset
          const sprite = getSprite(alv.plantId, stageIdx);
          if (sprite) {
            drawPlantFromTileset(ctx, x, y, sprite, stageIdx, { selected: isSelected, isInDirt });
          } else {
            // Fallback: emoji
            drawEmoji(ctx, x, y, dbPlant?.icon || '🌿', STAGE_SCALES[stageIdx] || 0.5, 0.7 + stageIdx * 0.06);
          }
        } else {
          drawDirtBlock(ctx, x, y, { selected: isSelected, stageIdx: -1, cellSeed: idx * 137 + r * 31 + c * 53 });
          drawEmptyMarker(ctx, x, y);
        }
      }
    }

    ctx.restore();
  }, [layout, getSprite, calcStage, getDbPlant]);

  const getClickedCell = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const logicalW = parseFloat(canvas.style.width) || canvas.width;
    const logicalH = parseFloat(canvas.style.height) || canvas.height;
    const scaleX = logicalW / rect.width;
    const scaleY = logicalH / rect.height;
    const px = (clientX - rect.left) * scaleX;
    const py = (clientY - rect.top) * scaleY;
    return screenToCell(px, py, layout.ox, layout.oy);
  }, [layout]);

  return { canvasRef, render, ready, getClickedCell, TILE_MAP };
}

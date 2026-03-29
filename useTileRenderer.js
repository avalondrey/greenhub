// ── TILE RENDERER v3 — PNG RGBA propres, pas de removeBg ──────────────────
// Utilise /tileset/miniserre/*.png (640x640 RGBA, grille 5cols x 4rows)
// tw=128px, th=160px par sprite — fond déjà transparent, rendu net garanti.

import { useState, useEffect, useRef, useCallback } from 'react';
import { PLANTS_DB } from '../db/plants.js';

// ─── GRID ────────────────────────────────────────────────────────────────────
export const GRID_COLS = 4;
export const GRID_ROWS = 6;
const TILE_W = 96;
const TILE_H = 48;
const TILE_D = 20;

// ─── TILESET PNG CONFIG ───────────────────────────────────────────────────────
// Chaque fichier : 640x640, grille 5 stades (cols) x 4 variétés (rows)
const PNG_BASE   = '/tileset/miniserre/';
const PNG_COLS   = 5;   // stades 0→4
const PNG_ROWS   = 4;   // variétés
const PNG_TW     = 128; // 640/5
const PNG_TH     = 160; // 640/4

// ─── TILE MAP : plantId → fichier PNG + ligne variété ────────────────────────
const TILE_MAP = {
  // tomates.png — 4 variétés
  'tomate-coeur-de-boeuf': { file: 'tomates.png',     row: 0 },
  'tomate-cerise':          { file: 'tomates.png',     row: 1 },
  'tomate-roma':            { file: 'tomates.png',     row: 2 },
  'tomate-ananas':          { file: 'tomates.png',     row: 3 },
  // solanacees.png
  'tomate-noire-de-crimee': { file: 'solanacees.png',  row: 0 },
  'poivron-ogea':           { file: 'solanacees.png',  row: 1 },
  'aubergine-beaute':       { file: 'solanacees.png',  row: 2 },
  'concombre-libanais':     { file: 'solanacees.png',  row: 3 },
  // courgettes.png
  'courgette-noire':        { file: 'courgettes.png',  row: 0 },
  'courgette-jaune':        { file: 'courgettes.png',  row: 1 },
  'melon-cantaloup':        { file: 'courgettes.png',  row: 2 },
  'mais-doux':              { file: 'courgettes.png',  row: 3 },
  // haricots.png
  'haricot-vert':           { file: 'haricots.png',    row: 0 },
  'haricot-beurre':         { file: 'haricots.png',    row: 1 },
  'poireau-bleu':           { file: 'haricots.png',    row: 2 },
  'oignon-jaune':           { file: 'haricots.png',    row: 3 },
  // ail.png
  'ail-rose':               { file: 'ail.png',         row: 0 },
  'carotte-nantaise':       { file: 'ail.png',         row: 1 },
  'carotte-colorée':        { file: 'ail.png',         row: 2 },
  'radis-cherry-belle':     { file: 'ail.png',         row: 3 },
  // racines.png
  'betterave-ronde':        { file: 'racines.png',     row: 0 },
  'patate-douce':           { file: 'racines.png',     row: 1 },
  'celeri-branche':         { file: 'racines.png',     row: 2 },
  'epinard-monstrueux':     { file: 'racines.png',     row: 3 },
  // salades.png
  'laitue-batavia':         { file: 'salades.png',     row: 0 },
  'laitue-romaine':         { file: 'salades.png',     row: 1 },
  'mesclun':                { file: 'salades.png',     row: 2 },
  'chou-bleu':              { file: 'salades.png',     row: 3 },
  // brocoli.png
  'brocoli':                { file: 'brocoli.png',     row: 0 },
  'fraise-gariguette':      { file: 'brocoli.png',     row: 1 },
  'fraise-mara-des-bois':   { file: 'brocoli.png',     row: 2 },
  'basilic-grand-vert':     { file: 'brocoli.png',     row: 3 },
  // herbes1.png
  'basilic-thaï':           { file: 'herbes1.png',     row: 0 },
  'persilCommun':           { file: 'herbes1.png',     row: 1 },
  'ciboulette':             { file: 'herbes1.png',     row: 2 },
  'menthe':                 { file: 'herbes1.png',     row: 3 },
  // herbes2.png
  'thym':                   { file: 'herbes2.png',     row: 0 },
  'romarin':                { file: 'herbes2.png',     row: 1 },
  'origan':                 { file: 'herbes2.png',     row: 2 },
};

// ─── STAGE SCALES (stade 0=graine petit, 4=adulte grand) ─────────────────────
const STAGE_SCALES = [0.45, 0.60, 0.78, 0.95, 1.15];

// ─── IMAGE LOADER ─────────────────────────────────────────────────────────────
const imageCache = new Map();

function loadImage(url) {
  if (imageCache.has(url)) return Promise.resolve(imageCache.get(url));
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => { imageCache.set(url, img); resolve(img); };
    img.onerror = () => reject(new Error('Failed: ' + url));
    img.src = url;
  });
}

// ─── SPRITE CACHE : "file-row-col" → offscreen canvas ────────────────────────
// On pre-découpe chaque sprite dans un canvas isolé pour drawImage rapide
const spriteCache = {};

async function buildSprites(file) {
  const img = await loadImage(PNG_BASE + file);
  for (let row = 0; row < PNG_ROWS; row++) {
    for (let col = 0; col < PNG_COLS; col++) {
      const key = `${file}-${row}-${col}`;
      if (spriteCache[key]) continue;
      const cvs = document.createElement('canvas');
      cvs.width  = PNG_TW;
      cvs.height = PNG_TH;
      const ctx = cvs.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      // Crop direct depuis le PNG RGBA — pas de removeBg nécessaire
      ctx.drawImage(img,
        col * PNG_TW, row * PNG_TH, PNG_TW, PNG_TH,
        0, 0, PNG_TW, PNG_TH
      );
      spriteCache[key] = cvs;
    }
  }
}

// ─── LOADING ──────────────────────────────────────────────────────────────────
let _promise = null, _ready = false, _cbs = [];

function onReady(cb) { _ready ? cb() : _cbs.push(cb); }

async function loadAll() {
  if (_promise) return _promise;
  _promise = (async () => {
    const files = [...new Set(Object.values(TILE_MAP).map(t => t.file))];
    await Promise.allSettled(files.map(buildSprites));
    _ready = true;
    _cbs.forEach(cb => cb());
    _cbs = [];
    console.log('[TileRenderer v3] Prêt —', Object.keys(spriteCache).length, 'sprites PNG chargés');
  })();
  return _promise;
}

// ─── ISO MATH ─────────────────────────────────────────────────────────────────
function isoXY(c, r) {
  return { x: (c - r) * (TILE_W / 2), y: (c + r) * (TILE_H / 2) };
}

function screenToCell(px, py, ox, oy) {
  const rx = px - ox, ry = py - oy;
  const fc = (rx / (TILE_W / 2) + ry / (TILE_H / 2)) / 2;
  const fr = (ry / (TILE_H / 2) - rx / (TILE_W / 2)) / 2;
  let best = null, bestD = Infinity;
  for (let dr = 0; dr <= 1; dr++) for (let dc = 0; dc <= 1; dc++) {
    const tr = Math.floor(fr) + dr, tc = Math.floor(fc) + dc;
    if (tr < 0 || tr >= GRID_ROWS || tc < 0 || tc >= GRID_COLS) continue;
    const p = isoXY(tc, tr);
    const dx = Math.abs(rx - p.x - TILE_W / 2) / (TILE_W / 2);
    const dy = Math.abs(ry - p.y - TILE_H / 2) / (TILE_H / 2);
    if (dx + dy < 1.2 && dx + dy < bestD) { bestD = dx + dy; best = tr * GRID_COLS + tc; }
  }
  return best;
}

function calcLayout() {
  const pos = [];
  for (let r = 0; r < GRID_ROWS; r++)
    for (let c = 0; c < GRID_COLS; c++)
      pos.push(isoXY(c, r));
  const minX = Math.min(...pos.map(p => p.x));
  const maxX = Math.max(...pos.map(p => p.x));
  const minY = Math.min(...pos.map(p => p.y));
  const maxY = Math.max(...pos.map(p => p.y)) + TILE_H + TILE_D;
  const headroom = 120, padX = 36, padTop = 60 + headroom, padBot = 24;
  return {
    W: maxX - minX + padX * 2,
    H: maxY - minY + padTop + padBot,
    ox: -minX + padX,
    oy: -minY + padTop,
  };
}

// ─── DRAW: FOND ───────────────────────────────────────────────────────────────
function drawBg(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0,    '#1a3a5c');
  g.addColorStop(0.55, '#1e4a6a');
  g.addColorStop(0.85, '#163a2a');
  g.addColorStop(1,    '#0d2018');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Nuages légers
  ctx.fillStyle = 'rgba(255,255,255,0.09)';
  [[0.08,0.05,0.10,0.03],[0.30,0.08,0.07,0.025],[0.58,0.04,0.09,0.022],[0.82,0.07,0.06,0.02]].forEach(([xf,yf,wf,hf]) => {
    const cx2 = w*xf, cy2 = h*yf, cw = w*wf, ch = h*hf;
    ctx.beginPath(); ctx.roundRect(cx2, cy2, cw, ch, 5); ctx.fill();
    ctx.beginPath(); ctx.roundRect(cx2+cw*0.15, cy2-ch*0.4, cw*0.7, ch, 3); ctx.fill();
  });

  // Ombre sol
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  ctx.beginPath(); ctx.ellipse(w/2, h-14, w*0.36, 10, 0, 0, Math.PI*2); ctx.fill();
}

// ─── DRAW: BLOC ISOMÉTRIQUE ───────────────────────────────────────────────────
function drawBlock(ctx, x, y, opts = {}) {
  const { selected, stageIdx = -1, isMoving, seed = 42 } = opts;
  const hw = TILE_W / 2, hh = TILE_H / 2, cx = x + hw;

  // --- TOP FACE ---
  const topPts = [[cx, y], [x+TILE_W, y+hh], [cx, y+TILE_H], [x, y+hh]];
  ctx.beginPath();
  topPts.forEach(([px,py], i) => i ? ctx.lineTo(px,py) : ctx.moveTo(px,py));
  ctx.closePath();

  if (stageIdx === 0) {
    // Terre avec sillons
    ctx.fillStyle = '#7a5030'; ctx.fill();
    ctx.strokeStyle = '#5a3820'; ctx.lineWidth = 1; ctx.globalAlpha = 0.45;
    ctx.save(); ctx.clip();
    for (let i = 0; i < 3; i++) {
      const yy = y + 10 + i * 10;
      ctx.beginPath(); ctx.moveTo(x+8, yy); ctx.lineTo(x+TILE_W-8, yy); ctx.stroke();
    }
    ctx.restore(); ctx.globalAlpha = 1;
  } else if (stageIdx === 1) {
    // Terre meuble
    ctx.fillStyle = '#8b5e3c'; ctx.fill();
  } else {
    // Herbe
    const g = ctx.createLinearGradient(x, y, x+TILE_W, y+TILE_H);
    g.addColorStop(0, selected ? '#72d63a' : '#5aab2a');
    g.addColorStop(1, selected ? '#5ea028' : '#448e1c');
    ctx.fillStyle = g; ctx.fill();
    // Brins d'herbe pseudo-aléatoires
    ctx.save(); ctx.clip();
    let s = seed;
    const rng = () => { s = (s*16807)%2147483647; return (s-1)/2147483646; };
    ctx.fillStyle = '#3d8a18';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(x + rng()*(TILE_W-8)+4, y + rng()*(TILE_H-8)+4, 2, 3+rng()*3);
    }
    ctx.restore();
  }

  // Outline top
  ctx.beginPath();
  topPts.forEach(([px,py], i) => i ? ctx.lineTo(px,py) : ctx.moveTo(px,py));
  ctx.closePath();
  ctx.strokeStyle = selected ? '#ffffff' : '#1a4a0c';
  ctx.lineWidth   = selected ? 1.5 : 0.5;
  ctx.globalAlpha = selected ? 0.9 : 0.25;
  ctx.stroke(); ctx.globalAlpha = 1;

  // --- FACE GAUCHE ---
  ctx.beginPath();
  ctx.moveTo(x,  y+hh);  ctx.lineTo(cx, y+TILE_H);
  ctx.lineTo(cx, y+TILE_H+TILE_D); ctx.lineTo(x, y+hh+TILE_D); ctx.closePath();
  const gl = ctx.createLinearGradient(x, y+hh, cx, y+TILE_H+TILE_D);
  gl.addColorStop(0, '#7d5a3a'); gl.addColorStop(1, '#5a3820');
  ctx.fillStyle = gl; ctx.fill();
  ctx.strokeStyle = '#3a2010'; ctx.lineWidth = 0.5; ctx.globalAlpha = 0.2; ctx.stroke(); ctx.globalAlpha = 1;

  // --- FACE DROITE ---
  ctx.beginPath();
  ctx.moveTo(cx, y+TILE_H); ctx.lineTo(x+TILE_W, y+hh);
  ctx.lineTo(x+TILE_W, y+hh+TILE_D); ctx.lineTo(cx, y+TILE_H+TILE_D); ctx.closePath();
  const gr = ctx.createLinearGradient(cx, y+TILE_H, x+TILE_W, y+hh+TILE_D);
  gr.addColorStop(0, '#5a3520'); gr.addColorStop(1, '#3a2010');
  ctx.fillStyle = gr; ctx.fill();
  ctx.strokeStyle = '#3a2010'; ctx.lineWidth = 0.5; ctx.globalAlpha = 0.15; ctx.stroke(); ctx.globalAlpha = 1;

  // Bande herbe côtés (stades 2+)
  if (stageIdx >= 2 || stageIdx === -1) {
    ctx.globalAlpha = 0.65;
    ctx.fillStyle = '#4a9e20';
    ctx.beginPath(); ctx.moveTo(x,y+hh); ctx.lineTo(cx,y+TILE_H); ctx.lineTo(cx,y+TILE_H+3); ctx.lineTo(x,y+hh+3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3d8a18';
    ctx.beginPath(); ctx.moveTo(cx,y+TILE_H); ctx.lineTo(x+TILE_W,y+hh); ctx.lineTo(x+TILE_W,y+hh+3); ctx.lineTo(cx,y+TILE_H+3); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Cailloux
  ctx.fillStyle = '#5a3820'; ctx.globalAlpha = 0.3;
  ctx.beginPath(); ctx.ellipse(cx-hw*0.5, y+TILE_H+TILE_D-3, 2, 1, 0, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1;

  // Indicateur déplacement
  if (isMoving) {
    ctx.beginPath(); topPts.forEach(([px,py],i)=>i?ctx.lineTo(px,py):ctx.moveTo(px,py)); ctx.closePath();
    ctx.fillStyle='rgba(46,204,113,0.25)'; ctx.fill();
    ctx.setLineDash([4,2]); ctx.strokeStyle='#2ecc71'; ctx.lineWidth=2; ctx.stroke(); ctx.setLineDash([]);
  }
}

// ─── DRAW: SPRITE PLANTE ──────────────────────────────────────────────────────
function drawPlant(ctx, x, y, sprite, stageIdx, opts = {}) {
  if (!sprite) return;
  const { selected } = opts;
  const hw = TILE_W / 2, cx = x + hw;
  const scale = STAGE_SCALES[Math.min(stageIdx, 4)] || 0.5;

  // Taille d'affichage : on garde le ratio 128/160 du sprite
  const drawW = Math.min(TILE_W * 0.55 + scale * TILE_W * 0.35, TILE_W * 0.85);
  const drawH = drawW * (PNG_TH / PNG_TW); // ratio 160/128 = 1.25

  // Ancre : bas du sprite = surface du bloc
  const baseY  = y + TILE_H - 4;
  const sprX   = cx - drawW / 2;
  const sprY   = baseY - drawH;

  // Ombre portée
  ctx.fillStyle = 'rgba(0,0,0,0.20)';
  ctx.beginPath(); ctx.ellipse(cx, baseY+1, drawW*0.28, drawW*0.07, 0, 0, Math.PI*2); ctx.fill();

  // Lueur verte stades avancés
  if (stageIdx >= 2) {
    ctx.fillStyle = 'rgba(46,125,50,0.18)';
    ctx.beginPath(); ctx.ellipse(cx, baseY, drawW*0.20, drawW*0.05, 0, 0, Math.PI*2); ctx.fill();
  }

  // Sprite PNG — net, sans filtre
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sprite, sprX, sprY, drawW, drawH);

  // Sélection
  if (selected) {
    const hw2 = TILE_W/2, hh = TILE_H/2;
    ctx.beginPath();
    ctx.moveTo(cx,y); ctx.lineTo(x+TILE_W,y+hh); ctx.lineTo(cx,y+TILE_H); ctx.lineTo(x,y+hh); ctx.closePath();
    ctx.fillStyle='rgba(255,255,255,0.10)'; ctx.fill();
    ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke();
  }

  // Barre de progression
  if (stageIdx > 0) {
    const bw=18, bh=3, bx=x+TILE_W-bw-3, by=y+TILE_H+TILE_D-5;
    ctx.fillStyle='rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.roundRect(bx,by,bw,bh,1); ctx.fill();
    const cols=['#8b5e3c','#4a9e20','#2e7d32','#388e3c','#66bb6a'];
    ctx.fillStyle=cols[stageIdx]||'#4a9e20'; ctx.beginPath(); ctx.roundRect(bx,by,bw*((stageIdx+1)/PNG_COLS),bh,1); ctx.fill();
  }

  // Badge PRÊTE stade 4
  if (stageIdx === 4) {
    ctx.fillStyle='#e63946'; ctx.beginPath(); ctx.roundRect(cx-16, sprY-12, 32, 11, 2); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 7px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('PRÊTE!', cx, sprY-6);
  }
}

// ─── DRAW: CASE VIDE ──────────────────────────────────────────────────────────
function drawEmpty(ctx, x, y) {
  ctx.fillStyle='rgba(255,255,255,0.07)';
  ctx.font='9px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('·', x+TILE_W/2, y+TILE_H+3);
}

// ─── DRAW: EMOJI FALLBACK ─────────────────────────────────────────────────────
function drawEmoji(ctx, x, y, emoji, scale) {
  const cx=x+TILE_W/2, baseY=y+TILE_H;
  const fs=Math.round(12+scale*14);
  ctx.save(); ctx.font=`${fs}px sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.globalAlpha=0.85; ctx.fillText(emoji, cx, baseY-fs*0.5); ctx.restore();
}

// ─── HOOK PRINCIPAL ───────────────────────────────────────────────────────────
export default function useTileRenderer() {
  const canvasRef   = useRef(null);
  const [ready, setReady] = useState(_ready);
  const layoutRef   = useRef(calcLayout());

  useEffect(() => {
    if (_ready) { setReady(true); return; }
    onReady(() => setReady(true));
    loadAll();
  }, []);

  const layout = layoutRef.current;

  const getSprite = useCallback((plantId, stageIdx) => {
    const info = TILE_MAP[plantId];
    if (!info) return null;
    const col = Math.min(Math.max(stageIdx, 0), PNG_COLS - 1);
    return spriteCache[`${info.file}-${info.row}-${col}`] || null;
  }, []);

  const getDbPlant = useCallback(
    (plantId) => PLANTS_DB.find(p => p.id === plantId) || null,
    []
  );

  // ─── RENDER ────────────────────────────────────────────────────────────────
  const render = useCallback((canvas, serre, selectedIdx, movingIdx) => {
    if (!canvas || !_ready) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const { W, H, ox, oy } = layout;

    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    canvas.style.maxWidth = '100%';
    canvas.style.display = 'block';
    canvas.style.margin  = '0 auto';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    drawBg(ctx, W, H);
    ctx.save();
    ctx.translate(ox, oy);

    // Painter's algorithm : back → front
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const idx = r * GRID_COLS + c;
        const { x, y } = isoXY(c, r);
        const alv = serre.alveoles[idx];
        const isSelected = selectedIdx === idx;
        const isMoving   = movingIdx   === idx;

        if (alv) {
          // Stade : alv.status en priorité
          const stageIdx = (alv.status !== undefined && alv.status !== null)
            ? Math.min(Math.max(Number(alv.status), 0), PNG_COLS - 1)
            : 0;

          drawBlock(ctx, x, y, { selected: isSelected, isMoving, stageIdx, seed: idx*137+r*31+c*53 });

          const sprite = getSprite(alv.plantId, stageIdx);
          if (sprite) {
            drawPlant(ctx, x, y, sprite, stageIdx, { selected: isSelected });
          } else {
            const dbp = getDbPlant(alv.plantId);
            drawEmoji(ctx, x, y, dbp?.icon || '🌿', STAGE_SCALES[stageIdx] || 0.5);
          }
        } else {
          drawBlock(ctx, x, y, { selected: isSelected, stageIdx: -1, seed: idx*137+r*31+c*53 });
          drawEmpty(ctx, x, y);
        }
      }
    }

    ctx.restore();
  }, [layout, getSprite, getDbPlant]);

  const getClickedCell = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const lw = parseFloat(canvas.style.width)  || canvas.width;
    const lh = parseFloat(canvas.style.height) || canvas.height;
    const px = (clientX - rect.left) * (lw / rect.width);
    const py = (clientY - rect.top)  * (lh / rect.height);
    return screenToCell(px, py, layout.ox, layout.oy);
  }, [layout]);

  return { canvasRef, render, ready, getClickedCell, TILE_MAP };
}

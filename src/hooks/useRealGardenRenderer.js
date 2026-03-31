// ── REAL GARDEN RENDERER — Canvas isométrique style mini-serre ───────────────
// Remplace le système CSS 3D par un rendu Canvas cohérent avec les mini-serres

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── GRID CONFIG ───────────────────────────────────────────────────────────────
export const GARDEN_GRID_COLS = 12;
export const GARDEN_GRID_ROWS = 10;
const TILE_W = 80;
const TILE_H = 40;
const TILE_D = 16;

// ─── SPRITES CONFIG ───────────────────────────────────────────────────────────
const SPRITE_BASE = '/tileset/garden/';
const SPRITE_SIZE = 128;

// Map des types d'objets vers les sprites
const OBJECT_SPRITES = {
  tree_oak: 'oak.png',
  tree_maple: 'maple.png',
  tree_pine: 'pine.png',
  cherry_tree: 'cherry.png',
  apple_tree: 'apple.png',
  pear_tree: 'apple.png',
  plum_tree: 'cherry.png',
  hedge_straight: 'hedge.png',
  hedge_corner: 'hedge.png',
  shrub_round: 'shrub.png',
  shrub_tall: 'shrub.png',
  blueberry: 'berry.png',
  raspberry: 'berry.png',
  strawberry_bed: 'berry.png',
  garden_shed: 'shed.png',
  greenhouse_small: 'greenhouse.png',
  greenhouse_large: 'greenhouse.png',
};

// Couleurs des objets (fallback si pas de sprite)
const OBJECT_COLORS = {
  tree: { top: '#4a8c2a', side: '#3d6b1f', dark: '#2d5a0f' },
  fruit_tree: { top: '#5d4037', side: '#4a3320', dark: '#3e2723' },
  hedge: { top: '#4a9e20', side: '#3a7e18', dark: '#2a5e10' },
  shrub: { top: '#66bb6a', side: '#4caf50', dark: '#388e3c' },
  small_fruit: { top: '#7b1fa2', side: '#6a1b9a', dark: '#4a148c' },
  shed: { top: '#8d6e63', side: '#6d4c41', dark: '#5d4037' },
  greenhouse: { top: '#81c784', side: '#66bb6a', dark: '#4caf50' },
};

// ─── CACHE ─────────────────────────────────────────────────────────────────────
const imgCache = new Map();

function loadImg(url) {
  if (imgCache.has(url)) return Promise.resolve(imgCache.get(url));
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => { imgCache.set(url, img); res(img); };
    img.onerror = () => rej(new Error('404: ' + url));
    img.src = url;
  });
}

// ─── ISO MATH ─────────────────────────────────────────────────────────────────
function isoXY(c, r) {
  return { x: (c - r) * (TILE_W / 2), y: (c + r) * (TILE_H / 2) };
}

function screenToCell(px, py, ox, oy) {
  const rx = px - ox;
  const ry = py - oy;

  const col = (rx / (TILE_W / 2) + ry / (TILE_H / 2)) / 2;
  const row = (ry / (TILE_H / 2) - rx / (TILE_W / 2)) / 2;

  console.log('[screenToCell] px/py:', px.toFixed(0), py.toFixed(0));
  console.log('[screenToCell] ox/oy:', ox.toFixed(0), oy.toFixed(0));
  console.log('[screenToCell] rx/ry:', rx.toFixed(0), ry.toFixed(0));
  console.log('[screenToCell] col/row:', col.toFixed(1), row.toFixed(1));

  const tc = Math.round(col);
  const tr = Math.round(row);

  console.log('[screenToCell] tr/tc:', tr, tc);
  console.log('[screenToCell] limites:', GARDEN_GRID_ROWS, GARDEN_GRID_COLS);

  if (tr >= 0 && tr < GARDEN_GRID_ROWS && tc >= 0 && tc < GARDEN_GRID_COLS) {
    console.log('[screenToCell] OK!');
    return { row: tr, col: tc };
  }

  console.log('[screenToCell] HORS LIMITES');
  return null;
}

function calcLayout() {
  const pos = [];
  for (let r = 0; r < GARDEN_GRID_ROWS; r++)
    for (let c = 0; c < GARDEN_GRID_COLS; c++)
      pos.push(isoXY(c, r));
  const minX = Math.min(...pos.map(p => p.x));
  const maxX = Math.max(...pos.map(p => p.x)) + TILE_W;
  const minY = Math.min(...pos.map(p => p.y));
  const maxY = Math.max(...pos.map(p => p.y)) + TILE_H + TILE_D;
  const headroom = 120; // Plus grand pour les arbres
  const padX = 20, padTop = headroom + 20, padBot = 20;
  return {
    W: maxX - minX + padX * 2,
    H: maxY - minY + padTop + padBot,
    ox: -minX + padX,
    oy: -minY + padTop,
  };
}

// ─── DRAW: FOND ───────────────────────────────────────────────────────────────
function drawBg(ctx, w, h) {
  // Ciel
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#87CEEB');
  g.addColorStop(0.6, '#B3E5FC');
  g.addColorStop(0.8, '#C8E6C9');
  g.addColorStop(1, '#A5D6A7');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Ligne d'horizon / collines
  ctx.fillStyle = '#81C784';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.65);
  ctx.quadraticCurveTo(w * 0.3, h * 0.6, w * 0.5, h * 0.62);
  ctx.quadraticCurveTo(w * 0.7, h * 0.64, w, h * 0.58);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.fill();

  // Herbe plus claire
  ctx.fillStyle = '#A5D6A7';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.75);
  ctx.quadraticCurveTo(w * 0.25, h * 0.7, w * 0.5, h * 0.72);
  ctx.quadraticCurveTo(w * 0.75, h * 0.74, w, h * 0.68);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.fill();
}

// ─── DRAW: TILE SOL ───────────────────────────────────────────────────────────
function drawGroundTile(ctx, x, y, opts = {}) {
  const { selected, highlighted } = opts;
  const hw = TILE_W/2, hh = TILE_H/2, cx = x + hw;

  // Top face - herbe
  ctx.beginPath();
  ctx.moveTo(cx, y);
  ctx.lineTo(x + TILE_W, y + hh);
  ctx.lineTo(cx, y + TILE_H);
  ctx.lineTo(x, y + hh);
  ctx.closePath();

  const g = ctx.createLinearGradient(x, y, x + TILE_W, y + TILE_H);
  if (highlighted) {
    g.addColorStop(0, '#81C784');
    g.addColorStop(1, '#66BB6A');
  } else {
    g.addColorStop(0, '#66BB6A');
    g.addColorStop(1, '#4CAF50');
  }
  ctx.fillStyle = g;
  ctx.fill();

  // Texture herbe
  ctx.save(); ctx.clip();
  ctx.fillStyle = 'rgba(46, 125, 50, 0.2)';
  for (let i = 0; i < 3; i++) {
    const rx = x + 10 + (i * 20) % TILE_W;
    const ry = y + 5 + (i * 12) % TILE_H;
    ctx.fillRect(rx, ry, 2, 3);
  }
  ctx.restore();

  // Outline
  ctx.strokeStyle = selected ? '#fff' : 'rgba(255,255,255,0.2)';
  ctx.lineWidth = selected ? 2 : 0.5;
  ctx.globalAlpha = selected ? 0.9 : 0.5;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Faces latérales (terre)
  ctx.beginPath();
  ctx.moveTo(x, y + hh);
  ctx.lineTo(cx, y + TILE_H);
  ctx.lineTo(cx, y + TILE_H + TILE_D);
  ctx.lineTo(x, y + hh + TILE_D);
  ctx.closePath();
  ctx.fillStyle = '#5D4037';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx, y + TILE_H);
  ctx.lineTo(x + TILE_W, y + hh);
  ctx.lineTo(x + TILE_W, y + hh + TILE_D);
  ctx.lineTo(cx, y + TILE_H + TILE_D);
  ctx.closePath();
  ctx.fillStyle = '#4E342E';
  ctx.fill();
}

// ─── DRAW: OBJECT ─────────────────────────────────────────────────────────────
function drawObject(ctx, x, y, obj, opts = {}) {
  const { selected } = opts;
  const hw = TILE_W / 2;
  const cx = x + hw;

  // Scale selon la taille de l'objet
  const sizeScale = obj.spanCells ? Math.min(obj.spanCells * 0.6, 1.5) : 0.8;
  const scale = sizeScale;

  // Taille d'affichage
  const drawW = TILE_W * (1.2 + scale * 0.5);
  const drawH = drawW * 1.25;

  // Position ancrée au sol
  const anchorY = y + TILE_H * 0.4;
  const sprY = anchorY - drawH * 0.95;
  const sprX = cx - drawW / 2;

  // Ombre
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(cx, anchorY + 2, drawW * 0.3, drawW * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dessin sprite ou fallback
  const spriteFile = OBJECT_SPRITES[obj.id];
  if (spriteFile && imgCache.has(SPRITE_BASE + spriteFile)) {
    const img = imgCache.get(SPRITE_BASE + spriteFile);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, sprX, sprY, drawW, drawH);
  } else {
    // Fallback - dessin géométrique
    drawFallbackObject(ctx, cx, anchorY, obj, scale);
  }

  // Sélection
  if (selected) {
    ctx.beginPath();
    ctx.moveTo(cx, y);
    ctx.lineTo(x + TILE_W, y + TILE_H/2);
    ctx.lineTo(cx, y + TILE_H);
    ctx.lineTo(x, y + TILE_H/2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fill();
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pointeur sous l'objet
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.arc(cx, anchorY + 8, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// Dessin fallback si pas de sprite
function drawFallbackObject(ctx, cx, anchorY, obj, scale) {
  const colors = OBJECT_COLORS[obj.type] || OBJECT_COLORS.tree;
  const size = 25 * scale;

  // Base (tronc ou fondation)
  ctx.fillStyle = colors.side;
  ctx.fillRect(cx - size * 0.3, anchorY - size, size * 0.6, size);

  // Cime/Forme principale
  ctx.fillStyle = colors.top;
  ctx.beginPath();
  ctx.arc(cx, anchorY - size * 1.5, size, 0, Math.PI * 2);
  ctx.fill();

  // Ombre interne
  ctx.fillStyle = colors.dark;
  ctx.beginPath();
  ctx.arc(cx + size * 0.3, anchorY - size * 1.3, size * 0.6, 0, Math.PI * 2);
  ctx.fill();

  // Emoji
  ctx.font = `${Math.floor(size)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(obj.emoji || '🌳', cx, anchorY - size * 1.5);
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────────
export default function useRealGardenRenderer() {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  // Layout recalculé à chaque render pour s'adapter au container
  const layout = calcLayout();

  // Précharger les images
  useEffect(() => {
    const loadAll = async () => {
      const files = [...new Set(Object.values(OBJECT_SPRITES))];
      await Promise.allSettled(
        files.map(f => loadImg(SPRITE_BASE + f).catch(() => null))
      );
      setReady(true);
      console.log('[RealGardenRenderer] Images chargées');
    };
    loadAll();
  }, []);

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  const render = useCallback((canvas, objects, selectedId, highlightedCell) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const { W, H, ox, oy } = layout;

    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    canvas.style.maxWidth = '100%';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    drawBg(ctx, W, H);
    ctx.save();
    ctx.translate(ox, oy);

    // Grille de fond (tous les tiles)
    for (let r = 0; r < GARDEN_GRID_ROWS; r++) {
      for (let c = 0; c < GARDEN_GRID_COLS; c++) {
        const { x, y } = isoXY(c, r);
        const isHighlighted = highlightedCell &&
          highlightedCell.row === r && highlightedCell.col === c;
        drawGroundTile(ctx, x, y, { highlighted: isHighlighted });
      }
    }

    // Objets (triés par position pour le Z-index correct)
    const sortedObjects = [...objects].sort((a, b) => {
      const posA = a.position || { row: 0, col: 0 };
      const posB = b.position || { row: 0, col: 0 };
      return (posA.row + posA.col) - (posB.row + posB.col);
    });

    sortedObjects.forEach(obj => {
      const pos = obj.position || { row: 0, col: 0 };
      const { x, y } = isoXY(pos.col, pos.row);
      const isSelected = selectedId === obj.uid;
      drawObject(ctx, x, y, obj, { selected: isSelected });
    });

    ctx.restore();
  }, [layout]);

  // ─── HIT TEST ─────────────────────────────────────────────────────────────────
  const getCellAt = (clientX, clientY) => {
    console.log('>>> getCellAt START');
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('>>> PAS DE CANVAS');
      return null;
    }
    const rect = canvas.getBoundingClientRect();
    console.log('>>> RECT:', rect.left, rect.top, rect.width, rect.height);

    const rx = (clientX - rect.left) / rect.width;
    const ry = (clientY - rect.top) / rect.height;
    console.log('>>> rx/ry %:', rx.toFixed(2), ry.toFixed(2));

    const px = rx * layout.W;
    const py = ry * layout.H;
    console.log('>>> px/py:', px.toFixed(0), py.toFixed(0));
    console.log('>>> layout:', layout.W, layout.H, layout.ox, layout.oy);

    // Calcul direct ici au lieu d'appeler screenToCell
    const rx2 = px - layout.ox;
    const ry2 = py - layout.oy;
    const col = (rx2 / (TILE_W / 2) + ry2 / (TILE_H / 2)) / 2;
    const row = (ry2 / (TILE_H / 2) - rx2 / (TILE_W / 2)) / 2;
    const tc = Math.round(col);
    const tr = Math.round(row);

    console.log('>>> col/row:', col.toFixed(1), row.toFixed(1));
    console.log('>>> tc/tr:', tc, tr);
    console.log('>>> limites:', GARDEN_GRID_COLS, GARDEN_GRID_ROWS);

    if (tr >= 0 && tr < GARDEN_GRID_ROWS && tc >= 0 && tc < GARDEN_GRID_COLS) {
      console.log('>>> OK!');
      return { row: tr, col: tc };
    }
    console.log('>>> HORS LIMITES');
    return null;
  };

  // ─── FIND OBJECT AT ──────────────────────────────────────────────────────────
  const getObjectAt = useCallback((clientX, clientY) => {
    const cell = getCellAt(clientX, clientY);
    if (!cell) return null;

    // Chercher un objet à cette position
    return null; // Sera implémenté avec les données
  }, [getCellAt]);

  return {
    canvasRef,
    render,
    ready,
    layout,
    GARDEN_GRID_COLS,
    GARDEN_GRID_ROWS,
  };
}

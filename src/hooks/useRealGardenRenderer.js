// ── REAL GARDEN RENDERER — Canvas isométrique style mini-serre ───────────────
// Remplace le système CSS 3D par un rendu Canvas cohérent avec les mini-serres

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── GRID CONFIG ───────────────────────────────────────────────────────────────
export const GARDEN_GRID_COLS = 12;
export const GARDEN_GRID_ROWS = 10;
const TILE_W = 80;
const TILE_H = 40;
const TILE_D = 16;
const DEBUG_LOG = false; // Mettre à true pour débugger

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
  wooden_greenhouse: { top: '#A0522D', side: '#8B4513', dark: '#6B3510' },
  // Cel-shaded tree colors
  tree_leaf1: '#4a8c2a',
  tree_leaf2: '#2d5a0f',
  tree_leaf3: '#6ab04a',
  fruit_leaf1: '#5d4037',
  fruit_leaf2: '#3e2723',
  fruit_leaf3: '#8d6e63',
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

function screenToCell(px, py, layout) {
  const rx = px - layout.ox;
  const ry = py - layout.oy;

  const col = (rx / (TILE_W / 2) + ry / (TILE_H / 2)) / 2;
  const row = (ry / (TILE_H / 2) - rx / (TILE_W / 2)) / 2;

  const tc = Math.round(col);
  const tr = Math.round(row);

  if (tr >= 0 && tr < GARDEN_GRID_ROWS && tc >= 0 && tc < GARDEN_GRID_COLS) {
    return { row: tr, col: tc };
  }
  return null;
}

// Layout précalculé (constant — les tuiles ne changent jamais)
const LAYOUT = (() => {
  const pos = [];
  for (let r = 0; r < GARDEN_GRID_ROWS; r++)
    for (let c = 0; c < GARDEN_GRID_COLS; c++)
      pos.push(isoXY(c, r));
  const minX = Math.min(...pos.map(p => p.x));
  const maxX = Math.max(...pos.map(p => p.x)) + TILE_W;
  const minY = Math.min(...pos.map(p => p.y));
  const maxY = Math.max(...pos.map(p => p.y)) + TILE_H + TILE_D;
  const headroom = 120;
  const padX = 20, padTop = headroom + 20, padBot = 20;
  return {
    W: maxX - minX + padX * 2,
    H: maxY - minY + padTop + padBot,
    ox: -minX + padX,
    oy: -minY + padTop,
  };
})();

// ─── DRAW: FOND ───────────────────────────────────────────────────────────────
function drawBg(ctx, w, h, layout) {
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

  // Rivière sinueuse (en bas du jardin)
  ctx.save();
  const riverW = w * 0.15;
  const riverX = w * 0.78;
  const riverGrad = ctx.createLinearGradient(0, h * 0.72, 0, h);
  riverGrad.addColorStop(0, '#4FC3F7');
  riverGrad.addColorStop(0.5, '#29B6F6');
  riverGrad.addColorStop(1, '#0288D1');
  ctx.fillStyle = riverGrad;
  ctx.beginPath();
  ctx.moveTo(riverX, h * 0.72);
  ctx.bezierCurveTo(riverX - riverW * 0.5, h * 0.78, riverX + riverW * 0.3, h * 0.85, riverX - riverW * 0.2, h * 0.9);
  ctx.bezierCurveTo(riverX + riverW * 0.1, h * 0.95, riverX + riverW * 0.4, h * 0.98, riverX, h);
  ctx.lineTo(riverX + riverW, h);
  ctx.bezierCurveTo(riverX + riverW * 1.4, h * 0.98, riverX + riverW * 0.9, h * 0.95, riverX + riverW * 1.2, h * 0.9);
  ctx.bezierCurveTo(riverX + riverW * 0.7, h * 0.85, riverX + riverW * 1.5, h * 0.78, riverX + riverW, h * 0.72);
  ctx.closePath();
  ctx.fill();
  // Reflets
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.ellipse(riverX + riverW * 0.3, h * 0.82, riverW * 0.15, 4, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(riverX + riverW * 0.7, h * 0.92, riverW * 0.1, 3, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
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

  // Cas spécial serre en bois avec plan de travail et vitrage
  if (obj.structureType === 'wooden_greenhouse') {
    const w = size * 2.5;
    const h = size * 1.8;
    const bx = cx - w / 2;
    const by = anchorY - h;
    // Structure bois
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(bx, by, w, h);
    // Vitrage (lignes horizontales)
    ctx.fillStyle = 'rgba(144,238,144,0.5)';
    ctx.fillRect(bx + 4, by + 4, w - 8, h * 0.4);
    // Plan de travail (étagère)
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(bx - 2, by + h * 0.5, w + 4, 6);
    ctx.fillRect(bx - 2, by + h * 0.75, w + 4, 6);
    // Pieds de l'étagère
    ctx.fillStyle = '#6B3510';
    ctx.fillRect(bx + 8, by + h * 0.5, 4, h * 0.4);
    ctx.fillRect(bx + w - 12, by + h * 0.5, 4, h * 0.4);
    // Toit vitré
    ctx.fillStyle = 'rgba(144,238,144,0.3)';
    ctx.beginPath();
    ctx.moveTo(cx, by - h * 0.4);
    ctx.lineTo(bx + w + 6, by + 4);
    ctx.lineTo(bx - 6, by + 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.stroke();
    return;
  }

  // ── Arbres en style cel-shading / carton ──────────────────────────────
  const isTree = obj.type === 'tree' || obj.type === 'small_fruit';
  if (isTree || obj.structureType === 'tree' || obj.structureType === 'fruit_tree') {
    const trunkW = size * 0.28;
    const trunkH = size * 0.95;
    const leafR = size * 0.72;

    // Tronc (brun cartons avec contour sombre)
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(cx - trunkW / 2, anchorY - trunkH, trunkW, trunkH);
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - trunkW / 2, anchorY - trunkH, trunkW, trunkH);

    // Cernes du tronc (detail carton)
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - trunkW * 0.1, anchorY - trunkH);
    ctx.lineTo(cx - trunkW * 0.1, anchorY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + trunkW * 0.3, anchorY - trunkH);
    ctx.lineTo(cx + trunkW * 0.3, anchorY);
    ctx.stroke();

    // Feuillage : 3 cercles superposés style cel-shading
    const top1 = anchorY - size * 1.85;
    const top2 = anchorY - size * 1.5;
    const top3 = anchorY - size * 1.15;
    const l1 = OBJECT_COLORS.tree_leaf1 || '#4a8c2a';
    const l2 = OBJECT_COLORS.tree_leaf2 || '#2d5a0f';
    const l3 = OBJECT_COLORS.tree_leaf3 || '#6ab04a';

    // Cercle principal (fond)
    ctx.fillStyle = l1;
    ctx.beginPath();
    ctx.arc(cx, top1, leafR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1a3a06';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Cercle gauche
    ctx.fillStyle = l2;
    ctx.beginPath();
    ctx.arc(cx - leafR * 0.55, top2, leafR * 0.75, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1a3a06';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Cercle droite (highlight)
    ctx.fillStyle = l3;
    ctx.beginPath();
    ctx.arc(cx + leafR * 0.45, top3, leafR * 0.65, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1a3a06';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Reflet clair (highlight cel-shading)
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.ellipse(cx - leafR * 0.25, top1 - leafR * 0.25, leafR * 0.2, leafR * 0.15, -0.5, 0, Math.PI * 2);
    ctx.fill();

    return;
  }

  // ── Autres objets : dessin geometrique simple ──
  ctx.fillStyle = colors.side;
  ctx.fillRect(cx - size * 0.3, anchorY - size, size * 0.6, size);

  ctx.fillStyle = colors.top;
  ctx.beginPath();
  ctx.arc(cx, anchorY - size * 1.5, size, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#1a3a06';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = `${Math.floor(size)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(obj.emoji || '🌳', cx, anchorY - size * 1.5);
}

// Dessin d'un segment de clôture sur une arête de tuile
function drawFenceSegment(ctx, x, y, orientation, fenceDef, opts = {}) {
  const { preview, selected } = opts;
  const hw = TILE_W / 2;
  const hh = TILE_H / 2;

  let x1, y1, x2, y2;
  if (orientation === 'H') {
    x1 = x + hw; y1 = y + hh;
    x2 = x + TILE_W; y2 = y + hh;
  } else {
    x1 = x; y1 = y + hh;
    x2 = x + hw; y2 = y + TILE_H;
  }

  const color = fenceDef.color || '#8B4513';
  ctx.save();
  ctx.globalAlpha = preview ? 0.6 : 0.9;

  if (fenceDef.style === 'mesh') {
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.lineWidth = 1;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len, ny = dx / len;
    const step = 8;
    ctx.beginPath();
    for (let t = step; t < len; t += step) {
      const px = x1 + dx * (t / len);
      const py = y1 + dy * (t / len);
      ctx.moveTo(px + nx * 4, py + ny * 4);
      ctx.lineTo(px - nx * 4, py - ny * 4);
    }
    ctx.stroke();
  } else if (fenceDef.style === 'wire') {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (fenceDef.style === 'wall') {
    ctx.fillStyle = color;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len * 5, ny = dx / len * 5;
    ctx.beginPath();
    ctx.moveTo(x1 + nx, y1 + ny);
    ctx.lineTo(x2 + nx, y2 + ny);
    ctx.lineTo(x2 - nx, y2 - ny);
    ctx.lineTo(x1 - nx, y1 - ny);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = fenceDef.style === 'picket' ? 2 : 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const steps = fenceDef.style === 'picket' ? 4 : 3;
    ctx.lineWidth = 2;
    for (let t = 1; t < steps; t++) {
      const px = x1 + dx * (t / steps);
      const py = y1 + dy * (t / steps);
      const perpX = -dy / len * 6;
      const perpY = dx / len * 6;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + perpX, py + perpY);
      ctx.stroke();
    }
  }

  // Indicateur de sélection
  if (selected) {
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  ctx.restore();
}

// Dessin du filler preview (ligne de pose en cours)
function drawFencePreview(ctx, startCell, endCell, orientation, fenceDef) {
  const { x: x1, y: y1 } = isoXY(startCell.col, startCell.row);
  const { x: x2, y: y2 } = isoXY(endCell.col, endCell.row);
  const hw = TILE_W / 2, hh = TILE_H / 2;

  let fx1, fy1, fx2, fy2;
  if (orientation === 'H') {
    fx1 = x1 + hw; fy1 = y1 + hh; fx2 = x2 + hw; fy2 = y2 + hh;
  } else {
    fx1 = x1; fy1 = y1 + hh; fx2 = x2; fy2 = y2 + TILE_H;
  }

  ctx.save();
  ctx.strokeStyle = fenceDef.color || '#ffa500';
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 4]);
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.moveTo(fx1, fy1);
  ctx.lineTo(fx2, fy2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────────
export default function useRealGardenRenderer() {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  // Précharger les images
  useEffect(() => {
    const loadAll = async () => {
      const files = [...new Set(Object.values(OBJECT_SPRITES))];
      await Promise.allSettled(
        files.map(f => loadImg(SPRITE_BASE + f).catch(() => null))
      );
      setReady(true);
    };
    loadAll();
  }, []);

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  const render = useCallback((canvas, objects, selectedId, highlightedCell, fenceDraft, hoveredCell) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(LAYOUT.W * dpr);
    canvas.height = Math.round(LAYOUT.H * dpr);
    canvas.style.width = LAYOUT.W + 'px';
    canvas.style.height = LAYOUT.H + 'px';
    canvas.style.maxWidth = '100%';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    drawBg(ctx, LAYOUT.W, LAYOUT.H, LAYOUT);
    ctx.save();
    ctx.translate(LAYOUT.ox, LAYOUT.oy);

    // Grille de fond (tous les tiles)
    for (let r = 0; r < GARDEN_GRID_ROWS; r++) {
      for (let c = 0; c < GARDEN_GRID_COLS; c++) {
        const { x, y } = isoXY(c, r);
        const isHighlighted = highlightedCell &&
          highlightedCell.row === r && highlightedCell.col === c;
        drawGroundTile(ctx, x, y, { highlighted: isHighlighted });
      }
    }

    // Séparer clôtures et objets réguliers
    const fences = objects.filter(o => o.type === 'fence');
    const regularObjects = objects.filter(o => o.type !== 'fence');

    // Dessiner les segments de clôture (sous les objets, sur la grille)
    fences.forEach(fence => {
      const pos = fence.position || { row: 0, col: 0 };
      const { x, y } = isoXY(pos.col, pos.row);
      const isSelected = selectedId === fence.uid;
      drawFenceSegment(ctx, x, y, fence.fenceOrientation || 'H', fence, { selected: isSelected });
    });

    // Dessiner le preview de clôture en cours (ligne de la start à la cell survolée)
    if (fenceDraft && hoveredCell) {
      drawFencePreview(ctx, fenceDraft.cell, hoveredCell, fenceDraft.orientation, fenceDraft.fenceDef);
    }

    // Dessiner les objets réguliers (triés par Z-order)
    const sortedObjects = [...regularObjects].sort((a, b) => {
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
  }, []);

  // ─── HIT TEST ─────────────────────────────────────────────────────────────────
  const getCellAt = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    const rx = (clientX - rect.left) / rect.width;
    const ry = (clientY - rect.top) / rect.height;

    const px = rx * LAYOUT.W;
    const py = ry * LAYOUT.H;

    return screenToCell(px, py, LAYOUT);
  };

  // ─── FIND OBJECT AT ──────────────────────────────────────────────────────────
  const getObjectAt = useCallback((clientX, clientY, objects) => {
    const cell = getCellAt(clientX, clientY);
    if (!cell) return null;

    // Retourne le premier objet à cette cellule (Z-order: dernier = au-dessus)
    const atCell = objects.filter(o => {
      const p = o.position || {};
      return p.row === cell.row && p.col === cell.col;
    });
    return atCell.length > 0 ? atCell[atCell.length - 1] : null;
  }, [getCellAt]);

  return {
    canvasRef,
    render,
    ready,
    layout: LAYOUT,
    getCellAt,
    getObjectAt,
    GARDEN_GRID_COLS,
    GARDEN_GRID_ROWS,
  };
}

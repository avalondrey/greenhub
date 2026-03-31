#!/usr/bin/env node
/**
 * generate-clean-sprites.js v2 - Sprites réalistes et plus gros
 * ================================================================
 * Génère des sprites de plantes réalistes, sans texte.
 * Stades 0-3 agrandis, stade 4 ajusté.
 */

import { createCanvas } from 'canvas';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

const OUT_DIR = 'public/tileset/miniserre';

const TILE_W = 128;
const TILE_H = 160;
const STAGES = 5;

// Palettes réalistes
const PALETTES = {
  tomate: {
    stem: '#3d6b1f',
    stemLight: '#5a8c2a',
    leaf: '#4a8c1a',
    leafLight: '#6ab52a',
    leafDark: '#2d5a0f',
    fruit: '#d32f2f',
    fruitLight: '#ff5252',
    fruitDark: '#b71c1c',
    flower: '#ffeb3b',
    soil: '#5d4037',
  },
};

// Utilitaires
function setPixel(ctx, x, y, color, size = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
}

function drawCircle(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawGradientCircle(ctx, cx, cy, r, colorCenter, colorEdge) {
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, colorCenter);
  grad.addColorStop(1, colorEdge);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

// Salade/Laitue réaliste
function drawSalade(ctx, stage) {
  const cx = TILE_W / 2;
  const baseY = TILE_H - 5;

  const scales = [0.4, 0.7, 1.1, 1.5, 1.8];
  const scale = scales[stage];

  const colors = {
    leaf: '#7cb342',
    leafLight: '#aed581',
    leafDark: '#558b2f',
    center: '#c8e6c9',
  };

  // Rosette de feuilles
  const leafCount = 3 + stage * 3;
  const maxSize = (20 + stage * 15) * scale;

  for (let i = leafCount - 1; i >= 0; i--) {
    const angle = (i / leafCount) * Math.PI * 2;
    const dist = i * 8 * scale;
    const size = maxSize * (0.6 + (i / leafCount) * 0.4);
    const lx = cx + Math.cos(angle) * dist * 0.5;
    const ly = baseY - 10 - i * 5;

    const color = i < 2 ? colors.center : (i < leafCount * 0.4 ? colors.leafLight : colors.leaf);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(lx, ly, size, size * 0.5, angle, 0, Math.PI * 2);
    ctx.fill();

    // Texture nervures
    ctx.strokeStyle = colors.leafDark;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(lx - size * 0.3, ly);
    ctx.quadraticCurveTo(lx, ly - size * 0.2, lx + size * 0.3, ly);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

// Carotte réaliste
function drawCarotte(ctx, stage) {
  const cx = TILE_W / 2;
  const baseY = TILE_H - 5;

  const scales = [0.5, 0.8, 1.2, 1.5, 1.7];
  const scale = scales[stage];

  const colors = {
    leaf: '#7cb342',
    leafDark: '#558b2f',
    root: '#e65100',
    rootLight: '#ff8f00',
    rootDark: '#bf360c',
  };

  // Racine orange (visible stade 2+)
  if (stage >= 2) {
    const rootH = 15 + (stage - 1) * 12;
    const rootW = 10 + (stage - 1) * 4;

    ctx.fillStyle = colors.root;
    ctx.beginPath();
    ctx.ellipse(cx, baseY + rootH * 0.3, rootW * 0.7, rootH * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Texture
    ctx.strokeStyle = colors.rootDark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, baseY + 5);
    ctx.lineTo(cx, baseY + rootH * 0.6);
    ctx.stroke();

    // Highlight
    ctx.fillStyle = colors.rootLight;
    ctx.beginPath();
    ctx.ellipse(cx - rootW * 0.3, baseY + rootH * 0.2, rootW * 0.2, rootH * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Feuillage
  const leafCount = 4 + stage * 3;
  const leafHeight = (25 + stage * 20) * scale;

  for (let i = 0; i < leafCount; i++) {
    const angle = -0.5 + (i / (leafCount - 1)) * 1;
    const x = cx + Math.sin(angle) * (5 + i * 3);
    const y = baseY - 10 - (i / leafCount) * leafHeight * 0.8;
    const size = (8 + stage * 4) * scale;

    ctx.fillStyle = i % 2 === 0 ? colors.leaf : colors.leafDark;
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 0.3, angle - Math.PI / 2, 0, Math.PI * 2);
    ctx.fill();

    // Nervure
    ctx.strokeStyle = colors.leafDark;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.2);
    ctx.lineTo(x, y - size * 0.2);
    ctx.stroke();
  }
}

// Herbe aromatique (basilique, persil)
function drawHerbe(ctx, stage) {
  const cx = TILE_W / 2;
  const baseY = TILE_H - 5;

  const scales = [0.5, 0.9, 1.3, 1.6, 1.8];
  const scale = scales[stage];

  const colors = {
    stem: '#558b2f',
    leaf: '#7cb342',
    leafDark: '#558b2f',
    leafLight: '#aed581',
  };

  const stems = 3 + stage * 2;

  for (let s = 0; s < stems; s++) {
    const offset = (s - stems / 2) * 10;
    const height = (30 + stage * 20 + Math.random() * 10) * scale;
    const curve = offset * 0.5;

    // Tige
    ctx.strokeStyle = colors.stem;
    ctx.lineWidth = 2 + stage;
    ctx.beginPath();
    ctx.moveTo(cx + offset * 0.3, baseY);
    ctx.quadraticCurveTo(cx + offset * 0.5 + curve, baseY - height * 0.5, cx + offset * 0.7 + curve * 2, baseY - height);
    ctx.stroke();

    // Feuilles sur la tige
    const leaves = 2 + stage * 2;
    for (let l = 0; l < leaves; l++) {
      const ly = baseY - 10 - (l / leaves) * height * 0.8;
      const lx = cx + offset * 0.5 + curve * (l / leaves);
      const size = (6 + stage * 2) * scale;
      const angle = offset > 0 ? 0.6 : -0.6;

      ctx.fillStyle = l % 2 === 0 ? colors.leaf : colors.leafLight;
      ctx.beginPath();
      ctx.ellipse(lx, ly, size, size * 0.5, angle, 0, Math.PI * 2);
      ctx.fill();

      // Texture nervures
      ctx.strokeStyle = colors.leafDark;
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lx - size * 0.3, ly);
      ctx.lineTo(lx + size * 0.3, ly);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
}

// Tomate réaliste - v2 avec vraies tomates rondes
function drawTomate(ctx, stage) {
  const cx = TILE_W / 2;
  const baseY = TILE_H - 10;
  const p = PALETTES.tomate;

  // Helper pour dessiner une tomate réaliste
  function drawRealTomato(tx, ty, size, color, isGreen = false) {
    const r = size;

    // Ombre portée
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(tx, ty + r * 0.3, r * 0.8, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Corps de la tomate (forme légèrement aplatie)
    const grad = ctx.createRadialGradient(tx - r * 0.3, ty - r * 0.3, 0, tx, ty, r);
    grad.addColorStop(0, isGreen ? '#9ed57a' : '#ff6b6b');
    grad.addColorStop(0.3, color);
    grad.addColorStop(1, isGreen ? '#2e5a1a' : '#8b0000');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(tx, ty, r, 0, Math.PI * 2);
    ctx.fill();

    // Reflet brillant (effet glossy)
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(tx - r * 0.35, ty - r * 0.25, r * 0.25, r * 0.15, -0.5, 0, Math.PI * 2);
    ctx.fill();

    // Reflet secondaire
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.arc(tx + r * 0.3, ty + r * 0.2, r * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Calice (étoile verte au sommet)
    ctx.fillStyle = p.stem;
    const calY = ty - r * 0.85;
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const sx = tx + Math.cos(angle) * r * 0.5;
      const sy = calY + Math.sin(angle) * r * 0.3;
      ctx.beginPath();
      ctx.ellipse(sx, sy, 3, 6, angle, 0, Math.PI * 2);
      ctx.fill();
    }

    // Centre du calice
    ctx.fillStyle = p.stemLight;
    ctx.beginPath();
    ctx.arc(tx, calY, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Helper pour dessiner une feuille de tomate
  function drawTomatoLeaf(lx, ly, size, angle, isLight = false) {
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(angle);

    // Feuille avec forme de tomate (lobes)
    ctx.fillStyle = isLight ? p.leafLight : p.leaf;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-size * 0.5, -size * 0.3, -size * 0.8, -size * 0.8);
    ctx.quadraticCurveTo(-size * 0.3, -size * 0.5, 0, -size);
    ctx.quadraticCurveTo(size * 0.3, -size * 0.5, size * 0.8, -size * 0.8);
    ctx.quadraticCurveTo(size * 0.5, -size * 0.3, 0, 0);
    ctx.fill();

    // Nervure centrale
    ctx.strokeStyle = isLight ? '#4a7c2a' : p.leafDark;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -size * 0.7);
    ctx.stroke();

    // Nervures secondaires
    ctx.strokeStyle = isLight ? 'rgba(74,124,42,0.5)' : 'rgba(45,90,15,0.5)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 3; i++) {
      const y = -size * 0.3 - i * size * 0.15;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(-size * 0.3, y - size * 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size * 0.3, y - size * 0.2);
      ctx.stroke();
    }

    ctx.restore();
  }

  if (stage === 0) {
    // Stade 0: Jeune plantule - compact
    // Terre
    ctx.fillStyle = p.soil;
    ctx.beginPath();
    ctx.ellipse(cx, baseY - 5, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tige fine
    ctx.strokeStyle = p.stem;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, baseY - 6);
    ctx.quadraticCurveTo(cx + 1, baseY - 18, cx, baseY - 25);
    ctx.stroke();

    // Deux cotylédons
    drawTomatoLeaf(cx - 6, baseY - 22, 8, -0.8, true);
    drawTomatoLeaf(cx + 6, baseY - 24, 8, 0.8, true);

  } else if (stage === 1) {
    // Stade 1: Plant en développement - réduit
    const plantH = 45;

    // Tige principale
    ctx.strokeStyle = p.stem;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, baseY);
    ctx.quadraticCurveTo(cx + 5, baseY - plantH * 0.4, cx - 3, baseY - plantH);
    ctx.stroke();

    // Branches courtes
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + 1, baseY - 18);
    ctx.quadraticCurveTo(cx + 18, baseY - 22, cx + 25, baseY - 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 1, baseY - 25);
    ctx.quadraticCurveTo(cx - 15, baseY - 28, cx - 22, baseY - 35);
    ctx.stroke();

    // Feuilles réduites
    drawTomatoLeaf(cx - 15, baseY - 15, 14, -1.0);
    drawTomatoLeaf(cx + 18, baseY - 18, 14, 1.0);
    drawTomatoLeaf(cx - 22, baseY - 32, 12, -0.7, true);
    drawTomatoLeaf(cx + 25, baseY - 28, 12, 0.8, true);
    drawTomatoLeaf(cx - 6, baseY - 42, 10, -0.3, true);

    // Boutons floraux jaunes
    ctx.fillStyle = p.flower;
    for (let i = 0; i < 3; i++) {
      const fx = cx - 12 + i * 12;
      const fy = baseY - 45 - i * 2;
      ctx.beginPath();
      ctx.arc(fx, fy, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff9800';
      ctx.beginPath();
      ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = p.flower;
    }

  } else if (stage === 2) {
    // Stade 2: Plant avec petites tomates vertes - compact
    const plantH = 65;

    // Tige principale
    ctx.strokeStyle = p.stem;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx, baseY);
    ctx.quadraticCurveTo(cx + 6, baseY - plantH * 0.3, cx, baseY - plantH * 0.7);
    ctx.quadraticCurveTo(cx - 5, baseY - plantH * 0.85, cx - 3, baseY - plantH);
    ctx.stroke();

    // Branches plus courtes
    const branches = [
      { from: [cx + 2, baseY - 18], to: [cx + 32, baseY - 26] },
      { from: [cx - 2, baseY - 28], to: [cx - 30, baseY - 38] },
      { from: [cx + 3, baseY - 42], to: [cx + 35, baseY - 55] },
      { from: [cx - 3, baseY - 55], to: [cx - 32, baseY - 68] },
    ];

    ctx.lineWidth = 3;
    branches.forEach(b => {
      ctx.beginPath();
      ctx.moveTo(b.from[0], b.from[1]);
      ctx.quadraticCurveTo((b.from[0] + b.to[0]) / 2 + 3, (b.from[1] + b.to[1]) / 2, b.to[0], b.to[1]);
      ctx.stroke();
    });

    // Feuilles réduites
    drawTomatoLeaf(cx - 18, baseY - 18, 16, -1.0);
    drawTomatoLeaf(cx + 22, baseY - 22, 16, 1.0);
    drawTomatoLeaf(cx - 28, baseY - 38, 14, -0.8);
    drawTomatoLeaf(cx + 30, baseY - 35, 14, 0.9);
    drawTomatoLeaf(cx - 22, baseY - 58, 12, -0.6, true);
    drawTomatoLeaf(cx + 26, baseY - 62, 12, 0.7, true);
    drawTomatoLeaf(cx - 8, baseY - 72, 10, -0.2, true);

    // Petites tomates VERTES - plus petites, centrées
    drawRealTomato(cx - 25, baseY - 48, 7, '#7cb342', true);
    drawRealTomato(cx + 28, baseY - 52, 8, '#7cb342', true);
    drawRealTomato(cx + 6, baseY - 68, 6, '#8bc34a', true);

    // Fleurs jaunes
    const flowers = [
      [cx - 32, baseY - 45],
      [cx + 35, baseY - 48],
      [cx - 12, baseY - 78],
    ];
    flowers.forEach(([fx, fy]) => {
      ctx.fillStyle = p.flower;
      ctx.beginPath();
      ctx.arc(fx, fy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff9800';
      ctx.beginPath();
      ctx.arc(fx, fy, 2, 0, Math.PI * 2);
      ctx.fill();
    });

  } else if (stage === 3) {
    // Stade 3: Tomates en maturation - ajusté pour tenir dans le tile
    const plantH = 85;

    // Structure de la plante
    ctx.strokeStyle = p.stem;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx, baseY);
    ctx.quadraticCurveTo(cx + 5, baseY - plantH * 0.25, cx + 2, baseY - plantH * 0.5);
    ctx.quadraticCurveTo(cx - 4, baseY - plantH * 0.75, cx - 2, baseY - plantH);
    ctx.stroke();

    // Branches ramenées vers le centre
    const branches = [
      { x1: cx + 1, y1: baseY - 22, x2: cx + 38, y2: baseY - 32, w: 4 },
      { x1: cx - 2, y1: baseY - 35, x2: cx - 40, y2: baseY - 45, w: 4 },
      { x1: cx + 2, y1: baseY - 50, x2: cx + 42, y2: baseY - 65, w: 3 },
      { x1: cx - 3, y1: baseY - 68, x2: cx - 38, y2: baseY - 82, w: 3 },
    ];

    branches.forEach(b => {
      ctx.lineWidth = b.w;
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.quadraticCurveTo((b.x1 + b.x2) / 2 + 4, (b.y1 + b.y2) / 2, b.x2, b.y2);
      ctx.stroke();
    });

    // Feuilles plus petites
    drawTomatoLeaf(cx - 25, baseY - 22, 18, -1.0);
    drawTomatoLeaf(cx + 28, baseY - 25, 18, 1.0);
    drawTomatoLeaf(cx - 38, baseY - 42, 16, -0.85);
    drawTomatoLeaf(cx + 40, baseY - 40, 16, 0.95);
    drawTomatoLeaf(cx - 32, baseY - 68, 14, -0.7, true);
    drawTomatoLeaf(cx + 36, baseY - 72, 14, 0.75, true);
    drawTomatoLeaf(cx - 18, baseY - 90, 12, -0.5, true);
    drawTomatoLeaf(cx + 22, baseY - 95, 12, 0.6, true);

    // Tomates colorées - tailles réduites, bien centrées
    drawRealTomato(cx - 38, baseY - 58, 9, '#d32f2f');     // Rouge
    drawRealTomato(cx + 42, baseY - 62, 10, '#ff5722');    // Orange-rouge
    drawRealTomato(cx - 10, baseY - 98, 8, '#ff8a65');     // Orange clair
    drawRealTomato(cx + 14, baseY - 108, 8, '#ffb74d');     // Orange
    drawRealTomato(cx + 45, baseY - 88, 7, '#7cb342');     // Verte

  } else {
    // Stade 4: Plant adulte - ajusté pour ne pas dépasser du tile 128x160
    const plantH = 95;

    // Structure principale - plus compacte
    ctx.strokeStyle = p.stem;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx, baseY);
    ctx.quadraticCurveTo(cx - 4, baseY - plantH * 0.2, cx + 2, baseY - plantH * 0.45);
    ctx.quadraticCurveTo(cx - 5, baseY - plantH * 0.7, cx - 2, baseY - plantH);
    ctx.stroke();

    // Branches ramenées vers le centre pour tenir dans [20, 108]
    const branches = [
      { x1: cx + 2, y1: baseY - 22, cp: [cx + 25, baseY - 28], x2: cx + 42, y2: baseY - 38, w: 5 },
      { x1: cx - 2, y1: baseY - 32, cp: [cx - 28, baseY - 38], x2: cx - 45, y2: baseY - 48, w: 5 },
      { x1: cx + 3, y1: baseY - 45, cp: [cx + 32, baseY - 52], x2: cx + 48, y2: baseY - 68, w: 4 },
      { x1: cx - 3, y1: baseY - 62, cp: [cx - 38, baseY - 68], x2: cx - 52, y2: baseY - 88, w: 4 },
      { x1: cx + 2, y1: baseY - 78, cp: [cx + 28, baseY - 85], x2: cx + 42, y2: baseY - 108, w: 3 },
      { x1: cx - 4, y1: baseY - 92, cp: [cx - 28, baseY - 98], x2: cx - 38, y2: baseY - 118, w: 3 },
    ];

    branches.forEach(b => {
      ctx.lineWidth = b.w;
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.quadraticCurveTo(b.cp[0], b.cp[1], b.x2, b.y2);
      ctx.stroke();
    });

    // Feuilles abondantes mais compactes
    const leafPositions = [
      { x: cx - 28, y: baseY - 25, s: 18, a: -1.0 },
      { x: cx + 32, y: baseY - 28, s: 18, a: 1.0 },
      { x: cx - 42, y: baseY - 45, s: 16, a: -0.85 },
      { x: cx + 45, y: baseY - 42, s: 16, a: 0.95 },
      { x: cx - 50, y: baseY - 75, s: 14, a: -0.7 },
      { x: cx + 52, y: baseY - 78, s: 14, a: 0.8 },
      { x: cx - 42, y: baseY - 105, s: 12, a: -0.55 },
      { x: cx + 45, y: baseY - 110, s: 12, a: 0.65 },
      { x: cx - 30, y: baseY - 128, s: 10, a: -0.4 },
      { x: cx + 32, y: baseY - 132, s: 10, a: 0.5 },
    ];

    leafPositions.forEach((l, i) => {
      drawTomatoLeaf(l.x, l.y, l.s, l.a, i > 4);
    });

    // Tomates bien mûres - tailles réduites, positions ajustées pour tenir dans le tile
    const tomatoes = [
      { x: cx - 45, y: baseY - 62, r: 10 },      // Was 15
      { x: cx + 48, y: baseY - 68, r: 11 },     // Was 16
      { x: cx - 12, y: baseY - 128, r: 10 },    // Was 14
      { x: cx + 18, y: baseY - 135, r: 10 },    // Was 15
      { x: cx + 52, y: baseY - 95, r: 9 },     // Was 13
      { x: cx - 55, y: baseY - 105, r: 10 },   // Was 14
      { x: cx + 32, y: baseY - 120, r: 9 },    // Was 13
      { x: cx - 35, y: baseY - 112, r: 8 },    // Was 12
      { x: cx + 58, y: baseY - 55, r: 8, green: true },  // Was 11
    ];

    tomatoes.forEach(t => {
      const color = t.green ? '#7cb342' : '#d32f2f';
      drawRealTomato(t.x, t.y, t.r, color, t.green);
    });
  }
}

// Génère un tileset complet
async function generateTileset(name, generator) {
  console.log(`  Génération ${name}...`);

  const canvas = createCanvas(TILE_W * STAGES, TILE_H * 4);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < STAGES; col++) {
      const tileX = col * TILE_W;
      const tileY = row * TILE_H;
      ctx.clearRect(tileX, tileY, TILE_W, TILE_H);
      ctx.save();
      ctx.translate(tileX, tileY);
      generator(ctx, col);
      ctx.restore();
    }
  }

  const buf = canvas.toBuffer('image/png');
  await writeFile(`${OUT_DIR}/${name}.png`, buf);
  console.log(`    ✓ ${name}.png`);
}

async function main() {
  console.log('\n=== Générateur de Sprites Réalistes ===\n');

  if (!existsSync(OUT_DIR)) {
    await mkdir(OUT_DIR, { recursive: true });
  }

  // Générer tous les types
  await generateTileset('tomates', drawTomate);
  await generateTileset('solanacees', drawTomate); // Poivrons/aubergines similaires
  await generateTileset('courgettes', drawTomate); // Fruits similaires
  await generateTileset('salades', drawSalade);
  await generateTileset('racines', drawCarotte);
  await generateTileset('ail', drawHerbe);
  await generateTileset('haricots', drawHerbe);
  await generateTileset('brocoli', drawSalade); // Utilise salade pour l'instant
  await generateTileset('herbes1', drawHerbe);
  await generateTileset('herbes2', drawHerbe);

  console.log('\n=== Terminé ! ===');
  console.log('Sprites réalistes générés sans texte ! 🍅\n');
}

main().catch(console.error);

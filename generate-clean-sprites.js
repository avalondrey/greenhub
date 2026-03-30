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

// Tomate réaliste
function drawTomate(ctx, stage) {
  const cx = TILE_W / 2;
  const baseY = TILE_H - 8;

  // Scale par stade (0-3 agrandis)
  const scales = [0.5, 0.85, 1.2, 1.6, 1.9];
  const scale = scales[stage];
  const p = PALETTES.tomate;

  if (stage === 0) {
    // Graine avec jeunes feuilles cotylédons
    // Terre
    drawCircle(ctx, cx, baseY - 3, 6, p.soil);
    // Deux cotylédons
    ctx.fillStyle = p.leafLight;
    ctx.beginPath();
    ctx.ellipse(cx - 5, baseY - 12, 5, 3, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 5, baseY - 12, 5, 3, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Tige centrale
    ctx.strokeStyle = p.stem;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, baseY - 5);
    ctx.lineTo(cx, baseY - 15);
    ctx.stroke();
  }
  else if (stage === 1) {
    // Jeune plant 15-20cm
    const h = 50 * scale;
    // Tige principale
    ctx.strokeStyle = p.stem;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, baseY);
    ctx.quadraticCurveTo(cx + 5, baseY - h * 0.5, cx - 3, baseY - h);
    ctx.stroke();

    // Feuilles (5-6 feuilles)
    const leafSize = 12 * scale;
    ctx.fillStyle = p.leaf;
    // Feuille bas gauche
    ctx.beginPath();
    ctx.ellipse(cx - 15, baseY - 25, leafSize, leafSize * 0.6, -0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = p.leafDark;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Feuille bas droite
    ctx.fillStyle = p.leaf;
    ctx.beginPath();
    ctx.ellipse(cx + 18, baseY - 30, leafSize * 1.1, leafSize * 0.65, 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Feuilles haut
    ctx.fillStyle = p.leafLight;
    ctx.beginPath();
    ctx.ellipse(cx - 8, baseY - 45, leafSize * 0.9, leafSize * 0.55, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 10, baseY - 50, leafSize * 0.85, leafSize * 0.5, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Boutons floraux
    ctx.fillStyle = p.flower;
    drawCircle(ctx, cx - 5, baseY - 55, 3, p.flower);
    drawCircle(ctx, cx + 8, baseY - 58, 3, p.flower);
  }
  else if (stage === 2) {
    // Plante en développement 30-40cm
    const h = 70 * scale;

    // Tige principale plus épaisse
    ctx.strokeStyle = p.stem;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx, baseY);
    ctx.quadraticCurveTo(cx + 8, baseY - h * 0.4, cx - 5, baseY - h);
    ctx.stroke();

    // Branches latérales
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + 3, baseY - 35);
    ctx.quadraticCurveTo(cx + 25, baseY - 40, cx + 35, baseY - 55);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 2, baseY - 50);
    ctx.quadraticCurveTo(cx - 28, baseY - 55, cx - 38, baseY - 70);
    ctx.stroke();

    // Nombreuses feuilles
    const leafSize = 16 * scale;
    const leaves = [
      { x: cx - 25, y: baseY - 25, s: 1.2, a: -0.9 },
      { x: cx + 30, y: baseY - 30, s: 1.3, a: 0.8 },
      { x: cx - 35, y: baseY - 55, s: 1.1, a: -0.6 },
      { x: cx + 38, y: baseY - 60, s: 1.2, a: 0.7 },
      { x: cx - 20, y: baseY - 80, s: 0.9, a: -0.4 },
      { x: cx + 22, y: baseY - 85, s: 0.95, a: 0.5 },
    ];

    leaves.forEach(l => {
      ctx.fillStyle = l.y > baseY - 50 ? p.leaf : p.leafLight;
      ctx.beginPath();
      ctx.ellipse(l.x, l.y, leafSize * l.s, leafSize * 0.6 * l.s, l.a, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = p.leafDark;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Petites tomates vertes
    drawGradientCircle(ctx, cx - 30, baseY - 65, 10, '#7cb342', '#4a7c2a');
    drawGradientCircle(ctx, cx + 35, baseY - 70, 11, '#7cb342', '#4a7c2a');
    drawGradientCircle(ctx, cx + 5, baseY - 90, 9, '#8bc34a', '#558b2f');

    // Fleurs jaunes
    ctx.fillStyle = p.flower;
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const fx = cx - 40 + Math.cos(angle) * 6;
      const fy = baseY - 75 + Math.sin(angle) * 3;
      drawCircle(ctx, fx, fy, 4, p.flower);
    }
    drawCircle(ctx, cx + 45, baseY - 80, 5, p.flower);
  }
  else if (stage === 3) {
    // Plante avec fruits mûrissants 50-60cm
    const h = 85 * scale;

    // Tige centrale épaisse
    ctx.strokeStyle = p.stem;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx, baseY);
    ctx.quadraticCurveTo(cx + 5, baseY - h * 0.3, cx, baseY - h * 0.7);
    ctx.quadraticCurveTo(cx - 8, baseY - h * 0.85, cx - 3, baseY - h);
    ctx.stroke();

    // Branches multiples
    const branches = [
      { x1: cx + 2, y1: baseY - 30, x2: cx + 40, y2: baseY - 45, w: 4 },
      { x1: cx - 2, y1: baseY - 45, x2: cx - 45, y2: baseY - 60, w: 4 },
      { x1: cx + 3, y1: baseY - 60, x2: cx + 50, y2: baseY - 80, w: 3 },
      { x1: cx - 3, y1: baseY - 75, x2: cx - 40, y2: baseY - 95, w: 3 },
    ];

    branches.forEach(b => {
      ctx.lineWidth = b.w;
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.quadraticCurveTo((b.x1 + b.x2) / 2 + 5, (b.y1 + b.y2) / 2, b.x2, b.y2);
      ctx.stroke();
    });

    // Feuilles abondantes
    const leafSize = 18 * scale;
    const leafPos = [
      { x: cx - 30, y: baseY - 25, s: 1.3, a: -0.8 },
      { x: cx + 35, y: baseY - 30, s: 1.4, a: 0.9 },
      { x: cx - 45, y: baseY - 50, s: 1.2, a: -0.7 },
      { x: cx + 48, y: baseY - 55, s: 1.3, a: 0.8 },
      { x: cx - 35, y: baseY - 75, s: 1.1, a: -0.5 },
      { x: cx + 40, y: baseY - 80, s: 1.15, a: 0.6 },
      { x: cx - 20, y: baseY - 100, s: 0.95, a: -0.3 },
      { x: cx + 25, y: baseY - 105, s: 1, a: 0.4 },
    ];

    leafPos.forEach(l => {
      ctx.fillStyle = l.y > baseY - 60 ? p.leaf : p.leafLight;
      ctx.beginPath();
      ctx.ellipse(l.x, l.y, leafSize * l.s, leafSize * 0.6 * l.s, l.a, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = p.leafDark;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Tomates oranges/rouges
    const fruits = [
      { x: cx - 45, y: baseY - 70, r: 13, color: p.fruit },
      { x: cx + 50, y: baseY - 75, r: 14, color: p.fruit },
      { x: cx - 10, y: baseY - 110, r: 12, color: '#ff6b35' }, // orange
      { x: cx + 15, y: baseY - 115, r: 11, color: '#ff8c42' }, // orange clair
      { x: cx + 55, y: baseY - 95, r: 10, color: '#7cb342' }, // vert
    ];

    fruits.forEach(f => {
      drawGradientCircle(ctx, f.x, f.y, f.r, f.color, p.fruitDark);
      // Highlight
      drawCircle(ctx, f.x - f.r * 0.3, f.y - f.r * 0.3, f.r * 0.25, 'rgba(255,255,255,0.3)');
      // Sépal
      ctx.fillStyle = p.stem;
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const sx = f.x + Math.cos(angle) * f.r * 0.7;
        const sy = f.y + Math.sin(angle) * f.r * 0.5;
        ctx.beginPath();
        ctx.ellipse(sx, sy, 2, 4, angle, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }
  else {
    // Stade 4 - Plante adulte pleine 70-80cm
    const h = 95 * scale;

    // Tige centrale robuste
    ctx.strokeStyle = p.stem;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(cx, baseY);
    ctx.quadraticCurveTo(cx - 5, baseY - h * 0.25, cx + 3, baseY - h * 0.5);
    ctx.quadraticCurveTo(cx - 8, baseY - h * 0.75, cx - 2, baseY - h);
    ctx.stroke();

    // Nombreuses branches
    const branches = [
      { x1: cx + 3, y1: baseY - 25, cp1: cx + 30, cp2: baseY - 30, x2: cx + 50, y2: baseY - 40, w: 5 },
      { x1: cx - 2, y1: baseY - 35, cp1: cx - 35, cp2: baseY - 40, x2: cx - 55, y2: baseY - 50, w: 5 },
      { x1: cx + 4, y1: baseY - 50, cp1: cx + 45, cp2: baseY - 55, x2: cx + 65, y2: baseY - 70, w: 4 },
      { x1: cx - 3, y1: baseY - 65, cp1: cx - 50, cp2: baseY - 70, x2: cx - 70, y2: baseY - 85, w: 4 },
      { x1: cx + 2, y1: baseY - 80, cp1: cx + 40, cp2: baseY - 85, x2: cx + 55, y2: baseY - 105, w: 3 },
      { x1: cx - 4, y1: baseY - 95, cp1: cx - 35, cp2: baseY - 100, x2: cx - 50, y2: baseY - 120, w: 3 },
    ];

    branches.forEach(b => {
      ctx.lineWidth = b.w;
      ctx.strokeStyle = p.stem;
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.quadraticCurveTo(b.cp1, b.cp2, b.x2, b.y2);
      ctx.stroke();
    });

    // Feuilles partout
    const leafSize = 20;
    const leaves = [
      { x: cx - 35, y: baseY - 25, s: 1.4, a: -0.9 },
      { x: cx + 40, y: baseY - 30, s: 1.5, a: 0.95 },
      { x: cx - 55, y: baseY - 45, s: 1.3, a: -0.75 },
      { x: cx + 60, y: baseY - 50, s: 1.4, a: 0.85 },
      { x: cx - 65, y: baseY - 75, s: 1.25, a: -0.65 },
      { x: cx + 70, y: baseY - 80, s: 1.35, a: 0.75 },
      { x: cx - 55, y: baseY - 105, s: 1.1, a: -0.5 },
      { x: cx + 60, y: baseY - 110, s: 1.2, a: 0.6 },
      { x: cx - 40, y: baseY - 130, s: 1, a: -0.35 },
      { x: cx + 45, y: baseY - 135, s: 1.05, a: 0.45 },
    ];

    leaves.forEach(l => {
      ctx.fillStyle = l.y > baseY - 70 ? p.leaf : p.leafLight;
      ctx.beginPath();
      ctx.ellipse(l.x, l.y, leafSize * l.s, leafSize * 0.6 * l.s, l.a, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = p.leafDark;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Nervure
      ctx.strokeStyle = p.stemLight;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(l.x - leafSize * 0.5, l.y);
      ctx.lineTo(l.x + leafSize * 0.5, l.y);
      ctx.stroke();
    });

    // Tomates bien mures - plus nombreuses
    const fruits = [
      { x: cx - 55, y: baseY - 65, r: 15 },
      { x: cx + 60, y: baseY - 70, r: 16 },
      { x: cx - 15, y: baseY - 140, r: 14 },
      { x: cx + 20, y: baseY - 145, r: 15 },
      { x: cx + 65, y: baseY - 95, r: 13 },
      { x: cx - 70, y: baseY - 100, r: 14 },
      { x: cx + 40, y: baseY - 125, r: 13 },
      { x: cx - 45, y: baseY - 120, r: 12 },
      { x: cx + 75, y: baseY - 60, r: 11, green: true },
    ];

    fruits.forEach(f => {
      const color = f.green ? '#7cb342' : p.fruit;
      const colorDark = f.green ? '#4a7c2a' : p.fruitDark;

      // Tomate avec dégradé
      drawGradientCircle(ctx, f.x, f.y, f.r, color, colorDark);

      // Highlight brillant
      drawCircle(ctx, f.x - f.r * 0.35, f.y - f.r * 0.35, f.r * 0.25, 'rgba(255,200,200,0.4)');

      // Sépal (calice)
      ctx.fillStyle = p.stem;
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const sx = f.x + Math.cos(angle) * f.r * 0.65;
        const sy = f.y + Math.sin(angle) * f.r * 0.45;
        ctx.beginPath();
        ctx.ellipse(sx, sy, 2.5, 5, angle, 0, Math.PI * 2);
        ctx.fill();
      }

      // Petite tige
      ctx.strokeStyle = p.stem;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(f.x, f.y - f.r * 0.8);
      ctx.lineTo(f.x, f.y - f.r - 5);
      ctx.stroke();
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

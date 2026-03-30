#!/usr/bin/env node
/**
 * generate-clean-sprites.js
 * ================================================================
 * Génère des sprites de plantes propres, sans texte, directement
 * dessinés avec Canvas API.
 *
 * Usage: node generate-clean-sprites.js
 */

import { createCanvas } from 'canvas';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

const OUT_DIR = 'public/tileset/miniserre';

// Configuration
const TILE_W = 128;
const TILE_H = 160;
const STAGES = 5;

// Palettes de couleurs par type de plante
const PALETTES = {
  tomate: {
    stem: '#4a7c2a',
    leaf: '#5aab2a',
    leafDark: '#3d8a18',
    fruit: '#e63946',
    fruitHighlight: '#ff6b6b',
    flower: '#ffd93d',
  },
  poivron: {
    stem: '#4a7c2a',
    leaf: '#5aab2a',
    leafDark: '#3d8a18',
    fruit: '#2d5016',
    fruitHighlight: '#4a7c2a',
    flower: '#ffffff',
  },
  aubergine: {
    stem: '#4a7c2a',
    leaf: '#5aab2a',
    leafDark: '#3d8a18',
    fruit: '#6b2c91',
    fruitHighlight: '#8b4cb1',
    flower: '#d4a5f9',
  },
  courgette: {
    stem: '#4a7c2a',
    leaf: '#5aab2a',
    leafDark: '#3d8a18',
    fruit: '#2d5016',
    fruitHighlight: '#4a7c2a',
    flower: '#ffd93d',
  },
  haricot: {
    stem: '#4a7c2a',
    leaf: '#8fbc8f',
    leafDark: '#6b8e6b',
    fruit: '#4a7c2a',
    fruitHighlight: '#6b9c4b',
    flower: '#ffd93d',
  },
  carotte: {
    stem: '#4a7c2a',
    leaf: '#8fbc8f',
    leafDark: '#6b8e6b',
    root: '#e67e22',
    rootHighlight: '#f39c12',
    flower: '#ffffff',
  },
  salade: {
    stem: '#4a7c2a',
    leaf: '#90ee90',
    leafDark: '#6b8e6b',
    leafLight: '#c3e6c3',
    center: '#e8f5e8',
  },
  brocoli: {
    stem: '#4a7c2a',
    head: '#2d5016',
    headLight: '#4a7c2a',
    leaf: '#5aab2a',
  },
  fraise: {
    stem: '#4a7c2a',
    leaf: '#5aab2a',
    leafDark: '#3d8a18',
    fruit: '#e63946',
    fruitHighlight: '#ff6b6b',
    flower: '#ffffff',
  },
  herbe: {
    stem: '#4a7c2a',
    leaf: '#7cb342',
    leafDark: '#558b2f',
    leafLight: '#9ccc65',
  },
};

// Fonction utilitaires de dessin
function drawPixelRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function drawPixelCircle(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(Math.round(cx), Math.round(cy), Math.round(r), 0, Math.PI * 2);
  ctx.fill();
}

function drawPixelLine(ctx, x1, y1, x2, y2, color, width = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(Math.round(x1), Math.round(y1));
  ctx.lineTo(Math.round(x2), Math.round(y2));
  ctx.stroke();
}

// Dessine une feuille stylisée
function drawLeaf(ctx, x, y, size, angle, colors) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Forme de feuille (ovale allongé)
  const w = size;
  const h = size * 0.6;

  // Ombre
  drawPixelCircle(ctx, 2, 2, w * 0.5, colors.leafDark);

  // Feuille principale
  drawPixelCircle(ctx, 0, 0, w * 0.5, colors.leaf);
  drawPixelCircle(ctx, -w * 0.2, 0, w * 0.3, colors.leafDark);

  // Nervure centrale
  drawPixelLine(ctx, -w * 0.4, 0, w * 0.4, 0, colors.stem, 1);

  ctx.restore();
}

// Générateurs de sprites par stade
const GENERATORS = {
  // Tomate
  tomate: (ctx, stage, colors) => {
    const cx = TILE_W / 2;
    const baseY = TILE_H - 10;

    if (stage === 0) {
      // Graine avec petit germe
      drawPixelCircle(ctx, cx, baseY - 5, 3, '#5d4037');
      drawPixelLine(ctx, cx, baseY - 8, cx, baseY - 15, colors.stem, 2);
      drawLeaf(ctx, cx - 4, baseY - 12, 4, -0.5, colors);
      drawLeaf(ctx, cx + 4, baseY - 12, 4, 0.5, colors);
    } else if (stage === 1) {
      // Jeune plant
      drawPixelLine(ctx, cx, baseY, cx, baseY - 40, colors.stem, 3);
      drawLeaf(ctx, cx - 6, baseY - 20, 10, -0.8, colors);
      drawLeaf(ctx, cx + 6, baseY - 25, 12, 0.6, colors);
      drawLeaf(ctx, cx - 4, baseY - 35, 8, -0.3, colors);
    } else if (stage === 2) {
      // Plante moyenne avec fleurs
      drawPixelLine(ctx, cx, baseY, cx, baseY - 70, colors.stem, 4);
      // Feuilles
      drawLeaf(ctx, cx - 10, baseY - 25, 14, -0.8, colors);
      drawLeaf(ctx, cx + 12, baseY - 30, 16, 0.7, colors);
      drawLeaf(ctx, cx - 8, baseY - 50, 14, -0.4, colors);
      drawLeaf(ctx, cx + 10, baseY - 55, 14, 0.5, colors);
      // Petites tomates vertes
      drawPixelCircle(ctx, cx - 15, baseY - 45, 5, colors.stem);
      drawPixelCircle(ctx, cx + 18, baseY - 40, 6, colors.stem);
    } else if (stage === 3) {
      // Plante avec fruits mûrs
      drawPixelLine(ctx, cx, baseY, cx, baseY - 85, colors.stem, 4);
      // Feuilles
      drawLeaf(ctx, cx - 12, baseY - 25, 16, -0.8, colors);
      drawLeaf(ctx, cx + 15, baseY - 30, 18, 0.7, colors);
      drawLeaf(ctx, cx - 10, baseY - 55, 16, -0.4, colors);
      drawLeaf(ctx, cx + 12, baseY - 60, 16, 0.5, colors);
      drawLeaf(ctx, cx - 6, baseY - 75, 12, -0.2, colors);
      // Tomates rouges
      drawPixelCircle(ctx, cx - 18, baseY - 50, 10, colors.fruit);
      drawPixelCircle(ctx, cx - 18, baseY - 52, 4, colors.fruitHighlight);
      drawPixelCircle(ctx, cx + 22, baseY - 45, 11, colors.fruit);
      drawPixelCircle(ctx, cx + 22, baseY - 47, 4, colors.fruitHighlight);
      drawPixelCircle(ctx, cx - 5, baseY - 70, 9, colors.fruit);
    } else {
      // Plante adulte pleine
      drawPixelLine(ctx, cx, baseY, cx, baseY - 95, colors.stem, 5);
      // Nombreuses feuilles
      drawLeaf(ctx, cx - 15, baseY - 25, 18, -0.8, colors);
      drawLeaf(ctx, cx + 18, baseY - 30, 20, 0.7, colors);
      drawLeaf(ctx, cx - 12, baseY - 55, 18, -0.4, colors);
      drawLeaf(ctx, cx + 15, baseY - 60, 18, 0.5, colors);
      drawLeaf(ctx, cx - 8, baseY - 80, 14, -0.3, colors);
      drawLeaf(ctx, cx + 10, baseY - 85, 14, 0.4, colors);
      // Beaucoup de tomates
      drawPixelCircle(ctx, cx - 22, baseY - 50, 12, colors.fruit);
      drawPixelCircle(ctx, cx + 26, baseY - 45, 13, colors.fruit);
      drawPixelCircle(ctx, cx - 8, baseY - 75, 11, colors.fruit);
      drawPixelCircle(ctx, cx + 12, baseY - 80, 12, colors.fruit);
      drawPixelCircle(ctx, cx - 28, baseY - 70, 10, colors.fruit);
      drawPixelCircle(ctx, cx + 20, baseY - 85, 9, colors.fruit);
      // Highlights
      drawPixelCircle(ctx, cx - 24, baseY - 52, 4, colors.fruitHighlight);
      drawPixelCircle(ctx, cx + 24, baseY - 47, 4, colors.fruitHighlight);
      drawPixelCircle(ctx, cx - 6, baseY - 77, 3, colors.fruitHighlight);
    }
  },

  // Salade/Laitue
  salade: (ctx, stage, colors) => {
    const cx = TILE_W / 2;
    const baseY = TILE_H - 10;

    const size = 15 + stage * 12;
    const layers = 2 + stage;

    for (let i = layers; i >= 0; i--) {
      const layerSize = size * (1 - i * 0.15);
      const y = baseY - 15 - i * 10;
      const color = i === 0 ? colors.leafLight : (i === layers ? colors.leafDark : colors.leaf);

      // Forme de rosette
      drawPixelCircle(ctx, cx, y, layerSize, color);
      drawPixelCircle(ctx, cx - layerSize * 0.5, y - layerSize * 0.3, layerSize * 0.7, color);
      drawPixelCircle(ctx, cx + layerSize * 0.5, y - layerSize * 0.3, layerSize * 0.7, color);
      drawPixelCircle(ctx, cx, y - layerSize * 0.5, layerSize * 0.6, color);
    }

    // Centre clair
    if (stage >= 3) {
      drawPixelCircle(ctx, cx, baseY - 25, size * 0.3, colors.center);
    }
  },

  // Carotte/Racine
  carotte: (ctx, stage, colors) => {
    const cx = TILE_W / 2;
    const baseY = TILE_H - 10;

    // Partie racine (cachee en debut, visible a la fin)
    if (stage >= 2) {
      const rootSize = 8 + (stage - 2) * 4;
      drawPixelCircle(ctx, cx, baseY + rootSize * 0.3, rootSize, colors.root);
      drawPixelCircle(ctx, cx - rootSize * 0.3, baseY, rootSize * 0.6, colors.rootHighlight);
    }

    // Feuillage
    const leafCount = 2 + stage * 2;
    const leafHeight = 20 + stage * 15;

    for (let i = 0; i < leafCount; i++) {
      const angle = -0.6 + (i / (leafCount - 1)) * 1.2;
      const x = cx + Math.sin(angle) * 10;
      const y = baseY - 10 - leafHeight * 0.7;
      drawLeaf(ctx, x, y, 12 + stage * 3, angle, colors);
    }
  },

  // Herbes (basilic, persil, etc.)
  herbe: (ctx, stage, colors) => {
    const cx = TILE_W / 2;
    const baseY = TILE_H - 10;

    const stems = 3 + stage * 2;
    const height = 25 + stage * 15;

    for (let i = 0; i < stems; i++) {
      const offset = (i - stems / 2) * 8;
      const h = height * (0.7 + Math.random() * 0.4);
      const x = cx + offset;

      // Tige
      drawPixelLine(ctx, x, baseY, x + offset * 0.3, baseY - h, colors.stem, 2);

      // Feuilles sur la tige
      const leaves = 2 + stage;
      for (let j = 0; j < leaves; j++) {
        const ly = baseY - 10 - (j / leaves) * h * 0.8;
        const lx = x + offset * 0.3 * (j / leaves);
        const angle = offset > 0 ? 0.5 : -0.5;
        drawLeaf(ctx, lx, ly, 6 + stage * 2, angle, colors);
      }
    }
  },

  // Brocoli/Chou-fleur
  brocoli: (ctx, stage, colors) => {
    const cx = TILE_W / 2;
    const baseY = TILE_H - 10;

    // Tige
    const stemH = 20 + stage * 10;
    drawPixelLine(ctx, cx, baseY, cx, baseY - stemH, colors.stem, 4);

    // Feuilles
    drawLeaf(ctx, cx - 15, baseY - 15, 14, -0.6, colors);
    drawLeaf(ctx, cx + 15, baseY - 15, 14, 0.6, colors);

    // Tête (forme irreguliere)
    if (stage >= 1) {
      const headSize = 15 + stage * 8;
      const clusters = 3 + stage;

      for (let i = 0; i < clusters; i++) {
        const angle = (i / clusters) * Math.PI * 2;
        const dist = headSize * 0.4;
        const x = cx + Math.cos(angle) * dist;
        const y = baseY - stemH + Math.sin(angle) * dist * 0.3;
        drawPixelCircle(ctx, x, y, headSize * 0.5, colors.head);
        drawPixelCircle(ctx, x - 2, y - 2, headSize * 0.3, colors.headLight);
      }

      // Centre
      drawPixelCircle(ctx, cx, baseY - stemH, headSize * 0.6, colors.head);
    }
  },
};

// Génère un tileset complet
async function generateTileset(name, generator, palette) {
  console.log(`  Génération ${name}...`);

  const canvas = createCanvas(TILE_W * STAGES, TILE_H * 4);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // 4 variétés (on utilise le même générateur avec des variations)
  for (let row = 0; row < 4; row++) {
    // Variation subtile par variété (seed aléatoire consistent)
    const seed = row * 137;

    for (let col = 0; col < STAGES; col++) {
      const tileX = col * TILE_W;
      const tileY = row * TILE_H;

      // Fond transparent (rien)
      ctx.clearRect(tileX, tileY, TILE_W, TILE_H);

      // Génère le sprite
      ctx.save();
      ctx.translate(tileX, tileY);
      generator(ctx, col, palette);
      ctx.restore();
    }
  }

  const buf = canvas.toBuffer('image/png');
  await writeFile(`${OUT_DIR}/${name}.png`, buf);
  console.log(`    ✓ ${name}.png`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function main() {
  console.log('\n=== Générateur de Sprites Propres ===\n');
  console.log(`Tuile: ${TILE_W}x${TILE_H}px | Stades: ${STAGES}\n`);

  // Créer dossier sortie
  if (!existsSync(OUT_DIR)) {
    await mkdir(OUT_DIR, { recursive: true });
  }

  // Générer chaque type
  const types = [
    { name: 'tomates', gen: GENERATORS.tomate, pal: PALETTES.tomate },
    { name: 'solanacees', gen: GENERATORS.tomate, pal: PALETTES.poivron },
    { name: 'courgettes', gen: GENERATORS.tomate, pal: PALETTES.courgette },
    { name: 'haricots', gen: GENERATORS.herbe, pal: PALETTES.haricot },
    { name: 'ail', gen: GENERATORS.herbe, pal: PALETTES.herbe },
    { name: 'racines', gen: GENERATORS.carotte, pal: PALETTES.carotte },
    { name: 'salades', gen: GENERATORS.salade, pal: PALETTES.salade },
    { name: 'brocoli', gen: GENERATORS.brocoli, pal: PALETTES.brocoli },
    { name: 'herbes1', gen: GENERATORS.herbe, pal: PALETTES.herbe },
    { name: 'herbes2', gen: GENERATORS.herbe, pal: { ...PALETTES.herbe, leaf: '#9ccc65', leafDark: '#7cb342' } },
  ];

  for (const type of types) {
    await generateTileset(type.name, type.gen, type.pal);
  }

  console.log('\n=== Terminé ! ===');
  console.log(`Sprites générés dans: ${OUT_DIR}/`);
  console.log('Aucun texte, aucun label, juste des plantes ! 🌱\n');
}

main().catch(console.error);

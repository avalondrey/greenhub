#!/usr/bin/env node
/**
 * generate-garden-sprites.js
 * ==========================
 * Génère des sprites pour le jardin réel : arbres, arbustes, structures
 */

import { createCanvas } from 'canvas';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

const OUT_DIR = 'public/tileset/garden';

const TILE_W = 128;
const TILE_H = 160;

// Palettes
const COLORS = {
  oak: { trunk: '#5d4037', trunkDark: '#3e2723', leaf: '#2e7d32', leafLight: '#4caf50', leafDark: '#1b5e20' },
  pine: { trunk: '#4e342e', trunkDark: '#3e2723', leaf: '#1b5e20', leafLight: '#2e7d32', leafDark: '#0d3310' },
  maple: { trunk: '#5d4037', trunkDark: '#3e2723', leaf: '#d84315', leafLight: '#ff7043', leafDark: '#bf360c' },
  cherry: { trunk: '#5d4037', trunkDark: '#3e2723', leaf: '#c62828', leafLight: '#ef5350', leafDark: '#8e0000', flower: '#ffcdd2' },
  apple: { trunk: '#5d4037', trunkDark: '#3e2723', leaf: '#388e3c', leafLight: '#66bb6a', leafDark: '#1b5e20', fruit: '#d32f2f' },
  shrub: { trunk: '#6d4c41', leaf: '#558b2f', leafLight: '#7cb342', leafDark: '#33691e' },
  berry: { trunk: '#5d4037', leaf: '#33691e', berry: '#7b1fa2', berryLight: '#9c27b0' },
  shed: { wall: '#8d6e63', wallDark: '#6d4c41', roof: '#5d4037', roofLight: '#795548' },
  greenhouse: { frame: '#424242', glass: 'rgba(129, 199, 132, 0.6)', glassDark: 'rgba(102, 187, 106, 0.4)' },
};

function drawCircle(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawGradientCircle(ctx, cx, cy, r, centerColor, edgeColor) {
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, centerColor);
  grad.addColorStop(1, edgeColor);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

// Chêne
function drawOak(ctx) {
  const cx = TILE_W / 2;
  const baseY = TILE_H - 10;
  const c = COLORS.oak;

  // Tronc
  ctx.fillStyle = c.trunk;
  ctx.fillRect(cx - 12, baseY - 60, 24, 60);
  ctx.fillStyle = c.trunkDark;
  ctx.fillRect(cx - 8, baseY - 55, 16, 55);

  // Branches
  ctx.strokeStyle = c.trunk;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(cx, baseY - 50);
  ctx.lineTo(cx - 30, baseY - 80);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, baseY - 45);
  ctx.lineTo(cx + 35, baseY - 75);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, baseY - 55);
  ctx.lineTo(cx - 15, baseY - 90);
  ctx.stroke();

  // Feuillage - clusters
  const clusters = [
    { x: cx, y: baseY - 95, r: 35 },
    { x: cx - 35, y: baseY - 85, r: 28 },
    { x: cx + 38, y: baseY - 80, r: 30 },
    { x: cx - 20, y: baseY - 110, r: 25 },
    { x: cx + 20, y: baseY - 105, r: 26 },
    { x: cx, y: baseY - 125, r: 22 },
  ];

  clusters.forEach((cl, i) => {
    const color = i < 2 ? c.leafLight : c.leaf;
    drawGradientCircle(ctx, cl.x, cl.y, cl.r, color, c.leafDark);
  });
}

// Pin
function drawPine(ctx) {
  const cx = TILE_W / 2;
  const baseY = TILE_H - 10;
  const c = COLORS.pine;

  // Tronc
  ctx.fillStyle = c.trunk;
  ctx.fillRect(cx - 8, baseY - 80, 16, 80);

  // Étages de feuillage (triangle)
  const levels = [
    { y: baseY - 30, w: 70, h: 25 },
    { y: baseY - 55, w: 60, h: 22 },
    { y: baseY - 78, w: 48, h: 20 },
    { y: baseY - 95, w: 35, h: 18 },
    { y: baseY - 108, w: 22, h: 15 },
  ];

  levels.forEach((lvl, i) => {
    const color = i < 2 ? c.leafLight : c.leaf;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, lvl.y - lvl.h);
    ctx.lineTo(cx + lvl.w / 2, lvl.y);
    ctx.lineTo(cx - lvl.w / 2, lvl.y);
    ctx.closePath();
    ctx.fill();

    // Ombre
    ctx.fillStyle = c.leafDark;
    ctx.beginPath();
    ctx.moveTo(cx, lvl.y - lvl.h);
    ctx.lineTo(cx + lvl.w / 2, lvl.y);
    ctx.lineTo(cx, lvl.y);
    ctx.closePath();
    ctx.fill();
  });
}

// Érable
function drawMaple(ctx) {
  const cx = TILE_W / 2;
  const baseY = TILE_H - 10;
  const c = COLORS.maple;

  // Tronc
  ctx.fillStyle = c.trunk;
  ctx.fillRect(cx - 10, baseY - 50, 20, 50);

  // Branches étalées
  ctx.strokeStyle = c.trunk;
  ctx.lineWidth = 6;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const len = 35 + (i % 2) * 15;
    ctx.beginPath();
    ctx.moveTo(cx, baseY - 45);
    ctx.lineTo(cx + Math.cos(angle) * len, baseY - 65 + Math.sin(angle) * len * 0.3);
    ctx.stroke();
  }

  // Feuillage plat caractéristique érable
  const clusters = [
    { x: cx, y: baseY - 70, r: 30 },
    { x: cx - 40, y: baseY - 60, r: 22 },
    { x: cx + 42, y: baseY - 58, r: 24 },
    { x: cx - 25, y: baseY - 85, r: 20 },
    { x: cx + 28, y: baseY - 82, r: 21 },
    { x: cx, y: baseY - 100, r: 18 },
  ];

  clusters.forEach((cl) => {
    drawGradientCircle(ctx, cl.x, cl.y, cl.r, c.leafLight, c.leafDark);
  });
}

// Cerisier
function drawCherry(ctx) {
  const cx = TILE_W / 2;
  const baseY = TILE_H - 10;
  const c = COLORS.cherry;

  // Tronc plus fin
  ctx.fillStyle = c.trunk;
  ctx.fillRect(cx - 8, baseY - 45, 16, 45);

  // Branches élégantes
  ctx.strokeStyle = c.trunk;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(cx, baseY - 40);
  ctx.quadraticCurveTo(cx - 20, baseY - 60, cx - 35, baseY - 75);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, baseY - 35);
  ctx.quadraticCurveTo(cx + 18, baseY - 55, cx + 30, baseY - 70);
  ctx.stroke();

  // Feuillage + fleurs roses
  const clusters = [
    { x: cx - 30, y: baseY - 75, r: 20, type: 'flower' },
    { x: cx + 25, y: baseY - 70, r: 18, type: 'flower' },
    { x: cx, y: baseY - 55, r: 25, type: 'leaf' },
    { x: cx - 15, y: baseY - 85, r: 15, type: 'flower' },
    { x: cx + 12, y: baseY - 80, r: 14, type: 'flower' },
  ];

  clusters.forEach((cl) => {
    if (cl.type === 'flower') {
      drawGradientCircle(ctx, cl.x, cl.y, cl.r, c.flower, '#f8bbd0');
      // Petits points roses foncés
      ctx.fillStyle = '#f48fb1';
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        drawCircle(ctx, cl.x + Math.cos(angle) * 5, cl.y + Math.sin(angle) * 5, 3, '#f48fb1');
      }
    } else {
      drawGradientCircle(ctx, cl.x, cl.y, cl.r, c.leaf, c.leafDark);
    }
  });
}

// Pommier
function drawApple(ctx) {
  const cx = TILE_W / 2;
  const baseY = TILE_H - 10;
  const c = COLORS.apple;

  // Tronc
  ctx.fillStyle = c.trunk;
  ctx.fillRect(cx - 10, baseY - 45, 20, 45);

  // Branches
  ctx.strokeStyle = c.trunk;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(cx, baseY - 40);
  ctx.lineTo(cx - 30, baseY - 65);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, baseY - 35);
  ctx.lineTo(cx + 32, baseY - 60);
  ctx.stroke();

  // Feuillage arrondi
  const clusters = [
    { x: cx, y: baseY - 65, r: 30 },
    { x: cx - 35, y: baseY - 60, r: 24 },
    { x: cx + 38, y: baseY - 58, r: 25 },
    { x: cx - 18, y: baseY - 90, r: 20 },
    { x: cx + 20, y: baseY - 88, r: 21 },
    { x: cx, y: baseY - 105, r: 18 },
  ];

  clusters.forEach((cl) => {
    drawGradientCircle(ctx, cl.x, cl.y, cl.r, c.leafLight, c.leafDark);
  });

  // Pommes rouges
  const fruits = [
    { x: cx - 20, y: baseY - 75, r: 6 },
    { x: cx + 25, y: baseY - 70, r: 6 },
    { x: cx, y: baseY - 95, r: 5 },
    { x: cx - 35, y: baseY - 55, r: 5 },
    { x: cx + 30, y: baseY - 50, r: 5 },
  ];

  fruits.forEach((f) => {
    drawGradientCircle(ctx, f.x, f.y, f.r, c.fruit, '#8b0000');
    // Highlight
    drawCircle(ctx, f.x - 2, f.y - 2, 2, 'rgba(255,255,255,0.4)');
  });
}

// Arbuste
function drawShrub(ctx) {
  const cx = TILE_W / 2;
  const baseY = TILE_H - 10;
  const c = COLORS.shrub;

  // Base
  ctx.fillStyle = c.trunk;
  ctx.fillRect(cx - 6, baseY - 15, 12, 15);

  // Feuillage buissonnant
  const clusters = [
    { x: cx, y: baseY - 25, r: 25 },
    { x: cx - 22, y: baseY - 20, r: 18 },
    { x: cx + 20, y: baseY - 18, r: 19 },
    { x: cx - 10, y: baseY - 45, r: 16 },
    { x: cx + 12, y: baseY - 42, r: 17 },
    { x: cx, y: baseY - 55, r: 14 },
  ];

  clusters.forEach((cl) => {
    drawGradientCircle(ctx, cl.x, cl.y, cl.r, c.leafLight, c.leafDark);
  });
}

// Haie
function drawHedge(ctx) {
  const cx = TILE_W / 2;
  const baseY = TILE_H - 10;
  const c = COLORS.shrub;

  // Forme rectangulaire/buissonnante
  ctx.fillStyle = c.leaf;
  ctx.beginPath();
  ctx.roundRect(cx - 40, baseY - 35, 80, 40, 15);
  ctx.fill();

  // Texture
  ctx.fillStyle = c.leafLight;
  ctx.beginPath();
  ctx.roundRect(cx - 35, baseY - 30, 70, 30, 10);
  ctx.fill();

  // Ombres
  ctx.fillStyle = c.leafDark;
  ctx.fillRect(cx - 40, baseY - 8, 80, 10);
}

// Petits fruits
function drawBerry(ctx) {
  const cx = TILE_W / 2;
  const baseY = TILE_H - 10;
  const c = COLORS.berry;

  // Tiges fines
  ctx.strokeStyle = c.trunk;
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const x = cx - 20 + i * 10;
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.quadraticCurveTo(x + 5, baseY - 30, x + (i - 2) * 3, baseY - 50);
    ctx.stroke();
  }

  // Feuilles
  ctx.fillStyle = c.leaf;
  for (let i = 0; i < 8; i++) {
    const x = cx - 25 + Math.random() * 50;
    const y = baseY - 30 - Math.random() * 25;
    ctx.beginPath();
    ctx.ellipse(x, y, 8, 5, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Baies
  ctx.fillStyle = c.berry;
  for (let i = 0; i < 12; i++) {
    const x = cx - 30 + Math.random() * 60;
    const y = baseY - 35 - Math.random() * 20;
    drawCircle(ctx, x, y, 4, c.berry);
    drawCircle(ctx, x - 1, y - 1, 2, c.berryLight);
  }
}

// Cabanon
function drawShed(ctx) {
  const cx = TILE_W / 2;
  const baseY = TILE_H - 10;
  const c = COLORS.shed;

  // Corps
  ctx.fillStyle = c.wall;
  ctx.fillRect(cx - 35, baseY - 50, 70, 50);

  // Texture bois
  ctx.strokeStyle = c.wallDark;
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(cx - 35, baseY - 40 + i * 10);
    ctx.lineTo(cx + 35, baseY - 40 + i * 10);
    ctx.stroke();
  }

  // Toit
  ctx.fillStyle = c.roof;
  ctx.beginPath();
  ctx.moveTo(cx - 45, baseY - 50);
  ctx.lineTo(cx, baseY - 85);
  ctx.lineTo(cx + 45, baseY - 50);
  ctx.closePath();
  ctx.fill();

  // Porte
  ctx.fillStyle = c.wallDark;
  ctx.fillRect(cx - 12, baseY - 35, 24, 35);
  // Poignée
  drawCircle(ctx, cx + 8, baseY - 20, 3, '#3e2723');
}

// Serre
function drawGreenhouse(ctx) {
  const cx = TILE_W / 2;
  const baseY = TILE_H - 10;
  const c = COLORS.greenhouse;

  // Structure
  ctx.strokeStyle = c.frame;
  ctx.lineWidth = 3;

  // Cadre
  ctx.strokeRect(cx - 40, baseY - 60, 80, 60);

  // Vitres
  ctx.fillStyle = c.glass;
  ctx.fillRect(cx - 38, baseY - 58, 76, 56);

  // Séparations vitres
  ctx.beginPath();
  ctx.moveTo(cx, baseY - 60);
  ctx.lineTo(cx, baseY);
  ctx.moveTo(cx - 40, baseY - 30);
  ctx.lineTo(cx + 40, baseY - 30);
  ctx.stroke();

  // Reflets
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 35, baseY - 55);
  ctx.lineTo(cx - 10, baseY - 25);
  ctx.stroke();
}

// Génération
async function generateSprite(name, drawer) {
  console.log(`  Génération ${name}...`);

  const canvas = createCanvas(TILE_W, TILE_H);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Fond transparent
  ctx.clearRect(0, 0, TILE_W, TILE_H);

  drawer(ctx);

  const buf = canvas.toBuffer('image/png');
  await writeFile(`${OUT_DIR}/${name}.png`, buf);
  console.log(`    ✓ ${name}.png`);
}

async function main() {
  console.log('\n=== Générateur de Sprites Jardin Réel ===\n');

  if (!existsSync(OUT_DIR)) {
    await mkdir(OUT_DIR, { recursive: true });
  }

  // Générer tous les sprites
  await generateSprite('oak', drawOak);
  await generateSprite('pine', drawPine);
  await generateSprite('maple', drawMaple);
  await generateSprite('cherry', drawCherry);
  await generateSprite('apple', drawApple);
  await generateSprite('shrub', drawShrub);
  await generateSprite('hedge', drawHedge);
  await generateSprite('berry', drawBerry);
  await generateSprite('shed', drawShed);
  await generateSprite('greenhouse', drawGreenhouse);

  console.log('\n=== Terminé ! ===');
  console.log('Sprites générés dans', OUT_DIR);
}

main().catch(console.error);

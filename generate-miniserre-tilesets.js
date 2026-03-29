/**
 * generate-miniserre-tilesets.js
 * ================================================================
 * Genere un dossier public/tileset/miniserre/ avec un tileset PNG
 * transparent par plante, contenant 5 stades de croissance.
 *
 * Chaque tuile = fond transparent + sprite plante avec outline sombre
 * Les tuiles sont organisees en grille : 5 colonnes (stades) x N lignes (varietes)
 *
 * Utilisation : node generate-miniserre-tilesets.js
 */

import { createCanvas, loadImage } from 'canvas';
import { mkdir, readdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

// ── Tileset source ──
const SRC = {
  tomates:     '/tileset/stades-serre/S01_tomates1.jpg',
  solanacees:  '/tileset/stades-serre/S02_solanacees.jpg',
  courgettes:  '/tileset/stades-serre/S03_courgettes_melon_mais.jpg',
  haricots:    '/tileset/stades-serre/S04_haricots_poireau_oignon.jpg',
  ail:         '/tileset/stades-serre/S05_ail_carottes_radis.jpg',
  racines:     '/tileset/stades-serre/S06_racines_feuilles1.jpg',
  salades:     '/tileset/stades-serre/S07_salades_chou.jpg',
  brocoli:     '/tileset/stades-serre/S08_brocoli_fraises_basilic.jpg',
  herbes1:     '/tileset/stades-serre/S09_herbes1.jpg',
  herbes2:     '/tileset/stades-serre/S10_herbes2.jpg',
};

const PLANT_ROWS = 4;   // 4 varietes par tileset
const PLANT_COLS = 5;  // 5 stades de croissance

// ── Extraction settings ──
const TILE_W = 128;    // largeur tuile finale (px)
const TILE_H = 160;   // hauteur tuile finale (px)
const BLEED = 6;       // marge de bleed autour du sprite
const OUTLINE_W = 2;   // epaisseur outline
const OUTLINE_C = { r: 5, g: 15, b: 5 };

// ── Fond tileset (couleur a rendre transparente) ──
const P_BG = { r: 26, g: 22, b: 39 };
const J_BG = { r: 30, g: 25, b: 44 };

const BG_DIST = 60;
const BG_FEATHER = 30;

// ── Layout tileset source ──
const P_W = 1344, P_H = 768, P_TITLE = 50;
const P_TW = P_W / PLANT_COLS;
const P_TH = (P_H - P_TITLE) / PLANT_ROWS;

const J_W = 1344, J_H = 768, J_TITLE = 50;
const J_TW = J_W / PLANT_COLS;
const J_TH = (J_H - J_TITLE) / PLANT_ROWS;

// ── Sortie ──
const OUT_DIR = 'public/tileset/miniserre';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Extrait un sprite avec bleed + fond transparent
function extractSprite(img, srcX, srcY, srcW, srcH, bg, bleed = BLEED) {
  const canvas = createCanvas(srcW + bleed * 2, srcH + bleed * 2);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, srcX - bleed, srcY - bleed, srcW + bleed * 2, srcH + bleed * 2, 0, 0, srcW + bleed * 2, srcH + bleed * 2);
  killBg(ctx, canvas.width, canvas.height, bg);
  return canvas;
}

// Supprime le fond avec alpha graduel
function killBg(ctx, w, h, bg) {
  const id = ctx.getImageData(0, 0, w, h);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const dist = Math.sqrt((d[i] - bg.r) ** 2 + (d[i + 1] - bg.g) ** 2 + (d[i + 2] - bg.b) ** 2);
    if (dist < BG_DIST) {
      d[i + 3] = 0;
    } else if (dist < BG_DIST + BG_FEATHER) {
      const t = (dist - BG_DIST) / BG_FEATHER;
      d[i + 3] = Math.round(d[i + 3] * t);
    }
  }
  ctx.putImageData(id, 0, 0);
}

// Calcule bounding box du sprite
function getBBox(ctx, w, h) {
  const d = ctx.getImageData(0, 0, w, h).data;
  let x0 = w, x1 = 0, y0 = h, y1 = 0;
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      if (d[(py * w + px) * 4 + 3] > 5) {
        if (px < x0) x0 = px;
        if (px > x1) x1 = px;
        if (py < y0) y0 = py;
        if (py > y1) y1 = py;
      }
    }
  }
  if (x0 > x1) return null;
  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

// Dessine outline sombre autour du sprite
function drawOutline(ctx, bbox, ox, oy, ow, oc) {
  if (!bbox) return;
  const { x: bx, y: by, w: bw, h: bh } = bbox;
  for (let sy = 0; sy < bh; sy++) {
    for (let sx = 0; sx < bw; sx++) {
      const px = bx + sx, py = by + sy;
      if (ctx.getImageData(px, py, 1, 1).data[3] < 40) continue;

      const isEdge = (
        px === bx || px === bx + bw - 1 || py === by || py === by + bh - 1 ||
        (px > 0 && ctx.getImageData(px - 1, py, 1, 1).data[3] < 40) ||
        (px < ctx.canvas.width - 1 && ctx.getImageData(px + 1, py, 1, 1).data[3] < 40) ||
        (py > 0 && ctx.getImageData(px, py - 1, 1, 1).data[3] < 40) ||
        (py < ctx.canvas.height - 1 && ctx.getImageData(px, py + 1, 1, 1).data[3] < 40)
      );

      if (isEdge) {
        for (let lx = -ow; lx <= ow; lx++) {
          for (let ly = -ow; ly <= ow; ly++) {
            if (lx === 0 && ly === 0) continue;
            const dx = ox + px, dy = oy + py;
            if (dx < 0 || dx >= ctx.canvas.width || dy < 0 || dy >= ctx.canvas.height) continue;
            const ex = ctx.getImageData(dx, dy, 1, 1).data;
            if (ex[3] < 20) {
              ctx.fillStyle = `rgba(${oc.r},${oc.g},${oc.b},0.75)`;
              ctx.fillRect(dx, dy, 1, 1);
            }
          }
        }
      }
    }
  }
}

// Genere une tuile individuelle : transparent + sprite centré avec outline
function generateTile(img, row, col, isSerre, scale = 1) {
  const tw = isSerre ? P_TW : J_TW;
  const th = isSerre ? P_TH : J_TH;
  const title = isSerre ? P_TITLE : J_TITLE;
  const bg = isSerre ? P_BG : J_BG;

  // Extraire le sprite original
  const sSpr = extractSprite(
    img,
    col * tw + 10,
    title + row * th + 4,
    tw - 20,
    th - 4,
    bg
  );
  const sCtx = sSpr.getContext('2d');
  const bbox = getBBox(sCtx, sSpr.width, sSpr.height);

  // Taille finale du sprite dans la tuile
  const sprW = Math.round(TILE_W * 0.85 * scale);
  const sprH = Math.round(sprW * 0.85);

  // Canvas final transparent
  const canvas = createCanvas(TILE_W, TILE_H);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Dessiner outline
  if (bbox) {
    drawOutline(sCtx, bbox, 0, 0, OUTLINE_W, OUTLINE_C);
  }

  // Centrer le sprite dans la tuile (en bas pour que la plante "pousse" depuis le bas)
  const sprX = (TILE_W - sprW) / 2;
  const sprY = TILE_H - sprH - 4;
  ctx.drawImage(sSpr, sprX, sprY, sprW, sprH);

  return canvas;
}

// Genere un tileset complet (4 varietes x 5 stades) en PNG transparent
async function generateTileset(name, img, isSerre = true) {
  console.log(`  Genere ${name}...`);

  const ROWS = PLANT_ROWS;
  const COLS = PLANT_COLS;

  const canvas = createCanvas(COLS * TILE_W, ROWS * TILE_H);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      // Stade 0 = graine (petit), stades 1-4 = croissance
      const scale = 0.5 + col * 0.12;
      const tile = generateTile(img, row, col, isSerre, scale);
      ctx.drawImage(tile, col * TILE_W, row * TILE_H);
    }
  }

  const buf = canvas.toBuffer('image/png');
  await writeFile(`${OUT_DIR}/${name}.png`, buf);
  console.log(`    -> ${name}.png (${COLS}x${ROWS} tuiles)`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function main() {
  console.log('\n=== MiniSerre Tileset Generator ===\n');
  console.log(`Tuile : ${TILE_W}x${TILE_H} px`);
  console.log(`Bleed : ${BLEED}px | Outline : ${OUTLINE_W}px\n`);

  // Creer dossier sortie
  if (!existsSync(OUT_DIR)) {
    await mkdir(OUT_DIR, { recursive: true });
    console.log(`Dossier cree: ${OUT_DIR}\n`);
  }

  // Charger toutes les tilesets sources
  console.log('Chargement des tilesets source...');
  const loaded = {};
  for (const [name, url] of Object.entries(SRC)) {
    const fullPath = '.' + url;
    try {
      const img = await loadImage(fullPath);
      loaded[name] = img;
      console.log(`  OK: ${name}`);
    } catch (e) {
      console.warn(`  SKIP (fichier introuvable): ${name} -> ${fullPath}`);
    }
  }

  // Generer chaque tileset
  console.log('\nGeneration des tilesets mini-serre transparents...\n');
  for (const [name, img] of Object.entries(loaded)) {
    const isSerre = name.startsWith('tomates') || name.startsWith('solanacees') ||
                    name.startsWith('courgettes') || name.startsWith('haricots') ||
                    name.startsWith('ail') || name.startsWith('racines') ||
                    name.startsWith('salades') || name.startsWith('brocoli') ||
                    name.startsWith('herbes');
    await generateTileset(name, img, true);
    await sleep(50); // respire un peu
  }

  // ── Generer tileset "ALL" unifie (toutes varietes, 5 stades) ──
  // Prend la 1ere image comme reference de layout (4x5)
  const firstImg = Object.values(loaded)[0];
  if (firstImg) {
    console.log('\nGeneration du tileset global "all_plants"...');
    const canvas = createCanvas(PLANT_COLS * TILE_W, PLANT_ROWS * TILE_H);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    let idx = 0;
    for (const [, img] of Object.entries(loaded)) {
      for (let col = 0; col < PLANT_COLS; col++) {
        const scale = 0.5 + col * 0.12;
        const tile = generateTile(img, 0, col, true, scale);
        ctx.drawImage(tile, col * TILE_W, idx * TILE_H);
      }
      idx++;
      if (idx >= PLANT_ROWS) break; // max 4 rangees
    }
    await writeFile(`${OUT_DIR}/all_plants.png`, canvas.toBuffer('image/png'));
    console.log('    -> all_plants.png');
  }

  console.log('\n=== Termine ! ===');
  console.log(`Fichiers generes dans: ${OUT_DIR}/`);
  console.log('\nPour les utiliser dans useTileFusion, pointez PLANT_URL vers');
  console.log(`  /tileset/miniserre/all_plants.png`);
  console.log(`  (4 lignes x 5 colonnes = 20 tuiles transparentes avec outline)\n`);
}

main().catch(console.error);

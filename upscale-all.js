#!/usr/bin/env node
/**
 * upscale-all.js
 * ================================================================
 * Script complet d'upscale IA des tilesets
 *
 * Option 1: Real-ESRGAN (meilleure qualité - ligne de commande)
 * Option 2: Sharp (upscale bicubique - rapide, moins beau)
 * Option 3: Instructions Upscayl (GUI simple)
 *
 * Usage: node upscale-all.js
 */

import { execSync } from 'child_process';
import { readdir, mkdir, copyFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

const INPUT_DIR = 'public/tileset/miniserre';
const OUTPUT_DIR = 'public/tileset/miniserre-hd';
const BACKUP_DIR = 'public/tileset/miniserre-backup';
const SCALE = 3;

console.log(`
╔════════════════════════════════════════════════════════════╗
║   UPSCALE TILESETS ×${SCALE} — Meilleure qualité visuelle    ║
╚════════════════════════════════════════════════════════════╝
`);

// Option 1: Real-ESRGAN (meilleur résultat)
async function upscaleRealEsrgan() {
  console.log('🔍 Recherche de Real-ESRGAN...\n');

  let cmd = null;
  try {
    execSync('realesrgan-ncnn-vulkan -h', { stdio: 'ignore' });
    cmd = 'realesrgan-ncnn-vulkan';
  } catch {}

  if (!cmd) {
    console.log(`❌ Real-ESRGAN n'est pas installé.

📥 Téléchargement rapide (Windows):
1. Va sur: https://github.com/xinntao/Real-ESRGAN/releases
2. Télécharge: Real-ESRGAN-ncnn-vulkan-20220419-windows.zip
3. Extrais le ZIP dans: C:\\Tools\\realesrgan\\
4. Ajoute au PATH ou modifie ce script avec le chemin complet

🍎 macOS/Linux:
   brew install realesrgan
   # ou
   pip install realesrgan

🖼️ Alternative simple: Utilise Upscayl (voir ci-dessous)\n`);
    return false;
  }

  console.log(`✅ Found: ${cmd}\n`);

  if (!existsSync(OUTPUT_DIR)) await mkdir(OUTPUT_DIR, { recursive: true });

  const files = (await readdir(INPUT_DIR)).filter(f => f.endsWith('.png'));

  for (const file of files) {
    const input = path.join(INPUT_DIR, file);
    const tempOutput = path.join(OUTPUT_DIR, file.replace('.png', '-temp.png'));
    const finalOutput = path.join(OUTPUT_DIR, file);

    console.log(`⏳ Upscaling: ${file}...`);
    try {
      // Real-ESRGAN n'a pas de scale 3, on fait x4 puis resize
      execSync(`${cmd} -i "${input}" -o "${tempOutput}" -s 4 -n realesrgan-x4plus`, { stdio: 'ignore' });

      // Redimensionne à ×3 exact
      await sharp(tempOutput)
        .resize({ width: await getWidth(input) * SCALE, height: await getHeight(input) * SCALE, kernel: 'lanczos3' })
        .toFile(finalOutput);

      console.log(`✅ ${file} upscalé ×${SCALE}!`);
    } catch (err) {
      console.error(`❌ Erreur: ${file}`, err.message);
    }
  }

  return true;
}

// Option 2: Sharp (upscale bicubique - qualité moyenne mais rapide)
async function upscaleSharp() {
  console.log('\n🚀 Utilisation de Sharp (upscale bicubique)...\n');

  if (!existsSync(OUTPUT_DIR)) await mkdir(OUTPUT_DIR, { recursive: true });

  const files = (await readdir(INPUT_DIR)).filter(f => f.endsWith('.png'));

  for (const file of files) {
    const input = path.join(INPUT_DIR, file);
    const output = path.join(OUTPUT_DIR, file);

    console.log(`⏳ Upscaling: ${file}...`);

    const meta = await sharp(input).metadata();
    await sharp(input)
      .resize({
        width: meta.width * SCALE,
        height: meta.height * SCALE,
        kernel: 'lanczos3', // Meilleur algorithme
        fit: 'fill'
      })
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(output);

    console.log(`✅ ${file}: ${meta.width}x${meta.height} → ${meta.width*SCALE}x${meta.height*SCALE}`);
  }

  return true;
}

async function getWidth(file) {
  const meta = await sharp(file).metadata();
  return meta.width;
}

async function getHeight(file) {
  const meta = await sharp(file).metadata();
  return meta.height;
}

// Instructions Upscayl
function showUpscaylInstructions() {
  console.log(`
🖼️  OPTION 3: Upscayl (GUI - Très simple)
─────────────────────────────────────────
1. Télécharge Upscayl: https://upscayl.org/
2. Ouvre l'app
3. Glisse le dossier: ${INPUT_DIR}
4. Choisit:
   - Modèle: REAL-ESRGAN
   - Scale: 3x
   - Format: PNG
5. Exporte vers: ${OUTPUT_DIR}
6. Copie les fichiers:
   xcopy /Y "${OUTPUT_DIR}\\*.png" "${INPUT_DIR}\\"
`);
}

// Menu principal
async function main() {
  console.log(`Options disponibles:
1. Real-ESRGAN (meilleure qualité IA) - Recommandé
2. Sharp (upscale bicubique - rapide)
3. Instructions Upscayl (GUI simple)
4. Appliquer les fichiers upscalés
`);

  const choice = process.argv[2] || '2'; // Défaut: Sharp

  switch(choice) {
    case '1':
      const success = await upscaleRealEsrgan();
      if (!success) showUpscaylInstructions();
      break;
    case '2':
      await upscaleSharp();
      break;
    case '3':
      showUpscaylInstructions();
      break;
    case '4':
      console.log('\n📋 Application des fichiers upscalés...');
      // Backup
      if (!existsSync(BACKUP_DIR)) await mkdir(BACKUP_DIR, { recursive: true });
      const files = await readdir(INPUT_DIR);
      for (const file of files.filter(f => f.endsWith('.png'))) {
        await copyFile(path.join(INPUT_DIR, file), path.join(BACKUP_DIR, file));
      }
      // Copy HD
      const hdFiles = await readdir(OUTPUT_DIR);
      for (const file of hdFiles.filter(f => f.endsWith('.png'))) {
        await copyFile(path.join(OUTPUT_DIR, file), path.join(INPUT_DIR, file));
      }
      console.log('✅ Fichiers appliqués! Backup dans:', BACKUP_DIR);
      break;
    default:
      console.log('Usage: node upscale-all.js [1|2|3|4]');
  }
}

main().catch(console.error);

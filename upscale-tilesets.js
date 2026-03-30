#!/usr/bin/env node
/**
 * upscale-tilesets.js
 * ================================================================
 * Upscale automatiquement tous les tilesets avec Real-ESRGAN
 * pour obtenir une qualité 3x supérieure.
 *
 * Prérequis: Real-ESRGAN doit être installé:
 *   npm install -g realesrgan
 *   ou télécharger: https://github.com/xinntao/Real-ESRGAN/releases
 *
 * Usage: node upscale-tilesets.js
 */

import { execSync } from 'child_process';
import { readdir, mkdir, access } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const INPUT_DIR = 'public/tileset/miniserre';
const OUTPUT_DIR = 'public/tileset/miniserre-hd';
const SCALE = 3; // Triple taille

// Vérifier si Real-ESRGAN est disponible
async function checkRealEsrgan() {
  try {
    execSync('realesrgan-ncnn-vulkan -h', { stdio: 'ignore' });
    return 'realesrgan-ncnn-vulkan';
  } catch {
    try {
      execSync('realesrgan -h', { stdio: 'ignore' });
      return 'realesrgan';
    } catch {
      return null;
    }
  }
}

async function main() {
  console.log('🔍 Vérification de Real-ESRGAN...');
  const cmd = await checkRealEsrgan();

  if (!cmd) {
    console.log(`
❌ Real-ESRGAN n'est pas installé.

📥 Installation:

1. Télécharge Real-ESRGAN:
   https://github.com/xinntao/Real-ESRGAN/releases

2. Windows (PowerShell):
   winget install RealEsrgan

3. macOS/Linux:
   pip install realesrgan

4. Ou télécharge le ZIP et extrait dans le PATH
`);
    process.exit(1);
  }

  console.log(`✅ Real-ESRGAN trouvé: ${cmd}\n`);

  // Créer le dossier de sortie
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  // Liste des fichiers à upscaler
  const files = (await readdir(INPUT_DIR))
    .filter(f => f.endsWith('.png'))
    .sort();

  console.log(`📸 ${files.length} tilesets à upscaler ×${SCALE}\n`);

  // Upscale chaque fichier
  for (const file of files) {
    const input = path.join(INPUT_DIR, file);
    const output = path.join(OUTPUT_DIR, file);

    console.log(`⏳ Upscaling: ${file}...`);
    try {
      const command = `${cmd} -i "${input}" -o "${output}" -s ${SCALE} -n realesrgan-x4plus`;
      execSync(command, { stdio: 'inherit' });
      console.log(`✅ ${file} upscalé!\n`);
    } catch (err) {
      console.error(`❌ Erreur sur ${file}:`, err.message);
    }
  }

  console.log(`
🎉 Terminé! Les tilesets HD sont dans: ${OUTPUT_DIR}

📋 Prochaines étapes:
1. Remplace les fichiers: cp ${OUTPUT_DIR}/*.png ${INPUT_DIR}/
2. Mets à jour TILE_W/TILE_H dans useTileRenderer.js
3. Rebuild et test!
`);
}

main().catch(console.error);

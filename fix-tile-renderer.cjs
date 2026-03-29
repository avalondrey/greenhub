const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'hooks', 'useTileRenderer.js');
const b64File = path.join(__dirname, 'tile-renderer-fix.b64');

if (!fs.existsSync(filePath)) {
  console.error('ERREUR: Fichier non trouve a', filePath);
  console.error('Executez ce script depuis le dossier GreenHub!');
  process.exit(1);
}

if (!fs.existsSync(b64File)) {
  console.error('ERREUR: Fichier', b64File, 'non trouve!');
  console.error('Placez fix-tile-renderer.cjs et tile-renderer-fix.b64 dans le meme dossier.');
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
const lineCount = (content.match(/\n/g) || []).length;
console.log('Fichier actuel:', content.length, 'caracteres,', lineCount, 'lignes');

if (lineCount > 50) {
  console.log('Le fichier a deja des retours a la ligne. Rien a corriger.');
  process.exit(0);
}

const b64Data = fs.readFileSync(b64File, 'utf8').replace(/\s/g, '');
const fixed = Buffer.from(b64Data, 'base64').toString('utf8');
fs.writeFileSync(filePath, fixed, 'utf8');

const newLines = (fixed.match(/\n/g) || []).length;
console.log('Fichier corrige!', fixed.length, 'caracteres,', newLines, 'lignes');
console.log('');
console.log('=== SUCCES ===');
console.log('Maintenant executez:');
console.log('  git add src/hooks/useTileRenderer.js');
console.log('  git commit -m "fix: reformat useTileRenderer.js with proper line breaks"');
console.log('  git push origin main');

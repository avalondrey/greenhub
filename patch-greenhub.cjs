// ── PATCH GREENHUB — Exécuter avec : node patch-greenhub.js ──
// Place ce fichier dans C:\Users\Administrateur\Desktop\GreenHub\ puis lance-le

const fs = require('fs');
const path = require('path');

let changed = 0;

function patchFile(filePath, replacements) {
  const full = path.resolve(filePath);
  if (!fs.existsSync(full)) {
    console.log('  ⚠ Fichier non trouvé : ' + full);
    return false;
  }
  let content = fs.readFileSync(full, 'utf8');
  const original = content;

  for (const { find, replace } of replacements) {
    if (content.includes(find)) {
      content = content.replace(find, replace);
    } else {
      console.log('  ⚠ Pattern non trouvé, possible déjà patché');
    }
  }

  if (content !== original) {
    fs.writeFileSync(full, content, 'utf8');
    console.log('  ✅ ' + filePath);
    changed++;
    return true;
  }
  console.log('  ⏭ Déjà à jour : ' + filePath);
  return false;
}

console.log('\n🌱 Patch GreenHub — Amélioration rendu graphique\n');

// ═══════════════════════════════════════════════════════════
// FICHIER 1 : src/hooks/useTileRenderer.js
// ═══════════════════════════════════════════════════════════
console.log('── Fichier 1/3 : src/hooks/useTileRenderer.js ──');
patchFile('src/hooks/useTileRenderer.js', [
  // 1. Réduction épaisseur blocs
  {
    find: `const TILE_D = 30;    // side face depth`,
    replace: `const TILE_D = 18;    // side face depth (réduit pour blocs plus fins)`
  },

  // 2. Ajout seeded random après STAGE_SCALES
  {
    find: `const STAGE_SCALES = [0.4, 0.55, 0.75, 0.95, 1.15];

// ─── IMAGE LOADER`,
    replace: `const STAGE_SCALES = [0.4, 0.55, 0.75, 0.95, 1.15];

// ─── SIMPLE SEEDED RANDOM (pour variantes de texture par cellule) ───────────
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ─── IMAGE LOADER`
  },

  // 3. Headroom augmenté
  {
    find: `  const plantHeadroom = 70;`,
    replace: `  const plantHeadroom = 110;`
  },

  // 4. drawDirtBlock — ajouter cellSeed et bleeding
  {
    find: `function drawDirtBlock(ctx, x, y, opts = {}) {
  const { selected, isMoving, stageIdx = -1, stageTint } = opts;
  const hw = TILE_W / 2, hh = TILE_H / 2;
  const cx = x + hw;

  // ── Top face (diamond) ──
  ctx.beginPath();
  ctx.moveTo(cx, y);
  ctx.lineTo(x + TILE_W, y + hh);
  ctx.lineTo(cx, y + TILE_H);
  ctx.lineTo(x, y + hh);
  ctx.closePath();`,
    replace: `function drawDirtBlock(ctx, x, y, opts = {}) {
  const { selected, isMoving, stageIdx = -1, stageTint, cellSeed = 42 } = opts;
  const hw = TILE_W / 2, hh = TILE_H / 2;
  const cx = x + hw;
  const rand = seededRandom(cellSeed);

  // Bleeding : on étend le losange de 2px pour éliminer les lignes vides
  const BL = 2;

  // ── Top face (diamond + bleeding) ──
  ctx.beginPath();
  ctx.moveTo(cx, y - BL);
  ctx.lineTo(x + TILE_W + BL, y + hh);
  ctx.lineTo(cx, y + TILE_H + BL);
  ctx.lineTo(x - BL, y + hh);
  ctx.closePath();`
  },

  // 5. Grass texture — variantes aléatoires anti-damier
  {
    find: `    // Grass texture
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, y); ctx.lineTo(x + TILE_W, y + hh); ctx.lineTo(cx, y + TILE_H); ctx.lineTo(x, y + hh); ctx.closePath();
    ctx.clip();
    ctx.fillStyle = '#4e9e22';
    for (let i = 0; i < 8; i++) ctx.fillRect(x + 6 + i * 12 + Math.sin(i * 1.7) * 4, y + 8 + Math.cos(i * 2.3) * 6, 3, 4);
    ctx.fillStyle = '#3d8a18';
    for (let i = 0; i < 5; i++) ctx.fillRect(x + 10 + i * 18 + Math.cos(i * 1.3) * 3, y + 14 + Math.sin(i * 1.9) * 5, 2, 5);
    ctx.fillStyle = '#62b830';
    for (let i = 0; i < 4; i++) ctx.fillRect(x + 14 + i * 22, y + 6 + Math.sin(i * 2.7) * 4, 2, 3);
    ctx.restore();`,
    replace: `    // Grass texture — variantes aléatoires par cellule (anti-damier)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, y - BL); ctx.lineTo(x + TILE_W + BL, y + hh); ctx.lineTo(cx, y + TILE_H + BL); ctx.lineTo(x - BL, y + hh); ctx.closePath();
    ctx.clip();
    const grassColors = ['#4e9e22', '#3d8a18', '#62b830', '#55a825'];
    const grassCount = 6 + Math.floor(rand() * 5);
    ctx.fillStyle = grassColors[Math.floor(rand() * grassColors.length)];
    for (let i = 0; i < grassCount; i++) {
      const gx = x + rand() * (TILE_W - 6) + 3;
      const gy = y + rand() * (TILE_H - 10) + 5;
      const gw = 2 + rand() * 2;
      const gh = 3 + rand() * 4;
      ctx.fillStyle = grassColors[Math.floor(rand() * grassColors.length)];
      ctx.fillRect(gx, gy, gw, gh);
    }
    if (rand() > 0.65) {
      const tx = x + 15 + rand() * (TILE_W - 30);
      const ty = y + 6 + rand() * 8;
      ctx.fillStyle = '#55a825';
      ctx.fillRect(tx, ty, 2, 6);
      ctx.fillRect(tx + 3, ty + 1, 1, 5);
    }
    if (rand() > 0.8) {
      const dx = x + 10 + rand() * (TILE_W - 20);
      const dy = y + 12 + rand() * (TILE_H - 18);
      if (rand() > 0.5) {
        ctx.fillStyle = rand() > 0.5 ? '#e8d44d' : '#f0e8a0';
        ctx.beginPath(); ctx.arc(dx, dy, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#4e9e22';
        ctx.fillRect(dx - 0.5, dy + 1.5, 1, 3);
      } else {
        ctx.fillStyle = '#8a7a6a';
        ctx.beginPath(); ctx.ellipse(dx, dy, 2, 1.2, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();`
  },

  // 6. Top outline — couleur et opacité améliorées
  {
    find: `  // Top outline
  ctx.beginPath();
  ctx.moveTo(cx, y); ctx.lineTo(x + TILE_W, y + hh); ctx.lineTo(cx, y + TILE_H); ctx.lineTo(x, y + hh); ctx.closePath();
  ctx.strokeStyle = selected ? '#ffffff' : '#2d6e10';
  ctx.lineWidth = selected ? 2 : 1;
  ctx.globalAlpha = selected ? 0.9 : 0.5;
  ctx.stroke();
  ctx.globalAlpha = 1;`,
    replace: `  // Top outline — plus fin et subtil (contenu brun foncé, pas noir pur)
  ctx.beginPath();
  ctx.moveTo(cx, y); ctx.lineTo(x + TILE_W, y + hh); ctx.lineTo(cx, y + TILE_H); ctx.lineTo(x, y + hh); ctx.closePath();
  ctx.strokeStyle = selected ? '#ffffff' : '#1a4a0c';
  ctx.lineWidth = selected ? 1.5 : 0.6;
  ctx.globalAlpha = selected ? 0.85 : 0.30;
  ctx.stroke();
  ctx.globalAlpha = 1;`
  },

  // 7. Éclairage corrigé : left face éclairée, right face dans l'ombre
  {
    find: `  // ── Left face ──
  ctx.beginPath();
  ctx.moveTo(x, y + hh); ctx.lineTo(cx, y + TILE_H); ctx.lineTo(cx, y + TILE_H + TILE_D); ctx.lineTo(x, y + hh + TILE_D); ctx.closePath();
  const lGrad = ctx.createLinearGradient(x, y + hh, x + hw, y + TILE_H + TILE_D);
  lGrad.addColorStop(0, '#6b4226'); lGrad.addColorStop(1, '#5a3520');
  ctx.fillStyle = lGrad; ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  for (let i = 0; i < 4; i++) ctx.fillRect(x + 5 + i * 10, y + TILE_H + 4 + Math.sin(i) * 3, 8, 2);
  ctx.strokeStyle = '#3d2010'; ctx.lineWidth = 1; ctx.globalAlpha = 0.4; ctx.stroke(); ctx.globalAlpha = 1;

  // ── Right face ──
  ctx.beginPath();
  ctx.moveTo(cx, y + TILE_H); ctx.lineTo(x + TILE_W, y + hh); ctx.lineTo(x + TILE_W, y + hh + TILE_D); ctx.lineTo(cx, y + TILE_H + TILE_D); ctx.closePath();
  const rGrad = ctx.createLinearGradient(cx, y + TILE_H, x + TILE_W, y + hh + TILE_D);
  rGrad.addColorStop(0, '#7d4f30'); rGrad.addColorStop(1, '#6b4226');
  ctx.fillStyle = rGrad; ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  for (let i = 0; i < 4; i++) ctx.fillRect(cx + 5 + i * 10, y + TILE_H + 5 + Math.cos(i) * 2, 8, 2);
  ctx.strokeStyle = '#3d2010'; ctx.lineWidth = 1; ctx.globalAlpha = 0.3; ctx.stroke(); ctx.globalAlpha = 1;`,
    replace: `  // ── Left face (éclairée — lumière vient du haut-gauche) ──
  ctx.beginPath();
  ctx.moveTo(x, y + hh); ctx.lineTo(cx, y + TILE_H); ctx.lineTo(cx, y + TILE_H + TILE_D); ctx.lineTo(x, y + hh + TILE_D); ctx.closePath();
  const lGrad = ctx.createLinearGradient(x, y + hh, x + hw, y + TILE_H + TILE_D);
  lGrad.addColorStop(0, '#7d5a3a'); lGrad.addColorStop(1, '#6b4a2e');
  ctx.fillStyle = lGrad; ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  for (let i = 0; i < 4; i++) ctx.fillRect(x + 5 + i * 10, y + TILE_H + 4 + Math.sin(i) * 3, 8, 2);
  ctx.strokeStyle = '#3d2818'; ctx.lineWidth = 0.6; ctx.globalAlpha = 0.25; ctx.stroke(); ctx.globalAlpha = 1;

  // ── Right face (dans l'ombre — plus sombre) ──
  ctx.beginPath();
  ctx.moveTo(cx, y + TILE_H); ctx.lineTo(x + TILE_W, y + hh); ctx.lineTo(x + TILE_W, y + hh + TILE_D); ctx.lineTo(cx, y + TILE_H + TILE_D); ctx.closePath();
  const rGrad = ctx.createLinearGradient(cx, y + TILE_H, x + TILE_W, y + hh + TILE_D);
  rGrad.addColorStop(0, '#5a3520'); rGrad.addColorStop(1, '#4a2a18');
  ctx.fillStyle = rGrad; ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  for (let i = 0; i < 4; i++) ctx.fillRect(cx + 5 + i * 10, y + TILE_H + 5 + Math.cos(i) * 2, 8, 2);
  ctx.strokeStyle = '#3a2010'; ctx.lineWidth = 0.6; ctx.globalAlpha = 0.2; ctx.stroke(); ctx.globalAlpha = 1;`
  },

  // 8. Grass strip plus fin
  {
    find: `  // Grass strip (only for stages 2+)
  if (stageIdx >= 2 || stageIdx === -1) {
    ctx.fillStyle = '#4a9e20'; ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.moveTo(x, y + hh); ctx.lineTo(cx, y + TILE_H); ctx.lineTo(cx, y + TILE_H + 4); ctx.lineTo(x, y + hh + 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3d8a18';
    ctx.beginPath(); ctx.moveTo(cx, y + TILE_H); ctx.lineTo(x + TILE_W, y + hh); ctx.lineTo(x + TILE_W, y + hh + 4); ctx.lineTo(cx, y + TILE_H + 4); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
  }`,
    replace: `  // Grass strip (only for stages 2+) — plus fin
  if (stageIdx >= 2 || stageIdx === -1) {
    ctx.fillStyle = '#4a9e20'; ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.moveTo(x, y + hh); ctx.lineTo(cx, y + TILE_H); ctx.lineTo(cx, y + TILE_H + 3); ctx.lineTo(x, y + hh + 3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3d8a18';
    ctx.beginPath(); ctx.moveTo(cx, y + TILE_H); ctx.lineTo(x + TILE_W, y + hh); ctx.lineTo(x + TILE_W, y + hh + 3); ctx.lineTo(cx, y + TILE_H + 3); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
  }`
  },

  // 9. Pebbles plus discrets
  {
    find: `  // Pebbles (only for stages 2+ and empty)
  if (stageIdx >= 2 || stageIdx === -1) {
    ctx.fillStyle = '#5a3820'; ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.ellipse(cx - hw * 0.5, y + TILE_H + TILE_D - 4, 2.5, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4a3018'; ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.ellipse(cx + hw * 0.3, y + hh + TILE_D - 3, 2, 1, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }`,
    replace: `  // Pebbles (only for stages 2+ and empty) — plus discrets
  if (stageIdx >= 2 || stageIdx === -1) {
    ctx.fillStyle = '#5a3820'; ctx.globalAlpha = 0.35;
    ctx.beginPath(); ctx.ellipse(cx - hw * 0.5, y + TILE_H + TILE_D - 3, 1.8, 1, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4a3018'; ctx.globalAlpha = 0.3;
    ctx.beginPath(); ctx.ellipse(cx + hw * 0.3, y + hh + TILE_D - 2, 1.5, 0.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }`
  },

  // 10. Sprites plafonnés + ombres allégées
  {
    find: `  // Taille d'affichage : proportionnelle au stade
  const drawW = TILE_W * (0.5 + scale * 0.4);
  const drawH = drawW * (srcH / srcW);`,
    replace: `  // Taille d'affichage : proportionnelle au stade, limité pour éviter débordement
  const maxDrawW = TILE_W * 0.75;
  const drawW = Math.min(TILE_W * (0.5 + scale * 0.35), maxDrawW);
  const drawH = drawW * (srcH / srcW);`
  },

  // 11. Ombre allégée
  {
    find: `  // Ombre portée (sur la terre)
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(anchorX, anchorY - 1, drawW * 0.3, drawW * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();`,
    replace: `  // Ombre portée (sur la terre) — plus légère
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(anchorX, anchorY - 1, drawW * 0.25, drawW * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();`
  },

  // 12. Lueur sous plante allégée
  {
    find: `  // Lueur sous la plante (stade avancé)
  if (stageIdx >= 2 && !isInDirt) {
    ctx.fillStyle = 'rgba(46,125,50,0.3)';
    ctx.beginPath();
    ctx.ellipse(anchorX, anchorY - 2, drawW * 0.22, drawW * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
  }`,
    replace: `  // Lueur sous la plante (stade avancé) — plus subtile
  if (stageIdx >= 2 && !isInDirt) {
    ctx.fillStyle = 'rgba(46,125,50,0.2)';
    ctx.beginPath();
    ctx.ellipse(anchorX, anchorY - 2, drawW * 0.18, drawW * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
  }`
  },

  // 13. cellSeed dans les appels drawDirtBlock
  {
    find: `          drawDirtBlock(ctx, x, y, {
            selected: isSelected,
            isMoving: isMovingTile,
            stageIdx,
            stageTint: stageTints[stageIdx] || null,
          });`,
    replace: `          drawDirtBlock(ctx, x, y, {
            selected: isSelected,
            isMoving: isMovingTile,
            stageIdx,
            stageTint: stageTints[stageIdx] || null,
            cellSeed: idx * 137 + r * 31 + c * 53,
          });`
  },
  {
    find: `          drawDirtBlock(ctx, x, y, { selected: isSelected, stageIdx: -1 });`,
    replace: `          drawDirtBlock(ctx, x, y, { selected: isSelected, stageIdx: -1, cellSeed: idx * 137 + r * 31 + c * 53 });`
  },
]);


// ═══════════════════════════════════════════════════════════
// FICHIER 2 : src/components/MiniSerre.jsx
// ═══════════════════════════════════════════════════════════
console.log('\n── Fichier 2/3 : src/components/MiniSerre.jsx ──');
patchFile('src/components/MiniSerre.jsx', [
  {
    find: `  canvasWrapper: {
    border: '4px solid #5d8a3c',
    boxShadow: '4px 4px 0 #2d5a1b, 8px 8px 0 rgba(0,0,0,0.25)',
    overflow: 'hidden', borderRadius: 2, background: '#1a2a44',
  },`,
    replace: `  canvasWrapper: {
    border: '2px solid #5d8a3c',
    boxShadow: '3px 3px 0 #2d5a1b, 6px 6px 0 rgba(0,0,0,0.2)',
    overflow: 'hidden', borderRadius: 3, background: '#1a2a44',
  },`
  },
]);


// ═══════════════════════════════════════════════════════════
// FICHIER 3 : src/App.jsx
// ═══════════════════════════════════════════════════════════
console.log('\n── Fichier 3/3 : src/App.jsx ──');
patchFile('src/App.jsx', [
  // SVG tile depth réduit
  {
    find: `const TD = 22; // tile depth`,
    replace: `const TD = 14; // tile depth (réduit pour blocs plus fins)`
  },

  // SVG outlines affinés
  {
    find: `      {/* Outline */}
      <polygon points={topPts} fill="none" stroke={selected ? "#ffffff" : "#2d6e10"} strokeWidth={selected ? 2 : 1} opacity={selected ? 0.9 : 0.5}/>
      <polygon points={leftPts}  fill="none" stroke="#3d2010" strokeWidth={1} opacity={0.4}/>
      <polygon points={rightPts} fill="none" stroke="#3d2010" strokeWidth={1} opacity={0.3}/>`,
    replace: `      {/* Outline — plus fin */}
      <polygon points={topPts} fill="none" stroke={selected ? "#ffffff" : "#2d6e10"} strokeWidth={selected ? 1.5 : 0.6} opacity={selected ? 0.85 : 0.35}/>
      <polygon points={leftPts}  fill="none" stroke="#3d2010" strokeWidth={0.6} opacity={0.25}/>
      <polygon points={rightPts} fill="none" stroke="#3d2010" strokeWidth={0.6} opacity={0.2}/>`
  },

  // Bandes herbe SVG — droite assombrie
  {
    find: `      {/* Bandes herbe */}
      <polygon points={grassLeftPts}  fill="#4a9e20" opacity={0.9}/>
      <polygon points={grassRightPts} fill="#3d8a18" opacity={0.9}/>`,
    replace: `      {/* Bandes herbe — droite plus sombre (ombre) */}
      <polygon points={grassLeftPts}  fill="#4a9e20" opacity={0.85}/>
      <polygon points={grassRightPts} fill="#3a7814" opacity={0.75}/>`
  },
]);


// ═══════════════════════════════════════════════════════════
// RÉSUMÉ
// ═══════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(50));
if (changed > 0) {
  console.log(`✅ ${changed} fichier(s) modifié(s) avec succès !`);
  console.log('\nTu peux maintenant :');
  console.log('  git add -A');
  console.log('  git commit -m "fix: amélioration rendu graphique mini-serres"');
  console.log('  git push origin main');
} else {
  console.log('⏭ Tous les fichiers étaient déjà à jour.');
}
console.log('═'.repeat(50) + '\n');

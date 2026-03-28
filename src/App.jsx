import { useState, useCallback, useEffect, useRef } from 'react';
import { PLANTS_DB, PLANTS_SIMPLE, generateTasks, estimateYield } from './db/plants.js';
import useTileEngine, { TOMATO_TILE_MAP, TILESET_STAGE_COUNT } from './hooks/useTileFusion';

// ─── GARDEN OBJECTS DATABASE ──────────────────────────────────────────────────
// Objets du jardin réel : arbres, haies, arbustes, petits fruits, cabanons, serres

const GARDEN_OBJECTS_DB = {
  // ARBRES
  trees: [
    { id: 'tree_oak', name: 'Chêne', emoji: '🌳', type: 'tree', color: '#228B22', size: 'large', spanCells: 4, description: 'Grand arbre d\'ombre', fruit: null },
    { id: 'tree_maple', name: 'Érable', emoji: '🍁', type: 'tree', color: '#B8860B', size: 'large', spanCells: 3, description: 'Bel arbre ornemental', fruit: null },
    { id: 'tree_pine', name: 'Pin', emoji: '🌲', type: 'tree', color: '#2E8B57', size: 'large', spanCells: 3, description: 'Conifère persistante', fruit: null },
    { id: 'tree_birch', name: 'Bouleau', emoji: '白', type: 'tree', color: '#90EE90', size: 'medium', spanCells: 2, description: 'Arbre élégant au tronc blanc', fruit: null },
    { id: 'tree_willow', name: 'Saule', emoji: '🌿', type: 'tree', color: '#6B8E23', size: 'large', spanCells: 4, description: 'Arbre pleureur élégant', fruit: null },
  ],
  // ARBRES FRUITIERS
  fruit_trees: [
    { id: 'apple_tree', name: 'Pommier', emoji: '🍎', type: 'fruit_tree', color: '#DC143C', size: 'medium', spanCells: 3, description: 'Pommes rouges ou vertes', fruit: '🍎', production: '50-100kg/an' },
    { id: 'pear_tree', name: 'Poirier', emoji: '🍐', type: 'fruit_tree', color: '#9ACD32', size: 'medium', spanCells: 3, description: 'Poires juteuses', fruit: '🍐', production: '30-80kg/an' },
    { id: 'cherry_tree', name: 'Cerisier', emoji: '🍒', type: 'fruit_tree', color: '#FF6347', size: 'medium', spanCells: 3, description: 'Cerises douces', fruit: '🍒', production: '20-50kg/an' },
    { id: 'plum_tree', name: 'Prunier', emoji: '🫐', type: 'fruit_tree', color: '#8B008B', size: 'medium', spanCells: 3, description: 'Prunes violettes', fruit: '🫐', production: '30-70kg/an' },
    { id: 'peach_tree', name: 'Pêchers', emoji: '🍑', type: 'fruit_tree', color: '#FFB6C1', size: 'medium', spanCells: 3, description: 'Pêches veloutées', fruit: '🍑', production: '25-60kg/an' },
    { id: 'fig_tree', name: 'Figuer', emoji: '📗', type: 'fruit_tree', color: '#8B4513', size: 'medium', spanCells: 2, description: 'Figues noires ou vertes', fruit: '📗', production: '15-30kg/an' },
    { id: 'walnut_tree', name: 'Noyer', emoji: '🌰', type: 'fruit_tree', color: '#8B4513', size: 'large', spanCells: 5, description: 'Noix fraîches', fruit: '🌰', production: '30-100kg/an' },
    { id: 'hazelnut_tree', name: 'Noisetier', emoji: '🌰', type: 'fruit_tree', color: '#D2691E', size: 'medium', spanCells: 2, description: 'Noisettes', fruit: '🌰', production: '10-25kg/an' },
  ],
  // HAIES
  hedges: [
    { id: 'hedge_beech', name: 'Hêtre', emoji: '🌲', type: 'hedge', color: '#228B22', size: 'long', spanCells: 1, height: 'high', description: 'Hedge persistante élégante' },
    { id: 'hedge_yew', name: 'If', emoji: '🌲', type: 'hedge', color: '#006400', size: 'long', spanCells: 1, height: 'medium', description: 'Idéal pour topiaire' },
    { id: 'hedge_cypress', name: 'Cyprès', emoji: '🌲', type: 'hedge', color: '#2E8B57', size: 'long', spanCells: 1, height: 'very_high', description: 'CYprès columnaire' },
    { id: 'hedge_ivy', name: 'Lierre', emoji: '🌿', type: 'hedge', color: '#355E3B', size: 'long', spanCells: 1, height: 'low', description: 'Lierre grimpant' },
    { id: 'hedge_roses', name: 'Rosiers', emoji: '🌹', type: 'hedge', color: '#DC143C', size: 'long', spanCells: 1, height: 'medium', description: 'Hedge fleurie et parfumée' },
    { id: 'hedge_lavender', name: 'Lavande', emoji: '💜', type: 'hedge', color: '#9370DB', size: 'long', spanCells: 1, height: 'low', description: ' fragrance apaisante' },
  ],
  // ARBUSTES
  shrubs: [
    { id: 'shrub_hydrangea', name: 'Hortensia', emoji: '💐', type: 'shrub', color: '#4169E1', size: 'small', spanCells: 1, description: 'Fleurs bleues ou roses' },
    { id: 'shrub_azalea', name: 'Azalée', emoji: '🌸', type: 'shrub', color: '#FF69B4', size: 'small', spanCells: 1, description: 'Fleurs colorées printanières' },
    { id: 'shrub_rhododendron', name: 'Rhododendron', emoji: '🌺', type: 'shrub', color: '#FF1493', size: 'medium', spanCells: 2, description: 'Grand arbuste fleuri' },
    { id: 'shrub_box', name: 'Buis', emoji: '🌿', type: 'shrub', color: '#355E3B', size: 'small', spanCells: 1, description: 'Parfait pour topiaire' },
    { id: 'shrub_forsythia', name: 'Forsythia', emoji: '🌼', type: 'shrub', color: '#FFD700', size: 'small', spanCells: 1, description: 'Fleurs jaunes printanières' },
    { id: 'shrub_weigela', name: 'Weigela', emoji: '🌸', type: 'shrub', color: '#FF6347', size: 'small', spanCells: 1, description: 'Fleurs tubulaires colorées' },
  ],
  // PETITS FRUITS
  small_fruits: [
    { id: 'currant', name: 'Cassis', emoji: '⚫', type: 'small_fruit', color: '#2F4F4F', size: 'small', spanCells: 1, description: 'Baies noires acidulées', fruit: '⚫', production: '3-5kg/arbuste' },
    { id: 'raspberry', name: 'Framboisier', emoji: '🍇', type: 'small_fruit', color: '#DC143C', size: 'small', spanCells: 1, description: 'Framboises délicate', fruit: '🍇', production: '2-4kg/arbuste' },
    { id: 'blackberry', name: 'Mûrier', emoji: '🫐', type: 'small_fruit', color: '#4B0082', size: 'small', spanCells: 1, description: 'Mûres sauvages', fruit: '🫐', production: '3-6kg/arbuste' },
    { id: 'blueberry', name: 'Myrtillier', emoji: '🫐', type: 'small_fruit', color: '#4169E1', size: 'small', spanCells: 1, description: 'Myrtilles santé', fruit: '🫐', production: '3-8kg/arbuste' },
    { id: 'gooseberry', name: 'Groseillier', emoji: '🟢', type: 'small_fruit', color: '#32CD32', size: 'small', spanCells: 1, description: 'Groseilles vertes ou rouges', fruit: '🟢', production: '3-6kg/arbuste' },
    { id: 'strawberry', name: 'Fraisier', emoji: '🍓', type: 'small_fruit', color: '#FF4444', size: 'small', spanCells: 1, description: 'Fraises du jardin', fruit: '🍓', production: '0.5-1kg/m²' },
    { id: 'grape', name: 'Vigne', emoji: '🍇', type: 'small_fruit', color: '#6B8E23', size: 'medium', spanCells: 1, description: 'Raisins de table', fruit: '🍇', production: '5-15kg/plant' },
    { id: 'kiwi', name: 'Kiwi', emoji: '🥝', type: 'small_fruit', color: '#8B4513', size: 'medium', spanCells: 1, description: 'Kiwi autofertile', fruit: '🥝', production: '10-30kg/plant' },
  ],
  // STRUCTURES
  structures: [
    { id: 'shed_wood', name: 'Cabanon Bois', emoji: '🏠', type: 'structure', structureType: 'shed', color: '#8B4513', spanCells: 6, description: 'Cabanon en bois naturel', width: 2, height: 2 },
    { id: 'shed_grey', name: 'Cabanon Métal', emoji: '🏚️', type: 'structure', structureType: 'shed', color: '#696969', spanCells: 6, description: 'Cabanon en tôle grise', width: 2, height: 2 },
    { id: 'greenhouse_small', name: 'Mini Serre', emoji: '🏡', type: 'structure', structureType: 'greenhouse', color: '#98FB98', spanCells: 6, description: 'Serre de jardin 6m²', width: 2, height: 2 },
    { id: 'greenhouse_large', name: 'Grande Serre', emoji: '🏢', type: 'structure', structureType: 'greenhouse', color: '#90EE90', spanCells: 12, description: 'Serre professionnelle 12m²', width: 3, height: 2 },
    { id: 'pond', name: 'Mare/Bassin', emoji: '💧', type: 'structure', structureType: 'pond', color: '#4169E1', spanCells: 4, description: 'Point d\'eau décoratif', width: 2, height: 1 },
    { id: 'compost', name: 'Compostier', emoji: '🟫', type: 'structure', structureType: 'compost', color: '#654321', spanCells: 2, description: 'Bac à compost', width: 1, height: 1 },
    { id: 'rain_barrel', name: 'Cuve de Récupération', emoji: '🪣', type: 'structure', structureType: 'barrel', color: '#708090', spanCells: 1, description: 'Récupération d\'eau de pluie', width: 1, height: 1 },
  ],
};

const ALL_GARDEN_OBJECTS = [
  ...GARDEN_OBJECTS_DB.trees,
  ...GARDEN_OBJECTS_DB.fruit_trees,
  ...GARDEN_OBJECTS_DB.hedges,
  ...GARDEN_OBJECTS_DB.shrubs,
  ...GARDEN_OBJECTS_DB.small_fruits,
  ...GARDEN_OBJECTS_DB.structures,
];

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SERRE_COLS = 4;
const SERRE_ROWS = 6;
function uid() { return Math.random().toString(36).slice(2, 9); }

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  root: {
    minHeight: '100vh',
    background: '#0d1117',
    fontFamily: "'DM Sans',sans-serif",
    backgroundImage: 'radial-gradient(ellipse at 15% 15%,#0d1f0d 0%,transparent 55%),radial-gradient(ellipse at 85% 85%,#0d0d1f 0%,transparent 55%)',
    paddingBottom: 60,
    color: '#fff',
  },
  label: { fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 },
  back: { fontSize: 12, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', marginBottom: 16, display: 'inline-block' },
  qBtn: { width: 38, height: 38, borderRadius: 8, background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 20, color: '#fff', userSelect: 'none' },
  primaryBtn: { display: 'block', width: '100%', textAlign: 'center', padding: '12px 0', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, border: 'none', boxSizing: 'border-box', transition: 'opacity 0.2s' },
};

// ── GROWTH STAGES (6 stades pour le rendu SVG/emoji fallback) ──
const GROWTH_STAGES = [
  { name: 'graine',      emoji: '🟤', scale: 0.4, opacity: 0.6 },
  { name: 'germination', emoji: '🌱', scale: 0.6, opacity: 0.8 },
  { name: 'levée',       emoji: '🌿', scale: 0.8, opacity: 0.9 },
  { name: 'petite',      emoji: '🌿', scale: 1.0, opacity: 1.0 },
  { name: 'moyenne',     emoji: '🪴', scale: 1.2, opacity: 1.0 },
  { name: 'prête',       emoji: '🪴', scale: 1.4, opacity: 1.0 },
];

// ── TILESET STAGES (5 stades = colonnes du tileset) ──
// Utilisé par le moteur de fusion quand le tileset est disponible
const TILESET_GROWTH = [
  { name: 'graine',      emoji: '🟤', scale: 0.4, opacity: 0.6 },
  { name: 'germination', emoji: '🌱', scale: 0.55, opacity: 0.8 },
  { name: 'levée',       emoji: '🌿', scale: 0.75, opacity: 0.9 },
  { name: 'croissance',  emoji: '🌿', scale: 0.95, opacity: 1.0 },
  { name: 'prête',       emoji: '🪴', scale: 1.15, opacity: 1.0 },
];

// Map each plantId to its tileset image file and row index (0-based)
// PLANT_STAGE_TILESET_MAP conservé pour les autres plantes (utilisé hors serre)
const PLANT_STAGE_TILESET_MAP = {
  'tomate-noire-de-crimee': { file: 'S02_solanacees.jpg', row: 0 },
  'poivron-ogea': { file: 'S02_solanacees.jpg', row: 1 },
  'aubergine-beaute': { file: 'S02_solanacees.jpg', row: 2 },
  'concombre-libanais': { file: 'S02_solanacees.jpg', row: 3 },
  'courgette-noire': { file: 'S03_courgettes_melon_mais.jpg', row: 0 },
  'courgette-jaune': { file: 'S03_courgettes_melon_mais.jpg', row: 1 },
  'melon-cantaloup': { file: 'S03_courgettes_melon_mais.jpg', row: 2 },
  'mais-doux': { file: 'S03_courgettes_melon_mais.jpg', row: 3 },
  'haricot-vert': { file: 'S04_haricots_poireau_oignon.jpg', row: 0 },
  'haricot-beurre': { file: 'S04_haricots_poireau_oignon.jpg', row: 1 },
  'poireau-bleu': { file: 'S04_haricots_poireau_oignon.jpg', row: 2 },
  'oignon-jaune': { file: 'S04_haricots_poireau_oignon.jpg', row: 3 },
  'ail-rose': { file: 'S05_ail_carottes_radis.jpg', row: 0 },
  'carotte-nantaise': { file: 'S05_ail_carottes_radis.jpg', row: 1 },
  'carotte-colorée': { file: 'S05_ail_carottes_radis.jpg', row: 2 },
  'radis-cherry-belle': { file: 'S05_ail_carottes_radis.jpg', row: 3 },
  'betterave-ronde': { file: 'S06_racines_feuilles1.jpg', row: 0 },
  'patate-douce': { file: 'S06_racines_feuilles1.jpg', row: 1 },
  'celeri-branche': { file: 'S06_racines_feuilles1.jpg', row: 2 },
  'epinard-monstrueux': { file: 'S06_racines_feuilles1.jpg', row: 3 },
  'laitue-batavia': { file: 'S07_salades_chou.jpg', row: 0 },
  'laitue-romaine': { file: 'S07_salades_chou.jpg', row: 1 },
  'mesclun': { file: 'S07_salades_chou.jpg', row: 2 },
  'chou-bleu': { file: 'S07_salades_chou.jpg', row: 3 },
  'brocoli': { file: 'S08_brocoli_fraises_basilic.jpg', row: 0 },
  'fraise-gariguette': { file: 'S08_brocoli_fraises_basilic.jpg', row: 1 },
  'fraise-mara-des-bois': { file: 'S08_brocoli_fraises_basilic.jpg', row: 2 },
  'basilic-grand-vert': { file: 'S08_brocoli_fraises_basilic.jpg', row: 3 },
  'basilic-thaï': { file: 'S09_herbes1.jpg', row: 0 },
  'persilCommun': { file: 'S09_herbes1.jpg', row: 1 },
  'ciboulette': { file: 'S09_herbes1.jpg', row: 2 },
  'menthe': { file: 'S09_herbes1.jpg', row: 3 },
  'thym': { file: 'S10_herbes2.jpg', row: 0 },
  'romarin': { file: 'S10_herbes2.jpg', row: 1 },
  'origan': { file: 'S10_herbes2.jpg', row: 2 },
};

const TILESET_BASE = '/tileset/stades-serre/';
const TILESET_IMG_W = 1344;
const TILESET_IMG_H = 768;
const TILESET_TITLE_H = 45;
const TILESET_ROWS = 4;
const TILESET_STAGES = 5;
const TILESET_ROW_H = (TILESET_IMG_H - TILESET_TITLE_H) / TILESET_ROWS;
const TILESET_STAGE_W = TILESET_IMG_W / TILESET_STAGES;

// ─── LIDL MINI-SERRE 3D PHOTO-RÉALISTE ─────────────────────────────────────
// Rendu fidèle à la photo : dôme transparent cristallin, bac blanc, plantes visibles

function getGrowthStage(plantedDate, daysToMaturity) {
  if (!plantedDate) return GROWTH_STAGES[0];
  const elapsed = (Date.now() - new Date(plantedDate).getTime()) / (1000 * 60 * 60 * 24);
  const progress = Math.min(elapsed / daysToMaturity, 1);
  const stageIndex = Math.min(Math.floor(progress * (GROWTH_STAGES.length - 1)), GROWTH_STAGES.length - 1);
  return GROWTH_STAGES[stageIndex];
}

function LidlGreenhouse3D({ serre, onCellClick, selectedAlveole, alveoleData }) {
  const tick = useRealtimeGrowth();
  const cols = SERRE_COLS, rows = SERRE_ROWS;
  const cellW = 46, cellH = 34;
  const gap = 2;
  const trayW = cols * (cellW + gap) + 16;
  const trayH = rows * (cellH + gap) + 16;

  // Couleurs fidèles photo
  const DOME_TINT = 'rgba(180, 230, 200, 0.35)';
  const DOME_EDGE = 'rgba(100, 180, 120, 0.5)';
  const TRAY_COLOR = 'rgba(252, 252, 250, 0.98)';
  const TRAY_SHADOW = 'rgba(0, 0, 0, 0.25)';

  // Construire la grille des alvéoles
  const cellContents = Array(rows).fill(null).map((_, row) =>
    Array(cols).fill(null).map((_, col) => {
      const idx = row * cols + col;
      const alv = serre.alveoles[idx];
      const ad = alveoleData?.[idx];
      const plant = alv ? PLANTS_SIMPLE.find(p => p.id === alv.plantId) : null;
      const dbPlant = alv ? PLANTS_DB.find(p => p.id === alv.plantId) : null;
      const isSelected = selectedAlveole === idx;
      const stage = alv ? getGrowthStage(ad?.plantedDate, dbPlant?.daysToMaturity || 60) : null;
      return { idx, alv, ad, plant, dbPlant, isSelected, stage };
    })
  );

  const hasPlants = serre.alveoles.some(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 10 }}>
      {/* CONTENEUR 3D ISOMÉTRIQUE */}
      <div style={{ perspective: 900, perspectiveOrigin: '50% 35%' }}>
        <div style={{
          transform: 'rotateX(-50deg) rotateY(-42deg)',
          transformStyle: 'preserve-3d',
          position: 'relative',
          width: trayW + 70,
          height: trayH + 100,
        }}>
          {/* OMBRE PORTÉE SOL */}
          <div style={{
            position: 'absolute',
            bottom: -8, left: 20,
            width: trayW + 20,
            height: 20,
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, transparent 70%)',
            transform: 'rotateX(90deg) translateZ(-60px)',
            filter: 'blur(4px)',
          }} />

          {/* DÔME ARRIÈRE (derrière les plantes) */}
          <div style={{
            position: 'absolute',
            top: 8, left: 28,
            width: trayW + 14,
            height: trayH + 8,
            background: `linear-gradient(160deg, rgba(220,245,225,0.4) 0%, rgba(180,230,195,0.25) 50%, rgba(160,220,180,0.35) 100%)`,
            border: `2px solid ${DOME_EDGE}`,
            borderRadius: '10px 10px 6px 6px',
            transform: 'translateZ(50px)',
            boxShadow: 'inset 0 0 30px rgba(255,255,255,0.15)',
          }} />

          {/* PLANTES À L'INTÉRIEUR (vue du dessus à travers le dôme) */}
          {cellContents.flat().filter(c => c.plant && c.stage).map(c => (
            <div key={`plant-${c.idx}`} style={{
              position: 'absolute',
              top: 18 + Math.floor(c.idx / cols) * (cellH + gap) + 4,
              left: 32 + (c.idx % cols) * (cellW + gap) + 4,
              width: cellW - 4,
              height: cellH - 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `translateZ(35px) scale(${c.stage.scale * 0.85})`,
              opacity: c.stage.opacity * 0.9,
              filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))',
              pointerEvents: 'none',
            }}>
              <span style={{ fontSize: 20 }}>{c.stage.emoji}</span>
            </div>
          ))}

          {/* DÔME AVANT (reflets et effets lumineux) */}
          <div style={{
            position: 'absolute',
            top: 8, left: 28,
            width: trayW + 14,
            height: trayH + 8,
            background: `linear-gradient(135deg,
              rgba(255,255,255,0.12) 0%,
              rgba(220,245,225,0.08) 20%,
              transparent 40%,
              rgba(200,240,210,0.05) 60%,
              rgba(180,230,190,0.1) 80%,
              rgba(200,240,205,0.08) 100%)`,
            border: `2px solid rgba(120,200,130,0.4)`,
            borderRadius: '10px 10px 6px 6px',
            transform: 'translateZ(52px)',
            boxShadow: `
              inset 2px 2px 8px rgba(255,255,255,0.25),
              inset -1px -1px 4px rgba(255,255,255,0.1),
              0 0 20px rgba(100,200,120,0.15)
            `,
            overflow: 'hidden',
          }}>
            {/* Reflet diagonal principal */}
            <div style={{
              position: 'absolute',
              top: -10, right: 20,
              width: 60, height: 80,
              background: 'linear-gradient(160deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
              borderRadius: '50%',
              transform: 'rotate(-20deg)',
              filter: 'blur(3px)',
            }} />
            {/* Reflet secondaire */}
            <div style={{
              position: 'absolute',
              top: 20, left: 15,
              width: 30, height: 40,
              background: 'linear-gradient(160deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
              borderRadius: '50%',
              filter: 'blur(2px)',
            }} />
          </div>

          {/* TOIT / PIGNON DU DÔME */}
          <div style={{
            position: 'absolute',
            top: -18, left: 28,
            width: trayW + 14,
            height: 30,
            background: `linear-gradient(180deg,
              rgba(200,235,210,0.5) 0%,
              rgba(180,225,195,0.4) 40%,
              rgba(160,215,175,0.5) 100%)`,
            border: `2px solid rgba(120,195,125,0.45)`,
            borderBottom: 'none',
            borderRadius: '14px 14px 0 0',
            transform: 'translateZ(52px)',
            boxShadow: '0 -2px 15px rgba(100,200,100,0.2)',
          }}>
            {/* Étiquette LIDL rouge */}
            <div style={{
              position: 'absolute',
              top: 6, left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(180deg, #e63946 0%, #c1121f 100%)',
              color: '#fff',
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: 2.5,
              padding: '3px 14px 2px',
              borderRadius: 3,
              boxShadow: '0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
              fontFamily: 'Arial, sans-serif',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}>LIDL</div>
          </div>

          {/* BAC BLANC (tray) - FACE AVANT */}
          <div style={{
            position: 'absolute',
            top: 10, left: 30,
            width: trayW,
            height: trayH,
            background: `linear-gradient(165deg,
              #fefefe 0%,
              ${TRAY_COLOR} 15%,
              rgba(248,248,246,0.98) 50%,
              rgba(245,245,243,0.98) 100%)`,
            border: '2px solid rgba(200,200,195,0.6)',
            borderRadius: 5,
            transform: 'translateZ(3px)',
            boxShadow: `
              0 12px 40px ${TRAY_SHADOW},
              0 4px 12px rgba(0,0,0,0.15),
              inset 0 2px 0 rgba(255,255,255,0.9),
              inset 0 -2px 0 rgba(0,0,0,0.04)
            `,
            padding: '8px',
          }}>
            {/* Grille des alvéoles */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, ${cellW}px)`,
              gridTemplateRows: `repeat(${rows}, ${cellH}px)`,
              gap: gap,
            }}>
              {cellContents.flat().map(({ idx, plant, isSelected, stage, ad, dbPlant }) => (
                <div
                  key={idx}
                  onClick={() => onCellClick(idx)}
                  style={{
                    width: cellW,
                    height: cellH,
                    borderRadius: 4,
                    background: plant
                      ? `linear-gradient(145deg, ${plant.color}25 0%, ${plant.color}10 100%)`
                      : 'rgba(215,215,210,0.5)',
                    border: `2px solid ${isSelected ? '#fff' : plant ? plant.color + '70' : 'rgba(180,180,175,0.5)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    transform: isSelected ? 'scale(1.06)' : 'scale(1)',
                    boxShadow: plant
                      ? `0 2px 8px ${plant.color}40, inset 0 1px 0 rgba(255,255,255,0.95)`
                      : 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.04)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Trou de drainage */}
                  {!plant && (
                    <div style={{
                      width: 7, height: 7,
                      borderRadius: '50%',
                      background: 'rgba(160,160,155,0.35)',
                      border: '1px solid rgba(150,150,145,0.4)',
                    }} />
                  )}
                  {/* Plante (vue frontale dans la cellule) */}
                  {plant && stage && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      transform: `scale(${stage.scale * 0.8})`,
                      opacity: stage.opacity,
                      transition: 'all 0.6s ease',
                      filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))',
                    }}>
                      <span style={{ fontSize: 18 }}>{stage.emoji}</span>
                    </div>
                  )}
                  {/* Barre de croissance */}
                  {plant && (
                    <div style={{
                      position: 'absolute',
                      bottom: 2, left: 3, right: 3,
                      height: 3,
                      background: 'rgba(195,195,190,0.45)',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${ad?.plantedDate ? Math.min((Date.now() - new Date(ad.plantedDate).getTime()) / (1000 * 60 * 60 * 24) / (dbPlant?.daysToMaturity || 60) * 100, 100) : 0}%`,
                        background: plant.color,
                        borderRadius: 2,
                        transition: 'width 1s ease',
                        boxShadow: `0 0 5px ${plant.color}`,
                      }} />
                    </div>
                  )}
                  {/* Indicateur sélection */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: -3, right: -3,
                      width: 11, height: 11,
                      background: '#fff',
                      borderRadius: '50%',
                      border: '2px solid #2ecc71',
                      boxShadow: '0 0 10px rgba(46,204,113,0.7)',
                    }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CÔTÉ DROIT DU BAC (profondeur) */}
          <div style={{
            position: 'absolute',
            top: 10, left: trayW + 30,
            width: 12,
            height: trayH,
            background: `linear-gradient(90deg,
              rgba(180,180,175,0.3) 0%,
              rgba(160,160,155,0.4) 100%)`,
            borderRight: '2px solid rgba(170,170,165,0.5)',
            transform: 'translateZ(3px) skewY(-2deg)',
            transformOrigin: 'top left',
          }} />

          {/* DESSOUS DU BAC */}
          <div style={{
            position: 'absolute',
            top: trayH + 10, left: 30,
            width: trayW,
            height: 10,
            background: 'linear-gradient(180deg, rgba(180,180,175,0.4) 0%, rgba(160,160,155,0.35) 100%)',
            border: '2px solid rgba(170,170,165,0.4)',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            transform: 'translateZ(2px)',
          }} />

          {/* PIEDS DU BAC */}
          {[
            { left: 38, top: trayH + 18 },
            { left: trayW + 14, top: trayH + 18 },
          ].map((p, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: p.left, top: p.top,
              width: 10, height: 16,
              background: `linear-gradient(180deg,
                rgba(140,140,135,0.5) 0%,
                rgba(120,120,115,0.45) 100%)`,
              borderRadius: '0 0 4px 4px',
              transform: 'translateZ(2px)',
              boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
            }} />
          ))}

          {/* HUMIDITÉ / BUÉE */}
          {hasPlants && (
            <div style={{
              position: 'absolute',
              top: 0, left: 32,
              width: trayW - 10,
              height: 25,
              background: 'radial-gradient(ellipse at 50% 100%, rgba(200,240,210,0.2) 0%, transparent 70%)',
              filter: 'blur(6px)',
              transform: 'translateZ(55px)',
              animation: 'domeSteam 4s ease-in-out infinite',
              pointerEvents: 'none',
            }} />
          )}
        </div>
      </div>

      {/* Label info */}
      <div style={{ marginTop: 14, fontSize: 11, color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontFamily: 'DM Sans, sans-serif' }}>
        🏠 {serre.name} · {serre.alveoles.filter(Boolean).length}/24 alvéoles
        {hasPlants && <span style={{ marginLeft: 8 }}>💧</span>}
      </div>

      <style>{`
        @keyframes domeSteam {
          0%, 100% { opacity: 0; transform: translateZ(55px) translateY(0) scaleX(1); }
          50% { opacity: 0.7; transform: translateZ(55px) translateY(-10px) scaleX(1.08); }
        }
      `}</style>
    </div>
  );
}

// ─── Animation d'horloge temps réel ──────────────────────────────────────────
function useRealtimeGrowth() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000); // every minute
    return () => clearInterval(interval);
  }, []);
  return tick;
}

// ─── ISOMETRIC MINI-SERRE PIXEL-ART ─────────────────────────────────────────
// Rendu isométrique style ferme/voisin avec textures pixelisées, dôme vitré et bois

const ISO_COLS = 4;
const ISO_ROWS = 6;
const TW = 64; // tile width
const TH = 32; // tile height
const TD = 22; // tile depth

function isoXY(c, r) {
  return {
    x: (c - r) * (TW / 2),
    y: (c + r) * (TH / 2),
  };
}

// ── DEFS SVG réutilisables ────────────────────────────────────────────────────
function IsoDefs() {
  return (
    <defs>
      {/* PATTERN herbe top */}
      <pattern id="isoGrassPat" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#5aab2a"/>
        <rect x="0" y="0" width="4" height="4" fill="#4e9e22" opacity="0.6"/>
        <rect x="4" y="4" width="4" height="4" fill="#62b830" opacity="0.5"/>
        <rect x="2" y="1" width="2" height="2" fill="#6ecf38" opacity="0.4"/>
        <rect x="5" y="5" width="1" height="1" fill="#3d8a18" opacity="0.7"/>
        <rect x="1" y="5" width="1" height="2" fill="#3d8a18" opacity="0.5"/>
        <rect x="6" y="2" width="1" height="1" fill="#7add42" opacity="0.3"/>
      </pattern>

      {/* PATTERN herbe sélectionnée */}
      <pattern id="isoGrassSelPat" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#72d63a"/>
        <rect x="0" y="0" width="4" height="4" fill="#65c830" opacity="0.6"/>
        <rect x="4" y="4" width="4" height="4" fill="#7ae044" opacity="0.5"/>
        <rect x="2" y="1" width="2" height="2" fill="#88ee50" opacity="0.4"/>
      </pattern>

      {/* PATTERN dirt côté gauche */}
      <pattern id="isoDirtLPat" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#8b5e3c"/>
        <rect x="1" y="1" width="2" height="2" fill="#9e6e48" opacity="0.7"/>
        <rect x="4" y="3" width="3" height="2" fill="#7a5030" opacity="0.6"/>
        <rect x="0" y="5" width="2" height="2" fill="#9e6e48" opacity="0.5"/>
        <rect x="5" y="6" width="2" height="1" fill="#6a4228" opacity="0.7"/>
        <rect x="3" y="1" width="1" height="1" fill="#b07848" opacity="0.4"/>
        <rect x="6" y="4" width="1" height="2" fill="#6a4228" opacity="0.5"/>
      </pattern>

      {/* PATTERN dirt côté droit (plus sombre) */}
      <pattern id="isoDirtRPat" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#6a4830"/>
        <rect x="1" y="1" width="2" height="2" fill="#7a5838" opacity="0.7"/>
        <rect x="4" y="3" width="3" height="2" fill="#5a3c24" opacity="0.6"/>
        <rect x="0" y="5" width="2" height="2" fill="#7a5838" opacity="0.5"/>
        <rect x="5" y="6" width="2" height="1" fill="#4a3018" opacity="0.7"/>
        <rect x="3" y="0" width="1" height="1" fill="#8a6040" opacity="0.4"/>
      </pattern>

      {/* PATTERN planche bois */}
      <pattern id="isoPlankPat" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#c8a060"/>
        <rect x="0" y="0" width="8" height="1" fill="#d4aa6a" opacity="0.5"/>
        <rect x="0" y="3" width="8" height="1" fill="#b89050" opacity="0.5"/>
        <rect x="0" y="6" width="8" height="1" fill="#d4aa6a" opacity="0.4"/>
        <rect x="2" y="0" width="1" height="3" fill="#a87840" opacity="0.3"/>
        <rect x="6" y="4" width="1" height="4" fill="#a87840" opacity="0.3"/>
      </pattern>

      {/* PATTERN planche bois sombre */}
      <pattern id="isoPlankDarkPat" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#a07840"/>
        <rect x="0" y="0" width="8" height="1" fill="#b08848" opacity="0.5"/>
        <rect x="0" y="3" width="8" height="1" fill="#907030" opacity="0.5"/>
        <rect x="0" y="6" width="8" height="1" fill="#b08848" opacity="0.4"/>
      </pattern>

      {/* PATTERN terre avec sillons pour semis graine */}
      <pattern id="isoSoilSowPat" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
        {/* Base terre sombre */}
        <rect width="12" height="12" fill="#7a5030"/>
        {/* Ligne de sillon principale */}
        <rect x="0" y="4" width="12" height="2" fill="#5a3820" opacity="0.8"/>
        {/* Sillons secondaires */}
        <rect x="0" y="1" width="12" height="1" fill="#6a4228" opacity="0.5"/>
        <rect x="0" y="8" width="12" height="1" fill="#6a4228" opacity="0.5"/>
        {/* Petites graines dans le sillon */}
        <circle cx="2" cy="5" r="1.2" fill="#8b5e3c" opacity="0.9"/>
        <circle cx="6" cy="5" r="1.2" fill="#8b5e3c" opacity="0.9"/>
        <circle cx="10" cy="5" r="1.2" fill="#8b5e3c" opacity="0.9"/>
        {/* Texture terre */}
        <rect x="1" y="2" width="1" height="1" fill="#9e6e48" opacity="0.4"/>
        <rect x="5" y="7" width="2" height="1" fill="#5a3820" opacity="0.5"/>
        <rect x="9" y="2" width="1" height="1" fill="#9e6e48" opacity="0.3"/>
        <rect x="3" y="9" width="1" height="1" fill="#9e6e48" opacity="0.4"/>
        <rect x="8" y="10" width="2" height="1" fill="#6a4228" opacity="0.4"/>
      </pattern>

      {/* PATTERN terre preparee sans sillons (germe/levee) */}
      <pattern id="isoSoilGermPat" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
        <rect width="10" height="10" fill="#8b5e3c"/>
        <rect x="0" y="0" width="10" height="2" fill="#7a5030" opacity="0.6"/>
        <rect x="2" y="2" width="2" height="1" fill="#9e6e48" opacity="0.5"/>
        <rect x="7" y="4" width="1" height="1" fill="#6a4228" opacity="0.5"/>
        <rect x="1" y="6" width="1" height="2" fill="#7a5030" opacity="0.4"/>
        <rect x="5" y="8" width="2" height="1" fill="#9e6e48" opacity="0.3"/>
        <rect x="8" y="2" width="1" height="1" fill="#6a4228" opacity="0.4"/>
      </pattern>

      {/* Dégradé ciel */}
      <linearGradient id="isoSkyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#b8d4f0"/>
        <stop offset="100%" stopColor="#ddeeff"/>
      </linearGradient>
    </defs>
  );
}

// ── BLOC TERRAIN ISOMÉTRIQUE ─────────────────────────────────────────────────
// Supporte tileCutterData: tuiles Canvas pré-découpées depuis le TileSet
function IsoTerrainBlock({ cx, cy, selected, isMoving, plant, stage, stageIdx, onClick }) {
  const hw = TW / 2;
  const hh = TH / 2;

  const topPts   = `${cx},${cy} ${cx+hw},${cy+hh} ${cx},${cy+TH} ${cx-hw},${cy+hh}`;
  const leftPts  = `${cx-hw},${cy+hh} ${cx},${cy+TH} ${cx},${cy+TH+TD} ${cx-hw},${cy+hh+TD}`;
  const rightPts = `${cx},${cy+TH} ${cx+hw},${cy+hh} ${cx+hw},${cy+hh+TD} ${cx},${cy+TH+TD}`;

  const grassH = 5;
  const grassLeftPts  = `${cx-hw},${cy+hh} ${cx},${cy+TH} ${cx},${cy+TH+grassH} ${cx-hw},${cy+hh+grassH}`;
  const grassRightPts = `${cx},${cy+TH} ${cx+hw},${cy+hh} ${cx+hw},${cy+hh+grassH} ${cx},${cy+TH+grassH}`;

  // Pixels herbe crénelée
  const crenel = [];
  const steps = 8;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const bx = cx - hw + hw * t * 2 * 0.5;
    const by = cy + hh + hh * t;
    if (i % 2 === 0) crenel.push(<rect key={`cl${i}`} x={bx-1.5} y={by-1} width={3} height={5} fill="#3d8a18" opacity={0.9}/>);
    const bx2 = cx + hw * t;
    const by2 = cy + TH - hh * t + hh;
    if (i % 2 === 1) crenel.push(<rect key={`cr${i}`} x={bx2-1.5} y={by2-1} width={3} height={5} fill="#3d8a18" opacity={0.8}/>);
  }

  // Couleur de l'alvéole selon le stade
  const stageColors = [
    'rgba(139,94,60,0.4)',   // graine - terre
    'rgba(74,158,32,0.25)', // germination - vert clair
    'rgba(46,125,50,0.35)', // levée
    'rgba(46,125,50,0.5)',  // petite
    'rgba(46,125,50,0.65)', // moyenne
    'rgba(46,125,50,0.8)',  // prête
  ];

  const glowColors = [
    '#8b5e3c',  // graine
    '#4a9e20',  // germination
    '#2e7d32',  // levée
    '#388e3c',  // petite
    '#43a047',  // moyenne
    '#66bb6a',  // prête
  ];

  const stageIdxSafe = stageIdx !== null && stageIdx !== undefined ? stageIdx : 0;

  // Rendu d'une plante à un stade donné (fallback pour plantes sans tileset)
  const renderPlant = () => {
    if (!plant || !stage) return null;
    const plantId = plant.plantId;
    const scale = stage.scale;
    const opacity = stage.opacity;
    const fontSize = 6 + scale * 6;
    const glowColor = glowColors[stageIdxSafe] || glowColors[0];
    const isInDirt = stageIdxSafe === 0;
    const dirtSurfaceY = cy + TH;
    const plantBaseY = isInDirt ? dirtSurfaceY + TD * 0.4 : dirtSurfaceY;

    // ── PRIORITÉ 2: SVG crop pour autres plantes ─────────────────────
    const tileInfo = PLANT_STAGE_TILESET_MAP[plantId];
    if (tileInfo) {
      const imgW = 50 + scale * 12;
      const imgH = imgW * 0.55;
      const emojiY = isInDirt ? plantBaseY - imgH * 0.3 : plantBaseY - imgH - 2;
      const srcX = stageIdxSafe * TILESET_STAGE_W + 15;
      const srcY = TILESET_TITLE_H + tileInfo.row * TILESET_ROW_H + 8;
      const srcW = TILESET_STAGE_W - 30;
      const srcH = TILESET_ROW_H - 16;
      return (
        <>
          <ellipse cx={cx} cy={dirtSurfaceY + 1} rx={imgW * 0.35} ry={imgW * 0.08} fill="rgba(0,0,0,0.35)"/>
          {!isInDirt && (
            <ellipse cx={cx} cy={dirtSurfaceY} rx={imgW * 0.2} ry={imgW * 0.06} fill={glowColor} opacity={0.4}/>
          )}
          <image
            href={`${TILESET_BASE}${tileInfo.file}`}
            x={cx - imgW / 2}
            y={emojiY}
            width={imgW}
            height={imgH}
            hrefX={srcX}
            hrefY={srcY}
            hrefWidth={srcW}
            hrefHeight={srcH}
            opacity={opacity}
            preserveAspectRatio="xMidYMid meet"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))', imageRendering: 'pixelated' }}
          />
          {isInDirt && (
            <ellipse cx={cx} cy={dirtSurfaceY} rx={imgW * 0.3} ry={imgW * 0.1} fill="#8b5e3c" opacity={0.7}/>
          )}
          {stageIdxSafe > 0 && stageIdxSafe < 5 && (
            <g>
              <rect x={cx - 10} y={dirtSurfaceY + 2} width={20} height={3} rx={1} fill="rgba(0,0,0,0.4)" opacity={0.7}/>
              <rect x={cx - 10} y={dirtSurfaceY + 2} width={20 * (stageIdxSafe / 6)} height={3} rx={1} fill={glowColor} opacity={0.9}/>
            </g>
          )}
          {stageIdxSafe === 5 && (
            <>
              <rect x={cx - 14} y={emojiY - 4} width={28} height={9} rx={2} fill="#e63946" opacity={0.9}/>
              <text x={cx} y={emojiY + 3} textAnchor="middle" fontSize="6" fill="#fff" style={{ userSelect: "none" }}>PRÊTE!</text>
            </>
          )}
        </>
      );
    }

    // ── FALLBACK: emoji pour plantes sans tileset ────────────────────
    const emojiY = isInDirt ? plantBaseY : plantBaseY - fontSize * 0.6;
    return (
      <>
        <ellipse cx={cx} cy={dirtSurfaceY + 1} rx={fontSize * 0.6} ry={fontSize * 0.2} fill="rgba(0,0,0,0.4)"/>
        <text x={cx} y={emojiY} textAnchor="middle" fontSize={fontSize} opacity={opacity}
          style={{ userSelect: "none", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))" }}>
          {stage.emoji}
        </text>
        {isInDirt && (
          <>
            <ellipse cx={cx} cy={dirtSurfaceY} rx={fontSize * 0.5} ry={fontSize * 0.2} fill="#8b5e3c" opacity={0.7}/>
            <ellipse cx={cx} cy={dirtSurfaceY - 1} rx={fontSize * 0.35} ry={fontSize * 0.15} fill={glowColor} opacity={0.6}/>
          </>
        )}
        {stageIdxSafe > 0 && stageIdxSafe < 5 && (
          <g>
            <rect x={cx - 10} y={dirtSurfaceY + 2} width={20} height={3} rx={1} fill="rgba(0,0,0,0.4)" opacity={0.7}/>
            <rect x={cx - 10} y={dirtSurfaceY + 2} width={20 * (stageIdxSafe / 6)} height={3} rx={1} fill={glowColor} opacity={0.9}/>
          </g>
        )}
        {stageIdxSafe === 5 && (
          <>
            <rect x={cx - 14} y={emojiY - 4} width={28} height={9} rx={2} fill="#e63946" opacity={0.9}/>
            <text x={cx} y={emojiY + 3} textAnchor="middle" fontSize="6" fill="#fff" style={{ userSelect: "none" }}>PRÊTE!</text>
          </>
        )}
      </>
    );
  };

  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      {/* Faces dirt */}
      <polygon points={rightPts} fill="url(#isoDirtRPat)" />
      <polygon points={leftPts} fill="url(#isoDirtLPat)" />
      {/* Bandes herbe */}
      <polygon points={grassLeftPts}  fill="#4a9e20" opacity={0.9}/>
      <polygon points={grassRightPts} fill="#3d8a18" opacity={0.9}/>
      {/* Pixels crénelés */}
      {crenel}
      {/* Face top - selon stade de croissance */}
      {stageIdxSafe === 0 ? (
        // Stade 0 : terre avec sillons de semis
        <polygon points={topPts} fill="url(#isoSoilSowPat)" />
      ) : stageIdxSafe === 1 ? (
        // Stade 1 : terre preparee sans sillons (germe)
        <polygon points={topPts} fill="url(#isoSoilGermPat)" />
      ) : (
        // Stade 2+ : herbe normale
        <polygon points={topPts} fill={selected ? "url(#isoGrassSelPat)" : "url(#isoGrassPat)"} />
      )}
      {/* Teinte de croissance sur la tuile */}
      {plant && stage && (
        <polygon points={topPts} fill={stageColors[stageIdxSafe] || stageColors[0]} style={{ mixBlendMode: 'overlay' }}/>
      )}
      {/* Outline */}
      <polygon points={topPts} fill="none" stroke={selected ? "#ffffff" : "#2d6e10"} strokeWidth={selected ? 2 : 1} opacity={selected ? 0.9 : 0.5}/>
      <polygon points={leftPts}  fill="none" stroke="#3d2010" strokeWidth={1} opacity={0.4}/>
      <polygon points={rightPts} fill="none" stroke="#3d2010" strokeWidth={1} opacity={0.3}/>

      {/* Cailloux */}
      <ellipse cx={cx - hw*0.5} cy={cy+TH+TD-4} rx={2.5} ry={1.5} fill="#5a3820" opacity={0.6}/>
      <ellipse cx={cx + hw*0.3} cy={cy+hh+TD-3} rx={2} ry={1} fill="#4a3018" opacity={0.5}/>

      {/* Plante avec stades de croissance */}
      {plant && stage ? renderPlant() : (
        <text x={cx} y={cy+hh+4} textAnchor="middle" fontSize={7}
          fill="rgba(255,255,255,0.15)" style={{userSelect:"none", fontFamily:"monospace"}}>·</text>
      )}

      {/* Glow sélection */}
      {selected && (
        <polygon points={topPts} fill="rgba(255,255,255,0.12)" stroke="#fff" strokeWidth={2}/>
      )}
      {/* Indicateur déplacement */}
      {isMoving && (
        <>
          <polygon points={topPts} fill="rgba(46,204,113,0.2)" stroke="#2ecc71" strokeWidth={2} strokeDasharray="4,2"/>
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize="8" fill="#2ecc71" style={{ userSelect: "none" }}>📍</text>
        </>
      )}
    </g>
  );
}

// ── POTEAU BOIS ───────────────────────────────────────────────────────────────
function IsoWoodPost({ cx, cy }) {
  const pw = 10, ph = 52, capH = 10, capW = 18;
  return (
    <g>
      <rect x={cx - pw} y={cy - ph} width={pw} height={ph} fill="url(#isoDirtLPat)" opacity={0.9}/>
      <rect x={cx} y={cy - ph} width={pw*0.6} height={ph} fill="url(#isoDirtRPat)" opacity={0.9}/>
      <rect x={cx - pw} y={cy - ph} width={pw} height={ph} fill="url(#isoPlankPat)" opacity={0.85}/>
      <rect x={cx - pw} y={cy - ph} width={pw} height={ph} fill="none" stroke="#5a3010" strokeWidth={1} opacity={0.6}/>
      {[8,16,24,32,40].map(yy => (
        <line key={yy} x1={cx-pw+1} y1={cy-ph+yy} x2={cx-2} y2={cy-ph+yy} stroke="#7a4818" strokeWidth={1} opacity={0.3}/>
      ))}
      {/* Chapeau */}
      <rect x={cx - capW/2} y={cy - ph - capH} width={capW} height={capH} fill="url(#isoPlankPat)"/>
      <rect x={cx - capW/2 + capW} y={cy - ph - capH + 2} width={capW*0.3} height={capH - 2} fill="url(#isoPlankDarkPat)" opacity={0.8}/>
      <rect x={cx - capW/2} y={cy - ph - capH} width={capW} height={capH} fill="none" stroke="#5a3010" strokeWidth={1} opacity={0.7}/>
    </g>
  );
}

// ── MINI-SERRE ISOMÉTRIQUE COMPLÈTE ──────────────────────────────────────────
// Quand le moteur tileset est dispo → rendu direct via <image> (pixel art)
// Sinon → fallback IsoTerrainBlock (SVG polygons + emoji)
function IsometricMiniSerre({ serre, selectedIdx, movingIdx, onCellClick }) {
  const tick = useRealtimeGrowth();
  const { getPlantTile, isTomato, terrainTile, blockW, blockH, diamondTopRatio, ready } = useTileEngine();

  // ── Mode tileset : les cellules utilisent les vraies images ──
  const anyTomato = serre.alveoles.some(a => a && isTomato(a.plantId));
  const useTileEngine = ready && anyTomato;

  // Dimensions de la grille selon le mode
  const cellW = useTileEngine ? blockW : TW;
  const cellH = useTileEngine ? blockH : (TH + TD);

  // Fonction de position iso adaptée
  const isoPos = (c, r) => ({
    x: (c - r) * (cellW / 2),
    y: (c + r) * (cellH / 4),  // ratio isométrique
  });

  const allPos = [];
  for (let r = 0; r < ISO_ROWS; r++)
    for (let c = 0; c < ISO_COLS; c++)
      allPos.push(isoPos(c, r));

  const minX = Math.min(...allPos.map(p => p.x)) - cellW/2;
  const maxX = Math.max(...allPos.map(p => p.x)) + cellW/2;
  const minY = Math.min(...allPos.map(p => p.y));
  const maxY = Math.max(...allPos.map(p => p.y)) + cellH;

  const padX = 50, padTop = 90, padBot = 40;
  const svgW = maxX - minX + padX * 2;
  const svgH = maxY - minY + padTop + padBot;
  const ox = -minX + padX;
  const oy = -minY + padTop;

  // Coins serre pour le dôme
  const tl = isoPos(-0.5, -0.5);
  const tr = isoPos(ISO_COLS-0.5, -0.5);
  const bl = isoPos(-0.5, ISO_ROWS-0.5);
  const br = isoPos(ISO_COLS-0.5, ISO_ROWS-0.5);

  return (
    <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}
      style={{ display:"block", margin:"0 auto", imageRendering:"pixelated", maxWidth:"100%" }}>
      <IsoDefs />

      {/* Fond ciel */}
      <rect width={svgW} height={svgH} fill="url(#isoSkyGrad)"/>

      {/* Nuages pixel */}
      {[[60,18,28,10],[180,28,20,8],[300,12,24,9],[380,22,16,7]].map(([x,y,w,h],i)=>(
        <g key={i} opacity={0.45}>
          <rect x={x} y={y} width={w} height={h} rx={4} fill="#fff"/>
          <rect x={x+4} y={y-4} width={w-8} height={h} rx={3} fill="#fff"/>
        </g>
      ))}

      {/* Ombre sol */}
      <ellipse cx={svgW/2} cy={svgH - 18} rx={svgW*0.36} ry={10}
        fill="rgba(0,0,0,0.12)"/>

      <g transform={`translate(${ox},${oy})`}>

        {/* ── MODE MOTEUR TILESET : <image> direct ── */}
        {useTileEngine ? (
          Array.from({length: ISO_ROWS}, (_,r) =>
            Array.from({length: ISO_COLS}, (_,c) => {
              const idx = r * ISO_COLS + c;
              const {x, y} = isoPos(c, r);
              const alv = serre.alveoles[idx];
              const ad = serre.alveoleData?.[idx];
              const dbPlant = alv ? PLANTS_DB.find(p => p.id === alv.plantId) : null;
              const cx = x + cellW / 2;

              // Calcul stade moteur tileset (5 stades)
              let stageIdx = null;
              if (alv) {
                const elapsed = ad?.plantedDate
                  ? (Date.now() - new Date(ad.plantedDate).getTime()) / (86400000)
                  : 0;
                const maturity = dbPlant?.daysToMaturity || 60;
                const progress = Math.min(elapsed / maturity, 1);
                stageIdx = Math.min(Math.floor(progress * TILESET_STAGE_COUNT), TILESET_STAGE_COUNT - 1);
              }

              // Choisir la bonne image
              const isTom = alv && isTomato(alv.plantId);
              const plantImg = isTom ? getPlantTile(alv.plantId, stageIdx ?? 0) : null;
              const tileImg = plantImg || terrainTile;

              if (!tileImg) return null;

              // Positionner l'image : le diamond top du bloc aligné sur la grille iso
              const imgTopOffset = Math.round(blockH * diamondTopRatio);
              const imgX = cx - blockW / 2;
              const imgY = y - imgTopOffset;

              return (
                <g key={idx} onClick={() => onCellClick(idx)} style={{ cursor: 'pointer' }}>
                  <image
                    href={tileImg}
                    x={imgX}
                    y={imgY}
                    width={blockW}
                    height={blockH}
                  />
                  {/* Sélection */}
                  {selectedIdx === idx && (
                    <polygon
                      points={`${cx},${y} ${cx+cellW/2},${y+cellH/4} ${cx},${y+cellH/2} ${cx-cellW/2},${y+cellH/4}`}
                      fill="rgba(255,255,255,0.12)" stroke="#fff" strokeWidth={2}
                    />
                  )}
                  {/* Déplacement */}
                  {movingIdx === idx && (
                    <>
                      <polygon
                        points={`${cx},${y} ${cx+cellW/2},${y+cellH/4} ${cx},${y+cellH/2} ${cx-cellW/2},${y+cellH/4}`}
                        fill="rgba(46,204,113,0.2)" stroke="#2ecc71" strokeWidth={2} strokeDasharray="4,2"
                      />
                      <text x={cx} y={y - 6} textAnchor="middle" fontSize="8" fill="#2ecc71"
                        style={{ userSelect: 'none' }}>📍</text>
                    </>
                  )}
                </g>
              );
            })
          )
        ) : (
          /* ── FALLBACK SVG : IsoTerrainBlock classique ── */
          Array.from({length: ISO_ROWS}, (_,r) =>
            Array.from({length: ISO_COLS}, (_,c) => {
              const idx = r * ISO_COLS + c;
              const {x, y} = isoXY(c, r);
              const alv = serre.alveoles[idx];
              const ad = serre.alveoleData?.[idx];
              const dbPlant = alv ? PLANTS_DB.find(p => p.id === alv.plantId) : null;
              const stage = alv ? getGrowthStage(ad?.plantedDate, dbPlant?.daysToMaturity || 60) : null;
              const stageIdx = stage ? Math.min(Math.floor(((Date.now() - new Date(ad?.plantedDate).getTime()) / (1000 * 60 * 60 * 24)) / (dbPlant?.daysToMaturity || 60) * (GROWTH_STAGES.length - 1)), GROWTH_STAGES.length - 1) : null;
              return (
                <IsoTerrainBlock
                  key={idx}
                  cx={x + TW/2} cy={y}
                  selected={selectedIdx === idx}
                  isMoving={movingIdx === idx}
                  plant={alv}
                  stage={stage}
                  stageIdx={stageIdx}
                  onClick={() => onCellClick(idx)}
                />
              );
            })
          )
        )}
      </g>
    </svg>
  );
}

// ─── SOWING SCREEN ─────────────────────────────────────────────────────────────
function SowingScreen({ serres, onAddSerre, onSow }) {
  const [step, setStep] = useState(0);
  const [plant, setPlant] = useState(null);
  const [qty, setQty] = useState(6);
  const [targetSerre, setTargetSerre] = useState(null);
  const [showAddSerre, setShowAddSerre] = useState(false);
  const [newSerreName, setNewSerreName] = useState('');
  const [sowingDate, setSowingDate] = useState(''); // date personnalisee
  const [useCustomDate, setUseCustomDate] = useState(false);

  // Calculer date par defaut (il y a X jours)
  const getDefaultDaysAgo = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  const handleConfirm = () => {
    if (!plant || !targetSerre) return;
    // Calculer la date de semis
    let plantedDate;
    if (useCustomDate && sowingDate) {
      plantedDate = new Date(sowingDate).toISOString();
    } else {
      plantedDate = new Date().toISOString();
    }
    onSow(plant, qty, targetSerre, plantedDate);
    setStep(0); setPlant(null); setQty(6); setTargetSerre(null); setSowingDate(''); setUseCustomDate(false);
  };

  if (step === 0) return (
    <div>
      <div style={S.label}>Quelle plante as-tu semée ?</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        {PLANTS_SIMPLE.map(p => (
          <div key={p.id} onClick={() => { setPlant(p); setStep(1); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 12px', borderRadius: 12, cursor: 'pointer', border: `2px solid ${p.color}50`, background: p.color + '15', minWidth: 60 }}>
            <span style={{ fontSize: 22 }}>{p.emoji}</span>
            <span style={{ fontSize: 10, color: '#fff' }}>{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (step === 1 && plant) return (
    <div>
      <div onClick={() => setStep(0)} style={S.back}>← Retour</div>
      <div style={{ padding: 12, background: plant.color + '15', border: `1px solid ${plant.color}40`, borderRadius: 10, marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: plant.color, fontWeight: 700, marginBottom: 3 }}>💡 Conseil IA — {plant.name} {plant.variety}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{plant.sowing_tip}</div>
      </div>
      <div style={S.label}>Combien d'alvéoles ?</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '8px 0 16px' }}>
        <div onClick={() => setQty(q => Math.max(1, q - 1))} style={S.qBtn}>−</div>
        <span style={{ fontSize: 28, fontWeight: 700, color: '#fff', minWidth: 36, textAlign: 'center' }}>{qty}</span>
        <div onClick={() => setQty(q => Math.min(SERRE_COLS * SERRE_ROWS, q + 1))} style={S.qBtn}>+</div>
      </div>
      <div style={S.label}>Dans quelle mini serre ?</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '8px 0 10px' }}>
        {serres.map(s => {
          const free = s.alveoles.filter(a => !a).length;
          return (
            <div key={s.id} onClick={() => setTargetSerre(s.id)} style={{ padding: '8px 14px', borderRadius: 10, cursor: 'pointer', border: `2px solid ${targetSerre === s.id ? '#2ecc71' : 'rgba(255,255,255,0.1)'}`, background: targetSerre === s.id ? '#2ecc7115' : 'rgba(255,255,255,0.03)', transition: 'all 0.15s' }}>
              <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>🏠 {s.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{free} alvéoles libres</div>
            </div>
          );
        })}
        <div onClick={() => setShowAddSerre(true)} style={{ padding: '8px 14px', borderRadius: 10, cursor: 'pointer', border: '2px dashed rgba(255,255,255,0.15)', background: 'transparent', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }}>+</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Ajouter une serre</span>
        </div>
      </div>
      {showAddSerre && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input value={newSerreName} onChange={e => setNewSerreName(e.target.value)} placeholder="Nom de la serre" style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 13, outline: 'none' }} />
          <div onClick={() => { if (newSerreName.trim()) { onAddSerre(newSerreName.trim()); setNewSerreName(''); setShowAddSerre(false); } }} style={{ padding: '8px 14px', borderRadius: 8, background: '#2ecc71', color: '#0d1117', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>OK</div>
        </div>
      )}

      {/* Date de semis */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={S.label}>📅 Date de semis</div>
          <div onClick={() => setUseCustomDate(!useCustomDate)} style={{
            padding: '4px 8px',
            borderRadius: 6,
            fontSize: 10,
            cursor: 'pointer',
            background: useCustomDate ? 'rgba(46,204,113,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${useCustomDate ? 'rgba(46,204,113,0.4)' : 'rgba(255,255,255,0.1)'}`,
            color: useCustomDate ? '#2ecc71' : 'rgba(255,255,255,0.5)',
          }}>
            {useCustomDate ? '✓ Personnalisée' : 'Choisir une date'}
          </div>
        </div>
        {useCustomDate ? (
          <input
            type="date"
            value={sowingDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setSowingDate(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              fontSize: 14,
              outline: 'none',
            }}
          />
        ) : (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[1, 3, 7, 14, 21, 30].map(days => (
              <div key={days} onClick={() => { setUseCustomDate(true); const d = new Date(); d.setDate(d.getDate() - days); setSowingDate(d.toISOString().split('T')[0]); }} style={{
                padding: '6px 10px',
                borderRadius: 6,
                fontSize: 11,
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)',
              }}>
                Il y a {days}j
              </div>
            ))}
          </div>
        )}
        {useCustomDate && sowingDate && (
          <div style={{ marginTop: 6, fontSize: 11, color: '#2ecc71' }}>
            📅 Semis prévu le {new Date(sowingDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        )}
      </div>

      <div onClick={handleConfirm} style={{ ...S.primaryBtn, background: targetSerre ? plant.color : 'rgba(255,255,255,0.1)', color: targetSerre ? '#fff' : 'rgba(255,255,255,0.3)', cursor: targetSerre ? 'pointer' : 'default' }}>
        🌱 Semer {qty} × {plant.name} →
      </div>
    </div>
  );
  return null;
}

// ─── SERRE SCREEN ──────────────────────────────────────────────────────────────
function SerreScreen({ serres, onAddSerre, onTransplant, onRemoveSerreSeed, onMoveSerreSeed }) {
  const [newName, setNewName] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedAlv, setSelectedAlv] = useState(null);
  const [showTransplant, setShowTransplant] = useState(false);
  const [movingFromIdx, setMovingFromIdx] = useState(null);
  const [showChange, setShowChange] = useState(false);
  const tick = useRealtimeGrowth();

  // Gère le clic sur une cellule
  const handleCellClick = (idx, serre) => {
    const alv = serre.alveoles[idx];

    // Si on est en mode déplacement
    if (movingFromIdx !== null) {
      if (movingFromIdx !== idx) {
        onMoveSerreSeed(serre.id, movingFromIdx, idx);
      }
      setMovingFromIdx(null);
      return;
    }

    // Clic sur alvéole occupée
    if (alv) {
      setSelectedAlv({ serreId: serre.id, idx });
      setShowTransplant(true);
      setShowChange(false);
    } else {
      // Clic sur alvéole vide → vider sélection
      setSelectedAlv(null);
      setShowTransplant(false);
      setShowChange(false);
    }
  };

  return (
    <div>
      {/* Mode déplacement actif */}
      {movingFromIdx !== null && (
        <div style={{ marginBottom: 10, padding: '8px 12px', background: 'rgba(46,204,113,0.15)', border: '1px solid rgba(46,204,113,0.4)', borderRadius: 8, fontSize: 12, color: '#2ecc71' }}>
          📍 Mode déplacement actif — clique sur une alvéole cible (ou même pour annuler)
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{serres.length} mini serre{serres.length > 1 ? 's' : ''}</div>
        <div onClick={() => setShowAdd(!showAdd)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px dashed rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer' }}>+ Ajouter une serre</div>
      </div>
      {showAdd && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nom (ex: Fenêtre cuisine)" style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
          <div onClick={() => { if (newName.trim()) { onAddSerre(newName.trim()); setNewName(''); setShowAdd(false); } }} style={{ padding: '8px 14px', borderRadius: 8, background: '#2ecc71', color: '#0d1117', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>OK</div>
        </div>
      )}
      {serres.map(serre => (
        <div key={serre.id} style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 12 }}>
            🏠 {serre.name}
            <span style={{ marginLeft: 8, fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>4×6 alvéoles · {serre.alveoles.filter(Boolean).length} occupées</span>
          </div>
          <IsometricMiniSerre key={serre.id} serre={serre} selectedIdx={selectedAlv?.serreId === serre.id ? selectedAlv.idx : null} movingIdx={movingFromIdx !== null && selectedAlv?.serreId === serre.id ? movingFromIdx : null} onCellClick={(idx) => handleCellClick(idx, serre)} />
          {showTransplant && selectedAlv?.serreId === serre.id && (() => {
            const alv = serre.alveoles[selectedAlv.idx];
            const ad = serre.alveoleData?.[selectedAlv.idx];
            const plant = alv ? PLANTS_SIMPLE.find(p => p.id === alv.plantId) : null;
            const dbPlant = alv ? PLANTS_DB.find(p => p.id === alv.plantId) : null;
            if (!plant || !dbPlant) return null;
            const daysSinceSow = ad?.plantedDate ? Math.floor((Date.now() - new Date(ad.plantedDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
            const progress = Math.min(daysSinceSow / (dbPlant.daysToMaturity || 60), 1);
            const stage = getGrowthStage(ad?.plantedDate, dbPlant.daysToMaturity || 60);
            const stageIdx = ad?.plantedDate ? Math.min(
              Math.floor(((Date.now() - new Date(ad.plantedDate).getTime()) / (1000 * 60 * 60 * 24)) / (dbPlant?.daysToMaturity || 60) * (GROWTH_STAGES.length - 1)),
              GROWTH_STAGES.length - 1
            ) : 0;
            const tileInfo = PLANT_STAGE_TILESET_MAP[alv.plantId];
            return (
              <div style={{ marginTop: 10, padding: 12, background: plant.color + '15', border: `1px solid ${plant.color}40`, borderRadius: 10 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 28, transform: `scale(${stage.scale})`, display: 'inline-block', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>{stage.emoji}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{plant.name} {plant.variety}</div>
                    <div style={{ fontSize: 11, color: plant.color }}>{dbPlant.family} · J+{daysSinceSow} · {dbPlant.daysToMaturity}j → récolte</div>
                  </div>
                </div>
                {/* Barre de progression */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                    <span>{stage.name}</span><span>{Math.round(progress * 100)}%</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                    <div style={{ height: '100%', width: `${progress * 100}%`, background: `linear-gradient(90deg, ${plant.color}, ${plant.color}99)`, borderRadius: 3, transition: 'width 1s ease', boxShadow: `0 0 8px ${plant.color}60` }} />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
                  🌡️ {dbPlant.needs.sun === 'full' ? '☀️' : dbPlant.needs.sun === 'partial' ? '⛅' : '🌤'} {dbPlant.needs.temp.min}–{dbPlant.needs.temp.max}°C
                  <br />💧 Espacement: {dbPlant.spacing.between}cm · Rendement: {dbPlant.yield.min}–{dbPlant.yield.max} {dbPlant.yield.unit}
                </div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <div onClick={() => { onTransplant(serre.id, selectedAlv.idx); setShowTransplant(false); setSelectedAlv(null); }} style={{ ...S.primaryBtn, background: plant.color, padding: '8px 0', fontSize: 11, flex: 1 }}>🌍 Repiquer</div>
                  <div onClick={() => { setMovingFromIdx(selectedAlv.idx); setShowTransplant(false); }} style={{ ...S.primaryBtn, background: 'rgba(255,255,255,0.1)', padding: '8px 0', fontSize: 11, flex: 1, border: '1px solid rgba(255,255,255,0.2)' }}>📍 Déplacer</div>
                  <div onClick={() => { onRemoveSerreSeed(serre.id, selectedAlv.idx); setShowTransplant(false); setSelectedAlv(null); }} style={{ ...S.primaryBtn, background: 'rgba(220,53,69,0.2)', padding: '8px 0', fontSize: 11, flex: 1, border: '1px solid rgba(220,53,69,0.4)' }}>🗑️ Supprimer</div>
                </div>
                {/* 5-stage evolution reference strip */}
                {tileInfo && (
                  <div style={{ marginTop: 12, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      🔄 Évolution en mini-serre · Stade {stageIdx + 1}/5
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[0,1,2,3,4].map(s => {
                        const stageLabels = ['Graine','Germination','Levée','Croissance','Prête'];
                        const isActive = s === stageIdx;
                        return (
                          <div key={s} style={{
                            flex: 1, textAlign: 'center', padding: '6px 2px',
                            background: isActive ? plant.color + '30' : 'rgba(255,255,255,0.02)',
                            borderLeft: s > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            borderRadius: isActive ? 6 : 0,
                            position: 'relative',
                          }}>
                            <div style={{
                              width: '100%', height: 48, marginBottom: 4, position: 'relative', overflow: 'hidden', borderRadius: 4,
                              background: 'rgba(0,0,0,0.2)',
                            }}>
                              <img
                                src={`${TILESET_BASE}${tileInfo.file}`}
                                style={{
                                  position: 'absolute',
                                  top: `${-((TILESET_TITLE_H + tileInfo.row * TILESET_ROW_H + 8) / TILESET_IMG_H * 100)}%`,
                                  left: `${-((s * TILESET_STAGE_W + 15) / TILESET_IMG_W * 100)}%`,
                                  width: `${(TILESET_IMG_W / (TILESET_STAGE_W / 1))}px`,
                                  maxWidth: 'none',
                                  height: `${TILESET_IMG_H}px`,
                                  imageRendering: 'pixelated',
                                }}
                              />
                            </div>
                            <div style={{ fontSize: 8, color: isActive ? plant.color : 'rgba(255,255,255,0.3)', fontWeight: isActive ? 700 : 400 }}>
                              {stageLabels[s]}
                            </div>
                            {isActive && (
                              <div style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: '50%', background: plant.color }}/>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      ))}
    </div>
  );
}

// ─── JARDIN RÉEL VOXEL ISOMÉTRIQUE ─────────────────────────────────────────
// Jardin voxel style Minecraft avec image isométrique en fond
// Permet d'ajouter, déplacer et supprimer des éléments librement

const ISOMETRIC_FOREST_BG = 'https://st5.depositphotos.com/2885805/69454/i/1600/depositphotos_694548908-stock-photo-isometric-forest-composition-set-sections.jpg';

// Couleurs voxels pour les objets
const VOXEL_COLORS = {
  tree: { top: '#228B22', side: '#1a6b1a', dark: '#145214' },
  fruit_tree: { top: '#DC143C', side: '#a01025', dark: '#7a0c1c' },
  hedge: { top: '#355E3B', side: '#2a4a2f', dark: '#1f3a24' },
  shrub: { top: '#4169E1', side: '#3456b0', dark: '#28448a' },
  small_fruit: { top: '#9370DB', side: '#7659b8', dark: '#5c4590' },
  shed: { top: '#8B4513', side: '#6d350f', dark: '#52280b' },
  greenhouse: { top: '#90EE90', side: '#73bf73', dark: '#599659' },
  pond: { top: '#4169E1', side: '#3456b0', dark: '#28448a' },
  default: { top: '#4A7023', side: '#3a5a1c', dark: '#2d4a16' },
};

function getVoxelColors(obj) {
  if (obj.type === 'tree' || obj.type === 'fruit_tree') return VOXEL_COLORS.tree;
  if (obj.type === 'hedge') return VOXEL_COLORS.hedge;
  if (obj.type === 'shrub') return VOXEL_COLORS.shrub;
  if (obj.type === 'small_fruit') return VOXEL_COLORS.small_fruit;
  if (obj.structureType === 'shed') return VOXEL_COLORS.shed;
  if (obj.structureType === 'greenhouse') return VOXEL_COLORS.greenhouse;
  if (obj.structureType === 'pond') return VOXEL_COLORS.pond;
  return VOXEL_COLORS.default;
}

function GardenReal3D({ objects, gridSize, onSelectObject, selectedId }) {
  const TILE = 32;
  const ISO_D = 16; // profondeur isometrique par tuile

  // Construire les objets positionnables sur grille libre
  const gridCells = gridSize || 20;

  // État local pour le dragged object
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e, obj) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setDragging(obj.uid);
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handlePointerMove = useCallback((e) => {
    if (!dragging) return;
    // Le deplacement est reactive via position dans l'objet
  }, [dragging]);

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, [dragging]);

  // Calcul de la position isometrique
  const toIso = (col, row) => ({
    x: 60 + col * TILE - row * TILE,
    y: 30 + col * (TILE / 2) + row * (TILE / 2),
  });

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 460,
        borderRadius: 12,
        overflow: 'hidden',
        border: '3px solid rgba(60,90,30,0.5)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        cursor: dragging ? 'grabbing' : 'default',
        userSelect: 'none',
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Fond isometrique forêt */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${ISOMETRIC_FOREST_BG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.65) saturate(1.05)',
      }} />

      {/* Overlay gradient pour lisibilite */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.35) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Grille isometrique de placement (subtile) */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Lignes iso horizontales */}
        {Array.from({ length: gridCells / 2 }, (_, i) => {
          const start = toIso(0, i * 2);
          const end = toIso(gridCells, i * 2);
          return (
            <line key={`h${i}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y}
              stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          );
        })}
        {/* Lignes iso verticales */}
        {Array.from({ length: gridCells / 2 }, (_, i) => {
          const start = toIso(i * 2, 0);
          const end = toIso(i * 2, gridCells);
          return (
            <line key={`v${i}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y}
              stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          );
        })}
      </svg>

      {/* Objets voxel */}
      {objects.map((obj) => {
        const pos = toIso(obj.position.col, obj.position.row);
        const colors = getVoxelColors(obj);
        const size = obj.spanCells || 1;
        const isSelected = selectedId === obj.uid;
        const isDragging = dragging === obj.uid;
        const voxelSize = size * TILE * 0.45;
        const voxelH = size * TILE * 0.55;

        return (
          <div
            key={obj.uid}
            onPointerDown={(e) => handlePointerDown(e, obj)}
            onClick={(e) => { if (!isDragging) onSelectObject(obj.uid); }}
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              width: voxelSize * 2,
              height: voxelSize + voxelH,
              cursor: isDragging ? 'grabbing' : 'grab',
              transform: isSelected ? 'scale(1.08)' : isDragging ? 'scale(1.12)' : 'scale(1)',
              transition: isDragging ? 'none' : 'transform 0.15s ease',
              filter: isSelected
                ? `drop-shadow(0 0 16px rgba(46,204,113,0.9))`
                : isDragging
                ? `drop-shadow(0 4px 12px rgba(0,0,0,0.5))`
                : `drop-shadow(0 2px 6px rgba(0,0,0,0.4))`,
              zIndex: isDragging ? 100 : isSelected ? 50 : 10,
              pointerEvents: 'auto',
            }}
          >
            {/* Cube voxel - face top (losange) */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%) rotateX(60deg) rotateZ(45deg)',
              width: voxelSize,
              height: voxelSize,
              background: `linear-gradient(135deg, ${colors.top} 0%, ${colors.top}cc 100%)`,
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: `inset 1px 1px 0 rgba(255,255,255,0.3)`,
            }} />

            {/* Cube voxel - face gauche */}
            <div style={{
              position: 'absolute',
              top: voxelSize * 0.3,
              left: 0,
              width: voxelSize * 0.4,
              height: voxelH,
              background: `linear-gradient(180deg, ${colors.side} 0%, ${colors.dark} 100%)`,
              transform: 'skewY(-30deg)',
              transformOrigin: 'top left',
              border: '1px solid rgba(0,0,0,0.2)',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }} />

            {/* Cube voxel - face droite */}
            <div style={{
              position: 'absolute',
              top: voxelSize * 0.3,
              right: 0,
              width: voxelSize * 0.4,
              height: voxelH,
              background: `linear-gradient(180deg, ${colors.side}cc 0%, ${colors.dark}dd 100%)`,
              transform: 'skewY(30deg)',
              transformOrigin: 'top right',
              border: '1px solid rgba(0,0,0,0.3)',
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }} />

            {/* Emoji au dessus */}
            <div style={{
              position: 'absolute',
              top: -voxelSize * 0.3,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: Math.max(16, voxelSize * 0.5),
              textShadow: '0 2px 4px rgba(0,0,0,0.6)',
              zIndex: 5,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
            }}>
              {obj.emoji}
            </div>

            {/* Indicateur de selection */}
            {isSelected && (
              <div style={{
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 10, height: 10,
                background: '#2ecc71',
                borderRadius: '50%',
                border: '2px solid #fff',
                boxShadow: '0 0 12px rgba(46,204,113,0.8)',
              }} />
            )}
          </div>
        );
      })}

      {/* Message si vide */}
      {objects.length === 0 && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.65)',
          fontSize: 14,
          fontWeight: 600,
          textShadow: '0 2px 6px rgba(0,0,0,0.6)',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>🏡</div>
          <div>Jardin Réel Voxel</div>
          <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>Ajoutez des arbres, arbustes et structures</div>
          <div style={{ fontSize: 11, opacity: 0.5 }}>Glissez pour positionner</div>
        </div>
      )}
    </div>
  );
}

// ─── JARDIN RÉEL SCREEN ──────────────────────────────────────────────────────
function GardenRealScreen({ permanentPlants, onAddPermanent, onRemovePermanent }) {
  const [activeCategory, setActiveCategory] = useState('fruit_trees');
  const [selectedObj, setSelectedObj] = useState(null);
  const [showAddPanel, setShowAddPanel] = useState(true);
  const [draggingId, setDraggingId] = useState(null);
  const gardenRef = useRef(null);

  const categories = [
    { id: 'fruit_trees', label: '🍎 Fruitiers', items: GARDEN_OBJECTS_DB.fruit_trees },
    { id: 'trees', label: '🌳 Arbres', items: GARDEN_OBJECTS_DB.trees },
    { id: 'hedges', label: '🌲 Haies', items: GARDEN_OBJECTS_DB.hedges },
    { id: 'shrubs', label: '🌿 Arbustes', items: GARDEN_OBJECTS_DB.shrubs },
    { id: 'small_fruits', label: '🫐 Petits Fruits', items: GARDEN_OBJECTS_DB.small_fruits },
    { id: 'structures', label: '🏠 Structures', items: GARDEN_OBJECTS_DB.structures },
  ];

  const handleAddObject = (obj) => {
    const newObj = {
      ...obj,
      uid: uid(),
      position: {
        col: Math.floor(Math.random() * 12) + 2,
        row: Math.floor(Math.random() * 10) + 2,
      },
    };
    onAddPermanent([...permanentPlants, newObj]);
    setSelectedObj(newObj.uid);
  };

  const handleSelectObject = (uid) => {
    setSelectedObj(selectedObj === uid ? null : uid);
  };

  const handlePointerMove = useCallback((e) => {
    if (!draggingId || !gardenRef.current) return;
    const rect = gardenRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Conversion inverse iso approximative
    const col = Math.round((x - 60 + y * 0.5) / 32 - 1);
    const row = Math.round((y * 0.5 - x + 90) / 32);
    const clampedCol = Math.max(0, Math.min(18, col));
    const clampedRow = Math.max(0, Math.min(16, row));
    onAddPermanent(permanentPlants.map(p => p.uid === draggingId ? { ...p, position: { col: clampedCol, row: clampedRow } } : p));
  }, [draggingId, permanentPlants, onAddPermanent]);

  const handlePointerUp = useCallback(() => {
    setDraggingId(null);
  }, []);

  const handleObjectPointerDown = (e, uid) => {
    e.stopPropagation();
    setDraggingId(uid);
  };

  const selectedObject = permanentPlants.find(p => p.uid === selectedObj);

  return (
    <div>
      {/* Barre de catégories */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 10, overflowX: 'auto', paddingBottom: 4 }}>
        {categories.map(cat => (
          <div key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
            padding: '6px 10px',
            borderRadius: 8,
            fontSize: 11,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            background: activeCategory === cat.id ? 'rgba(46,204,113,0.15)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${activeCategory === cat.id ? 'rgba(46,204,113,0.4)' : 'rgba(255,255,255,0.06)'}`,
            color: activeCategory === cat.id ? '#2ecc71' : 'rgba(255,255,255,0.5)',
            transition: 'all 0.15s',
          }}>
            {cat.label}
          </div>
        ))}
      </div>

      {/* Panneau d'ajout */}
      {showAddPanel && (
        <div style={{ marginBottom: 10, padding: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>Ajouter au jardin</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {categories.find(c => c.id === activeCategory)?.items.map(item => (
              <div key={item.id} onClick={() => handleAddObject(item)} style={{
                padding: '6px 10px',
                borderRadius: 8,
                cursor: 'pointer',
                background: item.color + '20',
                border: `1.5px solid ${item.color}50`,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 16 }}>{item.emoji}</span>
                <span style={{ fontSize: 10, color: '#fff' }}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vue voxel du jardin */}
      <div
        ref={gardenRef}
        style={{
          position: 'relative',
          width: '100%',
          height: 460,
          borderRadius: 12,
          overflow: 'hidden',
          border: '3px solid rgba(60,90,30,0.5)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          cursor: draggingId ? 'grabbing' : 'default',
          userSelect: 'none',
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Fond isometrique forêt */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${ISOMETRIC_FOREST_BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.65) saturate(1.05)',
        }} />

        {/* Overlay gradient pour lisibilite */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.35) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Grille isometrique */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
          {Array.from({ length: 10 }, (_, i) => {
            const start = { x: 60 + i * 32, y: 30 + i * 16 };
            const end = { x: 60 + (i + 10) * 32 - 320, y: 30 + (i + 10) * 16 };
            return <line key={`h${i}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
          })}
          {Array.from({ length: 10 }, (_, i) => {
            const start = { x: 60 + i * 32, y: 30 + i * 16 };
            const end = { x: 60 + (i - 10) * 32 + 320, y: 30 + (i - 10) * 16 };
            return <line key={`v${i}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
          })}
        </svg>

        {/* Objets voxel */}
        {permanentPlants.map((obj) => {
          const TILE = 32;
          const pos = {
            x: 60 + obj.position.col * TILE - obj.position.row * TILE,
            y: 30 + obj.position.col * (TILE / 2) + obj.position.row * (TILE / 2),
          };
          const colors = getVoxelColors(obj);
          const size = obj.spanCells || 1;
          const isSelected = selectedObj === obj.uid;
          const isDragging = draggingId === obj.uid;
          const voxelSize = size * TILE * 0.45;
          const voxelH = size * TILE * 0.55;

          return (
            <div
              key={obj.uid}
              onPointerDown={(e) => handleObjectPointerDown(e, obj.uid)}
              onClick={(e) => { if (!isDragging) handleSelectObject(obj.uid); }}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                width: voxelSize * 2,
                height: voxelSize + voxelH,
                cursor: isDragging ? 'grabbing' : 'grab',
                transform: isSelected ? 'scale(1.08)' : isDragging ? 'scale(1.12)' : 'scale(1)',
                transition: isDragging ? 'none' : 'transform 0.15s ease',
                filter: isSelected ? 'drop-shadow(0 0 16px rgba(46,204,113,0.9))' : isDragging ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' : 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
                zIndex: isDragging ? 100 : isSelected ? 50 : 10,
                pointerEvents: 'auto',
              }}
            >
              {/* Cube voxel - face top */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%) rotateX(60deg) rotateZ(45deg)',
                width: voxelSize,
                height: voxelSize,
                background: `linear-gradient(135deg, ${colors.top} 0%, ${colors.top}cc 100%)`,
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: `inset 1px 1px 0 rgba(255,255,255,0.3)`,
              }} />
              {/* Cube voxel - face gauche */}
              <div style={{
                position: 'absolute',
                top: voxelSize * 0.3,
                left: 0,
                width: voxelSize * 0.4,
                height: voxelH,
                background: `linear-gradient(180deg, ${colors.side} 0%, ${colors.dark} 100%)`,
                transform: 'skewY(-30deg)',
                transformOrigin: 'top left',
                border: '1px solid rgba(0,0,0,0.2)',
                borderTop: '1px solid rgba(255,255,255,0.1)',
              }} />
              {/* Cube voxel - face droite */}
              <div style={{
                position: 'absolute',
                top: voxelSize * 0.3,
                right: 0,
                width: voxelSize * 0.4,
                height: voxelH,
                background: `linear-gradient(180deg, ${colors.side}cc 0%, ${colors.dark}dd 100%)`,
                transform: 'skewY(30deg)',
                transformOrigin: 'top right',
                border: '1px solid rgba(0,0,0,0.3)',
                borderTop: '1px solid rgba(255,255,255,0.05)',
              }} />
              {/* Emoji */}
              <div style={{
                position: 'absolute',
                top: -voxelSize * 0.3,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: Math.max(16, voxelSize * 0.5),
                textShadow: '0 2px 4px rgba(0,0,0,0.6)',
                zIndex: 5,
                pointerEvents: 'none',
              }}>
                {obj.emoji}
              </div>
              {/* Indicateur selection */}
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  bottom: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 10, height: 10,
                  background: '#2ecc71',
                  borderRadius: '50%',
                  border: '2px solid #fff',
                  boxShadow: '0 0 12px rgba(46,204,113,0.8)',
                }} />
              )}
            </div>
          );
        })}

        {/* Message si vide */}
        {permanentPlants.length === 0 && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.65)',
            fontSize: 14,
            fontWeight: 600,
            textShadow: '0 2px 6px rgba(0,0,0,0.6)',
            pointerEvents: 'none',
          }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>🏡</div>
            <div>Jardin Réel Voxel</div>
            <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>Ajoutez des arbres, arbustes et structures</div>
            <div style={{ fontSize: 11, opacity: 0.5 }}>Glissez pour positionner</div>
          </div>
        )}
      </div>

      {/* Panneau objet sélectionné */}
      {selectedObject && (
        <div style={{ padding: 12, background: selectedObject.color + '15', border: `1px solid ${selectedObject.color}40`, borderRadius: 10, marginTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>{selectedObject.emoji}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{selectedObject.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{selectedObject.description}</div>
              {selectedObject.production && (
                <div style={{ fontSize: 10, color: '#2ecc71', marginTop: 2 }}>📦 {selectedObject.production}</div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div onClick={() => { onRemovePermanent(selectedObject.uid); setSelectedObj(null); }} style={{ flex: 1, padding: '8px 0', borderRadius: 8, textAlign: 'center', background: 'rgba(231,76,60,0.15)', border: '1px solid rgba(231,76,60,0.3)', color: '#e74c3c', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
              🗑️ Supprimer
            </div>
            <div onClick={() => setSelectedObj(null)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, textAlign: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
              ✕ Fermer
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 8 }}>
        🌳 {permanentPlants.length} élément{permanentPlants.length > 1 ? 's' : ''} · Grille 20×20 voxels
      </div>
    </div>
  );
}

// ─── JARDIN PARAMÉTRABLE ────────────────────────────────────────────────────
// Taille par défaut : 550m² = 23.5m × 23.5m
// Cellule = 50cm (correspond aux plants les plus petits type radis 5cm espacement)

export const GARDEN_CONFIG = {
  areaM2: 550,
  cellSize: 50, // cm
};

export function getGardenMetrics(areaM2) {
  const sizeM = Math.sqrt(areaM2);
  const sizeCm = sizeM * 100;
  const cols = Math.floor(sizeCm / GARDEN_CONFIG.cellSize);
  const rows = Math.floor(sizeCm / GARDEN_CONFIG.cellSize);
  return { sizeM, sizeCm, cols, rows, cellSize: GARDEN_CONFIG.cellSize };
}

// ─── GARDEN GRID ──────────────────────────────────────────────────────────────
function GardenScreen({ grid, onMove, gardenArea }) {
  const metrics = getGardenMetrics(gardenArea || 550);
  const { sizeM, cols, rows, cellSize } = metrics;
  const [selected, setSelected] = useState(null);
  const [viewRow, setViewRow] = useState(0);
  const [viewCol, setViewCol] = useState(0);
  const VIEW_ROWS = 10, VIEW_COLS = 12;

  const calcFill = (plantId) => {
    const occupied = grid.flat().filter(c => c?.origin && c?.plantId === plantId).length;
    const plant = PLANTS_DB.find(p => p.id === plantId);
    if (!plant) return null;
    const maxW = Math.max(1, Math.floor(cols * cellSize / plant.spacing.between));
    const maxL = Math.max(1, Math.floor(rows * cellSize / plant.spacing.rows));
    const total = maxW * maxL;
    return { occupied, total, pct: total > 0 ? (occupied / total) * 100 : 0, plant };
  };

  const handleCellTap = (row, col) => {
    const cell = grid[row]?.[col];
    if (selected) {
      if (selected.row === row && selected.col === col) { setSelected(null); return; }
      if (!cell) { onMove(selected.row, selected.col, row, col); setSelected(null); return; }
      if (cell.origin) { setSelected({ row, col }); return; }
      setSelected(null);
    } else {
      if (cell?.origin) setSelected({ row, col });
    }
  };

  const visibleRows = Array.from({ length: VIEW_ROWS }, (_, i) => i + viewRow).filter(r => r < rows);
  const visibleCols = Array.from({ length: VIEW_COLS }, (_, i) => i + viewCol).filter(c => c < cols);
  const totalPlants = grid.flat().filter(c => c?.origin).length;
  const gardenAreaUsed = grid.flat().filter(c => c?.origin).reduce((sum, cell) => {
    const plant = PLANTS_DB.find(p => p.id === cell.plantId);
    if (!plant) return sum;
    return sum + (plant.spacing.between * plant.spacing.rows) / 10000;
  }, 0);
  const selectedStats = selected ? calcFill(grid[selected.row]?.[selected.col]?.plantId) : null;

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
          📐 {sizeM.toFixed(1)}m × {sizeM.toFixed(1)}m = {gardenArea || 550}m² · {cols}×{rows} cases ({cellSize}cm)
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#2ecc71' }}>
          🌱 {totalPlants} plants · 📍 {gardenAreaUsed.toFixed(1)}m² / {gardenArea || 550}m² ({((gardenAreaUsed / (gardenArea || 550)) * 100).toFixed(1)}%)
        </div>
      </div>

      {selectedStats && (
        <div style={{ padding: '8px 12px', marginBottom: 8, background: selectedStats.plant.color + '15', border: `1px solid ${selectedStats.plant.color}40`, borderRadius: 8, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
          📊 {selectedStats.plant.icon} {selectedStats.plant.name} · {selectedStats.occupied}/{selectedStats.total} plants ({selectedStats.pct.toFixed(1)}%) · espacement {selectedStats.plant.spacing.between}cm × {selectedStats.plant.spacing.rows}cm
        </div>
      )}

      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {[['↖', -5, -5], ['↑', -5, 0], ['↗', -5, 5], ['←', 0, -5], ['⌀', 0, 0], ['→', 0, 5], ['↙', 5, -5], ['↓', 5, 0], ['↘', 5, 5]].map(([l, dr, dc]) => (
          <div key={l} onClick={() => { if (l === '⌀') { setViewRow(0); setViewCol(0); } else { setViewRow(r => Math.max(0, Math.min(rows - VIEW_ROWS, r + dr))); setViewCol(c => Math.max(0, Math.min(cols - VIEW_COLS, c + dc))); } }}
            style={{ padding: '4px 8px', borderRadius: 6, background: l === '⌀' ? '#2ecc71' : 'rgba(255,255,255,0.07)', color: l === '⌀' ? '#0d1117' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 12, fontWeight: 700, minWidth: 28, textAlign: 'center' }}>{l}</div>
        ))}
      </div>

      {selected && (
        <div style={{ padding: '6px 12px', marginBottom: 8, background: '#3498db20', border: '1px solid #3498db60', borderRadius: 8, fontSize: 12, color: '#3498db' }}>
          ✦ {PLANTS_SIMPLE.find(p => p.id === grid[selected.row]?.[selected.col]?.plantId)?.name} — tape une case vide pour déplacer
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${VIEW_COLS}, ${cellSize}px)`, gap: 1, background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto' }}>
        {visibleRows.map(row => visibleCols.map(col => {
          const cell = grid[row]?.[col];
          const plant = cell ? PLANTS_SIMPLE.find(p => p.id === cell.plantId) : null;
          const isOrigin = cell?.origin;
          const isSel = selected?.row === row && selected?.col === col;
          return (
            <div key={`${row}-${col}`} onClick={() => handleCellTap(row, col)} style={{
              width: cellSize, height: cellSize, borderRadius: 4, cursor: isOrigin || selected ? 'pointer' : 'default',
              background: isSel ? '#3498db40' : isOrigin ? plant?.color + '30' : cell ? plant?.color + '15' : 'rgba(255,255,255,0.02)',
              border: `1.5px solid ${isSel ? '#3498db' : isOrigin ? plant?.color + '90' : selected ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.12s', transform: isSel ? 'scale(1.1)' : 'scale(1)',
              position: 'relative', boxShadow: isOrigin ? `0 2px 8px ${plant?.color}40` : 'none',
            }}>
              {isOrigin && <span style={{ fontSize: Math.max(10, cellSize * 0.4) }}>{plant?.emoji}</span>}
              {!cell && selected && <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.1)' }}>·</span>}
            </div>
          );
        }))}
      </div>

      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 6, textAlign: 'center' }}>
        📐 {sizeM.toFixed(1)}m × {sizeM.toFixed(1)}m · Grille {cols}×{rows} · {gardenArea || 550}m² total · Cases {cellSize}cm
      </div>
    </div>
  );
}

// ─── GAME SCREEN ──────────────────────────────────────────────────────────────
function GameScreen({ score, level, streak, badges, totalPlants, totalYield, onClose }) {
  const plants = PLANTS_DB;
  const [gameTab, setGameTab] = useState('quest');
  const [quizPlant, setQuizPlant] = useState(null);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [xp, setXp] = useState(0);

  const startQuiz = () => {
    const p = plants[Math.floor(Math.random() * plants.length)];
    const companions = [...p.companions].sort(() => Math.random() - 0.5).slice(0, 3);
    const wrongs = plants.filter(pl => !p.companions.includes(pl.id) && pl.id !== p.id).sort(() => Math.random() - 0.5).slice(0, 2);
    const options = [...companions.map(c => ({ id: c, label: plants.find(pl => pl.id === c)?.name + ' ' + plants.find(pl => pl.id === c)?.icon, correct: true })), ...wrongs.map(w => ({ id: w.id, label: w.name + ' ' + w.icon, correct: false }))].sort(() => Math.random() - 0.5);
    setQuizPlant({ plant: p, options });
    setQuizAnswer(null);
    setQuizResult(null);
  };

  const handleQuiz = (opt) => {
    if (quizAnswer !== null) return;
    setQuizAnswer(opt);
    if (opt.correct) { setQuizResult('correct'); setXp(x => x + 15); }
    else { setQuizResult('wrong'); setXp(x => Math.max(0, x - 5)); }
  };

  const badgesList = [
    { id: 'first_plant', label: '🌱 Premier Plant', desc: 'Ajouter ton premier plant', earned: totalPlants >= 1 },
    { id: 'ten_plants', label: '🌿 Jardinier', desc: '10 plants au jardin', earned: totalPlants >= 10 },
    { id: 'harvest_1kg', label: '🧺 Récolteur', desc: 'Est. 1kg de récolte', earned: totalYield >= 1 },
    { id: 'harvest_10kg', label: '🏆 Maître Récolteur', desc: 'Est. 10kg de récolte', earned: totalYield >= 10 },
    { id: 'streak_3', label: '🔥 En forme !', desc: '3 jours de suite', earned: streak >= 3 },
    { id: 'streak_7', label: '💚 Dévoué', desc: '7 jours de suite', earned: streak >= 7 },
    { id: 'quiz_master', label: '🧠 Expert Quiz', desc: '5 quiz réussis', earned: badges >= 5 },
  ];

  const questRewards = [
    { label: 'Semer 3 tomates', check: totalPlants >= 3, xp: 20 },
    { label: 'Récolte estimée 5kg', check: totalYield >= 5, xp: 30 },
    { label: 'Répondre à 3 quiz', check: badges >= 3, xp: 25 },
    { label: '5 plants en serre', check: totalPlants >= 5, xp: 15 },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#f1c40f' }}>⭐ {xp} XP</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Niveau {level} · {streak} jours streak</div>
        </div>
        <div onClick={onClose} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer' }}>✕ Fermer</div>
      </div>

      {/* Level bar */}
      <div style={{ marginBottom: 16, padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
          <span>Niveau {level}</span><span>Niveau {level + 1}</span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
          <div style={{ height: '100%', width: `${(score % 100)}%`, background: 'linear-gradient(90deg, #f39c12, #e74c3c)', borderRadius: 4, transition: 'width 0.5s' }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
        {[['quest', '📋 Quêtes'], ['quiz', '🧠 Quiz'], ['badges', '🏅 Badges']].map(([id, label]) => (
          <div key={id} onClick={() => setGameTab(id)} style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 8, cursor: 'pointer', fontSize: 12, background: gameTab === id ? 'rgba(243,156,18,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${gameTab === id ? 'rgba(243,156,18,0.4)' : 'rgba(255,255,255,0.06)'}`, color: gameTab === id ? '#f1c40f' : 'rgba(255,255,255,0.4)', transition: 'all 0.2s' }}>{label}</div>
        ))}
      </div>

      {/* Quêtes */}
      {gameTab === 'quest' && (
        <div>
          {questRewards.map((q, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', marginBottom: 8, borderRadius: 10, background: q.check ? 'rgba(46,204,113,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${q.check ? 'rgba(46,204,113,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
              <span style={{ fontSize: 20 }}>{q.check ? '✅' : '⬜'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: q.check ? '#2ecc71' : '#fff' }}>{q.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>+{q.xp} XP</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quiz */}
      {gameTab === 'quiz' && (
        <div>
          {!quizPlant ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🧠</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Quiz Compagnonnage</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>Quelle plante accompagne {quizPlant?.plant?.name || 'cette tomate'} ?</div>
              <div onClick={startQuiz} style={{ ...S.primaryBtn, background: '#f39c12', cursor: 'pointer' }}>🎯 Lancer le quiz</div>
            </div>
          ) : (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>{quizPlant.plant.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{quizPlant.plant.name} {quizPlant.plant.variety}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Quelle plante est son COMPAGNON ?</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {quizPlant.options.map(opt => {
                  let bg = 'rgba(255,255,255,0.04)';
                  if (quizAnswer) {
                    if (opt.correct) bg = 'rgba(46,204,113,0.2)';
                    else if (opt.id === quizAnswer.id) bg = 'rgba(231,76,60,0.2)';
                  }
                  return (
                    <div key={opt.id} onClick={() => handleQuiz(opt)} style={{ padding: '10px 14px', borderRadius: 10, cursor: quizAnswer ? 'default' : 'pointer', background: bg, border: `1px solid ${quizAnswer && opt.correct ? '#2ecc71' : quizAnswer && opt.id === quizAnswer.id ? '#e74c3c' : 'rgba(255,255,255,0.08)'}`, transition: 'all 0.2s' }}>
                      <span style={{ fontSize: 18, marginRight: 8 }}>{opt.label.split(' ')[1]}</span>
                      <span style={{ fontSize: 13 }}>{opt.label.split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>
              {quizResult && (
                <div style={{ marginTop: 12, padding: 10, borderRadius: 8, textAlign: 'center', background: quizResult === 'correct' ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)', border: `1px solid ${quizResult === 'correct' ? '#2ecc71' : '#e74c3c'}` }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: quizResult === 'correct' ? '#2ecc71' : '#e74c3c' }}>{quizResult === 'correct' ? '✅ Bravo ! +15 XP' : '❌ Faux ! -5 XP'}</div>
                </div>
              )}
              <div onClick={startQuiz} style={{ ...S.primaryBtn, marginTop: 12, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 12 }}>🔄 Nouvelle question</div>
            </div>
          )}
        </div>
      )}

      {/* Badges */}
      {gameTab === 'badges' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {badgesList.map(b => (
            <div key={b.id} style={{ padding: 12, borderRadius: 10, background: b.earned ? 'rgba(243,156,18,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${b.earned ? 'rgba(243,156,18,0.3)' : 'rgba(255,255,255,0.06)'}`, opacity: b.earned ? 1 : 0.5 }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{b.earned ? b.label.split(' ')[0] : '🔒'}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: b.earned ? '#f1c40f' : '#fff' }}>{b.earned ? b.label : '???'}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{b.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PLANTS ENCYCLOPEDIA ─────────────────────────────────────────────────────
function EncyclopediaScreen({ onClose }) {
  const [family, setFamily] = useState('all');
  const families = ['all', ...new Set(PLANTS_DB.map(p => p.family))];
  const filtered = family === 'all' ? PLANTS_DB : PLANTS_DB.filter(p => p.family === family);
  const [selected, setSelected] = useState(null);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>📚 Encyclopédie ({PLANTS_DB.length} plantes)</div>
        <div onClick={onClose} style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>✕ Fermer</div>
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
        {families.map(f => (
          <div key={f} onClick={() => setFamily(f)} style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap', background: family === f ? 'rgba(46,204,113,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${family === f ? '#2ecc71' : 'rgba(255,255,255,0.1)'}`, color: family === f ? '#2ecc71' : 'rgba(255,255,255,0.5)' }}>
            {f === 'all' ? 'Toutes' : f}
          </div>
        ))}
      </div>
      {selected ? (
        <div style={{ padding: 14, background: selected.color + '12', border: `1px solid ${selected.color}40`, borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 32 }}>{selected.icon}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{selected.name} {selected.variety}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{selected.family} · {selected.cycle} · {selected.daysToMaturity}j</div>
            </div>
            <div onClick={() => setSelected(null)} style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>← Retour</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
            <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>☀️ Soleil: </span><span>{selected.needs.sun}</span></div>
            <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>💧 Eau: </span><span>{selected.needs.water}</span></div>
            <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>🌡️ Temp: </span><span>{selected.needs.temp.min}–{selected.needs.temp.max}°C</span></div>
            <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>📏 Espace: </span><span>{selected.spacing.between}cm</span></div>
            <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>🧺 Rendement: </span><span>{selected.yield.min}–{selected.yield.max} {selected.yield.unit}</span></div>
            <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>🌙 Lune: </span><span>{selected.planting.moonPhase}</span></div>
          </div>
          {selected.companions.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 11 }}>
              <span style={{ color: '#2ecc71' }}>✅ Compagnons: </span>
              {selected.companions.map(c => { const cp = PLANTS_DB.find(p => p.id === c); return cp ? `${cp.icon} ${cp.name}` : c; }).join(', ')}
            </div>
          )}
          {selected.incompatible.length > 0 && (
            <div style={{ marginTop: 4, fontSize: 11 }}>
              <span style={{ color: '#e74c3c' }}>❌ Incompatibles: </span>
              {selected.incompatible.map(c => { const cp = PLANTS_DB.find(p => p.id === c); return cp ? `${cp.icon} ${cp.name}` : c; }).join(', ')}
            </div>
          )}
          <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
            <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 3 }}>💡 Conseils</div>
            {selected.tips.map((t, i) => <div key={i}>• {t}</div>)}
          </div>
          {selected.diseases.length > 0 && (
            <div style={{ marginTop: 6, fontSize: 11 }}>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>🦠 Maladies: </span><span>{selected.diseases.join(', ')}</span>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {filtered.map(p => (
            <div key={p.id} onClick={() => setSelected(p)} style={{ padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.08)`, cursor: 'pointer', transition: 'all 0.15s' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{p.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{p.variety}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [serres, setSerres] = useState([
    { id: uid(), name: 'Serre principale', alveoles: Array(SERRE_COLS * SERRE_ROWS).fill(null), alveoleData: {} }
  ]);
  const [gardenArea, setGardenArea] = useState(550);
  const gardenMetrics = getGardenMetrics(gardenArea);
  const [gardenGrid, setGardenGrid] = useState(() =>
    Array(gardenMetrics.rows).fill(null).map(() => Array(gardenMetrics.cols).fill(null))
  );
  const [permanentPlants, setPermanentPlants] = useState([]);
  const [tab, setTab] = useState('serres');
  const [toast, setToast] = useState(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState(0);
  const [showGame, setShowGame] = useState(false);
  const [showEncyclopedia, setShowEncyclopedia] = useState(false);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('greenhub-state');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.serres) setSerres(data.serres);
        if (data.gardenGrid) setGardenGrid(data.gardenGrid);
        if (data.permanentPlants) setPermanentPlants(data.permanentPlants);
        if (data.score) setScore(data.score);
        if (data.level) setLevel(data.level);
        if (data.streak !== undefined) setStreak(data.streak);
        if (data.badges !== undefined) setBadges(data.badges);
      }
    } catch (e) { /* ignore */ }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('greenhub-state', JSON.stringify({ serres, gardenGrid, permanentPlants, score, level, streak, badges }));
  }, [serres, gardenGrid, permanentPlants, score, level, streak, badges]);

  const addSerre = (name) => {
    setSerres(s => [...s, { id: uid(), name, alveoles: Array(SERRE_COLS * SERRE_ROWS).fill(null), alveoleData: {} }]);
    showToast(`🏠 "${name}" ajoutée !`);
  };

  const handleSow = useCallback((plant, qty, serreId, customPlantedDate = null) => {
    const plantedDate = customPlantedDate || new Date().toISOString();
    setSerres(prev => prev.map(s => {
      if (s.id !== serreId) return s;
      const alveoles = [...s.alveoles];
      const alveoleData = { ...(s.alveoleData || {}) };
      let placed = 0;
      for (let i = 0; i < alveoles.length && placed < qty; i++) {
        if (!alveoles[i]) {
          alveoles[i] = { plantId: plant.id, status: 0, plantedDate };
          alveoleData[i] = { plantId: plant.id, plantedDate, daysToMaturity: plant.workflow_days?.[plant.workflow_days.length - 1] || 60 };
          placed++;
        }
      }
      return { ...s, alveoles, alveoleData };
    }));
    setScore(s => { const n = s + qty * 10; setLevel(Math.floor(n / 100) + 1); return n; });
    showToast(`🌱 ${qty} × ${plant.name} semés !`);
    setTab('serres');
  }, []);

  const handleTransplant = useCallback((serreId, alvIdx) => {
    const metrics = getGardenMetrics(gardenArea);
    let plant = null;
    setSerres(prev => prev.map(s => {
      if (s.id !== serreId) return s;
      const alveoles = [...s.alveoles];
      const alveoleData = { ...(s.alveoleData || {}) };
      plant = PLANTS_SIMPLE.find(p => p.id === alveoles[alvIdx]?.plantId);
      alveoles[alvIdx] = null;
      delete alveoleData[alvIdx];
      return { ...s, alveoles, alveoleData };
    }));
    if (!plant) return;
    const size = plant.grid_size || 1;
    setGardenGrid(prev => {
      const ng = prev.map(r => [...r]);
      const rows = ng.length, cols = ng[0]?.length || 0;
      for (let row = 0; row < rows - size; row++) {
        for (let col = 0; col < cols - size; col++) {
          let free = true;
          for (let r = row; r < row + size && free; r++)
            for (let c = col; c < col + size && free; c++)
              if (ng[r]?.[c]) free = false;
          if (free) {
            for (let r = row; r < row + size; r++)
              for (let c = col; c < col + size; c++)
                ng[r][c] = { plantId: plant.id, origin: r === row && c === col };
            showToast(`🌍 ${plant.emoji} ${plant.name} repiqué !`);
            setScore(s => { const n = s + 20; setLevel(Math.floor(n / 100) + 1); return n; });
            return ng;
          }
        }
      }
      showToast('❌ Plus de place dans le jardin !');
      return ng;
    });
    setTab('jardin');
  }, [gardenArea]);

  const handleRemoveSerreSeed = useCallback((serreId, alvIdx) => {
    setSerres(prev => prev.map(s => {
      if (s.id !== serreId) return s;
      const alveoles = [...s.alveoles];
      const alveoleData = { ...(s.alveoleData || {}) };
      alveoles[alvIdx] = null;
      delete alveoleData[alvIdx];
      return { ...s, alveoles, alveoleData };
    }));
    showToast('🗑️ Graine supprimée');
  }, []);

  const handleMoveSerreSeed = useCallback((serreId, fromIdx, toIdx) => {
    if (fromIdx === toIdx) return;
    setSerres(prev => prev.map(s => {
      if (s.id !== serreId) return s;
      const alveoles = [...s.alveoles];
      const alveoleData = { ...(s.alveoleData || {}) };
      if (alveoles[toIdx] !== null) return prev; // destination must be empty
      const temp = alveoles[fromIdx];
      alveoles[fromIdx] = null;
      alveoles[toIdx] = temp;
      // Move alveoleData
      if (alveoleData[fromIdx]) {
        alveoleData[toIdx] = alveoleData[fromIdx];
        delete alveoleData[fromIdx];
      }
      return { ...s, alveoles, alveoleData };
    }));
    showToast('✓ Graine déplacée');
  }, []);

  const handleMove = useCallback((fromRow, fromCol, toRow, toCol) => {
    setGardenGrid(prev => {
      const ng = prev.map(r => [...r]);
      const rows = ng.length, cols = ng[0]?.length || 0;
      const cell = ng[fromRow]?.[fromCol];
      if (!cell?.origin) return prev;
      const plant = PLANTS_SIMPLE.find(p => p.id === cell.plantId);
      if (!plant) return prev;
      const size = plant.grid_size || 1;
      for (let r = toRow; r < toRow + size; r++)
        for (let c = toCol; c < toCol + size; c++)
          if (ng[r]?.[c]) return prev;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          if (ng[r]?.[c]?.plantId === cell.plantId && Math.abs(r - fromRow) < size && Math.abs(c - fromCol) < size)
            ng[r][c] = null;
      for (let r = toRow; r < toRow + size; r++)
        for (let c = toCol; c < toCol + size; c++)
          ng[r][c] = { ...cell, origin: r === toRow && c === toCol };
      showToast('✓ Déplacé !');
      return ng;
    });
  }, []);

  const totalAlv = serres.reduce((a, s) => a + s.alveoles.filter(Boolean).length, 0);
  const totalGarden = gardenGrid.flat().filter(c => c?.origin).length;
  const totalYield = gardenGrid.flat().filter(c => c?.origin).reduce((sum, cell) => {
    const plant = PLANTS_DB.find(p => p.id === cell.plantId);
    if (!plant) return sum;
    return sum + (plant.yield.min + plant.yield.max) / 2;
  }, 0);

  return (
    <div style={S.root}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 22, fontFamily: "'Fraunces',serif", fontWeight: 300, color: '#e8f5e9' }}>🌱 GreenHub</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>Mon Jardin Intelligent · {PLANTS_DB.length}+ plantes</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#2ecc71' }}>{score} pts</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>🏠 {totalAlv} alvéoles · 🌍 {totalGarden} au jardin · {totalYield.toFixed(1)}kg est.</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 3, margin: '14px 20px 0' }}>
        {[['serres', '🏠 Mini Serres'], ['jardin', '🌍 Jardin'], ['real_garden', '🏡 Jardin Réel'], ['semer', '🌱 Semer'], ['game', '⭐ Jeu']].map(([id, label]) => (
          <div key={id} onClick={() => { setTab(id); if (id === 'game') setShowGame(true); if (id === 'encyclopedia') setShowEncyclopedia(true); }} style={{ flex: 1, textAlign: 'center', padding: '9px 0', borderRadius: 10, cursor: 'pointer', fontSize: 11, background: tab === id ? 'rgba(46,204,113,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${tab === id ? '#2ecc7160' : 'rgba(255,255,255,0.06)'}`, color: tab === id ? '#2ecc71' : 'rgba(255,255,255,0.4)', fontWeight: tab === id ? 600 : 400, transition: 'all 0.2s' }}>{label}</div>
        ))}
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        {tab === 'serres' && <SerreScreen serres={serres} onAddSerre={addSerre} onTransplant={handleTransplant} onRemoveSerreSeed={handleRemoveSerreSeed} onMoveSerreSeed={handleMoveSerreSeed} />}
        {tab === 'jardin' && <GardenScreen grid={gardenGrid} onMove={handleMove} gardenArea={gardenArea} />}
        {tab === 'real_garden' && <GardenRealScreen permanentPlants={permanentPlants} onAddPermanent={(obj) => { setPermanentPlants(p => [...p, obj]); showToast(`🌳 ${obj.name} ajouté au jardin !`); }} onRemovePermanent={(uid) => { setPermanentPlants(p => p.filter(x => x.uid !== uid)); showToast('🗑️ Élément retiré'); }} />}
        {tab === 'semer' && <SowingScreen serres={serres} onAddSerre={addSerre} onSow={handleSow} />}
        {tab === 'game' && <GameScreen score={score} level={level} streak={streak} badges={badges} totalPlants={totalGarden} totalYield={totalYield} onClose={() => setTab('serres')} />}
      </div>

      {/* Bottom bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '10px 20px', background: 'rgba(13,17,23,0.95)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-around', backdropFilter: 'blur(10px)' }}>
        <div onClick={() => setTab('serres')} style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: 20 }}>🏠</div>
          <div style={{ fontSize: 10, color: tab === 'serres' ? '#2ecc71' : 'rgba(255,255,255,0.3)' }}>Mini Serres</div>
        </div>
        <div onClick={() => setTab('jardin')} style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: 20 }}>🌍</div>
          <div style={{ fontSize: 10, color: tab === 'jardin' ? '#2ecc71' : 'rgba(255,255,255,0.3)' }}>Jardin</div>
        </div>
        <div onClick={() => setTab('real_garden')} style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: 20 }}>🏡</div>
          <div style={{ fontSize: 10, color: tab === 'real_garden' ? '#2ecc71' : 'rgba(255,255,255,0.3)' }}>Jardin Réel</div>
        </div>
        <div onClick={() => setTab('semer')} style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: 20 }}>🌱</div>
          <div style={{ fontSize: 10, color: tab === 'semer' ? '#2ecc71' : 'rgba(255,255,255,0.3)' }}>Semer</div>
        </div>
        <div onClick={() => { setShowEncyclopedia(true); }} style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: 20 }}>📚</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Encyclopédie</div>
        </div>
        <div onClick={() => { setScore(s => { const n = s + 5; setLevel(Math.floor(n / 100) + 1); return n; }); setTab('game'); }} style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: 20 }}>⭐</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Jeu</div>
        </div>
      </div>

      {/* Encyclopedia Modal */}
      {showEncyclopedia && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 100, padding: 20, overflowY: 'auto' }}>
          <EncyclopediaScreen onClose={() => setShowEncyclopedia(false)} />
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', padding: '10px 18px', borderRadius: 12, fontSize: 13, fontWeight: 600, background: toast.type === 'error' ? '#e74c3c' : '#2ecc71', color: '#0d1117', boxShadow: '0 4px 24px rgba(0,0,0,0.5)', zIndex: 200, whiteSpace: 'nowrap', animation: 'fu 0.2s ease' }}>
          {toast.msg}
        </div>
      )}
      <style>{`@keyframes fu{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}} input::placeholder{color:rgba(255,255,255,0.25)}`}</style>
    </div>
  );
}

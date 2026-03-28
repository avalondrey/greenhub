import { useState, useCallback, useEffect, useRef } from 'react';
import { PLANTS_DB, PLANTS_SIMPLE, generateTasks, estimateYield } from './db/plants.js';

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

const GROWTH_STAGES = [
  { name: 'graine', emoji: '🟤', scale: 0.4, opacity: 0.6 },
  { name: 'germination', emoji: '🌱', scale: 0.6, opacity: 0.8 },
  { name: 'levée', emoji: '🌿', scale: 0.8, opacity: 0.9 },
  { name: 'petite', emoji: '🌿', scale: 1.0, opacity: 1.0 },
  { name: 'moyenne', emoji: '🪴', scale: 1.2, opacity: 1.0 },
  { name: 'prête', emoji: '🪴', scale: 1.4, opacity: 1.0 },
];

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

// ─── SOWING SCREEN ─────────────────────────────────────────────────────────────
function SowingScreen({ serres, onAddSerre, onSow }) {
  const [step, setStep] = useState(0);
  const [plant, setPlant] = useState(null);
  const [qty, setQty] = useState(6);
  const [targetSerre, setTargetSerre] = useState(null);
  const [showAddSerre, setShowAddSerre] = useState(false);
  const [newSerreName, setNewSerreName] = useState('');

  const handleConfirm = () => {
    if (!plant || !targetSerre) return;
    onSow(plant, qty, targetSerre);
    setStep(0); setPlant(null); setQty(6); setTargetSerre(null);
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
      <div onClick={handleConfirm} style={{ ...S.primaryBtn, background: targetSerre ? plant.color : 'rgba(255,255,255,0.1)', color: targetSerre ? '#fff' : 'rgba(255,255,255,0.3)', cursor: targetSerre ? 'pointer' : 'default' }}>
        🌱 Semer {qty} × {plant.name} →
      </div>
    </div>
  );
  return null;
}

// ─── SERRE SCREEN ──────────────────────────────────────────────────────────────
function SerreScreen({ serres, onAddSerre, onTransplant }) {
  const [newName, setNewName] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedAlv, setSelectedAlv] = useState(null);
  const [showTransplant, setShowTransplant] = useState(false);
  const tick = useRealtimeGrowth();

  return (
    <div>
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
          <LidlGreenhouse3D key={tick} serre={serre} alveoleData={serre.alveoleData} selectedAlveole={selectedAlv?.serreId === serre.id ? selectedAlv.idx : null} onCellClick={(idx) => {
            const alv = serre.alveoles[idx];
            if (alv) { setSelectedAlv({ serreId: serre.id, idx }); setShowTransplant(true); }
            else { setSelectedAlv(null); setShowTransplant(false); }
          }} />
          {showTransplant && selectedAlv?.serreId === serre.id && (() => {
            const alv = serre.alveoles[selectedAlv.idx];
            const ad = serre.alveoleData?.[selectedAlv.idx];
            const plant = alv ? PLANTS_SIMPLE.find(p => p.id === alv.plantId) : null;
            const dbPlant = alv ? PLANTS_DB.find(p => p.id === alv.plantId) : null;
            if (!plant || !dbPlant) return null;
            const daysSinceSow = ad?.plantedDate ? Math.floor((Date.now() - new Date(ad.plantedDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
            const progress = Math.min(daysSinceSow / (dbPlant.daysToMaturity || 60), 1);
            const stage = getGrowthStage(ad?.plantedDate, dbPlant.daysToMaturity || 60);
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
                <div onClick={() => { onTransplant(serre.id, selectedAlv.idx); setShowTransplant(false); setSelectedAlv(null); }} style={{ ...S.primaryBtn, background: plant.color, padding: '8px 0', fontSize: 12 }}>🌍 Repiquer au jardin</div>
              </div>
            );
          })()}
        </div>
      ))}
    </div>
  );
}

// ─── JARDIN RÉEL 3D ISOMÉTRIQUE ─────────────────────────────────────────────
// Jardin réel avec plantes permanentes, arbres, haies, arbustes, cabanons

function GardenReal3D({ objects, gridSize, onRemoveObject, onSelectObject, selectedId }) {
  const TILE = 40;
  const ISO_ANGLE = 0.5;

  // Couleurs réalistes
  const SOIL_COLOR = '#5D4E37';
  const GRASS_COLOR = '#4A7023';
  const SHADOW_COLOR = 'rgba(0,0,0,0.2)';

  const renderObject3D = (obj, x, y) => {
    const size = obj.spanCells || 1;
    const w = size * TILE;
    const h = size * TILE * 0.6;

    if (obj.type === 'structure') {
      if (obj.structureType === 'shed') {
        // Cabanon 3D réaliste
        return (
          <div key={obj.id} style={{
            position: 'absolute',
            left: x, top: y,
            width: w, height: h * 1.2,
            cursor: 'pointer',
            transform: 'translateZ(0)',
          }}>
            {/* Ombre */}
            <div style={{
              position: 'absolute', bottom: -4, left: 4,
              width: w, height: 10,
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%)',
              filter: 'blur(3px)',
            }} />
            {/* Base / murs */}
            <div style={{
              position: 'absolute', bottom: 8, left: 0,
              width: w, height: h * 0.7,
              background: `linear-gradient(135deg, ${obj.color} 0%, ${obj.color}cc 50%, ${obj.color}99 100%)`,
              border: '2px solid rgba(0,0,0,0.3)',
              borderRadius: '3px 3px 0 0',
              boxShadow: `inset 0 2px 0 rgba(255,255,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.3)`,
            }}>
              {/* Porte */}
              <div style={{
                position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: w * 0.25, height: h * 0.35,
                background: 'linear-gradient(180deg, #4a3728 0%, #3a2a1a 100%)',
                border: '1px solid rgba(0,0,0,0.4)',
                borderBottom: 'none',
                borderRadius: '2px 2px 0 0',
              }}>
                <div style={{ position: 'absolute', top: '40%', right: 4, width: 3, height: 3, background: '#c9a227', borderRadius: '50%' }} />
              </div>
              {/* Fenêtre */}
              <div style={{
                position: 'absolute', top: h * 0.15, right: w * 0.12,
                width: w * 0.2, height: h * 0.2,
                background: 'linear-gradient(135deg, rgba(135,206,235,0.6) 0%, rgba(135,206,235,0.3) 100%)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: 2,
              }} />
            </div>
            {/* Toit */}
            <div style={{
              position: 'absolute', top: 0, left: -4,
              width: w + 8, height: h * 0.4,
              background: `linear-gradient(180deg, #6B4423 0%, ${obj.color}88 100%)`,
              border: '2px solid rgba(0,0,0,0.3)',
              borderRadius: '6px 6px 0 0',
              boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.1), 0 -2px 8px rgba(0,0,0,0.2)',
              transform: 'perspective(100) rotateX(-5deg)',
            }}>
              {/* Planches de toit */}
              {[0, 0.25, 0.5, 0.75].map((offset, i) => (
                <div key={i} style={{
                  position: 'absolute', top: 2, left: `${offset * 100}%`,
                  width: '2px', height: '80%',
                  background: 'rgba(0,0,0,0.15)',
                }} />
              ))}
            </div>
            {/* Sélection */}
            {selectedId === obj.id && (
              <div style={{
                position: 'absolute', inset: -6,
                border: '3px solid #2ecc71',
                borderRadius: 8,
                boxShadow: '0 0 20px rgba(46,204,113,0.5)',
                pointerEvents: 'none',
              }} />
            )}
          </div>
        );
      }
      if (obj.structureType === 'greenhouse') {
        // Serre 3D réaliste
        return (
          <div key={obj.id} style={{
            position: 'absolute',
            left: x, top: y,
            width: w, height: h * 1.3,
            cursor: 'pointer',
          }}>
            {/* Ombre */}
            <div style={{
              position: 'absolute', bottom: -4, left: 4,
              width: w, height: 10,
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.25) 0%, transparent 70%)',
              filter: 'blur(3px)',
            }} />
            {/* Structure */}
            <div style={{
              position: 'absolute', bottom: 6, left: 0,
              width: w, height: h * 0.65,
              background: 'linear-gradient(135deg, rgba(200,230,200,0.6) 0%, rgba(150,210,150,0.4) 50%, rgba(120,200,120,0.5) 100%)',
              border: `3px solid rgba(80,160,80,0.7)`,
              borderRadius: '4px 4px 0 0',
              backdropFilter: 'blur(4px)',
              boxShadow: `
                inset 0 0 20px rgba(255,255,255,0.2),
                inset 0 2px 0 rgba(255,255,255,0.4),
                0 6px 20px rgba(0,0,0,0.2)
              `,
            }}>
              {/* Reflets vitrage */}
              <div style={{
                position: 'absolute', top: 4, left: 4,
                width: w * 0.3, height: h * 0.25,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
                borderRadius: 2,
                filter: 'blur(2px)',
              }} />
              {/* Cadre estructura */}
              <div style={{ position: 'absolute', inset: 4, border: '1px solid rgba(80,140,80,0.4)', borderRadius: 2 }}>
                {/* Croix centrale */}
                <div style={{ position: 'absolute', top: '30%', left: '50%', width: '60%', height: 1, background: 'rgba(80,140,80,0.3)', transform: 'translateX(-50%)' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', width: 1, height: '60%', background: 'rgba(80,140,80,0.3)', transform: 'translateX(-50%)' }} />
              </div>
            </div>
            {/* Toit pignon */}
            <div style={{
              position: 'absolute', top: 0, left: -2,
              width: w + 4, height: h * 0.35,
              background: `linear-gradient(180deg, rgba(180,225,180,0.7) 0%, rgba(140,200,140,0.6) 100%)`,
              border: '2px solid rgba(80,160,80,0.6)',
              borderBottom: 'none',
              borderRadius: '8px 8px 0 0',
              backdropFilter: 'blur(2px)',
            }}>
              <div style={{
                position: 'absolute', top: 5, left: '50%', transform: 'translateX(-50%)',
                background: 'linear-gradient(180deg, #e63946 0%, #c1121f 100%)',
                color: '#fff', fontSize: 7, fontWeight: 800, letterSpacing: 1.5,
                padding: '2px 8px 1px', borderRadius: 2,
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}>GREENHOUSE</div>
            </div>
            {selectedId === obj.id && (
              <div style={{
                position: 'absolute', inset: -6,
                border: '3px solid #2ecc71',
                borderRadius: 8,
                boxShadow: '0 0 20px rgba(46,204,113,0.5)',
                pointerEvents: 'none',
              }} />
            )}
          </div>
        );
      }
      if (obj.structureType === 'pond') {
        // Mare/Bassin 3D
        return (
          <div key={obj.id} style={{
            position: 'absolute',
            left: x, top: y,
            width: w, height: h,
            cursor: 'pointer',
          }}>
            <div style={{
              width: w, height: h,
              background: 'radial-gradient(ellipse at 40% 40%, rgba(100,180,220,0.8) 0%, rgba(30,100,180,0.6) 50%, rgba(20,70,140,0.8) 100%)',
              border: '3px solid rgba(40,100,160,0.6)',
              borderRadius: '50% 45% 50% 48%',
              boxShadow: 'inset 0 0 20px rgba(255,255,255,0.15), inset 0 -4px 8px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.25)',
            }}>
              {/* Reflets eau */}
              <div style={{
                position: 'absolute', top: '20%', left: '25%',
                width: '30%', height: '20%',
                background: 'radial-gradient(ellipse, rgba(255,255,255,0.4) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(2px)',
              }} />
              {/* Nénuphar */}
              <div style={{ position: 'absolute', bottom: '20%', right: '25%', fontSize: 14 }}>🪷</div>
            </div>
            {selectedId === obj.id && (
              <div style={{
                position: 'absolute', inset: -4,
                border: '3px solid #2ecc71',
                borderRadius: '50% 45% 50% 48%',
                boxShadow: '0 0 20px rgba(46,204,113,0.5)',
                pointerEvents: 'none',
              }} />
            )}
          </div>
        );
      }
    }

    if (obj.type === 'tree' || obj.type === 'fruit_tree') {
      // Arbre 3D réaliste
      const trunkH = h * 0.35;
      const crownH = h * 0.75;
      const crownW = w * 0.85;
      const isFruit = obj.type === 'fruit_tree';
      return (
        <div key={obj.id} style={{
          position: 'absolute',
          left: x, top: y,
          width: w, height: h + trunkH,
          cursor: 'pointer',
        }}>
          {/* Ombre */}
          <div style={{
            position: 'absolute', bottom: 0, left: '30%',
            width: w * 0.7, height: 8,
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.25) 0%, transparent 70%)',
            filter: 'blur(2px)',
          }} />
          {/* Tronc */}
          <div style={{
            position: 'absolute', bottom: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: w * 0.12, height: trunkH,
            background: `linear-gradient(90deg, #4a3728 0%, #6B4423 40%, #5a3d28 70%, #3a2718 100%)`,
            borderRadius: '2px 2px 0 0',
            boxShadow: '2px 0 4px rgba(0,0,0,0.2)',
          }} />
          {/* Cime */}
          <div style={{
            position: 'absolute', top: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: crownW, height: crownH,
            background: `radial-gradient(ellipse at 50% 60%, ${obj.color}ee 0%, ${obj.color}aa 40%, ${obj.color}77 70%, ${obj.color}55 100%)`,
            borderRadius: '50% 50% 45% 45%',
            boxShadow: `
              inset 2px -3px 8px rgba(255,255,255,0.15),
              inset -2px 3px 6px rgba(0,0,0,0.15),
              0 4px 12px rgba(0,0,0,0.2)
            `,
          }}>
            {/* Highlights */}
            <div style={{
              position: 'absolute', top: '15%', left: '25%',
              width: '30%', height: '25%',
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.2) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(3px)',
            }} />
            {/* Fruits si arbre fruitier */}
            {isFruit && (
              <div style={{ position: 'absolute', bottom: '20%', left: '50%', transform: 'translateX(-50%)', fontSize: Math.max(10, TILE * 0.3), filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}>
                {obj.fruit}
              </div>
            )}
          </div>
          {selectedId === obj.id && (
            <div style={{
              position: 'absolute', inset: -6,
              border: '3px solid #2ecc71',
              borderRadius: 8,
              boxShadow: '0 0 20px rgba(46,204,113,0.5)',
              pointerEvents: 'none',
            }} />
          )}
        </div>
      );
    }

    if (obj.type === 'hedge') {
      // Haie 3D
      const hedgeH = h * 0.8;
      return (
        <div key={obj.id} style={{
          position: 'absolute',
          left: x, top: y + h * 0.2,
          width: w, height: hedgeH,
          cursor: 'pointer',
        }}>
          <div style={{
            width: w, height: hedgeH,
            background: `linear-gradient(180deg, ${obj.color}ee 0%, ${obj.color}cc 50%, ${obj.color}aa 100%)`,
            borderRadius: obj.height === 'low' ? '4px' : obj.height === 'high' ? '8px 8px 4px 4px' : '6px',
            border: '2px solid rgba(0,0,0,0.2)',
            boxShadow: `
              inset 0 2px 0 rgba(255,255,255,0.15),
              inset 0 -2px 0 rgba(0,0,0,0.1),
              0 3px 8px rgba(0,0,0,0.15)
            `,
          }}>
            {/* Texture feuilles */}
            {[0.2, 0.5, 0.8].map((pos, i) => (
              <div key={i} style={{
                position: 'absolute', top: '30%', left: `${pos * 100}%`,
                width: 3, height: 3,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
              }} />
            ))}
          </div>
          {selectedId === obj.id && (
            <div style={{
              position: 'absolute', inset: -4,
              border: '3px solid #2ecc71',
              borderRadius: 6,
              boxShadow: '0 0 20px rgba(46,204,113,0.5)',
              pointerEvents: 'none',
            }} />
          )}
        </div>
      );
    }

    if (obj.type === 'shrub' || obj.type === 'small_fruit') {
      // Arbuste 3D
      const shrubH = h * 0.6;
      return (
        <div key={obj.id} style={{
          position: 'absolute',
          left: x, top: y + h * 0.4,
          width: w, height: shrubH,
          cursor: 'pointer',
        }}>
          {/* Ombre */}
          <div style={{
            position: 'absolute', bottom: -2, left: '20%',
            width: w * 0.7, height: 6,
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.2) 0%, transparent 70%)',
            filter: 'blur(2px)',
          }} />
          <div style={{
            width: w, height: shrubH,
            background: `radial-gradient(ellipse at 50% 70%, ${obj.color}ee 0%, ${obj.color}aa 60%, ${obj.color}77 100%)`,
            borderRadius: '50% 50% 45% 45%',
            border: '2px solid rgba(0,0,0,0.15)',
            boxShadow: `
              inset 1px -2px 4px rgba(255,255,255,0.1),
              inset -1px 2px 4px rgba(0,0,0,0.1),
              0 3px 8px rgba(0,0,0,0.15)
            `,
          }}>
            {/* Fleurs/fruits */}
            {obj.type === 'small_fruit' && (
              <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', fontSize: Math.max(8, TILE * 0.25) }}>
                {obj.fruit || obj.emoji}
              </div>
            )}
          </div>
          {selectedId === obj.id && (
            <div style={{
              position: 'absolute', inset: -4,
              border: '3px solid #2ecc71',
              borderRadius: 8,
              boxShadow: '0 0 20px rgba(46,204,113,0.5)',
              pointerEvents: 'none',
            }} />
          )}
        </div>
      );
    }

    // Default
    return (
      <div key={obj.id} style={{ position: 'absolute', left: x, top: y, width: TILE, height: TILE }}>
        <span style={{ fontSize: 24 }}>{obj.emoji}</span>
      </div>
    );
  };

  const gridCells = gridSize || 16;
  const viewW = gridCells * TILE;
  const viewH = gridCells * TILE * 0.7;

  return (
    <div style={{
      perspective: 800,
      perspectiveOrigin: '50% 40%',
      overflow: 'hidden',
    }}>
      <div style={{
        transform: 'rotateX(-25deg) rotateZ(-2deg)',
        transformStyle: 'preserve-3d',
        position: 'relative',
        width: viewW + 100,
        height: viewH + 100,
        margin: '0 auto',
      }}>
        {/* Sol / pelouse */}
        <div style={{
          position: 'absolute',
          top: 40, left: 30,
          width: viewW, height: viewH,
          background: `repeating-linear-gradient(
            0deg,
            ${GRASS_COLOR} 0px,
            ${GRASS_COLOR} 2px,
            #3d5c1e 2px,
            #3d5c1e 4px
          )`,
          border: '3px solid rgba(60,90,30,0.6)',
          borderRadius: 8,
          boxShadow: `
            inset 0 0 40px rgba(0,0,0,0.15),
            0 8px 32px rgba(0,0,0,0.3)
          `,
          transform: 'translateZ(0)',
        }}>
          {/* Quadrillage subtil */}
          {Array(gridCells / 4).fill(null).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: 0, left: `${i * 25}%`,
              width: '1px', height: '100%',
              background: 'rgba(255,255,255,0.03)',
            }} />
          ))}
          {Array(gridCells / 4).fill(null).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: `${i * 25}%`, left: 0,
              width: '100%', height: '1px',
              background: 'rgba(255,255,255,0.03)',
            }} />
          ))}
        </div>

        {/* Objets */}
        {objects.map((obj, i) => {
          const col = obj.position?.col || (i % 8);
          const row = obj.position?.row || Math.floor(i / 8);
          const xPos = 32 + col * TILE + 10;
          const yPos = 42 + row * TILE * 0.6;
          return (
            <div key={obj.id + i} onClick={() => onSelectObject(obj.id)}>
              {renderObject3D(obj, xPos, yPos)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── JARDIN RÉEL SCREEN ──────────────────────────────────────────────────────
function GardenRealScreen({ permanentPlants, onAddPermanent, onRemovePermanent }) {
  const [activeCategory, setActiveCategory] = useState('fruit_trees');
  const [selectedObj, setSelectedObj] = useState(null);
  const [showAddPanel, setShowAddPanel] = useState(true);

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
        col: Math.floor(Math.random() * 8),
        row: Math.floor(Math.random() * 8),
      },
    };
    onAddPermanent(newObj);
    setSelectedObj(newObj.uid);
  };

  const handleSelectObject = (uid) => {
    setSelectedObj(selectedObj === uid ? null : uid);
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

      {/* Vue 3D du jardin */}
      <div style={{ marginBottom: 10 }}>
        <GardenReal3D
          objects={permanentPlants}
          gridSize={16}
          onSelectObject={handleSelectObject}
          onRemoveObject={(uid) => { onRemovePermanent(uid); setSelectedObj(null); }}
          selectedId={selectedObj}
        />
      </div>

      {/* Panneau objet sélectionné */}
      {selectedObject && (
        <div style={{ padding: 12, background: selectedObject.color + '15', border: `1px solid ${selectedObject.color}40`, borderRadius: 10, marginBottom: 8 }}>
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
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
        🌳 {permanentPlants.length} élément{permanentPlants.length > 1 ? 's' : ''} permanent{permanentPlants.length > 1 ? 's' : ''}
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

  const handleSow = useCallback((plant, qty, serreId) => {
    const plantedDate = new Date().toISOString();
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
        {tab === 'serres' && <SerreScreen serres={serres} onAddSerre={addSerre} onTransplant={handleTransplant} />}
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

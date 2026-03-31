import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { PLANTS_DB, PLANTS_SIMPLE, generateTasks, estimateYield } from './db/plants.js';
import useTileRenderer from './hooks/useTileRenderer.js';
import useRealGardenRenderer from './hooks/useRealGardenRenderer.js';

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

// ── GET GROWTH STAGE ─────────────────────────────────────────────────────────
function getGrowthStage(plantedDate, daysToMaturity) {
  if (!plantedDate) return GROWTH_STAGES[0];
  const days = (Date.now() - new Date(plantedDate).getTime()) / (1000 * 60 * 60 * 24);
  const progress = Math.min(days / daysToMaturity, 1);
  const idx = Math.min(Math.floor(progress * (GROWTH_STAGES.length - 1)), GROWTH_STAGES.length - 1);
  return GROWTH_STAGES[idx];
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
const TD = 14; // tile depth (réduit pour blocs plus fins)

function isoXY(c, r) {
  return {
    x: (c - r) * (TW / 2),
    y: (c + r) * (TH / 2),
  };
}

// ── DEFS SVG réutilisables ────────────────────────────────────────────────────
// ── MINI-SERRE ISOMÉTRIQUE COMPLÈTE — Canvas 2D Engine ──────────────────
// Moteur de rendu Canvas 2D pixel-perfect.
// Tous les sprites tileset sont dessinés via Canvas (pas de SVG).
// Cliques → détection par inversion coordonnées iso.
function IsometricMiniSerre({ serre, selectedIdx, movingIdx, onCellClick }) {
  const tick = useRealtimeGrowth();
  const { canvasRef, render, ready, getClickedCell } = useTileRenderer();

  // Re-rend le canvas quand l'état change
  useEffect(() => {
    if (ready && canvasRef.current) {
      render(canvasRef.current, serre, selectedIdx, movingIdx);
    }
  }, [ready, serre, selectedIdx, movingIdx, tick, render]);

  const handleClick = useCallback((e) => {
    const idx = getClickedCell(e.clientX, e.clientY);
    if (idx !== null) onCellClick(idx);
  }, [getClickedCell, onCellClick]);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{
        display: 'block',
        margin: '0 auto',
        maxWidth: '100%',
        imageRendering: 'pixelated',
        cursor: 'pointer',
      }}
    />
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
        <div style={{ fontSize: 10, color: plant.color, fontWeight: 700, marginBottom: 3 }}>💡 Conseil IA — {plant.name}</div>
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
            return (
              <div style={{ marginTop: 10, padding: 12, background: plant.color + '15', border: `1px solid ${plant.color}40`, borderRadius: 10 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 28, transform: `scale(${stage.scale})`, display: 'inline-block', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>{stage.emoji}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{plant.name}</div>
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

// ─── JARDIN RÉEL SCREEN — Canvas Isométrique ──────────────────────────────────
// Remplacement du système CSS 3D par un rendu Canvas cohérent avec les mini-serres

function GardenRealScreen({ permanentPlants, onAddPermanent, onUpdatePlants, onRemovePermanent }) {
  const [activeCategory, setActiveCategory] = useState('fruit_trees');
  const [selectedObj, setSelectedObj] = useState(null);
  const [showAddPanel, setShowAddPanel] = useState(true);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [photos, setPhotos] = useState(() => {
    // Charger photos depuis localStorage
    try {
      return JSON.parse(localStorage.getItem('greenhub_photos')) || {};
    } catch {
      return {};
    }
  });
  
  const { canvasRef, render, ready, layout, GARDEN_GRID_COLS, GARDEN_GRID_ROWS } = useRealGardenRenderer();

  const categories = [
    { id: 'fruit_trees', label: '🍎 Fruitiers', items: GARDEN_OBJECTS_DB.fruit_trees },
    { id: 'trees', label: '🌳 Arbres', items: GARDEN_OBJECTS_DB.trees },
    { id: 'hedges', label: '🌲 Haies', items: GARDEN_OBJECTS_DB.hedges },
    { id: 'shrubs', label: '🌿 Arbustes', items: GARDEN_OBJECTS_DB.shrubs },
    { id: 'small_fruits', label: '🫐 Petits Fruits', items: GARDEN_OBJECTS_DB.small_fruits },
    { id: 'structures', label: '🏠 Structures', items: GARDEN_OBJECTS_DB.structures },
  ];

  // Sauvegarder photos
  useEffect(() => {
    localStorage.setItem('greenhub_photos', JSON.stringify(photos));
  }, [photos]);

  // Render
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    if (canvas) {
      render(canvas, permanentPlants, selectedObj, hoveredCell);
    }
  }, [ready, render, permanentPlants, selectedObj, hoveredCell]);

  // Ajouter une photo
  const addPhoto = (plantUid, file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      const timestamp = Date.now();
      setPhotos(prev => ({
        ...prev,
        [plantUid]: [...(prev[plantUid] || []), { id: uid(), data: base64, date: timestamp }]
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddObject = (obj) => {
    // Trouver une cellule vide
    const usedCells = new Set(
      permanentPlants
        .filter(p => p?.position?.row != null && p?.position?.col != null)
        .map(p => `${p.position.row}-${p.position.col}`)
    );
    let placed = false;
    let col = 2, row = 2;
    for (let r = 2; r < GARDEN_GRID_ROWS - 2 && !placed; r++) {
      for (let c = 2; c < GARDEN_GRID_COLS - 2 && !placed; c++) {
        if (!usedCells.has(`${r}-${c}`)) {
          row = r; col = c; placed = true;
        }
      }
    }

    const newObj = {
      ...obj,
      uid: uid(),
      position: { col, row },
    };
    onAddPermanent(newObj);
    setSelectedObj(newObj.uid);
  };

  const handleCanvasClick = (e) => {
    console.log('Click canvas', e.clientX, e.clientY);

    // Calcul direct de la cellule
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('PAS DE CANVAS dans handleCanvasClick');
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const rx = (e.clientX - rect.left) / rect.width;
    const ry = (e.clientY - rect.top) / rect.height;

    // Layout values (from hook)
    const { W, H, ox, oy } = layout;
    const px = rx * W;
    const py = ry * H;

    // Iso inverse
    const rx2 = px - ox;
    const ry2 = py - oy;
    const col = (rx2 / 40 + ry2 / 20) / 2;  // TILE_W=80, TILE_H=40
    const row = (ry2 / 20 - rx2 / 40) / 2;
    // Correction du décalage
    const tc = Math.round(col - 0.5);
    const tr = Math.round(row - 0.5);

    console.log('px/py:', px.toFixed(0), py.toFixed(0), 'col/row:', col.toFixed(1), row.toFixed(1), 'tc/tr:', tc, tr);

    let cell = null;
    if (tr >= 0 && tr < GARDEN_GRID_ROWS && tc >= 0 && tc < GARDEN_GRID_COLS) {
      cell = { row: tr, col: tc };
    }
    console.log('Cell trouvée:', cell);
    if (!cell) return;

    // Log tous les objets et leurs positions
    console.log('Tous les objets:', permanentPlants.map(p => ({ uid: p.uid, name: p.name, pos: p.position })));

    // Chercher un objet à cette position
    const objAtCell = permanentPlants.find(p =>
      p?.position?.row === cell.row && p?.position?.col === cell.col
    );
    console.log('Objet à cette position:', objAtCell, 'Sélection actuelle:', selectedObj);

    if (objAtCell) {
      console.log('Sélection de:', objAtCell.uid, '(actuel:', selectedObj, ')');
      setSelectedObj(objAtCell.uid === selectedObj ? null : objAtCell.uid);
    } else {
      // Déplacer l'objet sélectionné ici
      if (selectedObj) {
        console.log('Déplacement de', selectedObj, 'vers', cell);
        onUpdatePlants(prev => {
          const updated = prev.map(p =>
            p.uid === selectedObj ? { ...p, position: { row: cell.row, col: cell.col } } : p
          );
          console.log('Nouvelle liste:', updated);
          return updated;
        });
        // Garder l'objet sélectionné mais montrer un feedback
        setTimeout(() => setSelectedObj(null), 300);
      } else {
        console.log('Pas d\'objet sélectionné');
      }
    }
  };

  const handleCanvasMove = (e) => {
    // Calcul direct de la cellule pour le hover
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const rx = (e.clientX - rect.left) / rect.width;
    const ry = (e.clientY - rect.top) / rect.height;
    const { W, H, ox, oy } = layout;
    const px = rx * W;
    const py = ry * H;
    const rx2 = px - ox;
    const ry2 = py - oy;
    const col = (rx2 / 40 + ry2 / 20) / 2;
    const row = (ry2 / 20 - rx2 / 40) / 2;
    // Correction du décalage
    const tc = Math.round(col - 0.5);
    const tr = Math.round(row - 0.5);
    if (tr >= 0 && tr < GARDEN_GRID_ROWS && tc >= 0 && tc < GARDEN_GRID_COLS) {
      setHoveredCell({ row: tr, col: tc });
    } else {
      setHoveredCell(null);
    }
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

      {/* Vue Canvas du jardin */}
      <div style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 400,
        borderRadius: 12,
        overflow: 'hidden',
        border: '3px solid rgba(60,90,30,0.5)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        userSelect: 'none',
        background: 'linear-gradient(180deg, #87CEEB 0%, #C8E6C9 100%)',
      }}>
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMove}
          style={{
            display: 'block',
            maxWidth: '100%',
            height: 'auto',
            maxHeight: 450,
            cursor: selectedObj ? 'crosshair' : 'pointer',
          }}
        />

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
            <div>Jardin Réel</div>
            <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>Ajoutez des arbres, arbustes et structures</div>
            <div style={{ fontSize: 11, opacity: 0.5 }}>Cliquez sur une case pour placer</div>
          </div>
        )}
      </div>

      {/* Message déplacement */}
      {selectedObject && (
        <div style={{ padding: '8px 12px', background: 'rgba(46,204,113,0.15)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: 8, marginTop: 10, fontSize: 12, color: '#2ecc71', textAlign: 'center' }}>
          ✓ {selectedObject.name} sélectionné — Cliquez sur une case vide pour déplacer
        </div>
      )}

      {/* Panneau objet sélectionné */}
      {selectedObject && (
        <div style={{ padding: 12, background: selectedObject.color + '15', border: `1px solid ${selectedObject.color}40`, borderRadius: 10, marginTop: 8 }}>
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
          
          {/* Photos Timeline */}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📸 Photos ({(photos[selectedObject.uid] || []).length})</span>
              <label style={{ cursor: 'pointer', padding: '4px 8px', background: 'rgba(46,204,113,0.2)', borderRadius: 4, fontSize: 10, color: '#2ecc71' }}>
                + Ajouter
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      addPhoto(selectedObject.uid, e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>
            
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {(photos[selectedObject.uid] || []).map(photo => (
                <div key={photo.id} style={{ position: 'relative', flexShrink: 0 }}>
                  <img 
                    src={photo.data} 
                    alt="Plant" 
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                  <div 
                    onClick={() => setPhotos(prev => ({
                      ...prev, 
                      [selectedObject.uid]: prev[selectedObject.uid].filter(p => p.id !== photo.id)
                    }))}
                    style={{ 
                      position: 'absolute', 
                      top: -4, 
                      right: -4, 
                      width: 18, 
                      height: 18, 
                      borderRadius: '50%', 
                      background: '#ef4444', 
                      color: '#fff', 
                      fontSize: 10, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                    {new Date(photo.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
              
              {(photos[selectedObject.uid] || []).length === 0 && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
                  Aucune photo - Cliquez sur + pour ajouter
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 8 }}>
        🌳 {permanentPlants.length} élément{permanentPlants.length > 1 ? 's' : ''} · Grille {GARDEN_GRID_COLS}×{GARDEN_GRID_ROWS}
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
                <div style={{ fontSize: 15, fontWeight: 600 }}>{quizPlant.plant.name}</div>
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
  const [search, setSearch] = useState('');
  const families = ['all', ...new Set(PLANTS_DB.map(p => p.family))];
  const filtered = PLANTS_DB.filter(p => {
    if (family !== 'all' && p.family !== family) return false;
    if (search) {
      const s = search.toLowerCase();
      return p.name.toLowerCase().includes(s) || 
             p.variety?.toLowerCase().includes(s) || 
             p.family.toLowerCase().includes(s);
    }
    return true;
  });
  const [selected, setSelected] = useState(null);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>📚 Encyclopédie ({filtered.length} plantes)</div>
        <div onClick={onClose} style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>✕ Fermer</div>
      </div>
      
      {/* Barre de recherche */}
      <input
        type="text"
        placeholder="🔍 Rechercher..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)',
          color: '#fff',
          fontSize: 13,
          marginBottom: 12,
          outline: 'none'
        }}
      />
      
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
  const [showAdmin, setShowAdmin] = useState(false);
  
  // États météo
  const [weather, setWeather] = useState(null);
  const [weatherAlerts, setWeatherAlerts] = useState([]);

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
  
  // Récupérer météo et alertes
  useEffect(() => {
    // Position par défaut (Paris)
    const lat = 48.8566;
    const lon = 2.3522;
    
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,showers,snowfall&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=Europe/Paris`)
      .then(r => r.json())
      .then(data => {
        setWeather(data);
        analyzeWeather(data);
      })
      .catch(() => console.log('Météo indisponible'));
      
    // Rafraîchir toutes les 30 minutes
    const interval = setInterval(() => {
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,showers,snowfall&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=Europe/Paris`)
        .then(r => r.json())
        .then(data => {
          setWeather(data);
          analyzeWeather(data);
        })
        .catch(() => {});
    }, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Analyser données météo pour créer alertes
  const analyzeWeather = (data) => {
    const alerts = [];
    const current = data.current;
    const daily = data.daily;
    
    if (!current) return;
    
    // Température
    if (current.temperature_2m > 30) {
      alerts.push({ type: 'warning', icon: '🌡️', msg: `Canicule! ${current.temperature_2m}°C - Arrosez ce soir` });
    } else if (current.temperature_2m < 2) {
      alerts.push({ type: 'error', icon: '❄️', msg: `Gel! ${current.temperature_2m}°C - Protection nécessaire` });
    }
    
    // Pluie
    if (daily?.precipitation_sum?.[0] > 20) {
      alerts.push({ type: 'info', icon: '🌧️', msg: `Fortes pluies prévues (${daily.precipitation_sum[0]}mm) - Ne pas arroser` });
    } else if (current.precipitation > 0) {
      alerts.push({ type: 'info', icon: '💧', msg: 'Il pleut - Pause arrosage' });
    } else if (current.relative_humidity_2m < 40 && current.temperature_2m > 25) {
      alerts.push({ type: 'warning', icon: '💧', msg: 'Air sec et chaud - Arrosage conseillé' });
    }
    
    // Vent
    if (daily?.windspeed_10m_max?.[0] > 50) {
      alerts.push({ type: 'warning', icon: '💨', msg: `Vent fort (${daily.windspeed_10m_max[0]}km/h) - Tuteures à vérifier` });
    }
    
    setWeatherAlerts(alerts);
  };

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const hour = new Date().getHours();
    return hour < 6 || hour > 20;
  });
  
  // Mode nuit/jour auto selon l'heure
  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      const shouldBeDark = hour < 6 || hour > 20;
      setIsDarkMode(shouldBeDark);
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Demandes de notification
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  
  // Vérifier les plants matures toutes les heures
  useEffect(() => {
    const checkMature = () => {
      const now = Date.now();
      serres.forEach(serre => {
        serre.alveoles.forEach((alv, idx) => {
          if (!alv) return;
          const data = serre.alveoleData?.[idx];
          if (!data?.plantedDate) return;
          const days = (now - new Date(data.plantedDate).getTime()) / (1000 * 60 * 60 * 24);
          const plant = PLANTS_DB.find(p => p.id === alv.plantId);
          if (plant && days >= plant.daysToMaturity) {
            if (Notification.permission === 'granted') {
              new Notification('🌱 GreenHub', { 
                body: `${plant.name} est prêt(e) à être repiquée !`,
                icon: '/seedling.svg'
              });
            }
          }
        });
      });
    };
    checkMature();
    const interval = setInterval(checkMature, 3600000);
    return () => clearInterval(interval);
  }, [serres]);

  // Calcul récoltes estimées
  const harvestEstimate = useMemo(() => {
    let totalKg = 0;
    const byPlant = {};
    
    serres.forEach(serre => {
      serre.alveoles.forEach(alv => {
        if (!alv) return;
        const plant = PLANTS_DB.find(p => p.id === alv.plantId);
        if (!plant?.yield) return;
        const avgYield = (plant.yield.min + plant.yield.max) / 2;
        totalKg += avgYield;
        byPlant[plant.name] = (byPlant[plant.name] || 0) + avgYield;
      });
    });
    
    permanentPlants.forEach(plant => {
      if (!plant.production) return;
      const match = plant.production.match(/(\d+)-?(\d+)?/);
      if (match) {
        const min = parseInt(match[1]);
        const max = match[2] ? parseInt(match[2]) : min;
        const avg = (min + max) / 2;
        totalKg += avg;
        byPlant[plant.name] = (byPlant[plant.name] || 0) + avg;
      }
    });
    
    return { totalKg: totalKg.toFixed(1), byPlant };
  }, [serres, permanentPlants]);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end' }}>
            {weather?.current && (
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                {weather.current.temperature_2m}° {weather.current.is_day ? '☀️' : '🌙'}
              </div>
            )}
            <div style={{ fontSize: 20, fontWeight: 700, color: '#2ecc71' }}>{score} pts</div>
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
            🏠 {totalAlv} alvéoles · 🌍 {totalGarden} au jardin · 🧺 {harvestEstimate.totalKg}kg est.
          </div>
          <div onClick={() => setShowAdmin(true)} style={{ fontSize: 10, color: '#e74c3c', cursor: 'pointer', marginTop: 4, fontWeight: 600 }}>
            🔧 Admin
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 3, margin: '14px 20px 0' }}>
        {[['serres', '🏠 Serres'], ['real_garden', '🏡 Jardin'], ['semer', '🌱 Semer'], ['recoltes', '🧺 Récoltes'], ['game', '⭐ Score']].map(([id, label]) => (
          <div key={id} onClick={() => { setTab(id); if (id === 'game') setShowGame(true); }} style={{ flex: 1, textAlign: 'center', padding: '9px 0', borderRadius: 10, cursor: 'pointer', fontSize: 11, background: tab === id ? 'rgba(46,204,113,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${tab === id ? '#2ecc7160' : 'rgba(255,255,255,0.06)'}`, color: tab === id ? '#2ecc71' : 'rgba(255,255,255,0.4)', fontWeight: tab === id ? 600 : 400, transition: 'all 0.2s' }}>{label}</div>
        ))}
      </div>

      {/* Alertes Météo */}
      {weatherAlerts.length > 0 && (
        <div style={{ margin: '10px 20px 0' }}>
          {weatherAlerts.map((alert, idx) => (
            <div 
              key={idx} 
              style={{ 
                marginBottom: 6, 
                padding: '10px 14px', 
                borderRadius: 8, 
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                border: '1px solid',
                ...(alert.type === 'error' 
                  ? { background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.4)', color: '#fca5a5' }
                  : alert.type === 'warning'
                  ? { background: 'rgba(234,179,8,0.15)', borderColor: 'rgba(234,179,8,0.4)', color: '#fde047' }
                  : { background: 'rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.4)', color: '#93c5fd' }
                )
              }}
            >
              <span>{alert.icon}</span>
              <span style={{ flex: 1 }}>{alert.msg}</span>
              <span 
                onClick={() => setWeatherAlerts(prev => prev.filter((_, i) => i !== idx))}
                style={{ cursor: 'pointer', opacity: 0.6 }}
              >
                ✕
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: '14px 20px 0' }}>
        {tab === 'serres' && <SerreScreen serres={serres} onAddSerre={addSerre} onTransplant={handleTransplant} onRemoveSerreSeed={handleRemoveSerreSeed} onMoveSerreSeed={handleMoveSerreSeed} />}
        {tab === 'real_garden' && <GardenRealScreen permanentPlants={permanentPlants} onAddPermanent={(obj) => { setPermanentPlants(p => [...p, obj]); showToast(`🌳 ${obj.name} ajouté au jardin !`); }} onUpdatePlants={(updater) => setPermanentPlants(updater)} onRemovePermanent={(uid) => { setPermanentPlants(p => p.filter(x => x.uid !== uid)); showToast('🗑️ Élément retiré'); }} />}
        {tab === 'semer' && <SowingScreen serres={serres} onAddSerre={addSerre} onSow={handleSow} />}
        {tab === 'recoltes' && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#2ecc71', marginBottom: 16 }}>🧺 Estimation des Récoltes</div>
            <div style={{ background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#2ecc71', marginBottom: 4 }}>{harvestEstimate.totalKg} kg</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Production totale estimée</div>
            </div>
            
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>Détail par plante:</div>
              {Object.entries(harvestEstimate.byPlant).length === 0 ? (
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontStyle: 'italic' }}>Aucune plante n'a été semée ou ajoutée au jardin.</div>
              ) : (
                Object.entries(harvestEstimate.byPlant).map(([name, kg]) => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{name}</span>
                    <span style={{ color: '#2ecc71', fontWeight: 600 }}>{kg.toFixed(1)} kg</span>
                  </div>
                ))
              )}
            </div>
            
            <div style={{ marginTop: 20, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                💡 Ces estimations sont basées sur les rendements moyens de chaque plante.
                <br />Les conditions météo et votre entretien peuvent faire varier les résultats.
              </div>
            </div>
          </div>
        )}
        {tab === 'game' && <GameScreen score={score} level={level} streak={streak} badges={badges} totalPlants={totalGarden} totalYield={totalYield} onClose={() => setTab('serres')} />}
      </div>

      {/* Bottom bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '10px 20px', background: 'rgba(13,17,23,0.95)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-around', backdropFilter: 'blur(10px)' }}>
        <div onClick={() => setTab('serres')} style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: 20 }}>🏠</div>
          <div style={{ fontSize: 10, color: tab === 'serres' ? '#2ecc71' : 'rgba(255,255,255,0.3)' }}>Serres</div>
        </div>
        <div onClick={() => setTab('real_garden')} style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: 20 }}>🏡</div>
          <div style={{ fontSize: 10, color: tab === 'real_garden' ? '#2ecc71' : 'rgba(255,255,255,0.3)' }}>Jardin</div>
        </div>
        <div onClick={() => setTab('semer')} style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: 20 }}>🌱</div>
          <div style={{ fontSize: 10, color: tab === 'semer' ? '#2ecc71' : 'rgba(255,255,255,0.3)' }}>Semer</div>
        </div>
        <div onClick={() => setTab('recoltes')} style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: 20 }}>🧺</div>
          <div style={{ fontSize: 10, color: tab === 'recoltes' ? '#2ecc71' : 'rgba(255,255,255,0.3)' }}>Récoltes</div>
        </div>
        <div onClick={() => { setShowEncyclopedia(true); }} style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: 20 }}>📚</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Encyclo</div>
        </div>
      </div>

      {/* Admin Panel */}
      {showAdmin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)', zIndex: 150, padding: 20, overflowY: 'auto' }}>
          <div style={{ maxWidth: 500, margin: '0 auto', background: '#1a1f2e', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#e74c3c' }}>🔧 Panneau Admin</div>
              <div onClick={() => setShowAdmin(false)} style={{ fontSize: 24, cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>×</div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>⏰ Vieillissement des plantes</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[1, 5, 10, 30].map(days => (
                  <button
                    key={days}
                    onClick={() => {
                      setSerres(prev => prev.map(s => {
                        const newAlveoleData = { ...(s.alveoleData || {}) };
                        Object.keys(newAlveoleData).forEach(idx => {
                          if (newAlveoleData[idx]?.plantedDate) {
                            const d = new Date(newAlveoleData[idx].plantedDate);
                            d.setDate(d.getDate() - days);
                            newAlveoleData[idx] = { ...newAlveoleData[idx], plantedDate: d.toISOString() };
                          }
                        });
                        return { ...s, alveoleData: newAlveoleData };
                      }));
                      showToast(`⏰ +${days} jours ajoutés à toutes les plantes !`);
                    }}
                    style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#e74c3c', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    +{days} jour{days > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>Ajoute des jours à la date de semis pour faire vieillir les plantes</div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, marginTop: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>💾 Sauvegarder / Charger</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    const data = { serres, gardenGrid, permanentPlants, score, level, streak, badges };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `greenhub-backup-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    showToast('💾 Jardin exporté !');
                  }}
                  style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: 'rgba(46,204,113,0.3)', color: '#2ecc71', fontSize: 13, cursor: 'pointer' }}
                >
                  📤 Exporter (JSON)
                </button>
                <label style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: 'rgba(52,152,219,0.3)', color: '#3498db', fontSize: 13, cursor: 'pointer', display: 'inline-block' }}>
                  📥 Importer (JSON)
                  <input
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const data = JSON.parse(event.target.result);
                          if (data.serres) setSerres(data.serres);
                          if (data.gardenGrid) setGardenGrid(data.gardenGrid);
                          if (data.permanentPlants) setPermanentPlants(data.permanentPlants);
                          if (data.score) setScore(data.score);
                          if (data.level) setLevel(data.level);
                          showToast('✅ Jardin importé avec succès !');
                        } catch {
                          showToast('❌ Fichier invalide', 'error');
                        }
                      };
                      reader.readAsText(file);
                    }}
                  />
                </label>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>🌱 Actions rapides</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setSerres(prev => prev.map(s => ({ ...s, alveoles: Array(SERRE_COLS * SERRE_ROWS).fill(null), alveoleData: {} })));
                    showToast('🗑️ Toutes les serres vidées !');
                  }}
                  style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: 'rgba(231,76,60,0.3)', color: '#e74c3c', fontSize: 13, cursor: 'pointer' }}
                >
                  Vider les serres
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('greenhub-state');
                    showToast('🗑️ LocalStorage effacé ! Recharge la page.');
                  }}
                  style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: 'rgba(231,76,60,0.3)', color: '#e74c3c', fontSize: 13, cursor: 'pointer' }}>
                  Reset complet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

import { useState, useCallback, useEffect, useRef } from 'react';
import { PLANTS_DB, PLANTS_SIMPLE, generateTasks, estimateYield } from './db/plants.js';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SERRE_COLS = 4;
const SERRE_ROWS = 6;
const GARDEN_COLS = 44;
const GARDEN_ROWS = 50;
const CELL = 32;
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

// ─── LIDL MINI-SERRE 3D avec croissance animée ─────────────────────────────────
// Mini-serre Lidl : 4 colonnes × 6 rangées = 24 alvéoles transparents
// Croissance animée basée sur le vrai temps écoulé depuis le semis

const GROWTH_STAGES = [
  { name: 'graine', emoji: '🟤', scale: 0.4, opacity: 0.6, days: 0 },
  { name: 'germination', emoji: '🌱', scale: 0.6, opacity: 0.8, days: 3 },
  { name: 'levée', emoji: '🌿', scale: 0.8, opacity: 0.9, days: 7 },
  { name: 'petite', emoji: '🌿', scale: 1.0, opacity: 1.0, days: 14 },
  { name: 'moyenne', emoji: '🪴', scale: 1.2, opacity: 1.0, days: 21 },
  { name: 'prête', emoji: '🪴', scale: 1.4, opacity: 1.0, days: 28 },
];

function getGrowthStage(plantedDate, daysToMaturity) {
  if (!plantedDate) return GROWTH_STAGES[0];
  const now = Date.now();
  const elapsed = (now - new Date(plantedDate).getTime()) / (1000 * 60 * 60 * 24);
  const progress = Math.min(elapsed / daysToMaturity, 1);
  const stageIndex = Math.min(Math.floor(progress * (GROWTH_STAGES.length - 1)), GROWTH_STAGES.length - 1);
  return GROWTH_STAGES[stageIndex];
}

function LidlGreenhouse3D({ serre, onCellClick, selectedAlveole, alveoleData }) {
  // alveoleData: { [idx]: { plantedDate, daysToMaturity, plantId } }
  const skewX = 10, skewY = 5;
  const cellW = 52, cellH = 40;
  const gap = 4;
  const cols = SERRE_COLS, rows = SERRE_ROWS;
  const totalW = cols * (cellW + gap) + skewX * 2 + 28;
  const totalH = rows * (cellH + gap) + skewY * 2 + 60;

  return (
    <div style={{ position: 'relative', width: totalW, height: totalH + 30, margin: '0 auto' }}>
      {/* Label Lidl */}
      <div style={{ position: 'absolute', top: -2, left: '50%', transform: 'translateX(-50%)', fontSize: 9, fontWeight: 700, color: '#e74c3c', letterSpacing: 2, textTransform: 'uppercase', background: 'rgba(255,255,255,0.9)', padding: '2px 8px', borderRadius: 4 }}>LIDL</div>

      {/* Toit transparent effet verre */}
      <div style={{ position: 'absolute', top: 4, left: skewX, width: cols * (cellW + gap) + 20, height: 20, background: 'linear-gradient(135deg, rgba(180,230,180,0.35) 0%, rgba(120,200,120,0.2) 50%, rgba(80,180,80,0.3) 100%)', border: '2px solid rgba(100,200,100,0.5)', borderRadius: '8px 8px 0 0', transform: `skewX(-${skewX * 0.4}deg)`, backdropFilter: 'blur(4px)', boxShadow: '0 -2px 15px rgba(100,200,100,0.2)' }} />

      {/* Panneau latéral gauche (effet 3D profondeur) */}
      <div style={{ position: 'absolute', top: 22, left: 2, width: skewX + 6, height: rows * (cellH + gap) + 20, background: 'linear-gradient(180deg, rgba(100,180,100,0.2) 0%, rgba(60,120,60,0.15) 100%)', borderLeft: '2px solid rgba(100,200,100,0.4)', borderBottom: '2px solid rgba(80,160,80,0.3)', borderRadius: '0 0 0 4px', transform: 'skewY(-2deg)' }} />

      {/* Contenant principal */}
      <div style={{ position: 'absolute', top: 22, left: skewX + 6, display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cellW}px)`, gap: gap, padding: 8, background: 'rgba(245,245,240,0.95)', border: '2px solid rgba(100,180,100,0.4)', borderRadius: '0 4px 4px 0', boxShadow: '0 6px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -2px 0 rgba(0,0,0,0.05)' }}>
        {Array(rows).fill(null).map((_, row) =>
          Array(cols).fill(null).map((_, col) => {
            const idx = row * cols + col;
            const alv = serre.alveoles[idx];
            const ad = alveoleData?.[idx];
            const plant = alv ? PLANTS_SIMPLE.find(p => p.id === alv.plantId) : null;
            const dbPlant = alv ? PLANTS_DB.find(p => p.id === alv.plantId) : null;
            const isSelected = selectedAlveole === idx;
            const stage = alv ? getGrowthStage(ad?.plantedDate, dbPlant?.daysToMaturity || 60) : null;

            return (
              <div key={idx} onClick={() => onCellClick(idx)} style={{ width: cellW, height: cellH, borderRadius: 6, background: plant ? `linear-gradient(135deg, ${plant.color}18 0%, ${plant.color}08 100%)` : 'rgba(200,200,190,0.3)', border: `2px solid ${isSelected ? '#fff' : plant ? plant.color + '60' : 'rgba(150,150,140,0.4)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', transform: isSelected ? 'scale(1.08) translateY(-2px)' : 'scale(1)', boxShadow: plant ? `0 3px 12px ${plant.color}40, inset 0 1px 0 rgba(255,255,255,0.9)` : 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                {/* Cellule vide */}
                {!plant && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(150,150,140,0.25)', border: '1px solid rgba(150,150,140,0.3)' }} />
                  </div>
                )}

                {/* Plante en croissance */}
                {plant && stage && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${stage.scale})`, opacity: stage.opacity, transition: 'all 0.5s ease' }}>
                    <span style={{ fontSize: 20, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>{stage.emoji}</span>
                    <div style={{ position: 'absolute', bottom: 2, left: 2, right: 2, height: 3, background: `linear-gradient(90deg, ${plant.color}80, ${plant.color}40)`, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(((Date.now() - new Date(ad?.plantedDate).getTime()) / (1000 * 60 * 60 * 24)) / (dbPlant?.daysToMaturity || 60) * 100, 100)}%`, background: plant.color, borderRadius: 2, transition: 'width 1s ease', boxShadow: `0 0 6px ${plant.color}` }} />
                    </div>
                  </div>
                )}

                {/* Indicateur sélectionné */}
                {isSelected && (
                  <div style={{ position: 'absolute', top: -1, right: -1, width: 10, height: 10, background: '#fff', borderRadius: '50%', border: '2px solid #2ecc71', boxShadow: '0 0 8px rgba(46,204,113,0.6)' }} />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pieds supports */}
      {[-2, cols * (cellW + gap) + skewX + 4].map((left, i) => (
        <div key={i} style={{ position: 'absolute', bottom: 0, left, width: 6, height: 10, background: 'rgba(80,140,80,0.5)', borderRadius: '0 0 2px 2px' }} />
      ))}

      {/* Étiquette du terreau */}
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', fontSize: 9, color: 'rgba(100,140,100,0.7)', whiteSpace: 'nowrap', background: 'rgba(255,255,255,0.7)', padding: '2px 8px', borderRadius: 8, fontWeight: 600 }}>
        🌱 {serre.name} · {serre.alveoles.filter(Boolean).length}/24 alvéoles
      </div>
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
      <div style={S.label}>Dans quelle mini-serre ?</div>
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
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{serres.length} mini-serre{serres.length > 1 ? 's' : ''}</div>
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

// ─── GARDEN GRID ──────────────────────────────────────────────────────────────
function GardenScreen({ grid, onMove }) {
  const [selected, setSelected] = useState(null);
  const [viewRow, setViewRow] = useState(0);
  const [viewCol, setViewCol] = useState(0);
  const VIEW_ROWS = 12, VIEW_COLS = 10;

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

  const visibleRows = Array.from({ length: VIEW_ROWS }, (_, i) => i + viewRow).filter(r => r < GARDEN_ROWS);
  const visibleCols = Array.from({ length: VIEW_COLS }, (_, i) => i + viewCol).filter(c => c < GARDEN_COLS);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>550 m² · 44×50 cases · Vue {VIEW_COLS}×{VIEW_ROWS}</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {[['←', 0, -3], ['→', 0, 3], ['↑', -3, 0], ['↓', 3, 0]].map(([l, dr, dc]) => (
            <div key={l} onClick={() => { setViewRow(r => Math.max(0, Math.min(GARDEN_ROWS - VIEW_ROWS, r + dr))); setViewCol(c => Math.max(0, Math.min(GARDEN_COLS - VIEW_COLS, c + dc))); }} style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{l}</div>
          ))}
        </div>
      </div>
      {selected && (
        <div style={{ padding: '6px 12px', marginBottom: 8, background: '#3498db20', border: '1px solid #3498db60', borderRadius: 8, fontSize: 12, color: '#3498db' }}>
          ✦ {PLANTS_SIMPLE.find(p => p.id === grid[selected.row]?.[selected.col]?.plantId)?.name} sélectionné — tape une case vide pour déplacer
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${VIEW_COLS}, ${CELL}px)`, gap: 2, background: 'rgba(255,255,255,0.02)', padding: 8, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}>
        {visibleRows.map(row => visibleCols.map(col => {
          const cell = grid[row]?.[col];
          const plant = cell ? PLANTS_SIMPLE.find(p => p.id === cell.plantId) : null;
          const isOrigin = cell?.origin;
          const isSel = selected?.row === row && selected?.col === col;
          return (
            <div key={`${row}-${col}`} onClick={() => handleCellTap(row, col)} style={{ width: CELL, height: CELL, borderRadius: 5, cursor: isOrigin || selected ? 'pointer' : 'default', background: isSel ? '#3498db30' : isOrigin ? plant.color + '25' : cell ? plant?.color + '10' : 'rgba(255,255,255,0.02)', border: `1.5px solid ${isSel ? '#3498db' : isOrigin ? plant.color + '80' : selected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s', transform: isSel ? 'scale(1.1)' : 'scale(1)', position: 'relative' }}>
              {isOrigin && <span style={{ fontSize: 16 }}>{plant?.emoji}</span>}
              {isOrigin && <div style={{ position: 'absolute', bottom: 1, left: 1, right: 1, height: 2, borderRadius: 1, background: plant?.color, opacity: 0.6 }} />}
              {!cell && selected && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.1)' }}>·</span>}
            </div>
          );
        }))}
      </div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 6, textAlign: 'center' }}>Ligne {viewRow + 1}–{viewRow + VIEW_ROWS} · Col {viewCol + 1}–{viewCol + VIEW_COLS} · Tap plante → tap case vide pour déplacer</div>
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
  const [gardenGrid, setGardenGrid] = useState(() =>
    Array(GARDEN_ROWS).fill(null).map(() => Array(GARDEN_COLS).fill(null))
  );
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
        if (data.score) setScore(data.score);
        if (data.level) setLevel(data.level);
        if (data.streak !== undefined) setStreak(data.streak);
        if (data.badges !== undefined) setBadges(data.badges);
      }
    } catch (e) { /* ignore */ }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('greenhub-state', JSON.stringify({ serres, gardenGrid, score, level, streak, badges }));
  }, [serres, gardenGrid, score, level, streak, badges]);

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
    setGardenGrid(prev => {
      const ng = prev.map(r => [...r]);
      const size = plant.grid_size;
      for (let row = 0; row < GARDEN_ROWS - size; row++) {
        for (let col = 0; col < GARDEN_COLS - size; col++) {
          let free = true;
          for (let r = row; r < row + size && free; r++)
            for (let c = col; c < col + size && free; c++)
              if (ng[r]?.[c]) free = false;
          if (free) {
            for (let r = row; r < row + size; r++)
              for (let c = col; c < col + size; c++)
                ng[r][c] = { plantId: plant.id, origin: r === row && c === col };
            showToast(`🌍 ${plant.emoji} ${plant.name} repiqué au jardin !`);
            setScore(s => { const n = s + 20; setLevel(Math.floor(n / 100) + 1); return n; });
            return ng;
          }
        }
      }
      return ng;
    });
    setTab('jardin');
  }, []);

  const handleMove = useCallback((fromRow, fromCol, toRow, toCol) => {
    setGardenGrid(prev => {
      const ng = prev.map(r => [...r]);
      const cell = ng[fromRow]?.[fromCol];
      if (!cell?.origin) return prev;
      const plant = PLANTS_SIMPLE.find(p => p.id === cell.plantId);
      if (!plant) return prev;
      const size = plant.grid_size;
      for (let r = toRow; r < toRow + size; r++)
        for (let c = toCol; c < toCol + size; c++)
          if (ng[r]?.[c]) return prev;
      for (let r = 0; r < GARDEN_ROWS; r++)
        for (let c = 0; c < GARDEN_COLS; c++)
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
        {[['serres', '🏠 Serres'], ['jardin', '🌍 Jardin'], ['semer', '🌱 Semer'], ['game', '⭐ Jeu']].map(([id, label]) => (
          <div key={id} onClick={() => { setTab(id); if (id === 'game') setShowGame(true); if (id === 'encyclopedia') setShowEncyclopedia(true); }} style={{ flex: 1, textAlign: 'center', padding: '9px 0', borderRadius: 10, cursor: 'pointer', fontSize: 12, background: tab === id ? 'rgba(46,204,113,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${tab === id ? '#2ecc7160' : 'rgba(255,255,255,0.06)'}`, color: tab === id ? '#2ecc71' : 'rgba(255,255,255,0.4)', fontWeight: tab === id ? 600 : 400, transition: 'all 0.2s' }}>{label}</div>
        ))}
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        {tab === 'serres' && <SerreScreen serres={serres} onAddSerre={addSerre} onTransplant={handleTransplant} />}
        {tab === 'jardin' && <GardenScreen grid={gardenGrid} onMove={handleMove} />}
        {tab === 'semer' && <SowingScreen serres={serres} onAddSerre={addSerre} onSow={handleSow} />}
        {tab === 'game' && <GameScreen score={score} level={level} streak={streak} badges={badges} totalPlants={totalGarden} totalYield={totalYield} onClose={() => setTab('serres')} />}
      </div>

      {/* Bottom bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '10px 20px', background: 'rgba(13,17,23,0.95)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-around', backdropFilter: 'blur(10px)' }}>
        <div onClick={() => setTab('serres')} style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: 20 }}>🏠</div>
          <div style={{ fontSize: 10, color: tab === 'serres' ? '#2ecc71' : 'rgba(255,255,255,0.3)' }}>Serres</div>
        </div>
        <div onClick={() => setTab('jardin')} style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: 20 }}>🌍</div>
          <div style={{ fontSize: 10, color: tab === 'jardin' ? '#2ecc71' : 'rgba(255,255,255,0.3)' }}>Jardin</div>
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

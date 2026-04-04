import { useState } from 'react';
import { useGame } from '../context/GameContext.jsx';
import { PLANTS_DB, PLANTS_SIMPLE } from '../db/plants.js';
import { getGrowthStage } from '../data/growthStages.js';
import { uid } from '../utils/uid.js';
import IsometricMiniSerre from '../components/IsometricMiniSerre.jsx';

const SERRE_COLS = 4, SERRE_ROWS = 6;

export default function SerreBoisModal({ serreBois, onClose }) {
  const { coins, setCoins, setPermanentPlants } = useGame();
  const [miniSerres, setMiniSerres] = useState(() => serreBois.miniSerres || []);
  const [selectedSerreIdx, setSelectedSerreIdx] = useState(null);
  const [selectedAlvIdx, setSelectedAlvIdx] = useState(null);
  const [movingFromIdx, setMovingFromIdx] = useState(null);

  const SHELVES = 4;
  const SLOTS_PER_SHELF = 6;
  const totalSlots = SHELVES * SLOTS_PER_SHELF;
  const occupiedSlots = miniSerres.length;
  const freeSlots = totalSlots - occupiedSlots;

  const showToast = (msg) => {
    // Use game's toast through context if available
  };

  const buyMiniSerre = () => {
    if (coins < 1) return;
    setCoins(c => c - 1);
    const newSerre = {
      id: uid(),
      name: `Mini-serre ${miniSerres.length + 1}`,
      alveoles: Array(SERRE_COLS * SERRE_ROWS).fill(null),
      alveoleData: {},
    };
    setMiniSerres(prev => [...prev, newSerre]);
  };

  const removeMiniSerre = (idx) => {
    setMiniSerres(prev => prev.filter((_, i) => i !== idx));
  };

  const moveSerreSeed = (serreIdx, fromIdx, toIdx) => {
    setMiniSerres(prev => prev.map((serre, si) => {
      if (si !== serreIdx) return serre;
      const alveoles = [...serre.alveoles];
      [alveoles[fromIdx], alveoles[toIdx]] = [alveoles[toIdx], alveoles[fromIdx]];
      const alveoleData = { ...(serre.alveoleData || {}) };
      if (alveoleData[fromIdx] && alveoleData[toIdx]) {
        [alveoleData[fromIdx], alveoleData[toIdx]] = [alveoleData[toIdx], alveoleData[fromIdx]];
      } else if (alveoleData[fromIdx]) {
        alveoleData[toIdx] = alveoleData[fromIdx];
        delete alveoleData[fromIdx];
      }
      return { ...serre, alveoles, alveoleData };
    }));
  };

  const removeSerreSeed = (serreIdx, idx) => {
    setMiniSerres(prev => prev.map((serre, si) => {
      if (si !== serreIdx) return serre;
      const alveoles = [...serre.alveoles];
      alveoles[idx] = null;
      const alveoleData = { ...(serre.alveoleData || {}) };
      delete alveoleData[idx];
      return { ...serre, alveoles, alveoleData };
    }));
  };

  const handleCellClick = (serreIdx, idx) => {
    const serre = miniSerres[serreIdx];
    if (!serre) return;
    const alv = serre.alveoles[idx];

    if (movingFromIdx !== null) {
      if (movingFromIdx.serreIdx !== serreIdx || movingFromIdx.idx !== idx) {
        moveSerreSeed(serreIdx, movingFromIdx.idx, idx);
      }
      setMovingFromIdx(null);
      return;
    }

    if (alv) {
      setSelectedSerreIdx(serreIdx);
      setSelectedAlvIdx(idx);
    } else {
      setSelectedSerreIdx(null);
      setSelectedAlvIdx(null);
    }
  };

  // Save back to permanentPlants when closing
  const handleClose = () => {
    setPermanentPlants(prev => prev.map(p =>
      p.uid === serreBois.uid ? { ...p, miniSerres } : p
    ));
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#1a1f2e', border: '2px solid #A0522D', borderRadius: 16, padding: 24, width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 32 }}>🪵</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#A0522D' }}>{serreBois.name || 'Serre en Bois'}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                {SHELVES} étagères · {occupiedSlots}/{totalSlots} mini-serres
              </div>
            </div>
          </div>
          <div onClick={handleClose} style={{ fontSize: 28, cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>×</div>
        </div>

        <div style={{ padding: '8px 12px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 8, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Ton solde</span>
          <span style={{ color: '#ffd700', fontSize: 16, fontWeight: 700 }}>{coins}€</span>
        </div>

        {movingFromIdx !== null && (
          <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(46,204,113,0.15)', border: '1px solid rgba(46,204,113,0.4)', borderRadius: 8, fontSize: 12, color: '#2ecc71' }}>
            📍 Mode déplacement — clique sur une alvéole cible
          </div>
        )}

        {miniSerres.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.4)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Aucune mini-serre</div>
            <div style={{ fontSize: 12 }}>Achète des mini-serres pour les placer sur les étagères</div>
          </div>
        ) : (
          <>
            {Array.from({ length: SHELVES }).map((_, shelfIdx) => {
              const shelfSerres = miniSerres.slice(shelfIdx * SLOTS_PER_SHELF, (shelfIdx + 1) * SLOTS_PER_SHELF);
              const shelfOccupied = miniSerres.filter((_, i) => Math.floor(i / SLOTS_PER_SHELF) === shelfIdx).length;
              return (
                <div key={shelfIdx} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                    <span>📚 Étagère {shelfIdx + 1}</span>
                    <span>{shelfOccupied}/{SLOTS_PER_SHELF} places</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {shelfSerres.map((serre, idxInShelf) => {
                      const globalIdx = shelfIdx * SLOTS_PER_SHELF + idxInShelf;
                      const isSelected = selectedSerreIdx === globalIdx;
                      const movingIdx = movingFromIdx?.serreIdx === globalIdx ? movingFromIdx.idx : null;
                      return (
                        <div key={serre.id} style={{ background: 'rgba(160,82,45,0.1)', border: `2px solid ${isSelected ? '#2ecc71' : 'rgba(160,82,45,0.3)'}`, borderRadius: 10, padding: 8 }}>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 4, textAlign: 'center' }}>
                            {serre.name} · {serre.alveoles.filter(Boolean).length}/24
                          </div>
                          <IsometricMiniSerre
                            serre={serre}
                            selectedIdx={isSelected ? selectedAlvIdx : null}
                            movingIdx={movingIdx}
                            onCellClick={(idx) => handleCellClick(globalIdx, idx)}
                          />
                        </div>
                      );
                    })}
                    {Array.from({ length: SLOTS_PER_SHELF - shelfSerres.length }).map((_, emptyIdx) => (
                      <div key={`empty-${emptyIdx}`} style={{ background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 80 }}>
                        <span style={{ fontSize: 24, opacity: 0.2 }}>📦</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {selectedSerreIdx !== null && selectedAlvIdx !== null && (() => {
          const serre = miniSerres[selectedSerreIdx];
          if (!serre) return null;
          const alv = serre.alveoles[selectedAlvIdx];
          const ad = serre.alveoleData?.[selectedAlvIdx];
          const plant = alv ? PLANTS_SIMPLE.find(p => p.id === alv.plantId) : null;
          const dbPlant = alv ? PLANTS_DB.find(p => p.id === alv.plantId) : null;
          if (!plant || !dbPlant) return null;
          const daysSinceSow = ad?.plantedDate ? Math.floor((Date.now() - new Date(ad.plantedDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
          const stage = getGrowthStage(ad?.plantedDate, dbPlant.daysToMaturity || 60);
          return (
            <div style={{ marginTop: 12, padding: 12, background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: 10 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 28, transform: `scale(${stage.scale})`, display: 'inline-block' }}>{stage.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{plant.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>J+{daysSinceSow} · {dbPlant.daysToMaturity}j</div>
                </div>
                <div onClick={() => { setMovingFromIdx({ serreIdx: selectedSerreIdx, idx: selectedAlvIdx }); setSelectedSerreIdx(null); setSelectedAlvIdx(null); }} style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', fontSize: 11, cursor: 'pointer' }}>📍 Déplacer</div>
                <div onClick={() => { removeSerreSeed(selectedSerreIdx, selectedAlvIdx); setSelectedSerreIdx(null); setSelectedAlvIdx(null); }} style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(220,53,69,0.2)', border: '1px solid rgba(220,53,69,0.4)', fontSize: 11, cursor: 'pointer' }}>🗑️</div>
              </div>
            </div>
          );
        })()}

        <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <div onClick={freeSlots > 0 ? buyMiniSerre : undefined} style={{
            padding: '10px 20px', borderRadius: 10,
            background: freeSlots > 0 ? 'rgba(46,204,113,0.2)' : 'rgba(255,255,255,0.05)',
            border: `2px solid ${freeSlots > 0 ? 'rgba(46,204,113,0.5)' : 'rgba(255,255,255,0.1)'}`,
            color: freeSlots > 0 ? '#2ecc71' : 'rgba(255,255,255,0.3)',
            fontSize: 13, fontWeight: 700, cursor: freeSlots > 0 ? 'pointer' : 'not-allowed',
          }}>
            📦 Acheter mini-serre (1€) {freeSlots === 0 ? '— Étagères pleines' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useGame } from '../context/GameContext.jsx';
import { PLANTS_DB, PLANTS_SIMPLE } from '../db/plants.js';
import { getGrowthStage } from '../data/growthStages.js';
import { S } from '../data/styles.js';
import IsometricMiniSerre from '../components/IsometricMiniSerre.jsx';

export default function SerreScreen() {
  const { serres, addSerre, handleTransplant, handleRemoveSerreSeed, moveSerreSeed } = useGame();
  const [newName, setNewName] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedAlv, setSelectedAlv] = useState(null);
  const [showTransplant, setShowTransplant] = useState(false);
  const [movingFromIdx, setMovingFromIdx] = useState(null);

  const handleCellClick = (idx, serre) => {
    const alv = serre.alveoles[idx];
    if (movingFromIdx !== null) {
      if (movingFromIdx !== idx) {
        moveSerreSeed(serre.id, movingFromIdx, idx);
      }
      setMovingFromIdx(null);
      return;
    }
    if (alv) {
      setSelectedAlv({ serreId: serre.id, idx });
      setShowTransplant(true);
    } else {
      setSelectedAlv(null);
      setShowTransplant(false);
    }
  };

  return (
    <div>
      {movingFromIdx !== null && (
        <div style={{ marginBottom: 10, padding: '8px 12px', background: 'rgba(46,204,113,0.15)', border: '1px solid rgba(46,204,113,0.4)', borderRadius: 8, fontSize: 12, color: '#2ecc71' }}>
          Mode deplacement actif
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{serres.length} mini serre{serres.length > 1 ? 's' : ''}</div>
        <div onClick={() => setShowAdd(!showAdd)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px dashed rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer' }}>+ Ajouter une serre</div>
      </div>
      {showAdd && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nom" style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 13, outline: 'none' }} />
          <div onClick={() => { if (newName.trim()) { addSerre(newName.trim()); setNewName(''); setShowAdd(false); } }} style={{ padding: '8px 14px', borderRadius: 8, background: '#2ecc71', color: '#0d1117', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>OK</div>
        </div>
      )}
      {serres.map(serre => {
        const alvData = selectedAlv && selectedAlv.serreId === serre.id ? serre.alveoleData : null;
        return (
          <div key={serre.id} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 12 }}>
              {serre.name} - {serre.alveoles.filter(Boolean).length} occupees
            </div>
            <IsometricMiniSerre
              serre={serre}
              selectedIdx={selectedAlv && selectedAlv.serreId === serre.id ? selectedAlv.idx : null}
              movingIdx={movingFromIdx !== null && selectedAlv && selectedAlv.serreId === serre.id ? movingFromIdx : null}
              onCellClick={(idx) => handleCellClick(idx, serre)}
            />
            {showTransplant && selectedAlv && selectedAlv.serreId === serre.id && (() => {
              const alv = serre.alveoles[selectedAlv.idx];
              const ad = alvData ? alvData[selectedAlv.idx] : null;
              const plant = alv ? PLANTS_SIMPLE.find(p => p.id === alv.plantId) : null;
              const dbPlant = alv ? PLANTS_DB.find(p => p.id === alv.plantId) : null;
              if (!plant || !dbPlant) return null;
              const daysSinceSow = ad && ad.plantedDate ? Math.floor((Date.now() - new Date(ad.plantedDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
              const progress = Math.min(daysSinceSow / (dbPlant.daysToMaturity || 60), 1);
              const stage = getGrowthStage(ad && ad.plantedDate, dbPlant.daysToMaturity || 60);
              return (
                <div style={{ marginTop: 10, padding: 12, background: plant.color + '15', border: '1px solid ' + plant.color + '40', borderRadius: 10 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 28 }}>{stage.emoji}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{plant.name}</div>
                      <div style={{ fontSize: 11, color: plant.color }}>{dbPlant.family} - J+{daysSinceSow}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <div onClick={() => { handleTransplant(serre.id, selectedAlv.idx); setShowTransplant(false); setSelectedAlv(null); }} style={{ ...S.primaryBtn, background: plant.color, padding: '8px 0', fontSize: 11, flex: 1 }}>Repiquer</div>
                    <div onClick={() => { setMovingFromIdx(selectedAlv.idx); setShowTransplant(false); }} style={{ ...S.primaryBtn, background: 'rgba(255,255,255,0.1)', padding: '8px 0', fontSize: 11, flex: 1 }}>Deplacer</div>
                    <div onClick={() => { handleRemoveSerreSeed(serre.id, selectedAlv.idx); setShowTransplant(false); setSelectedAlv(null); }} style={{ ...S.primaryBtn, background: 'rgba(220,53,69,0.2)', padding: '8px 0', fontSize: 11, flex: 1 }}>Supprimer</div>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })}
    </div>
  );
}

import { useState } from 'react';
import { useGame } from '../context/GameContext.jsx';
import { getMoonPhase } from '../utils/moon.js';
import { PLANTS_SIMPLE } from '../db/plants.js';
import { S } from '../data/styles.js';

const SERRE_COLS = 4, SERRE_ROWS = 6;

export default function SowingScreen() {
  const { serres, handleSow, addSerre } = useGame();
  const [step, setStep] = useState(0);
  const [plant, setPlant] = useState(null);
  const [qty, setQty] = useState(6);
  const [targetSerre, setTargetSerre] = useState(null);
  const [showAddSerre, setShowAddSerre] = useState(false);
  const [newSerreName, setNewSerreName] = useState('');
  const [sowingDate, setSowingDate] = useState('');
  const [useCustomDate, setUseCustomDate] = useState(false);
  const moon = getMoonPhase();

  const handleConfirm = () => {
    if (!plant || !targetSerre) return;
    let plantedDate;
    if (useCustomDate && sowingDate) {
      plantedDate = new Date(sowingDate).toISOString();
    } else {
      plantedDate = new Date().toISOString();
    }
    handleSow(plant, qty, targetSerre, plantedDate);
    setStep(0); setPlant(null); setQty(6); setTargetSerre(null); setSowingDate(''); setUseCustomDate(false);
  };

  if (step === 0) {
    return (
      <div>
        <div style={S.label}>Quelle plante as-tu semée ?</div>

        {/* Indicateur phase lunaire */}
        <div style={{
          marginBottom: 12, padding: '10px 14px',
          background: 'rgba(255,255,255,0.05)', borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 24 }}>{moon.icon}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{moon.name}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
              {moon.sow
                ? `✅ Bon moment pour semer : ${moon.sow === 'racines' ? 'racines (carottes, radis...)' : moon.sow === 'feuilles' ? 'feuilles (salades, épinards...)' : moon.sow === 'fruits' ? 'fruits (tomates, courges...)' : 'graines (haricots, pois...)'}`
                : '❌ Jour de repos - évitez les semis'
              }
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {PLANTS_SIMPLE.map(p => (
            <div key={p.id} onClick={() => { setPlant(p); setStep(1); }} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
              border: `2px solid ${p.color}50`, background: p.color + '15', minWidth: 60,
            }}>
              <span style={{ fontSize: 22 }}>{p.emoji}</span>
              <span style={{ fontSize: 10, color: '#fff' }}>{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (step === 1 && plant) {
    return (
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
              <div key={s.id} onClick={() => setTargetSerre(s.id)} style={{
                padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
                border: `2px solid ${targetSerre === s.id ? '#2ecc71' : 'rgba(255,255,255,0.1)'}`,
                background: targetSerre === s.id ? '#2ecc7115' : 'rgba(255,255,255,0.03)', transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>🏠 {s.name}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{free} alvéoles libres</div>
              </div>
            );
          })}
          <div onClick={() => setShowAddSerre(true)} style={{
            padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
            border: '2px dashed rgba(255,255,255,0.15)', background: 'transparent',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }}>+</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Ajouter une serre</span>
          </div>
        </div>

        {showAddSerre && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              value={newSerreName}
              onChange={e => setNewSerreName(e.target.value)}
              placeholder="Nom de la serre"
              style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 13, outline: 'none' }}
            />
            <div onClick={() => { if (newSerreName.trim()) { addSerre(newSerreName.trim()); setNewSerreName(''); setShowAddSerre(false); } }} style={{ padding: '8px 14px', borderRadius: 8, background: '#2ecc71', color: '#0d1117', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>OK</div>
          </div>
        )}

        {/* Date de semis */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={S.label}>📅 Date de semis</div>
            <div onClick={() => setUseCustomDate(!useCustomDate)} style={{
              padding: '4px 8px', borderRadius: 6, fontSize: 10, cursor: 'pointer',
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
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          ) : (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[1, 3, 7, 14, 21, 30].map(days => (
                <div key={days} onClick={() => { setUseCustomDate(true); const d = new Date(); d.setDate(d.getDate() - days); setSowingDate(d.toISOString().split('T')[0]); }} style={{
                  padding: '6px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)',
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

        <div onClick={handleConfirm} style={{
          ...S.primaryBtn,
          background: targetSerre ? plant.color : 'rgba(255,255,255,0.1)',
          color: targetSerre ? '#fff' : 'rgba(255,255,255,0.3)',
          cursor: targetSerre ? 'pointer' : 'default',
        }}>
          🌱 Semer {qty} × {plant.name} →
        </div>
      </div>
    );
  }

  return null;
}

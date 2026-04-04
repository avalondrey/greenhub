import { useState } from 'react';
import { PLANTS_DB } from '../db/plants.js';
import { S } from '../data/styles.js';

export default function EncyclopediaScreen({ onClose }) {
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

      <input
        type="text"
        placeholder="🔍 Rechercher..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 13,
          marginBottom: 12, outline: 'none', boxSizing: 'border-box',
        }}
      />

      <div style={{ display: 'flex', gap: 4, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
        {families.map(f => (
          <div key={f} onClick={() => { setFamily(f); setSelected(null); }}
            style={{
              padding: '4px 10px', borderRadius: 20, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap',
              background: family === f ? 'rgba(46,204,113,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${family === f ? '#2ecc71' : 'rgba(255,255,255,0.1)'}`,
              color: family === f ? '#2ecc71' : 'rgba(255,255,255,0.5)',
            }}>
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
            <div key={p.id} onClick={() => setSelected(p)} style={{
              padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'all 0.15s',
            }}>
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

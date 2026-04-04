import { useState } from 'react';
import { useGame } from '../context/GameContext.jsx';
import { getGardenMetrics } from '../data/gardenConfig.js';
import { PLANTS_DB, PLANTS_SIMPLE } from '../db/plants.js';

export default function GardenScreen() {
  const { gardenGrid, gardenArea, handleMove } = useGame();
  const metrics = getGardenMetrics(gardenArea || 550);
  const { sizeM, cols, rows, cellSize } = metrics;
  const [selected, setSelected] = useState(null);
  const [viewRow, setViewRow] = useState(0);
  const [viewCol, setViewCol] = useState(0);
  const VIEW_ROWS = 10, VIEW_COLS = 12;

  const calcFill = (plantId) => {
    const occupied = gardenGrid.flat().filter(c => c?.origin && c?.plantId === plantId).length;
    const plant = PLANTS_DB.find(p => p.id === plantId);
    if (!plant) return null;
    const maxW = Math.max(1, Math.floor(cols * cellSize / plant.spacing.between));
    const maxL = Math.max(1, Math.floor(rows * cellSize / plant.spacing.rows));
    const total = maxW * maxL;
    return { occupied, total, pct: total > 0 ? (occupied / total) * 100 : 0, plant };
  };

  const handleCellTap = (row, col) => {
    const cell = gardenGrid[row]?.[col];
    if (selected) {
      if (selected.row === row && selected.col === col) { setSelected(null); return; }
      if (!cell) { handleMove(selected.row, selected.col, row, col); setSelected(null); return; }
      if (cell.origin) { setSelected({ row, col }); return; }
      setSelected(null);
    } else {
      if (cell?.origin) setSelected({ row, col });
    }
  };

  const visibleRows = Array.from({ length: VIEW_ROWS }, (_, i) => i + viewRow).filter(r => r < rows);
  const visibleCols = Array.from({ length: VIEW_COLS }, (_, i) => i + viewCol).filter(c => c < cols);
  const totalPlants = gardenGrid.flat().filter(c => c?.origin).length;
  const gardenAreaUsed = gardenGrid.flat().filter(c => c?.origin).reduce((sum, cell) => {
    const plant = PLANTS_DB.find(p => p.id === cell.plantId);
    if (!plant) return sum;
    return sum + (plant.spacing.between * plant.spacing.rows) / 10000;
  }, 0);
  const selectedStats = selected ? calcFill(gardenGrid[selected.row]?.[selected.col]?.plantId) : null;

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
          📐 {sizeM.toFixed(1)}m × {sizeM.toFixed(1)}m = {gardenArea || 550}m² · {cols}×{rows} cases ({cellSize}cm)
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#2ecc71' }}>
          🌱 {totalPlants} plants · 📍 {gardenAreaUsed.toFixed(1)}m² ({((gardenAreaUsed / (gardenArea || 550)) * 100).toFixed(1)}%)
        </div>
      </div>

      {selectedStats && (
        <div style={{ padding: '8px 12px', marginBottom: 8, background: selectedStats.plant.color + '15', border: `1px solid ${selectedStats.plant.color}40`, borderRadius: 8, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
          📊 {selectedStats.plant.icon} {selectedStats.plant.name} · {selectedStats.occupied}/{selectedStats.total} plants ({selectedStats.pct.toFixed(1)}%) · espacement {selectedStats.plant.spacing.between}cm × {selectedStats.plant.spacing.rows}cm
        </div>
      )}

      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {[['↖', -5, -5], ['↑', -5, 0], ['↗', -5, 5], ['←', 0, -5], ['⌀', 0, 0], ['→', 0, 5], ['↙', 5, -5], ['↓', 5, 0], ['↘', 5, 5]].map(([l, dr, dc]) => (
          <div key={l} onClick={() => {
            if (l === '⌀') { setViewRow(0); setViewCol(0); }
            else { setViewRow(r => Math.max(0, Math.min(rows - VIEW_ROWS, r + dr))); setViewCol(c => Math.max(0, Math.min(cols - VIEW_COLS, c + dc))); }
          }}
            style={{
              padding: '4px 8px', borderRadius: 6,
              background: l === '⌀' ? '#2ecc71' : 'rgba(255,255,255,0.07)',
              color: l === '⌀' ? '#0d1117' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer', fontSize: 12, fontWeight: 700, minWidth: 28, textAlign: 'center',
            }}>{l}</div>
        ))}
      </div>

      {selected && (
        <div style={{ padding: '6px 12px', marginBottom: 8, background: '#3498db20', border: '1px solid #3498db60', borderRadius: 8, fontSize: 12, color: '#3498db' }}>
          ✦ {PLANTS_SIMPLE.find(p => p.id === gardenGrid[selected.row]?.[selected.col]?.plantId)?.name} — tape une case vide pour déplacer
        </div>
      )}

      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${VIEW_COLS}, ${cellSize}px)`,
        gap: 1, background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto',
      }}>
        {visibleRows.map(row => visibleCols.map(col => {
          const cell = gardenGrid[row]?.[col];
          const plant = cell ? PLANTS_SIMPLE.find(p => p.id === cell.plantId) : null;
          const isOrigin = cell?.origin;
          const isSel = selected?.row === row && selected?.col === col;
          return (
            <div key={`${row}-${col}`} onClick={() => handleCellTap(row, col)} style={{
              width: cellSize, height: cellSize, borderRadius: 4,
              cursor: isOrigin || selected ? 'pointer' : 'default',
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

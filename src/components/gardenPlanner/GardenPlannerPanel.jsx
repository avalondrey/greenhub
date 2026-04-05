// =============================================
// GardenPlannerPanel — 2D Garden Planner main panel
// =============================================

import { useEffect } from 'react';
import useGardenPlannerState from './useGardenPlannerState.js';
import GardenPlannerToolbar from './GardenPlannerToolbar.jsx';
import GardenPlannerCanvas from './GardenPlannerCanvas.jsx';
import SlotManager from './SlotManager.jsx';

export default function GardenPlannerPanel({ onTransfer, onClose }) {
  const state = useGardenPlannerState();

  // Load slot list on mount
  useEffect(() => {
    state.loadSlots();
  }, []);

  // Expose catalog for canvas companion lines
  useEffect(() => {
    window.__gardenCatalog = state.catalog;
  }, [state.catalog]);

  // ── Cell interactions ────────────────────────────────────────────────────
  const handleCellClick = (row, col) => {
    if (state.selectedTool === 'eraser') {
      state.removeAtCell(row, col);
    } else if (state.selectedTool === 'single') {
      if (state.selectedItem) {
        state.placeObject(state.selectedItem.id, row, col);
      }
    }
  };

  const handleCellRightClick = (row, col) => {
    state.removeAtCell(row, col);
  };

  const handleDrawStart = (row, col) => {
    state.setDrawStart({ row, col });
    state.setDrawCurrent({ row, col });
  };

  const handleDrawMove = (row, col) => {
    state.setDrawCurrent({ row, col });
  };

  const handleDrawEnd = (row, col) => {
    if (!state.drawStart) return;

    if (state.selectedTool === 'rect' && state.selectedItem) {
      state.placeRect(state.selectedItem.id, state.drawStart.row, state.drawStart.col, row, col);
    } else if (state.selectedTool === 'line' && state.selectedItem) {
      state.placeLine(state.selectedItem.id, state.drawStart.row, state.drawStart.col, row, col, 5);
    } else if (state.selectedTool === 'path') {
      // Add point to path
      if (row === -1) {
        // double-click or -1 signal — finish path
        state.finishPath();
      }
    }

    state.setDrawStart(null);
    state.setDrawCurrent(null);
  };

  // ── Transfer to 3D ──────────────────────────────────────────────────────
  const handleTransfer = () => {
    const planData = state.buildTransferPlan();
    if (onTransfer) onTransfer(planData);
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(13,17,23,0.97)',
      borderRadius: 12,
      overflow: 'hidden',
      border: '2px solid rgba(46,204,113,0.4)',
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.3)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>🗺️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#2ecc71', letterSpacing: 0.5 }}>
              Planneur de Jardin 2D
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
              24m × 50m · Grille 10cm · Défilez pour explorer
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Stats */}
          <div style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.5)',
            background: 'rgba(255,255,255,0.04)',
            padding: '4px 10px',
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            🌱 {state.placedObjects.length} objets · 🪨 {state.paths.length} allées
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 20,
              cursor: 'pointer',
              lineHeight: 1,
              padding: '2px 6px',
            }}
            title="Fermer le planneur"
          >
            ×
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        gap: 0,
      }}>
        {/* ── Left panel: Toolbar + Slots ── */}
        <div style={{
          width: 280,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          overflowY: 'auto',
          padding: '10px 10px',
          gap: 12,
        }}>
          {/* Slot manager */}
          <SlotManager
            slots={state.slots}
            currentSlot={state.currentSlot}
            onLoad={(id) => state.loadFromSlot(id)}
            onSave={(name) => state.saveToSlot(name)}
            onDelete={state.deleteCurrentSlot}
            onRename={(name) => state.renameCurrentSlot(name)}
            onExport={state.exportJSON}
            onImport={(file) => state.importJSON(file)}
          />

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

          {/* Toolbar */}
          <GardenPlannerToolbar
            selectedCategory={state.selectedCategory}
            onSelectCategory={state.setSelectedCategory}
            selectedItem={state.selectedItem}
            onSelectItem={state.setSelectedItem}
            selectedTool={state.selectedTool}
            onSelectTool={state.setSelectedTool}
            perimeterFence={state.perimeterFence}
            onPerimeterFence={(type, height) => state.setPerimeterFence({ type, height })}
            showPerimeter={state.showPerimeter}
            onToggleShowPerimeter={state.togglePerimeterFence}
            categories={state.categories}
          />

          {/* Undo / Clear */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={state.undo}
              style={{
                flex: 1,
                padding: '7px 0',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)',
                fontSize: 11,
                cursor: 'pointer',
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              ↩️ Undo
            </button>
            <button
              onClick={() => {
                if (window.confirm('Effacer tous les objets du plan ?')) state.clearAll();
              }}
              style={{
                flex: 1,
                padding: '7px 0',
                borderRadius: 8,
                background: 'rgba(231,76,60,0.1)',
                border: '1px solid rgba(231,76,60,0.2)',
                color: '#e74c3c',
                fontSize: 11,
                cursor: 'pointer',
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              🗑️ Tout effacer
            </button>
          </div>
        </div>

        {/* ── Right panel: Canvas ── */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 10,
        }}>
          {/* Canvas */}
          <div style={{ flex: 1, overflow: 'auto', borderRadius: 8 }}>
            <GardenPlannerCanvas
              placedObjects={state.placedObjects}
              paths={state.paths}
              selectedItem={state.selectedItem}
              selectedTool={state.selectedTool}
              drawStart={state.drawStart}
              drawCurrent={state.drawCurrent}
              perimeterFence={state.perimeterFence}
              showPerimeter={state.showPerimeter}
              onCellClick={handleCellClick}
              onCellRightClick={handleCellRightClick}
              onDrawStart={handleDrawStart}
              onDrawMove={handleDrawMove}
              onDrawEnd={handleDrawEnd}
            />
          </div>

          {/* ── Transfer button ── */}
          <div style={{
            marginTop: 8,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}>
            <button
              onClick={handleTransfer}
              disabled={state.placedObjects.length === 0 && !state.showPerimeter && state.paths.length === 0}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 10,
                background: 'rgba(46,204,113,0.2)',
                border: '1.5px solid rgba(46,204,113,0.5)',
                color: state.placedObjects.length === 0 && !state.showPerimeter && state.paths.length === 0 ? 'rgba(255,255,255,0.3)' : '#2ecc71',
                fontSize: 13,
                fontWeight: 700,
                cursor: state.placedObjects.length === 0 && !state.showPerimeter && state.paths.length === 0 ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans',sans-serif",
                letterSpacing: 0.5,
                transition: 'all 0.2s',
              }}
            >
              🚀 Transférer vers le Monde 3D
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

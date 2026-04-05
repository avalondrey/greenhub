// =============================================
// useGardenPlannerState — React hook for 2D Garden Planner
// =============================================

import { useState, useCallback, useRef } from 'react';
import {
  getSlotIndex, getSlot, saveSlot, deleteSlot, renameSlot,
  exportSlotToJSON, importSlotFromJSON, importSlotData, createEmptySlot,
} from './gardenPlannerStorage.js';
import { VEGETABLES_CATEGORIES, VEGETABLES_CATALOG } from '../../graphics/threejs/realistic/helpers/FineGridDeck.js';

// ── Constants ────────────────────────────────────────────────────────────────
const GRID_COLS = 240;
const GRID_ROWS = 500;
const CELL_SIZE  = 0.1; // 10cm

export { GRID_COLS, GRID_ROWS, CELL_SIZE };

// ── Tool modes ────────────────────────────────────────────────────────────────
export const TOOL_MODES = {
  SINGLE:    'single',
  RECT:      'rect',
  LINE:      'line',
  ERASER:    'eraser',
  PATH:      'path',   // draw allee path (2-point polyline)
};

// ── Companionage (same data as FineGridDeck) ───────────────────────────────────
const COMPAGNONAGE = {
  tomate:    { good: ['basilic', 'carotte'], bad: ['pommier', 'cerisier'] },
  carotte:   { good: ['tomate', 'oignon', 'poireau', 'salade', 'radis'], bad: ['persil'] },
  salade:    { good: ['carotte', 'radis', 'fraise', 'oignon'], bad: [] },
  radis:     { good: ['salade', 'carotte', 'pois', 'haricot'], bad: [] },
  oignon:    { good: ['carotte', 'salade', 'tomate', 'poireau'], bad: ['pois', 'haricot'] },
  ail:       { good: ['tomate', 'carotte', 'salade', 'fraise'], bad: ['pois', 'haricot', 'fève'] },
  pois:      { good: ['carotte', 'radis', 'navet', 'courgette'], bad: ['oignon', 'ail', 'poireau'] },
  haricot:   { good: ['carotte', 'courgette', 'pois', 'aubergine'], bad: ['oignon', 'ail', 'poireau'] },
  basilic:   { good: ['tomate', 'aubergine', 'poivron'], bad: [] },
  thym:      { good: ['aubergine', 'tomate', 'poivron'], bad: [] },
  romarin:   { good: ['aubergine', 'courgette', 'carotte'], bad: [] },
  pommier:   { good: ['basilic', 'capucine'], bad: ['tomate', 'cerisier'] },
};

export function getCompanions(id) {
  return COMPAGNONAGE[id] || null;
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export default function useGardenPlannerState() {
  // ── Placement state ──────────────────────────────────────────────────
  const [placedObjects, setPlacedObjects] = useState([]);
  const [paths, setPaths]                 = useState([]);

  // ── Tool state ────────────────────────────────────────────────────────
  const [selectedTool, setSelectedTool]   = useState(TOOL_MODES.SINGLE);
  const [selectedItem, setSelectedItem]   = useState(null);  // { id, name, emoji, type, color, spanCells }
  const [selectedCategory, setSelectedCategory] = useState('legumes');

  // ── Drawing state (for rect / line / path tools) ────────────────────
  const [drawStart, setDrawStart]         = useState(null); // { row, col }
  const [drawCurrent, setDrawCurrent]    = useState(null); // { row, col }

  // ── Fence / perimeter ─────────────────────────────────────────────────
  const [perimeterFence, setPerimeterFence] = useState({ type: 'grillage', height: 1.5 });
  const [showPerimeter, setShowPerimeter]   = useState(false);

  // ── Slot state ────────────────────────────────────────────────────────
  const [currentSlot, setCurrentSlot]   = useState(null); // { id, name }
  const [slots, setSlots]                = useState([]);

  // ── Undo/redo ────────────────────────────────────────────────────────
  const undoStack = useRef([]);
  const REDO_STACK_MAX = 50;

  const _pushUndo = useCallback((objects, paths) => {
    undoStack.current.push({ objects: [...objects], paths: [...paths] });
    if (undoStack.current.length > REDO_STACK_MAX) {
      undoStack.current.shift();
    }
  }, []);

  // ── Load slot index ───────────────────────────────────────────────────
  const loadSlots = useCallback(() => {
    const index = getSlotIndex();
    setSlots(index.slots || []);
  }, []);

  // ── Place single object ───────────────────────────────────────────────
  const placeObject = useCallback((itemId, row, col) => {
    setPlacedObjects(prev => {
      // Check if cell already occupied
      const conflict = prev.find(o => o.row === row && o.col === col);
      if (conflict) return prev;
      _pushUndo(prev, []);
      return [...prev, { id: itemId, row, col, span: 1 }];
    });
  }, [_pushUndo]);

  // ── Place rect (batch) ────────────────────────────────────────────────
  const placeRect = useCallback((itemId, startRow, startCol, endRow, endCol) => {
    const minR = Math.min(startRow, endRow);
    const maxR = Math.max(startRow, endRow);
    const minC = Math.min(startCol, endCol);
    const maxC = Math.max(startCol, endCol);

    setPlacedObjects(prev => {
      _pushUndo(prev, []);
      const newObjs = [];
      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          const conflict = prev.find(o => o.row === r && o.col === c);
          if (!conflict) newObjs.push({ id: itemId, row: r, col: c, span: 1 });
        }
      }
      return [...prev, ...newObjs];
    });
  }, [_pushUndo]);

  // ── Place line (batch) ───────────────────────────────────────────────
  const placeLine = useCallback((itemId, startRow, startCol, endRow, endCol, spacing = 5) => {
    setPlacedObjects(prev => {
      _pushUndo(prev, []);
      const newObjs = [];
      const dRow = endRow - startRow;
      const dCol = endCol - startCol;
      const length = Math.max(Math.abs(dRow), Math.abs(dCol));
      if (length === 0) return prev;

      for (let i = 0; i <= length; i += spacing) {
        const t = length === 0 ? 0 : i / length;
        const r = Math.round(startRow + dRow * t);
        const c = Math.round(startCol + dCol * t);
        const conflict = prev.find(o => o.row === r && o.col === c);
        if (!conflict) newObjs.push({ id: itemId, row: r, col: c, span: 1 });
      }
      return [...prev, ...newObjs];
    });
  }, [_pushUndo]);

  // ── Remove object at cell ─────────────────────────────────────────────
  const removeAtCell = useCallback((row, col) => {
    setPlacedObjects(prev => {
      _pushUndo(prev, []);
      return prev.filter(o => !(o.row === row && o.col === col));
    });
  }, [_pushUndo]);

  // ── Path drawing ─────────────────────────────────────────────────────
  const startPath = useCallback((row, col) => {
    setPaths(prev => {
      _pushUndo([], prev);
      return [...prev, { id: `path_${Date.now()}`, points: [[row, col]], width: 2 }];
    });
  }, [_pushUndo]);

  const extendPath = useCallback((row, col) => {
    setPaths(prev => {
      const last = prev[prev.length - 1];
      if (!last) return prev;
      const updated = { ...last, points: [...last.points, [row, col]] };
      return [...prev.slice(0, -1), updated];
    });
  }, []);

  const finishPath = useCallback(() => {
    // Path is already committed, nothing to do
  }, []);

  // ── Perimeter fence ───────────────────────────────────────────────────
  const togglePerimeterFence = useCallback((fenceType, height = 1.5) => {
    setPerimeterFence({ type: fenceType, height });
    setShowPerimeter(true);
  }, []);

  // ── Undo ─────────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    const last = undoStack.current.pop();
    if (!last) return;
    setPlacedObjects(last.objects);
    setPaths(last.paths);
  }, []);

  // ── Clear all ─────────────────────────────────────────────────────────
  const clearAll = useCallback(() => {
    setPlacedObjects([]);
    setPaths([]);
    setShowPerimeter(false);
  }, []);

  // ── Slot operations ────────────────────────────────────────────────────
  const saveToSlot = useCallback((slotName) => {
    const id = currentSlot?.id || `slot_${Date.now()}`;
    saveSlot(id, slotName, {
      fenceHeight: perimeterFence.height,
      perimeterFence,
      objects: placedObjects,
      paths,
    });
    setCurrentSlot({ id, name: slotName });
    loadSlots();
  }, [currentSlot, placedObjects, paths, perimeterFence, loadSlots]);

  const loadFromSlot = useCallback((slotId) => {
    const data = getSlot(slotId);
    if (!data) return;
    setPlacedObjects(data.objects || []);
    setPaths(data.paths || []);
    if (data.perimeterFence) setPerimeterFence(data.perimeterFence);
    if (data.fenceHeight) setPerimeterFence(p => ({ ...p, height: data.fenceHeight }));
    setShowPerimeter(!!data.perimeterFence);
    const index = getSlotIndex();
    const meta = (index.slots || []).find(s => s.id === slotId);
    setCurrentSlot(meta || { id: slotId, name: meta?.name || 'Plan' });
  }, []);

  const deleteCurrentSlot = useCallback(() => {
    if (!currentSlot?.id) return;
    deleteSlot(currentSlot.id);
    setCurrentSlot(null);
    clearAll();
    loadSlots();
  }, [currentSlot, clearAll, loadSlots]);

  const renameCurrentSlot = useCallback((newName) => {
    if (!currentSlot?.id) return;
    renameSlot(currentSlot.id, newName);
    setCurrentSlot(prev => prev ? { ...prev, name: newName } : null);
    loadSlots();
  }, [currentSlot, loadSlots]);

  // ── Export / Import ──────────────────────────────────────────────────
  const exportJSON = useCallback(() => {
    exportSlotToJSON({
      version: 1,
      gardenDimensions: { width: 24, depth: 50, cellSize: 0.1, cols: 240, rows: 500 },
      fenceHeight: perimeterFence.height,
      perimeterFence,
      objects: placedObjects,
      paths,
    });
  }, [perimeterFence, placedObjects, paths]);

  const importJSON = useCallback(async (file) => {
    const data = await importSlotFromJSON(file);
    setPlacedObjects(data.objects || []);
    setPaths(data.paths || []);
    if (data.perimeterFence) setPerimeterFence(data.perimeterFence);
    if (data.fenceHeight) setPerimeterFence(p => ({ ...p, height: data.fenceHeight }));
    setShowPerimeter(!!data.perimeterFence);
  }, []);

  // ── Build transfer plan ───────────────────────────────────────────────
  const buildTransferPlan = useCallback(() => {
    return {
      perimeterFence: showPerimeter ? perimeterFence : null,
      objects: placedObjects,
      paths,
    };
  }, [showPerimeter, perimeterFence, placedObjects, paths]);

  return {
    // State
    placedObjects, paths,
    selectedTool, selectedItem, selectedCategory,
    drawStart, drawCurrent,
    perimeterFence, showPerimeter,
    currentSlot, slots,
    // Categories (static)
    categories: VEGETABLES_CATEGORIES,
    catalog: VEGETABLES_CATALOG,
    // Setters
    setSelectedTool, setSelectedItem, setSelectedCategory,
    setDrawStart, setDrawCurrent,
    setPerimeterFence,
    // Placement actions
    placeObject, placeRect, placeLine, removeAtCell,
    startPath, extendPath, finishPath,
    togglePerimeterFence,
    // Slot actions
    loadSlots, saveToSlot, loadFromSlot, deleteCurrentSlot, renameCurrentSlot,
    exportJSON, importJSON,
    // Misc
    undo, clearAll, buildTransferPlan,
  };
}

// =============================================
// GardenPlannerCanvas — 2D top-down HTML5 Canvas renderer
// =============================================

import { useRef, useEffect, useCallback, useState } from 'react';
import { GRID_COLS, GRID_ROWS, TOOL_MODES, getCompanions } from './useGardenPlannerState.js';

// ── Canvas constants ─────────────────────────────────────────────────────────
const CANVAS_W = 960;
const CANVAS_H = 600;
const CELL_PX  = 4; // 4px per 10cm cell at default zoom → full garden 960x2000px but we scroll

export { CANVAS_W, CANVAS_H, CELL_PX };

// ── Color map ────────────────────────────────────────────────────────────────
const COLOR_MAP = {
  vegetable:  '#2d5a0f',
  flower:     '#8e44ad',
  fruit_tree: '#c0392b',
  structure:  '#8B4513',
  fence:      '#708090',
  hedge:      '#27ae60',
  path:       '#BDBDBD',
};

function hexToRgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── Emoji renderer (offscreen canvas) ─────────────────────────────────────────
const _emojiCache = new Map();
function getEmojiImage(emoji, size = 20) {
  const key = `${emoji}_${size}`;
  if (_emojiCache.has(key)) return _emojiCache.get(key);

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.font = `${size * 0.75}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, size / 2, size / 2);
  const img = new Image();
  img.src = canvas.toDataURL();
  _emojiCache.set(key, img);
  return img;
}

// ── Companion planting lines ──────────────────────────────────────────────────
function drawCompanionLines(ctx, placedObjects, hoveredCell, catalog) {
  if (!hoveredCell) return;
  const hovered = placedObjects.find(o => o.row === hoveredCell.row && o.col === hoveredCell.col);
  if (!hovered) return;
  const companions = getCompanions(hovered.id);
  if (!companions) return;

  const hoveredObj = catalog.find(c => c.id === hovered.id);
  if (!hoveredObj) return;

  // Draw green lines to good companions
  (companions.good || []).forEach(goodId => {
    placedObjects.forEach(o => {
      if (o.id === goodId) {
        const x1 = hovered.col * CELL_PX + CELL_PX / 2;
        const y1 = hovered.row * CELL_PX + CELL_PX / 2;
        const x2 = o.col * CELL_PX + CELL_PX / 2;
        const y2 = o.row * CELL_PX + CELL_PX / 2;
        ctx.strokeStyle = 'rgba(46,204,113,0.6)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  });

  // Draw red lines to bad companions
  (companions.bad || []).forEach(badId => {
    placedObjects.forEach(o => {
      if (o.id === badId) {
        const x1 = hovered.col * CELL_PX + CELL_PX / 2;
        const y1 = hovered.row * CELL_PX + CELL_PX / 2;
        const x2 = o.col * CELL_PX + CELL_PX / 2;
        const y2 = o.row * CELL_PX + CELL_PX / 2;
        ctx.strokeStyle = 'rgba(231,76,60,0.6)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  });
}

// ── Main Canvas component ─────────────────────────────────────────────────────
export default function GardenPlannerCanvas({
  placedObjects,
  paths,
  selectedItem,
  selectedTool,
  drawStart,
  drawCurrent,
  perimeterFence,
  showPerimeter,
  onCellClick,
  onCellRightClick,
  onDrawStart,
  onDrawMove,
  onDrawEnd,
}) {
  const canvasRef  = useRef(null);
  const containerRef = useRef(null);
  const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 });
  const [hoveredCell, setHoveredCell]   = useState(null);
  const [companionInfo, setCompanionInfo] = useState(null);

  // ── Draw loop ───────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    const scrollX = scrollOffset.x;
    const scrollY = scrollOffset.y;

    // Background
    ctx.fillStyle = '#1a2e1a';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Grid origin offset
    const offsetX = scrollX;
    const offsetY = scrollY;

    // Only draw grid lines at major intervals (every 1m = 10 cells = 40px)
    const majorStep = 40;
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < CANVAS_W; x += majorStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_H);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_H; y += majorStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_W, y);
      ctx.stroke();
    }

    // ── Perimeter fence (border) ───────────────────────────────────────────
    if (showPerimeter && perimeterFence) {
      const gridW = GRID_COLS * CELL_PX; // 960
      const gridH = GRID_ROWS * CELL_PX; // 2000
      const margin = 2; // pixels

      ctx.strokeStyle = perimeterFence.type === 'haie' ? '#27ae60' : '#708090';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(margin, margin, CANVAS_W - margin * 2, CANVAS_H - margin * 2);
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = 'rgba(112,128,144,0.5)';
      ctx.font = '10px sans-serif';
      ctx.fillText(
        `${perimeterFence.type === 'grillage' ? '🔗' : perimeterFence.type === 'bordure_bois' ? '🪵' : perimeterFence.type === 'haie' ? '🌲' : '🧱'} ${perimeterFence.height}m`,
        margin + 4, CANVAS_H - margin - 4
      );
    }

    // ── Placed objects ────────────────────────────────────────────────────
    placedObjects.forEach(obj => {
      const px = obj.col * CELL_PX - offsetX;
      const py = obj.row * CELL_PX - offsetY;

      if (px < -CELL_PX || px > CANVAS_W || py < -CELL_PX || py > CANVAS_H) return;

      // Color fill
      const cat = window.__gardenCatalog?.find(c => c.id === obj.id);
      const color = cat?.color || '#4CAF50';
      ctx.fillStyle = hexToRgba(color, 0.3);
      ctx.fillRect(px, py, CELL_PX, CELL_PX);

      // Border
      ctx.strokeStyle = hexToRgba(color, 0.6);
      ctx.lineWidth = 0.5;
      ctx.strokeRect(px, py, CELL_PX, CELL_PX);

      // Emoji (only when zoomed in enough)
      if (CELL_PX >= 4 && cat?.emoji) {
        const emojiImg = getEmojiImage(cat.emoji, Math.max(12, Math.floor(CELL_PX * 2)));
        if (emojiImg.complete) {
          ctx.drawImage(emojiImg, px - (CELL_PX * 2 - CELL_PX) / 2, py - (CELL_PX * 2 - CELL_PX) / 2, CELL_PX * 2, CELL_PX * 2);
        }
      }
    });

    // ── Companion lines (on hover) ────────────────────────────────────────
    if (hoveredCell) {
      drawCompanionLines(ctx, placedObjects, hoveredCell, window.__gardenCatalog || []);
    }

    // ── Paths / allées ───────────────────────────────────────────────────
    paths.forEach(path => {
      if (path.points.length < 2) return;
      ctx.strokeStyle = '#BDBDBD';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      const [startRow, startCol] = path.points[0];
      ctx.moveTo(startCol * CELL_PX - offsetX + CELL_PX / 2, startRow * CELL_PX - offsetY + CELL_PX / 2);
      for (let i = 1; i < path.points.length; i++) {
        const [r, c] = path.points[i];
        ctx.lineTo(c * CELL_PX - offsetX + CELL_PX / 2, r * CELL_PX - offsetY + CELL_PX / 2);
      }
      ctx.stroke();

      // Gravel dots
      ctx.fillStyle = '#9E9E9E';
      for (let i = 0; i < path.points.length - 1; i++) {
        const [r, c] = path.points[i];
        const [r2, c2] = path.points[i + 1];
        const steps = Math.max(Math.abs(r2 - r), Math.abs(c2 - c));
        if (steps === 0) continue;
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const x = (startCol + (c2 - startCol) * t) * CELL_PX - offsetX;
          const y = (startRow + (r2 - startRow) * t) * CELL_PX - offsetY;
          ctx.beginPath();
          ctx.arc(x + CELL_PX / 2, y + CELL_PX / 2, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // ── Draw preview (rect / line tool) ────────────────────────────────────
    if (drawStart && drawCurrent && (selectedTool === TOOL_MODES.RECT || selectedTool === TOOL_MODES.LINE)) {
      const x1 = drawStart.col * CELL_PX - offsetX;
      const y1 = drawStart.row * CELL_PX - offsetY;
      const x2 = drawCurrent.col * CELL_PX - offsetX + CELL_PX;
      const y2 = drawCurrent.row * CELL_PX - offsetY + CELL_PX;

      ctx.strokeStyle = '#2ecc71';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      if (selectedTool === TOOL_MODES.RECT) {
        ctx.strokeRect(
          Math.min(x1, x2), Math.min(y1, y2),
          Math.abs(x2 - x1), Math.abs(y2 - y1)
        );
        // Fill preview
        const fillColor = selectedItem ? hexToRgba(selectedItem.color || '#4CAF50', 0.2) : 'rgba(46,204,113,0.1)';
        ctx.fillStyle = fillColor;
        ctx.fillRect(
          Math.min(x1, x2), Math.min(y1, y2),
          Math.abs(x2 - x1), Math.abs(y2 - y1)
        );
      } else {
        ctx.beginPath();
        ctx.moveTo(x1 + CELL_PX / 2, y1 + CELL_PX / 2);
        ctx.lineTo(x2 + CELL_PX / 2, y2 + CELL_PX / 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // ── Hover highlight ────────────────────────────────────────────────────
    if (hoveredCell) {
      const hx = hoveredCell.col * CELL_PX - offsetX;
      const hy = hoveredCell.row * CELL_PX - offsetY;
      ctx.strokeStyle = '#2ecc71';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(hx, hy, CELL_PX, CELL_PX);
    }
  }, [placedObjects, paths, scrollOffset, hoveredCell, selectedItem, selectedTool, drawStart, drawCurrent, perimeterFence, showPerimeter]);

  // ── Animation loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    let rafId;
    const loop = () => { draw(); rafId = requestAnimationFrame(loop); };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [draw]);

  // ── Mouse event helpers ────────────────────────────────────────────────────
  const getCellFromEvent = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor((x + scrollOffset.x) / CELL_PX);
    const row = Math.floor((y + scrollOffset.y) / CELL_PX);
    if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return null;
    return { row, col };
  }, [scrollOffset]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    const cell = getCellFromEvent(e);
    if (!cell) return;

    if (e.button === 2) {
      onCellRightClick(cell.row, cell.col);
      return;
    }

    if (selectedTool === TOOL_MODES.SINGLE || selectedTool === TOOL_MODES.ERASER) {
      onCellClick(cell.row, cell.col);
    } else if (selectedTool === TOOL_MODES.RECT || selectedTool === TOOL_MODES.LINE) {
      onDrawStart(cell.row, cell.col);
    } else if (selectedTool === TOOL_MODES.PATH) {
      onDrawStart(cell.row, cell.col);
    }
  }, [getCellFromEvent, selectedTool, onCellClick, onCellRightClick, onDrawStart]);

  const handleMouseMove = useCallback((e) => {
    const cell = getCellFromEvent(e);
    if (!cell) {
      setHoveredCell(null);
      return;
    }
    setHoveredCell(cell);

    if (e.buttons === 1 && (selectedTool === TOOL_MODES.RECT || selectedTool === TOOL_MODES.LINE || selectedTool === TOOL_MODES.PATH)) {
      onDrawMove(cell.row, cell.col);
    }
  }, [getCellFromEvent, selectedTool, onDrawMove]);

  const handleMouseUp = useCallback((e) => {
    if (selectedTool === TOOL_MODES.RECT || selectedTool === TOOL_MODES.LINE || selectedTool === TOOL_MODES.PATH) {
      const cell = getCellFromEvent(e);
      if (cell) onDrawEnd(cell.row, cell.col);
    }
  }, [getCellFromEvent, selectedTool, onDrawEnd]);

  const handleDblClick = useCallback((e) => {
    if (selectedTool === TOOL_MODES.PATH) {
      onDrawEnd(-1, -1); // signal end of path
    }
  }, [selectedTool, onDrawEnd]);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    const cell = getCellFromEvent(e);
    if (cell) onCellRightClick(cell.row, cell.col);
  }, [getCellFromEvent, onCellRightClick]);

  // ── Scroll / zoom ─────────────────────────────────────────────────────────
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    // For now, no zoom — just pan
    const delta = e.deltaY;
    setScrollOffset(prev => ({
      x: Math.max(0, Math.min(GRID_COLS * CELL_PX - CANVAS_W, prev.x + delta * 0.5)),
      y: prev.y,
    }));
  }, []);

  // ── Pan with middle mouse ───────────────────────────────────────────────────
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  const handlePanStart = useCallback((e) => {
    if (e.button === 1) {
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handlePanMove = useCallback((e) => {
    if (isPanning.current) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setScrollOffset(prev => ({
        x: Math.max(0, Math.min(GRID_COLS * CELL_PX - CANVAS_W, prev.x - dx)),
        y: Math.max(0, Math.min(GRID_ROWS * CELL_PX - CANVAS_H, prev.y - dy)),
      }));
      panStart.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handlePanEnd = useCallback(() => {
    isPanning.current = false;
  }, []);

  // ── Companion info on hover ─────────────────────────────────────────────────
  useEffect(() => {
    if (!hoveredCell) { setCompanionInfo(null); return; }
    const hovered = placedObjects.find(o => o.row === hoveredCell.row && o.col === hoveredCell.col);
    if (hovered) {
      const info = getCompanions(hovered.id);
      setCompanionInfo(info ? { ...info, id: hovered.id } : null);
    } else {
      setCompanionInfo(null);
    }
  }, [hoveredCell, placedObjects]);

  return (
    <div style={{ position: 'relative', width: CANVAS_W, height: CANVAS_H, overflow: 'hidden', borderRadius: 8, border: '1px solid rgba(46,204,113,0.3)' }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{ display: 'block', cursor: selectedTool === TOOL_MODES.ERASER ? 'crosshair' : 'pointer' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDblClick}
        onContextMenu={handleContextMenu}
        onWheel={handleWheel}
        onMouseLeave={() => setHoveredCell(null)}
      />

      {/* ── Coord display ── */}
      <div style={{
        position: 'absolute', bottom: 6, left: 8,
        background: 'rgba(13,17,23,0.8)',
        borderRadius: 5,
        padding: '3px 8px',
        fontSize: 10,
        color: 'rgba(255,255,255,0.6)',
        fontFamily: 'monospace',
        pointerEvents: 'none',
      }}>
        {hoveredCell ? (
          `${(hoveredCell.col * 0.1).toFixed(1)}m — ${(hoveredCell.row * 0.1).toFixed(1)}m`
        ) : '📍 survolez la grille'}
      </div>

      {/* ── Companion info tooltip ── */}
      {companionInfo && hoveredCell && (
        <div style={{
          position: 'absolute', top: 6, right: 6,
          background: 'rgba(13,17,23,0.92)',
          border: '1px solid rgba(46,204,113,0.3)',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 10,
          color: 'rgba(255,255,255,0.8)',
          maxWidth: 180,
          pointerEvents: 'none',
        }}>
          <div style={{ color: '#2ecc71', fontWeight: 600, marginBottom: 4 }}>
            🌿 Companions: {companionInfo.id}
          </div>
          {(companionInfo.good || []).length > 0 && (
            <div style={{ color: '#2ecc71', marginBottom: 2 }}>
              ✅ {(companionInfo.good || []).join(', ')}
            </div>
          )}
          {(companionInfo.bad || []).length > 0 && (
            <div style={{ color: '#e74c3c' }}>
              ❌ {(companionInfo.bad || []).join(', ')}
            </div>
          )}
        </div>
      )}

      {/* ── Zoom / scroll indicator ── */}
      <div style={{
        position: 'absolute', bottom: 6, right: 8,
        background: 'rgba(13,17,23,0.8)',
        borderRadius: 5,
        padding: '3px 8px',
        fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'monospace',
      }}>
        ↔️ Scroll pour défiler | Molette = pan
      </div>
    </div>
  );
}

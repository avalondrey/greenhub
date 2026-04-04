import { useEffect, useCallback } from 'react';
import useTileRenderer from '../hooks/useTileRenderer.js';
import { useRealtimeGrowth } from '../hooks/useRealtimeGrowth.js';

export default function IsometricMiniSerre({ serre, selectedIdx, movingIdx, onCellClick }) {
  const tick = useRealtimeGrowth();
  const { canvasRef, render, ready, getClickedCell } = useTileRenderer();

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

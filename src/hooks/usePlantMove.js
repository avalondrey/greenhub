import { useCallback } from 'react';

/**
 * Hook unifié pour le déplacement de plants.
 * Gère les 3 modes existants :
 * - overwrite : destination DOIT être vide (SerreScreen principal)
 * - swap     : échange toujours le contenu (SerreBoisModal, ChambresScreen)
 * - garden   : mouvement dans la grille jardin
 *
 * @param {{ setSerres, setChambres, setGardenGrid, showToast }} deps
 */
export function usePlantMove({ setSerres, setChambres, setGardenGrid, showToast }) {
  // ── Mode overwrite (SerreScreen — handleMoveSerreSeed) ─────────────────────
  const moveSerreSeed = useCallback((serreId, fromIdx, toIdx) => {
    if (fromIdx === toIdx) return;
    setSerres(prev => prev.map(s => {
      if (s.id !== serreId) return s;
      const alveoles = [...s.alveoles];
      const alveoleData = { ...(s.alveoleData || {}) };
      if (alveoles[toIdx] !== null) return prev; // destination must be empty
      const temp = alveoles[fromIdx];
      alveoles[fromIdx] = null;
      alveoles[toIdx] = temp;
      if (alveoleData[fromIdx]) {
        alveoleData[toIdx] = alveoleData[fromIdx];
        delete alveoleData[fromIdx];
      }
      return { ...s, alveoles, alveoleData };
    }));
    showToast('✓ Graine déplacée');
  }, [setSerres, showToast]);

  // ── Mode swap (SerreBoisModal — local moveSerreSeed) ──────────────────────
  const moveMiniSerreSeed = useCallback((miniSerres, setMiniSerres, serreIdx, fromIdx, toIdx) => {
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
  }, []);

  // ── Mode swap (ChambresScreen — local moveSerreSeed) ─────────────────────
  const moveChambreSeed = useCallback((chambreId, serreIdx, fromIdx, toIdx) => {
    setChambres(prev => prev.map(ch => {
      if (ch.id !== chambreId) return ch;
      const miniSerres = [...ch.miniSerres];
      const serre = { ...miniSerres[serreIdx] };
      const alveoles = [...serre.alveoles];
      [alveoles[fromIdx], alveoles[toIdx]] = [alveoles[toIdx], alveoles[fromIdx]];
      const alveoleData = { ...(serre.alveoleData || {}) };
      if (alveoleData[fromIdx] && alveoleData[toIdx]) {
        [alveoleData[fromIdx], alveoleData[toIdx]] = [alveoleData[toIdx], alveoleData[fromIdx]];
      } else if (alveoleData[fromIdx]) {
        alveoleData[toIdx] = alveoleData[fromIdx];
        delete alveoleData[fromIdx];
      }
      serre.alveoles = alveoles;
      serre.alveoleData = alveoleData;
      miniSerres[serreIdx] = serre;
      return { ...ch, miniSerres };
    }));
  }, [setChambres]);

  // ── Garden grid move (GardenScreen — handleMove) ─────────────────────────
  const moveGardenPlant = useCallback((fromRow, fromCol, toRow, toCol, PLANTS_SIMPLE) => {
    setGardenGrid(prev => {
      const ng = prev.map(r => [...r]);
      const rows = ng.length, cols = ng[0]?.length || 0;
      const cell = ng[fromRow]?.[fromCol];
      if (!cell?.origin) return prev;
      const plant = PLANTS_SIMPLE.find(p => p.id === cell.plantId);
      if (!plant) return prev;
      const size = plant.grid_size || 1;
      for (let r = toRow; r < toRow + size; r++)
        for (let c = toCol; c < toCol + size; c++)
          if (ng[r]?.[c]) return prev;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          if (ng[r]?.[c]?.plantId === cell.plantId && Math.abs(r - fromRow) < size && Math.abs(c - fromCol) < size)
            ng[r][c] = null;
      for (let r = toRow; r < toRow + size; r++)
        for (let c = toCol; c < toCol + size; c++)
          ng[r][c] = { ...cell, origin: r === toRow && c === toCol };
      return ng;
    });
    showToast('✓ Déplacé !');
  }, [setGardenGrid, showToast]);

  return { moveSerreSeed, moveMiniSerreSeed, moveChambreSeed, moveGardenPlant };
}

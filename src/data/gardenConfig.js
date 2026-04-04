// Taille par défaut : 550m² = 23.5m × 23.5m
// Cellule = 50cm (correspond aux plants les plus petits type radis 5cm espacement)
export const GARDEN_CONFIG = {
  areaM2: 550,
  cellSize: 50, // cm
};

/**
 * @param {number} areaM2
 * @returns {{ sizeM: number, sizeCm: number, cols: number, rows: number, cellSize: number }}
 */
export function getGardenMetrics(areaM2) {
  const sizeM = Math.sqrt(areaM2);
  const sizeCm = sizeM * 100;
  const cols = Math.floor(sizeCm / GARDEN_CONFIG.cellSize);
  const rows = Math.floor(sizeCm / GARDEN_CONFIG.cellSize);
  return { sizeM, sizeCm, cols, rows, cellSize: GARDEN_CONFIG.cellSize };
}

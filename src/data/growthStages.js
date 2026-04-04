// ── GROWTH STAGES (6 stades pour le rendu SVG/emoji fallback) ──
export const GROWTH_STAGES = [
  { name: 'graine',      emoji: '🟤', scale: 0.4, opacity: 0.6 },
  { name: 'germination', emoji: '🌱', scale: 0.6, opacity: 0.8 },
  { name: 'levée',       emoji: '🌿', scale: 0.8, opacity: 0.9 },
  { name: 'petite',      emoji: '🌿', scale: 1.0, opacity: 1.0 },
  { name: 'moyenne',     emoji: '🪴', scale: 1.2, opacity: 1.0 },
  { name: 'prête',       emoji: '🪴', scale: 1.4, opacity: 1.0 },
];

// ── TILESET STAGES (5 stades = colonnes du tileset) ──
export const TILESET_GROWTH = [
  { name: 'graine',      emoji: '🟤', scale: 0.4, opacity: 0.6 },
  { name: 'germination', emoji: '🌱', scale: 0.55, opacity: 0.8 },
  { name: 'levée',       emoji: '🌿', scale: 0.75, opacity: 0.9 },
  { name: 'croissance',  emoji: '🌿', scale: 0.95, opacity: 1.0 },
  { name: 'prête',       emoji: '🪴', scale: 1.15, opacity: 1.0 },
];

/**
 * Retourne le stade de croissance selon la date de semis.
 * @param {string|null} plantedDate
 * @param {number} daysToMaturity
 */
export function getGrowthStage(plantedDate, daysToMaturity) {
  if (!plantedDate) return GROWTH_STAGES[0];
  const days = (Date.now() - new Date(plantedDate).getTime()) / (1000 * 60 * 60 * 24);
  const progress = Math.min(days / daysToMaturity, 1);
  const idx = Math.min(
    Math.floor(progress * (GROWTH_STAGES.length - 1)),
    GROWTH_STAGES.length - 1
  );
  return GROWTH_STAGES[idx];
}

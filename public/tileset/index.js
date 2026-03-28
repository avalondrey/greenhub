// ============================================================
// GREENHUB TILESET - INDEX
// ============================================================
// Export centralisé de tous les tilesets
// Images: /tileset/*.jpg
//   - Original: 1344×768 (16:9)
//   - Square:   1344×1344 (avec letterbox)
// Compatible: Vortex, 3D isométrique, Pixel Art
// ============================================================

export {
  // Images
  TILESET_IMAGES,
  IMAGE_DIMS,

  // Dimensions
  TILE_DIMS,

  // Stades de croissance
  GROWTH_STAGES,

  // Terrains
  TERRAIN_TILES,

  // Allées/Chemins
  PATH_TILES,

  // Bois
  WOOD_TILES,

  // Structures
  STRUCTURE_TILES,

  // Arbres
  TREE_TILES,

  // Légumes
  VEGETABLE_TILES,

  // Petits fruits
  FRUIT_TILES,

  // Décorations
  DECOR_TILES,

  // Utilitaires
  getImagePath,
  getGrowthStage,
  calculateGrowthStage,
  getTerrainColors,
  getStructureColors,
  getVegetableInfo,
  getStageImagePath,

  // Export complet
  FULL_TILESET,
} from './garden-tileset.js';

export { default } from './garden-tileset.js';
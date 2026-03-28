// ============================================================
// GREENHUB GARDEN TILESET - TEXTURES ISOMÉTRIQUES COMPLÈTES
// ============================================================
// Tileset basé sur les images du dossier /tileset
// Images de référence: 00_MASTER_tileset_reference.jpg
//
// Toutes les images sont en format carré 768x768
// Compatible: Vortex, 3D isométrique, Pixel Art
// ============================================================

// ── DIMENSIONS DES IMAGES ──────────────────────────────────────
export const IMAGE_DIMS = {
  width: 768,
  height: 768,
  format: 'square',  // Compatible: vortex, isometric, pixel-art
};

// ── CHEMINS DES IMAGES ────────────────────────────────────────
const TILESET_PATH = '/tileset/';

// Dimensions des images
export const IMAGE_DIMS = {
  // Original (16:9)
  original: { width: 1344, height: 768, format: 'landscape' },
  // Square (avec bandes noires)
  square: { width: 1344, height: 1344, format: 'square' },
};

export const TILESET_IMAGES = {
  // Masters
  master: TILESET_PATH + '00_MASTER_COMPLETE_tileset.jpg',
  masterSquare: TILESET_PATH + 'square/00_MASTER_COMPLETE_tileset.jpg',
  reference: TILESET_PATH + '00_MASTER_tileset_reference.jpg',
  referenceSquare: TILESET_PATH + 'square/00_MASTER_tileset_reference.jpg',

  // Catégories principales (original 16:9)
  terrain: TILESET_PATH + '01_terrain_tileset.jpg',
  wood: TILESET_PATH + '02_wood_tileset.jpg',
  growthStages: TILESET_PATH + '03_growth_stages.jpg',
  greenhouse: TILESET_PATH + '04_greenhouse_structure.jpg',
  trees: TILESET_PATH + '05_garden_trees.jpg',
  structures: TILESET_PATH + '06_garden_structures.jpg',

  // Plantes (original 16:9)
  vegetables: TILESET_PATH + '07_vegetable_plants.jpg',
  smallFruits: TILESET_PATH + '08_small_fruits.jpg',
  herbs: TILESET_PATH + '09_herbs_tileset.jpg',
  legumes1: TILESET_PATH + '10_legumes_batch1.jpg',
  legumes2: TILESET_PATH + '11_legumes_batch2.jpg',
  fruitTrees: TILESET_PATH + '12_arbres_fruitiers.jpg',
  tomatoes: TILESET_PATH + '13_tomates_salades_melon.jpg',
  roots: TILESET_PATH + '14_racines_specialites.jpg',

  // === VERSIONS CARRÉES (compatibles Vortex, Isometric, Pixel Art) ===
  // Masters
  masterSq: TILESET_PATH + 'square/00_MASTER_COMPLETE_tileset.jpg',
  referenceSq: TILESET_PATH + 'square/00_MASTER_tileset_reference.jpg',

  // Catégories principales (square)
  terrainSq: TILESET_PATH + 'square/01_terrain_tileset.jpg',
  woodSq: TILESET_PATH + 'square/02_wood_tileset.jpg',
  growthStagesSq: TILESET_PATH + 'square/03_growth_stages.jpg',
  greenhouseSq: TILESET_PATH + 'square/04_greenhouse_structure.jpg',
  treesSq: TILESET_PATH + 'square/05_garden_trees.jpg',
  structuresSq: TILESET_PATH + 'square/06_garden_structures.jpg',

  // Plantes (square)
  vegetablesSq: TILESET_PATH + 'square/07_vegetable_plants.jpg',
  smallFruitsSq: TILESET_PATH + 'square/08_small_fruits.jpg',
  herbsSq: TILESET_PATH + 'square/09_herbs_tileset.jpg',
  legumes1Sq: TILESET_PATH + 'square/10_legumes_batch1.jpg',
  legumes2Sq: TILESET_PATH + 'square/11_legumes_batch2.jpg',
  fruitTreesSq: TILESET_PATH + 'square/12_arbres_fruitiers.jpg',
  tomatoesSq: TILESET_PATH + 'square/13_tomates_salades_melon.jpg',
  rootsSq: TILESET_PATH + 'square/14_racines_specialites.jpg',

  // Stades de croissance - Jardin (original 16:9)
  stadesJardin: {
    tomates: TILESET_PATH + 'stades-jardin/J01_tomates1.jpg',
    solanacees: TILESET_PATH + 'stades-jardin/J02_solanacees.jpg',
    courgettes: TILESET_PATH + 'stades-jardin/J03_courgettes_melon_mais.jpg',
    haricots: TILESET_PATH + 'stades-jardin/J04_haricots_poireau_oignon.jpg',
    ail: TILESET_PATH + 'stades-jardin/J05_ail_carottes_radis.jpg',
    racines: TILESET_PATH + 'stades-jardin/J06_racines_feuilles.jpg',
    salades: TILESET_PATH + 'stades-jardin/J07_salades_chou.jpg',
    brocoli: TILESET_PATH + 'stades-jardin/J08_brocoli_fraises_basilic.jpg',
    herbes1: TILESET_PATH + 'stades-jardin/J09_herbes1.jpg',
    herbes2: TILESET_PATH + 'stades-jardin/J10_herbes2.jpg',
  },

  // Stades de croissance - Jardin (square)
  stadesJardinSq: {
    tomates: TILESET_PATH + 'stades-jardin/square/J01_tomates1.jpg',
    solanacees: TILESET_PATH + 'stades-jardin/square/J02_solanacees.jpg',
    courgettes: TILESET_PATH + 'stades-jardin/square/J03_courgettes_melon_mais.jpg',
    haricots: TILESET_PATH + 'stades-jardin/square/J04_haricots_poireau_oignon.jpg',
    ail: TILESET_PATH + 'stades-jardin/square/J05_ail_carottes_radis.jpg',
    racines: TILESET_PATH + 'stades-jardin/square/J06_racines_feuilles.jpg',
    salades: TILESET_PATH + 'stades-jardin/square/J07_salades_chou.jpg',
    brocoli: TILESET_PATH + 'stades-jardin/square/J08_brocoli_fraises_basilic.jpg',
    herbes1: TILESET_PATH + 'stades-jardin/square/J09_herbes1.jpg',
    herbes2: TILESET_PATH + 'stades-jardin/square/J10_herbes2.jpg',
  },

  // Stades de croissance - Serre (original 16:9)
  stadesSerre: {
    tomates: TILESET_PATH + 'stades-serre/S01_tomates1.jpg',
    solanacees: TILESET_PATH + 'stades-serre/S02_solanacees.jpg',
    courgettes: TILESET_PATH + 'stades-serre/S03_courgettes_melon_mais.jpg',
    haricots: TILESET_PATH + 'stades-serre/S04_haricots_poireau_oignon.jpg',
    ail: TILESET_PATH + 'stades-serre/S05_ail_carottes_radis.jpg',
    racines: TILESET_PATH + 'stades-serre/S06_racines_feuilles1.jpg',
    salades: TILESET_PATH + 'stades-serre/S07_salades_chou.jpg',
    brocoli: TILESET_PATH + 'stades-serre/S08_brocoli_fraises_basilic.jpg',
    herbes1: TILESET_PATH + 'stades-serre/S09_herbes1.jpg',
    herbes2: TILESET_PATH + 'stades-serre/S10_herbes2.jpg',
  },

  // Stades de croissance - Serre (square)
  stadesSerreSq: {
    tomates: TILESET_PATH + 'stades-serre/square/S01_tomates1.jpg',
    solanacees: TILESET_PATH + 'stades-serre/square/S02_solanacees.jpg',
    courgettes: TILESET_PATH + 'stades-serre/square/S03_courgettes_melon_mais.jpg',
    haricots: TILESET_PATH + 'stades-serre/square/S04_haricots_poireau_oignon.jpg',
    ail: TILESET_PATH + 'stades-serre/square/S05_ail_carottes_radis.jpg',
    racines: TILESET_PATH + 'stades-serre/square/S06_racines_feuilles1.jpg',
    salades: TILESET_PATH + 'stades-serre/square/S07_salades_chou.jpg',
    brocoli: TILESET_PATH + 'stades-serre/square/S08_brocoli_fraises_basilic.jpg',
    herbes1: TILESET_PATH + 'stades-serre/square/S09_herbes1.jpg',
    herbes2: TILESET_PATH + 'stades-serre/square/S10_herbes2.jpg',
  },
};

// ── DIMENSIONS ISOMÉTRIQUES ─────────────────────────────────────
export const TILE_DIMS = {
  // Dimensions des tiles
  TW: 64,   // Tile width
  TH: 32,   // Tile height
  TD: 22,   // Tile depth
  CELL_W: 46, // Cell width in grid
  CELL_H: 34, // Cell height in grid

  // Dimensions des images (pour sprite sheets)
  IMG_ORIGINAL_W: 1344,  // Largeur originale (16:9)
  IMG_ORIGINAL_H: 768,    // Hauteur originale
  IMG_SQUARE_W: 1344,     // Largeur carrée (avec letterbox)
  IMG_SQUARE_H: 1344,     // Hauteur carrée
};

// ── STADES DE CROISSANCE ────────────────────────────────────────
// Référence: 03_growth_stages.jpg
export const GROWTH_STAGES = [
  {
    index: 0,
    name: 'graine',
    emoji: '🟤',
    scale: 0.4,
    opacity: 0.6,
    inDirt: true,
    description: 'Graine plantée dans la terre avec sillons visibles',
    soilPattern: 'soilSow',
  },
  {
    index: 1,
    name: 'germination',
    emoji: '🌱',
    scale: 0.6,
    opacity: 0.8,
    inDirt: false,
    description: 'Première pousse sortant de terre',
    soilPattern: 'soilGerm',
  },
  {
    index: 2,
    name: 'levée',
    emoji: '🌿',
    scale: 0.8,
    opacity: 0.9,
    inDirt: false,
    description: 'Petite plante verte avec premières feuilles',
    soilPattern: 'grass',
  },
  {
    index: 3,
    name: 'petite',
    emoji: '🌿',
    scale: 1.0,
    opacity: 1.0,
    inDirt: false,
    description: 'Plante en croissance active',
    soilPattern: 'grass',
  },
  {
    index: 4,
    name: 'moyenne',
    emoji: '🪴',
    scale: 1.2,
    opacity: 1.0,
    inDirt: false,
    description: 'Plante mature avec bon développement',
    soilPattern: 'grass',
  },
  {
    index: 5,
    name: 'prête',
    emoji: '🪴',
    scale: 1.4,
    opacity: 1.0,
    inDirt: false,
    description: 'Prête à repiquer ou récolter',
    soilPattern: 'grass',
    badge: 'PRÊTE!',
  },
];

// ── TERRAINS ───────────────────────────────────────────────────
// Référence: 01_terrain_tileset.jpg
export const TERRAIN_TILES = {
  // ── HERBE ────────────────────────────────────────────────────
  grass: {
    id: 'terrain_grass',
    name: 'Herbe',
    category: 'terrain',
    imageRef: '01_terrain_tileset.jpg',
    colors: {
      top: '#5aab2a',
      variants: ['#4e9e22', '#62b830', '#6ecf38', '#3d8a18'],
      sideLeft: '#4a9e20',
      sideRight: '#3d8a18',
    },
    walkable: true,
    speed: 1.0,
  },
  grassLight: {
    id: 'terrain_grass_light',
    name: 'Herbe claire',
    category: 'terrain',
    colors: {
      top: '#7bc844',
      variants: ['#8ed855', '#6ab833', '#5da822'],
      sideLeft: '#6ab833',
      sideRight: '#5da822',
    },
    walkable: true,
  },
  grassDark: {
    id: 'terrain_grass_dark',
    name: 'Herbe sombre',
    category: 'terrain',
    colors: {
      top: '#3d8a18',
      variants: ['#4d9820', '#2d7010', '#1d6008'],
      sideLeft: '#2d7010',
      sideRight: '#1d6008',
    },
    walkable: true,
  },
  grassSelected: {
    id: 'terrain_grass_selected',
    name: 'Herbe sélectionnée',
    category: 'terrain',
    colors: {
      top: '#72d63a',
      variants: ['#65c830', '#7ae044', '#88ee50'],
      sideLeft: '#62c830',
      sideRight: '#52b820',
    },
    walkable: true,
  },

  // ── TERRE / DIRT ─────────────────────────────────────────────
  dirt: {
    id: 'terrain_dirt',
    name: 'Terre',
    category: 'terrain',
    imageRef: '01_terrain_tileset.jpg',
    colors: {
      top: '#8b5e3c',
      variants: ['#9e6e48', '#7a5030', '#6a4228', '#b07848'],
      sideLeft: '#7a5030',
      sideRight: '#6a4228',
    },
    walkable: true,
    speed: 0.9,
  },
  dirtLeft: {
    id: 'terrain_dirt_left',
    name: 'Terre côté gauche',
    category: 'terrain',
    colors: {
      top: '#8b5e3c',
      variants: ['#9e6e48', '#7a5030', '#6a4228', '#b07848'],
      sideLeft: '#9e6e48',
      sideRight: '#7a5030',
    },
    walkable: true,
  },
  dirtRight: {
    id: 'terrain_dirt_right',
    name: 'Terre côté droit',
    category: 'terrain',
    colors: {
      top: '#6a4830',
      variants: ['#7a5838', '#5a3c24', '#4a3018', '#8a6040'],
      sideLeft: '#7a5838',
      sideRight: '#5a3c24',
    },
    walkable: true,
  },

  // ── TERRE CULTIVÉE ───────────────────────────────────────────
  soilSow: {
    id: 'terrain_soil_sow',
    name: 'Terre semis (stade 0)',
    category: 'terrain',
    imageRef: '03_growth_stages.jpg',
    colors: {
      top: '#7a5030',
      sillons: '#5a3820',
      seeds: '#8b5e3c',
    },
    walkable: true,
    growthStage: 0,
  },
  soilGerm: {
    id: 'terrain_soil_germ',
    name: 'Terre germination (stade 1)',
    category: 'terrain',
    imageRef: '03_growth_stages.jpg',
    colors: {
      top: '#8b5e3c',
      variants: ['#7a5030', '#9e6e48', '#6a4228'],
    },
    walkable: true,
    growthStage: 1,
  },

  // ── SABLE ────────────────────────────────────────────────────
  sand: {
    id: 'terrain_sand',
    name: 'Sable',
    category: 'terrain',
    colors: {
      top: '#d4b896',
      variants: ['#c4a886', '#e4c8a6', '#b49866'],
      sideLeft: '#c4a886',
      sideRight: '#b49866',
    },
    walkable: true,
    speed: 0.95,
  },

  // ── EAU ──────────────────────────────────────────────────────
  water: {
    id: 'terrain_water',
    name: 'Eau',
    category: 'terrain',
    colors: {
      top: '#4169E1',
      variants: ['#3159d1', '#5179f1', '#6199ff', '#2159c1'],
      sideLeft: '#3159d1',
      sideRight: '#2149b1',
    },
    walkable: false,
    animated: true,
  },
  waterPond: {
    id: 'terrain_water_pond',
    name: 'Eau bassin',
    category: 'terrain',
    colors: {
      top: '#2060a0',
      variants: ['#3070b0', '#1080c0', '#4090d0'],
      sideLeft: '#105090',
      sideRight: '#004080',
    },
    walkable: false,
  },
};

// ── ALLÉES / CHEMINS ───────────────────────────────────────────
// Référence: 01_terrain_tileset.jpg (section allées)
export const PATH_TILES = {
  // ── PIERRES ──────────────────────────────────────────────────
  stoneCobble: {
    id: 'path_stone_cobble',
    name: 'Pavés pierre',
    category: 'path',
    colors: {
      top: '#808080',
      stones: ['#707070', '#909090', '#606060', '#a0a0a0'],
      gaps: '#404040',
    },
    walkable: true,
    speed: 1.0,
    durability: 100,
  },
  stoneRough: {
    id: 'path_stone_rough',
    name: 'Pierre brute',
    category: 'path',
    colors: {
      top: '#9a9a8a',
      stones: ['#8a8a7a', '#aaaa9a', '#7a7a6a'],
      cracks: '#606050',
    },
    walkable: true,
    speed: 0.95,
  },
  stoneFlagstone: {
    id: 'path_stone_flagstone',
    name: 'Dalles pierre',
    category: 'path',
    colors: {
      top: '#9a9080',
      slabs: ['#8a8070', '#aaa090', '#7a7060'],
      gaps: '#606050',
    },
    walkable: true,
    speed: 1.0,
  },

  // ── GRAVIER ──────────────────────────────────────────────────
  gravelGrey: {
    id: 'path_gravel_grey',
    name: 'Gravier gris',
    category: 'path',
    colors: {
      top: '#808080',
      pebbles: ['#707070', '#909090', '#606060', '#a0a0a0'],
    },
    walkable: true,
    speed: 0.9,
  },
  gravelBrown: {
    id: 'path_gravel_brown',
    name: 'Gravier brun',
    category: 'path',
    colors: {
      top: '#8b7060',
      pebbles: ['#7b6050', '#9b8070', '#6b5040'],
    },
    walkable: true,
    speed: 0.9,
  },

  // ── BRIQUES ───────────────────────────────────────────────────
  brick: {
    id: 'path_brick',
    name: 'Briques',
    category: 'path',
    colors: {
      top: '#c04040',
      bricks: ['#b03030', '#d05050', '#a02020'],
      mortar: '#a0a0a0',
    },
    walkable: true,
    speed: 1.0,
  },

  // ── BOIS ──────────────────────────────────────────────────────
  // Référence: 02_wood_tileset.jpg
  woodPlank: {
    id: 'path_wood_plank',
    name: 'Planches bois',
    category: 'path',
    imageRef: '02_wood_tileset.jpg',
    colors: {
      top: '#c8a060',
      planks: ['#d4aa6a', '#b89050', '#a87840'],
      knots: '#a87840',
    },
    walkable: true,
    speed: 1.0,
    durability: 60,
  },
  woodPlankDark: {
    id: 'path_wood_plank_dark',
    name: 'Planches bois foncé',
    category: 'path',
    imageRef: '02_wood_tileset.jpg',
    colors: {
      top: '#a07840',
      planks: ['#b08848', '#907030', '#c09858'],
      knots: '#806020',
    },
    walkable: true,
    speed: 1.0,
  },

  // ── ARDOISE ──────────────────────────────────────────────────
  slate: {
    id: 'path_slate',
    name: 'Ardoise',
    category: 'path',
    colors: {
      top: '#4a5568',
      tiles: ['#3a4558', '#5a6578', '#2a3548'],
      gaps: '#1a2538',
    },
    walkable: true,
    speed: 1.0,
  },

  // ── BÉTON ─────────────────────────────────────────────────────
  concrete: {
    id: 'path_concrete',
    name: 'Béton',
    category: 'path',
    colors: {
      top: '#a0a0a0',
      cracks: ['#909090', '#b0b0b0', '#888888'],
    },
    walkable: true,
    speed: 1.0,
  },
};

// ── BOIS / STRUCTURES BOIS ─────────────────────────────────────
// Référence: 02_wood_tileset.jpg
export const WOOD_TILES = {
  // Planches
  plankLight: {
    id: 'wood_plank_light',
    name: 'Planche bois clair',
    category: 'wood',
    colors: {
      base: '#c8a060',
      lines: '#d4aa6a',
      knots: '#a87840',
    },
  },
  plankMedium: {
    id: 'wood_plank_medium',
    name: 'Planche bois moyen',
    category: 'wood',
    colors: {
      base: '#b08040',
      lines: '#c09050',
      knots: '#906030',
    },
  },
  plankDark: {
    id: 'wood_plank_dark',
    name: 'Planche bois foncé',
    category: 'wood',
    colors: {
      base: '#8b5a2b',
      lines: '#9b6a3b',
      knots: '#6b401b',
    },
  },

  // Poteaux
  postRound: {
    id: 'wood_post_round',
    name: 'Poteau rond',
    category: 'wood',
    colors: {
      base: '#8b4513',
      rings: ['#7a3510', '#9b5520'],
      bark: '#5a2500',
    },
  },
  postSquare: {
    id: 'wood_post_square',
    name: 'Poteau carré',
    category: 'wood',
    colors: {
      base: '#a0522d',
      highlight: '#b0623d',
      shadow: '#804220',
    },
  },

  // Clôtures
  fencePlank: {
    id: 'wood_fence_plank',
    name: 'Planche clôture',
    category: 'wood',
    colors: {
      base: '#c8a060',
      weathered: '#b89050',
    },
  },
  fencePost: {
    id: 'wood_fence_post',
    name: 'Poteau clôture',
    category: 'wood',
    colors: {
      base: '#8b4513',
      cap: '#a05520',
    },
  },
};

// ── STRUCTURES JARDIN ──────────────────────────────────────────
// Référence: 06_garden_structures.jpg, 04_greenhouse_structure.jpg
export const STRUCTURE_TILES = {
  // ── CABANONS ──────────────────────────────────────────────────
  // Référence: 06_garden_structures.jpg
  shedWood: {
    id: 'structure_shed_wood',
    name: 'Cabanon bois',
    category: 'structure',
    structureType: 'shed',
    imageRef: '06_garden_structures.jpg',
    colors: {
      walls: '#c8a060',
      roof: '#8b4513',
      door: '#8b4513',
      window: 'rgba(180,220,200,0.5)',
      foundation: '#606060',
    },
    dimensions: { width: 2, height: 2, depth: 1 },
    spanCells: 6,
  },
  shedWoodRustic: {
    id: 'structure_shed_rustic',
    name: 'Cabanon rustique',
    category: 'structure',
    structureType: 'shed',
    colors: {
      walls: '#9a7040',
      roof: '#5a4020',
      door: '#6a4020',
      foundation: '#505040',
    },
    dimensions: { width: 2, height: 2, depth: 1 },
    spanCells: 6,
  },
  shedMetal: {
    id: 'structure_shed_metal',
    name: 'Cabanon métal',
    category: 'structure',
    structureType: 'shed',
    colors: {
      walls: '#708090',
      roof: '#506070',
      door: '#607080',
      foundation: '#606060',
    },
    dimensions: { width: 2, height: 2, depth: 1 },
    spanCells: 6,
  },

  // ── SERRES ────────────────────────────────────────────────────
  // Référence: 04_greenhouse_structure.jpg
  greenhouse: {
    id: 'structure_greenhouse',
    name: 'Mini serre',
    category: 'structure',
    structureType: 'greenhouse',
    imageRef: '04_greenhouse_structure.jpg',
    colors: {
      frame: '#ffffff',
      glass: 'rgba(180,220,200,0.35)',
      glassTint: 'rgba(100,180,120,0.25)',
      roof: '#ffffff',
      foundation: '#808080',
    },
    dimensions: { width: 2, height: 2, depth: 1 },
    spanCells: 6,
    cols: 4,
    rows: 6,
  },
  greenhouseLarge: {
    id: 'structure_greenhouse_large',
    name: 'Grande serre',
    category: 'structure',
    structureType: 'greenhouse',
    colors: {
      frame: '#ffffff',
      glass: 'rgba(160,200,180,0.4)',
      roof: '#f0f0f0',
      foundation: '#707070',
    },
    dimensions: { width: 3, height: 2, depth: 1 },
    spanCells: 12,
  },

  // ── COMPOST ───────────────────────────────────────────────────
  compostBin: {
    id: 'structure_compost',
    name: 'Compostier',
    category: 'structure',
    structureType: 'compost',
    colors: {
      walls: '#5a4030',
      lid: '#4a3020',
      content: '#3a2818',
    },
    dimensions: { width: 1, height: 1, depth: 1 },
    spanCells: 2,
  },

  // ── CUVE EAU ──────────────────────────────────────────────────
  rainBarrel: {
    id: 'structure_rain_barrel',
    name: 'Cuve récupération',
    category: 'structure',
    structureType: 'barrel',
    colors: {
      barrel: '#5080a0',
      bands: '#404040',
      tap: '#c0c0c0',
      water: 'rgba(30,80,150,0.6)',
    },
    dimensions: { width: 1, height: 1, depth: 1 },
    spanCells: 1,
  },

  // ── BASSIN ────────────────────────────────────────────────────
  pond: {
    id: 'structure_pond',
    name: 'Bassin',
    category: 'structure',
    structureType: 'pond',
    colors: {
      water: '#4169E1',
      edge: '#606060',
      plants: '#228B22',
    },
    dimensions: { width: 2, height: 1, depth: 0.5 },
    spanCells: 4,
  },

  // ── CLÔTURES ──────────────────────────────────────────────────
  fenceWood: {
    id: 'structure_fence_wood',
    name: 'Clôture bois',
    category: 'structure',
    structureType: 'fence',
    colors: {
      posts: '#8b4513',
      planks: '#c8a060',
    },
    dimensions: { width: 1, height: 1, depth: 0.1 },
    spanCells: 1,
  },
};

// ── ARBRES ─────────────────────────────────────────────────────
// Référence: 05_garden_trees.jpg, 12_arbres_fruitiers.jpg
export const TREE_TILES = {
  // Arbres d'ornement
  oak: {
    id: 'tree_oak',
    name: 'Chêne',
    category: 'tree',
    imageRef: '05_garden_trees.jpg',
    emoji: '🌳',
    colors: {
      trunk: '#8b4513',
      leaves: '#228B22',
      variants: ['#1a6b1a', '#2a8a2a', '#3a9a3a'],
    },
    size: 'large',
    spanCells: 4,
  },
  maple: {
    id: 'tree_maple',
    name: 'Érable',
    category: 'tree',
    emoji: '🍁',
    colors: {
      trunk: '#8b4513',
      leaves: '#B8860B',
      variants: ['#a87600', '#c89620', '#986600'],
    },
    size: 'large',
    spanCells: 3,
  },
  pine: {
    id: 'tree_pine',
    name: 'Pin',
    category: 'tree',
    emoji: '🌲',
    colors: {
      trunk: '#654321',
      leaves: '#2E8B57',
      variants: ['#1e7b47', '#3e9b67', '#0e6b37'],
    },
    size: 'large',
    spanCells: 3,
  },
  birch: {
    id: 'tree_birch',
    name: 'Bouleau',
    category: 'tree',
    emoji: '白',
    colors: {
      trunk: '#f5f5dc',
      leaves: '#90EE90',
      variants: ['#80de80', '#a0fe90', '#70ce70'],
    },
    size: 'medium',
    spanCells: 2,
  },
  willow: {
    id: 'tree_willow',
    name: 'Saule',
    category: 'tree',
    emoji: '🌿',
    colors: {
      trunk: '#8b4513',
      leaves: '#6B8E23',
      variants: ['#5b7e13', '#7b9e33', '#4b6e03'],
    },
    size: 'large',
    spanCells: 4,
  },

  // Arbres fruitiers
  // Référence: 12_arbres_fruitiers.jpg
  apple: {
    id: 'fruit_apple',
    name: 'Pommier',
    category: 'fruit_tree',
    imageRef: '12_arbres_fruitiers.jpg',
    emoji: '🍎',
    colors: {
      trunk: '#8b4513',
      leaves: '#228B22',
      fruit: '#DC143C',
    },
    size: 'medium',
    spanCells: 3,
    production: '50-100kg/an',
  },
  pear: {
    id: 'fruit_pear',
    name: 'Poirier',
    category: 'fruit_tree',
    emoji: '🍐',
    colors: {
      trunk: '#8b4513',
      leaves: '#228B22',
      fruit: '#9ACD32',
    },
    size: 'medium',
    spanCells: 3,
    production: '30-80kg/an',
  },
  cherry: {
    id: 'fruit_cherry',
    name: 'Cerisier',
    category: 'fruit_tree',
    emoji: '🍒',
    colors: {
      trunk: '#8b4513',
      leaves: '#228B22',
      fruit: '#FF6347',
    },
    size: 'medium',
    spanCells: 3,
    production: '20-50kg/an',
  },
  plum: {
    id: 'fruit_plum',
    name: 'Prunier',
    category: 'fruit_tree',
    emoji: '🫐',
    colors: {
      trunk: '#8b4513',
      leaves: '#228B22',
      fruit: '#8B008B',
    },
    size: 'medium',
    spanCells: 3,
    production: '30-70kg/an',
  },
  peach: {
    id: 'fruit_peach',
    name: 'Pêcher',
    category: 'fruit_tree',
    emoji: '🍑',
    colors: {
      trunk: '#8b4513',
      leaves: '#228B22',
      fruit: '#FFB6C1',
    },
    size: 'medium',
    spanCells: 3,
    production: '25-60kg/an',
  },
  fig: {
    id: 'fruit_fig',
    name: 'Figuier',
    category: 'fruit_tree',
    emoji: '📗',
    colors: {
      trunk: '#8b4513',
      leaves: '#228B22',
      fruit: '#8B4513',
    },
    size: 'medium',
    spanCells: 2,
    production: '15-30kg/an',
  },
  walnut: {
    id: 'fruit_walnut',
    name: 'Noyer',
    category: 'fruit_tree',
    emoji: '🌰',
    colors: {
      trunk: '#654321',
      leaves: '#228B22',
      fruit: '#8B4513',
    },
    size: 'large',
    spanCells: 5,
    production: '30-100kg/an',
  },
  hazelnut: {
    id: 'fruit_hazelnut',
    name: 'Noisetier',
    category: 'fruit_tree',
    emoji: '🌰',
    colors: {
      trunk: '#8b4513',
      leaves: '#228B22',
      fruit: '#D2691E',
    },
    size: 'medium',
    spanCells: 2,
    production: '10-25kg/an',
  },
};

// ── LÉGUMES ────────────────────────────────────────────────────
// Référence: 07_vegetable_plants.jpg, 10_legumes_batch1.jpg, 11_legumes_batch2.jpg
// Stades: stades-jardin/J01-J10, stades-serre/S01-S10
export const VEGETABLE_TILES = {
  // Tomates
  // Référence: stades-jardin/J01_tomates1.jpg, stades-serre/S01_tomates1.jpg
  tomato: {
    id: 'veg_tomato',
    name: 'Tomate',
    category: 'vegetable',
    imageRef: '07_vegetable_plants.jpg',
    stagesJardin: 'stades-jardin/J01_tomates1.jpg',
    stagesSerre: 'stades-serre/S01_tomates1.jpg',
    emoji: '🍅',
    colors: {
      plant: '#228B22',
      fruit: '#DC143C',
      stages: ['#8b5e3c', '#4a9e20', '#2e7d32', '#388e3c', '#43a047', '#66bb6a'],
    },
    family: 'Solanacées',
    daysToMaturity: 60,
    spacing: { between: 50, row: 70 },
  },

  // Solanacées
  // Référence: stades-jardin/J02_solanacees.jpg, stades-serre/S02_solanacees.jpg
  pepper: {
    id: 'veg_pepper',
    name: 'Poivron',
    category: 'vegetable',
    stagesJardin: 'stades-jardin/J02_solanacees.jpg',
    stagesSerre: 'stades-serre/S02_solanacees.jpg',
    emoji: '🫑',
    colors: {
      plant: '#228B22',
      fruit: '#FFD700',
      stages: ['#8b5e3c', '#4a9e20', '#2e7d32', '#388e3c', '#43a047', '#66bb6a'],
    },
    family: 'Solanacées',
    daysToMaturity: 70,
  },
  eggplant: {
    id: 'veg_eggplant',
    name: 'Aubergine',
    category: 'vegetable',
    stagesJardin: 'stades-jardin/J02_solanacees.jpg',
    stagesSerre: 'stades-serre/S02_solanacees.jpg',
    emoji: '🍆',
    colors: {
      plant: '#228B22',
      fruit: '#8B008B',
    },
    family: 'Solanacées',
    daysToMaturity: 80,
  },

  // Courges
  // Référence: stades-jardin/J03_courgettes_melon_mais.jpg
  zucchini: {
    id: 'veg_zucchini',
    name: 'Courgette',
    category: 'vegetable',
    stagesJardin: 'stades-jardin/J03_courgettes_melon_mais.jpg',
    stagesSerre: 'stades-serre/S03_courgettes_melon_mais.jpg',
    emoji: '🥒',
    colors: {
      plant: '#228B22',
      fruit: '#3CB371',
    },
    family: 'Cucurbitacées',
    daysToMaturity: 50,
    spacing: { between: 100, row: 100 },
  },
  melon: {
    id: 'veg_melon',
    name: 'Melon',
    category: 'vegetable',
    stagesJardin: 'stades-jardin/J03_courgettes_melon_mais.jpg',
    stagesSerre: 'stades-serre/S03_courgettes_melon_mais.jpg',
    emoji: '🍈',
    colors: {
      plant: '#228B22',
      fruit: '#98FB98',
    },
    family: 'Cucurbitacées',
    daysToMaturity: 80,
  },

  // Haricots et Alliacées
  // Référence: stades-jardin/J04_haricots_poireau_oignon.jpg
  bean: {
    id: 'veg_bean',
    name: 'Haricot',
    category: 'vegetable',
    stagesJardin: 'stades-jardin/J04_haricots_poireau_oignon.jpg',
    stagesSerre: 'stades-serre/S04_haricots_poireau_oignon.jpg',
    emoji: '🫘',
    colors: {
      plant: '#228B22',
      fruit: '#8B4513',
    },
    family: 'Fabacées',
    daysToMaturity: 50,
  },
  leek: {
    id: 'veg_leek',
    name: 'Poireau',
    category: 'vegetable',
    stagesJardin: 'stades-jardin/J04_haricots_poireau_oignon.jpg',
    stagesSerre: 'stades-serre/S04_haricots_poireau_oignon.jpg',
    emoji: '🥬',
    colors: {
      plant: '#228B22',
      stem: '#F0FFF0',
    },
    family: 'Alliacées',
    daysToMaturity: 120,
  },
  onion: {
    id: 'veg_onion',
    name: 'Oignon',
    category: 'vegetable',
    stagesJardin: 'stades-jardin/J04_haricots_poireau_oignon.jpg',
    stagesSerre: 'stades-serre/S04_haricots_poireau_oignon.jpg',
    emoji: '🧅',
    colors: {
      plant: '#228B22',
      bulb: '#FFD700',
    },
    family: 'Alliacées',
    daysToMaturity: 90,
  },

  // Racines
  // Référence: stades-jardin/J05_ail_carottes_radis.jpg
  garlic: {
    id: 'veg_garlic',
    name: 'Ail',
    category: 'vegetable',
    stagesJardin: 'stades-jardin/J05_ail_carottes_radis.jpg',
    stagesSerre: 'stades-serre/S05_ail_carottes_radis.jpg',
    emoji: '🧄',
    colors: {
      plant: '#228B22',
      bulb: '#F5F5DC',
    },
    family: 'Alliacées',
    daysToMaturity: 180,
  },
  carrot: {
    id: 'veg_carrot',
    name: 'Carotte',
    category: 'vegetable',
    stagesJardin: 'stades-jardin/J05_ail_carottes_radis.jpg',
    stagesSerre: 'stades-serre/S05_ail_carottes_radis.jpg',
    emoji: '🥕',
    colors: {
      plant: '#228B22',
      root: '#FF8C00',
    },
    family: 'Apiacées',
    daysToMaturity: 70,
  },
  radish: {
    id: 'veg_radish',
    name: 'Radis',
    category: 'vegetable',
    stagesJardin: 'stades-jardin/J05_ail_carottes_radis.jpg',
    stagesSerre: 'stades-serre/S05_ail_carottes_radis.jpg',
    emoji: '🥗',
    colors: {
      plant: '#228B22',
      root: '#DC143C',
    },
    family: 'Brassicacées',
    daysToMaturity: 25,
  },

  // Feuilles et Racines
  // Référence: stades-jardin/J06_racines_feuilles.jpg
  spinach: {
    id: 'veg_spinach',
    name: 'Épinard',
    category: 'vegetable',
    stagesJardin: 'stades-jardin/J06_racines_feuilles.jpg',
    stagesSerre: 'stades-serre/S06_racines_feuilles1.jpg',
    emoji: '🥬',
    colors: {
      plant: '#228B22',
    },
    family: 'Amaranthacées',
    daysToMaturity: 40,
  },
  beetroot: {
    id: 'veg_beetroot',
    name: 'Betterave',
    category: 'vegetable',
    stagesJardin: 'stades-jardin/J06_racines_feuilles.jpg',
    stagesSerre: 'stades-serre/S06_racines_feuilles1.jpg',
    emoji: '🥗',
    colors: {
      plant: '#228B22',
      root: '#8B0000',
    },
    family: 'Amaranthacées',
    daysToMaturity: 60,
  },

  // Salades et Choux
  // Référence: stades-jardin/J07_salades_chou.jpg
  lettuce: {
    id: 'veg_lettuce',
    name: 'Laitue',
    category: 'vegetable',
    stagesJardin: 'stades-jardin/J07_salades_chou.jpg',
    stagesSerre: 'stades-serre/S07_salades_chou.jpg',
    emoji: '🥬',
    colors: {
      plant: '#90EE90',
      heart: '#98FB98',
    },
    family: 'Astéracées',
    daysToMaturity: 45,
  },
  cabbage: {
    id: 'veg_cabbage',
    name: 'Chou',
    category: 'vegetable',
    stagesJardin: 'stades-jardin/J07_salades_chou.jpg',
    stagesSerre: 'stades-serre/S07_salades_chou.jpg',
    emoji: '🥬',
    colors: {
      plant: '#228B22',
      head: '#90EE90',
    },
    family: 'Brassicacées',
    daysToMaturity: 80,
  },

  // Brocoli et Fraises
  // Référence: stades-jardin/J08_brocoli_fraises_basilic.jpg
  broccoli: {
    id: 'veg_broccoli',
    name: 'Brocoli',
    category: 'vegetable',
    stagesJardin: 'stades-jardin/J08_brocoli_fraises_basilic.jpg',
    stagesSerre: 'stades-serre/S08_brocoli_fraises_basilic.jpg',
    emoji: '🥦',
    colors: {
      plant: '#228B22',
      head: '#32CD32',
    },
    family: 'Brassicacées',
    daysToMaturity: 70,
  },

  // Herbes
  // Référence: stades-jardin/J09_herbes1.jpg, J10_herbes2.jpg
  basil: {
    id: 'herb_basil',
    name: 'Basilic',
    category: 'herb',
    stagesJardin: 'stades-jardin/J09_herbes1.jpg',
    stagesSerre: 'stades-serre/S09_herbes1.jpg',
    emoji: '🌿',
    colors: {
      plant: '#228B22',
    },
    family: 'Lamiacées',
    daysToMaturity: 30,
  },
  parsley: {
    id: 'herb_parsley',
    name: 'Persil',
    category: 'herb',
    stagesJardin: 'stades-jardin/J10_herbes2.jpg',
    stagesSerre: 'stades-serre/S10_herbes2.jpg',
    emoji: '🌿',
    colors: {
      plant: '#228B22',
    },
    family: 'Apiacées',
    daysToMaturity: 60,
  },
};

// ── PETITS FRUITS ──────────────────────────────────────────────
// Référence: 08_small_fruits.jpg
export const FRUIT_TILES = {
  // Référence: 08_small_fruits.jpg
  strawberry: {
    id: 'fruit_strawberry',
    name: 'Fraisier',
    category: 'small_fruit',
    imageRef: '08_small_fruits.jpg',
    emoji: '🍓',
    colors: {
      plant: '#228B22',
      fruit: '#FF4444',
      flower: '#FFFFFF',
    },
    family: 'Rosacées',
    daysToMaturity: 60,
    production: '0.5-1kg/m²',
  },
  raspberry: {
    id: 'fruit_raspberry',
    name: 'Framboisier',
    category: 'small_fruit',
    emoji: '🍇',
    colors: {
      plant: '#228B22',
      fruit: '#DC143C',
    },
    production: '2-4kg/arbuste',
  },
  blueberry: {
    id: 'fruit_blueberry',
    name: 'Myrtillier',
    category: 'small_fruit',
    emoji: '🫐',
    colors: {
      plant: '#228B22',
      fruit: '#4169E1',
    },
    production: '3-8kg/arbuste',
  },
  currant: {
    id: 'fruit_currant',
    name: 'Cassissier',
    category: 'small_fruit',
    emoji: '⚫',
    colors: {
      plant: '#228B22',
      fruit: '#2F4F4F',
    },
    production: '3-5kg/arbuste',
  },
  blackberry: {
    id: 'fruit_blackberry',
    name: 'Mûrier',
    category: 'small_fruit',
    emoji: '🫐',
    colors: {
      plant: '#228B22',
      fruit: '#4B0082',
    },
    production: '3-6kg/arbuste',
  },
  gooseberry: {
    id: 'fruit_gooseberry',
    name: 'Groseillier',
    category: 'small_fruit',
    emoji: '🟢',
    colors: {
      plant: '#228B22',
      fruit: '#32CD32',
    },
    production: '3-6kg/arbuste',
  },
  grape: {
    id: 'fruit_grape',
    name: 'Vigne',
    category: 'small_fruit',
    emoji: '🍇',
    colors: {
      plant: '#228B22',
      fruit: '#6B8E23',
    },
    production: '5-15kg/pied',
  },
};

// ── DÉCORATIONS ────────────────────────────────────────────────
export const DECOR_TILES = {
  // Bordures
  borderWood: {
    id: 'decor_border_wood',
    name: 'Bordure bois',
    category: 'border',
    colors: {
      plank: '#8b4513',
      stake: '#5a3010',
    },
    height: 0.3,
  },
  borderStone: {
    id: 'decor_border_stone',
    name: 'Bordure pierre',
    category: 'border',
    colors: {
      stones: '#808080',
      mortar: '#a0a0a0',
    },
    height: 0.25,
  },
  borderBrick: {
    id: 'decor_border_brick',
    name: 'Bordure brique',
    category: 'border',
    colors: {
      bricks: '#c04040',
      mortar: '#a0a0a0',
    },
    height: 0.2,
  },

  // Pots
  potTerracotta: {
    id: 'decor_pot_terracotta',
    name: 'Pot terre cuite',
    category: 'pot',
    colors: {
      body: '#c06040',
      rim: '#d08060',
      soil: '#5a3820',
    },
  },
  potCeramic: {
    id: 'decor_pot_ceramic',
    name: 'Pot céramique',
    category: 'pot',
    colors: {
      body: '#e0e0e0',
      glaze: '#4080c0',
      soil: '#5a3820',
    },
  },
  potWood: {
    id: 'decor_pot_wood',
    name: 'Bac bois',
    category: 'pot',
    colors: {
      planks: '#c8a060',
      corners: '#606060',
      soil: '#5a3820',
    },
  },
};

// ── FONCTIONS UTILITAIRES ──────────────────────────────────────

/**
 * Récupère les informations d'un stade de croissance
 */
export function getGrowthStage(index) {
  return GROWTH_STAGES[index] || GROWTH_STAGES[0];
}

/**
 * Calcule le stade de croissance basé sur le temps
 */
export function calculateGrowthStage(plantedDate, daysToMaturity) {
  if (!plantedDate) return GROWTH_STAGES[0];
  const elapsed = (Date.now() - new Date(plantedDate).getTime()) / (1000 * 60 * 60 * 24);
  const progress = Math.min(elapsed / daysToMaturity, 1);
  const stageIndex = Math.min(Math.floor(progress * (GROWTH_STAGES.length - 1)), GROWTH_STAGES.length - 1);
  return GROWTH_STAGES[stageIndex];
}

/**
 * Récupère les couleurs d'un terrain
 */
export function getTerrainColors(terrainId) {
  return TERRAIN_TILES[terrainId]?.colors || TERRAIN_TILES.grass.colors;
}

/**
 * Récupère les couleurs d'une structure
 */
export function getStructureColors(structureType) {
  const tile = Object.values(STRUCTURE_TILES).find(t => t.structureType === structureType);
  return tile?.colors || null;
}

/**
 * Récupère les infos d'un légume
 */
export function getVegetableInfo(vegId) {
  return VEGETABLE_TILES[vegId] || null;
}

/**
 * Récupère le chemin de l'image de stade pour un légume
 */
export function getStageImagePath(vegId, location = 'jardin') {
  const veg = VEGETABLE_TILES[vegId];
  if (!veg) return null;
  return location === 'serre' ? veg.stagesSerre : veg.stagesJardin;
}

// ── FONCTION UTILITAIRE ─────────────────────────────────────────
/**
 * Retourne le chemin de l'image approprié selon le format demandé
 * @param {string} key - Clé de l'image (ex: 'terrain', 'vegetablesSq')
 * @param {boolean} useSquare - Si true, retourne la version carrée
 */
export function getImagePath(key, useSquare = false) {
  if (useSquare && TILESET_IMAGES[key + 'Sq']) {
    return TILESET_IMAGES[key + 'Sq'];
  }
  return TILESET_IMAGES[key];
}

// ── EXPORT COMPLET ──────────────────────────────────────────────
export const FULL_TILESET = {
  images: TILESET_IMAGES,
  imageDims: IMAGE_DIMS,
  dims: TILE_DIMS,
  growthStages: GROWTH_STAGES,
  terrain: TERRAIN_TILES,
  paths: PATH_TILES,
  wood: WOOD_TILES,
  structures: STRUCTURE_TILES,
  trees: TREE_TILES,
  vegetables: VEGETABLE_TILES,
  fruits: FRUIT_TILES,
  decor: DECOR_TILES,
};

export default FULL_TILESET;
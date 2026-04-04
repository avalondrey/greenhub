// ─── GARDEN OBJECTS DATABASE ──────────────────────────────────────────────────
// Objets du jardin réel : arbres, haies, arbustes, petits fruits, cabanons, serres

export const GARDEN_OBJECTS_DB = {
  trees: [
    { id: 'tree_oak',     name: 'Chêne',       emoji: '🌳', type: 'tree',         color: '#228B22', size: 'large',   spanCells: 4, description: 'Grand arbre d\'ombre',          fruit: null },
    { id: 'tree_maple',   name: 'Érable',      emoji: '🍁', type: 'tree',         color: '#B8860B', size: 'large',   spanCells: 3, description: 'Bel arbre ornemental',         fruit: null },
    { id: 'tree_pine',    name: 'Pin',         emoji: '🌲', type: 'tree',         color: '#2E8B57', size: 'large',   spanCells: 3, description: 'Conifère persistante',          fruit: null },
    { id: 'tree_birch',   name: 'Bouleau',     emoji: '白', type: 'tree',         color: '#90EE90', size: 'medium',  spanCells: 2, description: 'Arbre élégant au tronc blanc',   fruit: null },
    { id: 'tree_willow',  name: 'Saule',       emoji: '🌿', type: 'tree',         color: '#6B8E23', size: 'large',   spanCells: 4, description: 'Arbre pleureur élégant',         fruit: null },
  ],
  fruit_trees: [
    { id: 'apple_tree',   name: 'Pommier',     emoji: '🍎', type: 'fruit_tree',   color: '#DC143C', size: 'medium',  spanCells: 3, description: 'Pommes rouges ou vertes',        fruit: '🍎', production: '50-100kg/an' },
    { id: 'pear_tree',   name: 'Poirier',     emoji: '🍐', type: 'fruit_tree',   color: '#9ACD32', size: 'medium',  spanCells: 3, description: 'Poires juteuses',                 fruit: '🍐', production: '30-80kg/an' },
    { id: 'cherry_tree', name: 'Cerisier',    emoji: '🍒', type: 'fruit_tree',   color: '#FF6347', size: 'medium',  spanCells: 3, description: 'Cerises douces',                  fruit: '🍒', production: '20-50kg/an' },
    { id: 'plum_tree',   name: 'Prunier',     emoji: '🫐', type: 'fruit_tree',   color: '#8B008B', size: 'medium',  spanCells: 3, description: 'Prunes violettes',                 fruit: '🫐', production: '30-70kg/an' },
    { id: 'peach_tree',  name: 'Pêchers',     emoji: '🍑', type: 'fruit_tree',   color: '#FFB6C1', size: 'medium',  spanCells: 3, description: 'Pêches veloutées',               fruit: '🍑', production: '25-60kg/an' },
    { id: 'fig_tree',    name: 'Figuer',       emoji: '📗', type: 'fruit_tree',   color: '#8B4513', size: 'medium',  spanCells: 2, description: 'Figues noires ou vertes',          fruit: '📗', production: '15-30kg/an' },
    { id: 'walnut_tree', name: 'Noyer',        emoji: '🌰', type: 'fruit_tree',   color: '#8B4513', size: 'large',   spanCells: 5, description: 'Noix fraîches',                   fruit: '🌰', production: '30-100kg/an' },
    { id: 'hazelnut_tree', name: 'Noisetier', emoji: '🌰', type: 'fruit_tree',   color: '#D2691E', size: 'medium',  spanCells: 2, description: 'Noisettes',                      fruit: '🌰', production: '10-25kg/an' },
  ],
  hedges: [
    { id: 'hedge_beech',     name: 'Hêtre',       emoji: '🌲', type: 'hedge', color: '#228B22', size: 'long', spanCells: 1, height: 'high',       description: 'Hedge persistante élégante' },
    { id: 'hedge_yew',       name: 'If',           emoji: '🌲', type: 'hedge', color: '#006400', size: 'long', spanCells: 1, height: 'medium',    description: 'Idéal pour topiaire' },
    { id: 'hedge_cypress',   name: 'Cyprès',      emoji: '🌲', type: 'hedge', color: '#2E8B57', size: 'long', spanCells: 1, height: 'very_high', description: 'Cyprès columnaire' },
    { id: 'hedge_ivy',       name: 'Lierre',       emoji: '🌿', type: 'hedge', color: '#355E3B', size: 'long', spanCells: 1, height: 'low',       description: 'Lierre grimpant' },
    { id: 'hedge_roses',     name: 'Rosiers',     emoji: '🌹', type: 'hedge', color: '#DC143C', size: 'long', spanCells: 1, height: 'medium',    description: 'Hedge fleurie et parfumée' },
    { id: 'hedge_lavender',  name: 'Lavande',     emoji: '💜', type: 'hedge', color: '#9370DB', size: 'long', spanCells: 1, height: 'low',       description: 'Fragrance apaisante' },
  ],
  shrubs: [
    { id: 'shrub_hydrangea',      name: 'Hortensia',     emoji: '💐', type: 'shrub', color: '#4169E1', size: 'small',  spanCells: 1, description: 'Fleurs bleues ou roses' },
    { id: 'shrub_azalea',         name: 'Azalée',        emoji: '🌸', type: 'shrub', color: '#FF69B4', size: 'small',  spanCells: 1, description: 'Fleurs colorées printanières' },
    { id: 'shrub_rhododendron',   name: 'Rhododendron', emoji: '🌺', type: 'shrub', color: '#FF1493', size: 'medium', spanCells: 2, description: 'Grand arbuste fleuri' },
    { id: 'shrub_box',            name: 'Buis',          emoji: '🌿', type: 'shrub', color: '#355E3B', size: 'small',  spanCells: 1, description: 'Parfait pour topiaire' },
    { id: 'shrub_forsythia',      name: 'Forsythia',     emoji: '🌼', type: 'shrub', color: '#FFD700', size: 'small',  spanCells: 1, description: 'Fleurs jaunes printanières' },
    { id: 'shrub_weigela',        name: 'Weigela',       emoji: '🌸', type: 'shrub', color: '#FF6347', size: 'small',  spanCells: 1, description: 'Fleurs tubulaires colorées' },
  ],
  small_fruits: [
    { id: 'currant',    name: 'Cassis',         emoji: '⚫', type: 'small_fruit', color: '#2F4F4F', size: 'small',   spanCells: 1, description: 'Baies noires acidulées',     fruit: '⚫', production: '3-5kg/arbuste' },
    { id: 'raspberry',  name: 'Framboisier',    emoji: '🍇', type: 'small_fruit', color: '#DC143C', size: 'small',   spanCells: 1, description: 'Framboises délicates',       fruit: '🍇', production: '2-4kg/arbuste' },
    { id: 'blackberry', name: 'Mûrier',         emoji: '🫐', type: 'small_fruit', color: '#4B0082', size: 'small',   spanCells: 1, description: 'Mûres sauvages',              fruit: '🫐', production: '3-6kg/arbuste' },
    { id: 'blueberry',  name: 'Myrtillier',     emoji: '🫐', type: 'small_fruit', color: '#4169E1', size: 'small',   spanCells: 1, description: 'Myrtilles santé',             fruit: '🫐', production: '3-8kg/arbuste' },
    { id: 'gooseberry', name: 'Groseillier',    emoji: '🟢', type: 'small_fruit', color: '#32CD32', size: 'small',   spanCells: 1, description: 'Groseilles vertes ou rouges', fruit: '🟢', production: '3-6kg/arbuste' },
    { id: 'strawberry', name: 'Fraisier',       emoji: '🍓', type: 'small_fruit', color: '#FF4444', size: 'small',   spanCells: 1, description: 'Fraises du jardin',           fruit: '🍓', production: '0.5-1kg/m²' },
    { id: 'grape',      name: 'Vigne',          emoji: '🍇', type: 'small_fruit', color: '#6B8E23', size: 'medium',  spanCells: 1, description: 'Raisins de table',              fruit: '🍇', production: '5-15kg/plant' },
    { id: 'kiwi',       name: 'Kiwi',           emoji: '🥝', type: 'small_fruit', color: '#8B4513', size: 'medium',  spanCells: 1, description: 'Kiwi autofertile',             fruit: '🥝', production: '10-30kg/plant' },
  ],
  structures: [
    { id: 'shed_wood',            name: 'Cabanon Bois',          emoji: '🏠', type: 'structure', structureType: 'shed',               color: '#8B4513', spanCells: 6,  description: 'Cabanon en bois naturel',          width: 2, height: 2 },
    { id: 'shed_grey',            name: 'Cabanon Métal',         emoji: '🏚️', type: 'structure', structureType: 'shed',               color: '#696969', spanCells: 6,  description: 'Cabanon en tôle grise',            width: 2, height: 2 },
    { id: 'greenhouse_wood',      name: 'Serre en Bois',         emoji: '🪵', type: 'structure', structureType: 'wooden_greenhouse', color: '#A0522D', spanCells: 12, description: 'Serre en bois avec plan de travail', width: 3, height: 2, hasWorkbench: true, shelves: 4, miniSerreSlots: 6 },
    { id: 'compost',              name: 'Compostier',             emoji: '🟫', type: 'structure', structureType: 'compost',            color: '#654321', spanCells: 2,  description: 'Bac à compost',                    width: 1, height: 1 },
    { id: 'rain_barrel',          name: 'Cuve de Récupération',   emoji: '🪣', type: 'structure', structureType: 'barrel',            color: '#708090', spanCells: 1,  description: 'Récupération d\'eau de pluie',    width: 1, height: 1 },
  ],
};

export const ALL_GARDEN_OBJECTS = [
  ...GARDEN_OBJECTS_DB.trees,
  ...GARDEN_OBJECTS_DB.fruit_trees,
  ...GARDEN_OBJECTS_DB.hedges,
  ...GARDEN_OBJECTS_DB.shrubs,
  ...GARDEN_OBJECTS_DB.small_fruits,
  ...GARDEN_OBJECTS_DB.structures,
];

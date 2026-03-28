// ============================================================
// GREENHUB ISOMETRIC TILESET DE RÉFÉRENCE
// ============================================================
// Ce fichier centralise tous les patterns SVG utilisés
// dans le rendu isométrique des serres et jardins.
// Pour ajouter une nouvelle texture : déclarer ici et
// l'utiliser dans IsoDefs ou directement dans les composants.
//
// Dimensions de base :
//   TW = 64 (tile width)
//   TH = 32 (tile height)
//   TD = 22 (tile depth)
// ============================================================

// ── TILES SOL / TERRAIN ──────────────────────────────────────

export const TILESET_TERRAIN = {
  // Herbe normale - tuile verte pixelisee avec variations
  grass: {
    id: 'isoGrassPat',
    desc: 'Herbe pixelisee avec variations de vert',
    base: '#5aab2a',
    variants: ['#4e9e22', '#62b830', '#6ecf38', '#3d8a18'],
  },

  // Herbe selectionnee - plus lumineuse
  grassSelected: {
    id: 'isoGrassSelPat',
    desc: 'Herbe pour case selectionnee',
    base: '#72d63a',
  },

  // Dirt gauche (face laterale gauche)
  dirtLeft: {
    id: 'isoDirtLPat',
    desc: 'Terre cÃ´te gauche avec cailloux',
    base: '#8b5e3c',
    variants: ['#9e6e48', '#7a5030', '#6a4228', '#b07848'],
  },

  // Dirt droit (face laterale droite - plus sombre)
  dirtRight: {
    id: 'isoDirtRPat',
    desc: 'Terre cÃ´te droit plus sombre',
    base: '#6a4830',
    variants: ['#7a5838', '#5a3c24', '#4a3018', '#8a6040'],
  },

  // Terre avec sillons de semis (stade 0 - graines)
  soilSow: {
    id: 'isoSoilSowPat',
    desc: 'Terre avec sillons et graines pour semis',
    base: '#7a5030',
    sillons: '#5a3820',
    seeds: '#8b5e3c',
    width: 12,
    height: 12,
  },

  // Terre preparee sans sillons (stade 1 - germination)
  soilGerm: {
    id: 'isoSoilGermPat',
    desc: 'Terre preparee pour germination',
    base: '#8b5e3c',
    variants: ['#7a5030', '#9e6e48', '#6a4228'],
    width: 10,
    height: 10,
  },
};

// ── TILES BOIS ────────────────────────────────────────────────

export const TILESET_WOOD = {
  // Planche bois clair
  plank: {
    id: 'isoPlankPat',
    desc: 'Planche bois avec noeuds',
    base: '#c8a060',
    lines: '#d4aa6a',
    knots: '#a87840',
  },

  // Planche bois sombre
  plankDark: {
    id: 'isoPlankDarkPat',
    desc: 'Planche bois foncee',
    base: '#a07840',
    lines: '#b08848',
  },
};

// ── COULEURS DE DÉVELOPPEMENT (dev only) ──────────────────────
// Garder comme reference pour debug
export const DEV_COLORS = {
  tileOutline: '#2d6e10',
  tileOutlineSelected: '#ffffff',
  dirtOutline: '#3d2010',
};

// ── GROWTH STAGES - STADES DE CROISSANCE ─────────────────────
// Les 6 stades de croissance des plantes
//
//  0 - GRAINE 🟤 : terre avec sillons, graine visible
//  1 - GERMINATION 🌱 : terre preparee, pousse sort
//  2 - LEVÉE 🌿 : petite plante verte
//  3 - PETITE 🌿 : plante plus grande
//  4 - MOYENNE 🪴 : plante mature
//  5 - PRÊTE 🪴 : prete a repiquer, badge rouge
//
export const GROWTH_STAGES_TILESET = [
  {
    index: 0,
    name: 'graine',
    emoji: '🟤',
    scale: 0.4,
    opacity: 0.6,
    soilTile: 'soilSow',       // Pattern SVG a utiliser
    soilTint: '#8b5e3c',       // Teinte sur le haut du tile
    glowColor: '#8b5e3c',
    inDirt: true,              // Plante dans la terre
  },
  {
    index: 1,
    name: 'germination',
    emoji: '🌱',
    scale: 0.6,
    opacity: 0.8,
    soilTile: 'soilGerm',
    soilTint: '#4a9e20',
    glowColor: '#4a9e20',
    inDirt: false,
  },
  {
    index: 2,
    name: 'levée',
    emoji: '🌿',
    scale: 0.8,
    opacity: 0.9,
    soilTile: 'grass',
    soilTint: '#2e7d32',
    glowColor: '#2e7d32',
    inDirt: false,
  },
  {
    index: 3,
    name: 'petite',
    emoji: '🌿',
    scale: 1.0,
    opacity: 1.0,
    soilTile: 'grass',
    soilTint: '#388e3c',
    glowColor: '#388e3c',
    inDirt: false,
  },
  {
    index: 4,
    name: 'moyenne',
    emoji: '🪴',
    scale: 1.2,
    opacity: 1.0,
    soilTile: 'grass',
    soilTint: '#43a047',
    glowColor: '#43a047',
    inDirt: false,
  },
  {
    index: 5,
    name: 'prête',
    emoji: '🪴',
    scale: 1.4,
    opacity: 1.0,
    soilTile: 'grass',
    soilTint: '#66bb6a',
    glowColor: '#66bb6a',
    inDirt: false,
    badge: true,              // Badge "PRÊTE!" rouge
  },
];

// ── STRUCTURE serre LIDL ──────────────────────────────────────
// Dimensions relatives a la grille ISO
//
// Grille : 4 colonnes × 6 rangees (24 alveoles)
//
export const SERRE_STRUCTURE = {
  cols: 4,
  rows: 6,
  tileW: TW,  // 64
  tileH: TH,  // 32
  tileD: TD,  // 22
};

// ── COMMENT AJOUTER UNE NOUVELLE TEXTURE ─────────────────────
//
//  1. Ajouter le pattern dans IsoDefs (src/App.jsx) :
//     <pattern id="monPattern" x="0" y="0" width="N" height="M" patternUnits="userSpaceOnUse">
//       <rect width="N" height="M" fill="COLOR"/>
//       ... elements de texture ...
//     </pattern>
//
//  2. Declarer dans TILESET_TERRAIN ou TILESET_WOOD :
//     maTexture: { id: 'monPattern', desc: '...', ... }
//
//  3. Utiliser dans le composant :
//     <polygon points={...} fill="url(#monPattern)" />
//
// ──────────────────────────────────────────────────────────────

// ── Dimensions tiles (exportees pour reference) ────────────────
export const TW = 64;
export const TH = 32;
export const TD = 22;

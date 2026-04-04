// ─── BADGES ──────────────────────────────────────────────────────────────────

/**
 * @param {number} totalPlants
 * @param {number} totalYield
 * @param {number} streak
 * @param {number} badges
 * @returns {Array<{ id: string, label: string, desc: string, earned: boolean }>}
 */
export function getBadgesList(totalPlants, totalYield, streak, badges) {
  return [
    { id: 'first_plant',  label: '🌱 Premier Plant',     desc: 'Ajouter ton premier plant',     earned: totalPlants >= 1  },
    { id: 'ten_plants',  label: '🌿 Jardinier',          desc: '10 plants au jardin',           earned: totalPlants >= 10 },
    { id: 'harvest_1kg', label: '🧺 Récolteur',          desc: 'Est. 1kg de récolte',           earned: totalYield >= 1  },
    { id: 'harvest_10kg',label: '🏆 Maître Récolteur',   desc: 'Est. 10kg de récolte',          earned: totalYield >= 10 },
    { id: 'streak_3',    label: '🔥 En forme !',         desc: '3 jours de suite',              earned: streak >= 3       },
    { id: 'streak_7',    label: '💚 Dévoué',             desc: '7 jours de suite',              earned: streak >= 7       },
    { id: 'quiz_master', label: '🧠 Expert Quiz',        desc: '5 quiz réussis',                earned: badges >= 5       },
  ];
}

// ─── QUEST REWARDS (static display in GameScreen) ────────────────────────────

export const questRewards = [
  { label: 'Semer 3 tomates',          check: false, xp: 20 },
  { label: 'Récolte estimée 5kg',      check: false, xp: 30 },
  { label: 'Répondre à 3 quiz',        check: false, xp: 25 },
  { label: '5 plants en serre',         check: false, xp: 15 },
];

// ─── SKILL TREE ───────────────────────────────────────────────────────────────

export const skillTree = [
  { id: 'extra_slot',        name: 'Grille Étendue',        icon: '➕',  cost: 500, desc: '+2 alvéoles par serre' },
  { id: 'zoom_expert',       name: 'Loupe Pro',              icon: '🔍',  cost: 300, desc: 'Zoom x2 sur les plants' },
  { id: 'weather_forecast',  name: 'Météo 7J',              icon: '📡',  cost: 400, desc: 'Prévisions sur 7 jours' },
  { id: 'growth_boost',      name: 'Croissance Accélérée',   icon: '⚡',  cost: 600, desc: 'Plants mûrs 10% plus vite' },
  { id: 'harvest_master',    name: 'Maître Récolteur',       icon: '🏆',  cost: 800, desc: '+25% de rendement' },
  { id: 'moon_reader',       name: 'Lecture Lunaire',        icon: '🌙',  cost: 350, desc: 'Alertes phases lunaires' },
];

// ─── QUEST TYPES (pool for daily quest generation) ───────────────────────────

export const questTypes = [
  { type: 'water',     text: '💧 Arrosez 3 plants aujourd\'hui',              target: 3, reward: 50  },
  { type: 'plant',     text: '🌱 Semez un nouveau légume',                     target: 1, reward: 100 },
  { type: 'photo',     text: '📸 Prenez une photo d\'un de vos plants',        target: 1, reward: 25  },
  { type: 'harvest',   text: '🧺 Récoltez un plant mûr',                     target: 1, reward: 75  },
  { type: 'companion', text: '🤝 Plantez un combo compagnon (Tomate+Basilic)',  target: 1, reward: 150 },
  { type: 'moon',      text: '🌙 Semez selon la phase lunaire',                target: 1, reward: 100 },
  { type: 'variety',   text: '🥗 Plantez 3 variétés différentes',              target: 3, reward: 125 },
];

// ─── DAILY QUESTS GENERATOR ─────────────────────────────────────────────────

/**
 * @returns {{ quests: Array, lastUpdate: string }}
 */
export function generateDailyQuests() {
  const shuffled = [...questTypes].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3).map((q, i) => ({
    id: `quest-${Date.now()}-${i}`,
    ...q,
    completed: false,
    progress: 0,
  }));

  return { quests: selected, lastUpdate: new Date().toISOString() };
}

// ─── PRO OBJECTIVES GENERATOR ────────────────────────────────────────────────

/**
 * @param {number} [collectedCount=0]
 */
export function generateProObjectives(collectedCount = 0) {
  return [
    { id: 'obj1', name: 'Première Récolte',         target: 1,  current: 0, unit: 'kg',     reward: 200   },
    { id: 'obj2', name: 'Jardinier Assidu',           target: 10, current: 0, unit: 'plants', reward: 500   },
    { id: 'obj3', name: 'Maître Compagnonnage',       target: 3,  current: 0, unit: 'combos', reward: 750   },
    { id: 'obj4', name: 'Récolte de Tomates',         target: 5,  current: 0, unit: 'kg',    reward: 300   },
    { id: 'obj5', name: 'Collectionneur',             target: 10, current: collectedCount, unit: 'cartes', reward: 1000 },
  ];
}

// ─── SEASONAL EVENTS ─────────────────────────────────────────────────────────

export const SEASONAL_EVENTS = [
  { month: 2,  name: 'Printemps Bio',  icon: '🌸', bonus: 'x2 XP racines', type: 'spring'  },
  { month: 5,  name: 'Été Canicule',   icon: '☀️', bonus: 'Défi survie +30°', type: 'summer' },
  { month: 8,  name: 'Harvest Moon',   icon: '🌕', bonus: 'Récoltes légendaires', type: 'autumn' },
  { month: 11, name: 'Hivernage',      icon: '❄️', bonus: 'Plants résistants', type: 'winter'  },
];

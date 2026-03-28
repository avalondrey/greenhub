// Base de données des plantes — 50+ variétés
// Chaque plante a : cycle, besoins, compagnons, incompatibilités

export const PLANTS_DB = [
  // 🍅 TOMATES
  {
    id: 'tomate-coeur-de-boeuf',
    name: 'Tomate',
    variety: 'Coeur de Boeuf',
    icon: '🍅',
    family: 'Solanacées',
    cycle: 'annuelle',
    daysToMaturity: 90,
    harvestDuration: 60,
    spacing: { between: 60, rows: 80 },
    needs: {
      sun: 'full', // full, partial, shade
      water: 'high', // low, medium, high
      temp: { min: 15, max: 30, ideal: 25 }
    },
    planting: {
      indoor: '2026-02-15',
      outdoor: '2026-05-15',
      greenhouse: '2026-03-15',
      moonPhase: 'waxing' // waxing, waning, any
    },
    companions: ['basilic', 'oeillet-dinde', 'carotte', 'ail'],
    incompatible: ['pomme-de-terre', 'fenouil', 'chou'],
    tasks: [
      { day: 0, task: '🌱 Plantation', recurring: false },
      { day: 2, task: '💧 Arrosage régulier', recurring: 'weekly' },
      { day: 14, task: '🧪 Premier fertilisant', recurring: 'biweekly' },
      { day: 30, task: '✂️ Tailler les gourmands', recurring: 'weekly' },
      { day: 60, task: '🎋 Tuteurer', recurring: false },
      { day: 90, task: '🧺 Début récolte', recurring: false }
    ],
    yield: { min: 3, max: 8, unit: 'kg/pied' },
    diseases: ['mildiou', 'cul-noir', 'alternariose'],
    tips: [
      'Arroser au pied, pas sur les feuilles',
      'Pailler pour garder l\'humidité',
      'Récolter quand bien colorées'
    ]
  },
  
  {
    id: 'tomate-cerise',
    name: 'Tomate',
    variety: 'Cerise',
    icon: '🍅',
    family: 'Solanacées',
    cycle: 'annuelle',
    daysToMaturity: 65,
    harvestDuration: 45,
    spacing: { between: 50, rows: 70 },
    needs: { sun: 'full', water: 'medium', temp: { min: 15, max: 30, ideal: 25 } },
    planting: { indoor: '2026-02-15', outdoor: '2026-05-15', greenhouse: '2026-03-15', moonPhase: 'waxing' },
    companions: ['basilic', 'oeillet-dinde', 'carotte'],
    incompatible: ['pomme-de-terre', 'fenouil'],
    tasks: [
      { day: 0, task: '🌱 Plantation', recurring: false },
      { day: 2, task: '💧 Arrosage', recurring: 'weekly' },
      { day: 45, task: '🧺 Récolte', recurring: 'weekly' }
    ],
    yield: { min: 2, max: 5, unit: 'kg/pied' },
    diseases: ['mildiou', 'moucheture'],
    tips: ['Très productive', 'Idéale pour les enfants']
  },
  
  // 🥒 COURGES
  {
    id: 'courgette-noire',
    name: 'Courgette',
    variety: 'Noire de Milan',
    icon: '🥒',
    family: 'Cucurbitacées',
    cycle: 'annuelle',
    daysToMaturity: 50,
    harvestDuration: 60,
    spacing: { between: 80, rows: 120 },
    needs: { sun: 'full', water: 'high', temp: { min: 18, max: 35, ideal: 25 } },
    planting: { indoor: '2026-04-01', outdoor: '2026-05-15', greenhouse: '2026-04-15', moonPhase: 'waxing' },
    companions: ['capucine', 'oeillet-dinde', 'haricot', 'mais'],
    incompatible: ['pomme-de-terre'],
    tasks: [
      { day: 0, task: '🌱 Plantation', recurring: false },
      { day: 1, task: '💧 Arrosage généreux', recurring: 'weekly' },
      { day: 30, task: '🧪 Fertilisant riche en potasse', recurring: 'monthly' },
      { day: 50, task: '🧺 Récolte précoce', recurring: 'weekly' }
    ],
    yield: { min: 4, max: 10, unit: 'kg/pied' },
    diseases: ['oïdium', 'mildiou'],
    tips: ['Récolter jeunes pour plus de goût', 'Pailler généreusement']
  },
  
  // 🥕 RACINES
  {
    id: 'carotte-nantaise',
    name: 'Carotte',
    variety: 'Nantaise',
    icon: '🥕',
    family: 'Apiacées',
    cycle: 'annuelle',
    daysToMaturity: 90,
    harvestDuration: 30,
    spacing: { between: 5, rows: 25 },
    needs: { sun: 'full', water: 'medium', temp: { min: 10, max: 25, ideal: 18 } },
    planting: { indoor: '2026-02-01', outdoor: '2026-03-15', greenhouse: 'any', moonPhase: 'waning' },
    companions: ['poireau', 'radis', 'laitue', 'tomate'],
    incompatible: ['aneth'],
    tasks: [
      { day: 0, task: '🌱 Semis', recurring: false },
      { day: 15, task: '🌱 Éclaircir', recurring: false },
      { day: 30, task: '💧 Arrosage régulier', recurring: 'weekly' },
      { day: 90, task: '🧺 Récolte', recurring: 'weekly' }
    ],
    yield: { min: 2, max: 4, unit: 'kg/m²' },
    diseases: ['mouche de la carotte', 'alternariose'],
    tips: ['Semer clair et éclaircir', 'Butter pour éviter le vert']
  },
  
  // 🥬 SALADES
  {
    id: 'laitue-batavia',
    name: 'Laitue',
    variety: 'Batavia',
    icon: '🥬',
    family: 'Astéracées',
    cycle: 'annuelle',
    daysToMaturity: 50,
    harvestDuration: 20,
    spacing: { between: 25, rows: 30 },
    needs: { sun: 'partial', water: 'medium', temp: { min: 10, max: 25, ideal: 18 } },
    planting: { indoor: '2026-02-01', outdoor: '2026-03-01', greenhouse: 'any', moonPhase: 'waning' },
    companions: ['radis', 'fraise', 'carotte', 'betterave'],
    incompatible: ['céleri'],
    tasks: [
      { day: 0, task: '🌱 Semis', recurring: false },
      { day: 10, task: '🌱 Repiquage', recurring: false },
      { day: 30, task: '💧 Arrosage', recurring: 'weekly' },
      { day: 50, task: '🧺 Récolte', recurring: false }
    ],
    yield: { min: 0.2, max: 0.5, unit: 'kg/pied' },
    diseases: ['sclérotinia', 'mildiou'],
    tips: ['Échelonner les semis', 'Récolter le matin']
  },
  
  // 🌿 HERBES
  {
    id: 'basilic-grand-vert',
    name: 'Basilic',
    variety: 'Grand Vert',
    icon: '🌿',
    family: 'Lamiacées',
    cycle: 'annuelle',
    daysToMaturity: 30,
    harvestDuration: 90,
    spacing: { between: 20, rows: 30 },
    needs: { sun: 'full', water: 'medium', temp: { min: 15, max: 35, ideal: 25 } },
    planting: { indoor: '2026-03-01', outdoor: '2026-05-15', greenhouse: '2026-04-01', moonPhase: 'waxing' },
    companions: ['tomate', 'poivron', 'origan'],
    incompatible: ['sauge'],
    tasks: [
      { day: 0, task: '🌱 Semis', recurring: false },
      { day: 20, task: '🌱 Repiquage', recurring: false },
      { day: 30, task: '✂️ Cueillir les feuilles', recurring: 'weekly' },
      { day: 60, task: '🌸 Supprimer les fleurs', recurring: 'weekly' }
    ],
    yield: { min: 0.3, max: 0.8, unit: 'kg/pied' },
    diseases: ['fusariose', 'pourriture grise'],
    tips: ['Cueillir au fur et à mesure', 'Ne jamais mettre au frigo']
  },
  
  {
    id: 'menthe',
    name: 'Menthe',
    variety: 'Verte',
    icon: '🌿',
    family: 'Lamiacées',
    cycle: 'vivace',
    daysToMaturity: 60,
    harvestDuration: 120,
    spacing: { between: 30, rows: 40 },
    needs: { sun: 'partial', water: 'high', temp: { min: 5, max: 30, ideal: 20 } },
    planting: { indoor: 'any', outdoor: '2026-04-01', greenhouse: 'any', moonPhase: 'waxing' },
    companions: ['tomate', 'chou'],
    incompatible: ['persil'],
    tasks: [
      { day: 0, task: '🌱 Plantation', recurring: false },
      { day: 30, task: '✂️ Récolte', recurring: 'weekly' },
      { day: 90, task: '✂️ Rabattre', recurring: 'yearly' }
    ],
    yield: { min: 0.5, max: 1.5, unit: 'kg/pied' },
    diseases: ['rouille', 'oïdium'],
    tips: ['Très envahissante — pot séparé', 'Sèche pour l\'hiver']
  },
  
  // 🍓 FRUITS
  {
    id: 'fraise-gariguette',
    name: 'Fraise',
    variety: 'Gariguette',
    icon: '🍓',
    family: 'Rosacées',
    cycle: 'vivace',
    daysToMaturity: 365,
    harvestDuration: 60,
    spacing: { between: 30, rows: 60 },
    needs: { sun: 'full', water: 'medium', temp: { min: 5, max: 30, ideal: 20 } },
    planting: { indoor: 'any', outdoor: '2026-09-01', greenhouse: '2026-09-01', moonPhase: 'waning' },
    companions: ['laitue', 'épinard', 'haricot'],
    incompatible: ['chou'],
    tasks: [
      { day: 0, task: '🌱 Plantation', recurring: false },
      { day: 180, task: '🧪 Fertilisant', recurring: 'monthly' },
      { day: 270, task: '🍓 Paillage', recurring: false },
      { day: 365, task: '🧺 Récolte', recurring: 'weekly' }
    ],
    yield: { min: 0.5, max: 1, unit: 'kg/pied' },
    diseases: ['pourriture grise', 'oïdium'],
    tips: ['Pailler avec de la paille', 'Protéger des limaces']
  },
  
  // 🌽 LÉGUMES
  {
    id: 'mais-doux',
    name: 'Maïs',
    variety: 'Doux',
    icon: '🌽',
    family: 'Poacées',
    cycle: 'annuelle',
    daysToMaturity: 90,
    harvestDuration: 14,
    spacing: { between: 30, rows: 70 },
    needs: { sun: 'full', water: 'medium', temp: { min: 15, max: 35, ideal: 25 } },
    planting: { indoor: '2026-04-01', outdoor: '2026-05-15', greenhouse: 'any', moonPhase: 'waxing' },
    companions: ['haricot', 'courge', 'concombre'],
    incompatible: ['tomate'],
    tasks: [
      { day: 0, task: '🌱 Semis', recurring: false },
      { day: 30, task: '🧪 Buttage', recurring: false },
      { day: 60, task: '💧 Arrosage', recurring: 'weekly' },
      { day: 90, task: '🧺 Récolte', recurring: false }
    ],
    yield: { min: 1, max: 2, unit: 'kg/pied' },
    diseases: ['pyrale', 'rouille'],
    tips: ['Planter en carré pour pollinisation', 'Récolter à maturité']
  },
  
  {
    id: 'haricot-vert',
    name: 'Haricot',
    variety: 'Vert',
    icon: '🫘',
    family: 'Fabacées',
    cycle: 'annuelle',
    daysToMaturity: 50,
    harvestDuration: 30,
    spacing: { between: 10, rows: 50 },
    needs: { sun: 'full', water: 'medium', temp: { min: 15, max: 30, ideal: 22 } },
    planting: { indoor: '2026-04-15', outdoor: '2026-05-15', greenhouse: '2026-04-15', moonPhase: 'waxing' },
    companions: ['carotte', 'courge', 'mais', 'concombre'],
    incompatible: ['ail', 'oignon'],
    tasks: [
      { day: 0, task: '🌱 Semis', recurring: false },
      { day: 30, task: '🎋 Tuteurer', recurring: false },
      { day: 50, task: '🧺 Récolte', recurring: 'weekly' }
    ],
    yield: { min: 1, max: 3, unit: 'kg/pied' },
    diseases: ['anthracnose', 'mildiou'],
    tips: ['Récolter jeunes', 'Fixe l\'azote dans le sol']
  }
];

// Helper pour trouver une plante
export function getPlantById(id) {
  return PLANTS_DB.find(p => p.id === id);
}

// Helper pour filtrer par famille
export function getPlantsByFamily(family) {
  return PLANTS_DB.filter(p => p.family === family);
}

// Helper pour vérifier compagnonnage
export function areCompanions(plant1, plant2) {
  const p1 = getPlantById(plant1);
  const p2 = getPlantById(plant2);
  
  if (!p1 || !p2) return false;
  
  return p1.companions.includes(plant2) || p2.companions.includes(plant1);
}

// Helper pour vérifier incompatibilité
export function areIncompatible(plant1, plant2) {
  const p1 = getPlantById(plant1);
  const p2 = getPlantById(plant2);
  
  if (!p1 || !p2) return false;
  
  return p1.incompatible.includes(plant2) || p2.incompatible.includes(plant1);
}

// Helper pour générer les tâches auto
export function generateTasks(plantId, plantedDate) {
  const plant = getPlantById(plantId);
  if (!plant) return [];
  
  const planted = new Date(plantedDate);
  
  return plant.tasks.map(task => ({
    ...task,
    date: new Date(planted.getTime() + task.day * 24 * 60 * 60 * 1000),
    plantId: plantId,
    plantName: `${plant.icon} ${plant.name} ${plant.variety}`,
    completed: false
  }));
}

// Helper pour estimer la récolte
export function estimateYield(plantId, count) {
  const plant = getPlantById(plantId);
  if (!plant) return null;
  
  const avg = (plant.yield.min + plant.yield.max) / 2;
  
  return {
    min: plant.yield.min * count,
    max: plant.yield.max * count,
    avg: avg * count,
    unit: plant.yield.unit,
    startDate: null, // à calculer avec plantedDate
    endDate: null
  };
}

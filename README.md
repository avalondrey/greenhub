# 🌱 GreenHub — Mon Jardin Intelligent

**Ton jardin et ta serre pilotés par l'IA — 100% gratuit, offline-first**

![Version](https://img.shields.io/badge/version-1.1.0-green)
![React](https://img.shields.io/badge/React-19-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 Features

### 🗺️ Jardin Réel
- **Rendu isométrique Canvas 2D** — Visualisation réelle de votre jardin
- **Ombres projetées** — Effet visuel réaliste
- **Timeline photos** — Timelapse de vos plants

### 🌱 Mini-serres
- Gestion complète des serres avec 5 stades de croissance
- 50+ plantes (tomates, légumes, herbes, fruits)

### 🌙 Lune & Météo
- **Calendrier lunaire complet** avec phases de lune
- **Alertes semis** selon la lune
- **Indicateur phase lunaire** dans l'onglet Semer
- **Meilleurs jours de plantation** basés sur la lune
- **Alertes météo** pour protéger vos plants

### 🎮 Gamification Avancée
- **Quêtes quotidiennes** — Tâches générées automatiquement
- **Collection de cartes** — Cartes de plantes à collectionner
- **Compétences (Perks)** — Améliorez vos abilities
- **Streaks** — Gardez votre série de jardinage
- **Mode Pro** — Objectifs pro avec sync collectionneur
- **Niveaux & Badges** — Récompenses de jardinier

### 🤖 IA & Conseils
- **Conseils IA** — Via Pollinations.ai (100% gratuit)
- **Pollinisation automatique** — Assistée par IA
- **Calcul récoltes** — Estimations précises

### 🛠️ Outils
- **Export/Import** — Sauvegardez vos données
- **Notifications récoltes** — Ne manquez plus une récolte
- **Onglet Récoltes** — Historique complet
- **Stats détaillées** — Suivi de votre progression
- **Liste courses** — Auto-générée selon vos plantations
- **Barre de recherche** — Trouvez vite dans l'encyclopédie

### 📱 PWA & Offline
- **Offline-first** — IndexedDB pour tout stocker
- **PWA installable** — Comme une app mobile
- **Sync automatique** — Vos données sont toujours à jour

## 📦 Installation

```bash
git clone https://github.com/avalondrey/greenhub
cd greenhub
npm install
npm run dev
```

## 🌐 Déploiement

### Vercel
```bash
npm run deploy:vercel
```

### GitHub Pages
```bash
npm run deploy:gh-pages
```

## 📊 Base de données plantes

50+ plantes incluses :
- 🍅 Tomates (20+ variétés)
- 🥒 Légumes (15+ variétés)
- 🌿 Herbes (10+ variétés)
- 🍓 Fruits (5+ variétés)

## 🛠️ Tech Stack

| Technologie | Usage |
|------------|-------|
| React 19 | Interface utilisateur |
| Vite 7 | Build tool |
| IndexedDB | Stockage offline |
| PWA | Installation mobile |
| DnD Kit | Drag & drop |
| Canvas 2D | Rendu isométrique |
| Open-Meteo API | Météo gratuite |

## 🗂️ Structure du projet

```
greenhub/
├── src/
│   ├── App.jsx          # Composant principal
│   ├── main.jsx         # Point d'entrée
│   ├── index.css        # Styles globaux
│   ├── db/              # Base de données IndexedDB
│   └── hooks/           # Hooks React personnalisés
│       ├── useRealGardenRenderer.js  # Rendu jardin isométrique
│       └── useTileRenderer.js        # Rendu tuiles
├── public/
│   ├── manifest.json    # PWA manifest
│   ├── seedling.svg     # Icône PWA
│   └── tileset/         # Sprites et tilesets
├── scripts/
│   ├── generate-clean-sprites.js    # Génération sprites
│   ├── generate-garden-sprites.js    # Sprites jardin
│   └── upscale-tilesets.js          # Upscale tuiles
├── package.json
└── vite.config.js
```

## 📄 License

MIT — Libre d'utilisation, modification et distribution.

---

**Développé avec ❤️ par [Avalon Drey](https://github.com/avalondrey)**

*Votre jardin mérite le meilleur — GreenHub vous le donne.*

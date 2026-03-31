# Changelog

Toutes les modifications notables de ce projet seront documentées ici.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

## [Unreleased]

### Added
- **Jardin Réel** — Nouveau système de rendu isométrique avec Canvas 2D
- **Mini-serres** — Gestion complète des serres avec 5 stades de croissance
- **Sprites réalistes** — Tomates avec vrais fruits ronds, reflets, calyx et feuilles lobées
- **Génération procédurale** — Script Node.js pour générer les tilesets (`generate-clean-sprites.js`)
- **Système de rendu Garden** — Hook React `useRealGardenRenderer` pour le jardin isométrique
- **Sprites jardin** — Arbres, arbustes, haies, baies, abris de jardin (`generate-garden-sprites.js`)
- **Admin panel** — Bouton caché pour les fonctionnalités de test
- **PWA** — Fichier manifest.json et icône seedling.svg

### Changed
- Refonte complète des sprites de tomates (plus réalistes et compacts)
- Suppression de l'ancien onglet "Jardin" (remplacé par "Jardin Réel")

### Fixed
- Correction du décalage de la détection de clic sur le canvas isométrique
- Ajustement des offsets pour aligner correctement la grille avec les coordonnées souris

## [1.0.0] - 2026-03-25

### Added
- Version initiale de GreenHub
- Système de mini-serres avec 50+ plantes
- Drag & drop des plants (DnD Kit)
- Planning automatique des tâches
- Intégration météo (Open-Meteo API)
- Calcul des récoltes
- Conseils IA via Pollinations.ai
- Système de gamification (niveaux, badges)
- Liste de courses auto-générée
- Mode offline avec IndexedDB
- PWA installable

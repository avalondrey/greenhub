# Changelog

Toutes les modifications notables de ce projet seront documentées ici.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

## [1.1.0] - 2026-03-31

### Added
- **Système de quêtes quotidiennes** — Tâches générées automatiquement chaque jour
- **Collection de cartes** — Cartes de plantes à collectionner
- **Système de compétences (Perks)** — Améliorez vos abilities de jardinier
- **Streaks de jardinage** — Gardez votre série de plantation
- **Mode Pro** — Objectifs professionnels avec sync collectionneur
- **Calendrier lunaire complet** — Visualisation des phases lunaires
- **Alertes semis lune** — Notifications pour semis selon la lune
- **Indicateur phase lunaire** — Affiché dans l'onglet Semer
- **Barre de recherche** — Recherche rapide dans l'encyclopédie
- **Export/Import données** — Sauvegarde et restauration de vos données
- **Notifications récoltes** — Alertes quand vos plants sont prêts
- **Onglet Récoltes** — Historique complet de vos récoltes
- **Stats détaillées** — Tableau de bord de votre progression
- **PWA manifest.json** — Configuration pour installation mobile
- **Icône PWA seedling.svg** — Logo de l'application

### Changed
- Amélioration des échelles des sprites selon les stades de croissance
- Optimisation du rendu Canvas isométrique
- Refonte des sprites de tomates (plus réalistes et compacts)
- Correction du centrage du canvas jardin
- Suppression des ombres (simplification visuelle)

### Fixed
- Correction du décalage de la détection de clic sur le canvas isométrique
- Ajustement des offsets pour aligner correctement la grille
- Résolution des erreurs d'initialisation de generateDailyQuests
- Correction du warning month const
- Ajout de l'import useMemo manquant

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
- Jardin Réel avec rendu isométrique Canvas 2D
- Sprites réalistes générés procéduralement
- Timeline photos pour timelapse des plants
- Ombre projetées pour effet visuel réaliste

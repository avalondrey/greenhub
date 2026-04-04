// =============================================
// Ludus Terrae V2 - World Manager
// =============================================

import * as THREE from 'three';
import { gameState } from './stateManager.js';
import { VegetationSystem } from './systems/vegetationSystem.js';
import { TreeSystem } from './systems/treeSystem.js';
import { BuildingSystem } from './systems/buildingSystem.js';
import { WaterSystem } from './systems/waterSystem.js';
import { DecorationSystem } from './systems/decorationSystem.js';
import { GroundSystem } from './helpers/groundSystemHelper.js';

export class RealisticWorld {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.objects = [];
        this.plants = [];
        this.buildings = [];
        this.systems = {};
    }

    createWorld(config = {}) {
        try {
            // Config par défaut
            const defaultConfig = {
                worldSize: 100,
                plantDensity: 100,
                treeDensity: 80,  // Augmenté
                rockCount: 60,
                includeBuildings: false,
                buildingCount: 3,
                includeWater: true,
                includeWaterPlants: true,
                waterPlantCount: 20,
                pondSize: 12,
                shadows: true
            };

            this.config = { ...defaultConfig, ...config };

            // Créer le sol réaliste
            console.log('🔧 Étape 1: Sol...');
            this.systems.ground = new GroundSystem(this.scene, this.config);
            const ground = this.systems.ground.create();
            this.objects.push(ground);

            // Créer la végétation (herbes, fleurs)
            console.log('🔧 Étape 2: Végétation...');
            this.systems.vegetation = new VegetationSystem(this.scene, this.config);
            this.plants = this.systems.vegetation.create();

            // Créer les arbres
            console.log('🔧 Étape 3: Arbres...');
            this.systems.trees = new TreeSystem(this.scene, this.config);
            const trees = this.systems.trees.create();
            this.objects.push(...trees);

            // Créer les bâtiments (optionnel)
            console.log('🔧 Étape 4: Bâtiments...');
            this.systems.buildings = new BuildingSystem(this.scene, this.config);
            this.buildings = this.systems.buildings.create();
            this.objects.push(...this.buildings);

            // Créer l'eau et plantes aquatiques
            console.log('🔧 Étape 5: Eau...');
            this.systems.water = new WaterSystem(this.scene, this.config);
            const waterObjects = this.systems.water.create();
            this.objects.push(...waterObjects);

            // Créer les décorations (rochers)
            console.log('🔧 Étape 6: Décorations...');
            this.systems.decorations = new DecorationSystem(this.scene, this.config);
            const decorations = this.systems.decorations.create();
            this.objects.push(...decorations);

            // Mise à jour de l'environnement (lumières, ombres)
            console.log('🔧 Étape 7: Environment...');
            this.updateEnvironment();

            console.log(`🌍 Monde réaliste créé avec ${this.objects.length} objets`);
            return this.objects;
        } catch (err) {
            console.error('❌ Erreur dans createWorld:', err.message, err.stack);
            throw err;
        }
    }

    updateEnvironment() {
        this.updateSeasonalLighting();
        this.updateShadows();
        this.updateFog();
    }

    updateSeasonalLighting() {
        const season = gameState.getSeason();
        const colors = {
            spring: { sky: 0x87CEEB, ambient: 0.5 },
            summer: { sky: 0x5DADE2, ambient: 0.6 },
            autumn: { sky: 0xD5A87C, ambient: 0.4 },
            winter: { sky: 0xB0C4DE, ambient: 0.3 }
        };

        const config = colors[season] || colors.spring;

        if (this.scene.fog) {
            this.scene.fog.color.setHex(config.sky);
        }

        // Ajuster la lumière ambiante
        this.scene.traverse(child => {
            if (child.isAmbientLight && child.intensity !== undefined) {
                child.intensity = config.ambient;
            }
        });
    }

    updateShadows() {
        const shadowConfig = gameState.getShadows();

        if (shadowConfig.enabled) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            this.objects.forEach(obj => {
                obj.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
            });
        } else {
            this.renderer.shadowMap.enabled = false;
        }
    }

    updateFog() {
        const weather = gameState.getWeather();

        if (weather === 'cloudy') {
            this.scene.fog = new THREE.Fog(0x999999, 30, 100);
        } else if (weather === 'rainy') {
            this.scene.fog = new THREE.Fog(0x666666, 20, 80);
        } else if (weather === 'snowy') {
            this.scene.fog = new THREE.Fog(0xcccccc, 20, 60);
        } else {
            this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
        }
    }

    updateSeason(season) {
        gameState.setSeason(season);
        this.updateSeasonalLighting();

        if (this.systems.trees) {
            this.systems.trees.updateSeason(season);
        }
        if (this.systems.vegetation) {
            this.systems.vegetation.updateSeason(season);
        }
    }

    updateWeather(weather) {
        gameState.setWeather(weather);
        this.updateFog();

        if (this.systems.water) {
            this.systems.water.updateWeather(weather);
        }
    }

    getObjects() { return this.objects; }
    getBuildings() { return this.buildings; }
    getPlants() { return this.plants; }

    destroy() {
        // Nettoyer chaque système
        Object.values(this.systems).forEach(system => {
            if (system && system.destroy) {
                system.destroy();
            }
        });

        // Nettoyer les objets restants
        this.objects.forEach(obj => {
            this.scene.remove(obj);
            obj.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        });

        this.objects = [];
        this.buildings = [];
        this.plants = [];
        this.systems = {};

        console.log('🧹 Monde réaliste détruit');
    }
}

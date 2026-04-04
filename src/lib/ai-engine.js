// ==========================================
// GreenHub V2 - AI Evolution Engine
// Gère l'évolution automatique des plantes 3D
// ==========================================

import * as THREE from 'three';

// Données des plantes - définitions de croissance
export const PLANT_DEFINITIONS = {
    tomato: {
        name: 'Tomate',
        emoji: '🍅',
        baseColor: 0xff0000,
        stages: ['graine', 'germination', 'croissance', 'floraison', 'fructification'],
        growthRate: 1.0,
        mutations: ['big_tomato', 'cherry_tomato', 'yellow_tomato']
    },
    carrot: {
        name: 'Carotte',
        emoji: '🥕',
        baseColor: 0xff8c00,
        stages: ['graine', 'germination', 'feuilles', 'racine', 'mature'],
        growthRate: 1.2,
        mutations: ['purple_carrot', 'white_carrot']
    },
    salad: {
        name: 'Salade',
        emoji: '🥬',
        baseColor: 0x90EE90,
        stages: ['graine', 'germination', 'feuilles', 'pommaison', 'mature'],
        growthRate: 1.5,
        mutations: ['red_salad', 'romaine']
    },
    corn: {
        name: 'Maïs',
        emoji: '🌽',
        baseColor: 0xffdd00,
        stages: ['graine', 'germe', 'tige', 'epis', 'mature'],
        growthRate: 0.8,
        mutations: ['blue_corn', 'popcorn']
    },
    strawberry: {
        name: 'Fraise',
        emoji: '🍓',
        baseColor: 0xff4444,
        stages: ['graine', 'germination', 'rampant', 'floraison', 'fruits'],
        growthRate: 0.7,
        mutations: ['wild_strawberry', 'pineberry']
    },
    pepper: {
        name: 'Poivron',
        emoji: '🫑',
        baseColor: 0x228B22,
        stages: ['graine', 'germination', 'arbuste', 'floraison', 'fructification'],
        growthRate: 0.6,
        mutations: ['hot_pepper', 'yellow_pepper']
    }
};

export class PlantDefinition {
    constructor(id) {
        this.id = id;
        this.data = PLANT_DEFINITIONS[id] || PLANT_DEFINITIONS.tomato;
    }

    getStages() {
        return this.data.stages;
    }

    getGrowthRate() {
        return this.data.growthRate;
    }

    getColor() {
        return this.data.baseColor;
    }
}

// ==========================================
// AI Evolution Manager
// Gère l'évolution automatique des renderings 3D
// ==========================================

export class AIEvolutionManager {
    constructor() {
        this.evolutionHistory = [];
        this.lastEvolution = Date.now();
        this.evolutionInterval = 24 * 60 * 60 * 1000; // 24h par défaut
        this.isEnabled = true;
        this.mutationChance = 0.05; // 5% de chance de mutation
        this.plantVariations = new Map(); // Cache des variations générées
    }

    // Définit l'intervalle d'évolution (en millisecondes)
    setEvolutionInterval(ms) {
        this.evolutionInterval = ms;
    }

    // Active/désactive l'évolution automatique
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }

    // Vérifie si une évolution doit avoir lieu
    shouldEvolve() {
        if (!this.isEnabled) return false;
        return Date.now() - this.lastEvolution >= this.evolutionInterval;
    }

    // Génère une mutation visuelle pour une plante
    generateMutation(plantType, currentStage) {
        const def = PLANT_DEFINITIONS[plantType];
        if (!def || !def.mutations) return null;

        if (Math.random() > this.mutationChance) return null;

        const mutation = def.mutations[Math.floor(Math.random() * def.mutations.length)];
        console.log(`🧬 Mutation détectée: ${plantType} -> ${mutation}`);
        return mutation;
    }

    // Génère une variation de couleur pour le même type de plante
    generateColorVariation(baseColor) {
        const color = new THREE.Color(baseColor);
        const variation = (Math.random() - 0.5) * 0.2;

        // HSL manipulation for natural variation
        const hsl = {};
        color.getHSL(hsl);

        // Faire varier légèrement la teinte, saturation et luminosité
        hsl.h = Math.max(0, Math.min(1, hsl.h + variation * 0.1));
        hsl.s = Math.max(0, Math.min(1, hsl.s + variation));
        hsl.l = Math.max(0, Math.min(1, hsl.l + variation * 0.5));

        color.setHSL(hsl.h, hsl.s, hsl.l);
        return color.getHex();
    }

    // Évolution d'une plante: retourne les paramètres de rendu
    evolvePlant(plantType, stageIndex, plantData = {}) {
        const mutation = this.generateMutation(plantType, stageIndex);
        const colorVariation = this.generateColorVariation(
            plantData.color || PLANT_DEFINITIONS[plantType]?.baseColor || 0xff0000
        );

        const result = {
            stageIndex,
            color: colorVariation,
            mutation,
            timestamp: Date.now(),
            growthParameters: this.calculateGrowthParameters(plantType, stageIndex)
        };

        // Sauvegarder dans l'historique
        this.evolutionHistory.push({
            plantType,
            ...result
        });

        return result;
    }

    // Calcule les paramètres de croissance pour le rendu 3D
    calculateGrowthParameters(plantType, stageIndex) {
        const totalStages = 5;
        const progress = stageIndex / (totalStages - 1);

        return {
            scale: 0.2 + progress * 0.8,
            stemHeight: 0.2 + progress * 0.6,
            leafCount: Math.floor(progress * 5),
            leafSize: 0.1 + progress * 0.15,
            hasFlowers: stageIndex >= 2,
            hasFruits: stageIndex >= 3,
            colorIntensity: 0.5 + progress * 0.5
        };
    }

    // Génère unmesh 3D évolué pour une plante
    generateEvolvedMesh(plantType, stageIndex, position, scene) {
        const params = this.calculateGrowthParameters(plantType, stageIndex);
        const color = this.evolvePlant(plantType, stageIndex).color;

        const group = new THREE.Group();
        group.position.copy(position);

        // Tige
        const stemGeom = new THREE.CylinderGeometry(0.03, 0.05, params.stemHeight, 6);
        const stemMat = new THREE.MeshStandardMaterial({
            color: 0x6B8E23,
            roughness: 0.7
        });
        const stem = new THREE.Mesh(stemGeom, stemMat);
        stem.position.y = params.stemHeight / 2;
        stem.castShadow = true;
        group.add(stem);

        // Feuilles
        if (params.leafCount > 0) {
            const leafGeom = new THREE.SphereGeometry(params.leafSize, 8, 8);
            const leafMat = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.6
            });

            for (let i = 0; i < params.leafCount; i++) {
                const angle = (i / params.leafCount) * Math.PI * 2;
                const leaf = new THREE.Mesh(leafGeom, leafMat.clone());
                leaf.position.set(
                    Math.cos(angle) * 0.15,
                    params.stemHeight * 0.4 + i * 0.1,
                    Math.sin(angle) * 0.15
                );
                leaf.scale.set(1, 0.5, 1);
                leaf.castShadow = true;
                group.add(leaf);
            }
        }

        // Fleurs
        if (params.hasFlowers) {
            const flowerGeom = new THREE.SphereGeometry(0.08, 8, 8);
            const flowerMat = new THREE.MeshStandardMaterial({
                color: 0xFFFF00,
                roughness: 0.5,
                emissive: 0x333300
            });

            for (let i = 0; i < 3; i++) {
                const flower = new THREE.Mesh(flowerGeom, flowerMat.clone());
                flower.position.set(
                    (Math.random() - 0.5) * 0.2,
                    params.stemHeight + 0.1,
                    (Math.random() - 0.5) * 0.2
                );
                group.add(flower);
            }
        }

        // Fruits
        if (params.hasFruits) {
            const fruitGeom = new THREE.SphereGeometry(0.1, 8, 8);
            const fruitMat = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.4,
                emissive: 0x220000
            });

            for (let i = 0; i < 4; i++) {
                const fruit = new THREE.Mesh(fruitGeom, fruitMat.clone());
                fruit.position.set(
                    (Math.random() - 0.5) * 0.3,
                    params.stemHeight + 0.1 + Math.random() * 0.2,
                    (Math.random() - 0.5) * 0.3
                );
                fruit.castShadow = true;
                group.add(fruit);
            }
        }

        return group;
    }

    // Fait évoluer toutes les plantes d'une serre
    evolveSerre(serre) {
        if (!this.shouldEvolve()) return;

        console.log(`⏰ Évolution automatique des plantes de ${serre.name}...`);

        serre.plants.forEach((plant, idx) => {
            if (plant) {
                const newStage = Math.min(plant.growthStage + 1, 4);
                if (newStage !== plant.growthStage) {
                    plant.growthStage = newStage;
                    plant.rebuildMesh();
                    console.log(`🌱 ${plant.name} -> Stade ${newStage}`);
                }
            }
        });

        this.lastEvolution = Date.now();
    }

    // Obtient l'historique d'évolution
    getHistory() {
        return [...this.evolutionHistory];
    }

    // Reset l'historique
    resetHistory() {
        this.evolutionHistory = [];
    }
}

// Singleton pour l'évolution automatique
export const aiEvolution = new AIEvolutionManager();

// =============================================
// Ludus Terrae V2 - Tree System (REFONTS)
// =============================================

import * as THREE from 'three';
import { PlantsHelper } from '../helpers/plantsHelper.js';
import { gameState } from '../stateManager.js';

export class TreeSystem {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.config = config;
        this.helper = new PlantsHelper(scene);
        this.trees = [];
    }

    create() {
        const treeCount = this.config.treeDensity || 80;

        // Types d'arbres avec probabilités
        const treeTypes = [
            { type: 'generic', weight: 0.18 },   // 18% arbres génériques
            { type: 'oak', weight: 0.15 },      // 15% chênes
            { type: 'pine', weight: 0.15 },      // 15% sapins
            { type: 'birch', weight: 0.12 },     // 12% bouleaux
            { type: 'willow', weight: 0.08 },    // 8% saules
            { type: 'poplar', weight: 0.10 },    // 10% peupliers
            { type: 'maple', weight: 0.12 },     // 12% érables
            { type: 'cypress', weight: 0.10 }     // 10% cyprès
        ];

        // Normaliser les poids
        const totalWeight = treeTypes.reduce((sum, t) => sum + t.weight, 0);
        treeTypes.forEach(t => t.weight /= totalWeight);

        // Compteurs par type
        const typeCount = {};
        treeTypes.forEach(t => typeCount[t.type] = 0);

        for (let i = 0; i < treeCount; i++) {
            // Position avec distribution plus naturelle (clustering)
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.pow(Math.random(), 0.5) * (this.config.worldSize || 100) * 0.45;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            // Éviter la zone centrale (serres)
            if (Math.abs(x) < 15 && Math.abs(z) < 15) continue;

            const position = new THREE.Vector3(x, 0, z);

            // Sélectionner le type avec pondération
            const rand = Math.random();
            let cumulative = 0;
            let selectedType = 'generic';
            for (const treeType of treeTypes) {
                cumulative += treeType.weight;
                if (rand <= cumulative) {
                    selectedType = treeType.type;
                    break;
                }
            }

            // Cyprès et saules près de l'eau (autour du point central)
            const waterDist = Math.sqrt(x * x + z * z);
            const nearWater = waterDist < 35 && waterDist > 15;

            if (nearWater && Math.random() > 0.5) {
                // Forcer cyprès ou saule près de l'eau
                selectedType = Math.random() > 0.5 ? 'cypress' : 'willow';
            }

            // Ajouter un peu d'offset aléatoire
            const tree = this.helper.createTree(selectedType, position);

            // Taille variable selon le type
            const scale = 0.7 + Math.random() * 0.6;
            tree.scale.set(scale, scale, scale);

            tree.castShadow = true;
            tree.receiveShadow = true;
            this.trees.push(tree);
            this.scene.add(tree);
            typeCount[selectedType]++;
        }

        console.log(`🌲 ${this.trees.length} arbres créés:`);
        Object.entries(typeCount).forEach(([type, count]) => {
            if (count > 0) console.log(`   ${type}: ${count}`);
        });

        return this.trees;
    }

    updateSeason(season) {
        const seasonLeafColors = {
            spring: 0x7ec850,
            summer: 0x228B22,
            autumn: 0xaa5522,
            winter: 0x886644
        };

        const targetColor = new THREE.Color(seasonLeafColors[season] || seasonLeafColors.spring);

        this.trees.forEach(tree => {
            tree.traverse(child => {
                if (child.isMesh && child.material && child.material.color) {
                    // Garder les troncs et sapins naturels
                    const isPine = tree.userData && tree.userData.type === 'pine';
                    if (!isPine) {
                        child.material.color.lerp(targetColor, 0.1);
                    }
                }
            });
        });
    }

    getTrees() {
        return this.trees;
    }

    destroy() {
        this.trees.forEach(tree => {
            this.scene.remove(tree);
            tree.traverse(child => {
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
        this.trees = [];
    }
}

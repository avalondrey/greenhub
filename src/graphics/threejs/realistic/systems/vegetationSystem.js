// =============================================
// Ludus Terrae V2 - Vegetation System
// =============================================

import * as THREE from 'three';
import { PlantsHelper } from '../helpers/plantsHelper.js';
import { gameState } from '../stateManager.js';
import { getSeasonalColor } from '../realisticUtil.js';

export class VegetationSystem {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.config = config;
        this.helper = new PlantsHelper(scene);
        this.plants = [];
    }

    create() {
        const season = gameState.getSeason();
        const plantCount = this.config.plantDensity || 50;

        // Créer des herbes et fleurs selon la saison
        for (let i = 0; i < plantCount; i++) {
            const x = (Math.random() - 0.5) * (this.config.worldSize || 100);
            const z = (Math.random() - 0.5) * (this.config.worldSize || 100);
            const position = new THREE.Vector3(x, 0, z);

            const plantType = Math.random();

            if (plantType < 0.6) {
                // Herbe
                const grass = this.helper.createGrassParticle(position);
                this.plants.push(grass);
                this.scene.add(grass);
            } else if (plantType < 0.8) {
                // Fleurs
                const flower = this.helper.createFlower(position, 0.2 + Math.random() * 0.2);
                this.plants.push(flower);
                this.scene.add(flower);
            } else {
                // Buissons
                const bush = this.helper.createBush(position, 0.3 + Math.random() * 0.4);
                this.plants.push(bush);
                this.scene.add(bush);
            }
        }

        console.log(`🌿 ${this.plants.length} plantes créées`);
        return this.plants;
    }

    updateSeason(season) {
        // Mettre à jour les couleurs selon la saison
        this.plants.forEach(plant => {
            plant.traverse(child => {
                if (child.isMesh && child.material) {
                    // Adapter les couleurs selon la saison
                }
            });
        });
    }

    destroy() {
        this.plants.forEach(plant => {
            this.scene.remove(plant);
            plant.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        });
        this.plants = [];
    }
}

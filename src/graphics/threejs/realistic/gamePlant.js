// =============================================
// Ludus Terrae V2 - Game Plant
// Représente une plante dans le monde 3D
// =============================================

import * as THREE from 'three';
import { PlantsHelper } from './helpers/plantsHelper.js';

export const GROWTH_STAGES = [
    { name: 'graine',      emoji: '🟤', scale: 0.2, color: 0x8B4513 },
    { name: 'germination', emoji: '🌱', scale: 0.4, color: 0x90EE90 },
    { name: 'levée',       emoji: '🌿', scale: 0.6, color: 0x32CD32 },
    { name: 'croissance',  emoji: '🌿', scale: 0.8, color: 0x228B22 },
    { name: 'prête',       emoji: '🪴', scale: 1.0, color: 0x006400 },
];

export class GamePlant {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.id = config.id || Date.now() + Math.random();
        this.plantType = config.plantType || 'generic';
        this.position = config.position || new THREE.Vector3(0, 0, 0);
        this.plantedDate = config.plantedDate || Date.now();
        this.daysToMaturity = config.daysToMaturity || 30;
        this.name = config.name || 'Plante';
        this.icon = config.icon || '🌿';

        this.helper = new PlantsHelper(scene);
        this.mesh = null;
        this.currentStage = 0;
        this.isHarvestable = false;

        this.create();
    }

    getGrowthProgress() {
        const days = (Date.now() - this.plantedDate) / (1000 * 60 * 60 * 24);
        return Math.min(days / this.daysToMaturity, 1);
    }

    getGrowthStage() {
        const progress = this.getGrowthProgress();
        const stageIndex = Math.min(
            Math.floor(progress * GROWTH_STAGES.length),
            GROWTH_STAGES.length - 1
        );
        return GROWTH_STAGES[stageIndex];
    }

    update() {
        const newStage = this.getGrowthStage();
        const stageChanged = newStage !== this.currentStage;

        if (stageChanged) {
            this.currentStage = newStage;
            this.rebuildMesh();
        }

        this.isHarvestable = this.getGrowthProgress() >= 1;
    }

    create() {
        this.rebuildMesh();
    }

    rebuildMesh() {
        // Supprimer l'ancien mesh
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.disposeMesh(this.mesh);
        }

        const stage = GROWTH_STAGES[this.currentStage];
        const progress = this.getGrowthProgress();

        // Créer le groupe de la plante
        this.mesh = new THREE.Group();
        this.mesh.position.copy(this.position);

        // Fond de terre (pot ou sol)
        this.createSoil(stage);

        // Plante selon le stade
        if (this.currentStage === 0) {
            // Graine
            this.createSeed();
        } else if (this.currentStage === 1) {
            // Germination
            this.createSprout();
        } else if (this.currentStage === 2) {
            // Levée
            this.createSeedling();
        } else if (this.currentStage === 3) {
            // Croissance
            this.createGrowingPlant();
        } else {
            // Prête - plante mature
            this.createMaturePlant();
        }

        // Label avec nom et progression
        this.createLabel(stage, progress);

        this.scene.add(this.mesh);
    }

    createSoil(stage) {
        const soilGeom = new THREE.CylinderGeometry(0.4, 0.5, 0.2, 8);
        const soilMat = new THREE.MeshStandardMaterial({
            color: 0x5D4037,
            roughness: 0.9
        });
        const soil = new THREE.Mesh(soilGeom, soilMat);
        soil.position.y = 0.1;
        soil.castShadow = true;
        soil.receiveShadow = true;
        this.mesh.add(soil);
    }

    createSeed() {
        const seedGeom = new THREE.SphereGeometry(0.08, 8, 8);
        const seedMat = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.8
        });
        const seed = new THREE.Mesh(seedGeom, seedMat);
        seed.position.y = 0.25;
        seed.castShadow = true;
        this.mesh.add(seed);
    }

    createSprout() {
        // Petite tige avec feuille
        const stemGeom = new THREE.CylinderGeometry(0.02, 0.03, 0.3, 6);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x90EE90, roughness: 0.7 });
        const stem = new THREE.Mesh(stemGeom, stemMat);
        stem.position.y = 0.35;
        stem.castShadow = true;
        this.mesh.add(stem);

        // Feuilles naissantes
        const leafGeom = new THREE.SphereGeometry(0.08, 6, 6);
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x90EE90, roughness: 0.6 });
        const leaf = new THREE.Mesh(leafGeom, leafMat);
        leaf.position.y = 0.5;
        leaf.scale.set(1, 0.5, 1);
        leaf.castShadow = true;
        this.mesh.add(leaf);
    }

    createSeedling() {
        // Tige
        const stemGeom = new THREE.CylinderGeometry(0.03, 0.04, 0.5, 6);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x32CD32, roughness: 0.7 });
        const stem = new THREE.Mesh(stemGeom, stemMat);
        stem.position.y = 0.45;
        stem.castShadow = true;
        this.mesh.add(stem);

        // Feuilles
        const leafGeom = new THREE.SphereGeometry(0.12, 8, 8);
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x32CD32, roughness: 0.6 });

        const leaf1 = new THREE.Mesh(leafGeom, leafMat);
        leaf1.position.set(0.1, 0.6, 0);
        leaf1.scale.set(1, 0.5, 0.5);
        leaf1.castShadow = true;
        this.mesh.add(leaf1);

        const leaf2 = new THREE.Mesh(leafGeom, leafMat.clone());
        leaf2.position.set(-0.1, 0.55, 0);
        leaf2.scale.set(1, 0.5, 0.5);
        leaf2.castShadow = true;
        this.mesh.add(leaf2);
    }

    createGrowingPlant() {
        // Tige plus grande
        const stemGeom = new THREE.CylinderGeometry(0.04, 0.06, 0.8, 6);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.7 });
        const stem = new THREE.Mesh(stemGeom, stemMat);
        stem.position.y = 0.6;
        stem.castShadow = true;
        this.mesh.add(stem);

        // Feuilles multiples
        const leafGeom = new THREE.SphereGeometry(0.15, 8, 8);
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.6 });

        const positions = [
            [0.15, 0.7, 0],
            [-0.15, 0.65, 0.1],
            [0, 0.75, -0.12],
            [0.12, 0.9, 0.05],
            [-0.1, 0.85, -0.08]
        ];

        positions.forEach((pos, i) => {
            const leaf = new THREE.Mesh(leafGeom, leafMat.clone());
            leaf.position.set(...pos);
            leaf.scale.set(1, 0.6, 0.8);
            leaf.castShadow = true;
            this.mesh.add(leaf);
        });
    }

    createMaturePlant() {
        // Grande tige
        const stemGeom = new THREE.CylinderGeometry(0.05, 0.08, 1.2, 8);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x006400, roughness: 0.7 });
        const stem = new THREE.Mesh(stemGeom, stemMat);
        stem.position.y = 0.8;
        stem.castShadow = true;
        this.mesh.add(stem);

        // Feuilles luxuriantes
        const leafGeom = new THREE.SphereGeometry(0.2, 8, 8);
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x006400, roughness: 0.6 });

        const positions = [
            [0.2, 0.9, 0],
            [-0.2, 0.85, 0.15],
            [0.15, 0.95, -0.18],
            [-0.15, 1.1, 0.08],
            [0, 1.2, -0.1],
            [0.18, 1.15, 0.12],
            [-0.12, 1.3, 0]
        ];

        positions.forEach((pos, i) => {
            const leaf = new THREE.Mesh(leafGeom, leafMat.clone());
            leaf.position.set(...pos);
            leaf.scale.set(1, 0.7, 0.9);
            leaf.castShadow = true;
            this.mesh.add(leaf);
        });

        // Fruits/fleurs selon le type
        this.addPlantSpecifics();
    }

    addPlantSpecifics() {
        // Ajouter des fruits ou fleurs selon le type
        const fruitMat = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            roughness: 0.5
        });

        // Petits fruits rouges
        for (let i = 0; i < 5; i++) {
            const fruitGeom = new THREE.SphereGeometry(0.06, 6, 6);
            const fruit = new THREE.Mesh(fruitGeom, fruitMat.clone());
            fruit.position.set(
                (Math.random() - 0.5) * 0.4,
                1 + Math.random() * 0.4,
                (Math.random() - 0.5) * 0.4
            );
            fruit.castShadow = true;
            this.mesh.add(fruit);
        }
    }

    createLabel(stage, progress) {
        // Créer un sprite texte pour le nom et la progression
        // (simplifié - en vrai il faudrait un canvas texture)
    }

    disposeMesh(mesh) {
        mesh.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
    }

    destroy() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.disposeMesh(this.mesh);
            this.mesh = null;
        }
    }

    toJSON() {
        return {
            id: this.id,
            plantType: this.plantType,
            position: { x: this.position.x, y: this.position.y, z: this.position.z },
            plantedDate: this.plantedDate,
            daysToMaturity: this.daysToMaturity,
            name: this.name,
            icon: this.icon
        };
    }

    static fromJSON(scene, data) {
        return new GamePlant(scene, {
            ...data,
            position: new THREE.Vector3(data.position.x, data.position.y, data.position.z)
        });
    }
}

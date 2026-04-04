// =============================================
// Ludus Terrae V2 - Water System
// =============================================

import * as THREE from 'three';
import { WaterPlantsHelper } from '../helpers/waterPlantsHelper.js';
import { gameState } from '../stateManager.js';

export class WaterSystem {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.config = config;
        this.helper = new WaterPlantsHelper(scene);
        this.water = [];
        this.waterPlants = [];
    }

    create() {
        // Créer un plan d'eau si configuré
        if (this.config.includeWater) {
            this.createRiver(); // Rivière sinueuse au lieu d'un étang rond
        }

        // Créer des plantes aquatiques
        if (this.config.includeWaterPlants) {
            this.createRiverVegetation(); // Plantes le long de la rivière
        }

        console.log(`💧 ${this.water.length} plans d'eau créés`);
        console.log(`🌸 ${this.waterPlants.length} plantes aquatiques créées`);
        return [...this.water, ...this.waterPlants];
    }

    createRiver() {
        // Créer une rivière sinueuse en utilisant Shape + bezier curves
        const riverWidth = 4; // Largeur de la rivière
        this.riverWidth = riverWidth; // Pour utilisation dans createRiverTrees

        // Points de contrôle pour la rivière sinueuse
        // La rivière traverse le terrain de gauche à droite en wavy
        const shape = new THREE.Shape();

        // Point de départ (côté gauche du terrain)
        const startX = -40;
        const startY = 0;

        // Tracer la rivière avec des courbes de Bézier
        shape.moveTo(startX, startY);

        // Segment 1: vague vers le haut
        shape.bezierCurveTo(
            -20, 8,  // point de contrôle 1
            0, 12,    // point de contrôle 2
            10, 5     // point final
        );

        // Segment 2: vague vers le bas
        shape.bezierCurveTo(
            20, -2,
            30, -8,
            40, -5
        );

        // Segment 3: continuer vers la droite
        shape.bezierCurveTo(
            50, -2,
            55, 5,
            60, 0
        );

        // Créer la forme inverse pour faire un trou (ligne du bas de la rivière)
        const holePath = new THREE.Path();
        holePath.moveTo(startX, startY - riverWidth);
        holePath.bezierCurveTo(
            -20, 8 - riverWidth,
            0, 12 - riverWidth,
            10, 5 - riverWidth
        );
        holePath.bezierCurveTo(
            20, -2 - riverWidth,
            30, -8 - riverWidth,
            40, -5 - riverWidth
        );
        holePath.bezierCurveTo(
            50, -2 - riverWidth,
            55, 5 - riverWidth,
            60, 0 - riverWidth
        );

        // Créer le trou dans la shape
        shape.holes.push(holePath);

        // Géométrie de la rivière
        const riverGeometry = new THREE.ShapeGeometry(shape, 64);

        // Matériau de l'eau
        const riverMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a90a4,
            roughness: 0.15,
            metalness: 0.2,
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide
        });

        const riverMesh = new THREE.Mesh(riverGeometry, riverMaterial);
        riverMesh.rotation.x = -Math.PI / 2;
        riverMesh.position.y = 0.05;
        riverMesh.receiveShadow = true;
        this.water.push(riverMesh);
        this.scene.add(riverMesh);

        // Fond boueux de la rivière
        const bottomGeometry = new THREE.ShapeGeometry(shape, 64);
        const bottomMaterial = new THREE.MeshStandardMaterial({
            color: 0x5c4033, // Brun boueux
            roughness: 0.95
        });
        const bottomMesh = new THREE.Mesh(bottomGeometry, bottomMaterial);
        bottomMesh.rotation.x = -Math.PI / 2;
        bottomMesh.position.y = -0.3;
        this.water.push(bottomMesh);
        this.scene.add(bottomMesh);

        // Ajouter des arbres le long de la rivière
        this.addRiverStones(shape, riverWidth);
        this.createRiverTrees();
    }

    addRiverStones(shape, riverWidth) {
        // Remplacé par des arbres - voir createRiverTrees()
    }

    createRiverTrees() {
        // Arbres le long de la rivière (4x plus qu'avant les pierres = 30 arbres)
        const treeCount = 30;

        for (let i = 0; i < treeCount; i++) {
            const t = i / treeCount;
            const x = -40 + t * 100 + (Math.random() - 0.5) * 10;
            const baseY = Math.sin(t * Math.PI * 3) * 5;

            // Arbres sur les berges (intérieur et extérieur des courbes)
            const side = Math.random() > 0.5 ? 1 : -1;
            const z = baseY + side * (this.riverWidth/2 + 2 + Math.random() * 8);

            const treeHeight = 3 + Math.random() * 4;
            const trunkHeight = treeHeight * 0.4;
            const trunkRadius = 0.15 + Math.random() * 0.15;

            // Tronc (geometry simplifié)
            const trunkGeom = new THREE.CylinderGeometry(trunkRadius * 0.7, trunkRadius, trunkHeight, 4);
            const trunkMat = new THREE.MeshStandardMaterial({
                color: 0x5D4037,
                roughness: 0.9
            });
            const trunk = new THREE.Mesh(trunkGeom, trunkMat);
            trunk.position.set(x, trunkHeight / 2, z);
            trunk.castShadow = true;
            trunk.receiveShadow = true;
            this.water.push(trunk);
            this.scene.add(trunk);

            // Feuillage (cône simplifié 5 côtés)
            const foliageColors = [0x228B22, 0x2E8B57, 0x3CB371, 0x90EE90];
            const foliageColor = foliageColors[Math.floor(Math.random() * foliageColors.length)];
            const foliageRadius = 0.8 + Math.random() * 1;
            const foliageHeight = 1.5 + Math.random() * 1.5;

            const foliageGeom = new THREE.ConeGeometry(foliageRadius, foliageHeight, 5);
            const foliageMat = new THREE.MeshStandardMaterial({
                color: foliageColor,
                roughness: 0.8
            });
            const foliage = new THREE.Mesh(foliageGeom, foliageMat);
            foliage.position.set(x, trunkHeight + foliageHeight / 2, z);
            foliage.castShadow = false; // Désactivé pour réduire le lag
            this.water.push(foliage);
            this.scene.add(foliage);
        }
    }

    createRiverVegetation() {
        // Plantes aquatiques le long de la rivière
        const plantCount = this.config.waterPlantCount || 20;

        for (let i = 0; i < plantCount; i++) {
            const t = i / plantCount;
            const x = -40 + t * 100 + (Math.random() - 0.5) * 5;
            const baseY = Math.sin(t * Math.PI * 3) * 5;
            const z = baseY + (Math.random() - 0.5) * 8;

            const position = new THREE.Vector3(x, 0, z);

            const plantType = Math.random();

            if (plantType < 0.25) {
                const reed = this.helper.createReed(position, 1.5 + Math.random() * 1);
                this.waterPlants.push(reed);
                this.scene.add(reed);
            } else if (plantType < 0.5) {
                const lily = this.helper.createWaterLily(position, 0.4 + Math.random() * 0.3);
                this.waterPlants.push(lily);
                this.scene.add(lily);
            } else if (plantType < 0.75) {
                const creekGrass = this.helper.createCreekGrass(position, 0.8 + Math.random() * 0.5);
                this.waterPlants.push(creekGrass);
                this.scene.add(creekGrass);
            } else {
                const pondGrass = this.helper.createPondTallGrass(position, 2 + Math.random() * 1);
                this.waterPlants.push(pondGrass);
                this.scene.add(pondGrass);
            }
        }
    }

    updateWeather(weather) {
        // Modifie l'apparence de l'eau selon la météo
        this.water.forEach(waterMesh => {
            if (waterMesh.material && waterMesh.material.opacity !== undefined) {
                if (weather === 'rainy') {
                    waterMesh.material.opacity = 0.9;
                    waterMesh.material.color.setHex(0x3a7080);
                } else if (weather === 'clear') {
                    waterMesh.material.opacity = 0.7;
                    waterMesh.material.color.setHex(0x4a90a4);
                }
            }
        });
    }

    destroy() {
        [...this.water, ...this.waterPlants].forEach(obj => {
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
        this.water = [];
        this.waterPlants = [];
    }
}

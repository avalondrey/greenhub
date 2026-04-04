// =============================================
// Ludus Terrae V2 - Mini Serre 3D
// Structure de serre avec plantes en croissance
// =============================================

import * as THREE from 'three';

export const GROWTH_STAGES = [
    { name: 'graine',      emoji: '🟤', scale: 0.2, color: 0x8B4513, height: 0.1 },
    { name: 'germination', emoji: '🌱', scale: 0.4, color: 0x90EE90, height: 0.2 },
    { name: 'levée',       emoji: '🌿', scale: 0.6, color: 0x32CD32, height: 0.4 },
    { name: 'croissance',  emoji: '🌿', scale: 0.8, color: 0x228B22, height: 0.7 },
    { name: 'prête',       emoji: '🪴', scale: 1.0, color: 0x006400, height: 1.0 },
];

export class MiniSerre3D {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.id = config.id || Date.now();
        this.name = config.name || 'Mini Serre';
        this.position = config.position || new THREE.Vector3(0, 0, 0);

        // Grille: 4 colonnes x 6 rangées (comme dans l'app)
        this.cols = 4;
        this.rows = 6;
        this.cellSize = 1.2;

        // Plantes: array de GamePlant ou null
        this.plants = Array(this.cols * this.rows).fill(null);

        this.group = null;
        this.plantMeshes = [];
        this.selectedCell = null;
        this.highlightMesh = null;

        this.create();
    }

    create() {
        this.group = new THREE.Group();
        this.group.position.copy(this.position);

        // Créer la structure de la serre
        this.createStructure();

        // Créer les pots/socles pour chaque alvéole
        this.createCells();

        // Highlight pour sélection
        this.createHighlight();

        this.scene.add(this.group);
    }

    createStructure() {
        const width = this.cols * this.cellSize + 2;
        const depth = this.rows * this.cellSize + 2;
        const height = 3;

        // Base (plateforme en bois)
        const baseGeom = new THREE.BoxGeometry(width, 0.3, depth);
        const baseMat = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.8
        });
        const base = new THREE.Mesh(baseGeom, baseMat);
        base.position.y = 0.15;
        base.castShadow = true;
        base.receiveShadow = true;
        this.group.add(base);

        // Armature métallique (poteaux)
        const poleGeom = new THREE.CylinderGeometry(0.05, 0.05, height, 8);
        const poleMat = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.3,
            metalness: 0.8
        });

        // 4 coins
        const corners = [
            [-width/2 + 0.1, height/2, -depth/2 + 0.1],
            [width/2 - 0.1, height/2, -depth/2 + 0.1],
            [-width/2 + 0.1, height/2, depth/2 - 0.1],
            [width/2 - 0.1, height/2, depth/2 - 0.1],
        ];

        corners.forEach(pos => {
            const pole = new THREE.Mesh(poleGeom, poleMat);
            pole.position.set(...pos);
            pole.castShadow = true;
            this.group.add(pole);
        });

        // Toit (vitre) - deux pentes
        const roofGeom = new THREE.BufferGeometry();
        const roofVertices = new Float32Array([
            // Face avant gauche
            -width/2, height, -depth/2,
            width/2, height, -depth/2,
            -width/2, height + 1.2, 0,
            // Face avant droite
            width/2, height, -depth/2,
            width/2, height + 1.2, 0,
            -width/2, height + 1.2, 0,
            // Face arrière gauche
            -width/2, height, depth/2,
            -width/2, height + 1.2, 0,
            width/2, height, depth/2,
            // Face arrière droite
            width/2, height, depth/2,
            -width/2, height + 1.2, 0,
            width/2, height + 1.2, 0,
        ]);

        const roofColors = [];
        for (let i = 0; i < 12; i++) {
            roofColors.push(0.6, 0.9, 0.6, 0.3); // Vert透明
        }

        roofGeom.setAttribute('position', new THREE.BufferAttribute(roofVertices, 3));
        roofGeom.setAttribute('color', new THREE.BufferAttribute(new Float32Array(roofColors), 4));

        const roofMat = new THREE.MeshBasicMaterial({
            vertexColors: true,
            transparent: true,
            side: THREE.DoubleSide
        });

        const roof = new THREE.Mesh(roofGeom, roofMat);
        roof.position.y = 0;
        this.group.add(roof);

        // Parois en verre (transparent)
        const glassMat = new THREE.MeshBasicMaterial({
            color: 0x88CC88,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });

        // Parois avant et arrière
        const glassGeom1 = new THREE.PlaneGeometry(width, height);
        const glass1 = new THREE.Mesh(glassGeom1, glassMat);
        glass1.position.set(0, height/2 + 0.3, -depth/2 + 0.05);
        this.group.add(glass1);

        const glass2 = new THREE.Mesh(glassGeom1, glassMat);
        glass2.position.set(0, height/2 + 0.3, depth/2 - 0.05);
        glass2.rotation.y = Math.PI;
        this.group.add(glass2);

        // Parois latérales
        const glassGeom2 = new THREE.PlaneGeometry(depth - 0.5, height);
        const glass3 = new THREE.Mesh(glassGeom2, glassMat);
        glass3.position.set(-width/2 + 0.05, height/2 + 0.3, 0);
        glass3.rotation.y = Math.PI / 2;
        this.group.add(glass3);

        const glass4 = new THREE.Mesh(glassGeom2, glassMat);
        glass4.position.set(width/2 - 0.05, height/2 + 0.3, 0);
        glass4.rotation.y = -Math.PI / 2;
        this.group.add(glass4);
    }

    createCells() {
        const startX = -(this.cols - 1) * this.cellSize / 2;
        const startZ = -(this.rows - 1) * this.cellSize / 2;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const idx = row * this.cols + col;
                const x = startX + col * this.cellSize;
                const z = startZ + row * this.cellSize;

                // Pot de fleur
                const potGeom = new THREE.CylinderGeometry(0.4, 0.3, 0.4, 8);
                const potMat = new THREE.MeshStandardMaterial({
                    color: 0xD2691E,
                    roughness: 0.7
                });
                const pot = new THREE.Mesh(potGeom, potMat);
                pot.position.set(x, 0.5, z);
                pot.castShadow = true;
                pot.receiveShadow = true;
                this.group.add(pot);

                // Terre dans le pot
                const soilGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 8);
                const soilMat = new THREE.MeshStandardMaterial({
                    color: 0x5D4037,
                    roughness: 0.9
                });
                const soil = new THREE.Mesh(soilGeom, soilMat);
                soil.position.set(x, 0.7, z);
                this.group.add(soil);
            }
        }
    }

    createHighlight() {
        const highlightGeom = new THREE.RingGeometry(0.45, 0.55, 16);
        const highlightMat = new THREE.MeshBasicMaterial({
            color: 0x2ecc71,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        this.highlightMesh = new THREE.Mesh(highlightGeom, highlightMat);
        this.highlightMesh.rotation.x = -Math.PI / 2;
        this.highlightMesh.position.y = 0.75;
        this.highlightMesh.visible = false;
        this.group.add(this.highlightMesh);
    }

    getCellAt(localX, localZ) {
        const startX = -(this.cols - 1) * this.cellSize / 2;
        const startZ = -(this.rows - 1) * this.cellSize / 2;

        const col = Math.round((localX - startX) / this.cellSize);
        const row = Math.round((localZ - startZ) / this.cellSize);

        if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
            return row * this.cols + col;
        }
        return null;
    }

    getCellPosition(idx) {
        const row = Math.floor(idx / this.cols);
        const col = idx % this.cols;
        const startX = -(this.cols - 1) * this.cellSize / 2;
        const startZ = -(this.rows - 1) * this.cellSize / 2;
        return new THREE.Vector3(
            startX + col * this.cellSize,
            0,
            startZ + row * this.cellSize
        );
    }

    selectCell(idx) {
        this.selectedCell = idx;
        if (idx !== null) {
            const pos = this.getCellPosition(idx);
            this.highlightMesh.position.x = pos.x;
            this.highlightMesh.position.z = pos.z;
            this.highlightMesh.visible = true;
        } else {
            this.highlightMesh.visible = false;
        }
    }

    addPlant(plantData, idx) {
        if (idx < 0 || idx >= this.plants.length) return false;
        if (this.plants[idx] !== null) return false; // Cellule occupée

        const plant = new PlantInSerre(this.scene, this, idx, plantData);
        this.plants[idx] = plant;
        return true;
    }

    removePlant(idx) {
        if (idx < 0 || idx >= this.plants.length) return;
        if (this.plants[idx]) {
            this.plants[idx].destroy();
            this.plants[idx] = null;
        }
    }

    getPlantAt(idx) {
        return this.plants[idx];
    }

    update(deltaTime) {
        // Mettre à jour toutes les plantes
        this.plants.forEach(plant => {
            if (plant) {
                plant.update(deltaTime);
            }
        });
    }

    destroy() {
        this.plants.forEach(plant => {
            if (plant) plant.destroy();
        });
        this.scene.remove(this.group);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            position: { x: this.position.x, y: this.position.y, z: this.position.z },
            plants: this.plants.map(p => p ? p.toJSON() : null)
        };
    }
}

// =============================================
// Plant in Serre - Plante qui pousse dans une serre
// =============================================
class PlantInSerre {
    constructor(scene, serre, cellIdx, data = {}) {
        this.scene = scene;
        this.serre = serre;
        this.cellIdx = cellIdx;

        this.plantType = data.plantType || 'generic';
        this.plantId = data.plantId || 'tomato';
        this.name = data.name || 'Tomate';
        this.icon = data.icon || '🍅';
        this.color = data.color || 0xff0000;

        // Dates de croissance
        this.plantedDate = data.plantedDate || Date.now();
        this.daysToMaturity = data.daysToMaturity || 30;

        this.mesh = null;
        this.growthStage = 0;
        this.create();
    }

    getGrowthProgress() {
        const days = (Date.now() - this.plantedDate) / (1000 * 60 * 60 * 24);
        return Math.min(days / this.daysToMaturity, 1);
    }

    getGrowthStageIndex() {
        const progress = this.getGrowthProgress();
        return Math.min(
            Math.floor(progress * GROWTH_STAGES.length),
            GROWTH_STAGES.length - 1
        );
    }

    update(deltaTime) {
        const newStage = this.getGrowthStageIndex();
        if (newStage !== this.growthStage) {
            this.growthStage = newStage;
            this.rebuildMesh();
        }
    }

    create() {
        this.rebuildMesh();
    }

    rebuildMesh() {
        if (this.mesh) {
            this.serre.group.remove(this.mesh);
            this.disposeMesh(this.mesh);
        }

        const stage = GROWTH_STAGES[this.growthStage];
        const pos = this.serre.getCellPosition(this.cellIdx);

        this.mesh = new THREE.Group();
        this.mesh.position.set(pos.x, 0.75, pos.z);

        // Tige
        const stemHeight = 0.3 + stage.height * 0.5;
        const stemGeom = new THREE.CylinderGeometry(0.03, 0.05, stemHeight, 6);
        const stemMat = new THREE.MeshStandardMaterial({
            color: stage.color,
            roughness: 0.7
        });
        const stem = new THREE.Mesh(stemGeom, stemMat);
        stem.position.y = stemHeight / 2;
        stem.castShadow = true;
        this.mesh.add(stem);

        // Feuilles selon le stade
        if (this.growthStage >= 1) {
            const leafCount = Math.min(this.growthStage + 1, 5);
            const leafGeom = new THREE.SphereGeometry(0.12, 8, 8);
            const leafMat = new THREE.MeshStandardMaterial({
                color: stage.color,
                roughness: 0.6
            });

            for (let i = 0; i < leafCount; i++) {
                const angle = (i / leafCount) * Math.PI * 2;
                const leaf = new THREE.Mesh(leafGeom, leafMat.clone());
                leaf.position.set(
                    Math.cos(angle) * 0.15,
                    stemHeight * 0.5 + i * 0.1,
                    Math.sin(angle) * 0.15
                );
                leaf.scale.set(1, 0.5, 1);
                leaf.castShadow = true;
                this.mesh.add(leaf);
            }
        }

        // Fruits si prêt (stade 4)
        if (this.growthStage >= 4) {
            const fruitGeom = new THREE.SphereGeometry(0.08, 8, 8);
            const fruitMat = new THREE.MeshStandardMaterial({
                color: this.color,
                roughness: 0.5
            });

            for (let i = 0; i < 4; i++) {
                const fruit = new THREE.Mesh(fruitGeom, fruitMat.clone());
                fruit.position.set(
                    (Math.random() - 0.5) * 0.3,
                    stemHeight + 0.1 + Math.random() * 0.2,
                    (Math.random() - 0.5) * 0.3
                );
                fruit.castShadow = true;
                this.mesh.add(fruit);
            }
        }

        this.serre.group.add(this.mesh);
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
            this.serre.group.remove(this.mesh);
            this.disposeMesh(this.mesh);
            this.mesh = null;
        }
    }

    toJSON() {
        return {
            plantType: this.plantType,
            plantId: this.plantId,
            name: this.name,
            icon: this.icon,
            color: this.color,
            plantedDate: this.plantedDate,
            daysToMaturity: this.daysToMaturity
        };
    }
}

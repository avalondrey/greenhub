// =============================================
// Ludus Terrae V2 - Building System
// =============================================

import * as THREE from 'three';
import { createWoodTexture, createStoneTexture } from '../realisticUtil.js';

export class BuildingSystem {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.config = config;
        this.buildings = [];
    }

    create() {
        // Bâtiments optionnels selon la config
        if (!this.config.includeBuildings) {
            console.log('🏠 Aucun bâtiment (désactivé)');
            return this.buildings;
        }

        const buildingCount = this.config.buildingCount || 5;

        for (let i = 0; i < buildingCount; i++) {
            const x = (Math.random() - 0.5) * (this.config.worldSize || 100);
            const z = (Math.random() - 0.5) * (this.config.worldSize || 100);
            const position = new THREE.Vector3(x, 0, z);

            const building = this.createCottage(position);
            this.buildings.push(building);
            this.scene.add(building);
        }

        console.log(`🏠 ${this.buildings.length} bâtiments créés`);
        return this.buildings;
    }

    createCottage(position) {
        const building = new THREE.Group();
        building.position.copy(position);

        const woodTexture = createWoodTexture();
        const stoneTexture = createStoneTexture();

        // Fondation
        const foundationGeom = new THREE.BoxGeometry(4, 0.5, 3);
        const foundationMat = new THREE.MeshStandardMaterial({ map: stoneTexture, roughness: 0.9 });
        const foundation = new THREE.Mesh(foundationGeom, foundationMat);
        foundation.position.y = 0.25;
        foundation.castShadow = true;
        foundation.receiveShadow = true;
        building.add(foundation);

        // Murs
        const wallGeom = new THREE.BoxGeometry(3.5, 2.5, 2.5);
        const wallMat = new THREE.MeshStandardMaterial({ map: woodTexture, roughness: 0.8 });
        const walls = new THREE.Mesh(wallGeom, wallMat);
        walls.position.y = 1.5;
        walls.castShadow = true;
        walls.receiveShadow = true;
        building.add(walls);

        // Toit
        const roofGeom = new THREE.ConeGeometry(3, 2, 4);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.7 });
        const roof = new THREE.Mesh(roofGeom, roofMat);
        roof.position.y = 3.5;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        roof.receiveShadow = true;
        building.add(roof);

        // Porte
        const doorGeom = new THREE.BoxGeometry(0.8, 1.5, 0.1);
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.6 });
        const door = new THREE.Mesh(doorGeom, doorMat);
        door.position.set(0, 0.75, 1.26);
        building.add(door);

        // Fenêtres
        const windowGeom = new THREE.BoxGeometry(0.5, 0.5, 0.1);
        const windowMat = new THREE.MeshStandardMaterial({ color: 0x87CEEB, roughness: 0.2, metalness: 0.3 });

        const windowLeft = new THREE.Mesh(windowGeom, windowMat);
        windowLeft.position.set(-1, 1.5, 1.26);
        building.add(windowLeft);

        const windowRight = new THREE.Mesh(windowGeom, windowMat);
        windowRight.position.set(1, 1.5, 1.26);
        building.add(windowRight);

        return building;
    }

    destroy() {
        this.buildings.forEach(building => {
            this.scene.remove(building);
            building.traverse(child => {
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
        this.buildings = [];
    }
}

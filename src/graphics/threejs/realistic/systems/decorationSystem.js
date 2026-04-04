// =============================================
// Ludus Terrae V2 - Decoration System
// =============================================

import * as THREE from 'three';
import { RocksHelper } from '../helpers/rocksHelper.js';

export class DecorationSystem {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.config = config;
        this.helper = new RocksHelper(scene);
        this.decorations = [];
    }

    create() {
        const rockCount = this.config.rockCount || 40;

        for (let i = 0; i < rockCount; i++) {
            const x = (Math.random() - 0.5) * (this.config.worldSize || 100);
            const z = (Math.random() - 0.5) * (this.config.worldSize || 100);
            const position = new THREE.Vector3(x, 0, z);

            const rockType = Math.random();
            let rock;

            if (rockType < 0.3) {
                rock = this.helper.createSingleRock(0.3 + Math.random() * 0.5);
            } else if (rockType < 0.5) {
                rock = this.helper.createRockCluster(position);
            } else if (rockType < 0.7) {
                rock = this.helper.createMossyRock(position, 0.4 + Math.random() * 0.4);
            } else if (rockType < 0.85) {
                rock = this.helper.createLargeRock(position, 0.8 + Math.random() * 0.8);
            } else {
                rock = this.helper.createCreekRock(position, 0.3 + Math.random() * 0.3);
            }

            this.decorations.push(rock);
            this.scene.add(rock);
        }

        console.log(`🪨 ${this.decorations.length} décorations rocheuses créées`);
        return this.decorations;
    }

    destroy() {
        this.decorations.forEach(dec => {
            this.scene.remove(dec);
            dec.traverse(child => {
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
        this.decorations = [];
    }
}

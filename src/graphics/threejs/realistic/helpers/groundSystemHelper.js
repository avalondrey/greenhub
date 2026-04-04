// =============================================
// Ludus Terrae V2 - Ground System Helper
// ==============================================

import * as THREE from 'three';
import { createHeightMappedTerrain, addTerrainDetails } from '../realisticUtil.js';

/**
 * Classe de gestion du sol réaliste
 */
export class GroundSystem {
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.plane = null;
    }

    create() {
        const texture = this.createTexture();
        const geometry = this.createTerrainGeometry();
        const material = this.createMaterial(texture);

        this.plane = new THREE.Mesh(geometry, material);
        this.plane.rotation.x = -Math.PI / 2;

        // Configuration des ombres
        if (this.config.shadows) {
            this.plane.receiveShadow = true;
        }

        this.scene.add(this.plane);
        return this.plane;
    }

    createTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        const groundColor = this.config.baseColor || [0x795548, 0x8d6e63, 0x6d4c41];
        ctx.fillStyle = this.colorArrayToHex(groundColor);
        ctx.fillRect(0, 0, 512, 512);

        // Textures locales
        const noiseLevel = this.config.noiseLevel || 0.1;
        for (let i = 0; i < 1000; i++) {
            ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * noiseLevel})`;
            ctx.fillRect(
                Math.random() * 512,
                Math.random() * 512,
                Math.random() * 20,
                Math.random() * 20
            );
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 10);
        return texture;
    }

    createTerrainGeometry() {
        if (this.config.noise && this.config.noise.level > 0) {
            // Perlin ou bruit procédural
            return createHeightMappedTerrain();
        }

        const geometry = new THREE.PlaneGeometry(200, 200, 64, 64);
        return geometry;
    }

    createMaterial(texture) {
        const materialConfig = {
            map: texture,
            roughness: this.config.roughness || 0.8,
            metalness: this.config.metalness || 0.0,
            side: THREE.DoubleSide
        };

        return new THREE.MeshStandardMaterial(materialConfig);
    }

    colorArrayToHex(colors) {
        let r = 0, g = 0, b = 0;
        const count = colors.length;
        
        colors.forEach((c) => {
            r += (c >> 16) & 0xFF;
            g += (c >> 8) & 0xFF;
            b += c & 0xFF;
        });
        
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        
        return `rgb(${r}, ${g}, ${b})`;
    }
}
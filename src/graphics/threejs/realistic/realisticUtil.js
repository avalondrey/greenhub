// =============================================
// Ludus Terrae V2 - Realistic Utility Functions
// ==============================================

import * as THREE from 'three';
import { gameState } from './stateManager.js';

/**
 * Configuration des couleurs par saison
 */
export const SEASON_COLORS = {
    spring: {
        grass: 0x7ec850,
        flowers: [0xff6b6b, 0xffd93d, 0x6bcb77, 0x4d96ff],
        leaves: [0x88e05c, 0x9be15d, 0x94d458]
    },
    summer: {
        grass: 0x5eb859,
        flowers: [0xff69b4, 0xff6347, 0x9370db, 0x00ced1],
        leaves: [0x228B22, 0x32CD32, 0x3cb371]
    },
    autumn: {
        grass: 0x8B7355,
        flowers: [0xd2691e, 0xff8c00, 0xb8860b, 0xcd5c5c],
        leaves: [0xaa5522, 0xaa4422, 0x883311]
    },
    winter: {
        grass: 0xeeeeee,
        flowers: [0xffffff, 0xffffff],
        leaves: [0xffffff, 0xcccccc]
    }
};

/**
 * Fonction utilitaire pour générer les couleurs selon la saison
 */
export function getSeasonalColor(leafIndex, flowerIndex = null) {
    const season = gameState.getSeason();
    const colors = SEASON_COLORS[season] || SEASON_COLORS.spring;
    
    if (flowerIndex !== null) {
        return colors.flowers[flowerIndex % colors.flowers.length];
    } else {
        return colors.leaves[leafIndex % colors.leaves.length];
    }
}

/**
 * Création d'un terrain avec dégradé de hauteur (procédure)
 */
export function createHeightMappedTerrain(size, segments = 32) {
    const geometry = new THREE.PlaneGeometry(size.width, size.depth, segments, segments);
    const positions = geometry.attributes.position.array;
    
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        
        // Génération simple de pente
        positions[i + 2] = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 0.3;
    }
    
    geometry.computeVertexNormals();
    return geometry;
}

/**
 * Ajout de détails au sol (rochers, trous, bosses)
 */
export function addTerrainDetails(terrain, detailRatio = 0.1) {
    // Cette fonction pourrait ajouter des détails procéduraux
    return terrain;
}

/**
 * Génération de particules pour l'atmosphère
 */
export function createParticles(scene, count = 100) {
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = Math.random() * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

        // Couleurs selon la saison
        const colorsList = gameState.getSeason() === 'spring' ? [1, 0.4, 0.4] : [1, 1, 1];
        colors[i * 3] = colorsList[0] * Math.random();
        colors[i * 3 + 1] = colorsList[1] * Math.random();
        colors[i * 3 + 2] = colorsList[2] * Math.random();
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return particles;
}

/**
 * Création de texture naturelle procédurale
 */
export function createNaturalTexture(type = 'grass') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    if (type === 'waterLily') {
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = `rgba(34, 139, 34, ${Math.random() * 0.5})`;
            ctx.beginPath();
            ctx.arc(Math.random() * 256, Math.random() * 256, Math.random() * 10 + 2, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (type === 'waterLilyFlower') {
        ctx.fillStyle = '#FF69B4';
        ctx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 8; i++) {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.3})`;
            ctx.beginPath();
            ctx.ellipse(128, 80 + i * 15, 20, 30, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (type === 'grass') {
        ctx.fillStyle = '#5eb859';
        ctx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 100; i++) {
            ctx.fillStyle = `rgba(80, 180, 60, ${Math.random() * 0.4})`;
            ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 10);
        }
    } else if (type === 'waterFlower') {
        ctx.fillStyle = '#FFB6C1';
        ctx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 6; i++) {
            ctx.fillStyle = `rgba(255, 182, 193, ${0.5 + Math.random() * 0.5})`;
            ctx.beginPath();
            ctx.ellipse(128 + Math.cos(i) * 30, 128 + Math.sin(i) * 30, 15, 25, i * Math.PI / 3, 0, Math.PI * 2);
            ctx.fill();
        }
    } else {
        // Default procedural texture
        ctx.fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        ctx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 500; i++) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
            ctx.fillRect(Math.random() * 256, Math.random() * 256, Math.random() * 10, Math.random() * 2);
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

/**
 * Rendu d'un texture procédurale simple
 */
export function createProceduralTexture(width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Fond
    ctx.fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    ctx.fillRect(0, 0, width, height);

    // Bruit aléatoire
    for (let i = 0; i < 1000; i++) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(
            Math.random() * width,
            Math.random() * height,
            Math.random() * 50,
            2
        );
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

/**
 * Animation d'objets de base (rotation lente, flottement)
 */
export function createAnimatedObject(object) {
    object.userData = {
        rotationSpeed: {
            x: (Math.random() - 0.5) * 0.01,
            y: (Math.random() - 0.5) * 0.01,
            z: (Math.random() - 0.5) * 0.01
        },
        floatSpeed: Math.random() * 0.01 + 0.005,
        floatOffset: Math.random() * Math.PI * 2
    };
    return object;
}

/**
 * Génération d'une couleur aléatoire réaliste (tons naturelles)
 */
export function getRandomNaturalColor(
    minHue = 0,
    maxHue = 360,
    minSat = 20,
    maxSat = 100,
    minLight = 30,
    maxLight = 80
) {
    const hue = Math.random() * (maxHue - minHue) + minHue;
    const sat = Math.random() * (maxSat - minSat) + minSat;
    const light = Math.random() * (maxLight - minLight) + minLight;
    return new THREE.Color(`hsl(${hue}, ${sat}%, ${light}%)`);
}

/**
 * Configuration d'ombre réaliste
 */
export function setupShadows(scene, enable = true) {
    scene.traverse((object) => {
        if (object.isMesh && object.castShadow && object.receiveShadow) {
            object.castShadow = enable;
            object.receiveShadow = enable;
        }
    });
    return scene;
}

/**
 * Animation cyclique de paramètre
 */
export function cyclicAnimation(value, min, max, speed = 1, offset = 0) {
    return min + (max - min) * (0.5 + 0.5 * Math.sin(Date.now() * speed * 0.001 + offset));
}

/**
 * Génération de texture de bois
 */
export function createWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, '#8d6e63');
    gradient.addColorStop(0.1, '#a1887f');
    gradient.addColorStop(0.2, '#8d6e63');
    gradient.addColorStop(0.3, '#6d4c41');
    gradient.addColorStop(0.4, '#a1887f');
    gradient.addColorStop(0.5, '#8d6e63');
    gradient.addColorStop(0.6, '#a1887f');
    gradient.addColorStop(0.7, '#6d4c41');
    gradient.addColorStop(0.8, '#8d6e63');
    gradient.addColorStop(0.9, '#a1887f');
    gradient.addColorStop(1, '#8d6e63');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    // Linéations
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * 50);
        ctx.lineTo(512, i * 50 + Math.random() * 20);
        ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

/**
 * Génération de texture de pierre
 */
export function createStoneTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = averageColorToHex([0x6d4c41, 0x5d4037, 0x4e342e, 0x795548]);
    ctx.fillRect(0, 0, 512, 512);

    // Imperfections
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 8 + 2;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.15})`;
        ctx.fillRect(x, y, size, size);
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

/**
 * Utilitaire pour convertir couleur moyenne en hex
 */
function averageColorToHex(colors) {
    let r = 0, g = 0, b = 0;
    const count = colors.length;
    
    colors.forEach((c, i) => {
        r += (c >> 16) & 0xFF;
        g += (c >> 8) & 0xFF;
        b += c & 0xFF;
    });
    
    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);
    
    return `rgb(${r}, ${g}, ${b})`;
}
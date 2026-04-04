// =============================================
// Ludus Terrae V2 - Water Plants Helper
// ==============================================

import * as THREE from 'three';
import { createNaturalTexture, getRandomNaturalColor } from '../realisticUtil.js';

/**
 * Helper pour la création de plantes aquatiques et de fleurs de l'eau
 */
export class WaterPlantsHelper {
    constructor(scene) {
        this.scene = scene;
    }

    createWaterLily(position, size = 1.0) {
        const group = new THREE.Group();
        group.position.copy(position);
        
        // Feuilles
        const leafMaterial = new THREE.MeshStandardMaterial({
            map: createNaturalTexture('waterLily'),
            roughness: 0.6,
            side: THREE.DoubleSide
        });

        for (let i = 0; i < 4; i++) {
            const leafGeometry = new THREE.CircleGeometry(size * 0.8, 16);
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial.clone());
            
            const angle = (i / 4) * Math.PI * 2;
            leaf.position.set(
                Math.cos(angle) * size * 0.3,
                size * 0.15,
                Math.sin(angle) * size * 0.3
            );
            leaf.rotation.y = -angle;
            leaf.rotation.x = Math.PI / 3;
            leaf.castShadow = true;
            
            group.add(leaf);
        }

        // Fleurs
        const flowerMaterial = new THREE.MeshStandardMaterial({
            map: createNaturalTexture('waterLilyFlower'),
            roughness: 0.4,
            side: THREE.DoubleSide
        });

        const flowerGeometry = new THREE.CircleGeometry(size * 0.3, 8);
        const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
        flower.position.y = size * 0.4;
        flower.rotation.x = -Math.PI / 4;
        flower.castShadow = true;
        
        group.add(flower);

        return group;
    }

    createReed(position, height = 1.5) {
        const group = new THREE.Group();
        group.position.copy(position);

        // Tige
        const stemGeometry = new THREE.CylinderGeometry(0.05, 0.1, height, 8);
        const stemMaterial = new THREE.MeshStandardMaterial({
            color: getRandomNaturalColor(100, 160, 50, 100, 20, 60),
            roughness: 0.8,
            emissive: new THREE.Color(getRandomNaturalColor(40, 80, 0, 30, 0, 20))
        });

        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = height / 2;
        stem.castShadow = true;
        
        group.add(stem);

        // Feuilles
        const bladeMaterial = new THREE.MeshStandardMaterial({
            color: getRandomNaturalColor(120, 180, 60, 120, 25, 70),
            roughness: 0.6
        });

        for (let i = 0; i < 4; i++) {
            const bladeGeometry = new THREE.PlaneGeometry(height * 0.8, height * 0.08);
            const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
            
            const angle = (i / 4) * Math.PI * 2;
            blade.position.set(
                Math.cos(angle) * height * 0.15,
                height * 0.8,
                Math.sin(angle) * height * 0.15
            );
            blade.rotation.y = -angle + Math.PI / 4;
            blade.rotation.x = Math.PI / 4;
            blade.castShadow = true;
            
            group.add(blade);
        }

        // Bouton fleuri
        const flowerGeometry = new THREE.SphereGeometry(height * 0.08, 8, 8);
        const flowerMaterial = new THREE.MeshStandardMaterial({
            color: getRandomNaturalColor(100, 140, 50, 90, 20, 55),
            roughness: 0.4
        });

        const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
        flower.position.y = height * 0.9;
        flower.castShadow = true;
        
        group.add(flower);

        return group;
    }

    createCreekGrass(position, size = 0.8) {
        const group = new THREE.Group();
        group.position.copy(position);

        const bladeMaterial = new THREE.MeshStandardMaterial({
            map: createNaturalTexture('grass'),
            roughness: 0.7,
            side: THREE.DoubleSide
        });

        for (let i = 0; i < 12; i++) {
            const bladeGeometry = new THREE.PlaneGeometry(size * 0.05, size * 0.5);
            const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
            
            const angle = (i / 12) * Math.PI * 2;
            blade.position.set(
                Math.cos(angle) * size * 0.2,
                size * 0.25,
                Math.sin(angle) * size * 0.2
            );
            blade.rotation.y = -angle;
            blade.rotation.x = Math.PI / 8;
            blade.rotation.z = Math.sin(Math.random() * Math.PI) * 0.3;
            blade.castShadow = true;
            
            group.add(blade);
        }

        return group;
    }

    createWaterFlowerSmall(position, size = 0.4) {
        const group = new THREE.Group();
        group.position.copy(position);

        // Tige
        const stemGeometry = new THREE.CylinderGeometry(0.02, 0.03, size * 0.6, 6);
        const stemMaterial = new THREE.MeshStandardMaterial({
            color: getRandomNaturalColor(80, 130, 30, 80, 10, 45),
            roughness: 0.75
        });

        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = size * 0.3;
        stem.rotation.z = Math.sin(Math.random() * Math.PI) * 0.15;
        
        group.add(stem);

        // Pétale
        const petalMaterial = new THREE.MeshStandardMaterial({
            map: createNaturalTexture('waterFlower'),
            roughness: 0.5,
            side: THREE.DoubleSide
        });

        for (let i = 0; i < 5; i++) {
            const petalGeometry = new THREE.ConeGeometry(0.03, size * 0.3, 8);
            const petal = new THREE.Mesh(petalGeometry, petalMaterial);
            
            const angle = (i / 5) * Math.PI * 2;
            petal.position.set(
                Math.cos(angle) * 0.02,
                size * 0.6,
                Math.sin(angle) * 0.02
            );
            petal.rotation.y = -angle;
            petal.rotation.x = Math.PI;
            petal.castShadow = true;
            
            group.add(petal);
        }

        // Centre
        const centerGeometry = new THREE.SphereGeometry(0.03, 8, 8);
        const centerMaterial = new THREE.MeshStandardMaterial({
            color: getRandomNaturalColor(120, 180, 50, 100, 15, 60),
            roughness: 0.4
        });

        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.y = size * 0.65;
        center.castShadow = true;
        
        group.add(center);

        return group;
    }

    createWaterPlantCluster(position, count = 5) {
        const group = new THREE.Group();
        group.position.copy(position);
        group.rotation.x = Math.random() * Math.PI;
        group.rotation.z = Math.random() * Math.PI;

        for (let i = 0; i < count; i++) {
            const type = Math.floor(Math.random() * 3);
            const plantPos = position.clone().add(
                new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).multiplyScalar(0.3)
            );

            if (type === 0) {
                const plant = this.createReed(plantPos, 0.8 + Math.random() * 0.5);
                group.add(plant);
            } else if (type === 1) {
                const plant = this.createCreekGrass(plantPos, 0.5 + Math.random() * 0.5);
                group.add(plant);
            } else if (type === 2) {
                const plant = this.createWaterFlowerSmall(plantPos, 0.3 + Math.random() * 0.4);
                group.add(plant);
            }
        }

        return group;
    }

    createPondTallGrass(position, size = 3.0) {
        const group = new THREE.Group();
        group.position.copy(position);

        const bladeMaterial = new THREE.MeshStandardMaterial({
            color: getRandomNaturalColor(80, 140, 50, 90, 20, 60),
            roughness: 0.75,
            side: THREE.DoubleSide
        });

        for (let i = 0; i < 15; i++) {
            const bladeGeometry = new THREE.PlaneGeometry(size * 0.03, size);
            const blade = new THREE.Mesh(bladeGeometry, bladeMaterial.clone());
            blade.material.color.copy(getRandomNaturalColor(80, 140, 50, 90, 20, 60));

            const angle = (i / 15) * Math.PI * 2;
            blade.position.set(
                Math.cos(angle) * size * 0.4,
                size * 0.5,
                Math.sin(angle) * size * 0.4
            );
            blade.rotation.y = -angle;
            blade.rotation.x = Math.PI / 6 + Math.random() * 0.2;
            blade.scale.x = 0.6 + Math.random() * 0.8;
            blade.scale.y = 0.8 + Math.random() * 0.6;
            blade.castShadow = true;

            group.add(blade);
        }

        return group;
    }

    createWaterCreeper(position, size = 0.5) {
        const group = new THREE.Group();
        group.position.copy(position);

        // Vaisseaux qui partent du centre
        const vineMaterial = new THREE.MeshStandardMaterial({
            color: getRandomNaturalColor(80, 140, 35, 85, 10, 45),
            roughness: 0.65
        });

        for (let i = 0; i < 6; i++) {
            const vineGeometry = new THREE.CylinderGeometry(0.01, 0.02, size, 6);
            const vine = new THREE.Mesh(vineGeometry, vineMaterial);
            
            const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.3;
            const radius = size * 0.6;
            
            vine.position.set(
                Math.cos(angle) * radius,
                size * 0.5,
                Math.sin(angle) * radius
            );
            vine.castShadow = true;
            
            group.add(vine);
        }

        // Petites feuilles
        const leafMaterial = new THREE.MeshStandardMaterial({
            color: getRandomNaturalColor(100, 150, 50, 90, 20, 60),
            roughness: 0.55
        });

        for (let i = 0; i < 12; i++) {
            const leafGeometry = new THREE.PlaneGeometry(size * 0.08, size * 0.02);
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            
            const angle = (i / 12) * Math.PI * 2;
            const radius = size * 0.6 + Math.random() * 0.1;
            
            leaf.position.set(
                Math.cos(angle) * radius,
                size * (0.4 + Math.random() * 0.3),
                Math.sin(angle) * radius
            );
            leaf.rotation.y = -angle;
            leaf.rotation.x = Math.PI / 8;
            leaf.castShadow = true;
            
            group.add(leaf);
        }

        return group;
    }
}
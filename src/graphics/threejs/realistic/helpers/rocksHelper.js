// =============================================
// Ludus Terrae V2 - Rocks Helper
// ==============================================

import * as THREE from 'three';
import { createStoneTexture, getRandomNaturalColor } from '../realisticUtil.js';

/**
 * Helper pour la création de rochers et formations rocheuses
 */
export class RocksHelper {
    constructor(scene) {
        this.scene = scene;
    }

    createRockCluster(position, sizes = [0.3, 0.5, 0.8], rockCount = 5) {
        const group = new THREE.Group();
        group.position.copy(position);

        const rockMaterial = new THREE.MeshStandardMaterial({
            map: createStoneTexture(),
            roughness: 0.85,
            color: getRandomNaturalColor(0, 40, 10, 50, 30, 70)
        });

        for (let i = 0; i < rockCount; i++) {
            const size = sizes[Math.floor(Math.random() * sizes.length)];
            const rock = this.createSingleRock(size, rockMaterial);
            rock.position.set(
                Math.random() * 3 - 1.5,
                0,
                Math.random() * 3 - 1.5
            );
            group.add(rock);
        }

        return group;
    }

    createSingleRock(size, material) {
        const rockGeometry = new THREE.DodecahedronGeometry(size * 0.8, 0);
        const rockMaterial = material || new THREE.MeshStandardMaterial({
            map: createStoneTexture(),
            roughness: 0.85,
            color: getRandomNaturalColor(0, 40, 10, 50, 30, 70)
        });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);

        rock.position.y = 0;
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        rock.scale.set(1, 1.2, 0.8);
        rock.castShadow = true;
        rock.receiveShadow = true;

        return rock;
    }

    createMossyRock(position, size = 0.6) {
        const rock = this.createSingleRock(size, new THREE.MeshStandardMaterial({
            map: createStoneTexture(),
            roughness: 0.8,
            color: getRandomNaturalColor(0, 40, 15, 60, 30, 75)
        }));

        // Ajouter de la mousse
        const mossGroup = new THREE.Group();
        mossGroup.position.y = size * 0.5;
        
        const mossMaterial = new THREE.MeshStandardMaterial({
            color: getRandomNaturalColor(60, 100, 30, 70, 20, 50),
            roughness: 0.7
        });

        for (let i = 0; i < 8; i++) {
            const mossGeometry = new THREE.SphereGeometry(size * 0.2, 6, 6);
            const moss = new THREE.Mesh(mossGeometry, mossMaterial);
            moss.position.set(
                Math.random() * size - size / 2,
                Math.random() * size * 0.8,
                Math.random() * size - size / 2
            );
            moss.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            moss.scale.set(1, 0.6, 1);
            mossGroup.add(moss);
        }

        rock.add(mossGroup);
        return rock;
    }

    createCreekRock(position, size = 0.4) {
        const rock = this.createSingleRock(size, new THREE.MeshStandardMaterial({
            map: createStoneTexture(),
            roughness: 0.9,
            color: getRandomNaturalColor(30, 60, 40, 60, 30, 70)
        }));

        // Forme allongée
        rock.rotation.z = Math.PI / 4;
        
        // Ajouter des écailles ou textures
        const scaleMaterial = new THREE.MeshStandardMaterial({
            map: createStoneTexture(),
            roughness: 0.8,
            color: getRandomNaturalColor(40, 80, 20, 60, 30, 65)
        });

        const scaleGeometry = new THREE.BoxGeometry(size * 1.5, size * 0.4, size * 0.5);
        const scale = new THREE.Mesh(scaleGeometry, scaleMaterial);
        scale.position.y = size * 0.4;
        scale.rotation.y = Math.PI / 4;
        rock.add(scale);

        rock.castShadow = true;
        rock.receiveShadow = true;

        return rock;
    }

    createLargeRock(position, size = 1.2) {
        const rock = this.createSingleRock(size, new THREE.MeshStandardMaterial({
            map: createStoneTexture(),
            roughness: 0.7,
            color: getRandomNaturalColor(0, 30, 8, 40, 20, 55)
        }));

        // Surface rugueuse avec détails
        const detailGroup = new THREE.Group();

        for (let i = 0; i < size * 10; i++) {
            const detailGeometry = new THREE.DodecahedronGeometry(size * 0.05, 0);
            const detailMaterial = new THREE.MeshStandardMaterial({
                color: getRandomNaturalColor(15, 50, 12, 50, 30, 60),
                roughness: 0.8
            });

            const detail = new THREE.Mesh(detailGeometry, detailMaterial);
            detail.position.set(
                Math.random() * size * 1.5 - size * 0.75,
                Math.random() * size * 1.2 + size * 0.1,
                Math.random() * size * 1.5 - size * 0.75
            );
            detail.scale.set(1, 0.3, 1);
            detail.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            detailGroup.add(detail);
        }

        rock.add(detailGroup);
        rock.castShadow = true;
        rock.receiveShadow = true;

        return rock;
    }

    createWaterfallRock(position, size = 0.8) {
        const rock = this.createSingleRock(size, new THREE.MeshStandardMaterial({
            map: createStoneTexture(),
            roughness: 0.75,
            color: getRandomNaturalColor(0, 20, 5, 35, 15, 50)
        }));

        // Forme plus rectangulaire
        rock.rotation.x = Math.PI / 6;
        rock.rotation.z = Math.PI / 6;

        // Lac de mousse à la base
        const puddleGroup = new THREE.Group();
        puddleGroup.position.set(size * 0.5, size * 0.3, 0);
        
        const puddleMaterial = new THREE.MeshStandardMaterial({
            color: getRandomNaturalColor(60, 100, 25, 60, 20, 50),
            roughness: 0.7
        });

        for (let i = 0; i < 6; i++) {
            const puddleGeometry = new THREE.SphereGeometry(size * 1.1, 6, 6);
            const puddle = new THREE.Mesh(puddleGeometry, puddleMaterial);
            puddle.position.set(
                Math.random() * size * 0.8 - size * 0.4,
                Math.random() * size * 0.3,
                Math.random() * size * 0.8 - size * 0.4
            );
            puddle.scale.set(1, 0.6, 1);
            puddleGroup.add(puddle);
        }

        rock.add(puddleGroup);
        rock.castShadow = true;
        rock.receiveShadow = true;

        return rock;
    }
}
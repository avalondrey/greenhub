// =============================================
// Ludus Terrae V2 - Tree LOD & Instancing System
// Optimisation performance avec LOD et instancing
// =============================================

import * as THREE from 'three';

export class TreeLODSystem {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        // Distances LOD
        this.lodDistances = {
            HIGH: 15,    // Full detail
            MEDIUM: 35,   // Reduced geometry
            LOW: 60,     // Simple billboards
            BILLBOARD: 100 // 2D sprite
        };

        // Cache des modèles LOD
        this.lodModels = new Map();

        // Objets LOD
        this.lodObjects = [];

        // Statistics
        this.stats = {
            highCount: 0,
            mediumCount: 0,
            lowCount: 0,
            billboardCount: 0
        };
    }

    /**
     * Crée un modèle simplifié pour LOD
     */
    createLODModels(treeType, treeHeight) {
        const models = {
            high: null,
            medium: null,
            low: null,
            billboard: null
        };

        // HIGH - Version complète (déjà créée)
        // On utilisera le modèle original

        // MEDIUM - Géométrie réduite
        const mediumGroup = new THREE.Group();

        // Tronc simplifié
        const trunkGeom = new THREE.CylinderGeometry(
            treeHeight * 0.08,
            treeHeight * 0.12,
            treeHeight * 0.4,
            6
        );
        const trunkMat = new THREE.MeshStandardMaterial({
            color: 0x5a4030,
            roughness: 0.9,
            flatShading: true
        });
        const trunk = new THREE.Mesh(trunkGeom, trunkMat);
        trunk.position.y = treeHeight * 0.2;
        mediumGroup.add(trunk);

        // Feuillage simplifié - une seule sphère
        const foliageGeom = new THREE.SphereGeometry(treeHeight * 0.35, 6, 4);
        const foliageMat = new THREE.MeshStandardMaterial({
            color: 0x2d5a2d,
            roughness: 0.9,
            flatShading: true
        });
        const foliage = new THREE.Mesh(foliageGeom, foliageMat);
        foliage.position.y = treeHeight * 0.65;
        foliage.scale.y = 0.8;
        mediumGroup.add(foliage);

        models.medium = mediumGroup;

        // LOW - Encore plus simple
        const lowGroup = new THREE.Group();

        const lowTrunkGeom = new THREE.CylinderGeometry(
            treeHeight * 0.1,
            treeHeight * 0.15,
            treeHeight * 0.35,
            5
        );
        const lowTrunk = new THREE.Mesh(lowTrunkGeom, trunkMat.clone());
        lowTrunk.position.y = treeHeight * 0.175;
        lowGroup.add(lowTrunk);

        const lowFoliageGeom = new THREE.IcosahedronGeometry(treeHeight * 0.3, 0);
        const lowFoliage = new THREE.Mesh(lowFoliageGeom, foliageMat.clone());
        lowFoliage.position.y = treeHeight * 0.55;
        lowGroup.add(lowFoliage);

        models.low = lowGroup;

        // BILLBOARD - Sprite 2D
        const billboardGroup = new THREE.Group();

        // Créer une texture de billboard
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Dessiner un arbre simplifié
        ctx.fillStyle = '#5a4030';
        ctx.fillRect(56, 180, 16, 70);

        ctx.fillStyle = '#2d5a2d';
        ctx.beginPath();
        ctx.arc(64, 100, 55, 0, Math.PI * 2);
        ctx.fill();

        const billboardTexture = new THREE.CanvasTexture(canvas);
        billboardTexture.needsUpdate = true;

        const billboardMat = new THREE.SpriteMaterial({
            map: billboardTexture,
            transparent: true,
            depthWrite: false
        });

        const billboard = new THREE.Sprite(billboardMat);
        billboard.scale.set(treeHeight * 0.8, treeHeight * 1.2, 1);
        billboardGroup.add(billboard);

        models.billboard = billboardGroup;

        return models;
    }

    /**
     * Crée un arbre avec LOD
     */
    createTreeWithLOD(treeType, position, height = 5) {
        const lodObject = {
            position: position.clone(),
            currentLevel: 'HIGH',
            highModel: null,
            lodModels: null,
            group: new THREE.Group()
        };

        // Récupérer ou créer les modèles LOD
        const cacheKey = `${treeType}_${Math.round(height)}`;
        if (!this.lodModels.has(cacheKey)) {
            this.lodModels.set(cacheKey, this.createLODModels(treeType, height));
        }
        lodObject.lodModels = this.lodModels.get(cacheKey);

        // Créer le modèle haute résolution
        lodObject.highModel = this.createHighDetailTree(treeType, height);
        lodObject.group.add(lodObject.highModel);
        lodObject.group.position.copy(position);

        this.lodObjects.push(lodObject);
        this.scene.add(lodObject.group);

        return lodObject;
    }

    /**
     * Crée un arbre haute résolution simplifié
     */
    createHighDetailTree(treeType, height) {
        const group = new THREE.Group();

        // Tronconique
        const trunkGeom = new THREE.CylinderGeometry(
            height * 0.08,
            height * 0.12,
            height * 0.4,
            8
        );
        const trunkMat = new THREE.MeshStandardMaterial({
            color: 0x5a4030,
            roughness: 0.9,
            flatShading: true
        });
        const trunk = new THREE.Mesh(trunkGeom, trunkMat);
        trunk.position.y = height * 0.2;
        trunk.castShadow = true;
        group.add(trunk);

        // Feuillage clusterisé
        const foliageCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < foliageCount; i++) {
            const foliageGeom = new THREE.IcosahedronGeometry(height * 0.2, 1);
            const foliageMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(0.3 + Math.random() * 0.1, 0.5, 0.3),
                roughness: 0.85,
                flatShading: true
            });

            const foliage = new THREE.Mesh(foliageGeom, foliageMat);
            foliage.position.set(
                (Math.random() - 0.5) * height * 0.3,
                height * 0.5 + Math.random() * height * 0.3,
                (Math.random() - 0.5) * height * 0.3
            );
            foliage.scale.set(
                0.8 + Math.random() * 0.4,
                0.7 + Math.random() * 0.3,
                0.8 + Math.random() * 0.4
            );
            foliage.castShadow = true;
            group.add(foliage);
        }

        return group;
    }

    /**
     * Met à jour les LOD selon la distance à la caméra
     */
    update() {
        const cameraPos = this.camera.position;

        // Reset stats
        this.stats = { highCount: 0, mediumCount: 0, lowCount: 0, billboardCount: 0 };

        this.lodObjects.forEach(lodObject => {
            const distance = cameraPos.distanceTo(lodObject.position);
            let newLevel = 'HIGH';

            // Déterminer le niveau LOD
            if (distance > this.lodDistances.BILLBOARD) {
                newLevel = 'BILLBOARD';
            } else if (distance > this.lodDistances.LOW) {
                newLevel = 'LOW';
            } else if (distance > this.lodDistances.MEDIUM) {
                newLevel = 'MEDIUM';
            }

            // Changer de modèle si nécessaire
            if (newLevel !== lodObject.currentLevel) {
                this.switchLODLevel(lodObject, newLevel);
                lodObject.currentLevel = newLevel;
            }

            // Stats
            this.stats[`${newLevel.toLowerCase()}Count`]++;
        });

        // Logger stats tous les 5 seconds (via setTimeout check)
        if (!this.lastStatsLog || Date.now() - this.lastStatsLog > 5000) {
            this.lastStatsLog = Date.now();
            const total = this.lodObjects.length;
            if (total > 0 && (this.stats.highCount !== total)) {
                console.log(`📊 LOD Stats: ${this.stats.highCount} HIGH, ${this.stats.mediumCount} MED, ${this.stats.lowCount} LOW, ${this.stats.billboardCount} BILLBOARD`);
            }
        }
    }

    switchLODLevel(lodObject, newLevel) {
        // Retirer le modèle actuel
        while (lodObject.group.children.length > 0) {
            lodObject.group.remove(lodObject.group.children[0]);
        }

        // Ajouter le nouveau modèle
        let newModel;
        switch (newLevel) {
            case 'MEDIUM':
                newModel = lodObject.lodModels.medium.clone();
                break;
            case 'LOW':
                newModel = lodObject.lodModels.low.clone();
                break;
            case 'BILLBOARD':
                newModel = lodObject.lodModels.billboard.clone();
                break;
            default:
                newModel = lodObject.highModel.clone();
        }

        lodObject.group.add(newModel);
    }

    dispose() {
        this.lodObjects.forEach(lodObject => {
            this.scene.remove(lodObject.group);
        });
        this.lodModels.forEach(models => {
            Object.values(models).forEach(model => {
                if (model) {
                    model.traverse(child => {
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
            });
        });
        this.lodObjects = [];
        this.lodModels.clear();
    }
}

// =============================================
// Instanced Trees System
// =============================================

export class InstancedTreeSystem {
    constructor(scene) {
        this.scene = scene;
        this.instancedGroups = new Map();
    }

    /**
     * Crée un système d'instances pour un type d'arbre
     * Plus performant quand il y a beaucoup d'arbres similaires
     */
    createInstancedTrees(treeType, positions, treeHeight = 5) {
        const count = positions.length;
        if (count === 0) return null;

        // Créer le mesh instancié
        const geometry = this.createInstancedGeometry(treeType, treeHeight);
        const material = this.createInstancedMaterial(treeType);

        const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
        instancedMesh.castShadow = true;
        instancedMesh.receiveShadow = true;

        // Positionner chaque instance
        const matrix = new THREE.Matrix4();
        positions.forEach((pos, i) => {
            const scale = 0.7 + Math.random() * 0.6;
            matrix.makeScale(scale, scale, scale);
            matrix.setPosition(pos);
            instancedMesh.setMatrixAt(i, matrix);
        });

        instancedMesh.instanceMatrix.needsUpdate = true;

        this.scene.add(instancedMesh);

        const group = {
            type: treeType,
            mesh: instancedMesh,
            count: count
        };

        this.instancedGroups.set(treeType, group);

        console.log(`🌲 ${count} ${treeType} instances créées (InstancedMesh)`);

        return instancedMesh;
    }

    createInstancedGeometry(treeType, height) {
        // Géométrie simplifiée pour instancing
        const group = new THREE.Group();

        // Tronc
        const trunkGeom = new THREE.CylinderGeometry(
            height * 0.08,
            height * 0.12,
            height * 0.4,
            6
        );
        trunkGeom.translate(0, height * 0.2, 0);

        // Feuillage (sphère simple)
        const foliageGeom = new THREE.IcosahedronGeometry(height * 0.25, 0);
        foliageGeom.translate(0, height * 0.6, 0);

        // Merger les géométries
        const mergedGeom = this.mergeGeometries([trunkGeom, foliageGeom]);

        return mergedGeom;
    }

    createInstancedMaterial(treeType) {
        // Couleur selon le type
        let color = 0x2d5a2d;

        switch (treeType) {
            case 'pine':
                color = 0x1a3a1a;
                break;
            case 'birch':
                color = 0x3d6a3d;
                break;
            case 'willow':
                color = 0x5a8a3a;
                break;
            case 'oak':
                color = 0x2d5a2d;
                break;
        }

        return new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.9,
            flatShading: true
        });
    }

    mergeGeometries(geometries) {
        // Simple merge - combine les buffers
        let totalVertices = 0;
        let totalIndices = 0;

        geometries.forEach(geom => {
            totalVertices += geom.attributes.position.count;
            if (geom.index) {
                totalIndices += geom.index.count;
            } else {
                totalIndices += geom.attributes.position.count;
            }
        });

        const positions = new Float32Array(totalVertices * 3);
        const normals = new Float32Array(totalVertices * 3);
        const indices = [];

        let vertexOffset = 0;
        let indexOffset = 0;

        geometries.forEach(geom => {
            const posAttr = geom.attributes.position;
            const normAttr = geom.attributes.normal;

            for (let i = 0; i < posAttr.count; i++) {
                positions[(vertexOffset + i) * 3] = posAttr.getX(i);
                positions[(vertexOffset + i) * 3 + 1] = posAttr.getY(i);
                positions[(vertexOffset + i) * 3 + 2] = posAttr.getZ(i);

                if (normAttr) {
                    normals[(vertexOffset + i) * 3] = normAttr.getX(i);
                    normals[(vertexOffset + i) * 3 + 1] = normAttr.getY(i);
                    normals[(vertexOffset + i) * 3 + 2] = normAttr.getZ(i);
                }
            }

            if (geom.index) {
                for (let i = 0; i < geom.index.count; i++) {
                    indices.push(geom.index.getX(i) + vertexOffset);
                }
            } else {
                for (let i = 0; i < posAttr.count; i++) {
                    indices.push(i + vertexOffset);
                }
            }

            vertexOffset += posAttr.count;
        });

        const merged = new THREE.BufferGeometry();
        merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
        merged.setIndex(indices);

        return merged;
    }

    dispose() {
        this.instancedGroups.forEach(group => {
            this.scene.remove(group.mesh);
            group.mesh.geometry.dispose();
            group.mesh.material.dispose();
        });
        this.instancedGroups.clear();
    }
}

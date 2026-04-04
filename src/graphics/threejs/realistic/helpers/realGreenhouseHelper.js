// =============================================
// Ludus Terrae V2 - Real Greenhouse Helper
// Créer une vraie serre 3D positionnable sur le terrain
// =============================================

import * as THREE from 'three';

export class RealGreenhouseHelper {
    constructor(scene) {
        this.scene = scene;
        this.greenhouses = [];
        this.selectedGreenhouse = null;
        this.isPlacing = false;
        this.placementPreview = null;
    }

    // Crée une serre réelle à une position donnée
    createGreenhouse(position, config = {}) {
        const greenhouse = {
            id: config.id || `greenhouse-${Date.now()}`,
            name: config.name || 'Ma Serre',
            position: position.clone(),
            size: config.size || { width: 8, depth: 6, height: 3.5 },
            plantedCrops: [],
            isPlaced: true,
            group: null
        };

        greenhouse.group = this.buildGreenhouse(greenhouse);
        greenhouse.group.position.copy(position);
        greenhouse.group.userData = { greenhouseId: greenhouse.id, type: 'greenhhouse' };

        this.scene.add(greenhouse.group);
        this.greenhouses.push(greenhouse);

        console.log(`🏠 Serre réelle créée à (${position.x.toFixed(1)}, ${position.z.toFixed(1)})`);
        return greenhouse;
    }

    // Construit le mesh 3D de la serre
    buildGreenhouse(data) {
        const group = new THREE.Group();
        const { width, depth, height } = data.size;

        // --- Base / Fondation ---
        const foundationGeom = new THREE.BoxGeometry(width + 0.5, 0.3, depth + 0.5);
        const foundationMat = new THREE.MeshStandardMaterial({
            color: 0x555555,
            roughness: 0.9
        });
        const foundation = new THREE.Mesh(foundationGeom, foundationMat);
        foundation.position.y = 0.15;
        foundation.receiveShadow = true;
        foundation.castShadow = true;
        group.add(foundation);

        // --- Structure métallique ---
        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x2c5530,
            roughness: 0.4,
            metalness: 0.7
        });

        // Poteaux verticaux (4 coins)
        const poleGeom = new THREE.BoxGeometry(0.1, height, 0.1);
        const corners = [
            [-width/2, height/2 + 0.3, -depth/2],
            [width/2, height/2 + 0.3, -depth/2],
            [-width/2, height/2 + 0.3, depth/2],
            [width/2, height/2 + 0.3, depth/2]
        ];

        corners.forEach(pos => {
            const pole = new THREE.Mesh(poleGeom, frameMat);
            pole.position.set(...pos);
            pole.castShadow = true;
            group.add(pole);
        });

        // Poteaux intermédiaires
        const midPoleGeom = new THREE.BoxGeometry(0.08, height, 0.08);
        for (let z = -depth/2 + depth/3; z <= depth/2 - depth/3; z += depth/3) {
            [-width/2, width/2].forEach(x => {
                const pole = new THREE.Mesh(midPoleGeom, frameMat);
                pole.position.set(x, height/2 + 0.3, z);
                group.add(pole);
            });
        }

        // Poutres horizontales (haut)
        const beamGeom = new THREE.BoxGeometry(width + 0.2, 0.08, 0.08);
        [-depth/2, 0, depth/2].forEach(z => {
            const beam = new THREE.Mesh(beamGeom, frameMat);
            beam.position.set(0, height + 0.3, z);
            group.add(beam);
        });

        // --- Vitrage (parois en verre) ---
        const glassMat = new THREE.MeshStandardMaterial({
            color: 0x88ccaa,
            transparent: true,
            opacity: 0.3,
            roughness: 0.1,
            metalness: 0.1,
            side: THREE.DoubleSide
        });

        // Parois avant et arrière
        const wallGeom = new THREE.PlaneGeometry(width, height);

        const frontWall = new THREE.Mesh(wallGeom, glassMat.clone());
        frontWall.position.set(0, height/2 + 0.3, depth/2);
        frontWall.rotation.y = 0;
        group.add(frontWall);

        const backWall = new THREE.Mesh(wallGeom, glassMat.clone());
        backWall.position.set(0, height/2 + 0.3, -depth/2);
        backWall.rotation.y = Math.PI;
        group.add(backWall);

        // Parois latérales
        const sideWallGeom = new THREE.PlaneGeometry(depth, height);

        const leftWall = new THREE.Mesh(sideWallGeom, glassMat.clone());
        leftWall.position.set(-width/2, height/2 + 0.3, 0);
        leftWall.rotation.y = Math.PI / 2;
        group.add(leftWall);

        const rightWall = new THREE.Mesh(sideWallGeom, glassMat.clone());
        rightWall.position.set(width/2, height/2 + 0.3, 0);
        rightWall.rotation.y = -Math.PI / 2;
        group.add(rightWall);

        // --- Toit (deux pans) ---
        const roofGeom = new THREE.BufferGeometry();
        const roofVertices = new Float32Array([
            // Pan gauche
            -width/2, height + 0.3, -depth/2,
            -width/2, height + 0.3, depth/2,
            0, height + 1.5, -depth/2,
            // Pan gauche (suite)
            -width/2, height + 0.3, depth/2,
            0, height + 1.5, depth/2,
            0, height + 1.5, -depth/2,
            // Pan droit
            width/2, height + 0.3, -depth/2,
            0, height + 1.5, -depth/2,
            width/2, height + 0.3, depth/2,
            // Pan droit (suite)
            width/2, height + 0.3, depth/2,
            0, height + 1.5, -depth/2,
            0, height + 1.5, depth/2
        ]);

        roofGeom.setAttribute('position', new THREE.BufferAttribute(roofVertices, 3));
        roofGeom.computeVertexNormals();

        const roofMat = new THREE.MeshStandardMaterial({
            color: 0x2c5530,
            transparent: true,
            opacity: 0.8,
            roughness: 0.3,
            metalness: 0.5,
            side: THREE.DoubleSide
        });

        const roof = new THREE.Mesh(roofGeom, roofMat);
        roof.castShadow = true;
        group.add(roof);

        // --- Porte ---
        const doorGeom = new THREE.BoxGeometry(1.5, 2.2, 0.1);
        const doorMat = new THREE.MeshStandardMaterial({
            color: 0x1a3320,
            roughness: 0.6
        });
        const door = new THREE.Mesh(doorGeom, doorMat);
        door.position.set(0, 1.1 + 0.3, depth/2 + 0.05);
        group.add(door);

        // Cadre de porte
        const frameColor = 0x3d7a4a;
        const frameMatDoor = new THREE.MeshStandardMaterial({
            color: frameColor,
            roughness: 0.5,
            metalness: 0.6
        });

        // Montants
        const doorFrameVertGeom = new THREE.BoxGeometry(0.1, 2.3, 0.15);
        const leftFrame = new THREE.Mesh(doorFrameVertGeom, frameMatDoor);
        leftFrame.position.set(-0.8, 1.15 + 0.3, depth/2 + 0.08);
        group.add(leftFrame);

        const rightFrame = new THREE.Mesh(doorFrameVertGeom, frameMatDoor);
        rightFrame.position.set(0.8, 1.15 + 0.3, depth/2 + 0.08);
        group.add(rightFrame);

        // Linteau
        const doorFrameTopGeom = new THREE.BoxGeometry(1.8, 0.1, 0.15);
        const topFrame = new THREE.Mesh(doorFrameTopGeom, frameMatDoor);
        topFrame.position.set(0, 2.35 + 0.3, depth/2 + 0.08);
        group.add(topFrame);

        // --- Étagères à l'intérieur ---
        const shelfMat = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.8
        });

        for (let side = -1; side <= 1; side += 2) {
            const shelfGeom = new THREE.BoxGeometry(0.8, 0.05, depth - 1);
            const shelf = new THREE.Mesh(shelfGeom, shelfMat);
            shelf.position.set(side * (width/3), 1.2, 0);
            shelf.castShadow = true;
            shelf.receiveShadow = true;
            group.add(shelf);

            // Deuxième étage
            const shelf2 = new THREE.Mesh(shelfGeom, shelfMat);
            shelf2.position.set(side * (width/3), 2.0, 0);
            shelf2.castShadow = true;
            shelf2.receiveShadow = true;
            group.add(shelf2);
        }

        return group;
    }

    // Démarre le mode placement
    startPlacement(config = {}) {
        this.isPlacing = true;

        // Créer une prévisualisation transparente
        const previewData = {
            id: 'preview',
            name: 'Nouvelle Serre',
            position: new THREE.Vector3(0, 0, 0),
            size: config.size || { width: 8, depth: 6, height: 3.5 },
            group: null
        };

        previewData.group = this.buildGreenhouse(previewData);
        previewData.group.traverse(child => {
            if (child.isMesh) {
                child.material = child.material.clone();
                child.material.transparent = true;
                child.material.opacity = 0.5;
                if (child.material.emissive) {
                    child.material.emissive.setHex(0x00ff00);
                    child.material.emissiveIntensity = 0.3;
                }
            }
        });

        this.placementPreview = previewData;
        this.scene.add(previewData.group);

        console.log('🏠 Mode placement serre activé - clic sur le terrain pour placer');
        return previewData;
    }

    // Met à jour la position de prévisualisation
    updatePreviewPosition(position) {
        if (this.placementPreview) {
            this.placementPreview.group.position.copy(position);
        }
    }

    // Termine le placement
    finishPlacement() {
        if (!this.placementPreview) return null;

        const position = this.placementPreview.group.position.clone();
        this.scene.remove(this.placementPreview.group);

        const greenhouse = this.createGreenhouse(position, {
            name: 'Ma Serre',
            size: this.placementPreview.size
        });

        this.placementPreview = null;
        this.isPlacing = false;

        return greenhouse;
    }

    // Annule le placement
    cancelPlacement() {
        if (this.placementPreview) {
            this.scene.remove(this.placementPreview.group);
            this.placementPreview = null;
        }
        this.isPlacing = false;
        console.log('❌ Placement annulé');
    }

    // Déplace une serre existante
    moveGreenhouse(greenhouseId, newPosition) {
        const gh = this.greenhouses.find(g => g.id === greenhouseId);
        if (gh) {
            gh.position.copy(newPosition);
            gh.group.position.copy(newPosition);
            console.log(`🏠 Serre déplacée vers (${newPosition.x.toFixed(1)}, ${newPosition.z.toFixed(1)})`);
            return true;
        }
        return false;
    }

    // Supprime une serre
    removeGreenhouse(greenhouseId) {
        const idx = this.greenhouses.findIndex(g => g.id === greenhouseId);
        if (idx !== -1) {
            const gh = this.greenhouses[idx];
            this.scene.remove(gh.group);
            this.greenhouses.splice(idx, 1);
            console.log('🗑️ Serre supprimée');
            return true;
        }
        return false;
    }

    // Sélectionne une serre
    selectGreenhouse(greenhouseId) {
        // Désélectionner l'ancienne
        if (this.selectedGreenhouse) {
            const old = this.greenhouses.find(g => g.id === this.selectedGreenhouse);
            if (old) {
                old.group.traverse(child => {
                    if (child.isMesh && child.material) {
                        child.material.emissive?.setHex(0x000000);
                    }
                });
            }
        }

        this.selectedGreenhouse = greenhouseId;
        const gh = this.greenhouses.find(g => g.id === greenhouseId);

        if (gh) {
            // Highlight la serre sélectionnée
            gh.group.traverse(child => {
                if (child.isMesh && child.material) {
                    child.material.emissive = child.material.emissive || new THREE.Color(0, 0, 0);
                    child.material.emissive.setHex(0x00ff00);
                    child.material.emissiveIntensity = 0.5;
                }
            });
            console.log(`🏠 Serre sélectionnée: ${gh.name}`);
        }
    }

    // Désélectionne
    deselect() {
        if (this.selectedGreenhouse) {
            const gh = this.greenhouses.find(g => g.id === this.selectedGreenhouse);
            if (gh) {
                gh.group.traverse(child => {
                    if (child.isMesh && child.material && child.material.emissive) {
                        child.material.emissive.setHex(0x000000);
                    }
                });
            }
            this.selectedGreenhouse = null;
        }
    }

    // Obtient les serres
    getGreenhouses() {
        return [...this.greenhouses];
    }

    // Nettoyage
    destroy() {
        this.greenhouses.forEach(gh => {
            this.scene.remove(gh.group);
        });
        this.greenhouses = [];
        if (this.placementPreview) {
            this.scene.remove(this.placementPreview.group);
        }
    }
}

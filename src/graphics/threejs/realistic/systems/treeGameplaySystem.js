// =============================================
// Ludus Terrae V2 - Tree Gameplay System
// Arbres fruitiers, coupe, oiseaux, animaux
// =============================================

import * as THREE from 'three';

// Types de fruits disponibles
export const FRUIT_TYPES = {
    apple: { name: 'Pomme', emoji: '🍎', color: 0xff0000, growTime: 30, yield: 3 },
    pear: { name: 'Poire', emoji: '🍐', color: 0xc4ff00, growTime: 35, yield: 2 },
    cherry: { name: 'Cerise', emoji: '🍒', color: 0xdc143c, growTime: 25, yield: 5 },
    orange: { name: 'Orange', emoji: '🍊', color: 0xffa500, growTime: 40, yield: 3 },
    lemon: { name: 'Citron', emoji: '🍋', color: 0xfff44f, growTime: 38, yield: 4 },
    walnut: { name: 'Noix', emoji: '🥜', color: 0x8b4513, growTime: 60, yield: 2 }
};

export class TreeGameplaySystem {
    constructor(scene, trees) {
        this.scene = scene;
        this.trees = trees;

        // Arbres avec fruits
        this.fruitTrees = new Map();

        // Oiseaux
        this.birds = [];
        this.birdMeshes = [];

        // Animaux
        this.animals = [];
        this.animalMeshes = [];

        // Hache du joueur
        this.hasAxe = false;
        this.selectedTree = null;
        this.chopProgress = 0;

        // Initialiser
        this.initFruitTrees();
        this.spawnBirds();
        this.spawnAnimals();
    }

    initFruitTrees() {
        // Convertir quelques arbres en arbres fruitiers
        const fruitTypes = Object.keys(FRUIT_TYPES);
        const fruitTreeCount = Math.floor(this.trees.length * 0.15); // 15% d'arbres fruitiers

        for (let i = 0; i < fruitTreeCount; i++) {
            const tree = this.trees[Math.floor(Math.random() * this.trees.length)];
            if (this.fruitTrees.has(tree)) continue;

            const fruitType = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
            const fruitData = FRUIT_TYPES[fruitType];

            this.fruitTrees.set(tree, {
                type: fruitType,
                data: fruitData,
                plantedDate: Date.now(),
                ready: false,
                fruits: []
            });

            // Ajouter des fruits visuels sur l'arbre
            this.addFruitToTree(tree, fruitData);
        }

        console.log(`🍎 ${this.fruitTrees.size} arbres fruitiers créés`);
    }

    addFruitToTree(tree, fruitData) {
        // Créer des fruits sur l'arbre
        const fruitCount = 3 + Math.floor(Math.random() * 4);
        const fruits = [];

        for (let i = 0; i < fruitCount; i++) {
            const fruitGeom = new THREE.SphereGeometry(0.1, 6, 6);
            const fruitMat = new THREE.MeshStandardMaterial({
                color: fruitData.color,
                roughness: 0.4,
                flatShading: true
            });

            const fruit = new THREE.Mesh(fruitGeom, fruitMat);

            // Position aléatoire dans le feuillage
            const treeTop = tree.position.y + 3;
            fruit.position.set(
                tree.position.x + (Math.random() - 0.5) * 2,
                treeTop + Math.random() * 1.5,
                tree.position.z + (Math.random() - 0.5) * 2
            );

            fruit.castShadow = true;
            fruit.userData.isFruit = true;
            fruit.userData.fruitData = fruitData;

            fruits.push(fruit);
            this.scene.add(fruit);
        }

        return fruits;
    }

    updateFruitTrees() {
        const now = Date.now();

        this.fruitTrees.forEach((fruitData, tree) => {
            // Vérifier si les fruits sont mûrs
            const age = (now - fruitData.plantedDate) / (1000 * 60 * 60 * 24); // en jours

            if (!fruitData.ready && age >= fruitData.data.growTime) {
                fruitData.ready = true;
                console.log(`🍎 ${fruitData.data.name} prête à être récoltée!`);
            }
        });
    }

    harvestFruit(tree, playerPosition) {
        const fruitData = this.fruitTrees.get(tree);
        if (!fruitData || !fruitData.ready) return null;

        // Calculer la distance
        const dist = tree.position.distanceTo(playerPosition);
        if (dist > 5) return null;

        // Récolter
        const reward = fruitData.data.yield;
        console.log(`🎉 Récolté ${reward} ${fruitData.data.name}!`);

        // Faire disparaître les fruits
        fruitData.fruits.forEach(fruit => {
            if (fruit.parent) {
                fruit.parent.remove(fruit);
            }
            this.scene.remove(fruit);
            fruit.geometry.dispose();
            fruit.material.dispose();
        });

        // Reset l'arbre fruitier
        fruitData.ready = false;
        fruitData.plantedDate = Date.now();
        fruitData.fruits = [];

        // Ajouter de nouveaux fruits après un moment
        setTimeout(() => {
            if (this.fruitTrees.has(tree)) {
                fruitData.fruits = this.addFruitToTree(tree, fruitData.data);
            }
        }, 5000);

        return {
            type: fruitData.type,
            name: fruitData.data.name,
            emoji: fruitData.data.emoji,
            count: reward
        };
    }

    // ============================================
    // SYSTÈME DE COUPE
    // ============================================

    enableAxe() {
        this.hasAxe = true;
        console.log('🪓 Hache équipée! Cliquez sur un arbre pour le couper.');
    }

    disableAxe() {
        this.hasAxe = false;
        this.selectedTree = null;
        this.chopProgress = 0;
    }

    selectTree(tree) {
        if (!this.hasAxe) return;

        this.selectedTree = tree;
        console.log(`🪓 Arbre sélectionné pour coupe`);
    }

    chopTree(duration = 1) {
        if (!this.selectedTree || !this.hasAxe) return null;

        this.chopProgress += duration;

        if (this.chopProgress >= 3) { // 3 coups pour abattre
            const tree = this.selectedTree;
            const position = tree.position.clone();

            // Log le résultat
            console.log(`🪓🌲 Arbre abattu en position (${position.x.toFixed(1)}, ${position.z.toFixed(1)})`);

            // Retirer l'arbre de la scène
            this.scene.remove(tree);
            tree.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });

            // Retirer des listes
            const treeIndex = this.trees.indexOf(tree);
            if (treeIndex > -1) this.trees.splice(treeIndex, 1);

            // Retirer des fruit trees si c'en était un
            this.fruitTrees.delete(tree);

            // Donner des ressources
            const resources = {
                wood: 5 + Math.floor(Math.random() * 5),
                leaves: 3
            };

            // Reset
            this.selectedTree = null;
            this.chopProgress = 0;

            return resources;
        }

        return { progress: this.chopProgress / 3 };
    }

    // ============================================
    // OISEAUX
    // ============================================

    spawnBirds() {
        const birdCount = 5 + Math.floor(Math.random() * 5);

        for (let i = 0; i < birdCount; i++) {
            const bird = this.createBird();
            bird.position.set(
                (Math.random() - 0.5) * 60,
                5 + Math.random() * 10,
                (Math.random() - 0.5) * 60
            );
            bird.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 2
            );
            bird.userData.targetTree = null;
            bird.userData.isLanded = false;
            bird.userData.landTimer = Math.random() * 10;

            this.birds.push(bird);
            this.birdMeshes.push(bird);
            this.scene.add(bird);
        }

        console.log(`🐦 ${this.birds.length} oiseaux spawnés`);
    }

    createBird() {
        const group = new THREE.Group();

        // Corps
        const bodyGeom = new THREE.SphereGeometry(0.15, 6, 4);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: Math.random() > 0.5 ? 0x333333 : 0x553322,
            roughness: 0.8,
            flatShading: true
        });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.scale.set(1, 0.7, 1.5);
        group.add(body);

        // Tête
        const headGeom = new THREE.SphereGeometry(0.1, 5, 4);
        const head = new THREE.Mesh(headGeom, bodyMat);
        head.position.set(0, 0.1, 0.2);
        group.add(head);

        // Bec
        const beakGeom = new THREE.ConeGeometry(0.03, 0.08, 4);
        const beakMat = new THREE.MeshStandardMaterial({ color: 0xffa500, roughness: 0.7 });
        const beak = new THREE.Mesh(beakGeom, beakMat);
        beak.position.set(0, 0.1, 0.35);
        beak.rotation.x = Math.PI / 2;
        group.add(beak);

        // Ailes
        const wingGeom = new THREE.BoxGeometry(0.4, 0.05, 0.2);
        const wingMat = new THREE.MeshStandardMaterial({
            color: bodyMat.color,
            roughness: 0.8
        });

        const leftWing = new THREE.Mesh(wingGeom, wingMat);
        leftWing.position.set(-0.25, 0, 0);
        leftWing.rotation.z = 0;
        leftWing.userData.isWing = true;
        leftWing.userData.baseRotation = 0;
        group.add(leftWing);

        const rightWing = new THREE.Mesh(wingGeom, wingMat);
        rightWing.position.set(0.25, 0, 0);
        rightWing.rotation.z = 0;
        rightWing.userData.isWing = true;
        rightWing.userData.baseRotation = 0;
        group.add(rightWing);

        // Queue
        const tailGeom = new THREE.BoxGeometry(0.1, 0.05, 0.2);
        const tail = new THREE.Mesh(tailGeom, bodyMat);
        tail.position.set(0, 0, -0.2);
        group.add(tail);

        group.scale.set(0.5 + Math.random() * 0.3, 0.5 + Math.random() * 0.3, 0.5 + Math.random() * 0.3);
        group.userData.type = 'bird';

        return group;
    }

    updateBirds(deltaTime) {
        const time = Date.now() * 0.001;

        this.birds.forEach(bird => {
            const data = bird.userData;

            // Animation des ailes
            bird.traverse(child => {
                if (child.userData.isWing) {
                    if (!data.isLanded) {
                        child.rotation.z = Math.sin(time * 10) * 0.3;
                    } else {
                        child.rotation.z = data.baseRotation;
                    }
                }
            });

            // Comportement
            data.landTimer -= deltaTime;

            if (data.isLanded) {
                // Debout sur un arbre
                if (data.landTimer <= 0) {
                    data.isLanded = false;
                    data.velocity.set(
                        (Math.random() - 0.5) * 3,
                        1 + Math.random(),
                        (Math.random() - 0.5) * 3
                    );
                }
            } else {
                // En vol
                bird.position.add(data.velocity.clone().multiplyScalar(deltaTime));

                // Rotation vers la direction
                if (data.velocity.length() > 0.1) {
                    bird.rotation.y = Math.atan2(data.velocity.x, data.velocity.z);
                }

                // Atterrir sur un arbre aléatoire
                if (data.landTimer <= 0 && Math.random() < 0.002 && this.trees.length > 0) {
                    const targetTree = this.trees[Math.floor(Math.random() * this.trees.length)];
                    data.isLanded = true;
                    data.landTimer = 5 + Math.random() * 10;

                    // Se poser sur l'arbre
                    bird.position.set(
                        targetTree.position.x + (Math.random() - 0.5) * 2,
                        targetTree.position.y + 3 + Math.random() * 2,
                        targetTree.position.z + (Math.random() - 0.5) * 2
                    );
                    data.velocity.set(0, 0, 0);
                }

                // Limites du monde
                const limit = 45;
                if (Math.abs(bird.position.x) > limit || Math.abs(bird.position.z) > limit) {
                    bird.position.set(
                        (Math.random() - 0.5) * 30,
                        5 + Math.random() * 5,
                        (Math.random() - 0.5) * 30
                    );
                }
            }
        });
    }

    // ============================================
    // ANIMAUX
    // ============================================

    spawnAnimals() {
        const animalTypes = ['rabbit', 'deer', 'squirrel'];
        const animalCount = 3 + Math.floor(Math.random() * 4);

        for (let i = 0; i < animalCount; i++) {
            const type = animalTypes[Math.floor(Math.random() * animalTypes.length)];
            const animal = this.createAnimal(type);

            animal.position.set(
                (Math.random() - 0.5) * 70,
                0,
                (Math.random() - 0.5) * 70
            );
            animal.userData.velocity = new THREE.Vector3();
            animal.userData.target = null;
            animal.userData.wanderTimer = Math.random() * 5;
            animal.userData.state = 'idle';

            this.animals.push(animal);
            this.animalMeshes.push(animal);
            this.scene.add(animal);
        }

        console.log(`🦌 ${this.animals.length} animaux spawnés`);
    }

    createAnimal(type) {
        const group = new THREE.Group();

        switch (type) {
            case 'rabbit':
                this.createRabbit(group);
                break;
            case 'deer':
                this.createDeer(group);
                break;
            case 'squirrel':
                this.createSquirrel(group);
                break;
            default:
                this.createRabbit(group);
        }

        group.userData.type = 'animal';
        group.userData.animalType = type;

        return group;
    }

    createRabbit(group) {
        // Corps
        const bodyGeom = new THREE.SphereGeometry(0.2, 6, 4);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0xccbbaa,
            roughness: 0.9,
            flatShading: true
        });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.scale.set(1, 0.8, 1.3);
        body.position.y = 0.2;
        group.add(body);

        // Tête
        const headGeom = new THREE.SphereGeometry(0.12, 5, 4);
        const head = new THREE.Mesh(headGeom, bodyMat);
        head.position.set(0, 0.35, 0.2);
        group.add(head);

        // Oreilles
        const earGeom = new THREE.CylinderGeometry(0.03, 0.05, 0.25, 5);
        const leftEar = new THREE.Mesh(earGeom, bodyMat);
        leftEar.position.set(-0.05, 0.55, 0.15);
        leftEar.rotation.z = -0.2;
        group.add(leftEar);

        const rightEar = new THREE.Mesh(earGeom, bodyMat);
        rightEar.position.set(0.05, 0.55, 0.15);
        rightEar.rotation.z = 0.2;
        group.add(rightEar);

        // Queue
        const tailGeom = new THREE.SphereGeometry(0.06, 5, 4);
        const tailMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
        const tail = new THREE.Mesh(tailGeom, tailMat);
        tail.position.set(0, 0.2, -0.25);
        group.add(tail);

        group.scale.set(0.8, 0.8, 0.8);
    }

    createDeer(group) {
        // Corps
        const bodyGeom = new THREE.BoxGeometry(0.5, 0.5, 0.8);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x8b6914,
            roughness: 0.8,
            flatShading: true
        });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 0.8;
        group.add(body);

        // Tête
        const headGeom = new THREE.BoxGeometry(0.25, 0.3, 0.3);
        const head = new THREE.Mesh(headGeom, bodyMat);
        head.position.set(0, 1.1, 0.5);
        group.add(head);

        // Bois (anda)
        const antlerMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });

        // Bois gauche
        const antlerGeom = new THREE.CylinderGeometry(0.02, 0.04, 0.3, 5);
        const leftAntler = new THREE.Mesh(antlerGeom, antlerMat);
        leftAntler.position.set(-0.1, 1.35, 0.45);
        leftAntler.rotation.z = -0.3;
        group.add(leftAntler);

        const rightAntler = new THREE.Mesh(antlerGeom, antlerMat);
        rightAntler.position.set(0.1, 1.35, 0.45);
        rightAntler.rotation.z = 0.3;
        group.add(rightAntler);

        // Pattes
        const legGeom = new THREE.CylinderGeometry(0.04, 0.05, 0.6, 5);
        const legPositions = [
            [-0.15, 0.3, 0.25], [0.15, 0.3, 0.25],
            [-0.15, 0.3, -0.25], [0.15, 0.3, -0.25]
        ];
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeom, bodyMat);
            leg.position.set(...pos);
            group.add(leg);
        });
    }

    createSquirrel(group) {
        // Corps
        const bodyGeom = new THREE.SphereGeometry(0.15, 6, 4);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.8,
            flatShading: true
        });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.scale.set(0.8, 0.9, 1.2);
        body.position.y = 0.15;
        group.add(body);

        // Tête
        const headGeom = new THREE.SphereGeometry(0.1, 5, 4);
        const head = new THREE.Mesh(headGeom, bodyMat);
        head.position.set(0, 0.3, 0.15);
        group.add(head);

        // Queue touffue
        const tailGeom = new THREE.SphereGeometry(0.12, 6, 4);
        const tail = new THREE.Mesh(tailGeom, bodyMat);
        tail.position.set(0, 0.25, -0.2);
        tail.scale.set(0.6, 0.8, 1.5);
        group.add(tail);

        // Oreilles
        const earGeom = new THREE.ConeGeometry(0.04, 0.08, 4);
        const leftEar = new THREE.Mesh(earGeom, bodyMat);
        leftEar.position.set(-0.06, 0.4, 0.12);
        group.add(leftEar);

        const rightEar = new THREE.Mesh(earGeom, bodyMat);
        rightEar.position.set(0.06, 0.4, 0.12);
        group.add(rightEar);
    }

    updateAnimals(deltaTime) {
        this.animals.forEach(animal => {
            const data = animal.userData;
            data.wanderTimer -= deltaTime;

            // Comportement wander
            if (data.wanderTimer <= 0) {
                data.wanderTimer = 3 + Math.random() * 5;

                // Choisir une nouvelle direction
                const angle = Math.random() * Math.PI * 2;
                const speed = animal.userData.animalType === 'deer' ? 2 : 1;
                data.velocity.set(
                    Math.cos(angle) * speed,
                    0,
                    Math.sin(angle) * speed
                );
                data.state = 'walking';

                // Flip vers la direction
                if (data.velocity.x !== 0 || data.velocity.z !== 0) {
                    animal.rotation.y = Math.atan2(data.velocity.x, data.velocity.z);
                }
            }

            // Faire manger le lapin sur l'herbe
            if (data.animalType === 'rabbit' && Math.random() < 0.001) {
                data.state = 'eating';
                data.velocity.set(0, 0, 0);
            }

            // Déplacer
            if (data.velocity.length() > 0) {
                animal.position.add(data.velocity.clone().multiplyScalar(deltaTime));
            }

            // Animation simple de marche
            if (data.state === 'walking') {
                animal.position.y = Math.abs(Math.sin(Date.now() * 0.01)) * 0.05;
            }

            // Limites
            const limit = 40;
            if (Math.abs(animal.position.x) > limit || Math.abs(animal.position.z) > limit) {
                // Revenir vers le centre
                data.velocity.set(-animal.position.x * 0.1, 0, -animal.position.z * 0.1);
            }
        });
    }

    // ============================================
    // UPDATE PRINCIPAL
    // ============================================

    update(deltaTime) {
        this.updateFruitTrees();
        this.updateBirds(deltaTime);
        this.updateAnimals(deltaTime);
    }

    dispose() {
        // Nettoyer les oiseaux
        this.birds.forEach(bird => {
            this.scene.remove(bird);
            bird.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        });

        // Nettoyer les animaux
        this.animals.forEach(animal => {
            this.scene.remove(animal);
            animal.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        });

        // Nettoyer les fruits
        this.fruitTrees.forEach(fruitData => {
            fruitData.fruits.forEach(fruit => {
                this.scene.remove(fruit);
                fruit.geometry.dispose();
                fruit.material.dispose();
            });
        });
    }
}

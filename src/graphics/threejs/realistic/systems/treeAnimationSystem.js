// =============================================
// Ludus Terrae V2 - Tree Animation & Particles
// Animations de vent et systèmes de particules
// =============================================

import * as THREE from 'three';

export class TreeAnimationSystem {
    constructor(scene, trees) {
        this.scene = scene;
        this.trees = trees;
        this.time = 0;

        // Paramètres de vent
        this.windConfig = {
            enabled: true,
            baseStrength: 0.3,
            strengthVariation: 0.2,
            baseSpeed: 1.0,
            gustFrequency: 0.5,
            direction: new THREE.Vector3(1, 0, 0.5).normalize()
        };

        // Stocke les meshes animés pour chaque arbre
        this.animatedGroups = new Map();

        // Préparer les animations
        this.setupTreeAnimations();
    }

    setupTreeAnimations() {
        this.trees.forEach((tree, index) => {
            const groups = {
                foliage: [],
                branches: [],
                trunk: null
            };

            tree.traverse(child => {
                if (child.isMesh) {
                    // Identifier le type de mesh par sa taille et position
                    const worldY = child.getWorldPosition(new THREE.Vector3()).y;
                    const treeTop = tree.position.y + 4; // Approximation du haut

                    if (worldY > treeTop - 1) {
                        groups.foliage.push(child);
                    } else if (worldY > tree.position.y + 0.5) {
                        groups.branches.push(child);
                    } else {
                        groups.trunk = child;
                    }

                    // Sauvegarder la position originale
                    child.userData.originalPosition = child.position.clone();
                    child.userData.rotationSpeed = 0.5 + Math.random() * 0.5;
                    child.userData.phaseOffset = Math.random() * Math.PI * 2;
                }
            });

            this.animatedGroups.set(tree, groups);
        });

        console.log(`🌬️ ${this.animatedGroups.size} arbres préparés pour animation`);
    }

    update(deltaTime) {
        if (!this.windConfig.enabled) return;

        this.time += deltaTime;

        // Vent avec rafales
        const gustStrength = Math.sin(this.time * this.windConfig.gustFrequency) *
                           Math.sin(this.time * this.windConfig.gustFrequency * 2.7);
        const windStrength = this.windConfig.baseStrength +
                            gustStrength * this.windConfig.strengthVariation;

        this.animatedGroups.forEach((groups, tree) => {
            const treeIndex = this.trees.indexOf(tree);
            const phase = this.time * this.windConfig.baseSpeed + treeIndex * 0.5;

            // Animer le feuillage
            groups.foliage.forEach(mesh => {
                if (!mesh.userData.originalPosition) return;

                const offset = mesh.userData.phaseOffset || 0;
                const speed = mesh.userData.rotationSpeed || 1;

                // Balancement principal
                mesh.rotation.x = Math.sin(phase * speed + offset) * windStrength * 0.1;
                mesh.rotation.z = Math.cos(phase * speed * 0.7 + offset) * windStrength * 0.08;

                // Micro-mouvement
                const micro = Math.sin(phase * speed * 3 + offset) * 0.01;
                mesh.rotation.x += micro;
            });

            // Animer les branches (moins que le feuillage)
            groups.branches.forEach(mesh => {
                if (!mesh.userData.originalPosition) return;

                const offset = mesh.userData.phaseOffset || 0;
                const speed = mesh.userData.rotationSpeed || 1;

                mesh.rotation.x = Math.sin(phase * speed * 0.5 + offset) * windStrength * 0.05;
                mesh.rotation.z = Math.cos(phase * speed * 0.3 + offset) * windStrength * 0.03;
            });
        });
    }

    setWindStrength(strength) {
        this.windConfig.baseStrength = strength;
    }

    setWindEnabled(enabled) {
        this.windConfig.enabled = enabled;

        // Reset positions si désactivé
        if (!enabled) {
            this.animatedGroups.forEach(groups => {
                groups.foliage.forEach(mesh => {
                    if (mesh.userData.originalPosition) {
                        mesh.rotation.x = 0;
                        mesh.rotation.z = 0;
                    }
                });
            });
        }
    }
}

// =============================================
// Système de particules pour les arbres
// =============================================

export class TreeParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.particlePool = [];
        this.maxParticles = 200;

        // Types de particules
        this.particleTypes = {
            leaf: {
                count: 100,
                size: 0.05,
                colors: [0x8B4513, 0xD2691E, 0xCD853F, 0xDAA520, 0xB8860B],
                gravity: -0.3,
                lifetime: 8
            },
            pollen: {
                count: 50,
                size: 0.02,
                colors: [0xFFFFE0, 0xFFFACD, 0xFFF8DC],
                gravity: -0.05,
                lifetime: 5
            },
            blossom: {
                count: 30,
                size: 0.06,
                colors: [0xFFB6C1, 0xFFC0CB, 0xFF69B4, 0xFFFFFF],
                gravity: -0.15,
                lifetime: 6
            }
        };

        this.initPool();
    }

    initPool() {
        // Créer un pool de particules réutilisables
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.maxParticles * 3);
        const colors = new Float32Array(this.maxParticles * 3);
        const sizes = new Float32Array(this.maxParticles);

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true,
            depthWrite: false
        });

        this.mesh = new THREE.Points(geometry, material);
        this.mesh.visible = false;
        this.scene.add(this.mesh);

        // Initialiser le pool
        for (let i = 0; i < this.maxParticles; i++) {
            this.particlePool.push({
                active: false,
                position: new THREE.Vector3(),
                velocity: new THREE.Vector3(),
                life: 0,
                maxLife: 0,
                size: 0.1,
                color: new THREE.Color(),
                type: 'leaf'
            });
        }
    }

    spawnParticle(position, type = 'leaf', velocity = null) {
        // Trouver une particule inactive
        const particle = this.particlePool.find(p => !p.active);
        if (!particle) return;

        const config = this.particleTypes[type] || this.particleTypes.leaf;

        particle.active = true;
        particle.position.copy(position);
        particle.velocity.copy(velocity || new THREE.Vector3(
            (Math.random() - 0.5) * 0.5,
            Math.random() * 0.3 + 0.2,
            (Math.random() - 0.5) * 0.5
        ));
        particle.life = 0;
        particle.maxLife = config.lifetime * (0.5 + Math.random() * 0.5);
        particle.size = config.size * (0.5 + Math.random() * 0.5);
        particle.color.setHex(config.colors[Math.floor(Math.random() * config.colors.length)]);
        particle.type = type;
        particle.rotationSpeed = (Math.random() - 0.5) * 2;
        particle.rotation = new THREE.Vector3(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );

        this.particles.push(particle);
        this.mesh.visible = true;
    }

    spawnFromTree(tree, count = 1) {
        const treeTop = tree.position.y + 3 + Math.random() * 2;
        const spread = 2;

        for (let i = 0; i < count; i++) {
            const pos = new THREE.Vector3(
                tree.position.x + (Math.random() - 0.5) * spread,
                treeTop + (Math.random() - 0.5),
                tree.position.z + (Math.random() - 0.5) * spread
            );

            // Type de particule selon la saison (simplifié)
            const types = ['leaf', 'pollen', 'blossom'];
            const type = types[Math.floor(Math.random() * types.length)];

            this.spawnParticle(pos, type);
        }
    }

    update(deltaTime, trees = []) {
        const config = this.mesh.geometry;

        // Spawner de nouvelles particules
        if (trees.length > 0 && Math.random() < 0.1) {
            const randomTree = trees[Math.floor(Math.random() * trees.length)];
            this.spawnFromTree(randomTree, Math.ceil(Math.random() * 3));
        }

        // Mettre à jour les particules
        const positions = config.attributes.position.array;
        const colors = config.attributes.color.array;
        const sizes = config.attributes.size.array;

        let activeCount = 0;

        for (let i = 0; i < this.particlePool.length; i++) {
            const particle = this.particlePool[i];

            if (!particle.active) {
                // Masquer cette particule
                positions[i * 3] = 0;
                positions[i * 3 + 1] = -1000;
                positions[i * 3 + 2] = 0;
                sizes[i] = 0;
                continue;
            }

            // Mettre à jour la vie
            particle.life += deltaTime;
            if (particle.life >= particle.maxLife) {
                particle.active = false;
                continue;
            }

            // Calculer la gravité
            const typeConfig = this.particleTypes[particle.type] || this.particleTypes.leaf;
            particle.velocity.y += typeConfig.gravity * deltaTime;

            // Vent latéral
            particle.velocity.x += Math.sin(particle.life * 2) * 0.01;
            particle.velocity.z += Math.cos(particle.life * 2) * 0.01;

            // Mettre à jour la position
            particle.position.add(
                particle.velocity.clone().multiplyScalar(deltaTime)
            );

            // Rotation
            particle.rotation.x += particle.rotationSpeed * deltaTime;
            particle.rotation.y += particle.rotationSpeed * 0.5 * deltaTime;

            // Fade out
            const lifeRatio = particle.life / particle.maxLife;
            const alpha = lifeRatio < 0.8 ? 1 : (1 - lifeRatio) / 0.2;

            // Appliquer aux buffers
            positions[i * 3] = particle.position.x;
            positions[i * 3 + 1] = particle.position.y;
            positions[i * 3 + 2] = particle.position.z;

            colors[i * 3] = particle.color.r * alpha;
            colors[i * 3 + 1] = particle.color.g * alpha;
            colors[i * 3 + 2] = particle.color.b * alpha;

            sizes[i] = particle.size * (1 - lifeRatio * 0.5);

            activeCount++;
        }

        config.attributes.position.needsUpdate = true;
        config.attributes.color.needsUpdate = true;
        config.attributes.size.needsUpdate = true;

        // Logger tous les 10 frames
        if (activeCount > 0 && Math.random() < 0.01) {
            console.log(`🍂 ${activeCount} particules actives`);
        }
    }

    setEnabled(enabled) {
        this.mesh.visible = enabled;
        if (!enabled) {
            // Reset toutes les particules
            this.particlePool.forEach(p => p.active = false);
        }
    }

    dispose() {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}

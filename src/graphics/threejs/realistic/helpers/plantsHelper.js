// =============================================
// Ludus Terrae V2 - Plants Helper (BEAUTIFUL)
// Arbres réalistes avec meilleur rendu
// =============================================

import * as THREE from 'three';

/**
 * Palettes de couleurs
 */
const TRUNK_COLORS = [0x4a3728, 0x5c4033, 0x6b4423, 0x3e2723, 0x543025];
const PINE_COLORS = [0x1a4d1a, 0x2d5a2d, 0x3d6b3d, 0x1e3d1e, 0x2a4f2a];
const OAK_LEAVES = [0x2d5a2d, 0x3a7a3a, 0x4a8a4a, 0x5a9a5a, 0x2e6b2e];
const BIRCH_TRUNK = 0xf5f0e8;
const BERRY_COLORS = [0xc62828, 0xe65100, 0xf9a825, 0xad1457, 0x6a1b9a];

/**
 * Fonctions utilitaires
 */
function randomRange(min, max) {
    return min + Math.random() * (max - min);
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Creates a more organic trunk with proper tapering and bark
 */
function createOrganicTrunk(height, baseRadius, topRadius) {
    const group = new THREE.Group();

    // Main trunk using lathe geometry for smooth tapering
    const points = [];
    const segments = 12;
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const y = t * height;
        // Add some organic variation
        const wobble = Math.sin(t * Math.PI * 3) * 0.05 + Math.sin(t * Math.PI * 7) * 0.02;
        const radius = lerp(baseRadius, topRadius, t) * (1 + wobble);
        points.push(new THREE.Vector2(radius, y));
    }

    const trunkGeom = new THREE.LatheGeometry(points, 12);
    const trunkMat = new THREE.MeshStandardMaterial({
        color: TRUNK_COLORS[Math.floor(Math.random() * TRUNK_COLORS.length)],
        roughness: 0.95,
        metalness: 0.0,
        flatShading: true
    });

    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);

    // Bark ridges for texture
    const ridgeCount = 8 + Math.floor(Math.random() * 6);
    for (let i = 0; i < ridgeCount; i++) {
        const t = 0.1 + Math.random() * 0.8;
        const y = t * height;
        const baseR = lerp(baseRadius, topRadius, t) * 1.05;

        const ridgeGeom = new THREE.BoxGeometry(0.03, 0.15 + Math.random() * 0.1, 0.08);
        const ridgeMat = new THREE.MeshStandardMaterial({
            color: 0x2a1a10,
            roughness: 1.0,
            flatShading: true
        });

        const ridge = new THREE.Mesh(ridgeGeom, ridgeMat);
        const angle = Math.random() * Math.PI * 2;
        ridge.position.set(
            Math.cos(angle) * baseR * 0.9,
            y,
            Math.sin(angle) * baseR * 0.9
        );
        ridge.rotation.y = angle;
        ridge.castShadow = true;
        group.add(ridge);
    }

    // Exposed roots at base
    const rootCount = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < rootCount; i++) {
        const angle = (i / rootCount) * Math.PI * 2 + Math.random() * 0.3;
        const rootLen = baseRadius * (2 + Math.random());

        const rootGeom = new THREE.CylinderGeometry(
            baseRadius * 0.15,
            baseRadius * 0.25,
            rootLen, 6
        );
        const rootMat = new THREE.MeshStandardMaterial({
            color: TRUNK_COLORS[Math.floor(Math.random() * TRUNK_COLORS.length)],
            roughness: 0.95,
            flatShading: true
        });

        const root = new THREE.Mesh(rootGeom, rootMat);
        root.position.set(
            Math.cos(angle) * baseRadius * 0.7,
            rootLen * 0.2,
            Math.sin(angle) * baseRadius * 0.7
        );
        root.rotation.z = Math.PI / 2.5 + Math.random() * 0.4;
        root.rotation.y = angle + Math.PI / 4;
        root.castShadow = true;
        group.add(root);
    }

    return group;
}

/**
 * Creates a beautiful foliage cluster with multiple overlapping spheres
 */
function createFoliageCluster(radius, colors, opacity = 1) {
    const group = new THREE.Group();

    // Main cluster - large deformed sphere
    const mainGeom = new THREE.SphereGeometry(radius, 8, 6);
    const mainColor = colors[Math.floor(Math.random() * colors.length)];
    const mainMat = new THREE.MeshStandardMaterial({
        color: mainColor,
        roughness: 0.85,
        flatShading: true
    });

    const main = new THREE.Mesh(mainGeom, mainMat);
    main.scale.set(
        1 + randomRange(-0.15, 0.15),
        0.85 + randomRange(-0.1, 0.1),
        1 + randomRange(-0.15, 0.15)
    );
    main.castShadow = true;
    main.receiveShadow = true;
    group.add(main);

    // Secondary clusters around the main one
    const subCount = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < subCount; i++) {
        const subRadius = radius * (0.4 + Math.random() * 0.4);
        const subGeom = new THREE.SphereGeometry(subRadius, 7, 5);

        // Vary the color slightly
        const colorIdx = Math.floor(Math.random() * colors.length);
        const subMat = new THREE.MeshStandardMaterial({
            color: colors[colorIdx],
            roughness: 0.8 + Math.random() * 0.15,
            flatShading: true
        });

        const sub = new THREE.Mesh(subGeom, subMat);

        // Position in a natural-looking cluster pattern
        const theta = randomRange(0, Math.PI * 2);
        const phi = randomRange(0.2, Math.PI * 0.8);
        const dist = radius * (0.5 + Math.random() * 0.4);

        sub.position.set(
            Math.sin(phi) * Math.cos(theta) * dist,
            Math.cos(phi) * dist * 0.7 - radius * 0.2,
            Math.sin(phi) * Math.sin(theta) * dist
        );

        sub.scale.set(
            1 + randomRange(-0.2, 0.2),
            0.8 + randomRange(-0.15, 0.15),
            1 + randomRange(-0.2, 0.2)
        );
        sub.castShadow = true;
        sub.receiveShadow = true;
        group.add(sub);
    }

    // Add some darker inner clusters for depth
    if (Math.random() > 0.5) {
        const darkGeom = new THREE.SphereGeometry(radius * 0.5, 6, 4);
        const darkMat = new THREE.MeshStandardMaterial({
            color: 0x1a3a1a,
            roughness: 0.9,
            flatShading: true
        });
        const dark = new THREE.Mesh(darkGeom, darkMat);
        dark.position.y = -radius * 0.3;
        dark.castShadow = true;
        group.add(dark);
    }

    return group;
}

/**
 * Creates a realistic pine tree
 */
function createPineTreeMesh(height, baseRadius) {
    const group = new THREE.Group();

    // Organic trunk
    const trunk = createOrganicTrunk(height * 0.35, baseRadius * 0.4, baseRadius * 0.25);
    trunk.position.y = 0;
    group.add(trunk);

    // Pine tiers - realistic layered structure
    const tierCount = 4 + Math.floor(Math.random() * 3);
    const tierHeight = (height * 0.65) / tierCount;

    for (let tier = 0; tier < tierCount; tier++) {
        const t = tier / tierCount;
        const tierRadius = baseRadius * (1.2 - t * 0.7);
        const y = height * 0.3 + tier * tierHeight;

        // Main tier cone
        const coneGeom = new THREE.ConeGeometry(tierRadius, tierHeight * 1.2, 10);
        const coneMat = new THREE.MeshStandardMaterial({
            color: PINE_COLORS[Math.floor(Math.random() * PINE_COLORS.length)],
            roughness: 0.9,
            flatShading: true
        });

        const cone = new THREE.Mesh(coneGeom, coneMat);
        cone.position.y = y + tierHeight * 0.5;
        cone.rotation.y = Math.random() * Math.PI;
        cone.castShadow = true;
        cone.receiveShadow = true;
        group.add(cone);

        // Secondary overlapping cones for density
        for (let j = 0; j < 2; j++) {
            const subConeGeom = new THREE.ConeGeometry(
                tierRadius * (0.7 + Math.random() * 0.3),
                tierHeight,
                8
            );
            const subConeMat = new THREE.MeshStandardMaterial({
                color: PINE_COLORS[Math.floor(Math.random() * PINE_COLORS.length)],
                roughness: 0.85,
                flatShading: true
            });

            const subCone = new THREE.Mesh(subConeGeom, subConeMat);
            subCone.position.set(
                (Math.random() - 0.5) * tierRadius * 0.3,
                y + tierHeight * 0.4 + j * tierHeight * 0.3,
                (Math.random() - 0.5) * tierRadius * 0.3
            );
            subCone.rotation.y = Math.random() * Math.PI;
            subCone.rotation.z = (Math.random() - 0.5) * 0.2;
            subCone.castShadow = true;
            subCone.receiveShadow = true;
            group.add(subCone);
        }

        // Drooping branches
        const branchCount = 5 + Math.floor(Math.random() * 4);
        for (let b = 0; b < branchCount; b++) {
            const branchAngle = (b / branchCount) * Math.PI * 2 + Math.random() * 0.5;
            const branchLen = tierRadius * (0.6 + Math.random() * 0.4);

            // Branch cylinder
            const branchGeom = new THREE.CylinderGeometry(
                0.04 - tier * 0.005,
                0.08 - tier * 0.005,
                branchLen, 5
            );
            const branchMat = new THREE.MeshStandardMaterial({
                color: 0x2a1a0a,
                roughness: 0.95,
                flatShading: true
            });

            const branch = new THREE.Mesh(branchGeom, branchMat);
            branch.position.set(
                Math.cos(branchAngle) * tierRadius * 0.7,
                y + tierHeight * 0.3,
                Math.sin(branchAngle) * tierRadius * 0.7
            );
            branch.rotation.z = Math.PI / 2.2 + tier * 0.15 + Math.random() * 0.2;
            branch.rotation.y = branchAngle;
            branch.castShadow = true;
            group.add(branch);

            // Needles cluster at branch end
            const needleCluster = createNeedleCluster(branchLen * 0.4, tier);
            needleCluster.position.set(
                Math.cos(branchAngle) * branchLen * 0.8,
                y + tierHeight * 0.2 - tierHeight * 0.1,
                Math.sin(branchAngle) * branchLen * 0.8
            );
            needleCluster.rotation.y = branchAngle;
            group.add(needleCluster);
        }
    }

    // Top spire
    const spireGeom = new THREE.ConeGeometry(baseRadius * 0.15, height * 0.15, 6);
    const spireMat = new THREE.MeshStandardMaterial({
        color: 0x1a3a1a,
        roughness: 0.9,
        flatShading: true
    });
    const spire = new THREE.Mesh(spireGeom, spireMat);
    spire.position.y = height * 0.92;
    spire.castShadow = true;
    group.add(spire);

    return group;
}

/**
 * Creates hanging needle cluster for pine trees
 */
function createNeedleCluster(size, tier) {
    const group = new THREE.Group();

    const needleCount = 8 + Math.floor(Math.random() * 6);
    for (let i = 0; i < needleCount; i++) {
        const needleGeom = new THREE.CylinderGeometry(0.008, 0.015, size, 4);
        const needleMat = new THREE.MeshStandardMaterial({
            color: PINE_COLORS[Math.floor(Math.random() * PINE_COLORS.length)],
            roughness: 0.8,
            flatShading: true
        });

        const needle = new THREE.Mesh(needleGeom, needleMat);
        const angle = randomRange(0, Math.PI * 2);
        const r = randomRange(0, size * 0.3);
        needle.position.set(
            Math.cos(angle) * r,
            -randomRange(0, size * 0.5),
            Math.sin(angle) * r
        );
        needle.rotation.z = Math.PI / 2 + randomRange(-0.8, 0.8);
        needle.rotation.x = randomRange(-0.3, 0.3);
        needle.castShadow = true;
        group.add(needle);
    }

    return group;
}

/**
 * Creates a beautiful oak tree
 */
function createOakTreeMesh(height, baseRadius) {
    const group = new THREE.Group();

    // Thick, impressive trunk
    const trunk = createOrganicTrunk(height * 0.4, baseRadius * 0.6, baseRadius * 0.35);
    group.add(trunk);

    // Main crown - large and impressive
    const crownRadius = baseRadius * 2.5;
    const crown = createFoliageCluster(crownRadius, OAK_LEAVES);
    crown.position.y = height * 0.65;
    crown.scale.set(1, 0.75, 1);
    group.add(crown);

    // Secondary crowns for volume
    for (let i = 0; i < 3; i++) {
        const subRadius = crownRadius * (0.5 + Math.random() * 0.3);
        const subCrown = createFoliageCluster(subRadius, OAK_LEAVES);
        const angle = (i / 3) * Math.PI * 2 + randomRange(-0.3, 0.3);
        const dist = crownRadius * (0.4 + Math.random() * 0.3);
        subCrown.position.set(
            Math.cos(angle) * dist,
            height * 0.5 + Math.random() * height * 0.2,
            Math.sin(angle) * dist
        );
        subCrown.scale.set(1, 0.7 + Math.random() * 0.2, 1);
        group.add(subCrown);
    }

    // Acorns
    if (Math.random() > 0.4) {
        const acornCount = 3 + Math.floor(Math.random() * 5);
        for (let i = 0; i < acornCount; i++) {
            const acorn = createAcorn();
            acorn.position.set(
                (Math.random() - 0.5) * crownRadius * 1.5,
                height * 0.5 + Math.random() * height * 0.35,
                (Math.random() - 0.5) * crownRadius * 1.5
            );
            acorn.rotation.set(
                randomRange(-0.3, 0.3),
                randomRange(0, Math.PI * 2),
                randomRange(-0.3, 0.3)
            );
            group.add(acorn);
        }
    }

    return group;
}

/**
 * Creates a simple acorn
 */
function createAcorn() {
    const group = new THREE.Group();

    // Nut
    const nutGeom = new THREE.SphereGeometry(0.06, 6, 4);
    const nutMat = new THREE.MeshStandardMaterial({
        color: 0x6d4c2a,
        roughness: 0.8,
        flatShading: true
    });
    const nut = new THREE.Mesh(nutGeom, nutMat);
    nut.scale.y = 1.4;
    group.add(nut);

    // Cap
    const capGeom = new THREE.SphereGeometry(0.07, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2);
    const capMat = new THREE.MeshStandardMaterial({
        color: 0x5a3d1a,
        roughness: 0.9,
        flatShading: true
    });
    const cap = new THREE.Mesh(capGeom, capMat);
    cap.position.y = 0.04;
    cap.scale.y = 0.6;
    group.add(cap);

    // Stem
    const stemGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.05, 4);
    const stem = new THREE.Mesh(stemGeom, capMat);
    stem.position.y = 0.09;
    group.add(stem);

    return group;
}

/**
 * Creates a birch tree - tall and elegant
 */
function createBirchTreeMesh(height, baseRadius) {
    const group = new THREE.Group();

    // Tall, slender trunk
    const trunkGeom = new THREE.CylinderGeometry(
        baseRadius * 0.2,
        baseRadius * 0.35,
        height * 0.7,
        10
    );
    const trunkMat = new THREE.MeshStandardMaterial({
        color: BIRCH_TRUNK,
        roughness: 0.7,
        metalness: 0.1,
        flatShading: true
    });
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.position.y = height * 0.35;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);

    // Bark markings - dark horizontal lines
    const markCount = 15 + Math.floor(Math.random() * 10);
    for (let i = 0; i < markCount; i++) {
        const t = 0.1 + Math.random() * 0.7;
        const y = t * height * 0.7;

        const markGeom = new THREE.BoxGeometry(0.04, 0.06 + Math.random() * 0.08, 0.06);
        const markMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 1.0,
            flatShading: true
        });

        const mark = new THREE.Mesh(markGeom, markMat);
        const angle = Math.random() * Math.PI * 2;
        const r = baseRadius * 0.25 + Math.random() * 0.05;
        mark.position.set(
            Math.cos(angle) * r,
            y + height * 0.35,
            Math.sin(angle) * r
        );
        mark.rotation.y = angle;
        group.add(mark);
    }

    // Branches - slender and elegant
    const branchCount = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < branchCount; i++) {
        const t = 0.4 + (i / branchCount) * 0.5;
        const y = t * height * 0.7 + height * 0.35;
        const branchLen = height * 0.25;

        const branchGeom = new THREE.CylinderGeometry(0.02, 0.05, branchLen, 5);
        const branchMat = new THREE.MeshStandardMaterial({
            color: BIRCH_TRUNK,
            roughness: 0.7,
            flatShading: true
        });

        const branch = new THREE.Mesh(branchGeom, branchMat);
        const angle = (i / branchCount) * Math.PI * 2 + Math.random() * 0.5;
        branch.position.set(
            Math.cos(angle) * baseRadius * 0.3,
            y,
            Math.sin(angle) * baseRadius * 0.3
        );
        branch.rotation.z = Math.PI / 2.5 + Math.random() * 0.3;
        branch.rotation.y = angle;
        branch.castShadow = true;
        group.add(branch);
    }

    // Leaf clusters - smaller and more delicate than oak
    const leafRadius = baseRadius * 0.8;
    const crown = createFoliageCluster(leafRadius, [
        0x7cb342, 0x8bc34a, 0x9ccc65, 0xaed581, 0xc5e1a5
    ]);
    crown.position.y = height * 0.72;
    crown.scale.set(1, 0.8, 1);
    group.add(crown);

    return group;
}

/**
 * Creates a willow tree - cascading branches
 */
function createWillowTreeMesh(height, baseRadius) {
    const group = new THREE.Group();

    // Tall trunk
    const trunkGeom = new THREE.CylinderGeometry(
        baseRadius * 0.25,
        baseRadius * 0.4,
        height * 0.6,
        10
    );
    const trunkMat = new THREE.MeshStandardMaterial({
        color: 0x5a4a3a,
        roughness: 0.9,
        flatShading: true
    });
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.position.y = height * 0.3;
    trunk.castShadow = true;
    group.add(trunk);

    // Cascading branches
    const branchCount = 7 + Math.floor(Math.random() * 5);
    const willowColors = [0x6b8e23, 0x7caa2d, 0x8bc34a, 0x9ccc65, 0x8bc34a];

    for (let i = 0; i < branchCount; i++) {
        const angle = (i / branchCount) * Math.PI * 2;
        const branchLen = height * (0.4 + Math.random() * 0.3);

        // Main cascading branch
        const branchGeom = new THREE.CylinderGeometry(0.02, 0.06, branchLen, 5);
        const branchMat = new THREE.MeshStandardMaterial({
            color: willowColors[Math.floor(Math.random() * willowColors.length)],
            roughness: 0.8,
            flatShading: true
        });

        const branch = new THREE.Mesh(branchGeom, branchMat);
        const y = height * 0.5 + Math.random() * height * 0.15;
        branch.position.set(
            Math.cos(angle) * baseRadius * 0.3,
            y,
            Math.sin(angle) * baseRadius * 0.3
        );
        branch.rotation.z = Math.PI / 2 + Math.PI / 6 + Math.random() * 0.3;
        branch.rotation.y = angle;
        branch.castShadow = true;
        group.add(branch);

        // Hanging foliage strands
        const strandCount = 5 + Math.floor(Math.random() * 5);
        for (let j = 0; j < strandCount; j++) {
            const strandLen = branchLen * (0.5 + Math.random() * 0.5);
            const strandGeom = new THREE.CylinderGeometry(0.008, 0.02, strandLen, 4);
            const strandMat = new THREE.MeshStandardMaterial({
                color: willowColors[Math.floor(Math.random() * willowColors.length)],
                roughness: 0.7,
                flatShading: true
            });

            const strand = new THREE.Mesh(strandGeom, strandMat);
            const t = 0.3 + Math.random() * 0.6;
            strand.position.set(
                Math.cos(angle) * (baseRadius * 0.5 + t * branchLen * 0.5),
                y - t * branchLen * 0.4 - strandLen * 0.3,
                Math.sin(angle) * (baseRadius * 0.5 + t * branchLen * 0.5)
            );
            strand.rotation.z = Math.PI / 2 + Math.random() * 0.5;
            strand.castShadow = true;
            group.add(strand);

            // Small leaves clusters at end of strands
            if (Math.random() > 0.5) {
                const leafCluster = createFoliageCluster(0.2 + Math.random() * 0.2, willowColors);
                leafCluster.position.set(
                    strand.position.x + (Math.random() - 0.5) * 0.2,
                    strand.position.y - strandLen * 0.4,
                    strand.position.z + (Math.random() - 0.5) * 0.2
                );
                group.add(leafCluster);
            }
        }
    }

    // Weeping top
    const topCrown = createFoliageCluster(baseRadius * 1.5, willowColors);
    topCrown.position.y = height * 0.85;
    topCrown.scale.set(1, 0.6, 1);
    group.add(topCrown);

    return group;
}

/**
 * Creates a poplar tree - tall and columnar
 */
function createPoplarTreeMesh(height, baseRadius) {
    const group = new THREE.Group();

    // Tall, straight trunk
    const trunkGeom = new THREE.CylinderGeometry(
        baseRadius * 0.2,
        baseRadius * 0.35,
        height * 0.75,
        10
    );
    const trunkMat = new THREE.MeshStandardMaterial({
        color: 0x5a5045,
        roughness: 0.85,
        flatShading: true
    });
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.position.y = height * 0.375;
    trunk.castShadow = true;
    group.add(trunk);

    // Columnar crown
    const crownHeight = height * 0.45;
    const crownRadius = baseRadius * 0.8;
    const poplarColors = [0x4a7c4a, 0x5a8c5a, 0x3d6b3d, 0x4a8a4a, 0x6b9b6b];

    // Multiple overlapping ellipses for columnar shape
    const layerCount = 5;
    for (let i = 0; i < layerCount; i++) {
        const t = i / layerCount;
        const layerRadius = crownRadius * (1 - t * 0.3) * (0.8 + Math.random() * 0.4);
        const y = height * 0.6 + t * crownHeight;

        const crownLayer = createFoliageCluster(layerRadius, poplarColors);
        crownLayer.position.y = y;
        crownLayer.scale.set(1, 1.5, 1);
        group.add(crownLayer);
    }

    // Pointed top
    const topGeom = new THREE.ConeGeometry(crownRadius * 0.4, crownHeight * 0.3, 8);
    const topMat = new THREE.MeshStandardMaterial({
        color: poplarColors[Math.floor(Math.random() * poplarColors.length)],
        roughness: 0.8,
        flatShading: true
    });
    const top = new THREE.Mesh(topGeom, topMat);
    top.position.y = height * 0.9;
    top.castShadow = true;
    group.add(top);

    return group;
}

/**
 * Creates a cypress tree - tall and slender, good for near water
 */
function createCypressTreeMesh(height, baseRadius) {
    const group = new THREE.Group();

    // Slender trunk
    const trunkGeom = new THREE.CylinderGeometry(
        baseRadius * 0.15,
        baseRadius * 0.25,
        height * 0.7,
        8
    );
    const trunkMat = new THREE.MeshStandardMaterial({
        color: 0x4a3a2a,
        roughness: 0.9,
        flatShading: true
    });
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.position.y = height * 0.35;
    trunk.castShadow = true;
    group.add(trunk);

    // Cypress crown - narrow and columnar
    const cypressColors = [0x2d4a2d, 0x3d5a3d, 0x2a4a2a, 0x1a3a1a, 0x3a5a3a];
    const crownRadius = baseRadius * 0.5;
    const crownHeight = height * 0.55;

    // Stack of foliage layers
    const layerCount = 8;
    for (let i = 0; i < layerCount; i++) {
        const t = i / layerCount;
        const layerY = height * 0.35 + t * crownHeight;
        const layerRadius = crownRadius * (1 - t * 0.4) * (0.9 + Math.random() * 0.2);

        // Main cone for this layer
        const coneGeom = new THREE.ConeGeometry(layerRadius, crownHeight / layerCount * 1.2, 8);
        const coneMat = new THREE.MeshStandardMaterial({
            color: cypressColors[Math.floor(Math.random() * cypressColors.length)],
            roughness: 0.85,
            flatShading: true
        });
        const cone = new THREE.Mesh(coneGeom, coneMat);
        cone.position.y = layerY;
        cone.castShadow = true;
        group.add(cone);
    }

    // Pointed top
    const topGeom = new THREE.ConeGeometry(crownRadius * 0.2, height * 0.1, 6);
    const topMat = new THREE.MeshStandardMaterial({
        color: 0x1a3a1a,
        roughness: 0.9,
        flatShading: true
    });
    const top = new THREE.Mesh(topGeom, topMat);
    top.position.y = height * 0.92;
    top.castShadow = true;
    group.add(top);

    return group;
}

/**
 * Creates a maple tree - round crown with beautiful fall colors
 */
function createMapleTreeMesh(height, baseRadius) {
    const group = new THREE.Group();

    // Sturdy trunk
    const trunk = createOrganicTrunk(height * 0.4, baseRadius * 0.5, baseRadius * 0.3);
    group.add(trunk);

    // Round, umbrella-like crown
    const crownRadius = baseRadius * 2.8;
    const mapleColors = [0xc62828, 0xe65100, 0xff6d00, 0xff8f00, 0xffa726, 0xef6c00];

    const crown = createFoliageCluster(crownRadius, mapleColors);
    crown.position.y = height * 0.7;
    crown.scale.set(1.2, 0.7, 1.2);
    group.add(crown);

    // Secondary clusters for fullness
    for (let i = 0; i < 4; i++) {
        const subRadius = crownRadius * (0.4 + Math.random() * 0.2);
        const sub = createFoliageCluster(subRadius, mapleColors);
        const angle = (i / 4) * Math.PI * 2;
        sub.position.set(
            Math.cos(angle) * crownRadius * 0.5,
            height * 0.55 + Math.random() * height * 0.1,
            Math.sin(angle) * crownRadius * 0.5
        );
        group.add(sub);
    }

    // Winged seeds (samaras)
    if (Math.random() > 0.5) {
        const seedCount = 5 + Math.floor(Math.random() * 5);
        for (let i = 0; i < seedCount; i++) {
            const seed = createMapleSeed();
            seed.position.set(
                (Math.random() - 0.5) * crownRadius * 1.5,
                height * 0.5 + Math.random() * height * 0.4,
                (Math.random() - 0.5) * crownRadius * 1.5
            );
            seed.rotation.set(
                randomRange(-0.5, 0.5),
                randomRange(0, Math.PI * 2),
                randomRange(-0.5, 0.5)
            );
            group.add(seed);
        }
    }

    return group;
}

/**
 * Creates a maple seed (samara)
 */
function createMapleSeed() {
    const group = new THREE.Group();

    // Wing
    const wingGeom = new THREE.BoxGeometry(0.3, 0.01, 0.08);
    const wingMat = new THREE.MeshStandardMaterial({
        color: 0x8b7355,
        roughness: 0.8,
        flatShading: true
    });
    const wing = new THREE.Mesh(wingGeom, wingMat);
    group.add(wing);

    // Seed body
    const seedGeom = new THREE.SphereGeometry(0.03, 5, 4);
    const seedMat = new THREE.MeshStandardMaterial({
        color: 0x4a3728,
        roughness: 0.8,
        flatShading: true
    });
    const seed = new THREE.Mesh(seedGeom, seedMat);
    seed.position.set(0.1, 0, 0);
    seed.scale.set(1.5, 1, 1);
    group.add(seed);

    return group;
}

/**
 * Creates a generic deciduous tree
 */
function createGenericTreeMesh(height, baseRadius) {
    const group = new THREE.Group();

    // Trunk
    const trunk = createOrganicTrunk(height * 0.45, baseRadius * 0.45, baseRadius * 0.25);
    group.add(trunk);

    // Crown
    const crownRadius = baseRadius * 2;
    const crown = createFoliageCluster(crownRadius, OAK_LEAVES);
    crown.position.y = height * 0.6;
    crown.scale.set(1, 0.85, 1);
    group.add(crown);

    // Secondary clusters
    for (let i = 0; i < 2; i++) {
        const subRadius = crownRadius * 0.5;
        const sub = createFoliageCluster(subRadius, OAK_LEAVES);
        const angle = (i + 1) * Math.PI * 1.3;
        sub.position.set(
            Math.cos(angle) * crownRadius * 0.5,
            height * 0.5 + Math.random() * height * 0.1,
            Math.sin(angle) * crownRadius * 0.5
        );
        group.add(sub);
    }

    // Some berries
    if (Math.random() > 0.6) {
        const berryCount = 4 + Math.floor(Math.random() * 4);
        const berryColor = BERRY_COLORS[Math.floor(Math.random() * BERRY_COLORS.length)];

        for (let i = 0; i < berryCount; i++) {
            const berryGeom = new THREE.SphereGeometry(0.05, 5, 4);
            const berryMat = new THREE.MeshStandardMaterial({
                color: berryColor,
                roughness: 0.4,
                flatShading: true
            });

            const berry = new THREE.Mesh(berryGeom, berryMat);
            berry.position.set(
                (Math.random() - 0.5) * crownRadius * 1.5,
                height * 0.4 + Math.random() * height * 0.35,
                (Math.random() - 0.5) * crownRadius * 1.5
            );
            berry.castShadow = true;
            group.add(berry);
        }
    }

    return group;
}

/**
 * Main PlantsHelper class
 */
export class PlantsHelper {
    constructor(scene) {
        this.scene = scene;
    }

    createTree(type = 'generic', position = new THREE.Vector3(), rot = new THREE.Euler()) {
        let tree;

        // Randomize size
        const height = 4 + Math.random() * 4;
        const baseRadius = 0.4 + Math.random() * 0.3;

        switch (type) {
            case 'pine':
                tree = createPineTreeMesh(height, baseRadius);
                break;
            case 'oak':
                tree = createOakTreeMesh(height, baseRadius);
                break;
            case 'birch':
                tree = createBirchTreeMesh(height, baseRadius * 0.7);
                break;
            case 'willow':
                tree = createWillowTreeMesh(height, baseRadius);
                break;
            case 'poplar':
                tree = createPoplarTreeMesh(height, baseRadius);
                break;
            case 'cypress':
                tree = createCypressTreeMesh(height, baseRadius);
                break;
            case 'maple':
                tree = createMapleTreeMesh(height, baseRadius);
                break;
            default:
                tree = createGenericTreeMesh(height, baseRadius);
        }

        tree.position.copy(position);
        tree.rotation.copy(rot);

        return tree;
    }

    createGrassParticle(position) {
        const height = 0.08 + Math.random() * 0.12;
        const width = 0.015 + Math.random() * 0.01;

        const geometry = new THREE.ConeGeometry(width, height, 4);
        const colors = [0x4CAF50, 0x66BB6A, 0x81C784, 0x43A047, 0x388E3C];

        const material = new THREE.MeshStandardMaterial({
            color: colors[Math.floor(Math.random() * colors.length)],
            roughness: 0.6,
            flatShading: true
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.position.y += height / 2;
        mesh.rotation.x = (Math.random() - 0.5) * 0.3;
        mesh.rotation.z = (Math.random() - 0.5) * 0.3;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }

    createBush(position, size = 0.5) {
        const bush = new THREE.Group();
        bush.position.copy(position);

        const colors = [0x2E7D32, 0x388E3C, 0x43A047, 0x4CAF50, 0x558B2F];

        // Main clusters
        const mainCluster = createFoliageCluster(size * 0.5, colors);
        bush.add(mainCluster);

        // Side clusters
        for (let i = 0; i < 2; i++) {
            const sub = createFoliageCluster(size * 0.3, colors);
            sub.position.set(
                (Math.random() - 0.5) * size * 0.5,
                size * 0.1,
                (Math.random() - 0.5) * size * 0.5
            );
            bush.add(sub);
        }

        // Berries
        if (Math.random() > 0.5) {
            const berryCount = 2 + Math.floor(Math.random() * 3);
            for (let i = 0; i < berryCount; i++) {
                const berryGeom = new THREE.SphereGeometry(0.04, 5, 4);
                const berryMat = new THREE.MeshStandardMaterial({
                    color: BERRY_COLORS[Math.floor(Math.random() * BERRY_COLORS.length)],
                    roughness: 0.4,
                    flatShading: true
                });
                const berry = new THREE.Mesh(berryGeom, berryMat);
                berry.position.set(
                    (Math.random() - 0.5) * size,
                    size * 0.3 + Math.random() * size * 0.2,
                    (Math.random() - 0.5) * size
                );
                berry.castShadow = true;
                bush.add(berry);
            }
        }

        return bush;
    }

    createFlower(position, size = 0.3) {
        const flower = new THREE.Group();
        flower.position.copy(position);

        // Stem
        const stemHeight = size * 0.6 + Math.random() * 0.3;
        const stemGeom = new THREE.CylinderGeometry(0.015, 0.02, stemHeight, 5);
        const stemMat = new THREE.MeshStandardMaterial({
            color: 0x388E3C,
            roughness: 0.7
        });
        const stem = new THREE.Mesh(stemGeom, stemMat);
        stem.position.y = -stemHeight / 2 - size * 0.1;
        stem.castShadow = true;
        flower.add(stem);

        // Petals
        const petalCount = 5 + Math.floor(Math.random() * 3);
        const petalColors = [0xE91E63, 0xFF5722, 0xFFEB3B, 0x9C27B0, 0x2196F3];

        for (let i = 0; i < petalCount; i++) {
            const petalGeom = new THREE.SphereGeometry(size * 0.15, 6, 4);
            const petalMat = new THREE.MeshStandardMaterial({
                color: petalColors[Math.floor(Math.random() * petalColors.length)],
                roughness: 0.6,
                flatShading: true
            });

            const petal = new THREE.Mesh(petalGeom, petalMat);
            const angle = (i / petalCount) * Math.PI * 2;
            petal.position.set(
                Math.cos(angle) * size * 0.2,
                size * 0.2,
                Math.sin(angle) * size * 0.2
            );
            petal.scale.set(0.4, 1, 0.3);
            petal.rotation.y = -angle + Math.PI / 2;
            petal.castShadow = true;
            flower.add(petal);
        }

        // Center
        const centerGeom = new THREE.SphereGeometry(size * 0.08, 6, 4);
        const centerMat = new THREE.MeshStandardMaterial({
            color: 0xFFC107,
            roughness: 0.4
        });
        const center = new THREE.Mesh(centerGeom, centerMat);
        center.position.y = size * 0.2;
        center.castShadow = true;
        flower.add(center);

        return flower;
    }

    createRock(position, size = 0.5) {
        const geom = new THREE.IcosahedronGeometry(size * 0.8, 1);

        const grayValue = 80 + Math.random() * 40;
        const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(grayValue / 255, (grayValue - 10) / 255, (grayValue - 20) / 255),
            roughness: 0.9,
            flatShading: true
        });

        const rock = new THREE.Mesh(geom, mat);
        rock.position.copy(position);

        rock.rotation.set(
            Math.random() * Math.PI * 0.4,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 0.4
        );

        rock.scale.set(
            0.7 + Math.random() * 0.5,
            0.5 + Math.random() * 0.4,
            0.7 + Math.random() * 0.4
        );

        rock.castShadow = true;
        rock.receiveShadow = true;

        // Moss
        if (Math.random() > 0.5) {
            const mossGeom = new THREE.IcosahedronGeometry(size * 0.25, 0);
            const mossMat = new THREE.MeshStandardMaterial({
                color: 0x3E8E3E,
                roughness: 0.95
            });
            const moss = new THREE.Mesh(mossGeom, mossMat);
            moss.position.set(
                (Math.random() - 0.5) * size * 0.3,
                size * 0.25,
                (Math.random() - 0.5) * size * 0.3
            );
            moss.scale.set(1, 0.4, 1);
            rock.add(moss);
        }

        return rock;
    }
}

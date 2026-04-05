// =============================
// LUDUS TERRAE V2 - APPLICATION
// Nouveau moteur graphique réaliste AVEC MINI-SERRES ET BOUTIQUE
// =============================

import * as THREE from 'three';
import { RealisticWorld } from './realisticWorld.js';
import { gameState } from './stateManager.js';
import { MiniSerre3D, GROWTH_STAGES } from './miniSerre.js';
import { ShopSystem, SEEDS_CATALOG } from './shop.js';
import { AIEvolutionManager, aiEvolution } from '../../../lib/ai-engine.js';
import { GardenChatAI, gardenChat } from '../../../lib/garden-chat-ai.js';
import { RealGreenhouseHelper } from './helpers/realGreenhouseHelper.js';
import { GridDeck } from './helpers/gridDeckHelper.js';
import { FineGridDeck, VEGETABLES_CATALOG } from './helpers/FineGridDeck.js';
import { TreeAnimationSystem, TreeParticleSystem } from './systems/treeAnimationSystem.js';
import { TreeGameplaySystem } from './systems/treeGameplaySystem.js';

export class RealisticApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.world = null;
        this._initToken = 0;
        this.serres = [];
        this.isAnimating = false;
        this.clock = new THREE.Clock();

        // État du jeu
        this.gameState = {
            score: 0,
            level: 1,
            streak: 0,
            coins: 100, // Pièces pour la boutique
            inventory: {},
            maxSerres: 5 // Limite de serres
        };

        // Mode positionnement manuel des graines
        this.isSeedDragMode = false;
        this.selectedSeed = null;
        this.selectedSerre = null;

        // Système d'évolution automatique IA
        this.evolutionManager = new AIEvolutionManager();
        this.evolutionEnabled = true;
        this.lastAutoEvolution = Date.now();
        this.autoEvolutionInterval = 60 * 1000; // 1 minute pour démo (24h en prod)

        // Système de boutique
        this.shop = new ShopSystem(this.gameState);
        this.shopUI = null;

        // Système Chat IA
        this.chatAI = gardenChat;
        this.isChatOpen = false;

        // Système Serre Réelle
        this.realGreenhouse = null;
        this.isGreenhousePlacementMode = false;

        // Système Grid Deck (grille isométrique pour le jardin)
        this.gridDeck = null;
        this.isGridDeckMode = false;
        // Grille fine légumes (10cm/cellule, 24x50m)
        this.fineGridDeck = null;
        this.isFineGridDeckMode = false;
        this.selectedGardenObjectDef = null;

        // Systèmes d'arbres
        this.treeAnimation = null;
        this.treeParticles = null;
        this.treeGameplay = null;
        this.animationEnabled = true;
    }

    // ============================
    // GESTION DES SERRES
    // ============================

    addSerre(name = null, position = null) {
        if (this.serres.length >= this.gameState.maxSerres) {
            console.warn(`❌ Limite de ${this.gameState.maxSerres} serres atteinte`);
            if (window.showNotification) {
                window.showNotification(`❌ Limite de ${this.gameState.maxSerres} serres atteinte!`);
            }
            return null;
        }

        const serreId = `serre-${Date.now()}`;
        const serreName = name || `Serre ${this.serres.length + 1}`;

        // Position par défaut en arc de cercle
        const angle = (this.serres.length / Math.min(this.gameState.maxSerres, 5)) * Math.PI * 0.6 - Math.PI * 0.3;
        const radius = 12;
        const defaultPos = position || new THREE.Vector3(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
        );

        const serre = new MiniSerre3D(this.scene, {
            id: serreId,
            name: serreName,
            position: defaultPos
        });

        this.serres.push(serre);
        console.log(`🏠 ${serreName} ajoutée! Total: ${this.serres.length}`);

        if (window.showNotification) {
            window.showNotification(`🏠 ${serreName} ajoutée!`);
        }

        return serre;
    }

    removeSerre(serreId) {
        const idx = this.serres.findIndex(s => s.id === serreId);
        if (idx === -1) {
            console.warn('❌ Serre non trouvée');
            return false;
        }

        const serre = this.serres[idx];
        serre.destroy();
        this.serres.splice(idx, 1);
        console.log(`🗑️ Serre supprimée! Total: ${this.serres.length}`);

        if (window.showNotification) {
            window.showNotification(`🗑️ Serre supprimée`);
        }

        return true;
    }

    // ============================
    // POSITIONNEMENT MANUEL DES GRAINES
    // ============================

    enableSeedDragMode() {
        this.isSeedDragMode = true;
        this.isDragMode = false;
        console.log('🌱 Mode positionnement manuel ACTIVÉ');
        if (window.showNotification) {
            window.showNotification('🌱 Mode positionnement: Clique sur une graine puis déplace-la');
        }
    }

    disableSeedDragMode() {
        this.isSeedDragMode = false;
        this.selectedSeed = null;
        this.selectedSerre = null;
        console.log('🌱 Mode positionnement désactivé');
    }

    handleSeedDragClick(raycaster, mouse, serre, idx) {
        const plant = serre.getPlantAt(idx);

        if (plant && !this.selectedSeed) {
            // Sélectionner la graine
            this.selectedSeed = { serre, idx, plant };
            this.selectedSerre = serre;
            serre.selectCell(idx);
            console.log(`🌱 Graine sélectionnée: ${plant.name}`);
            return;
        }

        if (this.selectedSeed && this.selectedSeed.serre === serre) {
            // Déplacer vers une autre cellule vide
            if (!plant) {
                const oldIdx = this.selectedSeed.idx;
                const plantData = this.selectedSeed.plant.toJSON();

                // Retirer de l'ancienne position
                serre.removePlant(oldIdx);

                // Ajouter à la nouvelle position
                serre.addPlant(plantData, idx);

                console.log(`✅ Plante déplacée de ${oldIdx} vers ${idx}`);

                this.disableSeedDragMode();
                serre.selectCell(null);
            } else {
                console.log('⚠️ Cellule occupée!');
            }
        }
    }

    async init(container) {
        try {
            console.log('🎮 Initialisation de Ludus Terrae V2...');

            // Utiliser les dimensions du container (pas window)
            const w = container.offsetWidth || 800;
            const h = container.offsetHeight || 500;
            console.log('[LudusTerra] Container:', w, 'x', h);

            // 1. Initialiser le renderer avec anti-aliasing
            try {
                this.renderer = new THREE.WebGLRenderer({
                    antialias: true,
                    alpha: false,
                    powerPreference: 'high-performance',
                });
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            } catch(e) {
                console.error('[LudusTerra] WebGLRenderer failed:', e);
                // Fallback sans WebGL
                this.renderer = new THREE.WebGLRenderer({ alpha: true });
            }
            console.log('[LudusTerra] Renderer created, canvas:', !!this.renderer.domElement);
            this.renderer.setSize(w, h);
            this.renderer.shadowMap.enabled = false;
            this.renderer.outputColorSpace = THREE.SRGBColorSpace;
            this.renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;';
            container.appendChild(this.renderer.domElement);
            console.log('[LudusTerra] Canvas appended to container, parent:', container.children.length);

            // 2. Initialiser la scène
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x87CEEB);
            this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

            // 3. Initialiser la caméra
            this.camera = new THREE.PerspectiveCamera(
                60,
                w / h,
                0.1,
                1000
            );
            this.camera.position.set(30, 25, 30);
            this.camera.lookAt(0, 0, 0);

            // 4. Configurer l'éclairage
            this.setupLighting();

            // 5. Initialiser le monde naturel
            this.world = new RealisticWorld(this.scene, this.camera, this.renderer);
            this.world.createWorld({
                worldSize: 80,
                plantDensity: 50,
                treeDensity: 20,
                rockCount: 30,
                includeBuildings: false,
                includeWater: true,
                includeWaterPlants: true,
                waterPlantCount: 15,
                pondSize: 10
            });

            console.log('[LudusTerra] Scene objects:', this.scene.children.length);
            console.log('[LudusTerra] Camera position:', this.camera.position.x, this.camera.position.y, this.camera.position.z);

            // 6. Créer les mini-serres
            this.createSerres();

            // 7. Initialiser la serre réelle (placement sur terrain)
            this.realGreenhouse = new RealGreenhouseHelper(this.scene);

            // 8. Initialiser le Grid Deck (grille isométrique pour le jardin)
            this.gridDeck = new GridDeck(this.scene);
            this.gridDeck.createGrid(12, 10, 80); // 12x10 grid, worldSize 80 (same as world)
            this.gridDeck.setVisible(false); // starts hidden, toggled with 'P'

            // 8b. Initialiser la grille fine (légumes, 10cm/cellule, 24x50m)
            this.fineGridDeck = new FineGridDeck(this.scene);
            this.fineGridDeck.setVisible(false); // starts hidden, toggled with 'V'

            // 9. Initialiser les systèmes d'arbres (animation, particules, gameplay)
            this.initTreeSystems();

            // 10. Configurer les contrôles
            this.setupCameraControls();
            this.setupGameControls();

            // 11. Configurer la boutique
            this.setupShop();

            // 12. Configurer le chat IA
            this.setupChatAI();

            // 13. Gérer le redimensionnement
            this.handleResize();

            // 14. Charger l'état sauvegardé du Grid Deck
            this._loadGridDeckState();

            // 14b. Charger l'état de la grille fine
            if (this.fineGridDeck) {
                this.fineGridDeck.setCamera(this.camera);
                this.fineGridDeck._loadState();
            }

            // 15. Exposer l'app globalement
            this.exposeGlobal();

            console.log('✅ Ludus Terrae V2 initialisé');
            console.log(`🏠 ${this.serres.length} mini-serres`);
            console.log(`🪙 ${this.gameState.coins} pièces`);

            return true;
        } catch (error) {
            console.error('❌ Erreur:', error);
            return false;
        }
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
        sunLight.position.set(50, 80, 50);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 4096;
        sunLight.shadow.mapSize.height = 4096;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 200;
        sunLight.shadow.camera.left = -60;
        sunLight.shadow.camera.right = 60;
        sunLight.shadow.camera.top = 60;
        sunLight.shadow.camera.bottom = -60;
        sunLight.shadow.bias = -0.0001;
        this.scene.add(sunLight);

        const fillLight = new THREE.DirectionalLight(0x88ccff, 0.3);
        fillLight.position.set(-30, 40, -30);
        this.scene.add(fillLight);

        const warmLight = new THREE.PointLight(0xffd700, 0.2, 100);
        warmLight.position.set(0, 20, 0);
        this.scene.add(warmLight);
    }

    createSerres() {
        // Pas de mini-serres par défaut sur la carte 3D
        // Les mini-serres sont gérées dans l'onglet "Chambres de cultures"
        // Use the Grid Deck mode (P) to place "Serre en Bois" structures
    }

    addDemoPlants(serre) {
        const now = Date.now();
        const day = 1000 * 60 * 60 * 24;

        // Différents stades pour voir la progression
        serre.addPlant({
            plantId: 'tomato',
            name: 'Tomate',
            icon: '🍅',
            color: 0xff0000,
            plantedDate: now - 3 * day,
            daysToMaturity: 30
        }, 0);

        serre.addPlant({
            plantId: 'carrot',
            name: 'Carotte',
            icon: '🥕',
            color: 0xff8c00,
            plantedDate: now - 10 * day,
            daysToMaturity: 25
        }, 1);

        serre.addPlant({
            plantId: 'salad',
            name: 'Salade',
            icon: '🥬',
            color: 0x90EE90,
            plantedDate: now - 18 * day,
            daysToMaturity: 20
        }, 2);

        serre.addPlant({
            plantId: 'corn',
            name: 'Maïs',
            icon: '🌽',
            color: 0xffdd00,
            plantedDate: now - 15 * day,
            daysToMaturity: 28
        }, 4);

        serre.addPlant({
            plantId: 'strawberry',
            name: 'Fraise',
            icon: '🍓',
            color: 0xff4444,
            plantedDate: now - 25 * day,
            daysToMaturity: 40
        }, 5);

        serre.addPlant({
            plantId: 'pepper',
            name: 'Poivron',
            icon: '🫑',
            color: 0x228B22,
            plantedDate: now - 20 * day,
            daysToMaturity: 35
        }, 8);
    }

    setupShop() {
        // Callback quand une graine est achetée — sync avec React
        this.shop.setOnPurchase((seedId, serreId, cellIdx) => {
            const serre = this.serres.find(s => s.id === serreId);
            if (serre) {
                const seed = SEEDS_CATALOG.find(s => s.id === seedId);
                if (seed) {
                    serre.addPlant({
                        plantId: seed.id,
                        name: seed.name,
                        icon: seed.icon,
                        color: seed.color,
                        plantedDate: Date.now(),
                        daysToMaturity: seed.daysToMaturity
                    }, cellIdx);
                    console.log(`🌱 ${seed.name} plantée!`);
                    // Sync coins vers React
                    if (window.__greenhubAddCoins) {
                        window.__greenhubAddCoins(-seed.price);
                    }
                }
            }
        });
    }

    // ============================
    // UI DE GESTION DES SERRES
    // ============================

    showSerreManagement() {
        const existing = document.getElementById('serre-management');
        if (existing) { existing.remove(); return; }

        const panel = document.createElement('div');
        panel.id = 'serre-management';
        panel.style.cssText = `
            position: fixed; top: 10px; right: 10px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 2px solid #7ed957; border-radius: 12px;
            padding: 16px; min-width: 200px; z-index: 100;
            font-family: system-ui, sans-serif;
        `;

        const renderSerreList = () => `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <h3 style="color:#7ed957;margin:0;font-size:14px;">🏠 Mes Serres</h3>
                <span style="color:#888;font-size:11px;">${this.serres.length}/${this.gameState.maxSerres}</span>
            </div>
            <div id="serre-list" style="margin-bottom:12px;">
                ${this.serres.length === 0 ? `
                    <div style="color:#666;font-size:12px;text-align:center;padding:12px 0;">
                        Aucune serre — ajoute-en une ci-dessous
                    </div>
                ` : this.serres.map((s, i) => `
                    <div style="
                        display:flex;justify-content:space-between;align-items:center;
                        background:rgba(255,255,255,0.05);border-radius:6px;padding:8px;margin-bottom:6px;
                        cursor:pointer;
                    " onclick="window.app.openSerrePanel('${s.id}')" title="Ouvrir cette serre">
                        <div>
                            <div style="color:#fff;font-size:12px;">${s.name}</div>
                            <div style="color:#888;font-size:10px;">${s.plants.filter(p=>p).length} plantes</div>
                        </div>
                        <div style="display:flex;gap:4px;">
                            <button onclick="event.stopPropagation();window.app.openSerrePanel('${s.id}')" style="
                                background:#27ae60;border:none;color:#fff;font-size:10px;
                                padding:4px 8px;border-radius:4px;cursor:pointer;
                            ">Ouvrir</button>
                            <button onclick="event.stopPropagation();window.app.removeSerre('${s.id}')" style="
                                background:#e74c3c;border:none;color:#fff;font-size:10px;
                                padding:4px 8px;border-radius:4px;cursor:pointer;
                            ">×</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button id="btn-add-serre" style="
                width:100%;background:#27ae60;border:none;color:#fff;
                padding:8px;border-radius:6px;cursor:pointer;font-size:12px;
            ">➕ Ajouter une serre</button>
        `;

        panel.innerHTML = renderSerreList();
        document.body.appendChild(panel);

        document.getElementById('btn-add-serre').onclick = () => {
            this.addSerre();
            panel.innerHTML = renderSerreList();
            document.getElementById('btn-add-serre').onclick = () => {
                this.addSerre();
                panel.innerHTML = renderSerreList();
                document.getElementById('btn-add-serre').onclick = () => this.addSerre();
            };
        };

        // Fermer en cliquant ailleurs
        setTimeout(() => {
            const closeHandler = (e) => {
                if (!panel.contains(e.target) && e.target.id !== 'serre-management-btn') {
                    panel.remove();
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
        }, 100);
    }

    openSerrePanel(serreId) {
        const serre = this.serres.find(s => s.id === serreId);
        if (!serre) return;

        // Popup de confirmation avant d'entrer
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.7); z-index: 300;
            display: flex; align-items: center; justify-content: center;
        `;

        overlay.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid #7ed957; border-radius: 16px;
                padding: 28px 32px; text-align: center;
                font-family: system-ui, sans-serif;
                box-shadow: 0 20px 60px rgba(0,0,0,0.6);
                max-width: 320px;
            ">
                <div style="font-size:48px;margin-bottom:12px;">🏠</div>
                <div style="color:#fff;font-size:16px;font-weight:700;margin-bottom:6px;">
                    Voulez-vous entrer dans la serre ?
                </div>
                <div style="color:#888;font-size:13px;margin-bottom:20px;">
                    ${serre.name}
                </div>
                <div style="display:flex;gap:10px;justify-content:center;">
                    <button id="btn-enter-serre" style="
                        flex:1; background:#27ae60; border:none; color:#fff;
                        padding:10px 16px; border-radius:8px; cursor:pointer;
                        font-size:13px; font-weight:600;
                    ">✅ Entrer</button>
                    <button id="btn-cancel-enter" style="
                        flex:1; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2);
                        color:#fff; padding:10px 16px; border-radius:8px; cursor:pointer;
                        font-size:13px;
                    ">Annuler</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('btn-enter-serre').onclick = () => {
            overlay.remove();
            this._showSerreDetail(serreId);
        };

        document.getElementById('btn-cancel-enter').onclick = () => {
            overlay.remove();
        };

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
    }

    _showSerreDetail(serreId) {
        const serre = this.serres.find(s => s.id === serreId);
        if (!serre) return;

        const existing = document.getElementById('serre-detail');
        if (existing) existing.remove();

        const panel = document.createElement('div');
        panel.id = 'serre-detail';
        panel.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 2px solid #7ed957; border-radius: 16px;
            padding: 20px; min-width: 340px; z-index: 200;
            font-family: system-ui, sans-serif;
            box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        `;

        const COLS = 4, ROWS = 6;
        const plants = serre.plants;

        const renderGrid = () => {
            return `
                <div style="display:grid;grid-template-columns:repeat(${COLS},1fr);gap:6px;margin-bottom:16px;">
                    ${plants.map((p, idx) => {
                        const emoji = p ? (p.emoji || GROWTH_STAGES[p.stage || 0]?.emoji || '🌱') : '';
                        const bgColor = p ? 'rgba(46,204,113,0.2)' : 'rgba(255,255,255,0.05)';
                        const borderColor = p ? 'rgba(46,204,113,0.5)' : 'rgba(255,255,255,0.1)';
                        return `<div onclick="window.app.onSerreCellClick('${serreId}', ${idx})" style="
                            width:52px;height:52px;
                            background:${bgColor};
                            border:2px solid ${borderColor};
                            border-radius:8px;
                            display:flex;align-items:center;justify-content:center;
                            font-size:22px;
                            cursor:pointer;
                            transition:all 0.15s;
                        " title="${p ? p.name : 'Vide'}">${emoji}</div>`;
                    }).join('')}
                </div>
            `;
        };

        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <div>
                    <h2 style="color:#7ed957;margin:0;font-size:16px;">🏠 ${serre.name}</h2>
                    <div style="color:#888;font-size:11px;margin-top:2px;">
                        ${plants.filter(p=>p).length}/${plants.length} plantes
                    </div>
                </div>
                <button onclick="document.getElementById('serre-detail').remove()" style="
                    background:transparent;border:1px solid #555;color:#888;
                    font-size:16px;width:28px;height:28px;border-radius:6px;
                    cursor:pointer;line-height:1;
                ">×</button>
            </div>
            ${renderGrid()}
            <div style="display:flex;gap:8px;margin-bottom:8px;">
                <button onclick="window.app.addPlantToSerre('${serreId}')" style="
                    flex:1;background:#27ae60;border:none;color:#fff;
                    padding:8px;border-radius:6px;cursor:pointer;font-size:12px;
                ">🌱 Ajouter une plante</button>
            </div>
            <div id="serre-cell-actions" style="display:none;margin-top:12px;padding:12px;
                background:rgba(46,204,113,0.1);border:1px solid rgba(46,204,113,0.3);border-radius:10px;">
            </div>
        `;

        document.body.appendChild(panel);

        const escHandler = (e) => {
            if (e.key === 'Escape') {
                panel.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    onSerreCellClick(serreId, idx) {
        const serre = this.serres.find(s => s.id === serreId);
        if (!serre) return;
        const plant = serre.plants[idx];
        const actionsDiv = document.getElementById('serre-cell-actions');
        if (!actionsDiv) return;

        if (!plant) {
            actionsDiv.style.display = 'none';
            return;
        }

        const stage = GROWTH_STAGES[plant.stage || 0];
        actionsDiv.style.display = 'block';
        actionsDiv.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                <span style="font-size:28px;">${stage?.emoji || '🌱'}</span>
                <div>
                    <div style="color:#fff;font-size:13px;font-weight:600;">${plant.name}</div>
                    <div style="color:#7ed957;font-size:11px;">${stage?.name || 'Croissance'} · J+${plant.day || 0}</div>
                </div>
            </div>
            <div style="display:flex;gap:6px;">
                <button onclick="window.app.removePlantFromSerre('${serreId}', ${idx})" style="
                    flex:1;background:rgba(220,53,69,0.3);border:1px solid rgba(220,53,69,0.5);
                    color:#ff6b6b;padding:7px 0;border-radius:6px;cursor:pointer;font-size:11px;
                ">🗑️ Retirer</button>
                <button onclick="document.getElementById('serre-cell-actions').style.display='none'" style="
                    flex:1;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);
                    color:#fff;padding:7px 0;border-radius:6px;cursor:pointer;font-size:11px;
                ">Fermer</button>
            </div>
        `;
    }

    addPlantToSerre(serreId) {
        const serre = this.serres.find(s => s.id === serreId);
        if (!serre) return;
        const emptyIdx = serre.plants.findIndex(p => !p);
        if (emptyIdx === -1) {
            if (window.showNotification) window.showNotification('❌ Serre pleine !');
            return;
        }
        serre.addPlant({
            plantId: 'tomato',
            name: 'Tomate',
            emoji: '🍅',
            color: 0xff4444,
            stage: 0,
            day: 0,
        });
        this.openSerrePanel(serreId);
        if (window.showNotification) window.showNotification('🌱 Plante ajoutée !');
    }

    removePlantFromSerre(serreId, idx) {
        const serre = this.serres.find(s => s.id === serreId);
        if (!serre) return;
        serre.removePlant(idx);
        this.openSerrePanel(serreId);
        if (window.showNotification) window.showNotification('🗑️ Plante retirée');
    }

    // Exposer l'app globalement pour les callbacks
    exposeGlobal() {
        window.app = this;
        console.log('🌐 App exposée globalement (window.app)');
    }

    setupCameraControls() {
        let isDragging    = false;   // orbit drag
        let isPanning     = false;    // right/middle click pan
        let previousMouse = { x: 0, y: 0 };
        let theta = Math.PI / 4;
        let phi   = Math.PI / 3;
        let radius = 45;
        let panX   = 0;
        let panZ   = 0;

        const updateCameraPosition = () => {
            if (!this.camera) return;
            this.camera.position.x = panX + radius * Math.sin(phi) * Math.cos(theta);
            this.camera.position.z = panZ + radius * Math.sin(phi) * Math.sin(theta);
            this.camera.position.y = panZ * 0.2 + radius * Math.cos(phi);
            this.camera.lookAt(panX, 0, panZ);
        };

        updateCameraPosition();
        const canvas = this.renderer.domElement;

        // Orbit drag (left click) — only when NOT in grid mode
        canvas.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            if (this.isGridDeckMode || this.isFineGridDeckMode) return;
            isDragging = true;
            previousMouse = { x: e.clientX, y: e.clientY };
        });

        // Right click or middle click — pan
        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 1 || e.button === 2) {
                isPanning = true;
                previousMouse = { x: e.clientX, y: e.clientY };
                e.preventDefault();
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            const dx = e.clientX - previousMouse.x;
            const dy = e.clientY - previousMouse.y;

            // Pan
            if (isPanning) {
                panX -= dx * 0.08;
                panZ -= dy * 0.08;
                panX = Math.max(-14, Math.min(14, panX));
                panZ = Math.max(-27, Math.min(27, panZ));
                updateCameraPosition();
                previousMouse = { x: e.clientX, y: e.clientY };
                return;
            }

            // Orbit
            if (!isDragging) return;
            if (this.isGridDeckMode || this.isFineGridDeckMode) return;
            theta -= dx * 0.005;
            phi   -= dy * 0.005;
            phi = Math.max(0.3, Math.min(Math.PI / 2 - 0.1, phi));
            updateCameraPosition();
            previousMouse = { x: e.clientX, y: e.clientY };
        });

        canvas.addEventListener('mouseup',   () => { isDragging = false; isPanning = false; });
        canvas.addEventListener('mouseleave', () => { isDragging = false; isPanning = false; });

        canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Scroll — zoom
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            radius += e.deltaY * 0.03;
            radius = Math.max(5, Math.min(200, radius));
            updateCameraPosition();
        }, { passive: false });

        // Double-click — reset view
        canvas.addEventListener('dblclick', () => {
            theta = Math.PI / 4;
            phi   = Math.PI / 3;
            radius = 60;
            panX  = 0;
            panZ  = 0;
            updateCameraPosition();
        });
    }

    setupGameControls() {
        const canvas = this.renderer.domElement;

        canvas.addEventListener('click', (e) => {
            if (e.target !== canvas) return;
            this.handleClick(e);
        });

        // Grid Deck hover detection — coarse (P) ou fine (V)
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouse = new THREE.Vector2(
                ((e.clientX - rect.left) / rect.width) * 2 - 1,
                -((e.clientY - rect.top) / rect.height) * 2 + 1
            );

            // Grille fine (V)
            if (this.isFineGridDeckMode && this.fineGridDeck) {
                this.fineGridDeck.handleHover(mouse);
                return;
            }

            // Grille coarse (P)
            if (this.isGridDeckMode && this.gridDeck) {
                const raycaster = new THREE.Raycaster();
                raycaster.setFromCamera(mouse, this.camera);
                const intersects = raycaster.intersectObjects(this.gridDeck.getCellMeshes(), false);
                if (intersects.length > 0) {
                    const cell = this.gridDeck.getCellFromMesh(intersects[0].object);
                    if (cell) {
                        this.gridDeck.highlightCell(cell.row, cell.col);
                        if (this.selectedGardenObjectDef) {
                            this.gridDeck.showGhostPreview(this.selectedGardenObjectDef, cell.row, cell.col);
                        }
                        if (this.gridDeck.isRectMode) {
                            this.gridDeck.updateRectHover(cell.row, cell.col);
                        }
                    }
                } else {
                    this.gridDeck.clearHighlight();
                    this.gridDeck.clearGhostPreview();
                }
            }
        });

        // Drag mode: click and drag objects
        this.isDragMode = false;
        this.selectedObject = null;
        this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        this.dragOffset = new THREE.Vector3();

        // Ajouter les contrôles clavier
        this.setupKeyboardControls();
    }

    setupKeyboardControls() {
        window.addEventListener('keydown', (e) => {
            // Ctrl+Z = Undo last batch placement (fine grid)
            if (e.ctrlKey && e.key === 'z' && this.isFineGridDeckMode && this.fineGridDeck) {
                const count = this.fineGridDeck.undoLastBatch();
                if (count > 0 && window.showNotification) {
                    window.showNotification(`↩️ ${count} objet${count > 1 ? 's' : ''} annulé${count > 1 ? 's' : ''}`);
                }
                return;
            }
            switch(e.key) {
                case 'd':
                case 'D':
                    // Toggle drag mode (déplacer serres)
                    this.setDragMode(!this.isDragMode);
                    if (this.isDragMode) this.disableSeedDragMode();
                    break;
                case 's':
                case 'S':
                    // Toggle seed drag mode
                    if (this.isSeedDragMode) {
                        this.disableSeedDragMode();
                    } else {
                        this.enableSeedDragMode();
                        if (this.isDragMode) this.setDragMode(false);
                    }
                    break;
                case 'Escape':
                    // Annuler
                    if (this.isSeedDragMode) this.disableSeedDragMode();
                    if (this.isDragMode) this.setDragMode(false);
                    if (this.selectedObject) this.selectedObject = null;
                    if (this.gridDeck && this.gridDeck.isRectMode) this.gridDeck.cancelRect();
                    if (this.isFineGridDeckMode && this.fineGridDeck) {
                        if (this.fineGridDeck.isLineMode) this.fineGridDeck.cancelLine();
                        if (this.fineGridDeck.isRectMode) this.fineGridDeck.cancelRect();
                    }
                    break;
                case '+':
                case '=':
                    // Ajouter une serre
                    this.addSerre();
                    break;
                case '-':
                case '_':
                    // Supprimer dernière serre
                    if (this.serres.length > 0) {
                        const lastSerre = this.serres[this.serres.length - 1];
                        this.removeSerre(lastSerre.id);
                    }
                    break;
                case 'h':
                case 'H':
                    // Afficher l'aide
                    this.showHelp();
                    break;
                case 'e':
                case 'E':
                    // Forcer une évolution manuelle
                    this.performAutoEvolution();
                    break;
                case 't':
                case 'T':
                    // Toggle évolution automatique
                    this.toggleAutoEvolution();
                    break;
                case 'c':
                case 'C':
                    // Ouvrir le chat IA
                    if (this.isChatOpen) {
                        this.closeChat();
                    } else {
                        this.openChat();
                    }
                    break;
                case 'g':
                case 'G':
                    // Mode placement serre réelle
                    if (this.isGreenhousePlacementMode) {
                        this.cancelGreenhousePlacement();
                    } else {
                        this.startGreenhousePlacement();
                    }
                    break;
                case 'p':
                case 'P':
                    // Toggle Grid Deck mode (coarse — arbres, structures)
                    this.isGridDeckMode = !this.isGridDeckMode;
                    this.isFineGridDeckMode = false;
                    if (this.gridDeck) {
                        this.gridDeck.setVisible(this.isGridDeckMode);
                        if (this.isGridDeckMode) {
                            this.gridDeck.createUI(this);
                            if (this.fineGridDeck) this.fineGridDeck.setVisible(false);
                            if (window.showNotification) window.showNotification('📐 Grille Arbres — P pour quitter, V = grille fine');
                        } else {
                            this.gridDeck.removeUI();
                            this.gridDeck.cancelRect();
                            this.selectedGardenObjectDef = null;
                        }
                    }
                    break;
                case 'v':
                case 'V':
                    // Toggle Fine Grid Deck mode (légumes, 10cm/cellule)
                    this.isFineGridDeckMode = !this.isFineGridDeckMode;
                    this.isGridDeckMode = false;
                    if (this.fineGridDeck) {
                        this.fineGridDeck.setVisible(this.isFineGridDeckMode);
                        if (this.isFineGridDeckMode) {
                            this.fineGridDeck.createUI(this);
                            if (this.gridDeck) {
                                this.gridDeck.setVisible(false);
                                this.gridDeck.removeUI();
                            }
                            if (window.showNotification) window.showNotification('🥕 Grille Fine (10cm) — V pour quitter, P = grille arbres');
                        } else {
                            this.fineGridDeck.removeUI();
                            this.fineGridDeck.cancelRect();
                            this.selectedGardenObjectDef = null;
                        }
                    }
                    break;
                case 'r':
                case 'R':
                    // Toggle Rectangle mode (actif sur grille active)
                    {
                        const targetGrid = this.isFineGridDeckMode ? this.fineGridDeck : this.gridDeck;
                        const isActive = this.isFineGridDeckMode ? this.isFineGridDeckMode : this.isGridDeckMode;
                        if (targetGrid && isActive) {
                            if (targetGrid.isRectMode) {
                                targetGrid.cancelRect();
                                if (window.showNotification) window.showNotification('❌ Rectangle annulé');
                            } else {
                                targetGrid.startRectMode();
                            }
                        }
                    }
                    break;
                case 'l':
                case 'L':
                    // Toggle Line mode (grille fine uniquement)
                    {
                        if (this.isFineGridDeckMode && this.fineGridDeck) {
                            if (this.fineGridDeck.isLineMode) {
                                this.fineGridDeck.cancelLine();
                                if (window.showNotification) window.showNotification('❌ Ligne annulée');
                            } else {
                                // Cancel rect if active
                                if (this.fineGridDeck.isRectMode) this.fineGridDeck.cancelRect();
                                this.fineGridDeck.startLineMode();
                            }
                        }
                    }
                    break;
                case 'w':
                case 'W':
                    // Toggle animations des arbres
                    this.animationEnabled = !this.animationEnabled;
                    if (this.treeAnimation) {
                        this.treeAnimation.setWindEnabled(this.animationEnabled);
                    }
                    if (this.treeParticles) {
                        this.treeParticles.setEnabled(this.animationEnabled);
                    }
                    console.log(`🌬️ Animations arbres: ${this.animationEnabled ? 'ON' : 'OFF'}`);
                    if (window.showNotification) {
                        window.showNotification(`🌬️ Animations: ${this.animationEnabled ? 'ON' : 'OFF'}`);
                    }
                    break;
                case 'x':
                case 'X':
                    // Équiper/déséquiper la hache
                    if (this.treeGameplay) {
                        if (this.treeGameplay.hasAxe) {
                            this.treeGameplay.disableAxe();
                            if (window.showNotification) window.showNotification('🪓 Hache rangée');
                        } else {
                            this.treeGameplay.enableAxe();
                            if (window.showNotification) window.showNotification('🪓 Hache équipée!');
                        }
                    }
                    break;
            }
        });
        console.log('⌨️ Contrôles clavier activés');
    }

    showHelp() {
        const helpHTML = `
            <div id="help-modal" style="
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.8); display: flex;
                align-items: center; justify-content: center; z-index: 2000;
            ">
                <div style="
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    border: 2px solid #7ed957; border-radius: 16px;
                    padding: 24px; width: 90%; max-width: 400px;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="color: #7ed957; font-size: 18px; margin: 0;">⌨️ Raccourcis Clavier</h2>
                        <button onclick="document.getElementById('help-modal').remove()" style="
                            background: none; border: none; color: #fff; font-size: 24px; cursor: pointer;
                        ">×</button>
                    </div>
                    <div style="color: #ccc; font-size: 13px; line-height: 2;">
                        <p><kbd style="background:#333;padding:2px 8px;border-radius:4px;color:#7ed957;">S</kbd> Mode positionnement graine</p>
                        <p><kbd style="background:#333;padding:2px 8px;border-radius:4px;color:#7ed957;">D</kbd> Mode déplacer serre</p>
                        <p><kbd style="background:#333;padding:2px 8px;border-radius:4px;color:#7ed957;">E</kbd> Forcer évolution</p>
                        <p><kbd style="background:#333;padding:2px 8px;border-radius:4px;color:#7ed957;">T</kbd> Toggle évolution auto</p>
                        <p><kbd style="background:#333;padding:2px 8px;border-radius:4px;color:#7ed957;">+</kbd> Ajouter une serre</p>
                        <p><kbd style="background:#333;padding:2px 8px;border-radius:4px;color:#7ed957;">-</kbd> Supprimer dernière serre</p>
                        <p><kbd style="background:#333;padding:2px 8px;border-radius:4px;color:#7ed957;">Esc</kbd> Annuler / Quitter mode</p>
                        <p><kbd style="background:#333;padding:2px 8px;border-radius:4px;color:#7ed957;">H</kbd> Afficher cette aide</p>
                    </div>
                    <p style="color: #888; font-size: 11px; margin-top: 16px; text-align: center;">
                        🖱️ Clic gauche sur graine = sélectionner/récolter<br/>
                        🖱️ Clic gauche sur alvéole vide = boutique
                    </p>
                </div>
            </div>
        `;
        const existing = document.getElementById('help-modal');
        if (existing) existing.remove();
        document.body.insertAdjacentHTML('beforeend', helpHTML);
    }

    setDragMode(enabled) {
        this.isDragMode = enabled;
        if (!enabled && this.selectedObject) {
            this.selectedObject = null;
        }
        console.log('🖐️ Mode drag:', enabled ? 'ON' : 'OFF');
    }

    resetCamera() {
        // Reset camera position
        const canvas = this.renderer.domElement;
        // This will be handled by the camera controls
        console.log('📷 Camera reset');
    }

    handleClick(e) {
        if (!this.renderer) return;
        const rect = this.renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        // Fine Grid Deck mode (V) — click via raycast plane
        if (this.isFineGridDeckMode && this.fineGridDeck) {
            const intersects = raycaster.intersectObject(this.fineGridDeck.getRaycastPlane(), false);
            if (intersects.length > 0) {
                const pt = intersects[0].point;
                const cell = this.fineGridDeck.worldToCell(pt.x, pt.z);
                if (cell) {
                    this.handleFineGridDeckClick(cell.row, cell.col);
                }
            }
            return;
        }

        // Grid Deck mode - click on isometric grid cells
        if (this.isGridDeckMode && this.gridDeck) {
            const intersects = raycaster.intersectObjects(this.gridDeck.getCellMeshes(), false);
            if (intersects.length > 0) {
                const cell = this.gridDeck.getCellFromMesh(intersects[0].object);
                if (cell) {
                    this.handleGridDeckClick(cell.row, cell.col);
                }
            }
            return;
        }

        // Mode placement serre réelle
        if (this.isGreenhousePlacementMode) {
            this.handleGreenhousePlacement(raycaster, mouse);
            this.confirmGreenhousePlacement();
            return;
        }

        // En mode drag de graine, déplacer les plantes
        if (this.isSeedDragMode) {
            for (const serre of this.serres) {
                const intersects = raycaster.intersectObjects(serre.group.children, true);
                if (intersects.length > 0) {
                    const hitPoint = intersects[0].point;
                    const localX = hitPoint.x - serre.group.position.x;
                    const localZ = hitPoint.z - serre.group.position.z;
                    const idx = serre.getCellAt(localX, localZ);
                    if (idx !== null) {
                        this.handleSeedDragClick(raycaster, mouse, serre, idx);
                        return;
                    }
                }
            }
            // Click vide = désélectionner
            if (this.selectedSeed) {
                this.disableSeedDragMode();
                this.selectedSerre.selectCell(null);
            }
            return;
        }

        // En mode drag monde, déplacer les objets
        if (this.isDragMode) {
            this.handleDragClick(raycaster, mouse);
            return;
        }

        // Chercher les clics sur les serres
        for (const serre of this.serres) {
            const intersects = raycaster.intersectObjects(serre.group.children, true);

            if (intersects.length > 0) {
                const hitPoint = intersects[0].point;

                // Coordonnées locales
                const localX = hitPoint.x - serre.group.position.x;
                const localZ = hitPoint.z - serre.group.position.z;

                // Calculer la cellule avec la même formule que createCells()
                const startX = -(serre.cols - 1) * serre.cellSize / 2;
                const startZ = -(serre.rows - 1) * serre.cellSize / 2;

                // Utiliser round pour être plus précis sur le centrage
                const col = Math.round((localX - startX) / serre.cellSize);
                const row = Math.round((localZ - startZ) / serre.cellSize);

                if (col >= 0 && col < serre.cols && row >= 0 && row < serre.rows) {
                    const idx = row * serre.cols + col;

                    // Debug
                    console.log(`🖱️ Cell clicked: row=${row}, col=${col}, idx=${idx}, localX=${localX.toFixed(1)}, localZ=${localZ.toFixed(1)}`);

                    this.onCellClick(serre, idx);
                    return;
                } else {
                    console.log(`🖱️ Clicked but outside grid: localX=${localX.toFixed(1)}, localZ=${localZ.toFixed(1)}, startX=${startX.toFixed(1)}, startZ=${startZ.toFixed(1)}`);
                }
            }
        }

        // === CLIC SUR SERRES RÉELLES (3D sur le terrain) ===
        if (this.realGreenhouse && this.realGreenhouse.greenhouses.length > 0) {
            for (const gh of this.realGreenhouse.greenhouses) {
                const intersects = raycaster.intersectObjects(gh.group.children, true);
                if (intersects.length > 0) {
                    this._openRealGreenhousePopup(gh.id);
                    return;
                }
            }
        }
    }

    _openRealGreenhousePopup(greenhouseId) {
        const gh = this.realGreenhouse?.greenhouses.find(g => g.id === greenhouseId);
        if (!gh) return;

        const existing = document.getElementById('greenhouse-enter-popup');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'greenhouse-enter-popup';
        overlay.style.cssText = `
            position:fixed;top:0;left:0;right:0;bottom:0;
            background:rgba(0,0,0,0.7);z-index:300;
            display:flex;align-items:center;justify-content:center;
        `;

        overlay.innerHTML = `
            <div style="
                background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);
                border:2px solid #7ed957;border-radius:16px;
                padding:28px 32px;text-align:center;
                font-family:system-ui,sans-serif;
                box-shadow:0 20px 60px rgba(0,0,0,0.6);max-width:320px;
            ">
                <div style="font-size:48px;margin-bottom:12px;">🏡</div>
                <div style="color:#fff;font-size:16px;font-weight:700;margin-bottom:6px;">
                    Voulez-vous entrer dans la serre ?
                </div>
                <div style="color:#888;font-size:13px;margin-bottom:20px;">${gh.name}</div>
                <div style="display:flex;gap:10px;justify-content:center;">
                    <button id="btn-gh-enter" style="
                        flex:1;background:#27ae60;border:none;color:#fff;
                        padding:10px 16px;border-radius:8px;cursor:pointer;
                        font-size:13px;font-weight:600;
                    ">✅ Entrer</button>
                    <button id="btn-gh-cancel" style="
                        flex:1;background:rgba(255,255,255,0.1);
                        border:1px solid rgba(255,255,255,0.2);color:#fff;
                        padding:10px 16px;border-radius:8px;cursor:pointer;
                        font-size:13px;
                    ">Annuler</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('btn-gh-enter').onclick = () => {
            overlay.remove();
            this._showRealGreenhouseDetail(gh.id);
        };

        document.getElementById('btn-gh-cancel').onclick = () => overlay.remove();
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    }

    _showRealGreenhouseDetail(greenhouseId) {
        const gh = this.realGreenhouse?.greenhouses.find(g => g.id === greenhouseId);
        if (!gh) return;

        const existing = document.getElementById('greenhouse-detail');
        if (existing) existing.remove();

        const panel = document.createElement('div');
        panel.id = 'greenhouse-detail';
        panel.style.cssText = `
            position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
            background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);
            border:2px solid #7ed957;border-radius:16px;
            padding:24px;min-width:360px;z-index:200;
            font-family:system-ui,sans-serif;
            box-shadow:0 20px 60px rgba(0,0,0,0.6);
        `;

        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <div>
                    <h2 style="color:#7ed957;margin:0;font-size:18px;">🏡 ${gh.name}</h2>
                    <div style="color:#888;font-size:12px;margin-top:4px;">
                        Serre réelle · Placer pour l'instant
                    </div>
                </div>
                <button onclick="document.getElementById('greenhouse-detail').remove()" style="
                    background:transparent;border:1px solid #555;color:#888;
                    font-size:16px;width:28px;height:28px;border-radius:6px;
                    cursor:pointer;line-height:1;
                ">×</button>
            </div>
            <div style="background:rgba(126,217,87,0.08);border:1px solid rgba(126,217,87,0.3);
                border-radius:10px;padding:20px;text-align:center;margin-bottom:16px;">
                <div style="font-size:40px;margin-bottom:10px;">🌿</div>
                <div style="color:#fff;font-size:14px;font-weight:600;margin-bottom:4px;">Contenu à venir</div>
                <div style="color:#888;font-size:12px;">
                    Les étagères, les plantations et la gestion des cultures seront disponibles ici.
                </div>
            </div>
            <div style="display:flex;gap:8px;">
                <button onclick="if(window.app.realGreenhouse){window.app.realGreenhouse.removeGreenhouse('${gh.id}');document.getElementById('greenhouse-detail').remove();}" style="
                    flex:1;background:rgba(220,53,69,0.3);border:1px solid rgba(220,53,69,0.5);
                    color:#ff6b6b;padding:9px 0;border-radius:8px;cursor:pointer;
                    font-size:12px;
                ">🗑️ Supprimer</button>
                <button onclick="document.getElementById('greenhouse-detail').remove()" style="
                    flex:1;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);
                    color:#fff;padding:9px 0;border-radius:8px;cursor:pointer;
                    font-size:12px;
                ">Fermer</button>
            </div>
        `;

        document.body.appendChild(panel);

        const escHandler = (e) => {
            if (e.key === 'Escape') { panel.remove(); document.removeEventListener('keydown', escHandler); }
        };
        document.addEventListener('keydown', escHandler);
    }

    handleFineGridDeckClick(row, col) {
        const fineGrid = this.fineGridDeck;

        // Mode ligne
        if (fineGrid.isLineMode) {
            if (!fineGrid.lineStart) {
                fineGrid.handleLineFirstClick(row, col);
                if (window.showNotification) {
                    window.showNotification('📏 Cliquez un second point pour terminer la ligne');
                }
            } else {
                if (this.selectedGardenObjectDef) {
                    const placed = fineGrid.finishLine(this.selectedGardenObjectDef);
                    if (placed && placed.length > 0) {
                        if (window.showNotification) {
                            window.showNotification(`✅ ${placed.length}× ${this.selectedGardenObjectDef.name} posés en ligne !`);
                        }
                    }
                } else {
                    fineGrid.cancelLine();
                    if (window.showNotification) {
                        window.showNotification('⚠️ Sélectionnez d\'abord un légume/objet dans la liste');
                    }
                }
            }
            return;
        }

        // Mode rectangle
        if (fineGrid.isRectMode) {
            if (!fineGrid.rectStart) {
                fineGrid.handleRectFirstClick(row, col);
                if (window.showNotification) {
                    window.showNotification('📐 Cliquez un second point pour terminer le rectangle');
                }
            } else {
                if (this.selectedGardenObjectDef) {
                    const placed = fineGrid.finishRect(this.selectedGardenObjectDef);
                    if (placed && placed.length > 0) {
                        if (window.showNotification) {
                            window.showNotification(`✅ ${placed.length}× ${this.selectedGardenObjectDef.name} posés !`);
                        }
                    }
                } else {
                    fineGrid.cancelRect();
                    if (window.showNotification) {
                        window.showNotification('⚠️ Sélectionnez d\'abord un légume/objet dans la liste');
                    }
                }
            }
            return;
        }

        // Objet existant ?
        const existing = fineGrid.getObjectAt(row, col);
        if (existing) {
            fineGrid.selectCell(row, col);
            fineGrid.selectedPlacedObject = existing;
            fineGrid.showInfoPanel(existing, fineGrid);
        } else if (this.selectedGardenObjectDef) {
            const placed = fineGrid.placeObject(this.selectedGardenObjectDef, row, col);
            if (placed) {
                fineGrid.selectCell(row, col);
                fineGrid.selectedPlacedObject = placed;
                fineGrid.showInfoPanel(placed, fineGrid);
                if (window.showNotification) {
                    window.showNotification(`🥕 ${this.selectedGardenObjectDef.name} placé !`);
                }
            }
        }
    }

    handleGridDeckClick(row, col) {
        // Mode rectangle - création de parcelle
        if (this.gridDeck.isRectMode) {
            if (!this.gridDeck.rectStart) {
                // Premier clic
                this.gridDeck.handleRectFirstClick(row, col);
                if (window.showNotification) window.showNotification('📐 Cliquez un second point pour terminer le rectangle');
            } else {
                // Second clic - créer le rectangle
                if (this.selectedGardenObjectDef) {
                    const placed = this.gridDeck.finishRect(this.selectedGardenObjectDef);
                    if (placed && placed.length > 0) {
                        if (window.showNotification) {
                            window.showNotification(`✅ ${placed.length} ${this.selectedGardenObjectDef.name} posés en rectangle !`);
                        }
                    }
                } else {
                    this.gridDeck.cancelRect();
                    if (window.showNotification) window.showNotification('⚠️ Sélectionnez d\'abord un type d\'objet (haie, grillage...)');
                }
            }
            return;
        }

        const existing = this.gridDeck.getObjectAt(row, col);
        if (existing) {
            // Select existing object
            this.gridDeck.selectCell(row, col);
            this.gridDeck.selectedPlacedObject = existing;
            this.gridDeck.showInfoPanel(existing, this.gridDeck);
        } else if (this.selectedGardenObjectDef) {
            // Place selected object
            const placed = this.gridDeck.placeObject(this.selectedGardenObjectDef, row, col);
            if (placed) {
                this.gridDeck.selectCell(row, col);
                this.gridDeck.selectedPlacedObject = placed;
                this.gridDeck.showInfoPanel(placed, this.gridDeck);
                this._saveGridDeckState();
                if (window.showNotification) window.showNotification(`🌳 ${this.selectedGardenObjectDef.name} placé !`);
            }
        }
    }

    handleDragClick(raycaster, mouse) {
        // Trouver l'objet cliqué (arbres, serres, etc.)
        const worldObjects = this.world ? this.world.objects || [] : [];

        // Liste des objets déplaçables
        const movableObjects = [];

        // Ajouter les serres
        this.serres.forEach(serre => {
            movableObjects.push({ obj: serre.group, type: 'serre', data: serre });
        });

        // Ajouter les objets du monde naturel (arbres décoratifs)
        if (this.world && this.world.objects) {
            this.world.objects.forEach((obj, idx) => {
                if (obj && obj.userData && obj.userData.movable) {
                    movableObjects.push({ obj, type: 'world', data: idx });
                }
            });
        }

        for (const movable of movableObjects) {
            const intersects = raycaster.intersectObject(movable.obj, true);
            if (intersects.length > 0) {
                console.log('🖐️ Objet cliqué:', movable.type);
                this.selectedObject = movable;
                this.startDrag(raycaster, intersects[0].point);
                return;
            }
        }

        console.log('❌ Aucun objet déplaçable cliqué');
    }

    startDrag(raycaster, hitPoint) {
        if (!this.selectedObject) return;

        this.dragOffset.copy(hitPoint).sub(this.selectedObject.obj.position);
        console.log('🔄 Drag démarré depuis:', hitPoint.x.toFixed(1), hitPoint.z.toFixed(1));

        // Ajouter les événements de drag
        const canvas = this.renderer.domElement;
        this.onMouseMoveHandler = (e) => this.handleDragMove(e, raycaster);
        this.onMouseUpHandler = () => this.endDrag();
        canvas.addEventListener('mousemove', this.onMouseMoveHandler);
        canvas.addEventListener('mouseup', this.onMouseUpHandler);
    }

    handleDragMove(e, raycaster) {
        if (!this.selectedObject) return;

        const rect = this.renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1
        );

        raycaster.setFromCamera(mouse, this.camera);

        const intersection = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(this.dragPlane, intersection)) {
            const newX = intersection.x - this.dragOffset.x;
            const newZ = intersection.z - this.dragOffset.z;

            // Limiter la position
            this.selectedObject.obj.position.x = Math.max(-50, Math.min(50, newX));
            this.selectedObject.obj.position.z = Math.max(-50, Math.min(50, newZ));
        }
    }

    endDrag() {
        if (this.selectedObject) {
            console.log('✅ Drag terminé. Position:', this.selectedObject.obj.position.x.toFixed(1), this.selectedObject.obj.position.z.toFixed(1));
        }
        this.selectedObject = null;

        const canvas = this.renderer.domElement;
        canvas.removeEventListener('mousemove', this.onMouseMoveHandler);
        canvas.removeEventListener('mouseup', this.onMouseUpHandler);
    }

    onCellClick(serre, idx) {
        const plant = serre.getPlantAt(idx);
        serre.selectCell(idx);

        // En mode drag de graine, on ne fait que sélectionner/déplacer
        if (this.isSeedDragMode) {
            this.handleSeedDragClick(null, null, serre, idx);
            return;
        }

        if (plant) {
            const progress = plant.getGrowthProgress();
            const stage = plant.growthStage;
            const stageName = GROWTH_STAGES[stage]?.name || 'unknown';

            console.log(`🌱 ${plant.name} - Stade ${stage} (${stageName}) - ${Math.round(progress * 100)}%`);

            if (progress >= 1) {
                this.harvestPlant(serre, idx, plant);
            }
        } else {
            console.log(`🪴 Alvéole vide - Ouverture boutique...`);
            this.openShop(serre.id, idx);
        }
    }

    harvestPlant(serre, idx, plant) {
        const reward = 10 + Math.floor(Math.random() * 5);
        this.gameState.coins += reward;
        this.gameState.score += 10;
        this.gameState.streak += 1;

        console.log(`🎉 Récolte! +${reward} 🪙 (Total: ${this.gameState.coins})`);

        if (window.showNotification) {
            window.showNotification(`🎉 ${plant.name} récoltée! +${reward} 🪙`);
        }

        serre.removePlant(idx);
    }

    openShop(serreId = null, cellIdx = null) {
        // Ouvre directement le modal inline
        this.openShopModal(serreId, cellIdx);
    }

    openShopModal(serreId = null, cellIdx = null) {
        // Ouvre la boutique avec un design plus intégré
        const shopHTML = `
            <div id="shop-modal" style="
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.85); display: flex;
                align-items: center; justify-content: center; z-index: 1000;
            ">
                <div style="
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    border: 2px solid #7ed957; border-radius: 16px;
                    padding: 24px; width: 90%; max-width: 450px;
                    max-height: 85vh; overflow-y: auto;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="color: #7ed957; font-size: 20px; margin: 0;">🛒 Boutique - Graines</h2>
                        <button onclick="document.getElementById('shop-modal').remove()" style="
                            background: none; border: none; color: #fff; font-size: 24px;
                            cursor: pointer;
                        ">×</button>
                    </div>

                    <div style="
                        background: rgba(255,255,255,0.1); border-radius: 8px;
                        padding: 12px 16px; margin-bottom: 20px; display: flex;
                        justify-content: space-between; align-items: center;
                    ">
                        <span style="color: #aaa;">Tes pièces:</span>
                        <span id="shop-coins" style="color: #ffd700; font-weight: bold; font-size: 20px;">
                            ${this.gameState.coins} 🪙
                        </span>
                    </div>

                    <div style="display: grid; gap: 10px;">
                        ${SEEDS_CATALOG.map(seed => `
                            <div onclick="window.buySeed('${seed.id}')" style="
                                background: rgba(255,255,255,0.05); border: 2px solid rgba(255,255,255,0.1);
                                border-radius: 10px; padding: 12px; display: flex;
                                align-items: center; gap: 12px; cursor: pointer;
                                transition: all 0.2s;
                            " onmouseover="this.style.borderColor='#7ed957';this.style.background='rgba(126,217,87,0.1)'"
                               onmouseout="this.style.borderColor='rgba(255,255,255,0.1)';this.style.background='rgba(255,255,255,0.05)'">
                                <div style="
                                    width: 40px; height: 40px; border-radius: 8px;
                                    background: ${'#' + seed.color.toString(16).padStart(6, '0')}30;
                                    display: flex; align-items: center; justify-content: center;
                                    font-size: 22px;
                                ">${seed.icon}</div>
                                <div style="flex: 1;">
                                    <div style="color: #fff; font-weight: 600; font-size: 14px;">${seed.name}</div>
                                    <div style="color: #888; font-size: 11px;">${seed.description}</div>
                                </div>
                                <div style="
                                    background: rgba(126,217,87,0.2); border: 1px solid #7ed957;
                                    border-radius: 6px; padding: 6px 10px;
                                    color: #7ed957; font-size: 12px; font-weight: bold;
                                ">🪙 ${seed.price}</div>
                            </div>
                        `).join('')}
                    </div>

                    <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
                        <p style="color: #888; font-size: 11px; text-align: center;">
                            Clique sur une alvéole vide dans une serre après avoir acheté.
                        </p>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal
        const existing = document.getElementById('shop-modal');
        if (existing) existing.remove();

        document.body.insertAdjacentHTML('beforeend', shopHTML);

        // Setup buy handlers
        window.buySeed = (seedId) => {
            const seed = SEEDS_CATALOG.find(s => s.id === seedId);
            if (!seed) return;

            if (this.gameState.coins < seed.price) {
                window.showNotification('❌ Pas assez de pièces!');
                return;
            }

            this.gameState.coins -= seed.price;

            // Si on a une cible, planter directement
            if (serreId && cellIdx !== null) {
                const serre = this.serres.find(s => s.id === serreId);
                if (serre && !serre.getPlantAt(cellIdx)) {
                    serre.addPlant({
                        plantId: seed.id,
                        name: seed.name,
                        icon: seed.icon,
                        color: seed.color,
                        plantedDate: Date.now(),
                        daysToMaturity: seed.daysToMaturity
                    }, cellIdx);
                    window.showNotification(`🌱 ${seed.name} plantée!`);
                    document.getElementById('shop-modal').remove();
                }
            } else {
                window.showNotification(`🛒 ${seed.name} acheté! Clique sur une alvéole vide.`);
                // Stocker la graine achetée en attendant
                this.pendingSeed = seed;
            }

            // Update display
            const coinsEl = document.getElementById('shop-coins');
            if (coinsEl) coinsEl.textContent = `${this.gameState.coins} 🪙`;
        };
    }

    handleResize() {
        // Le redimensionnement est géré par ResizeObserver dans LudusTerraeTab
        // Ce listener window est un fallback mais utilise les bonnes dimensions du renderer
        window.addEventListener('resize', () => {
            if (!this.camera || !this.renderer) return;
            // Le renderer utilise déjà les dimensions du container via l'init
            // On ne fait rien ici pour éviter les conflits avec ResizeObserver
        });
    }

    startAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.clock.start();
        const myToken = this._initToken;

        const animate = () => {
            if (!this.isAnimating || this._initToken !== myToken) return;
            requestAnimationFrame(animate);

            const delta = this.clock.getDelta();

            this.serres.forEach(serre => {
                serre.update(delta);
            });

            if (gameState.state.animations.enabled) {
                gameState.evolveTimeStep();
                gameState.evolvePlantStep();
            }

            // Évolution automatique des plantes
            if (this.evolutionEnabled) {
                this.checkAutoEvolution();
            }

            // Mettre à jour les systèmes d'arbres
            if (this.animationEnabled) {
                if (this.treeAnimation) {
                    this.treeAnimation.update(delta);
                }
                if (this.treeParticles) {
                    const trees = this.world?.systems?.trees?.getTrees() || [];
                    this.treeParticles.update(delta, trees);
                }
                if (this.treeGameplay) {
                    this.treeGameplay.update(delta);
                }
            }

            if (this.renderer && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        };

        animate();
    }

    // ============================
    // ÉVOLUTION AUTOMATIQUE IA
    // ============================

    checkAutoEvolution() {
        const now = Date.now();
        if (now - this.lastAutoEvolution >= this.autoEvolutionInterval) {
            this.performAutoEvolution();
            this.lastAutoEvolution = now;
        }
    }

    performAutoEvolution() {
        console.log('⏰ ═══════════════════════════════');
        console.log('   🧬 ÉVOLUTION AUTOMATIQUE IA');
        console.log('   ═══════════════════════════════');

        this.serres.forEach(serre => {
            this.evolutionManager.evolveSerre(serre);
        });

        console.log('⏰ Évolution terminée!');

        if (window.showNotification) {
            window.showNotification('🧬 Plantes évoluéés automatiquement!');
        }
    }

    setEvolutionInterval(minutes) {
        this.autoEvolutionInterval = minutes * 60 * 1000;
        console.log(`⏰ Intervalle d'évolution: ${minutes} minutes`);
    }

    toggleAutoEvolution() {
        this.evolutionEnabled = !this.evolutionEnabled;
        console.log(`⏰ Évolution auto: ${this.evolutionEnabled ? 'ON' : 'OFF'}`);
        if (window.showNotification) {
            window.showNotification(`⏰ Évolution auto: ${this.evolutionEnabled ? 'ON' : 'OFF'}`);
        }
        return this.evolutionEnabled;
    }

    // ============================
    // CHAT IA JARDINAGE
    // ============================

    setupChatAI() {
        // Vérifier la connexion Ollama au démarrage
        this.chatAI.checkConnection().then(connected => {
            if (connected) {
                console.log('🤖 Chat IA connecté à Ollama');
            } else {
                console.log('🤖 Chat IA en mode demo (Ollama non disponible)');
            }
        });
    }

    initTreeSystems() {
        if (!this.world || !this.world.systems.trees) {
            console.warn('⚠️ Système d\'arbres non disponible');
            return;
        }

        const trees = this.world.systems.trees.getTrees();

        // Animation de vent
        this.treeAnimation = new TreeAnimationSystem(this.scene, trees);
        console.log('🌬️ Système d\'animation des arbres initialisé');

        // Particules (feuilles, pollen)
        this.treeParticles = new TreeParticleSystem(this.scene);
        console.log('🍂 Système de particules initialisé');

        // Gameplay (fruits, coupe, oiseaux, animaux)
        this.treeGameplay = new TreeGameplaySystem(this.scene, trees);
        console.log('🎮 Système de gameplay des arbres initialisé');
    }

    openChat() {
        this.isChatOpen = true;
        this.renderChatUI();
    }

    closeChat() {
        this.isChatOpen = false;
        const chatModal = document.getElementById('chat-ai-modal');
        if (chatModal) chatModal.remove();
    }

    renderChatUI() {
        const existing = document.getElementById('chat-ai-modal');
        if (existing) existing.remove();

        const chatHTML = `
            <div id="chat-ai-modal" style="
                position: fixed; bottom: 20px; right: 20px;
                width: 380px; height: 500px;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid #7ed957; border-radius: 16px;
                display: flex; flex-direction: column; z-index: 1001;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            ">
                <div style="
                    padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.1);
                    display: flex; justify-content: space-between; align-items: center;
                ">
                    <div>
                        <h3 style="color: #7ed957; margin: 0; font-size: 16px;">🤖 Assistant Jardinage</h3>
                        <p style="color: #888; margin: 4px 0 0; font-size: 11px;">
                            ${this.chatAI.isConnected ? '🟢 Connecté Ollama' : '🟡 Mode Demo'}
                        </p>
                    </div>
                    <button onclick="window.app.closeChat()" style="
                        background: none; border: none; color: #fff; font-size: 20px; cursor: pointer;
                    ">×</button>
                </div>

                <div id="chat-messages" style="
                    flex: 1; overflow-y: auto; padding: 16px;
                    display: flex; flex-direction: column; gap: 12px;
                ">
                    <div style="
                        background: rgba(126,217,87,0.1); border-radius: 12px;
                        padding: 12px; color: #ccc; font-size: 13px;
                    ">
                        🌿 Bonjour! Je suis votre assistant jardinage GreenHub.
                        Comment puis-je vous aider aujourd'hui?
                    </div>
                </div>

                <div style="padding: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div style="display: flex; gap: 8px;">
                        <input id="chat-input" type="text" placeholder="Posez votre question..." style="
                            flex: 1; background: rgba(255,255,255,0.1); border: none;
                            padding: 10px 14px; border-radius: 8px; color: #fff;
                            font-size: 13px;
                        " onkeypress="if(event.key==='Enter')window.app.sendChatMessage()"/>
                        <button onclick="window.app.sendChatMessage()" style="
                            background: #7ed957; border: none; color: #1a1a2e;
                            padding: 10px 16px; border-radius: 8px;
                            font-weight: bold; cursor: pointer;
                        ">➤</button>
                    </div>
                    <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
                        <button onclick="window.app.sendQuickQuestion('Conseils irrigation')" style="
                            background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
                            color: #aaa; padding: 4px 10px; border-radius: 12px; font-size: 11px; cursor: pointer;
                        ">💧 Irrigation</button>
                        <button onclick="window.app.sendQuickQuestion('Problèmes tomates')" style="
                            background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
                            color: #aaa; padding: 4px 10px; border-radius: 12px; font-size: 11px; cursor: pointer;
                        ">🍅 Tomates</button>
                        <button onclick="window.app.sendQuickQuestion('Maladies plantes')" style="
                            background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
                            color: #aaa; padding: 4px 10px; border-radius: 12px; font-size: 11px; cursor: pointer;
                        ">🐛 Parasites</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatHTML);

        // Charger l'historique
        const history = this.chatAI.getHistory();
        if (history.length > 0) {
            const messagesDiv = document.getElementById('chat-messages');
            history.forEach(msg => {
                this.appendChatMessage(msg.content, msg.role === 'user' ? 'user' : 'assistant', false);
            });
        }
    }

    appendChatMessage(content, role = 'assistant', scroll = true) {
        const messagesDiv = document.getElementById('chat-messages');
        if (!messagesDiv) return;

        const msgDiv = document.createElement('div');
        if (role === 'user') {
            msgDiv.style.cssText = `
                background: rgba(126,217,87,0.2); border-radius: 12px 12px 4px 12px;
                padding: 10px 14px; color: #fff; font-size: 13px; align-self: flex-end;
                max-width: 85%;
            `;
        } else {
            msgDiv.style.cssText = `
                background: rgba(255,255,255,0.05); border-radius: 12px 12px 12px 4px;
                padding: 10px 14px; color: #ccc; font-size: 13px; align-self: flex-start;
                max-width: 85%;
            `;
        }
        msgDiv.textContent = content;
        messagesDiv.appendChild(msgDiv);

        if (scroll) {
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    }

    async sendChatMessage() {
        const input = document.getElementById('chat-input');
        if (!input) return;

        const message = input.value.trim();
        if (!message) return;

        input.value = '';
        this.appendChatMessage(message, 'user');

        // Indicateur de chargement
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'chat-loading';
        loadingDiv.style.cssText = `
            background: rgba(255,255,255,0.05); border-radius: 12px 12px 12px 4px;
            padding: 10px 14px; color: #888; font-size: 13px; align-self: flex-start;
        `;
        loadingDiv.textContent = '🤖 En train de réfléchir...';
        document.getElementById('chat-messages').appendChild(loadingDiv);

        const response = await this.chatAI.ask(message, (chunk, done) => {
            if (done) {
                loadingDiv.remove();
            }
        });

        if (loadingDiv.parentNode) loadingDiv.remove();
        this.appendChatMessage(response, 'assistant');
    }

    async sendQuickQuestion(question) {
        const input = document.getElementById('chat-input');
        if (input) input.value = question;
        await this.sendChatMessage();
    }

    // ============================
    // SERRES RÉELLES
    // ============================

    startGreenhousePlacement() {
        if (!this.realGreenhouse) {
            console.error('❌ Système de serre réelle non initialisé');
            return;
        }

        this.isGreenhousePlacementMode = true;
        this.realGreenhouse.startPlacement();

        if (window.showNotification) {
            window.showNotification('🏠 Cliquez sur le terrain pour placer la serre');
        }
        console.log('🏠 Mode placement serre - clic sur le terrain');
    }

    handleGreenhousePlacement(raycaster, mouse) {
        if (!this.isGreenhousePlacementMode || !this.realGreenhouse) return;

        // Créer un plan pour le raycasting au sol
        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersection = new THREE.Vector3();

        if (raycaster.ray.intersectPlane(groundPlane, intersection)) {
            this.realGreenhouse.updatePreviewPosition(intersection);
        }
    }

    confirmGreenhousePlacement() {
        if (!this.isGreenhousePlacementMode) return;

        const greenhouse = this.realGreenhouse.finishPlacement();
        this.isGreenhousePlacementMode = false;

        if (greenhouse && window.showNotification) {
            window.showNotification(`🏠 ${greenhouse.name} placée sur le terrain!`);
        }
    }

    cancelGreenhousePlacement() {
        if (!this.isGreenhousePlacementMode) return;

        this.realGreenhouse.cancelPlacement();
        this.isGreenhousePlacementMode = false;
        console.log('❌ Placement serre annulé');
    }

    removeGreenhouse(greenhouseId) {
        if (this.realGreenhouse) {
            this.realGreenhouse.removeGreenhouse(greenhouseId);
        }
    }

    stopAnimation() {
        this.isAnimating = false;
    }

    setSeason(season) {
        if (this.world) this.world.updateSeason(season);
    }

    setWeather(weather) {
        if (this.world) this.world.updateWeather(weather);
    }

    toggleShadows() {
        const shadows = gameState.getShadows();
        const newEnabled = !shadows.enabled;
        gameState.setShadows(newEnabled);
        this.renderer.shadowMap.enabled = newEnabled;
    }

    getGameState() {
        // Si __greenhubGameState existe (synchro avec React), l'utiliser
        const reactState = window.__greenhubGameState;
        if (reactState) {
            return {
                score: reactState.score ?? this.gameState.score,
                coins: reactState.coins ?? this.gameState.coins,
                streak: reactState.streak ?? this.gameState.streak,
            };
        }
        return { ...this.gameState };
    }

    /**
     * Ajoute des pièces (positif ou négatif) — sync avec React
     */
    addCoins(amount) {
        this.gameState.coins += amount;
        // Sync vers React
        if (window.__greenhubAddCoins) {
            window.__greenhubAddCoins(amount);
        }
    }

    openGreenhouseUI(uid) {
        if (this._onOpenSerreBois) {
            this._onOpenSerreBois(uid);
        }
    }

    _onOpenSerreBois = null;

    setOnOpenSerreBois(cb) {
        this._onOpenSerreBois = cb;
    }

    clearAllGrid() {
        if (this.gridDeck) {
            this.gridDeck.clearAll();
        }
        if (this.fineGridDeck) {
            this.fineGridDeck.clearAll();
        }
        if (window.showNotification) {
            window.showNotification('🗑️ Tous les objets du jardin ont été supprimés');
        }
    }

    _saveGridDeckState() {
        if (!this.gridDeck) return;
        try {
            localStorage.setItem('greenhub_grid_state', this.gridDeck.getState());
        } catch (e) { console.warn('GridDeck save failed', e); }
    }

    _loadGridDeckState() {
        if (!this.gridDeck) return;
        try {
            const saved = localStorage.getItem('greenhub_grid_state');
            if (saved) this.gridDeck.loadState(saved);
        } catch (e) { console.warn('GridDeck load failed', e); }
    }

    // ── Transfer from 2D Garden Planner ─────────────────────────────────────
    transferGardenPlan(planData) {
        try {
            this._transferGardenPlanImpl(planData);
        } catch (err) {
            console.error('[GardenPlanner] Transfer failed:', err);
            if (window.showNotification) {
                window.showNotification(`❌ Erreur transfert: ${err.message}`);
            }
        }
    }

    _transferGardenPlanImpl(planData) {
        const { fineGridDeck, gridDeck } = this;
        if (!fineGridDeck) {
            console.warn('[GardenPlanner] fineGridDeck not ready');
            return;
        }

        const { perimeterFence, objects } = planData;

        // Step 1: Place all plants first (before any clear)
        // This avoids destroying existing scene objects while the scene is actively rendering
        if (objects && objects.length > 0) {
            const vegCatalog = VEGETABLES_CATALOG;
            objects.forEach(obj => {
                const def = vegCatalog.find(v => v.id === obj.id);
                if (def) {
                    fineGridDeck.placeObject(def, obj.row, obj.col);
                }
            });
        }

        // Step 2: Switch to fine grid mode BEFORE clear to avoid rendering issues
        this.isFineGridDeckMode = true;
        this.isGridDeckMode = false;
        if (gridDeck) gridDeck.setVisible(false);
        fineGridDeck.setVisible(true);

        // Step 3: Clear old objects (now scene is already showing fineGridDeck)
        try {
            const toRemove = fineGridDeck.placedObjects.slice();
            fineGridDeck.placedObjects = [];
            fineGridDeck._cellMap = new Map();
            toRemove.forEach(obj => {
                try {
                    fineGridDeck.scene.remove(obj.group);
                    obj.group.traverse(child => {
                        if (child.geometry) child.geometry.dispose();
                    });
                } catch (e) {}
            });
            localStorage.removeItem('greenhub_fine_grid_state');
            localStorage.removeItem('greenhub_fine_grid_photos');
            fineGridDeck.objectPhotos = {};
        } catch (err) {
            console.warn('[GardenPlanner] clear error:', err);
        }

        // Step 4: Perimeter fence with custom height
        if (perimeterFence) {
            fineGridDeck.setFenceHeight(perimeterFence.height ?? 1.5);
            fineGridDeck.delimitTerrain(perimeterFence.type ?? 'grillage');
            fineGridDeck.setFenceHeight(null);
        }

        // Step 5: Save final state once
        try {
            const data = {
                placedObjects: fineGridDeck.placedObjects.map(o => ({
                    uid: o.uid, objectDef: o.objectDef, row: o.row, col: o.col, span: o.span,
                })),
            };
            localStorage.setItem('greenhub_fine_grid_state', JSON.stringify(data));
        } catch (e) {}

        if (window.showNotification) {
            window.showNotification(
                `🗺️ Plan transféré: ${objects?.length || 0} plantes${perimeterFence ? ' + grillage' : ''}`
            );
        }
    }

    dispose() {
        this._initToken++;
        this.stopAnimation();
        if (this.gridDeck) { this.gridDeck.destroy(); this.gridDeck = null; }
        if (this.world) { this.world.destroy(); this.world = null; }
        this.serres.forEach(s => s.destroy());
        this.serres = [];
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement.parent) {
                this.renderer.domElement.parent.removeChild(this.renderer.domElement);
            }
            this.renderer = null;
        }
        if (this.scene) {
            this.scene.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            this.scene = null;
        }
        this.camera = null;
    }
}

export const app = new RealisticApp();

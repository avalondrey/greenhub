// =============================================
// Ludus Terrae V2 - Shop System
// Boutique pour acheter des graines et objets
// =============================================

export const SEEDS_CATALOG = [
    {
        id: 'tomato',
        name: 'Tomate',
        icon: '🍅',
        color: 0xff0000,
        price: 10,
        daysToMaturity: 30,
        description: 'Tomate classique'
    },
    {
        id: 'carrot',
        name: 'Carotte',
        icon: '🥕',
        color: 0xff8c00,
        price: 5,
        daysToMaturity: 25,
        description: 'Racine orange'
    },
    {
        id: 'salad',
        name: 'Salade',
        icon: '🥬',
        color: 0x90EE90,
        price: 3,
        daysToMaturity: 20,
        description: 'Feuille verte'
    },
    {
        id: 'pepper',
        name: 'Poivron',
        icon: '🫑',
        color: 0x228B22,
        price: 15,
        daysToMaturity: 35,
        description: 'Légume vert'
    },
    {
        id: 'strawberry',
        name: 'Fraise',
        icon: '🍓',
        color: 0xff4444,
        price: 20,
        daysToMaturity: 40,
        description: 'Fruit rouge'
    },
    {
        id: 'corn',
        name: 'Maïs',
        icon: '🌽',
        color: 0xffdd00,
        price: 8,
        daysToMaturity: 28,
        description: 'Épis jaunes'
    }
];

export class ShopSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.selectedSeed = null;
        this.onPurchaseCallback = null;
    }

    setOnPurchase(callback) {
        this.onPurchaseCallback = callback;
    }

    getSeedsCatalog() {
        return SEEDS_CATALOG;
    }

    canAfford(seedId) {
        const seed = SEEDS_CATALOG.find(s => s.id === seedId);
        if (!seed) return false;
        return this.gameState.coins >= seed.price;
    }

    purchaseSeed(seedId, serreId, cellIdx) {
        const seed = SEEDS_CATALOG.find(s => s.id === seedId);
        if (!seed) return { success: false, error: 'Graine non trouvée' };
        if (this.gameState.coins < seed.price) return { success: false, error: 'Pas assez de pièces' };

        // Déduire le prix
        this.gameState.coins -= seed.price;

        // Ajouter à l'inventaire
        if (!this.gameState.inventory[seedId]) {
            this.gameState.inventory[seedId] = 0;
        }
        this.gameState.inventory[seedId]++;

        // Callback pour planter
        if (this.onPurchaseCallback) {
            this.onPurchaseCallback(seedId, serreId, cellIdx);
        }

        return {
            success: true,
            seed: seed,
            remainingCoins: this.gameState.coins
        };
    }

    addCoins(amount) {
        this.gameState.coins += amount;
        return this.gameState.coins;
    }
}

export class ShopUI {
    constructor(shop, container) {
        this.shop = shop;
        this.container = container;
        this.isOpen = false;
        this.selectedSerre = null;
        this.selectedCell = null;
    }

    open(serreId = null, cellIdx = null) {
        this.selectedSerre = serreId;
        this.selectedCell = cellIdx;
        this.isOpen = true;
        this.render();
    }

    close() {
        this.isOpen = false;
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div id="shop-overlay" style="
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.8); display: flex;
                align-items: center; justify-content: center; z-index: 1000;
            ">
                <div style="
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    border: 2px solid #7ed957; border-radius: 16px;
                    padding: 24px; width: 90%; max-width: 500px;
                    max-height: 80vh; overflow-y: auto;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="color: #7ed957; font-size: 22px; margin: 0;">🌱 Boutique - Graines</h2>
                        <button onclick="window.closeShop()" style="
                            background: none; border: none; color: #fff; font-size: 24px;
                            cursor: pointer; padding: 4px 8px;
                        ">×</button>
                    </div>

                    <div style="
                        background: rgba(255,255,255,0.1); border-radius: 8px;
                        padding: 12px 16px; margin-bottom: 20px; display: flex;
                        justify-content: space-between;
                    ">
                        <span style="color: #aaa;">Pièces:</span>
                        <span id="shop-coins" style="color: #ffd700; font-weight: bold; font-size: 18px;">
                            ${this.shop.gameState.coins}
                        </span>
                    </div>

                    <div id="shop-seeds" style="display: grid; gap: 12px;">
                        ${this.renderSeeds()}
                    </div>

                    <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
                        <p style="color: #888; font-size: 12px; text-align: center;">
                            Sélectionne une graine, puis clique sur une alvéole vide dans la serre pour planter.
                        </p>
                    </div>
                </div>
            </div>
        `;

        // Bind seed buttons
        this.bindSeedButtons();
    }

    renderSeeds() {
        return this.shop.getSeedsCatalog().map(seed => {
            const canAfford = this.shop.canAfford(seed.id);
            const owned = this.shop.gameState.inventory[seed.id] || 0;

            return `
                <div data-seed="${seed.id}" style="
                    background: rgba(255,255,255,0.05); border: 2px solid rgba(255,255,255,0.1);
                    border-radius: 10px; padding: 14px; display: flex;
                    align-items: center; gap: 14px; cursor: pointer;
                    transition: all 0.2s; opacity: ${canAfford ? 1 : 0.5};
                " onclick="window.selectSeed('${seed.id}')">
                    <div style="
                        width: 44px; height: 44px; border-radius: 8px;
                        background: ${'#' + seed.color.toString(16).padStart(6, '0')}30;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 24px;
                    ">
                        ${seed.icon}
                    </div>
                    <div style="flex: 1;">
                        <div style="color: #fff; font-weight: 600; font-size: 14px;">${seed.name}</div>
                        <div style="color: #888; font-size: 11px;">${seed.description} · ${seed.daysToMaturity}j</div>
                        <div style="color: #aaa; font-size: 10px; margin-top: 2px;">Stock: ${owned}</div>
                    </div>
                    <div style="
                        background: ${canAfford ? 'rgba(126,217,87,0.2)' : 'rgba(255,255,255,0.1)'};
                        border: 1px solid ${canAfford ? '#7ed957' : '#555'};
                        border-radius: 6px; padding: 6px 10px;
                        color: ${canAfford ? '#7ed957' : '#888'};
                        font-size: 12px; font-weight: bold;
                    ">
                        🪙 ${seed.price}
                    </div>
                </div>
            `;
        }).join('');
    }

    bindSeedButtons() {
        window.selectSeed = (seedId) => {
            if (!this.shop.canAfford(seedId)) return;

            const seed = this.shop.getSeedsCatalog().find(s => s.id === seedId);
            if (!seed) return;

            // Highlight selected
            document.querySelectorAll('[data-seed]').forEach(el => {
                el.style.borderColor = el.dataset.seed === seedId ? '#7ed957' : 'rgba(255,255,255,0.1)';
                el.style.background = el.dataset.seed === seedId ? 'rgba(126,217,87,0.15)' : 'rgba(255,255,255,0.05)';
            });

            this.shop.selectedSeed = seedId;

            // If we have a target serre+cell, purchase directly
            if (this.selectedSerre !== null && this.selectedCell !== null) {
                this.purchaseAndClose(seedId);
            }
        };

        window.closeShop = () => {
            this.close();
        };
    }

    purchaseAndClose(seedId) {
        const result = this.shop.purchaseSeed(seedId, this.selectedSerre, this.selectedCell);
        if (result.success) {
            this.close();
        } else {
            alert(result.error);
        }
    }

    updateCoins() {
        const coinsEl = document.getElementById('shop-coins');
        if (coinsEl) {
            coinsEl.textContent = this.shop.gameState.coins;
        }
    }
}

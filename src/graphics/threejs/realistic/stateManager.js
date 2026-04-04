// ==========================================
// Ludus Terrae V2 - Realistic State Manager
// Gestion complète de l'état du simulateur
// ==========================================

export class GameState {
    constructor() {
        this.state = {
            // --- Saison/Environnement ---
            season: 'spring', // spring, summer, autumn, winter
            weather: 'clear', // clear, rainy, cloudy, snowy

            // --- Temps d'évolution ---
            gameTime: {
                day: 0,
                hour: 6, // 0-24
                minute: 0
            },
            timeScale: 1, // Multiplicateur de vitesse du temps

            // --- État des plantes ---
            plantGrowth: {
                enabled: true,
                speed: 1,
                maturity: 0.5, // 0-1
                age: 0
            },

            // --- Ombres et Lumières ---
            shadows: {
                enabled: false,
                mapSize: 4096,
                bias: 0.0001,
                radius: 0.5
            },

            // --- Animations ---
            animations: {
                enabled: true,
                wind: {
                    enabled: true,
                    speed: 1,
                    strength: 0.5
                },
                leafAnimation: {
                    enabled: true,
                    speed: 0.5
                },
                waterAnimation: {
                    enabled: true,
                    speed: 1
                }
            },

            // --- Défichage ---
            detail: {
                enabled: true,
                ground: 'high',
                plants: 'high',
                objects: 'high'
            },

            // --- Sons ---
            sound: {
                enabled: true,
                nature: true,
                birds: true
            }
        };
    }

    // ============ MUTATEURS ============

    setSeason(season) {
        if (['spring', 'summer', 'autumn', 'winter'].includes(season)) {
            this.state.season = season;
            return true;
        }
        return false;
    }

    setWeather(weather) {
        if (['clear', 'rainy', 'cloudy', 'snowy'].includes(weather)) {
            this.state.weather = weather;
            return true;
        }
        return false;
    }

    setTime(hour, minute) {
        this.state.gameTime.hour = Math.max(0, Math.min(24, hour));
        this.state.gameTime.minute = Math.max(0, Math.min(59, minute));
        return this.state.gameTime;
    }

    incrementTime(minutes) {
        let newMinutes = (this.state.gameTime.minute + minutes * this.state.timeScale) % 60;
        let extraHours = Math.floor((minutes * this.state.timeScale) / 60);
        
        this.state.gameTime.hour = (this.state.gameTime.hour + extraHours + Math.floor(newMinutes / 60)) % 24;
        this.state.gameTime.minute = Math.floor(newMinutes % 60);
        this.state.gameTime.day = (this.state.gameTime.day + extraHours + Math.floor(newMinutes / 60)) % 365;
        
        return this.state.gameTime;
    }

    setTimeScale(scale) {
        this.state.timeScale = Math.max(0.1, Math.min(100, scale));
    }

    setPlantGrowth(enabled, speed) {
        this.state.plantGrowth.enabled = enabled !== undefined ? enabled : !this.state.plantGrowth.enabled;
        if (speed) {
            this.state.plantGrowth.speed = speed;
        }
        return this.state.plantGrowth;
    }

    setShadows(enabled, mapSize) {
        this.state.shadows.enabled = enabled !== undefined ? enabled : !this.state.shadows.enabled;
        if (mapSize) {
            this.state.shadows.mapSize = Math.max(512, Math.min(16384, mapSize));
        }
        return this.state.shadows;
    }

    setAnimation(type, enabled, speed) {
        if (type === 'wind') {
            if (enabled !== undefined) this.state.animations.wind.enabled = enabled;
            if (speed) this.state.animations.wind.speed = speed;
        } else if (type === 'leaf') {
            if (enabled !== undefined) this.state.animations.leafAnimation.enabled = enabled;
            if (speed) this.state.animations.leafAnimation.speed = speed;
        } else if (type === 'water') {
            if (enabled !== undefined) this.state.animations.waterAnimation.enabled = enabled;
            if (speed) this.state.animations.waterAnimation.speed = speed;
        }
        return this.state.animations[type];
    }

    setDetail(level) {
        if (['low', 'medium', 'high', 'ultra'].includes(level)) {
            this.state.detail.enabled = true;
            this.state.detail.ground = level;
            this.state.detail.plants = level;
            this.state.detail.objects = level;
        }
    }

    toggleSounds(enabled) {
        this.state.sound.enabled = enabled;
        return this.state.sound;
    }

    // ============ GETTEURS ============

    getSeason() { return this.state.season; }
    getWeather() { return this.state.weather; }
    getGameTime() { return { ...this.state.gameTime }; }
    getTimeScale() { return this.state.timeScale; }
    getPlantGrowth() { return { ...this.state.plantGrowth }; }
    getShadows() { return { ...this.state.shadows }; }
    getAnimations() { return { ...this.state.animations }; }
    getDetailLevel() { return this.state.detail.ground; }
    getSoundEnabled() { return this.state.sound.enabled; }

    // ============ ÉVOLUTIONS ============

    evolveTimeStep() {
        if (!this.state.animations.enabled) return;

        // Évolution saisonnière basique (simplifiée)
        if (!this.state.timeScale) return;

        this.incrementTime(0.1);
    }

    evolvePlantStep() {
        if (!this.state.plantGrowth.enabled) return;

        this.state.plantGrowth.age += (0.001 * this.state.plantGrowth.speed);
        this.state.plantGrowth.maturity = Math.min(1, this.state.plantGrowth.maturity + (0.0001 * this.state.plantGrowth.speed));
    }

    toObject() {
        return JSON.parse(JSON.stringify(this.state));
    }

    fromObject(obj) {
        this.state = { ...this.state, ...obj };
    }
}

// Instance singleton
export const gameState = new GameState();
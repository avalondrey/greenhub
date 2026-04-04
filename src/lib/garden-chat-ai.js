// ==========================================
// GreenHub V2 - Chat IA Jardinage
// Connexion locale Ollama pour conseils jardinage
// ==========================================

export class GardenChatAI {
    constructor() {
        this.ollamaUrl = 'http://localhost:11434';
        this.model = 'llama3.2'; // Modèle par défaut
        this.isConnected = false;
        this.chatHistory = [];
        this.maxHistory = 50;

        // Prompts système pour spécialisation jardinage
        this.systemPrompt = `Tu es un assistant expert en jardinage et agriculture. Tu conseilles sur:
- Culture de légumes, fruits, herbes aromatiques
- Entretien des plantes et jardins
- Problèmes de plagas et maladies
- Compostage et fertilisation
- Saisons de plantation et récolte
- Arrosage et irrigation
- Culture en serre

Sois concis, pratique et encourageant. Réponds en français.`;

        this.contextPrompt = `Contexte GreenHub:
- Serres virtuelles avec tomates, carrots, salades, maïs, fraisiers, poivrons
- Plantes grandissent en 20-40 jours selon l'espèce
- Système de quêtes et récompenses
- Progression par streaks journaliers

Conseils: recommends des plantes adaptées à la saison actuelle quand pertinent.`;
    }

    // Teste la connexion à Ollama
    async checkConnection() {
        try {
            const response = await fetch(`${this.ollamaUrl}/api/tags`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                this.isConnected = true;
                this.availableModels = data.models || [];
                console.log('🤖 Ollama connecté:', this.availableModels.map(m => m.name));
                return true;
            }
        } catch (err) {
            console.warn('⚠️ Ollama non disponible:', err.message);
            this.isConnected = false;
        }
        return false;
    }

    // Sélectionne le modèle à utiliser
    setModel(modelName) {
        this.model = modelName;
        console.log(`🤖 Modèle IA: ${modelName}`);
    }

    // Envoie une question et reçoit une réponse
    async ask(question, onChunk = null) {
        // Si Ollama n'est pas connecté, utiliser le mode demo
        if (!this.isConnected) {
            await this.checkConnection();
            if (!this.isConnected) {
                return this.getDemoResponse(question);
            }
        }

        try {
            // Ajouter au contexte
            const fullPrompt = `${this.systemPrompt}\n\n${this.contextPrompt}\n\nQuestion: ${question}\n\nRéponse:`;

            const response = await fetch(`${this.ollamaUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    prompt: fullPrompt,
                    stream: true,
                    context: this.chatHistory.length > 0 ? this.getContextArray() : undefined
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            // Streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.response) {
                            fullResponse += data.response;
                            if (onChunk) onChunk(data.response, false);
                        }
                        if (data.context) {
                            this.lastContext = data.context;
                        }
                    } catch (e) {}
                }
            }

            if (onChunk) onChunk('', true);

            // Sauvegarder dans l'historique
            this.addToHistory(question, fullResponse);

            return fullResponse;

        } catch (err) {
            console.error('❌ Erreur chat IA:', err);
            return this.getDemoResponse(question);
        }
    }

    // Réponse demo quand Ollama n'est pas disponible
    getDemoResponse(question) {
        const q = question.toLowerCase();

        const responses = [
            {
                keywords: ['tomate', 'tomates'],
                answer: '🍅 Les tomates adorent la chaleur! Plantez-les en serre après les dernières gelées (mai). Arrosez régulièrement sans mouiller les feuilles. Tuteurez quand elles grandissent!'
            },
            {
                keywords: ['carotte', 'carottes'],
                answer: '🥕 Les carottes préfèrent un sol sableux et profond. Semez de mars à août, éclaircissez à 5cm. Récoltez quand les feuilles mesurent 15-20cm.'
            },
            {
                keywords: ['arroser', 'arrosage', 'eau'],
                answer: '💧 Conseil d\'arrosage: arrosez le matin tôt ou le soir. Évitez de mouiller le feuillage. Un paillage aide à conserver l\'humidité!'
            },
            {
                keywords: ['serre', ' greenhouse'],
                answer: '🏠 En serre, surveillez la température et l\'aération. Par temps chaud, ouvrez les fenêtres. La serre prolonge la saison de 2-3 semaines!'
            },
            {
                keywords: ['maladie', 'parasite', 'puceron'],
                answer: '🐛 Pour les pucerons: vaporisez avec de l\'eau savonneuse ou introduisez des coccinelles (prédateurs naturels). Inspectez régulièrement le dessous des feuilles.'
            },
            {
                keywords: ['compost', 'engrais', 'fertil'],
                answer: '🌱 Le compost est excellent pour vos plantes! Mélangez matières vertes (épluchures) et brunes (feuilles mortes). Retournez tous les 15 jours.'
            },
            {
                keywords: ['hiver', ' hivinale', 'printemps', 'été', 'automne'],
                answer: '🌸 Printemps = plantation! Été = récolte! Automne = préparation du sol! Hiver = planification et taille.'
            },
            {
                keywords: ['salade', 'laitue'],
                answer: '🥬 Les salades poussent vite (20-30 jours). Semez en lignes, éclaircissez à 20cm. Récoltez le matin pour des feuilles plus croquantes!'
            },
            {
                keywords: ['fraise', 'fraisier'],
                answer: '🍓 Les fraisiers produisent mieux la 2ème et 3ème année. Plantez en mars-avril, paillez pour garder les fruits propres. Supprimez les stolons!'
            }
        ];

        for (const r of responses) {
            if (r.keywords.some(k => q.includes(k))) {
                this.addToHistory(question, r.answer);
                return r.answer;
            }
        }

        const defaultResponse = '🌿 Je suis votre assistant jardinage! Demandez-moi conseil sur vos plantes, l\'arrosage, les maladies ou les meilleures périodes de plantation.';
        this.addToHistory(question, defaultResponse);
        return defaultResponse;
    }

    addToHistory(question, response) {
        this.chatHistory.push({
            role: 'user',
            content: question,
            timestamp: Date.now()
        });
        this.chatHistory.push({
            role: 'assistant',
            content: response,
            timestamp: Date.now()
        });

        // Limiter la taille de l'historique
        if (this.chatHistory.length > this.maxHistory) {
            this.chatHistory = this.chatHistory.slice(-this.maxHistory);
        }
    }

    getContextArray() {
        // Utiliser le contexte de la dernière réponse pour continuer la conversation
        return this.lastContext || [];
    }

    getHistory() {
        return [...this.chatHistory];
    }

    clearHistory() {
        this.chatHistory = [];
        console.log('🗑️ Historique du chat effacé');
    }
}

// Singleton
export const gardenChat = new GardenChatAI();

import { createContext, useContext, useCallback, useMemo } from 'react';
import { useToast } from './ToastContext.jsx';
import { usePlantMove } from '../hooks/usePlantMove.js';
import { getMoonPhase } from '../utils/moon.js';
import { getGardenMetrics } from '../data/gardenConfig.js';
import { PLANTS_DB, PLANTS_SIMPLE } from '../db/plants.js';
import { skillTree } from '../data/gameConstants.js';
import { uid } from '../utils/uid.js';

const GameContext = createContext(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameContext.Provider');
  return ctx;
}

export function GameProvider({
  children,
  // ── State ──────────────────────────────────────────────────────────────
  serres, setSerres,
  chambres, setChambres,
  coins, setCoins,
  gardenGrid, setGardenGrid,
  permanentPlants, setPermanentPlants,
  gardenArea,
  dailyQuests, setDailyQuests,
  collectedCards, setCollectedCards,
  unlockedSkills, setUnlockedSkills,
  gardenStreak, setGardenStreak,
  currentEvent, setCurrentEvent,
  proObjectives, setProObjectives,
  score, setScore,
  level, setLevel,
  streak, setStreak,
  badges, setBadges,
  harvestEstimate,
  analyzeWeather,
  // ── UI state (setters only) ─────────────────────────────────────────────
  setTab,
  setShowGame, setShowEncyclopedia, setShowCalendar, setShowAdmin,
  setShowQuests, setShowCollection, setShowSkillTree,
  setSelectedSerreBois, setShowShopChambres,
}) {
  const { showToast } = useToast();
  const { moveSerreSeed, moveMiniSerreSeed, moveChambreSeed, moveGardenPlant } = usePlantMove({
    setSerres, setChambres, setGardenGrid, showToast,
  });

  // ── Handlers ─────────────────────────────────────────────────────────────

  const completeQuest = useCallback((questId) => {
    setDailyQuests(prev => {
      const updated = prev.map(q =>
        q.id === questId ? { ...q, completed: true, progress: q.target } : q
      );
      const quest = prev.find(q => q.id === questId);
      if (quest && !quest.completed) {
        setScore(s => {
          const newScore = s + quest.reward;
          const newLevel = Math.floor(newScore / 500) + 1;
          if (newLevel > level) {
            setLevel(newLevel);
            showToast(`🎉 Niveau ${newLevel} atteint !`);
          }
          return newScore;
        });
        showToast(`✅ Quête complétée ! +${quest.reward} pts`);
      }
      return updated;
    });
  }, [level, setScore, setLevel, setDailyQuests, showToast]);

  const unlockCard = useCallback((plantId) => {
    if (!collectedCards.includes(plantId)) {
      setCollectedCards(prev => {
        const updated = [...prev, plantId];
        localStorage.setItem('greenhub-cards', JSON.stringify(updated));
        const plant = PLANTS_DB.find(p => p.id === plantId);
        showToast(`🎴 Carte débloquée : ${plant?.name || plantId} !`);
        setScore(s => s + 50);
        return updated;
      });
    }
  }, [collectedCards, setCollectedCards, setScore, showToast]);

  const unlockSkill = useCallback((skillId) => {
    const skill = skillTree.find(s => s.id === skillId);
    if (!skill || unlockedSkills.includes(skillId)) return;
    if (score >= skill.cost) {
      setScore(s => s - skill.cost);
      setUnlockedSkills(prev => {
        const updated = [...prev, skillId];
        localStorage.setItem('greenhub-skills', JSON.stringify(updated));
        showToast(`✨ Compétence débloquée : ${skill.name} !`);
        return updated;
      });
    } else {
      showToast(`❌ Il vous manque ${skill.cost - score} points`);
    }
  }, [score, unlockedSkills, setScore, setUnlockedSkills, showToast]);

  const updateActivity = useCallback(() => {
    setGardenStreak(prev => {
      const updated = { ...prev, lastActive: new Date().toISOString() };
      localStorage.setItem('greenhub-streak', JSON.stringify(updated));
      return updated;
    });
  }, [setGardenStreak]);

  const addSerre = useCallback((name) => {
    const SERRE_COLS = 4, SERRE_ROWS = 6;
    setSerres(s => [...s, {
      id: uid(),
      name,
      alveoles: Array(SERRE_COLS * SERRE_ROWS).fill(null),
      alveoleData: {},
    }]);
    showToast(`🏠 "${name}" ajoutée !`);
  }, [setSerres, showToast]);

  const buyChambre = useCallback(() => {
    if (coins < 3) { showToast('❌ Il vous faut 3€'); return; }
    setCoins(c => c - 3);
    const newChambre = {
      id: uid(),
      name: `Chambre ${chambres.length + 1}`,
      miniSerres: Array(6).fill(null).map((_, i) => ({
        id: uid(), name: `Mini-serre ${i + 1}`,
        alveoles: Array(24).fill(null), alveoleData: {},
      })),
    };
    setChambres(prev => [...prev, newChambre]);
    showToast('🏠 Chambre de culture achetée !');
  }, [coins, chambres.length, setCoins, setChambres, showToast]);

  const buyMiniSerre = useCallback((chambreId) => {
    if (coins < 1) { showToast('❌ Il vous faut 1€'); return; }
    setCoins(c => c - 1);
    setChambres(prev => prev.map(ch => {
      if (ch.id !== chambreId) return ch;
      return {
        ...ch,
        miniSerres: [...ch.miniSerres, {
          id: uid(),
          name: `Mini-serre ${ch.miniSerres.length + 1}`,
          alveoles: Array(24).fill(null), alveoleData: {},
        }],
      };
    }));
    showToast('🪟 Mini-serre ajoutée !');
  }, [coins, setCoins, setChambres, showToast]);

  const addPhoto = useCallback((plantUid, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const photos = JSON.parse(localStorage.getItem('greenhub-photos') || '{}');
      photos[plantUid] = photos[plantUid] || [];
      photos[plantUid].push({ date: new Date().toISOString(), url: e.target.result });
      localStorage.setItem('greenhub-photos', JSON.stringify(photos));
      showToast('📸 Photo ajoutée !');
    };
    reader.readAsDataURL(file);
  }, [showToast]);

  const startQuiz = useCallback(() => {
    const allPlants = PLANTS_DB;
    const shuffled = [...allPlants].sort(() => Math.random() - 0.5);
    const quizPlant = shuffled[0];
    const companions = (quizPlant.companions || []).slice(0, 3);
    const others = allPlants.filter(p => p.id !== quizPlant.id && !(quizPlant.companions || []).includes(p.id)).slice(0, 2);
    const options = [...companions.map(id => ({ id, isCompanion: true })), ...others.map(id => ({ id, isCompanion: false }))];
    const quizOptions = [...options].sort(() => Math.random() - 0.5);
    return { quizPlant, quizOptions };
  }, []);

  const handleQuiz = useCallback((plantId, isCompanion, onResult) => {
    if (isCompanion) {
      setScore(s => s + 15);
      setBadges(b => b + 1);
      showToast('✅ Bonne réponse ! +15 XP');
      onResult(true);
    } else {
      setScore(s => Math.max(0, s - 5));
      showToast('❌ Mauvaise réponse ! -5 XP');
      onResult(false);
    }
  }, [setScore, setBadges, showToast]);

  const handleSow = useCallback((plant, qty, serreId, customPlantedDate = null) => {
    const plantedDate = customPlantedDate || new Date().toISOString();
    setSerres(prev => prev.map(s => {
      if (s.id !== serreId) return s;
      const alveoles = [...s.alveoles];
      const alveoleData = { ...(s.alveoleData || {}) };
      let placed = 0;
      for (let i = 0; i < alveoles.length && placed < qty; i++) {
        if (!alveoles[i]) {
          alveoles[i] = { plantId: plant.id, status: 0, plantedDate };
          alveoleData[i] = {
            plantId: plant.id,
            plantedDate,
            daysToMaturity: plant.workflow_days?.[plant.workflow_days.length - 1] || 60,
          };
          placed++;
        }
      }
      return { ...s, alveoles, alveoleData };
    }));

    unlockCard(plant.id);

    setDailyQuests(prev => prev.map(q => {
      if (q.completed) return q;
      if (q.type === 'plant') return { ...q, progress: q.progress + 1 };
      if (q.type === 'moon') {
        const moon = getMoonPhase();
        if (moon.sow) return { ...q, progress: q.progress + 1 };
      }
      if (q.type === 'variety') {
        const uniqueVarieties = new Set();
        serres.forEach(s => s.alveoles.forEach(a => { if (a?.plantId) uniqueVarieties.add(a.plantId); }));
        uniqueVarieties.add(plant.id);
        return { ...q, progress: uniqueVarieties.size };
      }
      return q;
    }));

    updateActivity();
    setProObjectives(prev => prev.map(obj =>
      obj.id === 'obj2' && obj.current < obj.target
        ? { ...obj, current: Math.min(obj.current + qty, obj.target) }
        : obj
    ));

    setScore(s => { const n = s + qty * 10; setLevel(Math.floor(n / 100) + 1); return n; });
    showToast(`🌱 ${qty} × ${plant.name} semés !`);
    setTab('serres');
  }, [serres, unlockCard, setSerres, setDailyQuests, setProObjectives, setScore, setLevel, setTab, showToast, updateActivity]);

  const handleTransplant = useCallback((serreId, alvIdx) => {
    const metrics = getGardenMetrics(gardenArea);
    let plant = null;
    setSerres(prev => prev.map(s => {
      if (s.id !== serreId) return s;
      const alveoles = [...s.alveoles];
      const alveoleData = { ...(s.alveoleData || {}) };
      plant = PLANTS_SIMPLE.find(p => p.id === alveoles[alvIdx]?.plantId);
      alveoles[alvIdx] = null;
      delete alveoleData[alvIdx];
      return { ...s, alveoles, alveoleData };
    }));
    if (!plant) return;
    const size = plant.grid_size || 1;
    setGardenGrid(prev => {
      const ng = prev.map(r => [...r]);
      const rows = ng.length, cols = ng[0]?.length || 0;
      for (let row = 0; row < rows - size; row++) {
        for (let col = 0; col < cols - size; col++) {
          let free = true;
          for (let r = row; r < row + size && free; r++)
            for (let c = col; c < col + size && free; c++)
              if (ng[r]?.[c]) free = false;
          if (free) {
            for (let r = row; r < row + size; r++)
              for (let c = col; c < col + size; c++)
                ng[r][c] = { plantId: plant.id, origin: r === row && c === col };
            showToast(`🌍 ${plant.emoji} ${plant.name} repiqué !`);
            setScore(s => { const n = s + 20; setLevel(Math.floor(n / 100) + 1); return n; });
            return ng;
          }
        }
      }
      showToast('❌ Plus de place dans le jardin !');
      return ng;
    });
    setTab('jardin');
  }, [gardenArea, setSerres, setGardenGrid, setScore, setLevel, setTab, showToast]);

  const handleRemoveSerreSeed = useCallback((serreId, alvIdx) => {
    setSerres(prev => prev.map(s => {
      if (s.id !== serreId) return s;
      const alveoles = [...s.alveoles];
      const alveoleData = { ...(s.alveoleData || {}) };
      alveoles[alvIdx] = null;
      delete alveoleData[alvIdx];
      return { ...s, alveoles, alveoleData };
    }));
    showToast('🗑️ Graine supprimée');
  }, [setSerres, showToast]);

  const handleMove = useCallback((fromRow, fromCol, toRow, toCol) => {
    moveGardenPlant(fromRow, fromCol, toRow, toCol, PLANTS_SIMPLE);
  }, [moveGardenPlant]);

  const value = useMemo(() => ({
    // State (readonly)
    serres, chambres, coins, gardenGrid, permanentPlants,
    dailyQuests, collectedCards, unlockedSkills, gardenStreak,
    currentEvent, proObjectives, score, level, streak, badges,
    harvestEstimate,
    // Setters
    setSerres, setChambres, setCoins, setGardenGrid, setPermanentPlants,
    setDailyQuests, setCollectedCards, setUnlockedSkills, setGardenStreak,
    setCurrentEvent, setProObjectives, setScore, setLevel, setStreak, setBadges,
    // UI setters
    setTab,
    setShowGame, setShowEncyclopedia, setShowCalendar, setShowAdmin,
    setShowQuests, setShowCollection, setShowSkillTree,
    setSelectedSerreBois, setShowShopChambres,
    // Handlers
    handleSow, handleTransplant, handleRemoveSerreSeed,
    handleMove,
    completeQuest, unlockCard, unlockSkill, updateActivity,
    addSerre, buyChambre, buyMiniSerre, addPhoto,
    startQuiz, handleQuiz,
    // Move helpers
    moveSerreSeed, moveMiniSerreSeed, moveChambreSeed,
    // Constants
    PLANTS_DB, PLANTS_SIMPLE,
  }), [
    serres, chambres, coins, gardenGrid, permanentPlants,
    dailyQuests, collectedCards, unlockedSkills, gardenStreak,
    currentEvent, proObjectives, score, level, streak, badges, harvestEstimate,
    handleSow, handleTransplant, handleRemoveSerreSeed,
    handleMove,
    completeQuest, unlockCard, unlockSkill, updateActivity,
    addSerre, buyChambre, buyMiniSerre, addPhoto,
    startQuiz, handleQuiz,
    moveSerreSeed, moveMiniSerreSeed, moveChambreSeed,
    setSerres, setChambres, setCoins, setGardenGrid, setPermanentPlants,
    setDailyQuests, setCollectedCards, setUnlockedSkills, setGardenStreak,
    setCurrentEvent, setProObjectives, setScore, setLevel, setStreak, setBadges,
    setTab,
    setShowGame, setShowEncyclopedia, setShowCalendar, setShowAdmin,
    setShowQuests, setShowCollection, setShowSkillTree,
    setSelectedSerreBois, setShowShopChambres,
  ]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

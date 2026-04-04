import { useEffect } from 'react';

/**
 * Centralise toute la persistence localStorage.
 * Appelé depuis App.jsx après initialisation des states.
 */
export function useGameState({ serres, chambres, coins, dailyQuests, proObjectives, collectedCards }) {
  // State principal
  useEffect(() => {
    localStorage.setItem('greenhub-state', JSON.stringify({ serres }));
  }, [serres]);

  // Chambres
  useEffect(() => {
    localStorage.setItem('greenhub-chambres', JSON.stringify(chambres));
  }, [chambres]);

  // Coins
  useEffect(() => {
    localStorage.setItem('greenhub-coins', coins.toString());
  }, [coins]);

  // Quêtes
  useEffect(() => {
    localStorage.setItem('greenhub-quests', JSON.stringify({
      quests: dailyQuests,
      lastUpdate: new Date().toISOString(),
    }));
  }, [dailyQuests]);

  // Objectifs Pro
  useEffect(() => {
    localStorage.setItem('greenhub-pro', JSON.stringify(proObjectives));
  }, [proObjectives]);

  // Cartes (les skills et streak sont sauvegardés inline dans leurs handlers respectifs)
  useEffect(() => {
    localStorage.setItem('greenhub-cards', JSON.stringify(collectedCards));
  }, [collectedCards]);
}

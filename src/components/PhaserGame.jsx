import React, { useEffect, useRef, useCallback } from 'react';
import Phaser from 'phaser';
import { GreenhouseScene } from '../game/GreenhouseScene';

const GROWTH_STAGES = [
  { name: 'graine', scale: 0.4, opacity: 0.6 },
  { name: 'germination', scale: 0.6, opacity: 0.8 },
  { name: 'levée', scale: 0.8, opacity: 0.9 },
  { name: 'petite', scale: 1.0, opacity: 1.0 },
  { name: 'moyenne', scale: 1.2, opacity: 1.0 },
  { name: 'prête', scale: 1.4, opacity: 1.0 },
];

const TOMATO_VARIETY_MAP = {
  'tomate-coeur-de-boeuf': 0,
  'tomate-cerise': 1,
  'tomate-roma': 2,
  'tomate-ananas': 3,
  'tomate-noire-de-crimee': 0,
};

const PhaserGame = ({ serre, onCellClick }) => {
  const gameRef = useRef(null);
  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  const getStageInfo = useCallback((alveoleData, daysToMaturity) => {
    if (!alveoleData?.plantedDate) return { stageIdx: 0 };
    const elapsed = (Date.now() - new Date(alveoleData.plantedDate).getTime()) / (1000 * 60 * 60 * 24);
    const progress = Math.min(elapsed / (daysToMaturity || 60), 1);
    const stageIdx = Math.min(Math.floor(progress * (GROWTH_STAGES.length - 1)), GROWTH_STAGES.length - 1);
    return { stageIdx };
  }, []);

  useEffect(() => {
    if (gameRef.current) return;

    const config = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 560,
      height: 480,
      backgroundColor: '#87ceeb',
      scene: GreenhouseScene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
      },
      render: {
        pixelArt: true,
        antialias: false,
        roundPixels: true,
      },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.events.on('ready', () => {
      sceneRef.current = game.scene.getScene('GreenhouseScene');
      if (sceneRef.current) {
        sceneRef.current.setOnCellClick(onCellClick);
      }
    });

    // Fallback if ready already fired
    setTimeout(() => {
      if (!sceneRef.current) {
        sceneRef.current = game.scene.getScene('GreenhouseScene');
        if (sceneRef.current) {
          sceneRef.current.setOnCellClick(onCellClick);
        }
      }
    }, 500);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        sceneRef.current = null;
      }
    };
  }, []);

  // Update callback when it changes
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setOnCellClick(onCellClick);
    }
  }, [onCellClick]);

  // Update tiles when serre data changes
  useEffect(() => {
    if (!sceneRef.current || !serre) return;

    const scene = sceneRef.current;

    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        const idx = r * 4 + c;
        const alv = serre.alveoles?.[idx];
        const ad = serre.alveoleData?.[idx];

        if (alv && ad) {
          const varietyIdx = TOMATO_VARIETY_MAP[alv.plantId];
          if (varietyIdx !== undefined) {
            const { stageIdx } = getStageInfo(ad, 60);
            scene.updateCell(c, r, varietyIdx, stageIdx);
          } else {
            scene.clearCell(c, r);
          }
        } else {
          scene.clearCell(c, r);
        }
      }
    }
  }, [serre, getStageInfo]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        maxWidth: 560,
        margin: '0 auto',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    />
  );
};

export default PhaserGame;
